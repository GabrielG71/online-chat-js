import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIO } from "@/lib/socket";

export default function SocketHandler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new ServerIO(res.socket.server, {
      path: "/api/socket/io",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    const userSockets = new Map<string, string>();

    io.on("connection", (socket) => {
      console.log("New client connected:", socket.id);

      socket.on("join-room", (userId: string) => {
        console.log(`User ${userId} joined with socket ${socket.id}`);
        userSockets.set(userId, socket.id);
        socket.join(userId);
        
        socket.broadcast.emit("user-connected", userId);
      });

      socket.on("send-message", (data) => {
        const { receiverId, senderId, content } = data;
        console.log(`Message from ${senderId} to ${receiverId}: ${content}`);
        
        socket.to(receiverId).emit("new-message", data);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        
        const userId = Array.from(userSockets.entries())
          .find(([, socketId]) => socketId === socket.id)?.[0];
        
        if (userId) {
          userSockets.delete(userId);
          socket.broadcast.emit("user-disconnected", userId);
        }
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}
