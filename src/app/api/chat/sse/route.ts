import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const connections = new Map<
  string,
  ReadableStreamDefaultController<Uint8Array>
>();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get("userId");

    if (!otherUserId) {
      return new Response("User ID required", { status: 400 });
    }

    const connectionKey = `${session.user.id}-${otherUserId}`;

    const stream = new ReadableStream({
      start(controller) {
        connections.set(connectionKey, controller);

        const data = JSON.stringify({ type: "connected" });
        controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));

        const heartbeat = setInterval(() => {
          try {
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({ type: "ping" })}\n\n`
              )
            );
          } catch (error) {
            clearInterval(heartbeat);
            connections.delete(connectionKey);
          }
        }, 30000);

        request.signal.addEventListener("abort", () => {
          clearInterval(heartbeat);
          connections.delete(connectionKey);
          try {
            controller.close();
          } catch (error) {}
        });
      },
      cancel() {
        connections.delete(connectionKey);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      },
    });
  } catch (error) {
    console.error("Erro no SSE:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export function broadcastMessage(
  senderId: string,
  receiverId: string,
  message: any
) {
  const connectionKey1 = `${senderId}-${receiverId}`;
  const connectionKey2 = `${receiverId}-${senderId}`;

  const messageData = JSON.stringify({
    type: "new_message",
    message,
  });

  [connectionKey1, connectionKey2].forEach((key) => {
    const controller = connections.get(key);
    if (controller) {
      try {
        controller.enqueue(
          new TextEncoder().encode(`data: ${messageData}\n\n`)
        );
      } catch (error) {
        console.error(`Erro ao enviar para ${key}:`, error);
        connections.delete(key);
      }
    }
  });
}

export function broadcastTypingStatus(
  senderId: string,
  receiverId: string,
  isTyping: boolean
) {
  const connectionKey = `${receiverId}-${senderId}`;
  const controller = connections.get(connectionKey);

  if (controller) {
    try {
      const data = JSON.stringify({
        type: "typing_status",
        senderId,
        isTyping,
      });
      controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
    } catch (error) {
      console.error("Erro ao enviar status de digitação:", error);
      connections.delete(connectionKey);
    }
  }
}
