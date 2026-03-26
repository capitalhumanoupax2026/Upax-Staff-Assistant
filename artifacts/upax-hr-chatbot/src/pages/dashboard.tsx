import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";
import { useLocation } from "wouter";
import { WelcomeModal } from "@/components/WelcomeModal";
import { QuickActions } from "@/components/QuickActions";
import { ChatMessageBubble } from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, LogOut, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { messages, isSending, sendMessage } = useChat();
  const [, setLocation] = useLocation();
  const [inputValue, setInputValue] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
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

  const handleQuickAction = (text: string, category: string) => {
    sendMessage(text, category);
  };

  return (
    <div
      className="flex flex-col h-[100dvh] bg-background text-foreground transition-colors duration-500"
      style={{ "--dyn-accent": user.accentColor } as React.CSSProperties}
    >
      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
        employee={user}
      />

      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">

          {/* Logo & UDN */}
          <div className="flex items-center gap-4">
            {/* Logo with white rounded background */}
            <div
              className="h-9 px-3 flex items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg, #ffffff 60%, #fde8df 100%)" }}
            >
              <img
                src={`${import.meta.env.BASE_URL}${user.logoUrl.replace(/^\//, "")}`}
                alt={user.businessUnit}
                className="max-h-6 w-auto object-contain"
              />
            </div>

            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-white/10">
              <span className="text-sm font-medium text-muted-foreground">
                Hola, <span className="text-foreground">{user.name.split(" ")[0]}</span>
              </span>
              <Badge
                variant="outline"
                className="border-[var(--dyn-accent)]/30 text-[var(--dyn-accent)] bg-[var(--dyn-accent-transparent)]"
              >
                {user.businessUnit}
              </Badge>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              {user.isInternal ? (
                <Badge variant="internal" className="h-7 px-3">
                  Gestión: Interna UPAX
                </Badge>
              ) : (
                <Badge variant="external" className="h-7 px-3">
                  Consultora: {user.consultora}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logout()}
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5 text-muted-foreground hover:text-destructive transition-colors" />
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN CHAT AREA */}
      <main className="flex-1 overflow-hidden relative flex flex-col max-w-5xl mx-auto w-full">

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-8 sm:px-6">

          {/* Empty State */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto"
            >
              {/* AI Icon with white bg */}
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #ffffff 60%, #fde8df 100%)",
                  boxShadow: `0 0 30px -10px var(--dyn-accent)`,
                }}
              >
                <img
                  src={`${import.meta.env.BASE_URL}upax_logo_color.png`}
                  alt="UPAX"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div>
                <h2 className="text-2xl font-display font-semibold mb-2">
                  Asistente HR · {user.businessUnit}
                </h2>
                <p className="text-muted-foreground">
                  Estoy aquí para ayudarte con cualquier duda sobre tus prestaciones, vacaciones, nómina o políticas internas.
                </p>
              </div>
            </motion.div>
          )}

          {/* Message List */}
          <div className="space-y-2 pb-4">
            {messages.map((msg, i) => (
              <ChatMessageBubble key={msg.id || i} message={msg} employee={user} />
            ))}

            {/* Loading dots */}
            {isSending && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex w-full mb-6 justify-start"
              >
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full border border-[var(--dyn-accent)]/30 flex items-center justify-center mt-auto hidden sm:flex bg-black/40">
                    <Loader2 className="w-4 h-4 animate-spin text-[var(--dyn-accent)]" />
                  </div>
                  <div className="px-5 py-4 rounded-2xl bg-black/40 border border-white/5 rounded-bl-sm flex gap-1 items-center">
                    <span className="w-2 h-2 rounded-full bg-[var(--dyn-accent)] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-[var(--dyn-accent)] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-[var(--dyn-accent)] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="mt-auto border-t border-white/5 bg-background/80 backdrop-blur-xl p-4 sm:p-6">
          <div className="max-w-4xl mx-auto space-y-4">

            <QuickActions onActionClick={handleQuickAction} />

            <form
              onSubmit={handleSend}
              className="relative flex items-center bg-card border border-white/10 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-[var(--dyn-accent)] focus-within:border-transparent transition-all shadow-lg"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe tu duda o solicitud aquí..."
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-6 h-14 text-base placeholder:text-muted-foreground/50"
                disabled={isSending}
              />
              <div className="pr-2">
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isSending}
                  className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-40 transition-all"
                  style={{ background: "linear-gradient(135deg, #C2384E 0%, #E85A29 100%)" }}
                >
                  <Send className="w-4 h-4 text-white -ml-0.5" />
                </button>
              </div>
            </form>

            <div className="text-center">
              <p className="text-[10px] text-muted-foreground/40 font-medium tracking-wide uppercase">
                Plataforma Inteligente HR · Grupo UPAX
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
