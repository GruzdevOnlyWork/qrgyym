import { prisma } from "../../../prisma/prisma-client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Dumbbell, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import ExerciseCard from "@/components/ExerciseCard";
import Header from "@/components/Header";

interface EquipmentPageProps {
  params: Promise<{ equipmentId: string }>;
}

export default async function EquipmentPage({ params }: EquipmentPageProps) {
  const { equipmentId } = await params;

  const equipment = await prisma.equipment.findUnique({
    where: { id: equipmentId },
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
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Главная</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{equipment.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
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
            {equipment.exercises.length > 0 ? (
              equipment.exercises.map((exercise: {
                id: string;
                name: string;
                description: string;
                difficulty: { id: number; name: string };
                muscles: { muscle: { id: number; name: string } }[];
              }) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={{
                    ...exercise,
                    targetMuscles: exercise.muscles.map((m) => m.muscle.name),
                  }}
                  equipmentId={equipment.id}
                />
              ))
            ) : (
              <div className="text-center py-16 col-span-full space-y-3">
                <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground text-lg">Упражнения пока не добавлены</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
