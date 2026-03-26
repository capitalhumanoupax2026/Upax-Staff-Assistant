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
    if (isAuthenticated) setLocation("/");
  }, [isAuthenticated, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeNumber || !password) return;
    login({ data: { employeeNumber, password } });
  };

  return (
    <div className="min-h-screen w-full flex">

      {/* LEFT PANEL — Brand gradient */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #1a0a0e 0%, #6b1020 30%, #C2384E 65%, #E85A29 100%)" }}
      >
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Large faint UPAX mark in background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <img
            src="/upax_logo_color.png"
            alt=""
            className="w-[500px] brightness-0 invert"
          />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-12">
          {/* Logo on white pill */}
          <div className="bg-white rounded-2xl px-8 py-5 shadow-2xl mb-12">
            <img
              src="/upax_logo_color.png"
              alt="Grupo UPAX"
              className="h-12 w-auto object-contain"
            />
          </div>

          <h1 className="text-4xl xl:text-5xl font-display font-bold text-white leading-tight mb-6">
            El futuro de<br />Capital Humano
          </h1>
          <p className="text-white/80 text-lg max-w-sm leading-relaxed">
            Tu asistente personal impulsado por IA para resolver dudas y mantenerte conectado con tu UDN.
          </p>

          {/* Decorative dots */}
          <div className="flex gap-2 mt-12">
            <span className="w-2 h-2 rounded-full bg-white/60" />
            <span className="w-2 h-2 rounded-full bg-white/30" />
            <span className="w-2 h-2 rounded-full bg-white/30" />
          </div>
        </div>
      </motion.div>

      {/* RIGHT PANEL — White form */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12"
      >
        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <div
            className="rounded-2xl px-8 py-5 inline-block"
            style={{ background: "linear-gradient(135deg, #C2384E 0%, #E85A29 100%)" }}
          >
            <img
              src="/upax_logo_color.png"
              alt="Grupo UPAX"
              className="h-10 w-auto object-contain brightness-0 invert"
            />
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Acceso Colaboradores
            </h2>
            <p className="text-gray-500">Ingresa tus credenciales para continuar</p>
          </div>

          {/* Accent line */}
          <div
            className="h-1 w-12 rounded-full mb-10"
            style={{ background: "linear-gradient(90deg, #C2384E, #E85A29)" }}
          />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                Número de Empleado
              </label>
              <div className="relative">
                <UserCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ej. UIX001"
                  className="w-full pl-12 pr-4 h-14 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 text-base outline-none transition-all focus:border-[#E85A29] focus:ring-2 focus:ring-[#E85A29]/20 focus:bg-white"
                  value={employeeNumber}
                  onChange={(e) => setEmployeeNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                Contraseña
              </label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 h-14 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 text-base outline-none transition-all focus:border-[#E85A29] focus:ring-2 focus:ring-[#E85A29]/20 focus:bg-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-14 rounded-2xl text-base font-semibold mt-2 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-white shadow-lg"
              style={{
                background: "linear-gradient(135deg, #C2384E 0%, #E85A29 100%)",
                boxShadow: "0 8px 24px rgba(232, 90, 41, 0.35)",
              }}
            >
              {isLoggingIn ? (
                "Autenticando..."
              ) : (
                <>
                  Ingresar
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
              <Building2 className="w-4 h-4" />
              Si no conoces tu acceso, contacta a tu HRBP
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
