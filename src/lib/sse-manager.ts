type SSEController = ReadableStreamDefaultController<Uint8Array>;

const connections = new Map<string, SSEController>();

export function addConnection(
  connectionKey: string,
  controller: SSEController
) {
  connections.set(connectionKey, controller);
  console.log(
    `Conexão adicionada: ${connectionKey}. Total: ${connections.size}`
  );
}

export function removeConnection(connectionKey: string) {
  connections.delete(connectionKey);
  console.log(`Conexão removida: ${connectionKey}. Total: ${connections.size}`);
}

export function broadcastMessage(
  senderId: string,
  receiverId: string,
  message: any
) {
  const connections_to_notify = [
    `${senderId}-${receiverId}`,
    `${receiverId}-${senderId}`,
  ];

  connections_to_notify.forEach((connectionKey) => {
    const controller = connections.get(connectionKey);
    if (controller) {
      try {
        const data = JSON.stringify({
          type: "new_message",
          message: message,
        });

        controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));

        console.log(`Mensagem enviada via SSE para: ${connectionKey}`);
      } catch (error) {
        console.error(
          `Erro ao enviar mensagem SSE para ${connectionKey}:`,
          error
        );
        connections.delete(connectionKey);
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
        senderId: senderId,
        isTyping: isTyping,
      });

      controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));

      console.log(`Status de digitação enviado via SSE para: ${connectionKey}`);
    } catch (error) {
      console.error(
        `Erro ao enviar status de digitação SSE para ${connectionKey}:`,
        error
      );
      connections.delete(connectionKey);
    }
  }
}
