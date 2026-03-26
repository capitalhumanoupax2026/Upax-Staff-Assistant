import { Router, type IRouter } from "express";
import { db, chatMessagesTable, employeesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router: IRouter = Router();

const HR_KNOWLEDGE_BASE: Record<string, string> = {
  vacaciones: `**Política de Vacaciones**

Tienes derecho a días de vacaciones según tu antigüedad:
- 1 año: 12 días
- 2 años: 14 días
- 3 años: 16 días
- 4 años: 18 días
- 5-9 años: 20 días
- 10+ años: 22 días

Para solicitar tus vacaciones:
1. Ingresa al portal interno de UPAX
2. Selecciona "Solicitud de Vacaciones"
3. Elige las fechas deseadas
4. Tu HRBP aprobará la solicitud en un máximo de 3 días hábiles

¿Tienes alguna otra duda sobre vacaciones?`,

  nomina: `**Recibo de Nómina**

Tu nómina se procesa de forma quincenal:
- **Quincena 1**: Del 1 al 15 de cada mes (pago el día 16)
- **Quincena 2**: Del 16 al último día del mes (pago el día 1)

Para obtener tu recibo de nómina:
1. Accede al portal de UPAX
2. Ve a la sección "Mi Nómina"
3. Descarga tu recibo en formato PDF

Para dudas sobre cálculos o deducciones, contacta a tu HRBP directamente.`,

  constancia: `**Constancia Laboral**

Para solicitar tu constancia de trabajo:
1. Envía un correo a tu HRBP indicando el motivo de la constancia
2. Tiempo de entrega: 3-5 días hábiles
3. Se emite en formato oficial con sello de la empresa

Tipos de constancias disponibles:
- Constancia de empleo simple
- Constancia con sueldo
- Constancia para trámites de crédito (Infonavit, Fonacot)
- Carta de recomendación

¿Para qué institución o trámite necesitas la constancia?`,

  beneficios: `**Beneficios para Colaboradores**

En Grupo UPAX contamos con los siguientes beneficios:

💊 **Salud**
- Seguro de gastos médicos mayores
- Seguro dental
- Acceso a plataforma de bienestar

🏖️ **Tiempo libre**
- Días de vacaciones conforme a ley
- Días personales (según política de tu UDN)

📚 **Desarrollo**
- Capacitaciones y talleres
- Plataformas de e-learning
- Plan de carrera

🎁 **Otros beneficios**
- Vale de despensa
- Fondo de ahorro
- Descuentos corporativos

Para conocer los beneficios específicos de tu unidad de negocio, consulta con tu HRBP.`,

  permisos: `**Permisos de Ausencia**

Tipos de permisos disponibles:

📋 **Permisos pagados**
- Matrimonio: 5 días hábiles
- Fallecimiento de familiar directo: 3 días hábiles
- Paternidad: 5 días hábiles (según ley)
- Maternidad: 12 semanas (según ley)

📋 **Permisos sin goce de sueldo**
- Asuntos personales
- Capacitación o estudios

Para solicitar un permiso:
1. Notifica a tu jefe directo y HRBP con al menos 3 días de anticipación
2. Completa el formulario de solicitud en el portal
3. Adjunta documentación de soporte si aplica`,

  seguro: `**Seguro Médico**

Como colaborador tienes derecho a:

🏥 **Seguro de Gastos Médicos Mayores**
- Suma asegurada según plan de tu UDN
- Cubre: hospitalización, cirugías, maternidad, emergencias
- Red médica de hospitales y clínicas

🦷 **Seguro Dental** (aplica según UDN)
- Consultas, limpiezas, endodoncias
- Red de dentistas afiliados

Para hacer uso de tu seguro:
1. Contacta a tu HRBP para obtener tu póliza
2. Llama al número de emergencias indicado en tu carnet
3. Solicita carta de autorización antes de cualquier tratamiento

¿Necesitas información sobre algún trámite específico del seguro?`,

  reglamento: `**Reglamento Interno de Trabajo**

Puntos principales del reglamento:

⏰ **Horarios**
- El horario de trabajo varía por UDN
- Consúltalo con tu jefe directo

👔 **Código de vestimenta**
- Casual de negocios (varía por UDN)

📱 **Uso de dispositivos**
- Uso responsable de herramientas de trabajo

🚫 **Prohibiciones**
- Acoso laboral o sexual
- Discriminación
- Uso de substancias en horario laboral

Para obtener el reglamento completo:
1. Accede al portal de UPAX
2. Busca en la sección "Documentos Oficiales"
3. O solicítalo directamente a tu HRBP`,

  default: `Hola, soy tu asistente de Capital Humano de Grupo UPAX 🤖

Puedo ayudarte con información sobre:
- 🏖️ **Vacaciones**: Días disponibles y cómo solicitarlos
- 💰 **Nómina**: Recibos y fechas de pago
- 📄 **Constancias**: Laborales y otros documentos
- 💊 **Beneficios**: Seguros, vales y más
- 📋 **Permisos**: Ausencias y licencias
- 📚 **Reglamento**: Políticas internas

También puedes usar los botones de acceso rápido o escribirme directamente tu pregunta.

¿En qué te puedo ayudar hoy?`,
};

function detectCategory(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("vacacion") || lower.includes("descanso") || lower.includes("días libre")) return "vacaciones";
  if (lower.includes("nómin") || lower.includes("nomina") || lower.includes("sueldo") || lower.includes("pago") || lower.includes("recibo")) return "nomina";
  if (lower.includes("constanci") || lower.includes("carta") || lower.includes("documento")) return "constancia";
  if (lower.includes("beneficio") || lower.includes("prestacion") || lower.includes("vale") || lower.includes("fondo")) return "beneficios";
  if (lower.includes("permiso") || lower.includes("ausencia") || lower.includes("licencia") || lower.includes("baja")) return "permisos";
  if (lower.includes("seguro") || lower.includes("médico") || lower.includes("medico") || lower.includes("dental") || lower.includes("salud")) return "seguro";
  if (lower.includes("reglamento") || lower.includes("política") || lower.includes("politica") || lower.includes("norma")) return "reglamento";
  return "default";
}

function generateResponse(message: string, category?: string | null): { content: string; category: string } {
  const detectedCategory = category || detectCategory(message);
  const content = HR_KNOWLEDGE_BASE[detectedCategory] || HR_KNOWLEDGE_BASE.default;
  return { content, category: detectedCategory };
}

router.post("/chat/message", async (req, res) => {
  if (!req.session.employeeId) {
    res.status(401).json({ error: "unauthorized", message: "No has iniciado sesión" });
    return;
  }

  const { message, category } = req.body;

  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "bad_request", message: "El mensaje es requerido" });
    return;
  }

  try {
    const [userMsg] = await db
      .insert(chatMessagesTable)
      .values({
        employeeId: req.session.employeeId,
        role: "user",
        content: message,
        category: category || null,
      })
      .returning();

    const { content: responseContent, category: responseCategory } = generateResponse(message, category);

    const [assistantMsg] = await db
      .insert(chatMessagesTable)
      .values({
        employeeId: req.session.employeeId,
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
  if (!req.session.employeeId) {
    res.status(401).json({ error: "unauthorized", message: "No has iniciado sesión" });
    return;
  }

  try {
    const messages = await db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.employeeId, req.session.employeeId))
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
