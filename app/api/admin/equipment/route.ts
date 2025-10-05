import { NextResponse, type NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/prisma/prisma-client";
import { revalidatePath } from "next/cache";

const SECRET = process.env.SECRET_CODE || "";

function verifyToken(token: string | undefined) {
  if (!token) return false;
  try {
    jwt.verify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function GET(_request: NextRequest) {
  const equipmentList = await prisma.equipment.findMany();
  return NextResponse.json(equipmentList);
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  if (!verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();

  try {
    const newEquipment = await prisma.equipment.create({
      data,
    });
    // Сброс кэша главной страницы, чтобы обновленные данные показались
    revalidatePath('/');
    return NextResponse.json(newEquipment);
  } catch (_error) {
    return NextResponse.json({ error: "Error creating equipment" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  if (!verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();

  try {
    const updatedEquipment = await prisma.equipment.update({
      where: { id: data.id },
      data,
    });
    revalidatePath('/');
    return NextResponse.json(updatedEquipment);
  } catch (_error) {
    return NextResponse.json({ error: "Error updating equipment" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  if (!verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    await prisma.equipment.delete({ where: { id } });
    revalidatePath('/');
    return NextResponse.json({ message: "Deleted" });
  } catch (_error) {
    return NextResponse.json({ error: "Error deleting equipment" }, { status: 500 });
  }
}
