export interface Difficulty {
  id: number;
  name: "beginner" | "intermediate" | "advanced";
  description?: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  targetMuscles: string[];
  difficulty: Difficulty;  // теперь тип объекта
  imageUrl: string;
  tips: string[];
}

export interface Equipment {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl?: string;
  exercises: Exercise[];
}
