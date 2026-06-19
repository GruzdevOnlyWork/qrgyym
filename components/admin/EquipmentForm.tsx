"use client";

import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Equipment {
  id: string;
  name: string;
  description: string;
  category: string;
  qrCodeUrl: string;
}

interface EquipmentFormProps {
  equipments: Equipment[];
  onRefresh: () => void;
}

export default function EquipmentForm({ equipments, onRefresh }: EquipmentFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newEquipment, setNewEquipment] = useState({
    name: "",
    description: "",
    category: "",
  });

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

  async function addEquipment() {
    const err = validateEquipment();
    if (err) {
      toast({ title: err, variant: "destructive" });
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEquipment),
      });

      if (res.ok) {
        setNewEquipment({ name: "", description: "", category: "" });
        onRefresh();
        toast({ title: "Тренажёр добавлен" });
      } else {
        toast({ title: "Ошибка при добавлении тренажера", variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
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
        onRefresh();
        toast({ title: "Удалено" });
      } else {
        toast({ title: "Ошибка при удалении тренажера", variant: "destructive" });
      }
    } catch (error) {
      console.error("Ошибка при удалении:", error);
      toast({ title: "Ошибка сети при удалении", variant: "destructive" });
    }
  }

  async function updateEquipment() {
    if (!editingEquipmentId || !editingEquipment) {
      toast({ title: "Нет выбранного тренажера для редактирования", variant: "destructive" });
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
        onRefresh();
        toast({ title: "Тренажёр обновлён" });
      } else {
        toast({ title: "Ошибка при обновлении тренажера", variant: "destructive" });
      }
    } catch (error) {
      console.error("Ошибка при обновлении:", error);
      toast({ title: "Ошибка сети при обновлении", variant: "destructive" });
    }
  }

  return (
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
          disabled={isSubmitting}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Сохранение..." : "Добавить тренажёр"}
        </button>
      </div>
    </section>
  );
}
