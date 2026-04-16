import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { KeyRound, UserCircle2, ChevronRight, Sparkles, Shield, Zap } from "lucide-react";
import { useLocation } from "wouter";

// ─── Animated orb ─────────────────────────────────────────────────────────────
function Orb({ size, x, y, color, delay }: { size: number; x: string; y: string; color: string; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, left: x, top: y, background: color, filter: "blur(60px)" }}
      animate={{ scale: [1, 1.3, 1], opacity: [0.25, 0.45, 0.25], x: [0, 20, -10, 0], y: [0, -20, 10, 0] }}
      transition={{ duration: 8 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

// ─── Floating particle ────────────────────────────────────────────────────────
function Particle({ delay }: { delay: number }) {
  const x = Math.random() * 100;
  const size = 2 + Math.random() * 3;
  return (
    <motion.div
      className="absolute rounded-full bg-white pointer-events-none"
      style={{ left: `${x}%`, bottom: "-10px", width: size, height: size, opacity: 0 }}
      animate={{ y: [-20, -400 - Math.random() * 200], opacity: [0, 0.6, 0] }}
      transition={{ duration: 6 + Math.random() * 6, repeat: Infinity, delay, ease: "easeOut" }}
    />
  );
}

// ─── Magnetic button ──────────────────────────────────────────────────────────
function MagneticButton({ children, onClick, disabled, type }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20 });
  const sy = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current || disabled) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.25);
    y.set((e.clientY - cy) * 0.25);
  };

  return (
    <motion.button
      ref={ref}
      type={type as "submit" | "button"}
      disabled={disabled}
      onMouseMove={handleMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{
        x: sx, y: sy,
        background: "linear-gradient(135deg, #C2384E 0%, #E85A29 60%, #f5823a 100%)",
        boxShadow: "0 8px 30px rgba(232, 90, 41, 0.4), 0 2px 8px rgba(194, 56, 78, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
      } as React.CSSProperties}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="w-full h-14 rounded-2xl text-base font-bold relative overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white select-none"
    >
      {/* shimmer */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100"
        style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)" }}
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1.5 }}
      />
      {children}
    </motion.button>
  );
}

// ─── Stat pill ─────────────────────────────────────────────────────────────────
function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
    >
      <div className="text-white/80">{icon}</div>
      <div>
        <p className="text-[10px] text-white/50 leading-none uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-white leading-tight">{value}</p>
      </div>
    </motion.div>
  );
}

// ─── Glowing input ────────────────────────────────────────────────────────────
function GlowInput({ icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }) {
  const [focused, setFocused] = useState(false);
  return (
    <motion.div
      animate={{ boxShadow: focused ? "0 0 0 3px rgba(232,90,41,0.18), 0 4px 16px rgba(232,90,41,0.12)" : "0 0 0 0px transparent" }}
      className="relative rounded-2xl transition-all"
    >
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
        <motion.div animate={{ scale: focused ? 1.1 : 1, color: focused ? "#E85A29" : undefined }}>
          {icon}
        </motion.div>
      </div>
      <input
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full pl-12 pr-4 h-14 rounded-2xl border bg-gray-50 text-gray-900 placeholder:text-gray-400 text-base outline-none transition-all"
        style={{
          borderColor: focused ? "#E85A29" : "#e5e7eb",
          background: focused ? "#fff" : "#f9fafb",
        }}
      />
      {focused && (
        <motion.div
          layoutId="input-glow"
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: "inset 0 0 0 2px #E85A29" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoggingIn, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [particles] = useState(() => Array.from({ length: 18 }, (_, i) => i));

  useEffect(() => {
    if (isAuthenticated) setLocation("/");
  }, [isAuthenticated, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeNumber || !password) return;
    login({ data: { employeeNumber, password } });
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } },
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden">

      {/* ── LEFT: Brand panel ─────────────────────────────────────── */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
        className="hidden lg:flex lg:w-[52%] flex-col items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0d0409 0%, #5b0e1b 30%, #C2384E 68%, #E85A29 100%)" }}
      >
        {/* Orbs */}
        <Orb size={400} x="−10%" y="−5%" color="rgba(232,90,41,0.4)" delay={0} />
        <Orb size={350} x="60%" y="55%" color="rgba(194,56,78,0.35)" delay={2} />
        <Orb size={200} x="20%" y="70%" color="rgba(255,140,60,0.25)" delay={4} />
        <Orb size={250} x="55%" y="0%" color="rgba(120,20,40,0.5)" delay={1.5} />

        {/* Particles */}
        {particles.map(i => <Particle key={i} delay={i * 0.4} />)}

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Huge faint logo */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: [0, 3, -3, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        >
          <img src="/upax_logo_color.png" alt="" className="w-[520px] opacity-[0.04] brightness-0 invert" />
        </motion.div>

        {/* Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex flex-col items-center text-center px-14"
        >
          {/* Logo pill */}
          <motion.div
            variants={itemVariants}
            className="relative mb-10"
            whileHover={{ scale: 1.04 }}
          >
            <div
              className="bg-white rounded-3xl px-9 py-6 shadow-2xl border border-white/20"
              style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.8)" }}
            >
              <img src="/upax_logo_color.png" alt="Grupo UPAX" className="h-12 w-auto object-contain" />
            </div>
            {/* Glow ring */}
            <motion.div
              className="absolute -inset-1 rounded-3xl -z-10"
              style={{ background: "linear-gradient(135deg, rgba(232,90,41,0.5), rgba(194,56,78,0.5))", filter: "blur(12px)" }}
              animate={{ opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/70 text-[11px] font-semibold tracking-widest uppercase backdrop-blur-sm">
              <Sparkles className="w-3 h-3" />
              Powered by AI
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl xl:text-6xl font-display font-black text-white leading-[1.05] mb-5 tracking-tight"
          >
            El futuro de<br />
            <span
              className="relative inline-block"
              style={{ WebkitTextFillColor: "transparent", WebkitBackgroundClip: "text", backgroundImage: "linear-gradient(90deg, #ffd6a5, #ff8c42, #ffd6a5)", backgroundSize: "200%", animation: "shimmer-text 3s linear infinite" }}
            >
              Capital Humano
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-white/65 text-lg max-w-xs leading-relaxed mb-10">
            Tu asistente personal impulsado por IA para resolver dudas y mantenerte conectado con tu equipo.
          </motion.p>

          {/* Stats */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-3 justify-center">
            <StatPill icon={<Zap className="w-4 h-4" />} label="Respuesta" value="Instantánea" />
            <StatPill icon={<Shield className="w-4 h-4" />} label="Disponibilidad" value="24 / 7" />
          </motion.div>

          {/* Line decoration */}
          <motion.div variants={itemVariants} className="flex gap-2 mt-10">
            {[1, 0.4, 0.2].map((o, i) => (
              <motion.span
                key={i}
                className="rounded-full bg-white"
                style={{ opacity: o, width: i === 0 ? 32 : i === 1 ? 12 : 6, height: 4 }}
                animate={{ scaleX: [1, 1.4, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── RIGHT: Form panel ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.15, type: "spring", stiffness: 80 }}
        className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12 relative overflow-hidden"
      >
        {/* Soft radial bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(232,90,41,0.06) 0%, transparent 70%)" }}
        />

        {/* Mobile logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:hidden mb-10"
        >
          <div
            className="rounded-2xl px-8 py-5 inline-block shadow-lg"
            style={{ background: "linear-gradient(135deg, #C2384E 0%, #E85A29 100%)" }}
          >
            <img src="/upax_logo_color.png" alt="Grupo UPAX" className="h-10 w-auto object-contain brightness-0 invert" />
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md relative z-10"
        >
          {/* Heading */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                className="h-1 rounded-full"
                style={{ background: "linear-gradient(90deg, #C2384E, #E85A29)", width: 40 }}
                animate={{ scaleX: [1, 1.5, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Acceso seguro</span>
            </div>
            <h2 className="text-4xl font-display font-black text-gray-900 mb-2 tracking-tight">
              Acceso<br />
              <span style={{ color: "#E85A29" }}>Colaboradores</span>
            </h2>
            <p className="text-gray-500 text-sm">Ingresa tus credenciales para continuar</p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Número de Empleado
              </label>
              <GlowInput
                icon={<UserCircle2 className="w-5 h-5" />}
                type="text"
                placeholder="Ej. UIX001"
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value)}
                required
              />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Contraseña
              </label>
              <GlowInput
                icon={<KeyRound className="w-5 h-5" />}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </motion.div>

            <motion.div variants={itemVariants} className="pt-2">
              <MagneticButton type="submit" disabled={isLoggingIn}>
                <AnimatePresence mode="wait">
                  {isLoggingIn ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <motion.div
                        className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      />
                      Autenticando...
                    </motion.div>
                  ) : (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      Ingresar
                      <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <ChevronRight className="w-5 h-5" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </MagneticButton>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.div variants={itemVariants} className="mt-10 pt-8 border-t border-gray-100 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sistema operativo · Soporte 24/7
            </div>
            <p className="text-xs text-gray-300 mt-1">Si no tienes acceso, contacta a tu HRBP</p>
          </motion.div>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes shimmer-text {
          0% { background-position: 0% 50% }
          100% { background-position: 200% 50% }
        }
      `}</style>
    </div>
  );
}
