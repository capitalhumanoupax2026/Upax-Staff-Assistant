import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface SubQuestion {
  label: string;
  message: string;
}

/*
  Los mensajes coinciden EXACTAMENTE con pregunta_texto en hr_responses.
  ID referencia: 2, 8/9, 5 → vacaciones/prestaciones
                 1, 3, 4, 11/17, 6, 7 → nómina/IMSS
                 12, 16 → constancia laboral
                 13, 14 → SGMM y SMMm
                 10/15 → Beneficios
*/
export const CATEGORY_MENUS: Record<string, { title: string; questions: SubQuestion[] }> = {
  vacaciones: {
    title: "🏖️ ¿Qué quieres saber sobre tus vacaciones?",
    questions: [
      {
        label: "📅 ¿Cuántos días me corresponden?",
        message: "¿Cuántos días de vacaciones me corresponden al año?",
      },
      {
        label: "📋 ¿Cómo solicito mis vacaciones?",
        message: "¿Cuál es el proceso para solicitar mis vacaciones?",
      },
      {
        label: "💸 ¿Qué es la prima vacacional?",
        message: "¿Qué es la Prima Vacacional?",
      },
    ],
  },
  nomina: {
    title: "💰 ¿Qué quieres saber sobre nómina o IMSS?",
    questions: [
      {
        label: "💵 Salario Neto vs. Salario Bruto",
        message: "¿Qué es el Salario Neto vs. Salario Bruto?",
      },
      {
        label: "🧾 ¿Cómo solicito mi recibo de nómina?",
        message: "¿Como solicito mi recibo de nómina?",
      },
      {
        label: "🏠 ¿Qué es el INFONAVIT?",
        message: "¿Qué es el INFONAVIT / Crédito a la vivienda?",
      },
      {
        label: "🏥 ¿Qué es una incapacidad médica?",
        message: "¿Qué es una incapacidad médica?",
      },
      {
        label: "😤 Me descontaron por incapacidad",
        message: "¿Por qué me descontaron días si entregué mi incapacidad?",
      },
      {
        label: "🤔 ¿Quién paga mi incapacidad?",
        message: "¿Quién me paga mi incapacidad: la empresa o el IMSS/Seguro?",
      },
    ],
  },
  constancias: {
    title: "📄 ¿Qué constancia necesitas?",
    questions: [
      {
        label: "📝 Constancia laboral",
        message: "¿Como solicito mi constancia laboral?",
      },
      {
        label: "🏛️ Constancia de ingresos, carta de embajada o guardería",
        message: "¿Como solicito mi constancia de ingresos, carta de embajada, carta para guardería o carta patronal?",
      },
    ],
  },
  seguros: {
    title: "🏥 ¿Qué quieres saber de tu seguro SGMM?",
    questions: [
      {
        label: "🔍 ¿Cómo conozco mis beneficios de SGMM?",
        message: "Como conozco mis beneficios de SGMM",
      },
      {
        label: "🪪 ¿Cómo consulto mi número de póliza?",
        message: "¿Como consulto mi número de póliza?",
      },
    ],
  },
  beneficios: {
    title: "🎁 ¿Qué quieres saber de tus beneficios?",
    questions: [
      {
        label: "👀 ¿Cómo puedo ver mis beneficios?",
        message: "¿Como puedo ver mis beneficios?",
      },
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
  const menu = category ? (CATEGORY_MENUS[category] || null) : null;

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

          <div className="p-3 flex flex-wrap gap-2">
            {menu.questions.map((q, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
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
                {q.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
