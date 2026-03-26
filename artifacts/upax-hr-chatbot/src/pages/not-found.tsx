import { AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="glass-panel rounded-3xl p-12 max-w-md mx-4 text-center border border-white/5">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Página no encontrada</h1>
        <p className="text-muted-foreground mb-8">
          La página que buscas no existe o no está disponible.
        </p>
        <button
          onClick={() => setLocation("/")}
          className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
