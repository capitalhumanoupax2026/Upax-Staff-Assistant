import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";
import { useLocation } from "wouter";
import { WelcomeModal } from "@/components/WelcomeModal";
import { QuickActions } from "@/components/QuickActions";
import { ChatMessageBubble } from "@/components/ChatMessage";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, LogOut, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { messages, isSending, sendMessage } = useChat();
  const [, setLocation] = useLocation();
  const [inputValue, setInputValue] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) setLocation("/login");
  }, [isLoading, isAuthenticated, setLocation]);

  useEffect(() => {
    if (user && !sessionStorage.getItem(`welcome_seen_${user.id}`)) {
      setShowWelcome(true);
      sessionStorage.setItem(`welcome_seen_${user.id}`, "true");
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#E85A29" }} />
      </div>
    );
  }

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isSending) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  return (
    <div
      className="flex flex-col h-[100dvh] bg-background transition-colors duration-500"
      style={{ "--dyn-accent": user.accentColor } as React.CSSProperties}
    >
      <WelcomeModal isOpen={showWelcome} onClose={() => setShowWelcome(false)} employee={user} />

      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100 shadow-sm">
        {/* Accent top stripe */}
        <div className="h-1 w-full accent-gradient" />

        <div className="flex h-15 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-3">

          {/* Logo UDN */}
          <div className="flex items-center gap-4">
            <div
              className="h-10 px-3 flex items-center justify-center rounded-xl border"
              style={{ background: "linear-gradient(135deg, #fff 60%, color-mix(in srgb, var(--dyn-accent) 8%, white) 100%)", borderColor: "color-mix(in srgb, var(--dyn-accent) 20%, transparent)" }}
            >
              <img
                src={`${import.meta.env.BASE_URL}${user.logoUrl.replace(/^\//, "")}`}
                alt={user.businessUnit}
                className="max-h-7 w-auto object-contain"
              />
            </div>

            <div className="hidden md:flex flex-col">
              <span className="text-xs text-gray-400 font-medium leading-none mb-0.5">Hola,</span>
              <span className="text-sm font-semibold text-gray-900">{user.name.split(" ")[0]}</span>
            </div>

            <div
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: `color-mix(in srgb, var(--dyn-accent) 12%, white)`, color: user.accentColor }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: user.accentColor }} />
              {user.businessUnit}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              {user.isInternal ? (
                <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Gestión Interna UPAX
                </span>
              ) : (
                <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Consultora: {user.consultora}
                </span>
              )}
            </div>
            <button
              onClick={() => logout()}
              title="Cerrar sesión"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full px-4">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-8">

          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-8"
            >
              {/* UDN Logo hero */}
              <div className="relative">
                {/* Glow rings */}
                <div
                  className="absolute inset-[-20px] rounded-3xl opacity-20 blur-2xl"
                  style={{ background: `radial-gradient(circle, ${user.accentColor} 0%, transparent 70%)` }}
                />
                <div
                  className="absolute inset-[-8px] rounded-2xl opacity-10"
                  style={{ background: user.accentColor }}
                />
                {/* Logo container */}
                <div
                  className="relative w-28 h-28 rounded-3xl flex items-center justify-center shadow-xl border"
                  style={{
                    background: "linear-gradient(145deg, #ffffff 60%, color-mix(in srgb, var(--dyn-accent) 12%, white) 100%)",
                    borderColor: `color-mix(in srgb, ${user.accentColor} 25%, transparent)`,
                    boxShadow: `0 20px 60px -10px color-mix(in srgb, ${user.accentColor} 35%, transparent)`,
                  }}
                >
                  <img
                    src={`${import.meta.env.BASE_URL}${user.logoUrl.replace(/^\//, "")}`}
                    alt={user.businessUnit}
                    className="w-16 h-16 object-contain"
                  />
                </div>
              </div>

              {/* AI chip */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border"
                style={{
                  background: `color-mix(in srgb, ${user.accentColor} 8%, white)`,
                  borderColor: `color-mix(in srgb, ${user.accentColor} 25%, transparent)`,
                  color: user.accentColor,
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Asistente HR · {user.businessUnit}
              </div>

              <div className="max-w-sm">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">
                  ¿En qué te puedo ayudar hoy?
                </h2>
                <p className="text-gray-500 leading-relaxed">
                  Estoy aquí para resolver tus dudas sobre vacaciones, nómina, beneficios y políticas internas de tu UDN.
                </p>
              </div>

              {/* Decorative accent line */}
              <div className="flex gap-1.5">
                <span className="w-8 h-1 rounded-full accent-gradient" />
                <span className="w-3 h-1 rounded-full" style={{ background: `color-mix(in srgb, ${user.accentColor} 40%, transparent)` }} />
                <span className="w-1.5 h-1 rounded-full" style={{ background: `color-mix(in srgb, ${user.accentColor} 20%, transparent)` }} />
              </div>
            </motion.div>
          )}

          <div className="space-y-2 pb-4">
            {messages.map((msg, i) => (
              <ChatMessageBubble key={msg.id || i} message={msg} employee={user} />
            ))}

            {/* Typing indicator */}
            {isSending && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start mb-4">
                <div
                  className="flex gap-1.5 items-center px-5 py-4 rounded-2xl rounded-bl-sm border shadow-sm"
                  style={{
                    background: "white",
                    borderColor: `color-mix(in srgb, ${user.accentColor} 20%, transparent)`,
                  }}
                >
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: user.accentColor, animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: user.accentColor, animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: user.accentColor, animationDelay: "300ms" }} />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="py-4 sm:py-6 border-t border-gray-100">
          <div className="space-y-3">
            <QuickActions onActionClick={(text, cat) => sendMessage(text, cat)} />

            <form
              onSubmit={handleSend}
              className="flex items-center bg-white rounded-2xl border shadow-sm transition-all overflow-hidden"
              style={{ borderColor: `color-mix(in srgb, ${user.accentColor} 20%, #e5e7eb)` }}
            >
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe tu duda o solicitud aquí..."
                className="flex-1 px-6 h-14 text-base bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
                disabled={isSending}
              />
              <div className="pr-2">
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isSending}
                  className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-30 transition-all accent-gradient shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </form>

            <p className="text-center text-[10px] text-gray-300 font-medium tracking-widest uppercase">
              Plataforma Inteligente HR · Grupo UPAX
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
