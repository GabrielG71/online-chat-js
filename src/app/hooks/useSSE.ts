"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Message } from "../types";

interface SSEData {
  type:
    | "connected"
    | "new_message"
    | "typing_status"
    | "ping"
    | "timeout"
    | "error";
  message?: Message;
  senderId?: string;
  isTyping?: boolean;
  timestamp?: number;
}

interface UseSSEProps {
  currentUserId?: string;
  onNewMessage: (message: Message) => void;
  onTypingStatusChange: (senderId: string, isTyping: boolean) => void;
}

export function useSSE({
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

  const MAX_RECONNECT_ATTEMPTS = 10;
  const BASE_RECONNECT_DELAY = 1000;
  const MAX_RECONNECT_DELAY = 30000;
  const CONNECTION_TIMEOUT = 15000;

  const cleanup = useCallback(() => {
    console.log("🧹 Limpando conexão SSE...");

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      const readyState = eventSourceRef.current.readyState;
      console.log(`🔌 Fechando conexão SSE (Estado: ${readyState})`);

      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    isConnectingRef.current = false;
    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    if (!currentUserId) {
      console.log("❌ Não é possível conectar: falta currentUserId");
      return;
    }

    if (isConnectingRef.current) {
      console.log("⚠️ Já está tentando conectar, ignorando...");
      return;
    }

    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.log("❌ Máximo de tentativas de reconexão atingido");
      setError(`Falha na conexão após ${MAX_RECONNECT_ATTEMPTS} tentativas`);
      return;
    }

    // Só fazer cleanup se não estiver conectado
    if (!isConnected) {
      cleanup();
    }

    isConnectingRef.current = true;

    const attempt = reconnectAttempts + 1;
    console.log(
      `🔄 Conexão SSE global para usuário: ${currentUserId} (Tentativa ${attempt})`
    );

    try {
      // Conexão SSE global - sem otherUserId específico
      const url = `/api/chat/sse?t=${Date.now()}`;
      console.log("📡 Conectando em:", url);

      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      const connectionTimeout = setTimeout(() => {
        if (!isConnected && eventSource.readyState !== EventSource.OPEN) {
          console.log("⏰ Timeout de conexão SSE");
          eventSource.close();
          setError("Timeout na conexão");
          isConnectingRef.current = false;
          scheduleReconnect();
        }
      }, CONNECTION_TIMEOUT);

      eventSource.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log(
          `✅ SSE conectado globalmente para usuário: ${currentUserId}`
        );

        setIsConnected(true);
        setError(null);
        setReconnectAttempts(0);
        isConnectingRef.current = false;
      };

      eventSource.onmessage = (event) => {
        try {
          const data: SSEData = JSON.parse(event.data);

          console.log(
            "📨 SSE recebido:",
            data.type,
            data.timestamp
              ? `(${new Date(data.timestamp).toLocaleTimeString()})`
              : ""
          );

          switch (data.type) {
            case "connected":
              console.log("🔗 Conexão SSE confirmada pelo servidor");
              break;

            case "new_message":
              if (data.message) {
                console.log("💬 Nova mensagem via SSE:", data.message.id);
                onNewMessage(data.message);
              }
              break;

            case "typing_status":
              if (data.senderId !== undefined && data.isTyping !== undefined) {
                console.log(
                  "⌨️ Status digitação:",
                  data.senderId,
                  data.isTyping
                );
                onTypingStatusChange(data.senderId, data.isTyping);
              }
              break;

            case "ping":
              console.log("💓 Heartbeat recebido");
              break;

            case "timeout":
              console.log("⏰ Servidor vai desconectar, reconectando...");
              scheduleReconnect();
              break;

            case "error":
              console.log("❌ Erro do servidor SSE");
              setError("Erro do servidor");
              scheduleReconnect();
              break;

            default:
              console.log("❓ Tipo SSE desconhecido:", data.type);
          }
        } catch (error) {
          console.error("❌ Erro ao processar SSE:", error);
          console.log("📄 Dados brutos:", event.data);
        }
      };

      eventSource.onerror = (event) => {
        clearTimeout(connectionTimeout);
        const readyState = eventSource.readyState;

        console.error(`❌ Erro SSE (Estado: ${readyState}):`, event);

        setIsConnected(false);
        isConnectingRef.current = false;

        if (readyState === EventSource.CLOSED) {
          scheduleReconnect();
        }
      };
    } catch (error) {
      console.error("💥 Erro ao criar EventSource:", error);
      setError("Erro ao conectar");
      isConnectingRef.current = false;
      scheduleReconnect();
    }
  }, [
    currentUserId,
    reconnectAttempts,
    onNewMessage,
    onTypingStatusChange,
    isConnected,
    cleanup,
  ]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.log("❌ Não reconectando: limite atingido");
      return;
    }

    const newAttempts = reconnectAttempts + 1;
    setReconnectAttempts(newAttempts);

    const baseDelay = Math.min(
      BASE_RECONNECT_DELAY * Math.pow(2, newAttempts - 1),
      MAX_RECONNECT_DELAY
    );
    const jitter = Math.random() * 1000;
    const delay = baseDelay + jitter;

    console.log(
      `🔄 Reagendando reconexão em ${Math.round(
        delay
      )}ms (tentativa ${newAttempts})`
    );

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);

    setError(
      `Reconectando em ${Math.round(
        delay / 1000
      )}s... (${newAttempts}/${MAX_RECONNECT_ATTEMPTS})`
    );
  }, [reconnectAttempts, connect]);

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

  // Conectar apenas uma vez quando o usuário estiver disponível
  useEffect(() => {
    if (currentUserId) {
      connect();
    } else {
      disconnect();
    }

    return disconnect;
  }, [currentUserId]); // Remover outras dependências para evitar reconexões

  // Cleanup final
  useEffect(() => {
    return () => {
      console.log("🧹 Cleanup final useSSE");
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
