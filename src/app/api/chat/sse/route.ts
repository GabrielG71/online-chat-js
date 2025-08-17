import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addConnection, removeConnection } from "@/lib/sse-manager";

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
        addConnection(connectionKey, controller);

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
            removeConnection(connectionKey);
          }
        }, 30000);

        request.signal.addEventListener("abort", () => {
          clearInterval(heartbeat);
          removeConnection(connectionKey);
          try {
            controller.close();
          } catch (error) {
            console.error("Erro ao fechar controller:", error);
          }
        });
      },
      cancel() {
        removeConnection(connectionKey);
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
