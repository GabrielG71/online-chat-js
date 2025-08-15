"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) {
      console.log("⏳ Aguardando sessão...");
      return;
    }

    console.log("🔌 Conectando ao Socket.IO...");
    
    const socketInstance = io({
      path: "/api/socket/io",
      addTrailingSlash: false,
    });

    socketInstance.on("connect", () => {
      console.log("✅ Conectado ao servidor!");
      setIsConnected(true);
      socketInstance.emit("join-room", session.user.id);
    });

    socketInstance.on("disconnect", () => {
      console.log("❌ Desconectado do servidor");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("❌ Erro de conexão:", error);
    });

    setSocket(socketInstance);

    return () => {
      console.log("🔌 Desconectando...");
      socketInstance.disconnect();
    };
  }, [session?.user?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
