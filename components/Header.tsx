'use client'

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-10 p-6 backdrop-blur-sm backdrop-saturate-150 backdrop-filter">
      <div className="container mx-auto max-w-6xl flex items-center">
        <Button
          variant="default"
          asChild
          className="flex text-white items-center  hover:text-white transition-colors duration-200"
        >
          <Link href="/">
            <ArrowLeft className="w-5 h-5 mr-2 text-white" />
            Назад к каталогу
          </Link>
        </Button>
      </div>
    </header>
  );
}
