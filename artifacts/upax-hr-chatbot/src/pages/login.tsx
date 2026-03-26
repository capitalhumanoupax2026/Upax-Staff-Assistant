import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Building2, KeyRound, UserCircle2 } from "lucide-react";
import { useLocation } from "wouter";

export default function LoginPage() {
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoggingIn, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if already authenticated
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
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/login-bg.png`} 
          alt="Abstract Tech Background" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-background"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Left Column: Branding */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:flex flex-col justify-center"
          >
            <div className="mb-8 w-48">
               {/* using static upax logo for login */}
               <img src={`${import.meta.env.BASE_URL}upax_logo_1774489769957.png`} alt="Grupo UPAX" className="w-full h-auto brightness-0 invert" />
            </div>
            <h1 className="text-5xl font-display font-bold leading-tight mb-6">
              El futuro de <br/>
              <span className="text-primary glow-text">Capital Humano</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-md">
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
              {/* Subtle top glow line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
              
              <div className="lg:hidden mb-8 w-32 mx-auto">
                 <img src={`${import.meta.env.BASE_URL}upax_logo_1774489769957.png`} alt="Grupo UPAX" className="w-full h-auto brightness-0 invert" />
              </div>

              <div className="text-center lg:text-left mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold font-display mb-2">Acceso Colaboradores</h2>
                <p className="text-muted-foreground text-sm">Ingresa tus credenciales para continuar</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider ml-1">Número de Empleado</label>
                  <div className="relative">
                    <UserCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input 
                      type="text" 
                      placeholder="Ej. UX-1024"
                      className="pl-12 bg-black/50 border-white/10 h-14 rounded-2xl"
                      value={employeeNumber}
                      onChange={(e) => setEmployeeNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider ml-1">Contraseña</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input 
                      type="password" 
                      placeholder="••••••••"
                      className="pl-12 bg-black/50 border-white/10 h-14 rounded-2xl"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-14 rounded-2xl text-base mt-4 bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? "Autenticando..." : "Ingresar"}
                </Button>
              </form>

              <div className="mt-10 pt-6 border-t border-white/10 text-center">
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
