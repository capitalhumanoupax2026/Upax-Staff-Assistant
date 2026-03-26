import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HRBPAvatarProps {
  photoUrl?: string;
  name: string;
  accentColor: string;
  isTalking?: boolean;
  size?: "sm" | "md" | "lg";
}

export function HRBPAvatar({ photoUrl, name, accentColor, isTalking = false, size = "md" }: HRBPAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const initials = name?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "HR";

  const dim = size === "sm" ? 32 : size === "lg" ? 96 : 60;
  const fontSize = size === "sm" ? "text-xs" : size === "lg" ? "text-2xl" : "text-base";
  const barCount = 5;

  return (
    <div className="relative flex items-center justify-center" style={{ width: dim + 32, height: dim + 32 }}>
      {/* Pulsing rings when talking */}
      <AnimatePresence>
        {isTalking && (
          <>
            <motion.div
              key="ring1"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.35, opacity: 0 }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: dim,
                height: dim,
                border: `2px solid ${accentColor}`,
              }}
            />
            <motion.div
              key="ring2"
              initial={{ scale: 1, opacity: 0.3 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 1.1, repeat: Infinity, delay: 0.3, ease: "easeOut" }}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: dim,
                height: dim,
                border: `1.5px solid ${accentColor}`,
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Avatar circle */}
      <motion.div
        animate={isTalking ? { scale: [1, 1.03, 1] } : { scale: 1 }}
        transition={isTalking ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" } : {}}
        className="relative rounded-full overflow-hidden border-2 flex-shrink-0"
        style={{
          width: dim,
          height: dim,
          borderColor: isTalking ? accentColor : `color-mix(in srgb, ${accentColor} 40%, #e5e7eb)`,
          boxShadow: isTalking ? `0 0 0 3px color-mix(in srgb, ${accentColor} 20%, transparent)` : "none",
          transition: "box-shadow 0.3s, border-color 0.3s",
        }}
      >
        {photoUrl && !imgError ? (
          <img
            src={photoUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center font-bold text-white ${fontSize}`}
            style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${accentColor} 80%, #000) 0%, ${accentColor} 100%)` }}
          >
            {initials}
          </div>
        )}
      </motion.div>

      {/* Soundwave bars — bottom center */}
      <AnimatePresence>
        {isTalking && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute flex items-end gap-[2px]"
            style={{ bottom: 0, left: "50%", transform: "translateX(-50%)" }}
          >
            {Array.from({ length: barCount }).map((_, i) => (
              <motion.span
                key={i}
                className="rounded-full"
                style={{ width: 3, background: accentColor }}
                animate={{ height: [4, 10 + Math.random() * 8, 4] }}
                transition={{
                  duration: 0.45,
                  repeat: Infinity,
                  delay: i * 0.08,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
