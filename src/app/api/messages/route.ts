import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { broadcastMessage } from "@/lib/sse-manager";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get("userId");

    if (!otherUserId) {
      return NextResponse.json(
        { error: "ID do usuário é obrigatório" },
        { status: 400 }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: session.user.id,
            receiverId: otherUserId,
          },
          {
            senderId: otherUserId,
            receiverId: session.user.id,
          },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { content, receiverId } = body;

    if (!content || !receiverId) {
      return NextResponse.json(
        { error: "Conteúdo e destinatário são obrigatórios" },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        receiverId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    broadcastMessage(session.user.id, receiverId, message);

    return NextResponse.json(message);
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
