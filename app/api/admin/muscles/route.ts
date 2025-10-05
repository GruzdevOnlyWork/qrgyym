// app/api/muscles/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";

export async function GET() {
  try {
    const muscles = await prisma.muscle.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(muscles);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch muscles" }, { status: 500 });
  }
}
