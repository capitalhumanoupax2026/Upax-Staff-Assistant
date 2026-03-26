import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import type { MockEmployee } from "@/lib/mock-data";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: MockEmployee;
}

export function WelcomeModal({ isOpen, onClose, employee }: WelcomeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.25 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl pointer-events-auto overflow-hidden"
              style={{ boxShadow: `0 32px 80px -16px color-mix(in srgb, ${employee.accentColor} 30%, rgba(0,0,0,0.2))` }}
            >
              {/* Top accent band */}
              <div
                className="h-1.5 w-full"
                style={{ background: `linear-gradient(90deg, color-mix(in srgb, ${employee.accentColor} 70%, #C2384E) 0%, ${employee.accentColor} 100%)` }}
              />

              {/* Header with UDN logo */}
              <div
                className="px-8 pt-8 pb-6 text-center relative"
                style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${employee.accentColor} 6%, white) 0%, white 100%)` }}
              >
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* UDN Logo */}
                <div className="relative inline-block mb-5">
                  <div
                    className="absolute inset-[-12px] rounded-3xl blur-2xl opacity-20"
                    style={{ background: employee.accentColor }}
                  />
                  <div
                    className="relative w-20 h-20 rounded-2xl flex items-center justify-center border shadow-lg"
                    style={{
                      background: "linear-gradient(145deg, #ffffff 60%, color-mix(in srgb, var(--dyn-accent) 10%, white) 100%)",
                      borderColor: `color-mix(in srgb, ${employee.accentColor} 25%, transparent)`,
                    }}
                  >
                    <img
                      src={`${import.meta.env.BASE_URL}${employee.logoUrl.replace(/^\//, "")}`}
                      alt={employee.businessUnit}
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                </div>

                {/* AI badge */}
                <div className="flex justify-center mb-4">
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: `color-mix(in srgb, ${employee.accentColor} 10%, white)`, color: employee.accentColor }}
                  >
                    <Sparkles className="w-3 h-3" />
                    Asistente HR · {employee.businessUnit}
                  </span>
                </div>

                <h2 className="text-2xl font-display font-bold text-gray-900 mb-1">
                  ¡Hola, {employee.name.split(" ")[0]}!
                </h2>
                <p className="text-gray-500 text-sm">
                  Tu experiencia de Capital Humano en{" "}
                  <span className="font-semibold" style={{ color: employee.accentColor }}>
                    {employee.businessUnit}
                  </span>{" "}
                  ha llegado.
                </p>
              </div>

              {/* HRBP message */}
              <div className="px-8 pb-8">
                <div
                  className="rounded-2xl p-5 mb-6 relative overflow-hidden border"
                  style={{
                    background: `color-mix(in srgb, ${employee.accentColor} 4%, white)`,
                    borderColor: `color-mix(in srgb, ${employee.accentColor} 20%, transparent)`,
                  }}
                >
                  <div
                    className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
                    style={{ background: employee.accentColor }}
                  />
                  <div className="pl-2">
                    <p className="text-xs font-semibold mb-1" style={{ color: employee.accentColor }}>
                      Mensaje de tu HRBP — {employee.hrbpName}
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed italic">
                      "He configurado este asistente para ayudarte de manera instantánea con tus dudas sobre vacaciones, recibos de nómina, beneficios y procesos internos. ¡Explóralo!"
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full h-12 rounded-2xl text-white font-semibold text-base transition-all hover:opacity-90 active:scale-[0.98] shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, color-mix(in srgb, ${employee.accentColor} 80%, #C2384E) 0%, ${employee.accentColor} 100%)`,
                    boxShadow: `0 8px 24px -6px color-mix(in srgb, ${employee.accentColor} 50%, transparent)`,
                  }}
                >
                  Comenzar ahora
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
