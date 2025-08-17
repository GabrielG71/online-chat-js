import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { broadcastTypingStatus } from "@/lib/sse-manager";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { receiverId, isTyping } = body;

    if (!receiverId) {
      return NextResponse.json(
        { error: "ID do receptor é obrigatório" },
        { status: 400 }
      );
    }

    broadcastTypingStatus(session.user.id, receiverId, isTyping);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar status de digitação:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
