import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import type { MockEmployee } from "@/lib/mock-data";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: MockEmployee;
}

export function WelcomeModal({ isOpen, onClose, employee }: WelcomeModalProps) {
  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="w-full max-w-lg overflow-hidden rounded-3xl glass-panel pointer-events-auto border-t-2"
              style={{ borderTopColor: employee.accentColor, "--dyn-accent": employee.accentColor } as React.CSSProperties}
            >
              <div className="p-8 sm:p-10 text-center flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-full opacity-50 blur-xl" style={{ background: employee.accentColor }}></div>
                  <Avatar
                    src={employee.hrbpPhoto}
                    initials={getInitials(employee.hrbpName)}
                    className="w-24 h-24 sm:w-32 sm:h-32 relative z-10"
                    style={{ borderColor: employee.accentColor, borderWidth: 2, borderStyle: "solid" } as React.CSSProperties}
                  />
                </div>

                <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2">
                  ¡Hola, {employee.name.split(" ")[0]}!
                </h2>

                <p className="text-muted-foreground mb-6 text-lg">
                  Bienvenido a la nueva experiencia de Capital Humano para{" "}
                  <span className="font-semibold" style={{ color: employee.accentColor }}>{employee.businessUnit}</span>.
                </p>

                <div className="bg-black/30 rounded-2xl p-6 mb-8 text-left border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl" style={{ background: employee.accentColor }}></div>
                  <p className="text-sm sm:text-base leading-relaxed italic text-gray-300">
                    "Soy {employee.hrbpName}, tu HRBP. He configurado este asistente impulsado por inteligencia artificial para ayudarte de manera instantánea con tus dudas sobre vacaciones, recibos de nómina, beneficios y procesos internos. ¡Explóralo!"
                  </p>
                </div>

                <Button
                  size="lg"
                  className="w-full sm:w-auto min-w-[200px] text-lg font-semibold rounded-2xl"
                  onClick={onClose}
                >
                  Comenzar
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
