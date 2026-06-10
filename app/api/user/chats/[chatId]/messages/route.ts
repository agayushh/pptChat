import { getAuthorizedChats } from "@/app/api/lib/authChats";
import { db } from "@/db";
import { messagesTable } from "@/db/schema/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } },
) {
  const chat = await getAuthorizedChats({ params });
  if (chat instanceof NextResponse) {
    return chat;
  }

  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.chatId, params.chatId));

  return NextResponse.json(
    { message: "Messages fetched successfully", messages },
    { status: 200 },
  );
}
export async function PUT(request: NextRequest, {params}: {params: {chatId: string}}){
  const chat = await getAuthorizedChats({params});
  if(chat instanceof NextResponse){
    return chat;
  }
  const {messageId, newContent} = await request.json();
  const updatedMessage = await db.update(messagesTable)
    .set({content: newContent})
    .where(eq(messagesTable.id, messageId));
  return NextResponse.json(
    { message: "Message updated successfully", updatedMessage },
    { status: 200 },
  );
}
