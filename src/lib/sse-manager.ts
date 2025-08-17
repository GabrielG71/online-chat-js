type SSEController = ReadableStreamDefaultController<Uint8Array>;

interface Connection {
  controller: SSEController;
  userId: string;
  connectedAt: number;
}

const connections = new Map<string, Connection>();

function generateConnectionKey(userId1: string, userId2: string): string {
  // Sempre colocar o menor ID primeiro para consistência
  return userId1 < userId2 ? `${userId1}-${userId2}` : `${userId2}-${userId1}`;
}

function getConnectionKeysForUser(userId: string): string[] {
  const keys: string[] = [];
  connections.forEach((_, key) => {
    if (key.includes(userId)) {
      keys.push(key);
    }
  });
  return keys;
}

export function addConnection(
  connectionKey: string,
  controller: SSEController
) {
  const [userId] = connectionKey.split("-");

  const oldKeys = getConnectionKeysForUser(userId);
  oldKeys.forEach((key) => {
    const oldConnection = connections.get(key);
    if (oldConnection && oldConnection.userId === userId) {
      try {
        oldConnection.controller.close();
      } catch (error) {
        console.log(`Conexão antiga fechada: ${key}`);
      }
      connections.delete(key);
    }
  });

  connections.set(connectionKey, {
    controller,
    userId,
    connectedAt: Date.now(),
  });

  console.log(
    `✅ Conexão adicionada: ${connectionKey} (User: ${userId}). Total: ${connections.size}`
  );
}

export function removeConnection(connectionKey: string) {
  const connection = connections.get(connectionKey);
  if (connection) {
    try {
      connection.controller.close();
    } catch (error) {}
  }

  connections.delete(connectionKey);
  console.log(
    `❌ Conexão removida: ${connectionKey}. Total: ${connections.size}`
  );
}

export function broadcastMessage(
  senderId: string,
  receiverId: string,
  message: any
) {
  console.log(`📤 Broadcasting message from ${senderId} to ${receiverId}`);

  // Gerar chave de conexão consistente
  const baseKey = generateConnectionKey(senderId, receiverId);

  const relevantConnections: string[] = [];
  connections.forEach((connection, key) => {
    if (key.includes(senderId) || key.includes(receiverId)) {
      relevantConnections.push(key);
    }
  });

  console.log(
    `🔍 Conexões encontradas para broadcast: ${relevantConnections.join(", ")}`
  );

  let messagesSent = 0;
  relevantConnections.forEach((connectionKey) => {
    const connection = connections.get(connectionKey);
    if (connection) {
      try {
        const data = JSON.stringify({
          type: "new_message",
          message: message,
        });

        connection.controller.enqueue(
          new TextEncoder().encode(`data: ${data}\n\n`)
        );

        messagesSent++;
        console.log(`✅ Mensagem enviada via SSE para: ${connectionKey}`);
      } catch (error) {
        console.error(
          `❌ Erro ao enviar mensagem SSE para ${connectionKey}:`,
          error
        );
        connections.delete(connectionKey);
      }
    }
  });

  console.log(`📊 Total de mensagens enviadas: ${messagesSent}`);
}

export function broadcastTypingStatus(
  senderId: string,
  receiverId: string,
  isTyping: boolean
) {
  console.log(
    `⌨️ Broadcasting typing status: ${senderId} -> ${receiverId} (${isTyping})`
  );

  let statusSent = 0;
  connections.forEach((connection, key) => {
    // Se a conexão é do receptor e inclui o sender
    if (connection.userId === receiverId && key.includes(senderId)) {
      try {
        const data = JSON.stringify({
          type: "typing_status",
          senderId: senderId,
          isTyping: isTyping,
        });

        connection.controller.enqueue(
          new TextEncoder().encode(`data: ${data}\n\n`)
        );

        statusSent++;
        console.log(`✅ Status de digitação enviado via SSE para: ${key}`);
      } catch (error) {
        console.error(
          `❌ Erro ao enviar status de digitação SSE para ${key}:`,
          error
        );
        connections.delete(key);
      }
    }
  });

  console.log(`📊 Total de status enviados: ${statusSent}`);
}

export function listActiveConnections() {
  console.log("🔍 Conexões ativas:");
  connections.forEach((connection, key) => {
    console.log(
      `  - ${key} (User: ${connection.userId}, Connected: ${new Date(
        connection.connectedAt
      ).toLocaleTimeString()})`
    );
  });
}
