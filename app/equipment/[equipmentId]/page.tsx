import { prisma } from "../../../prisma/prisma-client";
import { notFound } from "next/navigation";
import {  Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import ExerciseCard from "@/components/ExerciseCard";
import Header from "@/components/Header";

interface EquipmentPageProps {
  params: { equipmentId: string };
}

export default async function EquipmentPage({ params }: EquipmentPageProps) {
  const equipment = await prisma.equipment.findUnique({
    where: { id: params.equipmentId },
    include: {
      exercises: {
        include: {
          difficulty: true,
          muscles: {
            include: {
              muscle: true,
            },
          },
        },
      },
    },
  });

  if (!equipment) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-6xl px-4 py-12 space-y-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-primary rounded-xl">
                <Dumbbell className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">{equipment.name}</h1>
                <Badge variant="secondary" className="mt-2">
                  {equipment.category}
                </Badge>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">{equipment.description}</p>
            <div className="bg-card border border-border rounded-xl p-6 space-y-2">
              <h3 className="font-semibold text-lg">Доступные упражнения</h3>
              <p className="text-sm text-muted-foreground">
                На этом тренажёре можно выполнить {equipment.exercises.length}{" "}
                {equipment.exercises.length === 1 ? "упражнение" : "упражнения"}
              </p>
            </div>
          </section>
          <aside className="flex justify-center lg:justify-end">
            <QRCodeDisplay
              url={`/equipment/${equipment.id}`}
              equipmentName={equipment.name}
              size={240}
            />
          </aside>
        </div>

        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Упражнения</h2>
            <p className="text-muted-foreground">
              Выбери упражнение для просмотра детальных инструкций
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {equipment.exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={{
                  ...exercise,
                  targetMuscles: exercise.muscles.map((m) => m.muscle.name),
                }}
                equipmentId={equipment.id}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
