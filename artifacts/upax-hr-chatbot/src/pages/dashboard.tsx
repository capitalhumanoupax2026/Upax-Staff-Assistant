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
import { Send, LogOut, Loader2, Menu } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { messages, isSending, sendMessage } = useChat();
  const [, setLocation] = useLocation();
  const [inputValue, setInputValue] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Authentication check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  // Show welcome modal once per session load if user exists
  useEffect(() => {
    if (user && !sessionStorage.getItem(`welcome_seen_${user.id}`)) {
      setShowWelcome(true);
      sessionStorage.setItem(`welcome_seen_${user.id}`, 'true');
    }
  }, [user]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
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
      style={{ '--dyn-accent': user.accentColor } as React.CSSProperties}
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
            <div className="h-8 w-auto flex items-center">
              <img 
                src={`${import.meta.env.BASE_URL}${user.logoUrl.replace(/^\//, '')}`} 
                alt={user.businessUnit} 
                className="max-h-8 w-auto object-contain"
              />
            </div>
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-white/10">
              <span className="text-sm font-medium text-muted-foreground">
                Hola, <span className="text-foreground">{user.name.split(' ')[0]}</span>
              </span>
              <Badge variant="outline" className="border-[var(--dyn-accent)]/30 text-[var(--dyn-accent)] bg-[var(--dyn-accent-transparent)]">
                {user.businessUnit}
              </Badge>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              {user.isInternal ? (
                 <Badge variant="internal" className="h-7 px-3">Gestión: Interna UPAX</Badge>
              ) : (
                 <Badge variant="external" className="h-7 px-3">Consultora: {user.consultora}</Badge>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => logout()} title="Cerrar sesión">
              <LogOut className="w-5 h-5 text-muted-foreground hover:text-destructive transition-colors" />
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN CHAT AREA */}
      <main className="flex-1 overflow-hidden relative flex flex-col max-w-5xl mx-auto w-full">
        
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-8 sm:px-6">
          
          {/* Empty State / Welcome */}
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto"
            >
              <div className="w-20 h-20 rounded-2xl bg-[var(--dyn-accent-transparent)] flex items-center justify-center border border-[var(--dyn-accent)]/30 shadow-[0_0_30px_-10px_var(--dyn-accent)]">
                <img src={`${import.meta.env.BASE_URL}images/ai-avatar.png`} alt="AI" className="w-12 h-12 object-contain" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-semibold mb-2">Asistente HR {user.businessUnit}</h2>
                <p className="text-muted-foreground">Estoy aquí para ayudarte con cualquier duda sobre tus prestaciones, vacaciones, nómina o políticas internas.</p>
              </div>
            </motion.div>
          )}

          {/* Message List */}
          <div className="space-y-2 pb-4">
            {messages.map((msg, i) => (
              <ChatMessageBubble key={msg.id || i} message={msg} employee={user} />
            ))}
            
            {/* Loading Indicator */}
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
                  <div className="px-5 py-4 rounded-2xl bg-black/40 border border-white/5 rounded-bl-sm flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-[var(--dyn-accent)] animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-[var(--dyn-accent)] animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-[var(--dyn-accent)] animate-bounce" style={{ animationDelay: '300ms' }}></span>
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
            
            {/* Quick Actions */}
            <QuickActions onActionClick={handleQuickAction} />

            {/* Input Form */}
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
                <Button 
                  type="submit" 
                  size="icon" 
                  variant="default"
                  className="w-10 h-10 rounded-xl"
                  disabled={!inputValue.trim() || isSending}
                >
                  <Send className="w-5 h-5 -ml-0.5" />
                </Button>
              </div>
            </form>
            <div className="text-center">
               <p className="text-[10px] text-muted-foreground/40 font-medium tracking-wide uppercase">
                 Plataforma Inteligente HR • Grupo UPAX
               </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
