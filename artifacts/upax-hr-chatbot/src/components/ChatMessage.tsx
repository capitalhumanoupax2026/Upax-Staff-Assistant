import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  const accent = employee.accentColor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className={cn("flex w-full mb-2", isUser ? "justify-end" : "justify-start")}
    >
      <div className={cn("flex max-w-[82%] sm:max-w-[70%] gap-2.5", isUser ? "flex-row-reverse" : "flex-row")}>

        {/* Avatar */}
        <div className="mt-auto mb-1 flex-shrink-0 hidden sm:block">
          {isUser ? (
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black shadow-md flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 85%, #000), ${accent})`,
                boxShadow: `0 2px 8px ${accent}50`,
              }}
            >
              {employee.name.charAt(0)}
            </motion.div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center shadow-md flex-shrink-0"
              style={{ border: `2px solid color-mix(in srgb, ${accent} 40%, #e5e7eb)`, boxShadow: `0 2px 8px ${accent}30` }}
            >
              {employee.hrbpPhoto && !hrbpImgError ? (
                <img src={employee.hrbpPhoto} alt={employee.hrbpName} className="w-full h-full object-cover" onError={() => setHrbpImgError(true)} />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white text-[10px] font-black"
                  style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 85%, #000), ${accent})` }}
                >
                  {employee.hrbpName?.charAt(0) || "H"}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Bubble */}
        <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
          <motion.div
            whileHover={{ scale: 1.005 }}
            className={cn("px-4 py-3 rounded-2xl text-sm leading-relaxed relative overflow-hidden", isUser ? "text-white rounded-br-sm" : "bg-white text-gray-800 rounded-bl-sm")}
            style={
              isUser
                ? {
                    background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 90%, #000), ${accent})`,
                    boxShadow: `0 4px 16px ${accent}40, 0 1px 3px rgba(0,0,0,0.1)`,
                  }
                : {
                    border: `1px solid color-mix(in srgb, ${accent} 20%, #e5e7eb)`,
                    boxShadow: `0 2px 12px rgba(0,0,0,0.06), 0 0 0 0px ${accent}00`,
                    background: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(8px)",
                  }
            }
          >
            {/* Shimmer on user bubble */}
            {isUser && (
              <motion.div
                className="absolute inset-0 opacity-30"
                style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)" }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
              />
            )}

            {/* Accent left strip on assistant */}
            {!isUser && (
              <motion.div
                className="absolute top-0 left-0 w-[3px] h-full rounded-l-2xl"
                style={{ background: `linear-gradient(180deg, ${accent}, color-mix(in srgb, ${accent} 60%, transparent))` }}
              />
            )}

            {/* Markdown content */}
            <div className={cn("pl-1 prose prose-sm max-w-none", isUser ? "prose-invert" : "")}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                  ul: ({ children }) => <ul className="list-none pl-0 space-y-0.5 my-1">{children}</ul>,
                  li: ({ children }) => (
                    <li className="flex gap-1.5 items-start">
                      <span className="opacity-40 mt-1 flex-shrink-0">·</span>
                      <span>{children}</span>
                    </li>
                  ),
                  h2: ({ children }) => <h2 className="font-black text-sm mb-1">{children}</h2>,
                  h3: ({ children }) => <h3 className="font-bold text-sm mb-0.5">{children}</h3>,
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 break-all"
                      style={{ color: isUser ? "rgba(255,255,255,0.9)" : accent }}
                    >
                      {children}
                      <svg className="inline w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ),
                  table: ({ children }) => <div className="overflow-x-auto my-2"><table className="text-xs border-collapse w-full">{children}</table></div>,
                  th: ({ children }) => <th className="border px-2 py-1 text-left font-bold bg-gray-50">{children}</th>,
                  td: ({ children }) => <td className="border px-2 py-1">{children}</td>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>

            {/* Footer */}
            <div className={cn("flex items-center gap-2 mt-2 pl-1", isUser ? "justify-end" : "justify-between")}>
              {!isUser && (
                <span
                  className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                  style={{
                    background: `color-mix(in srgb, ${accent} 10%, white)`,
                    color: accent,
                    border: `1px solid ${accent}25`,
                  }}
                >
                  {employee.isInternal ? "UPAX Interno" : `Vía ${employee.consultora}`}
                </span>
              )}
              <span className={cn("text-[10px] whitespace-nowrap tabular-nums", isUser ? "text-white/55" : "text-gray-400")}>
                {formatTime(message.timestamp)}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
