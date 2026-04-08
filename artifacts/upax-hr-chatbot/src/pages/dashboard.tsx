import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";
import { useLocation } from "wouter";
import { WelcomeModal } from "@/components/WelcomeModal";
import { QuickActions } from "@/components/QuickActions";
import { CategoryMenu } from "@/components/CategoryMenu";
import { ChatMessageBubble } from "@/components/ChatMessage";
import { HRBPAvatar } from "@/components/HRBPAvatar";
import { Send, LogOut, Loader2, Sparkles, RotateCcw, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Modal: Continuar o Nueva Conversación ────────────────────────────────────
function ContinueSessionModal({
  isOpen,
  accentColor,
  hrbpName,
  onContinue,
  onFresh,
}: {
  isOpen: boolean;
  accentColor: string;
  hrbpName: string;
  onContinue: () => void;
  onFresh: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center"
          >
            {/* Icono */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl"
              style={{ background: `color-mix(in srgb, ${accentColor} 12%, white)` }}
            >
              💬
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-1">
              ¡Bienvenido de vuelta!
            </h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Tienes una conversación guardada con <span className="font-semibold text-gray-700">{hrbpName || "Capital Humano"}</span>.<br />
              ¿Quieres continuar donde la dejaste o empezar de nuevo?
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={onContinue}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-98"
                style={{ background: `linear-gradient(135deg, ${accentColor}, color-mix(in srgb, ${accentColor} 70%, #000))` }}
              >
                <ArrowRight className="w-4 h-4" />
                Continuar conversación
              </button>
              <button
                onClick={onFresh}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-all active:scale-98"
              >
                <RotateCcw className="w-4 h-4 text-gray-400" />
                Empezar de nuevo
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Dashboard Principal ──────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { messages, isSending, hasHistory, historyLoaded, sendMessage, continueConversation, startFresh } = useChat();
  const [, setLocation] = useLocation();
  const [inputValue, setInputValue] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) setLocation("/login");
  }, [isLoading, isAuthenticated, setLocation]);

  // Mostrar modal de bienvenida solo si NO hay historial previo
  useEffect(() => {
    if (user && historyLoaded && messages.length === 0) {
      if (!sessionStorage.getItem(`welcome_seen_${user.employeeNumber}`)) {
        setShowWelcome(true);
        sessionStorage.setItem(`welcome_seen_${user.employeeNumber}`, "true");
      }
    }
  }, [user, historyLoaded, messages.length]);

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
    setActiveCategory(null);
  };

  const handleCategoryClick = (category: string) => {
    setActiveCategory(prev => prev === category ? null : category);
  };

  const handleSubQuestion = (message: string, category: string) => {
    sendMessage(message, category);
    setActiveCategory(null);
  };

  const consultoraBadge = user.isInternal
    ? { label: "UPAX Interno", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" }
    : { label: user.consultora || "Consultora", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" };

  return (
    <div
      className="flex flex-col h-[100dvh] bg-background transition-colors duration-500"
      style={{ "--dyn-accent": user.accentColor } as React.CSSProperties}
    >
      {/* Modal de bienvenida inicial (solo si es primera vez en la sesión) */}
      <WelcomeModal isOpen={showWelcome} onClose={() => setShowWelcome(false)} employee={user} />

      {/* Modal: ¿Continuar conversación o empezar de nuevo? */}
      <ContinueSessionModal
        isOpen={hasHistory === true}
        accentColor={user.accentColor}
        hrbpName={user.hrbpName}
        onContinue={continueConversation}
        onFresh={startFresh}
      />

      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100 shadow-sm">
        <div className="h-0.5 w-full accent-gradient" />

        <div className="flex h-12 items-center justify-between px-3 sm:px-5 max-w-7xl mx-auto w-full">

          {/* Left: Logo + greeting */}
          <div className="flex items-center gap-2.5">
            <div
              className="h-8 px-2 flex items-center justify-center rounded-lg border"
              style={{
                background: "linear-gradient(135deg, #fff 60%, color-mix(in srgb, var(--dyn-accent) 8%, white) 100%)",
                borderColor: "color-mix(in srgb, var(--dyn-accent) 20%, transparent)",
              }}
            >
              <img
                src={`${import.meta.env.BASE_URL}${user.logoUrl.replace(/^\//, "")}`}
                alt={user.businessUnit}
                className="max-h-5 w-auto object-contain"
              />
            </div>

            <div className="flex flex-col leading-none">
              <span className="text-[11px] text-gray-400">
                Hola, <span className="font-semibold text-gray-800">{user.name.split(" ")[0]}</span> 👋
              </span>
            </div>

            {/* UDN badge */}
            <div
              className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
              style={{ background: `color-mix(in srgb, var(--dyn-accent) 12%, white)`, color: user.accentColor }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: user.accentColor }} />
              {user.businessUnit}
            </div>

            {/* Consultora badge */}
            <div className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${consultoraBadge.bg} ${consultoraBadge.text} ${consultoraBadge.border}`}>
              {consultoraBadge.label}
            </div>
          </div>

          {/* Right: En Vivo + logout */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              En Vivo · 24/7
            </div>

            <button
              onClick={() => logout()}
              title="Cerrar sesión"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 overflow-hidden flex flex-col max-w-5xl mx-auto w-full px-3 sm:px-6">

        {/* Messages / Empty state */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-4">

          {historyLoaded && messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-6"
            >
              {/* HRBP Avatar */}
              <div className="flex flex-col items-center gap-3">
                <HRBPAvatar
                  photoUrl={user.hrbpPhoto}
                  name={user.hrbpName}
                  accentColor={user.accentColor}
                  isTalking={isSending}
                  size="lg"
                />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Tu HRBP</p>
                  <p className="text-sm font-bold text-gray-800">{user.hrbpName || "Capital Humano"}</p>
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
                <h2 className="text-xl font-display font-bold text-gray-900 mb-2">
                  ¿En qué te puedo ayudar hoy? ✨
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Selecciona una categoría o escríbeme tu duda sobre vacaciones, nómina, beneficios y más.
                </p>
              </div>

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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start mb-4 items-end gap-3">
                <HRBPAvatar
                  photoUrl={user.hrbpPhoto}
                  name={user.hrbpName}
                  accentColor={user.accentColor}
                  isTalking={true}
                  size="sm"
                />
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
        <div className="py-3 border-t border-gray-100">
          <div className="space-y-2">

            <CategoryMenu
              category={activeCategory}
              accentColor={user.accentColor}
              onSelect={handleSubQuestion}
              onDismiss={() => setActiveCategory(null)}
            />

            <QuickActions
              onActionClick={handleCategoryClick}
              activeCategory={activeCategory}
            />

            <form
              onSubmit={handleSend}
              className="flex items-center bg-white rounded-2xl border shadow-sm transition-all overflow-hidden"
              style={{ borderColor: `color-mix(in srgb, ${user.accentColor} 20%, #e5e7eb)` }}
            >
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe tu duda o solicitud aquí..."
                className="flex-1 px-4 h-11 text-sm bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
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
