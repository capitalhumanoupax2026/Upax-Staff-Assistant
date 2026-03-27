import { Router, type IRouter } from "express";
import { db, chatMessagesTable, employeesTable } from "@workspace/db";
import { eq, asc, sql } from "drizzle-orm";
import { getUncachableGoogleSheetClient } from "../lib/google-sheets.js";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// RESPUESTAS DESDE GOOGLE SHEETS — DB_RESPUESTAS
// Lee la hoja y selecciona la respuesta más específica según UDN/TIPO/CONSULTORA
// Cache de 3 minutos para que los cambios en el Sheet se reflejen rápido
// ---------------------------------------------------------------------------

interface SheetResponse {
  idKey: string;
  categoria: string;
  preguntaTexto: string;
  udn: string;
  tipo: string;
  consultora: string;
  respuesta: string;
}

let sheetResponseCache: { data: SheetResponse[]; loadedAt: number } | null = null;
const SHEET_RESPONSE_CACHE_MS = 3 * 60 * 1000; // 3 minutos

async function loadSheetResponses(): Promise<SheetResponse[]> {
  if (sheetResponseCache && Date.now() - sheetResponseCache.loadedAt < SHEET_RESPONSE_CACHE_MS) {
    return sheetResponseCache.data;
  }

  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) return [];

  try {
    const sheets = await getUncachableGoogleSheetClient();
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "DB_RESPUESTAS!A2:G2000",
    });

    const rows = result.data.values || [];
    const data: SheetResponse[] = rows
      // requiere ID_KEY y RESPUESTA, y que no sea una fila de encabezado duplicada
      .filter((row) => row[0] && row[6] && String(row[0]).trim().toUpperCase() !== "ID_KEY")
      .map((row) => ({
        idKey:         String(row[0] || "").trim().toUpperCase(),
        categoria:     String(row[1] || "").trim().toUpperCase(),
        preguntaTexto: String(row[2] || "").trim(),
        udn:           String(row[3] || "").trim().toUpperCase(),
        tipo:          String(row[4] || "").trim().toUpperCase(),
        consultora:    String(row[5] || "").trim().toUpperCase(),
        respuesta:     String(row[6] || "").trim(),
      }));

    sheetResponseCache = { data, loadedAt: Date.now() };
    console.log(`[Sheet] Cargadas ${data.length} respuestas desde DB_RESPUESTAS`);
    return data;
  } catch (err) {
    console.error("[Sheet] Error cargando DB_RESPUESTAS:", err);
    return sheetResponseCache?.data || [];
  }
}

interface EmployeeContext {
  hrbpName?: string;
  name?: string;
  businessUnit?: string;
  isInternal?: boolean;
  consultora?: string;
}

function findSheetResponse(
  responses: SheetResponse[],
  categoria: string,
  message: string,
  employee: EmployeeContext
): string | null {
  const cat = categoria.toUpperCase();
  const empUdn = (employee.businessUnit || "").trim().toUpperCase();
  const empTipo = employee.isInternal ? "INTERNO" : "EXTERNO";
  const empCons = (employee.consultora || "").trim().toUpperCase();
  const msgLower = message.toLowerCase();

  // Filtrar por categoría
  const catMatches = responses.filter((r) => r.categoria === cat);
  if (!catMatches.length) return null;

  // Puntuar cada fila según qué tan específica es para el empleado
  const scored: Array<{ respuesta: string; score: number }> = [];

  for (const r of catMatches) {
    let score = 0;

    // — UDN matching —
    if (r.udn === empUdn) {
      score += 100;
    } else if (r.udn === "GENERAL" || r.udn === "") {
      score += 10;
    } else {
      continue; // no aplica a esta UDN
    }

    // — TIPO matching —
    if (r.tipo === empTipo) {
      score += 20;
    } else if (r.tipo === "GENERAL" || r.tipo === "") {
      score += 5;
    } else {
      continue; // no aplica a este tipo
    }

    // — CONSULTORA matching (solo si es EXTERNO) —
    if (empTipo === "EXTERNO" && empCons) {
      if (r.consultora === empCons) {
        score += 30; // coincidencia exacta de consultora
      } else if (r.consultora === "" || r.consultora === "GENERAL") {
        score += 5; // genérico para externos
      } else {
        continue; // es de otra consultora
      }
    }

    // — Relevancia del texto de la pregunta (bonus) —
    const pregLower = r.preguntaTexto.toLowerCase();
    const pregWords = pregLower.split(/[\s?¿,]+/).filter((w) => w.length > 3);
    const matchCount = pregWords.filter((w) => msgLower.includes(w)).length;
    score += matchCount * 3;

    // Penalizar fuertemente respuestas muy cortas (placeholders incompletos)
    const respLen = r.respuesta.trim().length;
    if (respLen < 50) {
      score -= 200; // los completan sólo si no hay ninguna otra opción
    }

    scored.push({ respuesta: r.respuesta, score });
  }

  if (!scored.length) return null;

  // Retornar la respuesta con mayor puntaje
  scored.sort((a, b) => b.score - a.score);
  // Solo usar si el score final es positivo (al menos una respuesta de calidad)
  const best = scored[0];
  if (best.score < 0) return null; // todas eran placeholders → fallback al código
  return best.respuesta;
}

// ---------------------------------------------------------------------------
// BASE DE CONOCIMIENTO HR — UPAX
// Respuestas específicas por pregunta + fallback por categoría
// ---------------------------------------------------------------------------

const VACACIONES = {
  cuantos_dias: `**¿Cuántos días de vacaciones tienes?**

Conforme a la **Reforma a la Ley Federal del Trabajo (2023)**, tus días de vacaciones por antigüedad son:

| Años trabajados | Días de vacaciones |
|---|---|
| 1 año | **12 días** |
| 2 años | **14 días** |
| 3 años | **16 días** |
| 4 años | **18 días** |
| 5 – 9 años | **20 días** |
| 10 – 14 años | **22 días** |
| 15 – 19 años | **24 días** |
| 20 – 24 años | **26 días** |
| 25 años o más | **28 días** |

Además, tienes derecho a una **prima vacacional mínima del 25%** de tu salario diario por cada día de vacaciones disfrutado.

📌 Para conocer tu saldo exacto de días disponibles, consulta con tu HRBP o en el portal interno de UPAX.`,

  aniversario: `**¿Cuándo se cumple tu aniversario laboral?**

Tu aniversario laboral se calcula a partir de tu **fecha de ingreso oficial** a la empresa, que aparece en tu contrato de trabajo.

Cada año en esa fecha:
- Se **acreditan nuevos días** de vacaciones conforme a tu antigüedad
- Se emite tu constancia de aniversario (si aplica en tu UDN)
- Tu tabla de vacaciones puede actualizarse si cambias de tramo de antigüedad

📌 Si no recuerdas tu fecha de ingreso exacta, consúltala en tu contrato, recibo de nómina o directamente con tu HRBP.`,

  renovacion: `**¿Cuándo se renuevan tus vacaciones?**

Las vacaciones se renuevan cada año en tu **fecha de aniversario laboral** (la misma que tu fecha de ingreso a la empresa).

A partir de ese día puedes disfrutar los días que te corresponden por ley según tu nueva antigüedad.

⚠️ **Importante**: Según la LFT, los días de vacaciones deben disfrutarse **dentro de los 6 meses** siguientes a su vencimiento. Si no los usas en ese período, tu HRBP puede orientarte sobre opciones.

📌 Para ver tu saldo y fechas exactas, contacta a tu HRBP directamente.`,

  como_solicitar: `**¿Cómo solicito mis vacaciones?**

El proceso para solicitar vacaciones en UPAX es:

1. **Planea con anticipación** — avisa a tu jefe directo con al menos **5 días hábiles** de anticipación
2. **Ingresa al portal de UPAX** y selecciona la sección **"Solicitud de Vacaciones"**
3. **Elige las fechas** que deseas tomar y confirma la solicitud
4. **Tu jefe directo** debe aprobar la solicitud
5. **Tu HRBP** dará el visto bueno final en un plazo máximo de **3 días hábiles**
6. Recibirás confirmación por correo electrónico

📌 Si tienes dudas con el portal o tu solicitud fue rechazada, contacta directamente a tu HRBP: **{{HRBP_NOMBRE}}**`,

  no_uso: `**¿Qué pasa si no uso tus días de vacaciones?**

Según la **Ley Federal del Trabajo**:

- Los días de vacaciones **no se pierden automáticamente**, pero deben tomarse
- Tienes **6 meses** a partir de tu aniversario para disfrutarlos
- El patrón **no puede sustituir las vacaciones por dinero** (salvo al terminar la relación laboral)
- Si la empresa no te permite tomar vacaciones, tienes derecho a recibir la **prima vacacional** aunque no hayas descansado

⚠️ **Recomendación**: Programa tus vacaciones con tiempo. Los días no usados no generan pago adicional excepto al momento de una liquidación.

📌 Si tu jefe no te ha aprobado vacaciones, escala la situación con tu HRBP.`,

  fraccionar: `**¿Puedo fraccionar mis vacaciones?**

**Sí**, puedes tomar tus vacaciones en partes, con la siguiente condición según la LFT:

- Al menos **una de las fracciones** debe ser de un mínimo de **6 días hábiles continuos**
- El resto puede dividirse en períodos más pequeños de común acuerdo con tu jefe directo

**Ejemplo** (12 días disponibles):
- Primera fracción: 6 días hábiles seguidos ✅
- Segunda fracción: 4 días ✅
- Tercera fracción: 2 días ✅

📌 Cada fracción debe solicitarse a través del portal de UPAX con la aprobación de tu jefe directo y tu HRBP.`,

  general: `**Vacaciones — Información General**

Conforme a la **Reforma LFT 2023**, tus días de vacaciones según antigüedad son:

| Antigüedad | Días |
|---|---|
| 1 año | 12 días |
| 2 años | 14 días |
| 3 años | 16 días |
| 4 años | 18 días |
| 5-9 años | 20 días |
| 10+ años | +2 días por cada 5 años adicionales |

**Prima vacacional**: mínimo 25% de tu salario diario por cada día vacacional.

**Para solicitar vacaciones:**
1. Avisa a tu jefe con anticipación
2. Ingresa al portal de UPAX → "Solicitud de Vacaciones"
3. Selecciona fechas y envía la solicitud
4. Aprobación en máximo 3 días hábiles

¿Tienes alguna duda específica? Puedes preguntarme sobre días disponibles, aniversarios, fraccionar tus días o qué pasa si no los usas.`,
};

const NOMINA = {
  cuando_depositan: `**¿Cuándo te depositan la nómina?**

En UPAX la nómina se procesa de forma **quincenal**:

| Período | Fechas de corte | Fecha de pago |
|---|---|---|
| **1ra quincena** | Del 1 al 15 de cada mes | **Día 16** |
| **2da quincena** | Del 16 al último día del mes | **Día 1** del siguiente mes |

⚠️ Si el día de pago cae en **sábado, domingo o día festivo**, el depósito se realiza el **día hábil inmediato anterior**.

📌 El depósito llega directamente a la cuenta bancaria registrada en tu expediente. Si tienes dudas sobre tu cuenta registrada, contacta a tu HRBP.`,

  descuentos: `**¿Por qué hay descuentos en tu nómina?**

Los descuentos más comunes en la nómina son:

**Descuentos obligatorios por ley:**
- 🏛️ **IMSS** — cuotas obrero-patronales (enfermedad, maternidad, vejez, retiro)
- 💰 **ISR (Impuesto Sobre la Renta)** — impuesto proporcional a tu salario
- 🏠 **INFONAVIT** — si tienes crédito activo

**Descuentos por prestaciones:**
- Fondo de ahorro (tu aportación)
- Seguro de gastos médicos mayores (prima)
- Créditos internos (si aplica)

**Descuentos por ausentismo:**
- Faltas no justificadas
- Permisos sin goce de sueldo

📌 Si encuentras un descuento que no reconoces, contacta a tu HRBP con tu recibo de nómina a mano para que lo revise.`,

  descargar_recibo: `**¿Cómo descargo tu recibo de nómina?**

Para obtener tu recibo de nómina (CFDI):

1. Ingresa al **portal interno de UPAX**
2. Ve a la sección **"Mi Nómina"** o **"Recibos de Pago"**
3. Selecciona el período que necesitas
4. Descarga el archivo en formato **PDF** o **XML** (para trámites fiscales)

El CFDI (Comprobante Fiscal Digital) es el recibo oficial con validez ante el SAT.

📌 Si necesitas recibos de períodos anteriores o tienes problemas para acceder al portal, contacta a tu HRBP o al área de Administración de UPAX.`,

  calculo_quincena: `**¿Cómo se calcula tu quincena?**

Tu pago quincenal se calcula así:

**Salario base quincenal** = (Salario mensual bruto ÷ 2)

**Percepciones (lo que suma):**
- ✅ Salario base
- ✅ Parte proporcional de aguinaldo (en diciembre)
- ✅ Prima vacacional (cuando tomas vacaciones)
- ✅ Bonos o comisiones (si aplica en tu puesto)

**Deducciones (lo que resta):**
- ❌ ISR (proporción quincenal)
- ❌ Cuotas IMSS
- ❌ INFONAVIT (si tienes crédito)
- ❌ Fondo de ahorro (tu aportación)
- ❌ Prima de seguro médico

**Salario neto** = Percepciones totales − Deducciones totales

📌 Si quieres entender un concepto específico de tu recibo, comparte el detalle con tu HRBP para que te lo explique.`,

  error_nomina: `**¿Qué hago si hay un error en tu nómina?**

Si detectas un error en tu recibo de nómina, sigue estos pasos:

1. **Identifica el error** — revisa con detalle tu recibo (CFDI) y anota qué concepto está incorrecto
2. **Contacta a tu HRBP inmediatamente** — no esperes a la siguiente quincena
3. **Proporciona evidencia** — comparte capturas o el PDF de tu recibo con el error marcado
4. **El HRBP levanta el caso** con el área de Nómina
5. **Tiempo de corrección**: máximo **3 días hábiles** tras validar el error
6. El ajuste se aplica en la **siguiente quincena** o mediante un pago complementario

⚠️ Es importante reportar errores **dentro de los primeros 3 días hábiles** después del depósito para facilitar la corrección.`,

  isr: `**¿Qué es el ISR y cómo se calcula?**

El **ISR (Impuesto Sobre la Renta)** es el impuesto federal que el gobierno cobra sobre tus ingresos. Como empleado, tu empresa lo retiene directamente de tu nómina.

**¿Cómo se calcula?**
- El SAT establece **tablas progresivas** — a mayor ingreso, mayor porcentaje
- Se calcula sobre tu **ingreso gravable** (salario base + percepciones gravadas)
- Se descuenta el **subsidio al empleo** si tu salario es bajo

**Rangos aproximados para 2024:**
| Ingreso mensual | Tasa aproximada de ISR |
|---|---|
| Hasta $8,952 | 1.92% – 6.40% |
| $8,952 – $21,370 | 10.88% – 16% |
| $21,370 – $41,778 | 17.92% – 21.36% |
| Más de $41,778 | 23.52% – 35% |

📌 Al final del año puedes hacer tu **declaración anual** (abril para personas físicas asalariadas) y potencialmente recibir una devolución si tienes deducciones personales.`,

  general: `**Nómina — Información General**

**Fechas de pago:**
- 1ra quincena (1–15 del mes) → pago el día **16**
- 2da quincena (16–fin del mes) → pago el día **1** del siguiente mes

**Para descargar tu recibo:** Portal UPAX → "Mi Nómina" → selecciona período → PDF/XML

**Dudas frecuentes:**
- ¿Error en nómina? → Contacta a tu HRBP dentro de los primeros 3 días hábiles
- ¿Por qué me descontaron? → Pueden ser cuotas IMSS, ISR, INFONAVIT o fondo de ahorro
- ¿Cómo se calcula el ISR? → Es proporcional a tu salario según tablas del SAT

¿Tienes alguna duda específica sobre tu nómina?`,
};

const CONSTANCIAS = {
  simple: `**Constancia de Empleo Simple**

La constancia de empleo simple acredita que **trabajas actualmente en la empresa** sin especificar tu salario.

**¿Para qué sirve?**
- Trámites bancarios
- Arrendamiento de vivienda
- Documentos migratorios
- Comprobante ante otras instituciones

**¿Cómo solicitarla?**
1. Envía un correo a tu HRBP con el asunto: "Solicitud de Constancia de Empleo Simple"
2. Indica el motivo o institución para la que la necesitas
3. **Tiempo de entrega: 2-3 días hábiles**
4. Se emite en papel oficial con sello y firma de la empresa

📌 Si la necesitas urgente, indícaselo a tu HRBP para ver si hay posibilidad de acelerarla.`,

  con_sueldo: `**Constancia de Empleo con Sueldo**

Esta constancia acredita tu relación laboral **e incluye tu salario mensual**. Se requiere para trámites donde es necesario demostrar ingresos.

**¿Para qué sirve?**
- Solicitudes de crédito bancario
- Arrendamiento de inmuebles
- Trámites ante instituciones de gobierno
- Escuelas o universidades

**¿Cómo solicitarla?**
1. Envía correo a tu HRBP: "Solicitud de Constancia de Empleo con Sueldo"
2. Especifica el monto exacto que necesitas que aparezca (bruto o neto)
3. Indica la institución a quien va dirigida
4. **Tiempo de entrega: 2-3 días hábiles**

⚠️ Esta constancia es confidencial. Cuida a qué instituciones la proporcionas.`,

  credito: `**Constancia para Crédito INFONAVIT / FONACOT**

Para tramitar créditos con INFONAVIT o FONACOT necesitas documentación específica de la empresa.

**Para INFONAVIT:**
- NSS (Número de Seguridad Social) — lo puedes consultar en tu recibo de nómina
- Constancia de relación laboral (emite la empresa)
- Los trámites de crédito se gestionan principalmente en línea desde My Account INFONAVIT

**Para FONACOT:**
- Solicita una carta de relación laboral y salario
- La empresa debe estar registrada como empleador FONACOT
- El crédito se descuenta directamente de tu nómina

**Para solicitarla:**
1. Contacta a tu HRBP indicando el tipo de crédito y la institución
2. Tu HRBP coordinará con el área de Administración
3. **Tiempo de entrega: 3-5 días hábiles**

📌 Para consultar tu saldo INFONAVIT: mi.infonavit.org.mx | Para FONACOT: fonacot.gob.mx`,

  tiempo: `**¿Cuánto tiempo tarda una constancia laboral?**

Los tiempos estándar de entrega son:

| Tipo de constancia | Tiempo estimado |
|---|---|
| Constancia simple | 2–3 días hábiles |
| Constancia con sueldo | 2–3 días hábiles |
| Para INFONAVIT / FONACOT | 3–5 días hábiles |
| Carta de recomendación | 5–7 días hábiles |

⏰ **Si la necesitas urgente**, comunícaselo a tu HRBP desde el inicio — en muchos casos se puede priorizar.

📌 El reloj empieza a correr desde que tu HRBP confirma la solicitud, no desde que envías el correo.`,

  recomendacion: `**Carta de Recomendación**

Las cartas de recomendación son documentos emitidos por la empresa que avalan tu desempeño y trayectoria profesional.

**¿Quién la emite?**
- Tu jefe directo o gerente inmediato (recomendación personal)
- El área de Capital Humano (recomendación institucional)

**¿Cómo solicitarla?**
1. Platica con tu **HRBP** para que te oriente sobre el proceso en tu UDN
2. Define si necesitas carta personal (de tu jefe) o institucional (de RRHH)
3. Indica el motivo: nuevo empleo, maestría, referencia profesional, etc.
4. **Tiempo de entrega: 5-7 días hábiles**

⚠️ Las cartas de recomendación están sujetas a la disponibilidad y disposición del firmante. Es recomendable solicitarlas con tiempo.`,

  general: `**Constancias y Documentos Laborales**

Tipos de constancias disponibles:
- 📄 **Simple** — acredita que trabajas en la empresa (2-3 días hábiles)
- 💰 **Con sueldo** — incluye tu salario (2-3 días hábiles)
- 🏠 **Para INFONAVIT/FONACOT** — trámites de crédito (3-5 días hábiles)
- ✉️ **Carta de recomendación** — para oportunidades laborales o estudios (5-7 días hábiles)

**¿Cómo solicitarlas?** Envía un correo a tu HRBP indicando el tipo de constancia y el motivo.

¿Necesitas alguna constancia en específico?`,
};

const BENEFICIOS = {
  cuales_tengo: `**¿Cuáles son tus beneficios como colaborador de UPAX?**

Como colaborador de Grupo UPAX tienes acceso a los siguientes beneficios:

🏥 **Salud y bienestar**
- Seguro de Gastos Médicos Mayores
- Seguro de Vida
- Seguro Dental (según UDN)
- Plataforma de bienestar y salud mental

💰 **Beneficios económicos**
- Fondo de Ahorro
- Vales de Despensa
- Aguinaldo (mínimo 15 días por ley)
- Prima Vacacional (mínimo 25% por ley)

🎓 **Desarrollo profesional**
- Capacitaciones y talleres internos
- Acceso a plataformas de e-learning
- Plan de carrera (según UDN)

🎁 **Otros beneficios**
- Días de vacaciones superiores a la ley (según antigüedad)
- Descuentos corporativos (según convenios de tu UDN)

📌 Los beneficios específicos pueden variar por UDN. Consulta con tu HRBP para conocer el paquete exacto de tu empresa.`,

  fondo_ahorro: `**¿Cómo funciona el Fondo de Ahorro?**

El Fondo de Ahorro es un beneficio que te permite ahorrar parte de tu salario y recibir una aportación de la empresa.

**¿Cómo funciona?**
- Tú aportas un porcentaje de tu salario quincenal (generalmente **5% a 13%**)
- La empresa aporta el mismo porcentaje de forma matching (generalmente igual a tu aportación)
- El fondo se acumula durante el año y se entrega al final del ejercicio

**¿Cuándo lo recibes?**
- Generalmente en **diciembre** (antes de las fiestas)
- En algunos casos hay retiro parcial por emergencias (depende de la política de tu UDN)

**Ejemplo:**
- Salario mensual: $15,000
- Aportación tuya (10%): $1,500/mes
- Aportación empresa (10%): $1,500/mes
- Total anual recibido: $36,000 (solo de la parte empresa = $18,000 extra)

📌 Para conocer el porcentaje exacto y condiciones de tu UDN, consulta con tu HRBP.`,

  vales_despensa: `**¿Tienes vales de despensa?**

Los vales de despensa son un beneficio **exento de ISR** (hasta el 10.74% de una UMA diaria por día) que complementa tu salario.

**¿Cómo funcionan?**
- Se cargan mensual o quincenalmente en una tarjeta electrónica (Sodexo, Edenred, etc.)
- Se pueden usar en supermercados, tiendas de conveniencia y algunos restaurantes
- No se convierten en efectivo

**¿Dónde se usan?**
- Walmart, Chedraui, La Comer, HEB, Costco, Soriana
- OXXO, 7-Eleven (según convenios)
- Farmacías y más establecimientos afiliados

📌 El monto exacto de tus vales y la tarjeta que utilizas depende de la política de tu UDN. Pregunta a tu HRBP si ya tienes activada esta prestación.`,

  seguro_vida: `**¿Tienes Seguro de Vida?**

Como colaborador de UPAX tienes derecho a un **Seguro de Vida Colectivo** que protege a tus beneficiarios en caso de fallecimiento.

**¿Qué cubre generalmente?**
- 💀 Fallecimiento por cualquier causa: suma asegurada (múltiplo de tu salario anual)
- 🚑 Muerte accidental: doble indemnización en muchos planes
- 💼 Invalidez total permanente: suma asegurada (en algunos planes)

**¿Cómo registrar beneficiarios?**
1. Solicita el formulario de designación de beneficiarios con tu HRBP
2. Indica el nombre, parentesco y porcentaje para cada beneficiario
3. Firma y entrega el formulario para que quede registrado en la aseguradora

📌 La suma asegurada y coberturas exactas dependen del plan contratado por tu UDN. Solicita a tu HRBP la póliza y los detalles de cobertura.

⚠️ **Asegúrate de tener tus beneficiarios registrados y actualizados.**`,

  bienestar: `**Plataformas de Bienestar**

UPAX pone a tu disposición herramientas para cuidar tu salud integral:

🧠 **Salud Mental**
- Acceso a plataformas de bienestar emocional
- Sesiones con psicólogos o coaches (según plan de tu UDN)

🏃 **Actividad Física**
- Convenios con gimnasios o apps de fitness (según UDN)
- Retos de bienestar internos

📚 **Desarrollo Personal**
- Cursos de mindfulness y manejo del estrés
- Webinars de salud financiera

📌 Los beneficios de bienestar varían significativamente entre UDNs. Contacta a tu HRBP para conocer exactamente a qué plataformas tienes acceso y cómo activarlas.`,

  capacitacion: `**Capacitación y Desarrollo Profesional**

Grupo UPAX invierte en el crecimiento de sus colaboradores:

🎓 **Opciones disponibles:**
- **Capacitaciones internas** — talleres y cursos impartidos por la empresa
- **Plataformas e-learning** — acceso a cursos en línea (Udemy, LinkedIn Learning u otras según UDN)
- **Certificaciones** — apoyo para obtener certificaciones profesionales (según aprobación)
- **Plan de carrera** — mentoring y rutas de desarrollo dentro de UPAX

📋 **¿Cómo acceder?**
1. Habla con tu jefe directo sobre tus intereses de desarrollo
2. Contacta a tu HRBP para conocer el catálogo vigente de capacitaciones
3. Completa el proceso de solicitud según tu UDN

📌 El presupuesto de capacitación y las opciones disponibles varían por UDN y período del año. Pregunta a tu HRBP qué hay disponible actualmente.`,

  general: `**Beneficios — Grupo UPAX**

Como colaborador cuentas con:

🏥 **Salud**: Seguro de Gastos Médicos Mayores · Seguro de Vida · Dental (según UDN)
💰 **Económicos**: Fondo de Ahorro · Vales de Despensa · Aguinaldo · Prima Vacacional
🎓 **Desarrollo**: Capacitaciones · E-learning · Plan de carrera
🎁 **Otros**: Vacaciones LFT 2023 · Descuentos corporativos · Plataformas de bienestar

📌 Los beneficios específicos varían por UDN. Tu HRBP te puede dar el detalle exacto de tu paquete.

¿Sobre qué beneficio tienes alguna duda específica?`,
};

const PERMISOS = {
  como_pedir: `**¿Cómo solicitar un permiso de ausencia?**

Para solicitar cualquier tipo de permiso sigue estos pasos:

1. **Avisa con anticipación** — idealmente con **3 días hábiles** de anticipación (en emergencias, avisa lo antes posible)
2. **Notifica a tu jefe directo** — verbalmente y por correo para tener evidencia
3. **Informa a tu HRBP** — para que quede registrado en tu expediente
4. **Completa la solicitud** en el portal de UPAX → "Permisos y Ausencias"
5. **Adjunta documentación** si el permiso lo requiere (acta, receta médica, etc.)
6. **Confirma la aprobación** antes de ausentarte

⚠️ Ausentarse sin permiso autorizado puede considerarse como **falta injustificada** con impacto en nómina y récord laboral.`,

  enfermedad: `**Permisos por Enfermedad e Incapacidades**

Si te enfermas o tienes una incapacidad médica:

**Incapacidad del IMSS:**
1. Acude al médico del IMSS o clínica afiliada
2. El médico emite el **Certificado de Incapacidad** (en papel o digital)
3. Entrega el certificado a tu HRBP **dentro de los 2 primeros días hábiles**
4. El IMSS paga el 60% de tu salario base durante la incapacidad
5. La empresa puede complementar ese pago (depende de la política de tu UDN)

**Permiso por enfermedad sin incapacidad IMSS:**
- Para 1 día: avisa a tu jefe y HRBP el mismo día
- Para más días: necesitas documento médico
- Depende de la política de tu UDN si aplica descuento en nómina

📌 Guarda siempre tus documentos médicos como evidencia.`,

  maternidad_paternidad: `**Licencia de Maternidad y Paternidad**

**Licencia de Maternidad** (Artículo 170 LFT):
- **6 semanas antes** del parto
- **6 semanas después** del parto
- Total: **12 semanas (84 días)**
- El IMSS paga el **100% del salario** durante este período
- En caso de adopción: 6 semanas posteriores a la recepción del menor

**Licencia de Paternidad** (Artículo 132 LFT):
- **5 días hábiles** pagados por el nacimiento o adopción de un hijo
- Se gozan inmediatamente después del nacimiento/adopción
- Los paga directamente la empresa (no el IMSS)

📋 **¿Cómo iniciar el proceso?**
1. Notifica a tu HRBP con anticipación (especialmente maternidad)
2. Presenta documentación: acta de nacimiento, certificado médico
3. Tu HRBP te orientará sobre los trámites con el IMSS

📌 Algunos UDNs de UPAX ofrecen días adicionales a lo marcado por ley. Consulta con tu HRBP.`,

  descuenta_vacaciones: `**¿Los permisos se descuentan de las vacaciones?**

**No**, los permisos de ausencia son independientes de tus días de vacaciones. Así funciona:

| Tipo de permiso | ¿Descuenta vacaciones? | ¿Descuenta nómina? |
|---|---|---|
| Incapacidad IMSS | No | No (IMSS cubre el 60%) |
| Permiso por luto | No | No (pagado) |
| Permiso por matrimonio | No | No (pagado) |
| Permiso paternidad/maternidad | No | No (pagado) |
| Permiso personal sin goce | No | **Sí** |
| Falta injustificada | No | **Sí** |

✅ Tus días de vacaciones solo se usan cuando **tú decides** tomarlos como vacaciones.

📌 Si tienes dudas sobre un descuento específico en tu nómina por ausencia, consulta con tu HRBP.`,

  sin_goce: `**Permiso Sin Goce de Sueldo**

El permiso sin goce de sueldo es una ausencia autorizada donde **no recibes salario** por los días ausentes, pero se mantiene tu relación laboral.

**¿Para qué se usa?**
- Asuntos personales urgentes
- Estudios o becas
- Acompañar a familiar enfermo
- Trámites prolongados

**¿Cómo solicitarlo?**
1. Habla con tu jefe directo para obtener su apoyo previo
2. Envía solicitud formal a tu HRBP por correo explicando:
   - Motivo de la solicitud
   - Fechas exactas
   - Plan de trabajo durante tu ausencia (si aplica)
3. El HRBP evalúa la solicitud con la dirección de tu UDN
4. **Tiempo de respuesta: 5 días hábiles**

⚠️ **Impactos a considerar:**
- Días sin pago se descuentan de nómina
- Puede afectar el cálculo de tu aguinaldo proporcional
- No afecta tu antigüedad laboral

📌 Los permisos sin goce son discrecionales — la empresa puede aprobarlos o no según necesidades operativas.`,

  general: `**Permisos de Ausencia — Guía General**

**Permisos pagados por ley (LFT):**
- 🤱 Maternidad: 12 semanas (6+6)
- 👶 Paternidad: 5 días hábiles
- 💍 Matrimonio: hasta 5 días (según UDN)
- ⚰️ Luto familiar directo: 3 días hábiles

**Para solicitar cualquier permiso:**
1. Avisa a tu jefe directo con anticipación
2. Notifica a tu HRBP
3. Completa la solicitud en el portal de UPAX
4. Adjunta documentos si aplica

📌 Los permisos NO descuentan tus días de vacaciones.

¿Tienes alguna duda específica sobre algún tipo de permiso?`,
};

const SEGUROS = {
  cobertura_medico: `**¿Qué cubre tu Seguro de Gastos Médicos Mayores?**

Tu seguro de GMM (Gastos Médicos Mayores) cubre eventos médicos de alto costo:

✅ **Coberturas incluidas generalmente:**
- Hospitalización
- Cirugías
- Urgencias
- Maternidad
- Estudios de diagnóstico (laboratorio, imagen)
- Honorarios médicos (dentro de la red)
- Rehabilitación

❌ **Exclusiones comunes:**
- Enfermedades preexistentes (período de espera)
- Tratamientos estéticos
- Medicamentos ambulatorios (fuera de hospitalización)
- Lentes y aparatos ortopédicos (depende del plan)

📌 Las coberturas exactas, suma asegurada y deducible dependen del plan contratado por tu UDN. Solicita a tu HRBP el número de póliza y el documento de condiciones generales.`,

  como_usar: `**¿Cómo usar tu seguro médico?**

**Para hospitalización o cirugía programada:**
1. Llama al **número de atención** de tu aseguradora (está en tu carnet o con tu HRBP)
2. Solicita una **Carta de Autorización** antes del procedimiento
3. Ve al hospital o clínica dentro de la **red de la aseguradora**
4. Presenta tu carnet de seguro y la carta de autorización al llegar

**Para urgencias:**
1. Ve directamente a urgencias de cualquier hospital de la red
2. Identifícate con tu número de póliza
3. La aseguradora debe ser notificada en las siguientes **24 horas**

**¿Cómo conseguir tu carnet?**
1. Contacta a tu HRBP — ellos tienen los carnets o te dan acceso digital
2. La aseguradora puede enviarte el carnet digital a tu correo

📌 Nunca vayas a un hospital **fuera de red** sin autorización previa — podría no tener cobertura.`,

  dental: `**¿Tu seguro incluye cobertura dental?**

La cobertura dental depende del plan contratado por tu UDN:

**Si tienes seguro dental incluido:**
- Consultas con dentistas de la red
- Limpiezas y profilaxis
- Tratamientos de urgencia (abscesos, fracturas)
- Endodoncias y extracciones (con autorización)

**Servicios que generalmente NO cubre:**
- Ortodoncia (brackets) — requiere plan especial
- Implantes dentales
- Tratamientos estéticos

**¿Cómo saber si tienes seguro dental?**
1. Pregunta a tu HRBP por tu póliza o beneficios
2. Revisa el documento de condiciones de tu seguro

📌 Si tu UDN no incluye seguro dental, pregunta a tu HRBP si hay algún convenio o red de descuentos con dentistas disponible para colaboradores.`,

  familia: `**¿Puedo asegurar a mis familiares?**

Muchos planes de GMM de UPAX permiten incluir a tus **dependientes económicos**:

**¿Quiénes pueden incluirse?**
- Cónyuge o pareja (según política de la aseguradora)
- Hijos menores de 25 años (dependientes económicos)
- Padres (en algunos planes, con cargo adicional)

**¿Cómo funciona?**
- Cada dependiente genera un **cargo adicional** que se descuenta de tu nómina
- Los dependientes tienen las mismas coberturas que tú (o pueden variar)

**¿Cómo agregar un dependiente?**
1. Contacta a tu HRBP
2. Presenta documentos del dependiente: acta de nacimiento/matrimonio
3. Tu HRBP lo tramita con la aseguradora
4. **Solo puedes agregar dependientes** en el período de inscripción anual o en eventos de vida (nacimiento, matrimonio)

📌 Confirma con tu HRBP si tu plan permite dependientes y cuál es el costo adicional.`,

  red_medicos: `**¿Cómo funciona la red médica de tu seguro?**

La **red médica** es el conjunto de hospitales, clínicas y médicos con los que la aseguradora tiene convenio de pago directo.

**Ventajas de usar médicos dentro de la red:**
- La aseguradora paga directamente al hospital/médico
- Tú solo cubres el **deducible** y **coaseguro** (si aplica)
- No necesitas hacer reembolsos

**Fuera de red:**
- Puedes ir pero debes **pagar de tu bolsillo** primero
- Después solicitas reembolso a la aseguradora (proceso más largo)
- Puede haber **topes de reembolso** o porcentajes de cobertura menores

**¿Cómo consultar la red?**
1. Pide a tu HRBP el nombre de tu aseguradora y número de póliza
2. Entra al sitio web de la aseguradora → "Directorio médico"
3. Busca por especialidad, ubicación o nombre del médico

📌 Antes de cualquier procedimiento, **confirma que el médico o hospital está en red** para evitar sorpresas.`,

  general: `**Seguros — Guía General**

Como colaborador de UPAX tienes:

🏥 **Seguro de Gastos Médicos Mayores (GMM)**
- Cubre: hospitalización, cirugías, urgencias, maternidad, estudios
- Para usarlo: llama a la aseguradora y solicita carta de autorización

🦷 **Seguro Dental** (aplica según UDN)
- Consultas, limpiezas, endodoncias con dentistas de la red

💀 **Seguro de Vida**
- Suma asegurada en caso de fallecimiento/invalidez
- Asegúrate de tener tus beneficiarios registrados

**¿Cómo conseguir tu carnet?** Contacta a tu HRBP.
**¿Cómo usar el seguro?** Llama a la aseguradora antes de cualquier procedimiento.

¿Tienes alguna duda específica sobre tu seguro?`,
};

const REGLAMENTO = {
  donde_consultar: `**¿Dónde consultas el Reglamento Interno?**

El **Reglamento Interno de Trabajo** es el documento oficial que establece las normas, derechos y obligaciones de colaboradores y la empresa.

**¿Cómo acceder?**
1. **Portal interno de UPAX** → Sección "Documentos Oficiales" o "Mi Empresa"
2. **Solicítalo a tu HRBP** — puede enviártelo por correo
3. **Al momento de tu ingreso** debiste haber firmado un acuse de recibo del reglamento

**¿Qué contiene?**
- Horarios de trabajo y descansos
- Obligaciones y prohibiciones
- Medidas disciplinarias
- Proceso de quejas y sugerencias
- Políticas de seguridad e higiene
- Código de conducta

📌 Si nunca lo recibiste o no puedes encontrarlo, contáctate con tu HRBP para que te lo proporcionen. Es tu derecho conocerlo.`,

  horario: `**¿Cuál es tu horario de trabajo?**

El horario de trabajo en UPAX **varía por UDN y área**. La Ley Federal del Trabajo establece los límites:

**Jornadas según la LFT:**
| Tipo de jornada | Máximo diario | Máximo semanal |
|---|---|---|
| Diurna (6am – 8pm) | 8 horas | 48 horas |
| Nocturna (8pm – 6am) | 7 horas | 42 horas |
| Mixta | 7.5 horas | 45 horas |

**Tiempo de comida:**
- La Ley establece al menos **30 minutos** de descanso (que no cuentan como jornada si es 30 min)
- Muchas empresas dan 1 hora de comida

**¿Cómo saber tu horario exacto?**
- Está en tu contrato de trabajo
- Consúltalo con tu jefe directo
- O pregunta a tu HRBP

📌 El trabajo fuera de tu horario estipulado (horas extra) debe ser acordado y pagado con el sobrecargo de ley (200% para las primeras 9 horas extra semanales).`,

  home_office: `**¿Cuál es la política de Home Office en UPAX?**

La política de trabajo remoto varía por **UDN, área y puesto**. En México, la **Ley Federal del Trabajo** regula el teletrabajo desde 2021.

**Derechos del colaborador en home office (LFT):**
- El patrón debe **proporcionar equipo** de trabajo y conectividad o pagar un porcentaje
- Tienes **derecho a desconectarte** fuera de tu horario laboral
- El home office debe ser **acordado por escrito**
- El empleador puede revertir el home office con **30 días de aviso**

**¿Cuántos días de home office tienes?**
Esto depende de la política específica de tu UDN y lo acordado en tu contrato o adendum.

**Para conocer tu modalidad exacta:**
1. Revisa tu contrato o adendum de home office
2. Consulta con tu jefe directo
3. O pregunta a tu HRBP

📌 Si tienes home office y la empresa quiere revocarlo, debe darte aviso con **mínimo 30 días de anticipación**.`,

  falta_justificada: `**¿Cuándo se considera una falta justificada?**

Una **falta justificada** es una ausencia que la empresa reconoce como válida y que, según su política, puede no implicar descuento en nómina.

**Faltas que generalmente se consideran justificadas:**
- ✅ Incapacidad médica del IMSS (con certificado)
- ✅ Duelo familiar (con acta de defunción)
- ✅ Matrimonio (con acta)
- ✅ Maternidad/Paternidad
- ✅ Citatorio judicial o de autoridad
- ✅ Permisos autorizados previamente por HRBP/jefe

**Faltas que generalmente NO son justificadas:**
- ❌ Ausencia sin aviso
- ❌ Aviso tardío sin documentación
- ❌ Motivos personales no documentados

⚠️ **Impacto de faltas injustificadas:**
- Descuento en nómina
- Nota en expediente laboral
- Pueden ser causal de rescisión si son reiteradas

📌 Ante cualquier duda, siempre avisa a tu HRBP **antes o el mismo día** de la ausencia.`,

  vestimenta: `**¿Hay código de vestimenta en UPAX?**

El código de vestimenta varía por **UDN y área**. En general:

**Lineamientos comunes en Grupo UPAX:**
- 👔 **Casual de negocios** — la mayoría de las UDNs
  - Pantalón de tela o jeans sin roturas
  - Camisa, blusa o polo (sin playeras con estampados inapropiados)
  - Zapatos cerrados o casuales formales
- 🎨 **Casual creativo** — agencias y áreas de diseño/marketing
  - Mayor libertad, respetando presentación profesional
- 👗 **Formal** — áreas legales, dirección, atención a clientes de alto perfil

**Lo que generalmente NO está permitido:**
- Ropa interior visible
- Ropa deportiva (shorts, pants, licras)
- Playeras con leyendas ofensivas
- Calzado abierto (flip flops) en muchas áreas

📌 Para el código exacto de tu UDN, consulta el Reglamento Interno o pregunta directamente a tu HRBP o jefe directo.`,

  general: `**Reglamento Interno — Guía Rápida**

Los puntos principales que todo colaborador debe conocer:

⏰ **Horarios**: Varía por UDN — entre 8h diurnas y 7h nocturnas máximo por ley
🏠 **Home Office**: Depende de tu área y contrato — la LFT lo regula desde 2021
👔 **Vestimenta**: Casual de negocios en la mayoría de las UDNs
✅ **Faltas justificadas**: Con documentación (incapacidad IMSS, duelo, matrimonio, etc.)

**¿Dónde encontrar el reglamento completo?**
Portal de UPAX → "Documentos Oficiales" o solicítalo a tu HRBP.

¿Tienes alguna duda específica sobre las políticas de la empresa?`,
};

const GENERAL_RESPONSES = {
  hrbp_contacto: `**Contacto con tu HRBP**

Tu HRBP (Human Resources Business Partner) es tu punto de contacto directo para cualquier asunto de Capital Humano.

**Tu HRBP asignado es: {{HRBP_NOMBRE}}**

**¿En qué puede ayudarte?**
- Trámites de nómina y constancias
- Solicitudes de vacaciones y permisos
- Dudas sobre beneficios y seguros
- Situaciones laborales o conflictos
- Procesos de baja o cambio de área

**Formas de contactarlo:**
- Correo electrónico (solicítalo si aún no lo tienes)
- Portal interno de UPAX → "Mi HRBP"
- Directamente en las oficinas de Capital Humano

📌 Para asuntos urgentes, no esperes — comunícate de inmediato con tu HRBP.`,

  escalar_caso: `**¿Cómo escalar un caso a Capital Humano?**

Si tienes una situación que requiere atención especial, sigue este proceso:

**Nivel 1 — Tu HRBP directo**
- Primera línea de atención para todos los temas de CH
- Tiempo de respuesta: 1-3 días hábiles

**Nivel 2 — Gerencia de Capital Humano**
- Si tu HRBP no resuelve o la situación lo amerita
- Solicita el contacto a tu HRBP o busca en el directorio interno

**Nivel 3 — Dirección de Capital Humano / Dirección General**
- Para casos graves: acoso laboral, discriminación, conflictos serios
- Se puede escalar directamente si los niveles anteriores no responden

**Para asuntos urgentes o graves (acoso, discriminación):**
- Tienes derecho a reportarlo directamente sin pasar por niveles anteriores
- La empresa está obligada a investigar

📌 Documenta todo: guarda correos, fechas, testigos. Esto es importante para cualquier proceso formal.`,

  contrato: `**Dudas sobre tu Contrato de Trabajo**

Tu contrato de trabajo es el documento legal que define los términos de tu relación laboral.

**¿Qué debe incluir tu contrato?**
- Nombre completo y datos de ambas partes
- Tipo de contrato (indefinido, determinado, por obra)
- Puesto, descripción de actividades
- Salario y forma de pago
- Jornada de trabajo y horario
- Lugar de trabajo
- Prestaciones adicionales a la ley

**Tipos de contrato en México:**
- 📋 **Tiempo indefinido** — el más común, sin fecha de terminación
- 📋 **Tiempo determinado** — por proyecto o temporada específica
- 📋 **Por obra** — hasta completar un proyecto concreto

**¿Tienes dudas sobre algo específico?**
- Cláusulas que no entiendes → solicita explicación a tu HRBP
- Modificaciones al contrato → deben hacerse por escrito (adendum)
- No tienes copia de tu contrato → solicítala a tu HRBP

📌 Es tu derecho tener una copia de tu contrato firmado. Si no la tienes, pídela hoy mismo.`,

  proceso_baja: `**Proceso de Baja o Renuncia**

Si estás considerando renunciar o ya tomaste la decisión, aquí está el proceso:

**Paso 1: Carta de renuncia**
- Redacta una carta formal indicando tu nombre, fecha y la fecha en que será efectiva tu baja
- La LFT no exige período de aviso mínimo, pero es buena práctica dar **15 días**

**Paso 2: Notifica a tu jefe directo y HRBP**
- Entrega la carta en persona o por correo con copia a ambos
- Se inicia el proceso de liquidación

**Paso 3: Liquidación**
- **Renuncia voluntaria** te corresponde: partes proporcionales de aguinaldo, vacaciones y prima vacacional
- **Finiquito**: se firma al entregar equipo y credenciales
- **Tiempo**: el pago debe realizarse en **un máximo de 7 días** después de tu último día

**Si te despiden (sin causa justificada):**
- 3 meses de salario
- 20 días por año trabajado
- Partes proporcionales (aguinaldo, vacaciones, prima)

📌 No firmes ningún documento sin entenderlo. Si tienes dudas, consulta con tu HRBP o un abogado laboral.`,

  queja_sugerencia: `**¿Cómo presento una queja o sugerencia formalmente?**

Grupo UPAX tiene canales formales para recibir retroalimentación de sus colaboradores:

**Para quejas o inconformidades:**

1. **Canal directo con HRBP** — primera opción para la mayoría de situaciones
2. **Portal interno de UPAX** → sección "Buzón de quejas y sugerencias" (si disponible)
3. **Correo a la Dirección de Capital Humano** — para casos donde el HRBP es parte del problema
4. **Denuncia anónima** — para casos de acoso, discriminación u hostigamiento (pregunta a tu HRBP el canal disponible)

**Para sugerencias de mejora:**
- Dirígete a tu HRBP o jefe directo con tu propuesta
- Usa el buzón de sugerencias interno si está disponible
- Participa en encuestas de clima organizacional cuando se realicen

⚠️ **Para acoso laboral o sexual:**
- La empresa tiene **obligación legal** de investigar
- Puedes reportarlo directamente a la Dirección de CH o STPS (Secretaría del Trabajo)
- Tu identidad puede protegerse si lo solicitas

📌 No te quedes con dudas o inconformidades. Los problemas no resueltos afectan tu bienestar y el ambiente de trabajo.`,

  default: `¡Hola! Soy tu asistente de **Capital Humano de Grupo UPAX** 👋

Puedo ayudarte con información sobre:

🏖️ **Vacaciones** — Días disponibles por LFT 2023, cómo solicitarlas, fraccionarlas
💰 **Nómina** — Fechas de pago, recibos, descuentos, ISR
📄 **Constancias** — Laborales, con sueldo, INFONAVIT, recomendación
💊 **Beneficios** — Seguros, fondo de ahorro, vales, bienestar
📋 **Permisos** — Ausencias, incapacidades, maternidad/paternidad
🔒 **Seguros** — Médico, dental, vida, red de médicos
📚 **Reglamento** — Horarios, home office, código de vestimenta
💬 **General** — Contacto HRBP, contratos, bajas, quejas

Usa los botones de acceso rápido o escríbeme tu pregunta directamente.

¿En qué te puedo ayudar hoy?`,
};

// ---------------------------------------------------------------------------
// DETECCIÓN DE CATEGORÍA
// ---------------------------------------------------------------------------
function detectCategory(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("vacacion") || lower.includes("descanso") || lower.includes("días libre") || lower.includes("dias libre") || lower.includes("aniversario") || lower.includes("prima vacacional")) return "vacaciones";
  if (lower.includes("nómin") || lower.includes("nomina") || lower.includes("sueldo") || lower.includes("pago") || lower.includes("recibo") || lower.includes("quincena") || lower.includes("isr") || lower.includes("deposito") || lower.includes("depósito")) return "nomina";
  if (lower.includes("constanci") || lower.includes("carta de empleo") || lower.includes("infonavit") || lower.includes("fonacot") || lower.includes("recomendación") || lower.includes("recomendacion")) return "constancias";
  if (lower.includes("beneficio") || lower.includes("prestacion") || lower.includes("vale") || lower.includes("fondo de ahorro") || lower.includes("despensa") || lower.includes("bienestar") || lower.includes("capacitacion") || lower.includes("capacitación")) return "beneficios";
  if (lower.includes("permiso") || lower.includes("ausencia") || lower.includes("licencia") || lower.includes("maternidad") || lower.includes("paternidad") || lower.includes("incapacidad")) return "permisos";
  if (lower.includes("seguro") || lower.includes("médico") || lower.includes("medico") || lower.includes("dental") || lower.includes("salud") || lower.includes("hospital") || lower.includes("póliza") || lower.includes("poliza")) return "seguros";
  if (lower.includes("reglamento") || lower.includes("política") || lower.includes("politica") || lower.includes("horario") || lower.includes("home office") || lower.includes("vestimenta") || lower.includes("falta justificada")) return "reglamento";
  if (lower.includes("hrbp") || lower.includes("renuncia") || lower.includes("baja") || lower.includes("contrato") || lower.includes("queja") || lower.includes("sugerencia") || lower.includes("escalar")) return "general";
  return "default";
}

// ---------------------------------------------------------------------------
// GENERADOR DE RESPUESTA — Específico por sub-pregunta + fallback por categoría
// ---------------------------------------------------------------------------
function generateResponse(
  message: string,
  category?: string | null,
  employee?: EmployeeContext | null
): { content: string; category: string } {
  const detectedCategory = category || detectCategory(message);
  const lower = message.toLowerCase();

  let content = "";

  // — VACACIONES —
  if (detectedCategory === "vacaciones") {
    if (lower.includes("cuántos") || lower.includes("cuantos") || lower.includes("quedan") || lower.includes("disponibles")) {
      content = VACACIONES.cuantos_dias;
    } else if (lower.includes("aniversario") || lower.includes("cumplo el año") || lower.includes("cumplo año") || lower.includes("cuándo se cumple") || lower.includes("cuando se cumple")) {
      content = VACACIONES.aniversario;
    } else if (lower.includes("renuevan") || lower.includes("renovan")) {
      content = VACACIONES.renovacion;
    } else if (lower.includes("cómo solicito") || lower.includes("como solicito") || lower.includes("proceso para solicitar") || lower.includes("pedir vacaciones")) {
      content = VACACIONES.como_solicitar;
    } else if (lower.includes("no uso") || lower.includes("si no uso") || lower.includes("no use") || lower.includes("qué pasa")) {
      content = VACACIONES.no_uso;
    } else if (lower.includes("fraccionar") || lower.includes("en partes") || lower.includes("dividir") || lower.includes("puedo tomar")) {
      content = VACACIONES.fraccionar;
    } else {
      content = VACACIONES.general;
    }
  }

  // — NÓMINA —
  else if (detectedCategory === "nomina") {
    if (lower.includes("cuándo") || lower.includes("cuando") || lower.includes("fechas de pago") || lower.includes("depositan") || lower.includes("próximo depósito") || lower.includes("proximo deposito")) {
      content = NOMINA.cuando_depositan;
    } else if (lower.includes("descuento") || lower.includes("descontaron") || lower.includes("deducciones") || lower.includes("por qué")) {
      content = NOMINA.descuentos;
    } else if (lower.includes("descargo") || lower.includes("descargar") || lower.includes("recibo") || lower.includes("cfdi") || lower.includes("dónde")) {
      content = NOMINA.descargar_recibo;
    } else if (lower.includes("calcula") || lower.includes("quincena") || lower.includes("cómo se calcula") || lower.includes("como se calcula")) {
      content = NOMINA.calculo_quincena;
    } else if (lower.includes("error") || lower.includes("equivocado") || lower.includes("equivocación") || lower.includes("incorrecto")) {
      content = NOMINA.error_nomina;
    } else if (lower.includes("isr") || lower.includes("impuesto")) {
      content = NOMINA.isr;
    } else {
      content = NOMINA.general;
    }
  }

  // — CONSTANCIAS —
  else if (detectedCategory === "constancias") {
    if (lower.includes("simple") || lower.includes("empleo simple")) {
      content = CONSTANCIAS.simple;
    } else if (lower.includes("con sueldo") || lower.includes("sueldo") || lower.includes("salario")) {
      content = CONSTANCIAS.con_sueldo;
    } else if (lower.includes("infonavit") || lower.includes("fonacot") || lower.includes("crédito") || lower.includes("credito")) {
      content = CONSTANCIAS.credito;
    } else if (lower.includes("cuánto tiempo") || lower.includes("cuanto tiempo") || lower.includes("tarda") || lower.includes("tiempo de entrega")) {
      content = CONSTANCIAS.tiempo;
    } else if (lower.includes("recomendación") || lower.includes("recomendacion")) {
      content = CONSTANCIAS.recomendacion;
    } else {
      content = CONSTANCIAS.general;
    }
  }

  // — BENEFICIOS —
  else if (detectedCategory === "beneficios") {
    if (lower.includes("cuáles") || lower.includes("cuales") || lower.includes("todos") || lower.includes("qué beneficios") || lower.includes("que beneficios")) {
      content = BENEFICIOS.cuales_tengo;
    } else if (lower.includes("fondo de ahorro") || lower.includes("fondo ahorro") || lower.includes("ahorro")) {
      content = BENEFICIOS.fondo_ahorro;
    } else if (lower.includes("vale") || lower.includes("despensa") || lower.includes("tienda")) {
      content = BENEFICIOS.vales_despensa;
    } else if (lower.includes("seguro de vida") || lower.includes("vida") || lower.includes("fallecimiento")) {
      content = BENEFICIOS.seguro_vida;
    } else if (lower.includes("bienestar") || lower.includes("wellness") || lower.includes("salud mental") || lower.includes("plataforma")) {
      content = BENEFICIOS.bienestar;
    } else if (lower.includes("capacitac") || lower.includes("curso") || lower.includes("desarrollo") || lower.includes("aprendizaje")) {
      content = BENEFICIOS.capacitacion;
    } else {
      content = BENEFICIOS.general;
    }
  }

  // — PERMISOS —
  else if (detectedCategory === "permisos") {
    if (lower.includes("cómo pido") || lower.includes("como pido") || lower.includes("proceso para solicitar") || lower.includes("solicitar un permiso")) {
      content = PERMISOS.como_pedir;
    } else if (lower.includes("enfermedad") || lower.includes("incapacidad") || lower.includes("médico") || lower.includes("medico") || lower.includes("imss")) {
      content = PERMISOS.enfermedad;
    } else if (lower.includes("maternidad") || lower.includes("paternidad") || lower.includes("embarazo") || lower.includes("licencia")) {
      content = PERMISOS.maternidad_paternidad;
    } else if (lower.includes("descuenta") || lower.includes("vacaciones") || lower.includes("quita") || lower.includes("resta")) {
      content = PERMISOS.descuenta_vacaciones;
    } else if (lower.includes("sin goce") || lower.includes("sin sueldo") || lower.includes("unpaid")) {
      content = PERMISOS.sin_goce;
    } else {
      content = PERMISOS.general;
    }
  }

  // — SEGUROS —
  else if (detectedCategory === "seguros") {
    if (lower.includes("cubre") || lower.includes("cobertura") || lower.includes("qué incluye") || lower.includes("que incluye") || lower.includes("gastos médicos")) {
      content = SEGUROS.cobertura_medico;
    } else if (lower.includes("cómo uso") || lower.includes("como uso") || lower.includes("urgencia") || lower.includes("hospitaliz") || lower.includes("usar")) {
      content = SEGUROS.como_usar;
    } else if (lower.includes("dental") || lower.includes("dentista")) {
      content = SEGUROS.dental;
    } else if (lower.includes("familia") || lower.includes("dependiente") || lower.includes("cónyuge") || lower.includes("hijo") || lower.includes("asegurar a")) {
      content = SEGUROS.familia;
    } else if (lower.includes("red") || lower.includes("hospital") || lower.includes("médico") || lower.includes("medico") || lower.includes("directorio")) {
      content = SEGUROS.red_medicos;
    } else {
      content = SEGUROS.general;
    }
  }

  // — REGLAMENTO —
  else if (detectedCategory === "reglamento") {
    if (lower.includes("dónde") || lower.includes("donde") || lower.includes("consultar") || lower.includes("encontrar") || lower.includes("acceder")) {
      content = REGLAMENTO.donde_consultar;
    } else if (lower.includes("horario") || lower.includes("jornada") || lower.includes("entrada") || lower.includes("salida")) {
      content = REGLAMENTO.horario;
    } else if (lower.includes("home office") || lower.includes("teletrabajo") || lower.includes("remoto") || lower.includes("desde casa")) {
      content = REGLAMENTO.home_office;
    } else if (lower.includes("falta justificada") || lower.includes("ausencia justificada") || lower.includes("cuándo se considera") || lower.includes("cuando se considera")) {
      content = REGLAMENTO.falta_justificada;
    } else if (lower.includes("vestimenta") || lower.includes("ropa") || lower.includes("código de") || lower.includes("dress")) {
      content = REGLAMENTO.vestimenta;
    } else {
      content = REGLAMENTO.general;
    }
  }

  // — GENERAL —
  else if (detectedCategory === "general") {
    if (lower.includes("hrbp") || lower.includes("contacto") || lower.includes("mi hrbp")) {
      content = GENERAL_RESPONSES.hrbp_contacto;
    } else if (lower.includes("escalar") || lower.includes("escalamiento") || lower.includes("proceso para escalar")) {
      content = GENERAL_RESPONSES.escalar_caso;
    } else if (lower.includes("contrato") || lower.includes("cláusula") || lower.includes("clausula")) {
      content = GENERAL_RESPONSES.contrato;
    } else if (lower.includes("renuncia") || lower.includes("baja") || lower.includes("liquidaci") || lower.includes("finiquito")) {
      content = GENERAL_RESPONSES.proceso_baja;
    } else if (lower.includes("queja") || lower.includes("sugerencia") || lower.includes("denuncia")) {
      content = GENERAL_RESPONSES.queja_sugerencia;
    } else {
      content = GENERAL_RESPONSES.default;
    }
  }

  // — DEFAULT —
  else {
    content = GENERAL_RESPONSES.default;
  }

  // Reemplazar placeholder del HRBP con el nombre real
  if (employee?.hrbpName) {
    content = content.replace(/\{\{HRBP_NOMBRE\}\}/g, employee.hrbpName);
  } else {
    content = content.replace(/\{\{HRBP_NOMBRE\}\}/g, "tu HRBP asignado");
  }

  return { content, category: detectedCategory === "default" ? "general" : detectedCategory };
}

// ---------------------------------------------------------------------------
// RUTAS
// ---------------------------------------------------------------------------

// Obtiene (o crea) el ID numérico del empleado en la tabla local de DB
// usando su número de empleado como clave única. Esto permite almacenar
// el historial de chat aunque el empleado venga de Google Sheets.
interface SessionEmployee {
  employeeNumber: string;
  name: string;
  businessUnit: string;
  role: string;
  hrbpName: string;
  hrbpPhoto: string;
  accentColor: string;
  logoUrl: string;
  isInternal: boolean;
  consultora: string;
}

async function getOrCreateEmployeeDbId(sess: SessionEmployee): Promise<number> {
  const [existing] = await db
    .select({ id: employeesTable.id })
    .from(employeesTable)
    .where(eq(employeesTable.employeeNumber, sess.employeeNumber))
    .limit(1);

  if (existing) return existing.id;

  const [created] = await db
    .insert(employeesTable)
    .values({
      employeeNumber: sess.employeeNumber,
      password:       "",
      name:           sess.name,
      businessUnit:   sess.businessUnit,
      role:           sess.role || "Colaborador",
      hrbpName:       sess.hrbpName || "",
      hrbpPhoto:      sess.hrbpPhoto || "",
      accentColor:    sess.accentColor || "#E85D04",
      logoUrl:        sess.logoUrl || "/upax_logo_1774489769957.png",
      isInternal:     sess.isInternal,
      consultora:     sess.consultora || null,
    })
    .onConflictDoUpdate({
      target: employeesTable.employeeNumber,
      set: { name: sql`excluded.name` },
    })
    .returning({ id: employeesTable.id });

  return created.id;
}

router.post("/chat/message", async (req, res) => {
  if (!req.session.employee) {
    res.status(401).json({ error: "unauthorized", message: "No has iniciado sesión" });
    return;
  }

  const { message, category } = req.body;

  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "bad_request", message: "El mensaje es requerido" });
    return;
  }

  try {
    const sess = req.session.employee;

    // Contexto del empleado — viene directo de la sesión (Google Sheets)
    const empCtx: EmployeeContext = {
      hrbpName:     sess.hrbpName || undefined,
      name:         sess.name,
      businessUnit: sess.businessUnit,      // p.ej. "UiX" → en findSheetResponse se normaliza
      isInternal:   sess.isInternal,
      consultora:   sess.consultora || undefined,
    };

    // Obtener o crear el ID del empleado en la DB para guardar historial
    const employeeDbId = await getOrCreateEmployeeDbId(sess);

    const [userMsg] = await db
      .insert(chatMessagesTable)
      .values({
        employeeId: employeeDbId,
        role: "user",
        content: message,
        category: category || null,
      })
      .returning();

    // 1️⃣ Intentar respuesta del Sheet DB_RESPUESTAS (fuente primaria)
    const detectedCategory = category || detectCategory(message);
    const sheetResponses = await loadSheetResponses();
    console.log(`[Chat] Empleado: ${sess.name} | UDN: ${sess.businessUnit} | Tipo: ${sess.isInternal ? "INTERNO" : "EXTERNO"} | Cat: ${detectedCategory} | Respuestas en Sheet: ${sheetResponses.length}`);
    const sheetAnswer = findSheetResponse(sheetResponses, detectedCategory, message, empCtx);
    console.log(`[Chat] Sheet match: ${sheetAnswer ? "SÍ (" + sheetAnswer.substring(0, 60) + "...)" : "NO — usando fallback"}`)

    let responseContent: string;
    let responseCategory: string;

    if (sheetAnswer) {
      responseContent = sheetAnswer;
      responseCategory = detectedCategory;
    } else {
      // 2️⃣ Fallback a la base de conocimiento del código
      const fallback = generateResponse(message, category, empCtx);
      responseContent = fallback.content;
      responseCategory = fallback.category;
    }

    const [assistantMsg] = await db
      .insert(chatMessagesTable)
      .values({
        employeeId: employeeDbId,
        role: "assistant",
        content: responseContent,
        category: responseCategory,
      })
      .returning();

    res.json({
      message: {
        id: userMsg.id,
        role: userMsg.role,
        content: userMsg.content,
        timestamp: userMsg.timestamp.toISOString(),
        category: userMsg.category,
      },
      response: {
        id: assistantMsg.id,
        role: assistantMsg.role,
        content: assistantMsg.content,
        timestamp: assistantMsg.timestamp.toISOString(),
        category: assistantMsg.category,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Error processing chat message");
    res.status(500).json({ error: "server_error", message: "Error interno del servidor" });
  }
});

router.get("/chat/history", async (req, res) => {
  if (!req.session.employee) {
    res.status(401).json({ error: "unauthorized", message: "No has iniciado sesión" });
    return;
  }

  try {
    const employeeDbId = await getOrCreateEmployeeDbId(req.session.employee);

    const messages = await db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.employeeId, employeeDbId))
      .orderBy(asc(chatMessagesTable.timestamp))
      .limit(100);

    res.json({
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.toISOString(),
        category: m.category,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching chat history");
    res.status(500).json({ error: "server_error", message: "Error interno del servidor" });
  }
});

export default router;
