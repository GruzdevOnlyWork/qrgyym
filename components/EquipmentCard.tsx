'use client'

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, ChevronRight } from "lucide-react";

interface Difficulty {
  id: number;
  name: string;
  description?: string;
}

interface Exercise {
  id: string;
  name: string;
  difficulty?: Difficulty;
}

interface Equipment {
  id: string;
  name: string;
  description: string;
  category: string;
  exercises: Exercise[];
}

interface EquipmentCardProps {
  equipment: Equipment;
}

const EquipmentCard = ({ equipment }: EquipmentCardProps) => {
  return (
    <Link href={`/equipment/${equipment.id}`} passHref>
      <Card className="group bg-gradient-card border border-border rounded-xl cursor-pointer h-full shadow-sm hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Dumbbell className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold text-primary">
                {equipment.name}
              </CardTitle>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{equipment.description}</p>
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="secondary" className="font-medium">
              {equipment.category}
            </Badge>
            <Badge variant="outline" className="font-medium">
              {equipment.exercises.length}{" "}
              {equipment.exercises.length === 1 ? "упражнение" : "упражнения"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default EquipmentCard;
