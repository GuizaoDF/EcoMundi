"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-foreground/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 sm:pt-28 lg:pt-36">
        <p className="text-sm sm:text-base tracking-[0.3em] uppercase text-white/80 mb-6 font-medium">
          Consultoria e Gestão Ambiental
        </p>
        
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-tight mb-8 text-balance">
          Construindo o futuro através da Sustentabilidade
        </h1>
        
        <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-12 leading-relaxed text-pretty">
          Consultoria especializada em governança regulatória, ESG, 
          estruturação de negócios sustentáveis e articulação institucional.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-white text-foreground hover:bg-white/90 px-8 py-6 text-base font-medium"
          >
            <Link href="#atuacao">
              Conheça Nossas Áreas
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-base font-medium bg-transparent"
          >
            <Link href="#contato">Agende uma Consultoria</Link>
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/70 rounded-full" />
        </div>
      </div>
    </section>
  );
}
