"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, ShieldCheck, TrendingUp } from "lucide-react";

const highlights = [
  { icon: Leaf, label: "Governança Ambiental" },
  { icon: ShieldCheck, label: "Compliance Regulatório" },
  { icon: TrendingUp, label: "Gestão de Riscos" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/hero-bg.png')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/55 to-foreground/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-foreground/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-20">
        <div className="max-w-2xl text-left">
          <p className="text-xs sm:text-sm tracking-[0.25em] uppercase text-emerald-400 font-semibold mb-4 sm:mb-5">
            Consultoria e Gestão Ambiental
          </p>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-semibold text-white leading-[1.15] mb-5 sm:mb-6 text-balance">
            Governança Ambiental, Compliance Regulatório e Gestão Estratégica de Riscos.
          </h1>

          <p className="text-base sm:text-lg text-white/85 leading-relaxed mb-8 sm:mb-10 text-pretty">
            Integramos gestão ambiental, compliance regulatório, governança institucional,
            articulação estratégica e segurança jurídica aplicada à tomada de decisão.
          </p>

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6 mb-8 sm:mb-10">
            {highlights.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-sm sm:text-base text-white/90 font-medium">{label}</span>
              </div>
            ))}
          </div>

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
              <Link href="#contato">Fale com um Especialista</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
