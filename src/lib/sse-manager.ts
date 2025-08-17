// lib/sse-manager.ts
type SSEController = ReadableStreamDefaultController<Uint8Array>;

interface Connection {
  controller: SSEController;
  userId: string;
  connectedAt: number;
}

// Armazenar conexões ativas com mais informações
const connections = new Map<string, Connection>();

// Função para gerar chave de conexão consistente
function generateConnectionKey(userId1: string, userId2: string): string {
  // Sempre colocar o menor ID primeiro para consistência
  return userId1 < userId2 ? `${userId1}-${userId2}` : `${userId2}-${userId1}`;
}

// Função para obter todas as chaves de conexão para um usuário
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
  // Extrair userId da chave de conexão
  const userId = connectionKey.replace("user-", "");

  // Remover conexão antiga do mesmo usuário
  if (connections.has(connectionKey)) {
    const oldConnection = connections.get(connectionKey);
    if (oldConnection) {
      try {
        oldConnection.controller.close();
        console.log(`🔄 [CONN] Conexão antiga fechada: ${connectionKey}`);
      } catch (error) {
        console.log(
          `⚠️ [CONN] Erro ao fechar conexão antiga: ${connectionKey}`
        );
      }
    }
  }

  // Adicionar nova conexão
  connections.set(connectionKey, {
    controller,
    userId,
    connectedAt: Date.now(),
  });

  console.log(
    `✅ [CONN] Adicionada: ${connectionKey} (User: ${userId}). Total: ${connections.size}`
  );
}

export function removeConnection(connectionKey: string) {
  const connection = connections.get(connectionKey);
  if (connection) {
    try {
      connection.controller.close();
    } catch (error) {
      // Ignore errors when closing
    }
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
  console.log(`📤 [BROADCAST] Mensagem de ${senderId} para ${receiverId}`);

  // Enviar para conexões globais dos usuários envolvidos
  const targetConnections = [
    `user-${senderId}`, // Para quem enviou (confirmação)
    `user-${receiverId}`, // Para quem vai receber
  ];

  console.log(
    `🔍 [BROADCAST] Procurando conexões: ${targetConnections.join(", ")}`
  );
  console.log(
    `🔍 [BROADCAST] Conexões ativas: ${Array.from(connections.keys()).join(
      ", "
    )}`
  );

  let messagesSent = 0;
  targetConnections.forEach((connectionKey) => {
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
        console.log(
          `✅ [BROADCAST] Mensagem enviada via SSE para: ${connectionKey}`
        );
      } catch (error) {
        console.error(
          `❌ [BROADCAST] Erro ao enviar para ${connectionKey}:`,
          error
        );
        connections.delete(connectionKey);
      }
    } else {
      console.log(`⚠️ [BROADCAST] Conexão não encontrada: ${connectionKey}`);
    }
  });

  console.log(
    `📊 [BROADCAST] Total de mensagens enviadas: ${messagesSent}/${targetConnections.length}`
  );
}

export function broadcastTypingStatus(
  senderId: string,
  receiverId: string,
  isTyping: boolean
) {
  console.log(
    `⌨️ [TYPING] Status de ${senderId} para ${receiverId}: ${isTyping}`
  );

  // Enviar apenas para o receptor
  const targetConnection = `user-${receiverId}`;
  const connection = connections.get(targetConnection);

  if (connection) {
    try {
      const data = JSON.stringify({
        type: "typing_status",
        senderId: senderId,
        isTyping: isTyping,
      });

      connection.controller.enqueue(
        new TextEncoder().encode(`data: ${data}\n\n`)
      );

      console.log(
        `✅ [TYPING] Status enviado via SSE para: ${targetConnection}`
      );
    } catch (error) {
      console.error(
        `❌ [TYPING] Erro ao enviar para ${targetConnection}:`,
        error
      );
      connections.delete(targetConnection);
    }
  } else {
    console.log(`⚠️ [TYPING] Conexão não encontrada: ${targetConnection}`);
  }
}

// Função para debug - listar todas as conexões ativas
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
