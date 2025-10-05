import { NextResponse, type NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/prisma/prisma-client";

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

export async function GET(request: NextRequest) {
  const exercises = await prisma.exercise.findMany({
    include: {
      muscles: { include: { muscle: true } },
      difficulty: true,
      equipment: true,
    },
  });

  const parsedExercises = exercises.map((ex) => ({
    ...ex,
    targetMuscles: ex.muscles.map((m) => m.muscle.name),
  }));

  return NextResponse.json(parsedExercises);
}


export async function POST(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  if (!verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  try {
    const { muscleIds, instructions, tips, difficultyId, ...exerciseData } = data;

    const difficultyIdInt = Number(difficultyId);
    if (isNaN(difficultyIdInt)) {
      return NextResponse.json({ error: "Неверный difficultyId, должен быть числом" }, { status: 400 });
    }
    if (!Array.isArray(muscleIds)) {
      return NextResponse.json({ error: "muscleIds должен быть массивом" }, { status: 400 });
    }
    if (!Array.isArray(instructions)) {
      return NextResponse.json({ error: "instructions должен быть массивом строк" }, { status: 400 });
    }
    if (!Array.isArray(tips)) {
      return NextResponse.json({ error: "tips должен быть массивом строк" }, { status: 400 });
    }

    const newExercise = await prisma.exercise.create({
      data: {
        ...exerciseData,
        difficultyId: difficultyIdInt,
        instructions,
        tips,
        muscles: {
          create: muscleIds.map(id => ({
            muscle: { connect: { id: Number(id) } }
          })),
        },
      },
      include: {
        muscles: { include: { muscle: true } },
        difficulty: true,
        equipment: true,
      },
    });

    const targetMuscles = newExercise.muscles.map(m => m.muscle.name);

    return NextResponse.json({
      ...newExercise,
      targetMuscles,
    }, { status: 201 });
  } catch (error) {

    console.error("Ошибка создания упражнения:", error);
    return NextResponse.json({ error: "Ошибка создания упражнения" }, { status: 500 });
  }
}


export async function PUT(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  if (!verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  try {
    const {
      id,
      muscleIds,
      instructions,
      tips,
      difficultyId,
      equipmentId,
      ...exerciseData
    } = data;

    if (!id) {
      return NextResponse.json({ error: "Отсутствует id" }, { status: 400 });
    }

    const difficultyIdInt = Number(difficultyId);
    if (isNaN(difficultyIdInt)) {
      return NextResponse.json({ error: "Неверный difficultyId, должен быть числом" }, { status: 400 });
    }

    if (!Array.isArray(muscleIds)) {
      return NextResponse.json({ error: "muscleIds должен быть массивом" }, { status: 400 });
    }

    if (!Array.isArray(instructions)) {
      return NextResponse.json({ error: "instructions должен быть массивом строк" }, { status: 400 });
    }

    if (!Array.isArray(tips)) {
      return NextResponse.json({ error: "tips должен быть массивом строк" }, { status: 400 });
    }

    const updatedExercise = await prisma.exercise.update({
      where: { id },
      data: {
        name: exerciseData.name,
        description: exerciseData.description,
        imageUrl: exerciseData.imageUrl,

        difficultyId: difficultyIdInt,
        equipmentId: equipmentId,

        instructions,
        tips,

        muscles: {
          deleteMany: {},
          create: muscleIds.map((muscleId: number) => ({
            muscle: { connect: { id: muscleId } },
          })),
        },
      },
      include: {
        muscles: { include: { muscle: true } },
        difficulty: true,
        equipment: true,
      },
    });

    const targetMuscles = updatedExercise.muscles.map((m) => m.muscle.name);

    return NextResponse.json({ ...updatedExercise, targetMuscles });
  } catch (error) {
    console.error("Ошибка обновления упражнения:", error);
    return NextResponse.json({ error: "Ошибка обновления упражнения" }, { status: 500 });
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
    return NextResponse.json({ error: "Отсутствует id" }, { status: 400 });
  }

  try {
    await prisma.exercise.delete({ where: { id } });
    return NextResponse.json({ message: "Удалено" });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка удаления упражнения" }, { status: 500 });
  }
}
