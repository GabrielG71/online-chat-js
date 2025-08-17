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
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handlers para SSE
  const handleNewMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      // Verificar se a mensagem já existe para evitar duplicatas
      if (prev.some((m) => m.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  const handleTypingStatusChange = useCallback(
    (senderId: string, isTyping: boolean) => {
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

  // Hook SSE
  const { isConnected, error: sseError } = useSSE({
    otherUserId: selectedUser?.id || null,
    onNewMessage: handleNewMessage,
    onTypingStatusChange: handleTypingStatusChange,
  });

  // Buscar usuários
  useEffect(() => {
    if (session?.user?.id) {
      fetchUsers();
    }
  }, [session]);

  // Buscar mensagens quando usuário é selecionado
  useEffect(() => {
    if (selectedUser && session?.user?.id) {
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser, session]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const fetchedUsers = await response.json();
        setUsers(fetchedUsers);
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const response = await fetch(`/api/messages?userId=${userId}`);
      if (response.ok) {
        const fetchedMessages = await response.json();
        setMessages(fetchedMessages);
      }
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    }
  };

  const sendMessage = async (
    content: string,
    receiverId: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, receiverId }),
      });

      if (response.ok) {
        // A mensagem será adicionada automaticamente via SSE
        // mas podemos adicionar localmente para feedback imediato
        const newMessage = await response.json();

        // Adicionar mensagem localmente se não foi recebida via SSE ainda
        setMessages((prev) => {
          if (!prev.some((m) => m.id === newMessage.id)) {
            return [...prev, newMessage];
          }
          return prev;
        });

        return true;
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
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
    } catch (error) {
      console.error("Erro ao enviar status de digitação:", error);
    }
  };

  const handleTyping = (receiverId: string) => {
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
  };

  const isUserTyping = (userId: string) => {
    return typingUsers.has(userId);
  };

  return {
    users,
    messages,
    selectedUser,
    loading,
    isConnected,
    sseError,
    typingUsers,
    setSelectedUser,
    sendMessage,
    handleTyping,
    isUserTyping,
  };
}
