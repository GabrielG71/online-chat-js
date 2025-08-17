"use client";
import { useEffect, useRef, useState } from "react";
import { Message } from "../types";

interface SSEData {
  type: "connected" | "new_message" | "typing_status" | "ping";
  message?: Message;
  senderId?: string;
  isTyping?: boolean;
}

interface UseSSEProps {
  otherUserId: string | null;
  onNewMessage: (message: Message) => void;
  onTypingStatusChange: (senderId: string, isTyping: boolean) => void;
}

export function useSSE({
  otherUserId,
  onNewMessage,
  onTypingStatusChange,
}: UseSSEProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    if (!otherUserId) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      // Corrigido: usar template strings corretamente
      const eventSource = new EventSource(
        `/api/chat/sse?userId=${otherUserId}`
      );

      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("SSE conectado");
        setIsConnected(true);
        setError(null);
      };

      eventSource.onmessage = (event) => {
        try {
          const data: SSEData = JSON.parse(event.data);

          switch (data.type) {
            case "connected":
              console.log("Conexão SSE estabelecida");
              break;
            case "new_message":
              if (data.message) {
                console.log("Nova mensagem recebida via SSE:", data.message);
                onNewMessage(data.message);
              }
              break;
            case "typing_status":
              if (data.senderId !== undefined && data.isTyping !== undefined) {
                console.log(
                  "Status de digitação recebido:",
                  data.senderId,
                  data.isTyping
                );
                onTypingStatusChange(data.senderId, data.isTyping);
              }
              break;
            case "ping":
              // Heartbeat - não fazer nada
              break;
            default:
              console.log("Tipo de mensagem SSE desconhecido:", data.type);
          }
        } catch (error) {
          console.error("Erro ao processar mensagem SSE:", error);
        }
      };

      eventSource.onerror = (event) => {
        console.error("Erro na conexão SSE:", event);
        setIsConnected(false);
        setError("Erro na conexão");

        // Tentar reconectar após 3 segundos
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("Tentando reconectar SSE...");
          connect();
        }, 3000);
      };
    } catch (error) {
      console.error("Erro ao criar conexão SSE:", error);
      setError("Erro ao conectar");
    }
  };

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setIsConnected(false);
  };

  useEffect(() => {
    if (otherUserId) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [otherUserId]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    error,
    reconnect: connect,
  };
}
