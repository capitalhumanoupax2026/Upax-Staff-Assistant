import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetCurrentEmployee, 
  useLogin, 
  useLogout,
  getGetCurrentEmployeeQueryKey 
} from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useToast } from "./use-toast";

export function useAuth() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user, isLoading, error } = useGetCurrentEmployee({
    query: {
      retry: false,
      staleTime: Infinity,
    }
  });

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        // Update cache manually or invalidate
        queryClient.setQueryData(getGetCurrentEmployeeQueryKey(), data.employee);
        toast({
          title: "Acceso concedido",
          description: `Bienvenido, ${data.employee.name}`,
        });
        setLocation("/");
      },
      onError: (err: any) => {
        toast({
          variant: "destructive",
          title: "Error de acceso",
          description: err?.response?.data?.message || "Credenciales inválidas. Verifica tu número de empleado.",
        });
      }
    }
  });

  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        queryClient.setQueryData(getGetCurrentEmployeeQueryKey(), null);
        queryClient.clear();
        setLocation("/login");
      }
    }
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
  };
}
