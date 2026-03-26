import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, User } from "lucide-react";
import type { MockEmployee } from "@/lib/mock-data";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: MockEmployee;
}

export function WelcomeModal({ isOpen, onClose, employee }: WelcomeModalProps) {
  const [imgError, setImgError] = useState(false);
  const firstName = employee.name?.split(" ")[0] || employee.name || "¡Hola!";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: "spring", duration: 0.45, bounce: 0.2 }}
              className="w-full max-w-sm bg-white rounded-3xl shadow-2xl pointer-events-auto overflow-hidden"
              style={{ boxShadow: `0 32px 80px -16px color-mix(in srgb, ${employee.accentColor} 35%, rgba(0,0,0,0.2))` }}
            >
              {/* Accent top band */}
              <div
                className="h-1 w-full"
                style={{ background: `linear-gradient(90deg, color-mix(in srgb, ${employee.accentColor} 60%, #C2384E) 0%, ${employee.accentColor} 100%)` }}
              />

              {/* ── SECCIÓN 1: UDN Logo + saludo ── */}
              <div
                className="px-6 pt-6 pb-4 text-center relative"
                style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${employee.accentColor} 7%, white) 0%, white 100%)` }}
              >
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Logo UDN */}
                <div className="relative inline-block mb-3">
                  <div
                    className="absolute inset-[-10px] rounded-2xl blur-xl opacity-20"
                    style={{ background: employee.accentColor }}
                  />
                  <div
                    className="relative w-14 h-14 rounded-xl flex items-center justify-center border shadow-md"
                    style={{
                      background: "linear-gradient(145deg, #ffffff 60%, color-mix(in srgb, var(--dyn-accent) 10%, white) 100%)",
                      borderColor: `color-mix(in srgb, ${employee.accentColor} 25%, transparent)`,
                    }}
                  >
                    <img
                      src={`${import.meta.env.BASE_URL}${employee.logoUrl?.replace(/^\//, "")}`}
                      alt={employee.businessUnit}
                      className="w-9 h-9 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                </div>

                <div className="flex justify-center mb-2">
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: `color-mix(in srgb, ${employee.accentColor} 10%, white)`, color: employee.accentColor }}
                  >
                    <Sparkles className="w-3 h-3" />
                    Asistente HR · {employee.businessUnit}
                  </span>
                </div>

                <h2 className="text-xl font-display font-bold text-gray-900 mb-0.5">
                  ¡Hola, {firstName}!
                </h2>
                <p className="text-xs text-gray-500">
                  Tu asistente de Capital Humano en{" "}
                  <span className="font-semibold" style={{ color: employee.accentColor }}>
                    {employee.businessUnit}
                  </span>{" "}
                  está listo.
                </p>
              </div>

              {/* ── SECCIÓN 2: HRBP protagonista ── */}
              <div className="px-6 pb-6">
                <div
                  className="rounded-2xl overflow-hidden border"
                  style={{ borderColor: `color-mix(in srgb, ${employee.accentColor} 20%, #e5e7eb)` }}
                >
                  {/* Header del HRBP con foto */}
                  <div
                    className="px-4 py-3 flex items-center gap-3"
                    style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${employee.accentColor} 12%, white) 0%, color-mix(in srgb, ${employee.accentColor} 5%, white) 100%)` }}
                  >
                    {/* Foto HRBP */}
                    <div
                      className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden border-2"
                      style={{ borderColor: employee.accentColor }}
                    >
                      {employee.hrbpPhoto && !imgError ? (
                        <img
                          src={employee.hrbpPhoto}
                          alt={employee.hrbpName}
                          className="w-full h-full object-cover"
                          onError={() => setImgError(true)}
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-white text-lg font-bold"
                          style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${employee.accentColor} 80%, #000) 0%, ${employee.accentColor} 100%)` }}
                        >
                          {employee.hrbpName?.charAt(0) || <User className="w-5 h-5" />}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Tu HRBP</p>
                      <p className="font-bold text-sm text-gray-900 truncate">{employee.hrbpName || "Sin asignar"}</p>
                      <p className="text-[11px]" style={{ color: employee.accentColor }}>Capital Humano · {employee.businessUnit}</p>
                    </div>
                  </div>

                  {/* Mensaje del HRBP */}
                  <div className="px-4 py-3 bg-white">
                    <div
                      className="w-full h-[2px] rounded mb-3"
                      style={{ background: `linear-gradient(90deg, ${employee.accentColor} 0%, transparent 100%)` }}
                    />
                    <p className="text-xs text-gray-500 leading-relaxed italic">
                      "He configurado este asistente para ayudarte de manera instantánea con tus dudas sobre vacaciones, recibos de nómina, beneficios y procesos internos. ¡Explóralo!"
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={onClose}
                  className="w-full h-11 mt-4 rounded-2xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, color-mix(in srgb, ${employee.accentColor} 75%, #C2384E) 0%, ${employee.accentColor} 100%)`,
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
