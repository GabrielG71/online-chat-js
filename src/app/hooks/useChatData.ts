"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { User, Message } from "../types";
import { useSSE } from "./useSSE";
import { Session } from "next-auth";

export function useChatData(session: Session | null) {
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // Refs para evitar race conditions
  const messagesRef = useRef<Message[]>([]);
  const pendingMessagesRef = useRef<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sincronizar ref com state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Handler para novas mensagens via SSE
  const handleNewMessage = useCallback((message: Message) => {
    console.log("🔄 Processando nova mensagem SSE:", message.id);

    setMessages((prevMessages) => {
      // Verificar se mensagem já existe
      if (prevMessages.some((m) => m.id === message.id)) {
        console.log("⚠️ Mensagem já existe no estado:", message.id);
        return prevMessages;
      }

      // Remover da lista de mensagens pendentes
      pendingMessagesRef.current.delete(message.id);

      console.log("✅ Adicionando nova mensagem ao estado:", message.id);
      return [...prevMessages, message].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });
  }, []);

  // Handler para status de digitação
  const handleTypingStatusChange = useCallback(
    (senderId: string, isTyping: boolean) => {
      console.log(
        `⌨️ Mudança de status de digitação: ${senderId} -> ${isTyping}`
      );

      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(senderId);
        } else {
          newSet.delete(senderId);
        }
        return newSet;
      });
    },
    []
  );

  // Hook SSE com logs melhorados
  const {
    isConnected,
    error: sseError,
    reconnectAttempts,
  } = useSSE({
    otherUserId: selectedUser?.id || null,
    currentUserId: session?.user?.id,
    onNewMessage: handleNewMessage,
    onTypingStatusChange: handleTypingStatusChange,
  });

  // Log do estado da conexão SSE
  useEffect(() => {
    if (selectedUser) {
      console.log(
        `📡 Estado SSE - Conectado: ${isConnected}, Erro: ${sseError}, Tentativas: ${reconnectAttempts}`
      );
    }
  }, [isConnected, sseError, reconnectAttempts, selectedUser]);

  // Buscar usuários
  useEffect(() => {
    if (session?.user?.id) {
      fetchUsers();
    }
  }, [session]);

  // Buscar mensagens quando usuário é selecionado
  useEffect(() => {
    if (selectedUser && session?.user?.id) {
      console.log(`🔄 Usuário selecionado mudou para: ${selectedUser.id}`);
      fetchMessages(selectedUser.id);
      // Limpar mensagens pendentes e usuários digitando
      pendingMessagesRef.current.clear();
      setTypingUsers(new Set());
    }
  }, [selectedUser, session]);

  const fetchUsers = async () => {
    try {
      console.log("👥 Buscando usuários...");
      const response = await fetch("/api/users");
      if (response.ok) {
        const fetchedUsers = await response.json();
        setUsers(fetchedUsers);
        console.log(`✅ ${fetchedUsers.length} usuários carregados`);
      }
    } catch (error) {
      console.error("❌ Erro ao buscar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      console.log(`💬 Buscando mensagens para usuário: ${userId}`);
      const response = await fetch(`/api/messages?userId=${userId}`);
      if (response.ok) {
        const fetchedMessages = await response.json();
        setMessages(fetchedMessages);
        console.log(`✅ ${fetchedMessages.length} mensagens carregadas`);
      }
    } catch (error) {
      console.error("❌ Erro ao buscar mensagens:", error);
    }
  };

  const sendMessage = async (
    content: string,
    receiverId: string
  ): Promise<boolean> => {
    try {
      console.log(`📤 Enviando mensagem para: ${receiverId}`);

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, receiverId }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        console.log(`✅ Mensagem enviada via API: ${newMessage.id}`);

        // Marcar como mensagem pendente para evitar duplicação via SSE
        pendingMessagesRef.current.add(newMessage.id);

        // Adicionar mensagem imediatamente ao estado (feedback instantâneo)
        setMessages((prev) => {
          if (!prev.some((m) => m.id === newMessage.id)) {
            return [...prev, newMessage].sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );
          }
          return prev;
        });

        // Remover da lista de pendentes após um tempo (caso não chegue via SSE)
        setTimeout(() => {
          pendingMessagesRef.current.delete(newMessage.id);
        }, 5000);

        return true;
      } else {
        console.error("❌ Erro na resposta da API:", response.status);
      }
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem:", error);
    }
    return false;
  };

  const sendTypingStatus = async (receiverId: string, isTyping: boolean) => {
    try {
      await fetch("/api/chat/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId, isTyping }),
      });
      console.log(
        `⌨️ Status de digitação enviado: ${isTyping} para ${receiverId}`
      );
    } catch (error) {
      console.error("❌ Erro ao enviar status de digitação:", error);
    }
  };

  const handleTyping = useCallback((receiverId: string) => {
    // Enviar que está digitando
    sendTypingStatus(receiverId, true);

    // Limpar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Definir que parou de digitar após 2 segundos
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(receiverId, false);
    }, 2000);
  }, []);

  const isUserTyping = useCallback(
    (userId: string) => {
      return typingUsers.has(userId);
    },
    [typingUsers]
  );

  return {
    users,
    messages,
    selectedUser,
    loading,
    isConnected,
    sseError,
    reconnectAttempts,
    typingUsers,
    setSelectedUser,
    sendMessage,
    handleTyping,
    isUserTyping,
  };
}
