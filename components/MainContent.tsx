'use client';

import { useState } from "react";
import EquipmentCard from "@/components/EquipmentCard";
import heroImage from "@/assets/gym-hero.jpg";
import { Dumbbell, Search, Target, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Exercise } from "@prisma/client";

export interface Equipment {
  id: string;
  name: string;
  description: string;
  category: string;
  qrCodeUrl?: string;
  exercises: Exercise[];
}

export default function MainContent({ equipmentData }: { equipmentData: Equipment[] }) {
  const [searchQuery, setSearchQuery] = useState("");

const filteredEquipment = searchQuery.trim()
  ? equipmentData.filter((eq) => {
      const name = eq.name?.toLowerCase() || "";
      const category = eq.category?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();

      return name.includes(query) || category.includes(query);
    })
  : equipmentData;

  return (
    <div className="min-h-screen bg-background">
      <section
        className="relative bg-gradient-hero py-20 px-4 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, hsl(220 20% 12% / 0.95) 0%, hsl(220 18% 16% / 0.9) 50%, hsl(25 95% 58% / 0.1) 100%), url(${heroImage.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-white">
              BTGPGym
            </h1>
            <p className="text-xl md:text-2xl text-white ">
              Твой умный путеводитель по тренажерному залу
            </p>
            <p className="text-white max-w-2xl mx-auto leading-relaxed">
              Сканируй QR-коды на тренажёрах и получай доступ к детальным инструкциям, видео и советам по технике выполнения упражнений
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" variant="hero" asChild>
                <a href="#equipment" className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5" />
                  Каталог тренажёров
                </a>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      </section>

      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{
              icon: Search,
              title: "QR-коды",
              desc: "Просто отсканируй код на тренажёре и получи всю информацию"
            },
            {
              icon: Target,
              title: "Детальные инструкции",
              desc: "Пошаговые руководства с анимациями и советами"
            },
            {
              icon: Trophy,
              title: "Правильная техника",
              desc: "Избегай травм и достигай лучших результатов"
            }].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center space-y-3 p-6 bg-gradient-card rounded-xl border border-border">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg mx-auto flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{title}</h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="equipment" className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-extrabold text-foreground">Каталог тренажёров</h2>
              <p className="text-muted-foreground">Выбери тренажёр, чтобы увидеть доступные упражнения</p>
            </div>

            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Поиск по названию или категории..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary rounded-md transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEquipment.length > 0 ? (
                filteredEquipment.map((equipment) => (
                  <EquipmentCard key={equipment.id} equipment={equipment} />
                ))
              ) : (
                <div className="text-center py-12 col-span-full">
                  <p className="text-muted-foreground text-lg">Тренажёры не найдены. Попробуйте другой запрос.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-card border-t border-border py-8 px-4 mt-16">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-muted-foreground">© 2025 GymPro. Современный каталог тренажёров и упражнений.</p>
        </div>
      </footer>
    </div>
  );
}
