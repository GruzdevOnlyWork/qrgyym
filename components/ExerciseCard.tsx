'use client';

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, ChevronRight } from "lucide-react";

interface Difficulty {
  id: number;
  name: string;
}

interface Exercise {
  id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  targetMuscles: string[];
}

interface ExerciseCardProps {
  exercise: Exercise;
  equipmentId: string;
}

const getDifficultyColor = (difficultyName: string) => {
  switch (difficultyName) {
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

const getDifficultyText = (difficultyName: string) => {
  switch (difficultyName) {
    case "Легкий":
      return "Новичок";
    case "Средний":
      return "Средний";
    case "Сложный":
      return "Продвинутый";
    default:
      return difficultyName;
  }
};

const ExerciseCard = ({ exercise, equipmentId }: ExerciseCardProps) => {
  return (
    <Link href={`/equipment/${equipmentId}/exercise/${exercise.id}`}>
      <Card className="group bg-gradient-card border border-border rounded-xl cursor-pointer h-full shadow-sm hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-gradient-primary rounded-lg flex-shrink-0">
                <Activity className="w-5 h-5 text-primary"  />
              </div>
              <CardTitle className="text-lg font-semibold text-primary">
                {exercise.name}
              </CardTitle>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-300 flex-shrink-0" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">{exercise.description}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${getDifficultyColor(exercise.difficulty.name)} font-medium`}>
              {getDifficultyText(exercise.difficulty.name)}
            </Badge>
            {exercise.targetMuscles.slice(0, 2).map((muscle) => (
              <Badge key={muscle} variant="default" className="text-xs">
                {muscle}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ExerciseCard;
