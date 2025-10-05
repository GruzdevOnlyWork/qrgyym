import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";

export async function GET() {
  try {
    const difficulties = await prisma.difficulty.findMany({
      orderBy: { name: "asc" },
    });
    const dataWithStringId = difficulties.map((d) => ({
      ...d,
      id: d.id.toString(),
    }));

    return NextResponse.json(dataWithStringId);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка получения данных" }, { status: 500 });
  }
}
