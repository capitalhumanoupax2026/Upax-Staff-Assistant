import React from "react";
import { motion } from "framer-motion";
import { Palmtree, Receipt, FileText, HeartPulse, Gift } from "lucide-react";

interface QuickActionsProps {
  onActionClick: (category: string) => void;
  activeCategory?: string | null;
}

const actions = [
  { icon: Palmtree,   emoji: "🏖️", label: "Vacaciones",        category: "vacaciones" },
  { icon: Receipt,    emoji: "💰", label: "Nómina & IMSS",      category: "nomina" },
  { icon: FileText,   emoji: "📄", label: "Constancias",        category: "constancias" },
  { icon: HeartPulse, emoji: "🏥", label: "Seguro SGMM",        category: "seguros" },
  { icon: Gift,       emoji: "🎁", label: "Beneficios",         category: "beneficios" },
];

export function QuickActions({ onActionClick, activeCategory }: QuickActionsProps) {
  return (
    <div className="w-full overflow-x-auto hide-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex gap-2 w-max">
        {actions.map((action, i) => {
          const isActive = activeCategory === action.category;
          return (
            <motion.button
              key={action.category}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onActionClick(action.category)}
              className="group flex items-center gap-2 px-4 py-2 rounded-xl border transition-all whitespace-nowrap text-sm font-medium active:scale-95 shadow-sm"
              style={{
                background: isActive ? `var(--dyn-accent)` : "white",
                borderColor: isActive ? `var(--dyn-accent)` : "#e5e7eb",
                color: isActive ? "white" : "#4b5563",
              }}
            >
              <span className="text-base leading-none">{action.emoji}</span>
              {action.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
