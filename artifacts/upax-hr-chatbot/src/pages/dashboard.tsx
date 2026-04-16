import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";
import { useLocation } from "wouter";
import { WelcomeModal } from "@/components/WelcomeModal";
import { QuickActions } from "@/components/QuickActions";
import { CategoryMenu } from "@/components/CategoryMenu";
import { ChatMessageBubble } from "@/components/ChatMessage";
import { HRBPAvatar } from "@/components/HRBPAvatar";
import { Send, LogOut, Loader2, Sparkles, RotateCcw, ArrowRight, Mic } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

// ─── Animated Mesh Background ─────────────────────────────────────────────────
function MeshBackground({ accent }: { accent: string }) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base */}
      <div className="absolute inset-0 bg-[#f8f7f5]" />
      {/* Soft orbs */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 600, height: 600, top: "-20%", right: "-10%", background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`, filter: "blur(40px)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{ width: 500, height: 500, bottom: "-10%", left: "-5%", background: `radial-gradient(circle, ${accent}10 0%, transparent 70%)`, filter: "blur(40px)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}

// ─── Continue Session Modal ───────────────────────────────────────────────────
function ContinueSessionModal({
  isOpen, accentColor, hrbpName, onContinue, onFresh,
}: {
  isOpen: boolean; accentColor: string; hrbpName: string;
  onContinue: () => void; onFresh: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-7 text-center relative overflow-hidden"
          >
            {/* Accent bar top */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" style={{ background: `linear-gradient(90deg, ${accentColor}, color-mix(in srgb, ${accentColor} 60%, #000))` }} />

            <motion.div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl"
              style={{ background: `color-mix(in srgb, ${accentColor} 12%, white)` }}
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              💬
            </motion.div>

            <h2 className="text-xl font-black text-gray-900 mb-1">¡Bienvenido de vuelta!</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Tienes una conversación guardada con{" "}
              <span className="font-bold text-gray-800">{hrbpName || "Capital Humano"}</span>.<br />
              ¿Continuar o empezar de nuevo?
            </p>

            <div className="flex flex-col gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onContinue}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white text-sm font-bold shadow-lg"
                style={{ background: `linear-gradient(135deg, ${accentColor}, color-mix(in srgb, ${accentColor} 70%, #000))`, boxShadow: `0 8px 20px ${accentColor}40` }}
              >
                <ArrowRight className="w-4 h-4" /> Continuar conversación
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onFresh}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-700 text-sm font-semibold"
              >
                <RotateCcw className="w-4 h-4 text-gray-400" /> Empezar de nuevo
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Glowing send button ─────────────────────────────────────────────────────
function SendButton({ disabled, accent }: { disabled: boolean; accent: string }) {
  return (
    <motion.button
      type="submit"
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.1 } : {}}
      whileTap={!disabled ? { scale: 0.9 } : {}}
      className="relative w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-30 transition-all overflow-hidden flex-shrink-0"
      style={{
        background: disabled ? "#d1d5db" : `linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 75%, #000))`,
        boxShadow: disabled ? "none" : `0 4px 14px ${accent}50`,
      }}
    >
      {!disabled && (
        <motion.div
          className="absolute inset-0"
          style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)" }}
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
        />
      )}
      <Send className="w-4 h-4 text-white relative z-10" />
    </motion.button>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingDots({ accent }: { accent: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="flex gap-1.5 items-center px-5 py-4 rounded-2xl rounded-bl-sm shadow-sm border bg-white"
      style={{ borderColor: `color-mix(in srgb, ${accent} 25%, transparent)`, boxShadow: `0 4px 16px ${accent}12` }}
    >
      {[0, 150, 300].map((delay, i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: accent }}
          animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: delay / 1000, ease: "easeInOut" }}
        />
      ))}
    </motion.div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ user, isSending }: { user: any; isSending: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
      className="h-full flex flex-col items-center justify-center text-center space-y-5 px-4"
    >
      {/* HRBP floating avatar */}
      <motion.div
        className="flex flex-col items-center gap-3"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative">
          <HRBPAvatar photoUrl={user.hrbpPhoto} name={user.hrbpName} accentColor={user.accentColor} isTalking={isSending} size="lg" />
          {/* Pulse ring */}
          <motion.div
            className="absolute -inset-3 rounded-full -z-10"
            style={{ background: `radial-gradient(circle, ${user.accentColor}20, transparent 70%)` }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tu HRBP</p>
          <p className="text-sm font-black text-gray-800">{user.hrbpName || "Capital Humano"}</p>
        </div>
      </motion.div>

      {/* AI badge */}
      <motion.div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border"
        style={{
          background: `color-mix(in srgb, ${user.accentColor} 8%, white)`,
          borderColor: `color-mix(in srgb, ${user.accentColor} 25%, transparent)`,
          color: user.accentColor,
          boxShadow: `0 4px 16px ${user.accentColor}20`,
        }}
        animate={{ boxShadow: [`0 4px 16px ${user.accentColor}20`, `0 6px 24px ${user.accentColor}40`, `0 4px 16px ${user.accentColor}20`] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 3, repeat: Infinity }}>
          <Sparkles className="w-3.5 h-3.5" />
        </motion.div>
        Asistente HR · {user.businessUnit}
      </motion.div>

      <div className="max-w-xs">
        <h2 className="text-2xl font-display font-black text-gray-900 mb-2">¿En qué te puedo ayudar? ✨</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Selecciona una categoría o escríbeme directamente tu duda sobre vacaciones, nómina, beneficios y más.
        </p>
      </div>

      {/* Animated dots */}
      <div className="flex gap-2">
        {[32, 12, 6].map((w, i) => (
          <motion.span
            key={i}
            className="rounded-full h-1"
            style={{ width: w, background: `color-mix(in srgb, ${user.accentColor} ${100 - i * 30}%, transparent)` }}
            animate={{ scaleX: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { messages, isSending, hasHistory, historyLoaded, sendMessage, continueConversation, startFresh } = useChat();
  const [, setLocation] = useLocation();
  const [inputValue, setInputValue] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) setLocation("/login");
  }, [isLoading, isAuthenticated, setLocation]);

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
      <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Loader2 className="w-8 h-8" style={{ color: "#E85A29" }} />
        </motion.div>
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

  const accent = user.accentColor;

  const consultoraBadge = user.isInternal
    ? { label: "UPAX Interno", bg: "rgba(16,185,129,0.1)", text: "#059669", border: "rgba(16,185,129,0.25)" }
    : { label: user.consultora || "Consultora", bg: "rgba(59,130,246,0.08)", text: "#2563EB", border: "rgba(59,130,246,0.2)" };

  return (
    <div
      className="flex flex-col h-[100dvh] transition-colors duration-500 relative"
      style={{ "--dyn-accent": accent } as React.CSSProperties}
    >
      <MeshBackground accent={accent} />

      <WelcomeModal isOpen={showWelcome} onClose={() => setShowWelcome(false)} employee={user} />
      <ContinueSessionModal
        isOpen={hasHistory === true}
        accentColor={accent}
        hrbpName={user.hrbpName}
        onContinue={continueConversation}
        onFresh={startFresh}
      />

      {/* ── HEADER ────────────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="sticky top-0 z-40 w-full"
        style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
      >
        {/* Accent bar with shimmer */}
        <div className="h-0.5 w-full relative overflow-hidden" style={{ background: `linear-gradient(90deg, ${accent}, color-mix(in srgb, ${accent} 60%, #C2384E))` }}>
          <motion.div
            className="absolute inset-y-0 w-1/3"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)" }}
            animate={{ x: ["-100%", "400%"] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
        </div>

        <div className="flex h-13 items-center justify-between px-3 sm:px-5 max-w-5xl mx-auto w-full py-2">

          {/* Left */}
          <div className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="h-8 px-2.5 flex items-center justify-center rounded-xl border relative"
              style={{
                background: "rgba(255,255,255,0.9)",
                borderColor: `color-mix(in srgb, ${accent} 25%, transparent)`,
                boxShadow: `0 2px 8px ${accent}15`,
              }}
            >
              <img
                src={`${import.meta.env.BASE_URL}${user.logoUrl.replace(/^\//, "")}`}
                alt={user.businessUnit}
                className="max-h-5 w-auto object-contain"
              />
            </motion.div>

            <div className="flex flex-col leading-none">
              <span className="text-[11px] text-gray-400">
                Hola, <span className="font-bold text-gray-800">{user.name.split(" ")[0]}</span> 👋
              </span>
            </div>

            <motion.div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
              style={{ background: `color-mix(in srgb, ${accent} 12%, white)`, color: accent, border: `1px solid ${accent}30` }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: accent }}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {user.businessUnit}
            </motion.div>

            <div
              className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold border"
              style={{ background: consultoraBadge.bg, color: consultoraBadge.text, borderColor: consultoraBadge.border }}
            >
              {consultoraBadge.label}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <motion.div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#059669" }}
              animate={{ boxShadow: ["0 0 0 0px rgba(16,185,129,0.15)", "0 0 0 4px rgba(16,185,129,0.05)", "0 0 0 0px rgba(16,185,129,0.15)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              En Vivo · 24/7
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.1, color: "#ef4444" }}
              whileTap={{ scale: 0.92 }}
              onClick={() => logout()}
              title="Cerrar sesión"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* ── MAIN ──────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-hidden flex flex-col max-w-5xl mx-auto w-full px-3 sm:px-6">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-4">
          {historyLoaded && messages.length === 0 && (
            <EmptyState user={user} isSending={isSending} />
          )}

          <div className="space-y-2 pb-4">
            {messages.map((msg, i) => (
              <ChatMessageBubble key={msg.id || i} message={msg} employee={user} />
            ))}

            {/* Typing indicator */}
            <AnimatePresence>
              {isSending && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="flex justify-start mb-4 items-end gap-3"
                >
                  <HRBPAvatar photoUrl={user.hrbpPhoto} name={user.hrbpName} accentColor={accent} isTalking={true} size="sm" />
                  <TypingDots accent={accent} />
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ── INPUT AREA ──────────────────────────────────────────── */}
        <motion.div
          className="py-3"
          style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 22 }}
        >
          <div className="space-y-2">
            <CategoryMenu category={activeCategory} accentColor={accent} onSelect={handleSubQuestion} onDismiss={() => setActiveCategory(null)} />
            <QuickActions onActionClick={handleCategoryClick} activeCategory={activeCategory} />

            {/* Chat input with glass effect */}
            <motion.form
              onSubmit={handleSend}
              animate={{
                boxShadow: inputFocused
                  ? `0 0 0 2px ${accent}35, 0 8px 32px ${accent}18, 0 2px 8px rgba(0,0,0,0.08)`
                  : `0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)`,
              }}
              className="flex items-center rounded-2xl border overflow-hidden transition-colors"
              style={{
                borderColor: inputFocused ? `${accent}50` : "rgba(0,0,0,0.08)",
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(12px)",
              }}
            >
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Escribe tu duda o solicitud aquí..."
                className="flex-1 px-4 h-12 text-sm bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
                disabled={isSending}
              />
              <div className="px-2 flex items-center gap-1.5">
                <SendButton disabled={!inputValue.trim() || isSending} accent={accent} />
              </div>
            </motion.form>

            <motion.p
              className="text-center text-[10px] font-bold tracking-widest uppercase"
              style={{ color: `color-mix(in srgb, ${accent} 35%, #d1d5db)` }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              Plataforma Inteligente HR · Grupo UPAX
            </motion.p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
