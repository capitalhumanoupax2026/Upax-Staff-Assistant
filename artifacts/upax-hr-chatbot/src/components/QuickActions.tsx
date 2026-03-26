import React from "react";
import { motion } from "framer-motion";
import { 
  Palmtree, 
  Receipt, 
  FileText, 
  BookOpen, 
  Clock, 
  UserMinus, 
  Gift, 
  HeartPulse, 
  Scale, 
  MessageSquare
} from "lucide-react";

interface QuickActionsProps {
  onActionClick: (text: string, category: string) => void;
}

const actions = [
  { icon: Palmtree, label: "Mis Vacaciones", category: "vacaciones" },
  { icon: Receipt, label: "Recibo de Nómina", category: "nómina" },
  { icon: FileText, label: "Constancia Laboral", category: "constancias" },
  { icon: BookOpen, label: "Manual de Procesos", category: "procesos" },
  { icon: HeartPulse, label: "Seguro Médico", category: "seguros" },
  { icon: Gift, label: "Beneficios UPAX", category: "beneficios" },
  { icon: Clock, label: "Permiso de Ausencia", category: "permisos" },
  { icon: Scale, label: "Reglamento Interno", category: "reglamento" },
  { icon: MessageSquare, label: "Contactar a mi HRBP", category: "general" },
];

export function QuickActions({ onActionClick }: QuickActionsProps) {
  return (
    <div className="w-full overflow-x-auto hide-scrollbar pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex gap-3 w-max">
        {actions.map((action, i) => (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={action.label}
            onClick={() => onActionClick(`Quiero consultar información sobre: ${action.label}`, action.category)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-white/5 hover:border-[var(--dyn-accent)] hover:bg-[var(--dyn-accent-transparent)] transition-all whitespace-nowrap text-sm font-medium text-foreground/80 hover:text-foreground active:scale-95 group"
          >
            <action.icon className="w-4 h-4 text-[var(--dyn-accent)] opacity-70 group-hover:opacity-100 transition-opacity" />
            {action.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
