import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight } from "lucide-react";

export interface SubQuestion {
  label: string;
  message: string;
}

export const CATEGORY_MENUS: Record<string, { title: string; questions: SubQuestion[] }> = {
  vacaciones: {
    title: "🏖️ ¿Qué quieres saber sobre tus vacaciones?",
    questions: [
      { label: "📅 ¿Cuántos días me corresponden?", message: "¿Cuántos días de vacaciones me corresponden al año?" },
      { label: "📋 ¿Cómo solicito mis vacaciones?", message: "¿Cuál es el proceso para solicitar mis vacaciones?" },
      { label: "💸 ¿Qué es la prima vacacional?", message: "¿Qué es la Prima Vacacional?" },
    ],
  },
  nomina: {
    title: "💰 ¿Qué quieres saber sobre nómina o IMSS?",
    questions: [
      { label: "💵 Salario Neto vs. Salario Bruto", message: "¿Qué es el Salario Neto vs. Salario Bruto?" },
      { label: "🧾 ¿Cómo solicito mi recibo de nómina?", message: "¿Como solicito mi recibo de nómina?" },
      { label: "🏠 ¿Qué es el INFONAVIT?", message: "¿Qué es el INFONAVIT / Crédito a la vivienda?" },
      { label: "🏥 ¿Qué es una incapacidad médica?", message: "¿Qué es una incapacidad médica?" },
      { label: "😤 Me descontaron por incapacidad", message: "¿Por qué me descontaron días si entregué mi incapacidad?" },
      { label: "🤔 ¿Quién paga mi incapacidad?", message: "¿Quién me paga mi incapacidad: la empresa o el IMSS/Seguro?" },
    ],
  },
  constancias: {
    title: "📄 ¿Qué constancia necesitas?",
    questions: [
      { label: "📝 Constancia laboral", message: "¿Como solicito mi constancia laboral?" },
      { label: "🏛️ Constancia de ingresos, carta de embajada o guardería", message: "¿Como solicito mi constancia de ingresos, carta de embajada, carta para guardería o carta patronal?" },
    ],
  },
  seguros: {
    title: "🏥 ¿Qué quieres saber de tu seguro SGMM?",
    questions: [
      { label: "🔍 ¿Cómo conozco mis beneficios de SGMM?", message: "Como conozco mis beneficios de SGMM" },
      { label: "🪪 ¿Cómo consulto mi número de póliza?", message: "¿Como consulto mi número de póliza?" },
    ],
  },
  beneficios: {
    title: "🎁 ¿Qué quieres saber de tus beneficios?",
    questions: [
      { label: "👀 ¿Cómo puedo ver mis beneficios?", message: "¿Como puedo ver mis beneficios?" },
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
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 340, damping: 26 }}
          className="w-full rounded-2xl overflow-hidden mb-2"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(16px)",
            border: `1px solid color-mix(in srgb, ${accentColor} 25%, #e5e7eb)`,
            boxShadow: `0 8px 32px ${accentColor}18, 0 2px 8px rgba(0,0,0,0.06)`,
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${accentColor} 8%, white), color-mix(in srgb, ${accentColor} 3%, white))` }}
          >
            {/* Animated accent bar */}
            <motion.div
              className="absolute bottom-0 left-0 h-0.5"
              style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            <p className="text-sm font-bold text-gray-800">{menu.title}</p>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDismiss}
              className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          {/* Items */}
          <div className="p-3 flex flex-wrap gap-2">
            {menu.questions.map((q, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.055, type: "spring", stiffness: 320, damping: 22 }}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onSelect(q.message, category!)}
                className="group flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all relative overflow-hidden"
                style={{
                  borderColor: `color-mix(in srgb, ${accentColor} 30%, #e5e7eb)`,
                  color: accentColor,
                  background: `color-mix(in srgb, ${accentColor} 6%, white)`,
                }}
              >
                {/* Hover fill */}
                <motion.div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `color-mix(in srgb, ${accentColor} 14%, white)` }}
                />
                <span className="relative z-10">{q.label}</span>
                <motion.div
                  className="relative z-10 opacity-0 group-hover:opacity-100 -ml-0.5 transition-opacity"
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <ChevronRight className="w-3 h-3" />
                </motion.div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
