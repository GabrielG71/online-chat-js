"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Message } from "../types";

interface SSEData {
  type: "connected" | "new_message" | "typing_status" | "ping";
  message?: Message;
  senderId?: string;
  isTyping?: boolean;
}

interface UseSSEProps {
  otherUserId: string | null;
  currentUserId?: string;
  onNewMessage: (message: Message) => void;
  onTypingStatusChange: (senderId: string, isTyping: boolean) => void;
}

export function useSSE({
  otherUserId,
  currentUserId,
  onNewMessage,
  onTypingStatusChange,
}: UseSSEProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);
  const lastMessageIdRef = useRef<string>("");

  // Maximum reconnect attempts
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      console.log("🔌 Fechando conexão SSE existente");
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    isConnectingRef.current = false;
    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    if (!otherUserId || !currentUserId) {
      console.log("❌ Não é possível conectar: faltam IDs");
      return;
    }

    if (isConnectingRef.current) {
      console.log("⚠️ Já está tentando conectar...");
      return;
    }

    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.log("❌ Máximo de tentativas de reconexão atingido");
      setError("Falha na conexão após múltiplas tentativas");
      return;
    }

    cleanup();
    isConnectingRef.current = true;

    console.log(
      `🔄 Conectando SSE: ${currentUserId} -> ${otherUserId} (Tentativa ${
        reconnectAttempts + 1
      })`
    );

    try {
      const eventSource = new EventSource(
        `/api/chat/sse?userId=${otherUserId}`,
        { withCredentials: true }
      );

      eventSourceRef.current = eventSource;

      const connectionTimeout = setTimeout(() => {
        if (!isConnected) {
          console.log("⏰ Timeout de conexão SSE");
          eventSource.close();
          setError("Timeout na conexão");
        }
      }, 10000); // 10s timeout

      eventSource.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log("✅ SSE conectado com sucesso");
        setIsConnected(true);
        setError(null);
        setReconnectAttempts(0);
        isConnectingRef.current = false;
      };

      eventSource.onmessage = (event) => {
        try {
          const data: SSEData = JSON.parse(event.data);

          console.log("📨 Mensagem SSE recebida:", data.type, data);

          switch (data.type) {
            case "connected":
              console.log("🔗 Conexão SSE confirmada pelo servidor");
              break;

            case "new_message":
              if (data.message) {
                // Evitar mensagens duplicadas
                if (data.message.id !== lastMessageIdRef.current) {
                  console.log("💬 Nova mensagem via SSE:", data.message);
                  lastMessageIdRef.current = data.message.id;
                  onNewMessage(data.message);
                } else {
                  console.log(
                    "⚠️ Mensagem duplicada ignorada:",
                    data.message.id
                  );
                }
              }
              break;

            case "typing_status":
              if (data.senderId !== undefined && data.isTyping !== undefined) {
                console.log(
                  "⌨️ Status de digitação:",
                  data.senderId,
                  data.isTyping
                );
                onTypingStatusChange(data.senderId, data.isTyping);
              }
              break;

            case "ping":
              // Heartbeat recebido - conexão está ativa
              break;

            default:
              console.log("❓ Tipo de mensagem SSE desconhecido:", data.type);
          }
        } catch (error) {
          console.error(
            "❌ Erro ao processar mensagem SSE:",
            error,
            event.data
          );
        }
      };

      eventSource.onerror = (event) => {
        clearTimeout(connectionTimeout);
        console.error("❌ Erro na conexão SSE:", event);

        setIsConnected(false);
        isConnectingRef.current = false;

        const readyState = eventSource.readyState;
        console.log("📊 Estado da conexão:", readyState);

        if (readyState === EventSource.CLOSED) {
          console.log("🔄 Conexão fechada, tentando reconectar...");

          setReconnectAttempts((prev) => prev + 1);

          // Tentar reconectar com backoff exponencial
          const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttempts);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);

          setError(
            `Tentando reconectar... (${
              reconnectAttempts + 1
            }/${MAX_RECONNECT_ATTEMPTS})`
          );
        }
      };
    } catch (error) {
      console.error("❌ Erro ao criar conexão SSE:", error);
      setError("Erro ao conectar");
      isConnectingRef.current = false;
    }
  }, [
    otherUserId,
    currentUserId,
    reconnectAttempts,
    onNewMessage,
    onTypingStatusChange,
    isConnected,
    cleanup,
  ]);

  const disconnect = useCallback(() => {
    console.log("🔌 Desconectando SSE");
    cleanup();
    setReconnectAttempts(0);
    setError(null);
  }, [cleanup]);

  const forceReconnect = useCallback(() => {
    console.log("🔄 Forçando reconexão SSE");
    setReconnectAttempts(0);
    connect();
  }, [connect]);

  // Efeito principal para gerenciar conexão
  useEffect(() => {
    if (otherUserId && currentUserId) {
      connect();
    } else {
      disconnect();
    }

    return disconnect;
  }, [otherUserId, currentUserId, connect, disconnect]);

  // Cleanup final
  useEffect(() => {
    return () => {
      console.log("🧹 Cleanup final do useSSE");
      cleanup();
    };
  }, [cleanup]);

  return {
    isConnected,
    error,
    reconnectAttempts,
    reconnect: forceReconnect,
  };
}
