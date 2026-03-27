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
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSending, setIsSending] = useState(false);

  function handleAuthError() {
    sessionStorage.removeItem(SESSION_KEY);
    setLocation("/login");
  }

  // Carga el historial al montar
  useEffect(() => {
    apiFetch("/chat/history")
      .then((data) => {
        setMessages(data.messages || []);
      })
      .catch((err) => {
        if (err?.status === 401) {
          handleAuthError();
          return;
        }
        setMessages([]);
      })
      .finally(() => setIsLoadingHistory(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = (content: string, category?: string) => {
    // Mostrar el mensaje del usuario inmediatamente
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
        // Reemplazar el mensaje temporal con el real del servidor
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
        // Si el servidor falla, mostrar mensaje de error amigable
        const errMsg: ChatMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content:
            "Ocurrió un error al procesar tu pregunta. Por favor intenta de nuevo en un momento.",
          timestamp: new Date().toISOString(),
          category: null,
        };
        setMessages((prev) => [...prev, errMsg]);
      })
      .finally(() => setIsSending(false));
  };

  return {
    messages,
    isLoadingHistory,
    isSending,
    sendMessage,
  };
}
