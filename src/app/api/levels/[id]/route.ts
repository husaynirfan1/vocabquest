import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { customLevels } from "@/lib/schema";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  await db
    .update(customLevels)
    .set({
      title: body.title,
      description: body.description,
      theme: body.theme,
      color: body.color,
      vocabulary: body.vocabulary,
      requiredXP: body.requiredXP,
      image: body.image,
    })
    .where(eq(customLevels.id, parseInt(id)));

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(customLevels).where(eq(customLevels.id, parseInt(id)));
  return NextResponse.json({ success: true });
}
