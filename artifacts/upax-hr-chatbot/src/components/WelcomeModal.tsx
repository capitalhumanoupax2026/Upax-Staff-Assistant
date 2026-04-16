import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Zap, Shield, Star } from "lucide-react";
import type { MockEmployee } from "@/lib/mock-data";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: MockEmployee;
}

// ─── Confetti particle ────────────────────────────────────────────────────────
function ConfettiParticle({ accent, delay, index }: { accent: string; delay: number; index: number }) {
  const colors = [accent, "#f97316", "#8b5cf6", "#10b981", "#3b82f6", "#e11d48"];
  const color = colors[index % colors.length];
  const shapes = ["rounded-full", "rounded-sm rotate-45", "rounded-none rotate-12"];
  const shape = shapes[index % shapes.length];
  const x = (Math.random() - 0.5) * 300;
  const size = 4 + Math.random() * 6;

  return (
    <motion.div
      className={`absolute ${shape} pointer-events-none`}
      style={{ width: size, height: size, background: color, left: "50%", top: "20%" }}
      initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
      animate={{ x, y: 200 + Math.random() * 100, opacity: 0, rotate: Math.random() * 720 - 360 }}
      transition={{ duration: 1.2 + Math.random() * 0.8, delay, ease: "easeOut" }}
    />
  );
}

// ─── Feature chip ─────────────────────────────────────────────────────────────
function FeatureChip({ icon, label, accent, delay }: { icon: React.ReactNode; label: string; accent: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 20 }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
      style={{ background: `color-mix(in srgb, ${accent} 10%, white)`, color: accent, border: `1px solid color-mix(in srgb, ${accent} 25%, transparent)` }}
    >
      {icon}
      {label}
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function WelcomeModal({ isOpen, onClose, employee }: WelcomeModalProps) {
  const [imgError, setImgError] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const firstName = employee.name?.split(" ")[0] || "¡Hola!";
  const accent = employee.accentColor;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShowConfetti(true), 200);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)" }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 30 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="w-full max-w-sm bg-white rounded-3xl shadow-2xl pointer-events-auto overflow-hidden relative"
              style={{ boxShadow: `0 40px 100px -20px ${accent}50, 0 20px 40px rgba(0,0,0,0.2)` }}
            >
              {/* Confetti */}
              <AnimatePresence>
                {showConfetti && Array.from({ length: 20 }).map((_, i) => (
                  <ConfettiParticle key={i} accent={accent} delay={i * 0.04} index={i} />
                ))}
              </AnimatePresence>

              {/* Accent header band */}
              <div className="relative h-1.5 w-full overflow-hidden" style={{ background: `linear-gradient(90deg, ${accent}, color-mix(in srgb, ${accent} 60%, #C2384E), ${accent})` }}>
                <motion.div
                  className="absolute inset-y-0 w-1/3"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)" }}
                  animate={{ x: ["-100%", "400%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
              </div>

              {/* Top section */}
              <div
                className="px-6 pt-6 pb-5 text-center relative"
                style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${accent} 8%, white) 0%, white 100%)` }}
              >
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </motion.button>

                {/* Logo UDN with glow */}
                <motion.div
                  className="relative inline-block mb-4"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <motion.div
                    className="absolute -inset-3 rounded-2xl"
                    style={{ background: accent, filter: "blur(16px)" }}
                    animate={{ opacity: [0.15, 0.35, 0.15] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                  <div
                    className="relative w-16 h-16 rounded-2xl flex items-center justify-center border shadow-xl"
                    style={{
                      background: "white",
                      borderColor: `color-mix(in srgb, ${accent} 30%, transparent)`,
                      boxShadow: `0 8px 24px ${accent}30`,
                    }}
                  >
                    <img
                      src={`${import.meta.env.BASE_URL}${employee.logoUrl?.replace(/^\//, "")}`}
                      alt={employee.businessUnit}
                      className="w-10 h-10 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                  {/* Star burst */}
                  <motion.div
                    className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ boxShadow: "0 2px 8px rgba(251,191,36,0.5)" }}
                  >
                    <Star className="w-2.5 h-2.5 text-white fill-white" />
                  </motion.div>
                </motion.div>

                {/* AI badge */}
                <motion.div
                  className="flex justify-center mb-3"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full"
                    style={{ background: `color-mix(in srgb, ${accent} 10%, white)`, color: accent, border: `1px solid ${accent}30` }}
                  >
                    <motion.div animate={{ rotate: [0, 20, -20, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                      <Sparkles className="w-3 h-3" />
                    </motion.div>
                    Asistente HR · {employee.businessUnit}
                  </span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-2xl font-black text-gray-900 mb-1"
                >
                  ¡Hola, {firstName}! 👋
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="text-xs text-gray-500"
                >
                  Tu asistente de Capital Humano en{" "}
                  <span className="font-bold" style={{ color: accent }}>{employee.businessUnit}</span> está listo.
                </motion.p>

                {/* Feature chips */}
                <motion.div
                  className="flex flex-wrap gap-2 justify-center mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <FeatureChip icon={<Zap className="w-3 h-3" />} label="Respuesta instantánea" accent={accent} delay={0.45} />
                  <FeatureChip icon={<Shield className="w-3 h-3" />} label="Soporte 24/7" accent={accent} delay={0.5} />
                </motion.div>
              </div>

              {/* HRBP section */}
              <div className="px-6 pb-6">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    border: `1px solid color-mix(in srgb, ${accent} 20%, #e5e7eb)`,
                    boxShadow: `0 4px 16px ${accent}14`,
                  }}
                >
                  {/* HRBP header */}
                  <div
                    className="px-4 py-3 flex items-center gap-3"
                    style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 12%, white), color-mix(in srgb, ${accent} 5%, white))` }}
                  >
                    <motion.div
                      className="w-12 h-12 rounded-2xl flex-shrink-0 overflow-hidden border-2 relative"
                      style={{ borderColor: accent, boxShadow: `0 4px 12px ${accent}40` }}
                      animate={{ boxShadow: [`0 4px 12px ${accent}30`, `0 4px 20px ${accent}55`, `0 4px 12px ${accent}30`] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      {employee.hrbpPhoto && !imgError ? (
                        <img src={employee.hrbpPhoto} alt={employee.hrbpName} className="w-full h-full object-cover" onError={() => setImgError(true)} />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-white text-lg font-black"
                          style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 85%, #000), ${accent})` }}
                        >
                          {employee.hrbpName?.charAt(0) || "H"}
                        </div>
                      )}
                    </motion.div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tu HRBP</p>
                      <p className="font-black text-sm text-gray-900 truncate">{employee.hrbpName || "Capital Humano"}</p>
                      <p className="text-[11px] font-semibold" style={{ color: accent }}>Capital Humano · {employee.businessUnit}</p>
                    </div>

                    {/* Online indicator */}
                    <div className="ml-auto flex-shrink-0">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600">Online</span>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="px-4 py-3 bg-white relative">
                    <motion.div
                      className="absolute top-0 left-0 right-0 h-0.5"
                      style={{ background: `linear-gradient(90deg, ${accent}80, transparent)` }}
                    />
                    <p className="text-xs text-gray-500 leading-relaxed italic">
                      "He configurado este asistente para ayudarte de manera instantánea con tus dudas sobre vacaciones, recibos de nómina, beneficios y procesos internos. ¡Explóralo!"
                    </p>
                  </div>
                </motion.div>

                {/* CTA button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  className="w-full h-12 mt-4 rounded-2xl text-white font-black text-sm relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 80%, #C2384E), ${accent})`,
                    boxShadow: `0 8px 24px -4px ${accent}60`,
                  }}
                >
                  <motion.div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)" }}
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.5 }}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Comenzar ahora
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
