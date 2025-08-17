import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addConnection, removeConnection } from "@/lib/sse-manager";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  console.log("🚀 [SSE] Iniciando conexão...");

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log("❌ [SSE] Não autorizado");
      return new Response("Unauthorized", { status: 401 });
    }

    // Conexão global para o usuário (não específica para conversa)
    const connectionKey = `user-${session.user.id}`;
    console.log(`🔗 [SSE] Criando conexão global: ${connectionKey}`);

    const responseHeaders = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
      "Access-Control-Allow-Credentials": "true",
    };

    let isConnectionClosed = false;

    const stream = new ReadableStream({
      start(controller) {
        console.log(`✅ [SSE] Stream iniciado para: ${connectionKey}`);

        // Adicionar conexão ao gerenciador
        addConnection(connectionKey, controller);

        // Enviar evento de conexão inicial
        try {
          const connectData = `data: ${JSON.stringify({
            type: "connected",
            timestamp: Date.now(),
            userId: session.user.id,
          })}\n\n`;

          controller.enqueue(new TextEncoder().encode(connectData));
          console.log(
            `📤 [SSE] Evento 'connected' enviado para: ${connectionKey}`
          );
        } catch (error) {
          console.error("❌ [SSE] Erro ao enviar evento inicial:", error);
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
            console.log(`💓 [SSE] Heartbeat enviado para: ${connectionKey}`);
          } catch (error) {
            console.error("❌ [SSE] Erro no heartbeat:", error);
            clearInterval(heartbeatInterval);
            removeConnection(connectionKey);
            isConnectionClosed = true;

            try {
              controller.close();
            } catch (closeError) {
              console.error("❌ [SSE] Erro ao fechar controller:", closeError);
            }
          }
        }, 25000);

        // Cleanup quando cliente desconecta
        request.signal.addEventListener("abort", () => {
          console.log(`🔌 [SSE] Cliente desconectou: ${connectionKey}`);
          clearInterval(heartbeatInterval);
          removeConnection(connectionKey);
          isConnectionClosed = true;

          try {
            controller.close();
          } catch (error) {
            console.error("❌ [SSE] Erro ao fechar no abort:", error);
          }
        });

        // Timeout de segurança
        const timeoutId = setTimeout(() => {
          console.log(`⏰ [SSE] Timeout de conexão: ${connectionKey}`);
          clearInterval(heartbeatInterval);
          removeConnection(connectionKey);
          isConnectionClosed = true;

          try {
            const timeoutData = `data: ${JSON.stringify({
              type: "timeout",
              message: "Reconectando...",
            })}\n\n`;

            controller.enqueue(new TextEncoder().encode(timeoutData));
            controller.close();
          } catch (error) {
            console.error("❌ [SSE] Erro no timeout:", error);
          }
        }, 270000);

        // Cleanup do timeout
        const originalClose = controller.close.bind(controller);
        controller.close = () => {
          clearTimeout(timeoutId);
          clearInterval(heartbeatInterval);
          isConnectionClosed = true;
          originalClose();
        };
      },

      cancel(reason) {
        console.log(`❌ [SSE] Stream cancelado: ${connectionKey}`, reason);
        removeConnection(connectionKey);
        isConnectionClosed = true;
      },
    });

    console.log(`🎯 [SSE] Retornando response para: ${connectionKey}`);
    return new Response(stream, { headers: responseHeaders });
  } catch (error) {
    console.error("💥 [SSE] Erro crítico:", error);
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
