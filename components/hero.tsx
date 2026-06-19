"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, ShieldCheck, TrendingUp } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/hero-bg.png')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/60 to-foreground/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/45 via-transparent to-foreground/20" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-20">
        <div className="max-w-4xl text-left">
          <p className="text-xs sm:text-sm tracking-[0.25em] uppercase text-emerald-400 font-semibold mb-8">
            Consultoria e Gestão Ambiental
          </p>

          <div className="flex items-start gap-6 sm:gap-8">
            <div className="hidden md:flex flex-col items-center gap-0 pt-2">
              <div className="w-14 h-14 rounded-full bg-emerald-400/10 border border-emerald-400/40 flex items-center justify-center backdrop-blur-sm">
                <Leaf className="w-6 h-6 text-emerald-400" />
              </div>

              <div className="w-px h-10 bg-emerald-400/40" />

              <div className="w-14 h-14 rounded-full bg-emerald-400/10 border border-emerald-400/40 flex items-center justify-center backdrop-blur-sm">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>

              <div className="w-px h-10 bg-emerald-400/40" />

              <div className="w-14 h-14 rounded-full bg-emerald-400/10 border border-emerald-400/40 flex items-center justify-center backdrop-blur-sm">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
            </div>

            <div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-semibold text-white leading-[1.15] mb-5 sm:mb-6 text-balance">
                Governança Ambiental, Compliance Regulatório e Gestão Estratégica de Riscos.
              </h1>

              <p className="text-base sm:text-lg text-white/85 leading-relaxed mb-8 sm:mb-10 text-pretty max-w-2xl">
                Integramos gestão ambiental, compliance regulatório, governança institucional,
                articulação estratégica e segurança jurídica aplicada à tomada de decisão.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-6 text-sm sm:text-base font-medium"
                >
                  <Link href="#servicos">
                    Conheça Nossos Serviços
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/50 text-white hover:bg-white/10 px-6 sm:px-8 py-6 text-sm sm:text-base font-medium bg-transparent"
                >
                  <Link href="#contato">Fale com um Consultor</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}