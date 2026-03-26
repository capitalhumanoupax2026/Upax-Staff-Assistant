import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Building2, KeyRound, UserCircle2, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

export default function LoginPage() {
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoggingIn, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeNumber || !password) return;
    login({ data: { employeeNumber, password } });
  };

  return (
    <div className="min-h-screen w-full flex bg-background relative overflow-hidden">

      {/* Background subtle grid */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow orbs */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full z-0 opacity-10 blur-[120px]"
        style={{ background: "radial-gradient(circle, #E85A29 0%, #C2384E 60%, transparent 100%)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full z-0 opacity-8 blur-[100px]"
        style={{ background: "radial-gradient(circle, #C2384E 0%, transparent 70%)" }}
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">

          {/* Left Column: Branding */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:flex flex-col justify-center"
          >
            {/* Logo on brand-colored rounded container */}
            <div className="mb-10 w-56">
              <div className="rounded-2xl px-5 py-4" style={{ background: "linear-gradient(135deg, #fff 60%, #fde8df 100%)" }}>
                <img
                  src={`${import.meta.env.BASE_URL}upax_logo_color.png`}
                  alt="Grupo UPAX"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>

            <h1 className="text-5xl font-display font-bold leading-tight mb-6">
              El futuro de <br />
              <span className="upax-gradient-text">Capital Humano</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-md leading-relaxed">
              Tu asistente personal impulsado por IA para resolver dudas, gestionar procesos y mantenerte conectado con tu UDN.
            </p>
          </motion.div>

          {/* Right Column: Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="glass-panel p-8 sm:p-12 rounded-[2rem] relative overflow-hidden">
              {/* UPAX gradient top line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] upax-gradient" />

              {/* Mobile logo */}
              <div className="lg:hidden mb-8 mx-auto w-44">
                <div className="rounded-xl px-4 py-3" style={{ background: "linear-gradient(135deg, #fff 60%, #fde8df 100%)" }}>
                  <img
                    src={`${import.meta.env.BASE_URL}upax_logo_color.png`}
                    alt="Grupo UPAX"
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>

              <div className="text-center lg:text-left mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold font-display mb-2">Acceso Colaboradores</h2>
                <p className="text-muted-foreground text-sm">Ingresa tus credenciales para continuar</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider ml-1">
                    Número de Empleado
                  </label>
                  <div className="relative">
                    <UserCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Ej. UIX001"
                      className="pl-12 bg-black/40 border-white/8 h-14 rounded-2xl focus-visible:ring-[#E85A29] focus-visible:border-[#E85A29]/50"
                      value={employeeNumber}
                      onChange={(e) => setEmployeeNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider ml-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="pl-12 bg-black/40 border-white/8 h-14 rounded-2xl focus-visible:ring-[#E85A29] focus-visible:border-[#E85A29]/50"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full h-14 rounded-2xl text-base font-semibold mt-2 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                  style={{ background: "linear-gradient(135deg, #C2384E 0%, #E85A29 100%)" }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                    {isLoggingIn ? (
                      "Autenticando..."
                    ) : (
                      <>
                        Ingresar
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/8 text-center">
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Si no conoces tu acceso, contacta a tu HRBP
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
