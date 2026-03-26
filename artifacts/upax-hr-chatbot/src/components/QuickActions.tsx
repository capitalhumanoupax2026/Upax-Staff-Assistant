import React from "react";
import { motion } from "framer-motion";
import {
  Palmtree,
  Receipt,
  FileText,
  BookOpen,
  Clock,
  Gift,
  HeartPulse,
  Scale,
  MessageSquare
} from "lucide-react";

interface QuickActionsProps {
  onActionClick: (text: string, category: string) => void;
}

const actions = [
  { icon: Palmtree,     label: "Mis Vacaciones",      category: "vacaciones" },
  { icon: Receipt,      label: "Recibo de Nómina",     category: "nomina" },
  { icon: FileText,     label: "Constancia Laboral",   category: "constancias" },
  { icon: BookOpen,     label: "Manual de Procesos",   category: "default" },
  { icon: HeartPulse,   label: "Seguro Médico",        category: "seguros" },
  { icon: Gift,         label: "Beneficios UPAX",      category: "beneficios" },
  { icon: Clock,        label: "Permiso de Ausencia",  category: "permisos" },
  { icon: Scale,        label: "Reglamento Interno",   category: "reglamento" },
  { icon: MessageSquare,label: "Contactar a mi HRBP",  category: "general" },
];

export function QuickActions({ onActionClick }: QuickActionsProps) {
  return (
    <div className="w-full overflow-x-auto hide-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex gap-2 w-max">
        {actions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onActionClick(`Quiero consultar información sobre: ${action.label}`, action.category)}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:border-[var(--dyn-accent)] hover:bg-[var(--dyn-accent-light,#fff8f5)] transition-all whitespace-nowrap text-sm font-medium text-gray-600 hover:text-gray-900 active:scale-95 shadow-sm"
          >
            <action.icon className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: "var(--dyn-accent)" }} />
            {action.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
