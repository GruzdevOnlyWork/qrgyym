"use client";

import React, { useState, useEffect } from "react";

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


interface ExerciseForm {
  name: string;
  description: string;
  instructions: string;
  tips: string;
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

  const [selectedMuscles, setSelectedMuscles] = useState<number[]>([]);

  const [newEquipment, setNewEquipment] = useState({
    name: "",
    description: "",
    category: "",
  });

  const [newExercise, setNewExercise] = useState<ExerciseForm>({
    name: "",
    description: "",
    instructions: "",
    tips: "",
    difficultyId: "",
    equipmentId: "",
    imageUrl: "",
  });

  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editingExercise, setEditingExercise] = useState<ExerciseForm | null>(null);
  const [editingEquipmentId, setEditingEquipmentId] = useState<string | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<{
    name: string;
    description: string;
    category: string;
  } | null>(null);



 const validateEquipment = () => {
    if (!newEquipment.name.trim()) return "Название тренажера обязательно";
    if (!newEquipment.category.trim()) return "Категория обязательна";
    return null;
  };

  const validateExercise = () => {
    if (!newExercise.name.trim()) return "Название упражнения обязательно";
    if (!newExercise.equipmentId.trim()) return "ID оборудования обязателен";
    if (!newExercise.difficultyId.trim()) return "Сложность обязательна";
    if (selectedMuscles.length === 0) return "Выберите хотя бы одну мышцу";
    return null;
  };

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
    if (res.ok) {
      const data = await res.json();
      setMuscles(data);
    }
  }

  async function fetchDifficulties() {
    const res = await fetch("/api/admin/difficulties");
    if (res.ok) {
      const data = await res.json();
      setDifficulties(data);
    }
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
      setCode("");
    } else {
      const data = await res.json();
      setError(data.error || "Ошибка авторизации");
    }
  }

  async function fetchEquipments() {
    const res = await fetch("/api/admin/equipment");
    if (res.ok) {
      const data = await res.json();
      setEquipments(data);
    }
  }

  async function fetchExercises() {
    const res = await fetch("/api/admin/exercise");
    if (res.ok) {
      const data = await res.json();
      setExercises(data);
    }
  }

  function toggleMuscleSelection(id: number) {
    setSelectedMuscles((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  function splitToArray(str: string): string[] {
    return str
      .split("\n")
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0);
  }

  async function addExercise() {
    const err = validateExercise();
    if (err) {
      alert(err);
      return;
    }
    const instructionsArray = splitToArray(newExercise.instructions);
    const tipsArray = splitToArray(newExercise.tips);

    const exerciseToSend = {
      ...newExercise,
      instructions: instructionsArray,
      tips: tipsArray,
      muscleIds: selectedMuscles,
    };

    const res = await fetch("/api/admin/exercise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(exerciseToSend),
    });

    if (res.ok) {
      setNewExercise({
        name: "",
        description: "",
        instructions: "",
        tips: "",
        difficultyId: "",
        equipmentId: "",
        imageUrl: "",
      });
      setSelectedMuscles([]);
      fetchExercises();
    } else {
      alert("Ошибка при добавлении упражнения");
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

    const instructionsArray = splitToArray(editingExercise.instructions);
    const tipsArray = splitToArray(editingExercise.tips);

    const exerciseToSend = {
      ...editingExercise,
      id: editingExerciseId,
      instructions: instructionsArray,
      tips: tipsArray,
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
      fetchExercises();
    } else {
      alert("Ошибка при обновлении упражнения");
    }
  }

  async function deleteExercise(id: string) {
    if (!confirm("Удалить упражнение?")) return;

    const res = await fetch(`/api/admin/exercise?id=${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchExercises();
    } else {
      alert("Ошибка при удалении упражнения");
    }
  }

  async function addEquipment() {
    const err = validateEquipment();
    if (err) {
      alert(err);
      return;
    }

    const qrUrl = `${window.location.origin}/equipment/temp-id`; 

    const res = await fetch("/api/admin/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newEquipment, qrCodeUrl: qrUrl }),
    });

    if (res.ok) {
      const created = await res.json();
      // обновление qrCodeUrl с реальным id
      const realQrUrl = `${window.location.origin}/equipment/${created.id}`;
      await fetch("/api/admin/equipment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...created, qrCodeUrl: realQrUrl }),
      });
      setNewEquipment({ name: "", description: "", category: "" });
      fetchEquipments();
    } else {
      alert("Ошибка при добавлении тренажера");
    }
  }

function startEditEquipment(eq: Equipment) {
  setEditingEquipmentId(eq.id);
  setEditingEquipment({ name: eq.name, description: eq.description, category: eq.category });
}

async function deleteEquipment(id: string) {
  if (!confirm("Удалить тренажер?")) return;
  try {
    const res = await fetch(`/api/admin/equipment?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchEquipments();
    } else {
      alert("Ошибка при удалении тренажера");
    }
  } catch (error) {
    console.error("Ошибка при удалении:", error);
    alert("Ошибка сети при удалении");
  }
}

  async function updateEquipment() {
    if (!editingEquipmentId || !editingEquipment) {
      alert("Нет выбранного тренажера для редактирования");
      return;
    }
    try {
      const res = await fetch("/api/admin/equipment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editingEquipment, id: editingEquipmentId }),
      });
      if (res.ok) {
        setEditingEquipmentId(null);
        setEditingEquipment(null);
        fetchEquipments();
      } else {
        alert("Ошибка при обновлении тренажера");
      }
    } catch (error) {
      console.error("Ошибка при обновлении:", error);
      alert("Ошибка сети при обновлении");
    }
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
        <section>
          <h2 className="text-xl font-semibold mb-4">Список тренажеров</h2>
          <ul className="space-y-2 mb-6">
            {equipments.map((eq) => (
              <li
                key={eq.id}
                className="border border-gray-300 rounded p-4 flex justify-between"
              >
                <div>
                  <p className="font-semibold">{eq.name}</p>
                  <p className="text-gray-600 text-sm">{eq.category}</p>
                  <p className="text-xs text-blue-600 underline">{eq.qrCodeUrl}</p>
                </div>
                <div>
                  <button className="text-blue-600 hover:underline mr-3" onClick={() => startEditEquipment(eq)}>Редактировать</button>
                  <button className="text-red-600 hover:underline" onClick={() => deleteEquipment(eq.id)}>Удалить</button>
                </div>
              </li>
            ))}
          </ul>

          {editingEquipmentId && editingEquipment && (
            <section className="max-w-md space-y-3 border p-4 mb-6 rounded bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">Редактировать тренажер</h3>
              <input
                type="text"
                placeholder="Название"
                value={editingEquipment.name}
                onChange={(e) =>
                  setEditingEquipment({ ...editingEquipment, name: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Описание"
                value={editingEquipment.description}
                onChange={(e) =>
                  setEditingEquipment({ ...editingEquipment, description: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Категория"
                value={editingEquipment.category}
                onChange={(e) =>
                  setEditingEquipment({ ...editingEquipment, category: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex space-x-4">
                <button
                  onClick={updateEquipment}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Сохранить
                </button>
                <button
                  onClick={() => {
                    setEditingEquipmentId(null);
                    setEditingEquipment(null);
                  }}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                >
                  Отмена
                </button>
              </div>
            </section>
          )}

          <h3 className="text-lg font-semibold mb-2">Добавить новый тренажер</h3>
          <div className="space-y-3 max-w-md">
            <input
              type="text"
              placeholder="Название"
              value={newEquipment.name}
              onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Описание"
              value={newEquipment.description}
              onChange={(e) =>
                setNewEquipment({ ...newEquipment, description: e.target.value })
              }
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Категория"
              value={newEquipment.category}
              onChange={(e) =>
                setNewEquipment({ ...newEquipment, category: e.target.value })
              }
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addEquipment}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Добавить тренажер
            </button>
          </div>
        </section>

      )}

      {activeTab === "exercise" && (
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
            value={editingExerciseId ? editingExercise?.name || "" : newExercise.name}
            onChange={(e) => {
              if (editingExerciseId) {
                setEditingExercise({ ...editingExercise!, name: e.target.value });
              } else {
                setNewExercise({ ...newExercise, name: e.target.value });
              }
            }}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Описание"
            value={editingExerciseId ? editingExercise?.description || "" : newExercise.description}
            onChange={(e) => {
              if (editingExerciseId) {
                setEditingExercise({ ...editingExercise!, description: e.target.value });
              } else {
                setNewExercise({ ...newExercise, description: e.target.value });
              }
            }}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <textarea
            placeholder="Инструкции (каждая строка отдельным пунктом)"
            value={editingExerciseId ? editingExercise?.instructions || "" : newExercise.instructions}
            onChange={(e) => {
              if (editingExerciseId) {
                setEditingExercise({ ...editingExercise!, instructions: e.target.value });
              } else {
                setNewExercise({ ...newExercise, instructions: e.target.value });
              }
            }}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
          <textarea
            placeholder="Советы"
            value={editingExerciseId ? editingExercise?.tips || "" : newExercise.tips}
            onChange={(e) => {
              if (editingExerciseId) {
                setEditingExercise({ ...editingExercise!, tips: e.target.value });
              } else {
                setNewExercise({ ...newExercise, tips: e.target.value });
              }
            }}
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
            value={editingExerciseId ? editingExercise?.difficultyId || "" : newExercise.difficultyId}
            onChange={(e) => {
              if (editingExerciseId) {
                setEditingExercise({ ...editingExercise!, difficultyId: e.target.value });
              } else {
                setNewExercise({ ...newExercise, difficultyId: e.target.value });
              }
            }}
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
            value={editingExerciseId ? editingExercise?.equipmentId || "" : newExercise.equipmentId}
            onChange={(e) => {
              if (editingExerciseId) {
                setEditingExercise({ ...editingExercise!, equipmentId: e.target.value });
              } else {
                setNewExercise({ ...newExercise, equipmentId: e.target.value });
              }
            }}
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
            value={editingExerciseId ? editingExercise?.imageUrl || "" : newExercise.imageUrl}
            onChange={(e) => {
              if (editingExerciseId) {
                setEditingExercise({ ...editingExercise!, imageUrl: e.target.value });
              } else {
                setNewExercise({ ...newExercise, imageUrl: e.target.value });
              }
            }}
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
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition mt-2"
            >
              Добавить упражнение
            </button>
          )}
        </section>
      </section>
      )}
    </div>
  );
}

