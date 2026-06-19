"use client";

import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Equipment {
  id: string;
  name: string;
}

interface Difficulty {
  id: string;
  name: string;
}

interface Muscle {
  id: number;
  name: string;
}

interface ExerciseData {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  tips: string[];
  targetMuscles: string[];
  difficultyId: string;
  equipmentId: string;
  imageUrl: string;
}

interface ExerciseFormState {
  name: string;
  description: string;
  instructions: string;
  tips: string;
  difficultyId: string;
  equipmentId: string;
  imageUrl: string;
}

interface ExerciseFormProps {
  exercises: ExerciseData[];
  equipments: Equipment[];
  difficulties: Difficulty[];
  muscles: Muscle[];
  onRefresh: () => void;
}

const emptyForm: ExerciseFormState = {
  name: "",
  description: "",
  instructions: "",
  tips: "",
  difficultyId: "",
  equipmentId: "",
  imageUrl: "",
};

function splitToArray(str: string): string[] {
  return str
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export default function ExerciseForm({
  exercises,
  equipments,
  difficulties,
  muscles,
  onRefresh,
}: ExerciseFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMuscles, setSelectedMuscles] = useState<number[]>([]);
  const [newExercise, setNewExercise] = useState<ExerciseFormState>(emptyForm);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editingExercise, setEditingExercise] = useState<ExerciseFormState | null>(null);

  function toggleMuscleSelection(id: number) {
    setSelectedMuscles((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  const validateExercise = () => {
    if (!newExercise.name.trim()) return "Название упражнения обязательно";
    if (!newExercise.equipmentId.trim()) return "ID оборудования обязателен";
    if (!newExercise.difficultyId.trim()) return "Сложность обязательна";
    if (selectedMuscles.length === 0) return "Выберите хотя бы одну мышцу";
    return null;
  };

  async function addExercise() {
    const err = validateExercise();
    if (err) {
      toast({ title: err, variant: "destructive" });
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const exerciseToSend = {
        ...newExercise,
        instructions: splitToArray(newExercise.instructions),
        tips: splitToArray(newExercise.tips),
        muscleIds: selectedMuscles,
      };

      const res = await fetch("/api/admin/exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exerciseToSend),
      });

      if (res.ok) {
        setNewExercise(emptyForm);
        setSelectedMuscles([]);
        onRefresh();
        toast({ title: "Упражнение добавлено" });
      } else {
        toast({ title: "Ошибка при добавлении упражнения", variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEditingExercise(exercise: ExerciseData) {
    setEditingExerciseId(exercise.id);
    setEditingExercise({
      ...exercise,
      instructions: exercise.instructions.join("\n"),
      tips: exercise.tips.join("\n"),
    });
    setSelectedMuscles(
      muscles
        .filter((m) => exercise.targetMuscles.includes(m.name))
        .map((m) => m.id)
    );
  }

  async function updateExercise() {
    if (!editingExerciseId || !editingExercise) return;

    const exerciseToSend = {
      ...editingExercise,
      id: editingExerciseId,
      instructions: splitToArray(editingExercise.instructions),
      tips: splitToArray(editingExercise.tips),
      muscleIds: selectedMuscles,
    };

    const res = await fetch("/api/admin/exercise", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(exerciseToSend),
    });

    if (res.ok) {
      setEditingExerciseId(null);
      setEditingExercise(null);
      setSelectedMuscles([]);
      onRefresh();
      toast({ title: "Упражнение обновлено" });
    } else {
      toast({ title: "Ошибка при обновлении упражнения", variant: "destructive" });
    }
  }

  async function deleteExercise(id: string) {
    if (!confirm("Удалить упражнение?")) return;

    const res = await fetch(`/api/admin/exercise?id=${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      onRefresh();
      toast({ title: "Удалено" });
    } else {
      toast({ title: "Ошибка при удалении упражнения", variant: "destructive" });
    }
  }

  const currentForm = editingExerciseId ? editingExercise : newExercise;
  const setCurrentForm = (val: ExerciseFormState) => {
    if (editingExerciseId) {
      setEditingExercise(val);
    } else {
      setNewExercise(val);
    }
  };

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Список упражнений</h2>
      <ul className="space-y-2 mb-6">
        {exercises.map((ex) => (
          <li
            key={ex.id}
            className="border border-gray-300 rounded p-4 flex flex-col gap-1"
          >
            <div className="flex justify-between items-center">
              <p className="font-semibold">{ex.name}</p>
              <div>
                <button
                  onClick={() => startEditingExercise(ex)}
                  className="text-blue-600 hover:underline mr-3"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => deleteExercise(ex.id)}
                  className="text-red-600 hover:underline"
                >
                  Удалить
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm">{ex.description}</p>
            <p className="text-gray-500 text-xs">Оборудование: {ex.equipmentId}</p>
            <p className="text-gray-700 text-xs">Советы: {ex.tips.join("\n")}</p>
            <p className="text-gray-700 text-xs">Инструкции: {ex.instructions.join("\n")}</p>
            <p className="text-gray-700 text-xs">
              Мышцы: {ex.targetMuscles?.length ? ex.targetMuscles.join(", ") : "не указано"}
            </p>
            <p className="text-blue-600 text-xs font-semibold">
              Сложность: {difficulties.find((d) => d.id === ex.difficultyId.toString())?.name || "Не указано"}
            </p>
          </li>
        ))}
      </ul>

      <section className="max-w-md space-y-3">
        <h3 className="text-lg font-semibold mb-2">
          {editingExerciseId ? "Редактирование упражнения" : "Добавить новое упражнение"}
        </h3>
        <input
          type="text"
          placeholder="Название"
          value={currentForm?.name || ""}
          onChange={(e) => setCurrentForm({ ...currentForm!, name: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          placeholder="Описание"
          value={currentForm?.description || ""}
          onChange={(e) => setCurrentForm({ ...currentForm!, description: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
        <textarea
          placeholder="Инструкции (каждая строка отдельным пунктом)"
          value={currentForm?.instructions || ""}
          onChange={(e) => setCurrentForm({ ...currentForm!, instructions: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
        <textarea
          placeholder="Советы"
          value={currentForm?.tips || ""}
          onChange={(e) => setCurrentForm({ ...currentForm!, tips: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
        <div className="flex flex-wrap gap-2 max-w-xs max-h-32 overflow-y-auto border border-gray-300 rounded p-2">
          {muscles.map((muscle) => (
            <label key={muscle.id} className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedMuscles.includes(muscle.id)}
                onChange={() => toggleMuscleSelection(muscle.id)}
              />
              <span>{muscle.name}</span>
            </label>
          ))}
        </div>
        <select
          value={currentForm?.difficultyId || ""}
          onChange={(e) => setCurrentForm({ ...currentForm!, difficultyId: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Выберите сложность</option>
          {difficulties.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          value={currentForm?.equipmentId || ""}
          onChange={(e) => setCurrentForm({ ...currentForm!, equipmentId: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Выберите тренажер</option>
          {equipments.map((eq) => (
            <option key={eq.id} value={eq.id}>
              {eq.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Ссылка на изображение"
          value={currentForm?.imageUrl || ""}
          onChange={(e) => setCurrentForm({ ...currentForm!, imageUrl: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {editingExerciseId ? (
          <div className="flex space-x-4 mt-2">
            <button
              onClick={updateExercise}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Сохранить изменения
            </button>
            <button
              onClick={() => {
                setEditingExerciseId(null);
                setEditingExercise(null);
                setSelectedMuscles([]);
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
            >
              Отмена
            </button>
          </div>
        ) : (
          <button
            onClick={addExercise}
            disabled={isSubmitting}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Сохранение..." : "Добавить упражнение"}
          </button>
        )}
      </section>
    </section>
  );
}
