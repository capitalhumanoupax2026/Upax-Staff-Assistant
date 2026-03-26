import React from "react";
import { cn, formatTime } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Avatar } from "./ui/avatar";
import { motion } from "framer-motion";
import type { ChatMessage as ChatMessageType, Employee } from "@workspace/api-client-react";

interface ChatMessageProps {
  message: ChatMessageType;
  employee: Employee;
}

export function ChatMessageBubble({ message, employee }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  // Determine if we should show the consultora badge
  const isInternal = employee.isInternal;
  const consultoraName = employee.consultora;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full mb-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "flex max-w-[85%] sm:max-w-[75%] gap-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        
        {/* Avatar */}
        <div className="mt-auto hidden sm:block">
          {isUser ? (
            <Avatar initials={employee.name.charAt(0)} className="w-8 h-8" />
          ) : (
            <Avatar 
              src={`${import.meta.env.BASE_URL}images/ai-avatar.png`} 
              className="w-8 h-8 border border-[var(--dyn-accent)]/30" 
            />
          )}
        </div>

        {/* Message Content */}
        <div className={cn(
          "flex flex-col gap-1",
          isUser ? "items-end" : "items-start"
        )}>
          
          <div className={cn(
            "px-5 py-3.5 rounded-2xl text-sm md:text-base leading-relaxed relative",
            isUser 
              ? "bg-secondary text-secondary-foreground rounded-br-sm" 
              : "bg-black/40 border border-white/5 text-foreground rounded-bl-sm"
          )}>
            {!isUser && (
              <div className="absolute top-0 left-0 w-1 h-full bg-[var(--dyn-accent)] rounded-l-2xl"></div>
            )}
            
            <p className="whitespace-pre-wrap">{message.content}</p>
            
            <div className={cn(
              "flex items-center gap-3 mt-3",
              isUser ? "justify-end" : "justify-between"
            )}>
              {/* Badges for Bot Responses */}
              {!isUser && (
                <div>
                  {isInternal ? (
                    <Badge variant="internal">Proceso Interno UPAX</Badge>
                  ) : (
                    <Badge variant="external">Vía Consultora: {consultoraName}</Badge>
                  )}
                </div>
              )}
              
              <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
