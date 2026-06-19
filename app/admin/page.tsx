"use client";

import React, { useState, useEffect } from "react";
import EquipmentForm from "@/components/admin/EquipmentForm";
import ExerciseForm from "@/components/admin/ExerciseForm";

interface Equipment {
  id: string;
  name: string;
  description: string;
  category: string;
  qrCodeUrl: string;
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

export default function AdminPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isAuth, setIsAuth] = useState(false);

  const [activeTab, setActiveTab] = useState<"equipment" | "exercise">("equipment");
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
  const [muscles, setMuscles] = useState<Muscle[]>([]);

  useEffect(() => {
    fetch("/api/admin/check")
      .then((res) => {
        if (res.ok) {
          setIsAuth(true);
          fetchEquipments();
          fetchExercises();
          fetchDifficulties();
          fetchMuscles();
        }
      })
      .catch(() => setIsAuth(false));
  }, []);

  async function fetchMuscles() {
    const res = await fetch("/api/admin/muscles");
    if (res.ok) setMuscles(await res.json());
  }

  async function fetchDifficulties() {
    const res = await fetch("/api/admin/difficulties");
    if (res.ok) setDifficulties(await res.json());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (res.ok) {
      setIsAuth(true);
      fetchEquipments();
      fetchExercises();
      fetchDifficulties();
      fetchMuscles();
      setCode("");
    } else {
      const data = await res.json();
      setError(data.error || "Ошибка авторизации");
    }
  }

  async function fetchEquipments() {
    const res = await fetch("/api/admin/equipment");
    if (res.ok) setEquipments(await res.json());
  }

  async function fetchExercises() {
    const res = await fetch("/api/admin/exercise");
    if (res.ok) setExercises(await res.json());
  }

  if (!isAuth) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Вход в админ панель</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Введите код доступа"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded py-2 hover:bg-blue-700 transition"
          >
            Войти
          </button>
        </form>
        {error && <p className="text-red-600 mt-2 text-center">{error}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-12 p-6 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-6 text-center">Админ панель</h1>
      <div className="flex justify-center mb-6 space-x-4">
        <button
          onClick={() => setActiveTab("equipment")}
          className={`px-4 py-2 rounded ${
            activeTab === "equipment"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          }`}
        >
          Тренажеры
        </button>
        <button
          onClick={() => setActiveTab("exercise")}
          className={`px-4 py-2 rounded ${
            activeTab === "exercise"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          }`}
        >
          Упражнения
        </button>
      </div>

      {activeTab === "equipment" && (
        <EquipmentForm equipments={equipments} onRefresh={fetchEquipments} />
      )}

      {activeTab === "exercise" && (
        <ExerciseForm
          exercises={exercises}
          equipments={equipments}
          difficulties={difficulties}
          muscles={muscles}
          onRefresh={fetchExercises}
        />
      )}
    </div>
  );
}
