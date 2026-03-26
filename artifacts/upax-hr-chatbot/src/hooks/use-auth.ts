import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "./use-toast";
import type { MockEmployee } from "@/lib/mock-data";

const SESSION_KEY = "upax_employee_v3";

function getStoredEmployee(): MockEmployee | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeEmployee(emp: MockEmployee) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(emp));
}

function clearStoredEmployee() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function useAuth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<MockEmployee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const stored = getStoredEmployee();
    if (stored) {
      setUser(stored);
      setIsLoading(false);
      return;
    }
    // Verificar sesión activa en el servidor
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((emp) => {
        if (emp) {
          const mapped = mapEmployee(emp);
          storeEmployee(mapped);
          setUser(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const login = async ({ data }: { data: { employeeNumber: string; password: string } }) => {
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeNumber: data.employeeNumber,
          password: data.password,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Error de acceso",
          description: body.message || "Número de empleado o contraseña incorrectos.",
        });
        return;
      }

      const employee = mapEmployee(body.employee);
      storeEmployee(employee);
      setUser(employee);
      toast({
        title: "Acceso concedido",
        description: `Bienvenido, ${employee.name}`,
      });
      setLocation("/");
    } catch {
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor. Intenta de nuevo.",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    clearStoredEmployee();
    setUser(null);
    fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
    setLocation("/login");
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    isLoggingIn,
    logout,
  };
}

// Mapear la respuesta del servidor al tipo MockEmployee del frontend
function mapEmployee(data: any): MockEmployee {
  return {
    id: 0,
    employeeNumber: data.employeeNumber ?? "",
    name: data.name ?? "",
    businessUnit: data.businessUnit ?? "",
    role: data.role ?? "",
    hrbpName: data.hrbpName ?? "",
    hrbpPhoto: data.hrbpPhoto ?? "",
    consultora: data.consultora || null,
    isInternal: data.isInternal ?? true,
    accentColor: data.accentColor ?? "#C2384E",
    logoUrl: data.logoUrl ?? "upax_logo_color.png",
  };
}
