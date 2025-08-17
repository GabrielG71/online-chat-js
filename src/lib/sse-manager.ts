const connections = new Map<
  string,
  ReadableStreamDefaultController<Uint8Array>
>();

export function addConnection(
  connectionKey: string,
  controller: ReadableStreamDefaultController<Uint8Array>
) {
  connections.set(connectionKey, controller);
}

export function removeConnection(connectionKey: string) {
  connections.delete(connectionKey);
}

export function hasConnection(connectionKey: string) {
  return connections.has(connectionKey);
}

export function getConnection(connectionKey: string) {
  return connections.get(connectionKey);
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
