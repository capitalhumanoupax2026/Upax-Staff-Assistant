import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "./use-toast";
import { mockLogin, getMockEmployee, setMockEmployee, clearMockEmployee, type MockEmployee } from "@/lib/mock-data";

export function useAuth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<MockEmployee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const stored = getMockEmployee();
    setUser(stored);
    setIsLoading(false);
  }, []);

  const login = ({ data }: { data: { employeeNumber: string; password: string } }) => {
    setIsLoggingIn(true);
    setTimeout(() => {
      const employee = mockLogin(data.employeeNumber, data.password);
      if (employee) {
        setMockEmployee(employee);
        setUser(employee);
        toast({
          title: "Acceso concedido",
          description: `Bienvenido, ${employee.name}`,
        });
        setLocation("/");
      } else {
        toast({
          variant: "destructive",
          title: "Error de acceso",
          description: "Número de empleado o contraseña incorrectos.",
        });
      }
      setIsLoggingIn(false);
    }, 600);
  };

  const logout = () => {
    clearMockEmployee();
    setUser(null);
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
