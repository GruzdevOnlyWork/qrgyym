import { prisma } from "../../../../../prisma/prisma-client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Lightbulb, Target, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExercisePageProps {
  params: { equipmentId: string; exerciseId: string };
}

export default async function ExercisePage({ params }: ExercisePageProps) {
  const equipment = await prisma.equipment.findUnique({
    where: { id: params.equipmentId },
  });

  const exercise = await prisma.exercise.findFirst({
    where: {
      id: params.exerciseId,
      equipmentId: params.equipmentId,
    },
    include: {
      difficulty: true,
      muscles: { include: { muscle: true } },
    },
  });

  if (!equipment || !exercise) {
    notFound();
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Легкий":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Средний":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Сложный":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "Легкий":
        return "Новичок";
      case "Средний":
        return "Средний уровень";
      case "Сложный":
        return "Продвинутый";
      default:
        return difficulty;
    }
  };

  const accentIconClass = "inline-block mr-2 text-blue-600";
  const accentTitleClass = "text-lg font-semibold text-blue-700";

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-card border-b border-border py-6 px-4 sticky top-0 z-10 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto max-w-4xl">
          <Button variant="ghost" asChild className="mb-4">
            <Link href={`/equipment/${equipment.id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к {equipment.name}
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-12 space-y-8">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className={getDifficultyColor(exercise.difficulty.name)}>
              {exercise.difficulty.name}
            </Badge>
            <Badge variant="outline">{equipment.category}</Badge>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold">{exercise.name}</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            {exercise.description}
          </p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className={accentTitleClass}>
              <Target className={`${accentIconClass} w-5 h-5`} />
              Целевые мышцы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {exercise.muscles.map(({ muscle }) => (
                <Badge key={muscle.id} variant="outline">
                  {muscle.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        {exercise.imageUrl && (
          <Card>
            <CardHeader>
              <CardTitle className={accentTitleClass}>
                <ImageIcon className={`${accentIconClass} w-5 h-5`} />
                Изображение упражнения
              </CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={exercise.imageUrl}
                alt={`Изображение упражнения ${exercise.name}`}
                className="w-full rounded-lg shadow-lg"
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className={accentTitleClass}>
              <CheckCircle className={`${accentIconClass} w-5 h-5`} />
              Инструкции
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {exercise.instructions.map((inst, i) => (
                <li key={i}>{inst}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={accentTitleClass}>
              <Lightbulb className={`${accentIconClass} w-5 h-5`} />
              Советы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {exercise.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
