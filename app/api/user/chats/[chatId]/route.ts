import { getAuthorizedChats } from "@/app/api/lib/authChats";
import { db } from "@/db";
import { chatsTable, messagesTable } from "@/db/schema/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } },
) {
  try {
    const { chatId } = params;
    const chat = await getAuthorizedChats({ params: { chatId } });

    if (chat instanceof NextResponse) {
      return chat;
    }

    const messages = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.chatId, chatId));

    return NextResponse.json(
      {
        message: "Messages fetched successfully",
        messages: messages,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error while fetching messages", error: error },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { chatId: string } },
) {
  try {
    const { title } = await request.json();
    const { chatId } = params;

    const chat = await getAuthorizedChats({ params: { chatId } });
    if (chat instanceof NextResponse) {
      return chat;
    }

    const updated = await db
      .update(chatsTable)
      .set({ title: title })
      .where(eq(chatsTable.id, chatId));

    return NextResponse.json(
      { message: "Title updated successfully", chat: updated },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error while updating chat", error: error },
      { status: 500 },
    );
  }
}