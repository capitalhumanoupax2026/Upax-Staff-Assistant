import React from "react";
import { cn, formatTime } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ChatMessage } from "@/hooks/use-chat";
import type { MockEmployee } from "@/lib/mock-data";

interface ChatMessageProps {
  message: ChatMessage;
  employee: MockEmployee;
}

export function ChatMessageBubble({ message, employee }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("flex w-full mb-4", isUser ? "justify-end" : "justify-start")}
    >
      <div className={cn("flex max-w-[82%] sm:max-w-[70%] gap-3", isUser ? "flex-row-reverse" : "flex-row")}>

        {/* Avatar dot */}
        <div className="mt-auto mb-1 hidden sm:block">
          {isUser ? (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
              style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${employee.accentColor} 80%, #000) 0%, ${employee.accentColor} 100%)` }}
            >
              {employee.name.charAt(0)}
            </div>
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center border shadow-sm"
              style={{
                background: "linear-gradient(135deg, #ffffff 60%, color-mix(in srgb, var(--dyn-accent) 10%, white) 100%)",
                borderColor: `color-mix(in srgb, ${employee.accentColor} 30%, transparent)`,
              }}
            >
              <img
                src={`${import.meta.env.BASE_URL}${employee.logoUrl.replace(/^\//, "")}`}
                alt={employee.businessUnit}
                className="w-4 h-4 object-contain"
              />
            </div>
          )}
        </div>

        {/* Bubble */}
        <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
          <div
            className={cn(
              "px-5 py-3.5 rounded-2xl text-sm md:text-base leading-relaxed relative shadow-sm",
              isUser ? "text-white rounded-br-sm" : "bg-white text-gray-800 rounded-bl-sm border"
            )}
            style={
              isUser
                ? { background: `linear-gradient(135deg, color-mix(in srgb, ${employee.accentColor} 85%, #000) 0%, ${employee.accentColor} 100%)` }
                : { borderColor: `color-mix(in srgb, ${employee.accentColor} 20%, #e5e7eb)` }
            }
          >
            {/* Accent left border on assistant */}
            {!isUser && (
              <div
                className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
                style={{ background: employee.accentColor }}
              />
            )}

            <p className="whitespace-pre-wrap pl-1">{message.content}</p>

            <div className={cn("flex items-center gap-3 mt-3 pl-1", isUser ? "justify-end" : "justify-between")}>
              {!isUser && (
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    background: `color-mix(in srgb, ${employee.accentColor} 10%, white)`,
                    color: employee.accentColor,
                  }}
                >
                  {employee.isInternal ? "UPAX Interno" : `Vía ${employee.consultora}`}
                </span>
              )}
              <span className={cn("text-[10px] whitespace-nowrap", isUser ? "text-white/60" : "text-gray-400")}>
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
