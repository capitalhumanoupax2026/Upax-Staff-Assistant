import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface QuickActionsProps {
  onActionClick: (category: string) => void;
  activeCategory?: string | null;
}

const actions = [
  {
    emoji: "🏖️",
    label: "Vacaciones",
    category: "vacaciones",
    gradient: "linear-gradient(135deg, #f97316, #fb923c)",
    glow: "rgba(249,115,22,0.35)",
    bg: "rgba(249,115,22,0.08)",
  },
  {
    emoji: "💰",
    label: "Nómina & IMSS",
    category: "nomina",
    gradient: "linear-gradient(135deg, #10b981, #34d399)",
    glow: "rgba(16,185,129,0.35)",
    bg: "rgba(16,185,129,0.08)",
  },
  {
    emoji: "📄",
    label: "Constancias",
    category: "constancias",
    gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)",
    glow: "rgba(59,130,246,0.35)",
    bg: "rgba(59,130,246,0.08)",
  },
  {
    emoji: "🏥",
    label: "Seguro SGMM",
    category: "seguros",
    gradient: "linear-gradient(135deg, #e11d48, #fb7185)",
    glow: "rgba(225,29,72,0.35)",
    bg: "rgba(225,29,72,0.08)",
  },
  {
    emoji: "🎁",
    label: "Beneficios",
    category: "beneficios",
    gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
    glow: "rgba(139,92,246,0.35)",
    bg: "rgba(139,92,246,0.08)",
  },
];

export function QuickActions({ onActionClick, activeCategory }: QuickActionsProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="w-full overflow-x-auto hide-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
      <motion.div
        className="flex gap-2 w-max"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ staggerChildren: 0.07, delayChildren: 0.1 }}
      >
        {actions.map((action, i) => {
          const isActive = activeCategory === action.category;
          const isHovered = hoveredIdx === i;

          return (
            <motion.button
              key={action.category}
              initial={{ opacity: 0, y: 10, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 20 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => onActionClick(action.category)}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="relative group flex items-center gap-2 px-4 py-2.5 rounded-2xl border whitespace-nowrap text-sm font-semibold transition-colors overflow-hidden"
              style={{
                background: isActive
                  ? action.gradient
                  : isHovered
                  ? action.bg
                  : "rgba(255,255,255,0.85)",
                borderColor: isActive
                  ? "transparent"
                  : isHovered
                  ? action.glow.replace("0.35", "0.4")
                  : "rgba(0,0,0,0.08)",
                color: isActive ? "white" : isHovered ? action.gradient.match(/#[0-9a-f]{6}/i)?.[0] || "#374151" : "#374151",
                backdropFilter: "blur(8px)",
                boxShadow: isActive
                  ? `0 6px 20px ${action.glow}, 0 2px 6px rgba(0,0,0,0.1)`
                  : isHovered
                  ? `0 4px 14px ${action.glow}`
                  : `0 1px 4px rgba(0,0,0,0.05)`,
              }}
            >
              {/* Shimmer on active */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)" }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
                />
              )}

              {/* Emoji with bounce on hover */}
              <motion.span
                className="text-base leading-none relative z-10 flex-shrink-0"
                animate={isHovered || isActive ? { y: [0, -4, 0], rotate: [0, -8, 8, 0] } : { y: 0, rotate: 0 }}
                transition={isHovered || isActive ? { duration: 0.5, ease: "easeOut" } : {}}
              >
                {action.emoji}
              </motion.span>

              <span className="relative z-10">{action.label}</span>

              {/* Active dot */}
              {isActive && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative z-10 w-1.5 h-1.5 rounded-full bg-white/70 ml-0.5"
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
