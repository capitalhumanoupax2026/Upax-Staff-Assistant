import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
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
  const [hrbpImgError, setHrbpImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("flex w-full mb-3", isUser ? "justify-end" : "justify-start")}
    >
      <div className={cn("flex max-w-[80%] sm:max-w-[68%] gap-3", isUser ? "flex-row-reverse" : "flex-row")}>

        {/* Avatar */}
        <div className="mt-auto mb-1 flex-shrink-0 hidden sm:block">
          {isUser ? (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
              style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${employee.accentColor} 80%, #000) 0%, ${employee.accentColor} 100%)` }}
            >
              {employee.name.charAt(0)}
            </div>
          ) : (
            <div
              className="w-7 h-7 rounded-full overflow-hidden border-2 flex items-center justify-center shadow-sm flex-shrink-0"
              style={{ borderColor: `color-mix(in srgb, ${employee.accentColor} 40%, #e5e7eb)` }}
            >
              {employee.hrbpPhoto && !hrbpImgError ? (
                <img
                  src={employee.hrbpPhoto}
                  alt={employee.hrbpName}
                  className="w-full h-full object-cover"
                  onError={() => setHrbpImgError(true)}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${employee.accentColor} 80%, #000) 0%, ${employee.accentColor} 100%)` }}
                >
                  {employee.hrbpName?.charAt(0) || "H"}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bubble */}
        <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
          <div
            className={cn(
              "px-4 py-3 rounded-2xl text-sm leading-relaxed relative shadow-sm",
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
                className="absolute top-0 left-0 w-[3px] h-full rounded-l-2xl"
                style={{ background: employee.accentColor }}
              />
            )}

            {/* Markdown content */}
            <div className={cn("pl-1 prose prose-sm max-w-none", isUser ? "prose-invert" : "")}>
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  ul: ({ children }) => <ul className="list-none pl-0 space-y-0.5 my-1">{children}</ul>,
                  li: ({ children }) => <li className="flex gap-1.5 items-start"><span className="opacity-40 mt-1">·</span><span>{children}</span></li>,
                  h2: ({ children }) => <h2 className="font-bold text-sm mb-1">{children}</h2>,
                  h3: ({ children }) => <h3 className="font-semibold text-sm mb-0.5">{children}</h3>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>

            {/* Footer */}
            <div className={cn("flex items-center gap-2 mt-2 pl-1", isUser ? "justify-end" : "justify-between")}>
              {!isUser && (
                <span
                  className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
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
