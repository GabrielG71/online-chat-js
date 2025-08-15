import { useState, useEffect } from "react";
import { User, Message } from "../types";
import { useSocket } from "../context/SocketContext";

export function useChatData(session: any) {
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (session) {
      fetchUsers();
    }
  }, [session]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser]);

  // Socket.IO listeners
  useEffect(() => {
    if (!socket || !session?.user?.id) return;

    console.log("🎧 Configurando listeners do Socket.IO");

    const handleNewMessage = (messageData: any) => {
      console.log("📨 Nova mensagem recebida:", messageData);
      
      // Só adiciona se for para a conversa atual
      if (selectedUser && 
          ((messageData.senderId === selectedUser.id && messageData.receiverId === session.user.id) ||
           (messageData.senderId === session.user.id && messageData.receiverId === selectedUser.id))) {
        
        setMessages((prev) => {
          const exists = prev.some(msg => msg.id === messageData.id);
          if (exists) return prev;
          return [...prev, messageData];
        });
      }
    };

    socket.on("new-message", handleNewMessage);

    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [socket, session?.user?.id, selectedUser]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
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
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    }
  };

  const sendMessage = async (content: string, receiverId: string) => {
    if (!session?.user?.id) return false;

    try {
      console.log("📤 Enviando mensagem...");

      // Salva no banco primeiro
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          receiverId,
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        console.log("✅ Mensagem salva:", newMessage);

        // Adiciona à UI imediatamente
        setMessages((prev) => {
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (exists) return prev;
          return [...prev, newMessage];
        });

        // Envia via Socket.IO para o destinatário
        if (socket && isConnected) {
          socket.emit("send-message", {
            content,
            receiverId,
            senderId: session.user.id,
            messageData: newMessage,
          });
          console.log("📡 Mensagem enviada via Socket.IO");
        }

        return true;
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
    return false;
  };

  return {
    users,
    messages,
    selectedUser,
    loading,
    setSelectedUser,
    sendMessage
  };
}
