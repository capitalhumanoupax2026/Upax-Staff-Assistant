import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface SubQuestion {
  label: string;
  message: string;
}

export const CATEGORY_MENUS: Record<string, { title: string; questions: SubQuestion[] }> = {
  vacaciones: {
    title: "¿Qué quieres saber de tus vacaciones?",
    questions: [
      { label: "¿Cuántos días me quedan?",           message: "¿Cuántos días de vacaciones me quedan disponibles?" },
      { label: "¿Cuándo cumplo el año?",              message: "¿Cuándo se cumple mi aniversario laboral para renovar vacaciones?" },
      { label: "¿Cuándo se renuevan mis vacaciones?", message: "¿Cuándo se renuevan mis días de vacaciones?" },
      { label: "¿Cómo solicito mis vacaciones?",      message: "¿Cuál es el proceso para solicitar mis vacaciones?" },
      { label: "¿Qué pasa si no uso mis días?",       message: "¿Qué sucede si no uso mis días de vacaciones?" },
      { label: "¿Puedo fraccionar mis vacaciones?",   message: "¿Puedo tomar mis vacaciones en partes?" },
    ],
  },
  nomina: {
    title: "¿Qué quieres saber de tu nómina?",
    questions: [
      { label: "¿Cuándo me depositan?",              message: "¿Cuáles son mis fechas de pago de nómina?" },
      { label: "¿Por qué me descontaron?",           message: "¿Por qué hay descuentos en mi nómina?" },
      { label: "¿Dónde descargo mi recibo?",         message: "¿Cómo descargo mi recibo de nómina?" },
      { label: "¿Cómo se calcula mi quincena?",      message: "¿Cómo se calcula mi pago quincenal?" },
      { label: "¿Tengo error en mi nómina?",         message: "¿Qué hago si encuentro un error en mi nómina?" },
      { label: "¿Qué es el ISR?",                    message: "¿Cómo se calcula el ISR en mi nómina?" },
    ],
  },
  constancias: {
    title: "¿Qué tipo de constancia necesitas?",
    questions: [
      { label: "Constancia de empleo simple",        message: "Necesito una constancia de empleo simple" },
      { label: "Constancia con sueldo",              message: "Necesito una constancia de empleo con sueldo" },
      { label: "Para crédito Infonavit / Fonacot",   message: "Necesito una constancia para trámite de crédito Infonavit o Fonacot" },
      { label: "¿Cuánto tiempo tarda?",              message: "¿Cuánto tiempo tarda en emitirse una constancia laboral?" },
      { label: "Carta de recomendación",             message: "¿Cómo solicito una carta de recomendación?" },
    ],
  },
  beneficios: {
    title: "¿Sobre qué beneficio tienes dudas?",
    questions: [
      { label: "¿Qué beneficios tengo?",            message: "¿Cuáles son todos mis beneficios como colaborador?" },
      { label: "Fondo de ahorro",                    message: "¿Cómo funciona el fondo de ahorro?" },
      { label: "Vales de despensa",                  message: "¿Tengo vales de despensa? ¿Cómo los uso?" },
      { label: "Seguro de vida",                     message: "¿Tengo seguro de vida? ¿Qué cubre?" },
      { label: "Plataformas de bienestar",           message: "¿Qué plataformas de bienestar tengo disponibles?" },
      { label: "Capacitación y desarrollo",          message: "¿Qué opciones de capacitación y desarrollo tengo?" },
    ],
  },
  permisos: {
    title: "¿Qué quieres saber sobre permisos?",
    questions: [
      { label: "¿Cómo pido un permiso?",            message: "¿Cuál es el proceso para solicitar un permiso de ausencia?" },
      { label: "Permiso por enfermedad",             message: "¿Cómo registro una incapacidad o permiso por enfermedad?" },
      { label: "Permiso por maternidad/paternidad",  message: "¿Cuántos días tengo de licencia por maternidad o paternidad?" },
      { label: "¿Se descuenta de vacaciones?",       message: "¿Los permisos se descuentan de mis días de vacaciones?" },
      { label: "Permiso sin goce de sueldo",         message: "¿Puedo pedir un permiso sin goce de sueldo? ¿Cómo?" },
    ],
  },
  seguros: {
    title: "¿Qué quieres saber de tu seguro?",
    questions: [
      { label: "¿Qué cubre mi seguro médico?",      message: "¿Qué cubre mi seguro de gastos médicos mayores?" },
      { label: "¿Cómo uso el seguro?",              message: "¿Cómo uso mi seguro médico en caso de urgencia?" },
      { label: "¿Tengo seguro dental?",             message: "¿Mi seguro incluye cobertura dental?" },
      { label: "¿Puedo asegurar a mi familia?",     message: "¿Puedo incluir a familiares en mi seguro médico?" },
      { label: "Médico de red o fuera de red",      message: "¿Cómo funciona la red de médicos y hospitales de mi seguro?" },
    ],
  },
  reglamento: {
    title: "¿Qué quieres consultar del reglamento?",
    questions: [
      { label: "¿Dónde está el reglamento?",        message: "¿Dónde puedo consultar el reglamento interno de la empresa?" },
      { label: "¿Cuál es el horario de trabajo?",   message: "¿Cuál es mi horario de trabajo oficial?" },
      { label: "Política de home office",           message: "¿Cuál es la política de trabajo desde casa?" },
      { label: "¿Qué es una falta justificada?",    message: "¿Cuándo se considera una falta como justificada?" },
      { label: "Código de vestimenta",              message: "¿Existe código de vestimenta en mi empresa?" },
    ],
  },
  general: {
    title: "¿En qué te puedo ayudar?",
    questions: [
      { label: "Contactar a mi HRBP",               message: "¿Cuál es el contacto de mi HRBP?" },
      { label: "¿Cómo escalo un caso?",             message: "¿Cuál es el proceso para escalar una situación a Capital Humano?" },
      { label: "Duda sobre mi contrato",             message: "Tengo una duda sobre mi contrato de trabajo" },
      { label: "Proceso de baja",                   message: "¿Cuál es el proceso si quiero renunciar o dar de baja?" },
      { label: "Queja o sugerencia",                message: "¿Cómo presento una queja o sugerencia formalmente?" },
    ],
  },
  default: {
    title: "¿En qué te puedo ayudar?",
    questions: [
      { label: "Mis vacaciones",                    message: "¿Cuántos días de vacaciones tengo disponibles?" },
      { label: "Mi nómina",                         message: "¿Cuándo es mi próximo depósito de nómina?" },
      { label: "Mis beneficios",                    message: "¿Cuáles son mis beneficios como colaborador?" },
      { label: "Contactar a mi HRBP",               message: "¿Cuál es el contacto de mi HRBP?" },
    ],
  },
};

interface CategoryMenuProps {
  category: string | null;
  accentColor: string;
  onSelect: (message: string, category: string) => void;
  onDismiss: () => void;
}

export function CategoryMenu({ category, accentColor, onSelect, onDismiss }: CategoryMenuProps) {
  const menu = category ? (CATEGORY_MENUS[category] || CATEGORY_MENUS.default) : null;

  return (
    <AnimatePresence>
      {menu && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
          className="w-full rounded-2xl border overflow-hidden shadow-lg mb-2"
          style={{
            background: `linear-gradient(135deg, color-mix(in srgb, ${accentColor} 5%, white) 0%, white 100%)`,
            borderColor: `color-mix(in srgb, ${accentColor} 25%, #e5e7eb)`,
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-2.5 border-b"
            style={{ borderColor: `color-mix(in srgb, ${accentColor} 15%, #f3f4f6)` }}
          >
            <p className="text-sm font-semibold text-gray-800">{menu.title}</p>
            <button
              onClick={onDismiss}
              className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sub-questions grid */}
          <div className="p-3 flex flex-wrap gap-2">
            {menu.questions.map((q, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => onSelect(q.message, category!)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all hover:shadow-sm active:scale-95"
                style={{
                  borderColor: `color-mix(in srgb, ${accentColor} 30%, #e5e7eb)`,
                  color: accentColor,
                  background: `color-mix(in srgb, ${accentColor} 6%, white)`,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = `color-mix(in srgb, ${accentColor} 15%, white)`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = `color-mix(in srgb, ${accentColor} 6%, white)`;
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: accentColor }}
                />
                {q.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
