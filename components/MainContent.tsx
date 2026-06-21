'use client';

import { useState, useEffect, useCallback } from "react";
import EquipmentCard from "@/components/EquipmentCard";
import heroImage from "@/assets/gym-hero.jpg";
import { Dumbbell, Search, SearchX, ArrowUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Exercise } from "@prisma/client";

export interface Equipment {
  id: string;
  name: string;
  description: string;
  category: string;
  qrCodeUrl?: string;
  exercises: Exercise[];
}

function EquipmentSkeleton() {
  return (
    <div className="bg-gradient-card border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <Skeleton className="h-6 w-40" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
    </div>
  );
}

export default function MainContent({ equipmentData }: { equipmentData: Equipment[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (equipmentData) {
      setIsLoading(false);
    }
  }, [equipmentData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const filteredEquipment = debouncedQuery.trim()
    ? equipmentData.filter((eq) => {
        const name = eq.name?.toLowerCase() || "";
        const category = eq.category?.toLowerCase() || "";
        const query = debouncedQuery.toLowerCase();
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

      <section id="equipment" className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-extrabold text-foreground">Каталог тренажёров</h2>
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
              {isLoading ? (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <EquipmentSkeleton key={i} />
                  ))}
                </>
              ) : filteredEquipment.length > 0 ? (
                filteredEquipment.map((equipment, i) => (
                  <div
                    key={equipment.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <EquipmentCard equipment={equipment} />
                  </div>
                ))
              ) : (
                <div className="text-center py-16 col-span-full space-y-3">
                  <SearchX className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground text-lg">
                    {debouncedQuery.trim()
                      ? `По запросу «${debouncedQuery}» ничего не найдено`
                      : "Тренажёры не найдены"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-card border-t border-border py-8 px-4 mt-16">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-muted-foreground">БТГП. Современный каталог тренажёров и упражнений.</p>
        </div>
      </footer>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-opacity z-50"
          aria-label="Наверх"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
