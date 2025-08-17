import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addConnection, removeConnection } from "@/lib/sse-manager";

// CRÍTICO: Forçar runtime Node.js no Vercel
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutos (máximo no Vercel)

export async function GET(request: NextRequest) {
  console.log("🚀 Iniciando conexão SSE...");

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log("❌ Não autorizado");
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get("userId");

    if (!otherUserId) {
      console.log("❌ User ID obrigatório");
      return new Response("User ID required", { status: 400 });
    }

    const connectionKey = `${session.user.id}-${otherUserId}`;
    console.log(`🔗 Criando conexão SSE: ${connectionKey}`);

    // Headers específicos para Vercel
    const responseHeaders = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Nginx buffering
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
      "Access-Control-Allow-Credentials": "true",
    };

    let isConnectionClosed = false;

    const stream = new ReadableStream({
      start(controller) {
        console.log(`✅ Stream iniciado para: ${connectionKey}`);

        // Adicionar conexão ao gerenciador
        addConnection(connectionKey, controller);

        // Enviar evento de conexão inicial
        try {
          const connectData = `data: ${JSON.stringify({
            type: "connected",
            timestamp: Date.now(),
          })}\n\n`;

          controller.enqueue(new TextEncoder().encode(connectData));
          console.log(`📤 Evento 'connected' enviado para: ${connectionKey}`);
        } catch (error) {
          console.error("❌ Erro ao enviar evento inicial:", error);
        }

        // Heartbeat para manter conexão viva
        const heartbeatInterval = setInterval(() => {
          if (isConnectionClosed) {
            clearInterval(heartbeatInterval);
            return;
          }

          try {
            const pingData = `data: ${JSON.stringify({
              type: "ping",
              timestamp: Date.now(),
            })}\n\n`;

            controller.enqueue(new TextEncoder().encode(pingData));
            console.log(`💓 Heartbeat enviado para: ${connectionKey}`);
          } catch (error) {
            console.error("❌ Erro no heartbeat:", error);
            clearInterval(heartbeatInterval);
            removeConnection(connectionKey);
            isConnectionClosed = true;

            try {
              controller.close();
            } catch (closeError) {
              console.error("❌ Erro ao fechar controller:", closeError);
            }
          }
        }, 25000); // 25s para evitar timeout do Vercel

        // Cleanup quando cliente desconecta
        request.signal.addEventListener("abort", () => {
          console.log(`🔌 Cliente desconectou: ${connectionKey}`);
          clearInterval(heartbeatInterval);
          removeConnection(connectionKey);
          isConnectionClosed = true;

          try {
            controller.close();
          } catch (error) {
            console.error("❌ Erro ao fechar no abort:", error);
          }
        });

        // Timeout de segurança (4.5min para ficar abaixo do limite do Vercel)
        const timeoutId = setTimeout(() => {
          console.log(`⏰ Timeout de conexão: ${connectionKey}`);
          clearInterval(heartbeatInterval);
          removeConnection(connectionKey);
          isConnectionClosed = true;

          try {
            // Enviar evento de timeout antes de fechar
            const timeoutData = `data: ${JSON.stringify({
              type: "timeout",
              message: "Reconectando...",
            })}\n\n`;

            controller.enqueue(new TextEncoder().encode(timeoutData));
            controller.close();
          } catch (error) {
            console.error("❌ Erro no timeout:", error);
          }
        }, 270000); // 4.5 minutos

        // Cleanup do timeout se conexão fechar antes
        const originalClose = controller.close.bind(controller);
        controller.close = () => {
          clearTimeout(timeoutId);
          clearInterval(heartbeatInterval);
          isConnectionClosed = true;
          originalClose();
        };
      },

      cancel(reason) {
        console.log(`❌ Stream cancelado: ${connectionKey}`, reason);
        removeConnection(connectionKey);
        isConnectionClosed = true;
      },
    });

    console.log(`🎯 Retornando response para: ${connectionKey}`);
    return new Response(stream, { headers: responseHeaders });
  } catch (error) {
    console.error("💥 Erro crítico no SSE:", error);
    return new Response(
      `data: ${JSON.stringify({
        type: "error",
        message: "Internal Server Error",
      })}\n\n`,
      {
        status: 500,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      }
    );
  }
}
