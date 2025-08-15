import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponse } from "next";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: any & {
      io: ServerIO;
    };
  };
};

export default function SocketHandler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (res.socket.server.io) {
    console.log("✅ Socket já está rodando");
  } else {
    console.log("🚀 Iniciando Socket.IO...");
    const io = new ServerIO(res.socket.server, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    const userSockets = new Map<string, string>();

    io.on("connection", (socket) => {
      console.log("📱 Cliente conectado:", socket.id);

      socket.on("join-room", (userId: string) => {
        console.log(`👤 Usuário ${userId} entrou com socket ${socket.id}`);
        userSockets.set(userId, socket.id);
        socket.join(userId);
        socket.broadcast.emit("user-connected", userId);
      });

      socket.on("send-message", (data) => {
        const { receiverId, senderId, content, messageData } = data;
        console.log(`💬 Mensagem de ${senderId} para ${receiverId}: ${content}`);
        
        // Envia para o destinatário
        socket.to(receiverId).emit("new-message", messageData || data);
      });

      socket.on("disconnect", () => {
        console.log("❌ Cliente desconectado:", socket.id);
        
        const userId = Array.from(userSockets.entries())
          .find(([, socketId]) => socketId === socket.id)?.[0];
        
        if (userId) {
          userSockets.delete(userId);
          socket.broadcast.emit("user-disconnected", userId);
        }
      });
    });

    res.socket.server.io = io;
    console.log("✅ Socket.IO configurado com sucesso!");
  }
  res.end();
}
