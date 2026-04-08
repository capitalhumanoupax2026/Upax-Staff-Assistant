import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  category?: string | null;
}

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`/api${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.message || `HTTP ${res.status}`), { status: res.status });
  }
  return res.json();
}

const SESSION_KEY = "upax_employee_v3";

export function useChat() {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  // null = revisando, false = sin historial, true = tiene historial previo
  const [hasHistory, setHasHistory] = useState<boolean | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  function handleAuthError() {
    sessionStorage.removeItem(SESSION_KEY);
    setLocation("/login");
  }

  // Al montar: solo verificar si hay historial, sin cargarlo aún
  useEffect(() => {
    apiFetch("/chat/history")
      .then((data) => {
        const msgs: ChatMessage[] = data.messages || [];
        if (msgs.length > 0) {
          // Guardar historial en memoria pero no mostrarlo todavía
          setHasHistory(true);
          // Guardamos los mensajes del servidor para cargar si el usuario quiere continuar
          sessionStorage.setItem("upax_pending_history", JSON.stringify(msgs));
        } else {
          setHasHistory(false);
          setHistoryLoaded(true);
        }
      })
      .catch((err) => {
        if (err?.status === 401) {
          handleAuthError();
          return;
        }
        setHasHistory(false);
        setHistoryLoaded(true);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** El usuario quiere continuar la conversación anterior */
  const continueConversation = () => {
    const raw = sessionStorage.getItem("upax_pending_history");
    if (raw) {
      try {
        setMessages(JSON.parse(raw));
      } catch {
        setMessages([]);
      }
      sessionStorage.removeItem("upax_pending_history");
    }
    setHasHistory(false);
    setHistoryLoaded(true);
  };

  /** El usuario quiere empezar de cero */
  const startFresh = () => {
    sessionStorage.removeItem("upax_pending_history");
    setMessages([]);
    setHasHistory(false);
    setHistoryLoaded(true);
  };

  const sendMessage = (content: string, category?: string) => {
    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
      category: category || null,
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsSending(true);

    apiFetch("/chat/message", {
      method: "POST",
      body: JSON.stringify({ message: content, category }),
    })
      .then((data) => {
        setMessages((prev) => {
          const withoutTemp = prev.filter((m) => m.id !== tempUserMsg.id);
          return [
            ...withoutTemp,
            data.message as ChatMessage,
            data.response as ChatMessage,
          ];
        });
      })
      .catch((err) => {
        if (err?.status === 401) {
          handleAuthError();
          return;
        }
        const errMsg: ChatMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content: "Ocurrió un error al procesar tu pregunta. Por favor intenta de nuevo en un momento.",
          timestamp: new Date().toISOString(),
          category: null,
        };
        setMessages((prev) => [...prev, errMsg]);
      })
      .finally(() => setIsSending(false));
  };

  return {
    messages,
    hasHistory,
    historyLoaded,
    isSending,
    sendMessage,
    continueConversation,
    startFresh,
  };
}
