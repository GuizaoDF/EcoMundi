"use client";

import { useState } from "react";
import {
  ArrowRight,
  Building2,
  Factory,
  Hotel,
  GraduationCap,
  Home,
  Tractor,
  HandCoins,
  Hospital,
  Landmark,
  ShieldCheck,
  X,
} from "lucide-react";

const sectors = [
  {
    icon: Building2,
    title: "Infraestrutura, portos e aeroportos",
    description:
      "Grandes obras e concessões enfrentam licenciamentos complexos de longo prazo. Operações estratégicas que demandam governança ambiental, segurança regulatória e gestão integrada de riscos.",
  },
  { icon: Factory, title: "Indústrias e operações sujeitas a licenciamento" },
  { icon: Hotel, title: "Hotelaria e turismo" },
  { icon: GraduationCap, title: "Escola e redes de ensino" },
  { icon: Home, title: "Empreendimentos imobiliários" },
  { icon: Tractor, title: "Agronegócio e Logística" },
  { icon: HandCoins, title: "Investimentos e operações" },
  { icon: Hospital, title: "Hospitais, clínicas e laboratórios" },
  { icon: Landmark, title: "Instituições públicas e privadas" },
];

type Sector = {
  icon: React.ElementType;
  title: string;
  description?: string;
};

export function About() {
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);

  const handleOpenSector = (sector: Sector) => {
    if (!sector.description) return;
    setSelectedSector(sector);
  };

  return (
    <section id="sobre" className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/hero-bg.png')",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[#061a10]/95 via-[#061a10]/58 to-[#061a10]/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/10" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-8 pt-12 pb-10">
        <div className="grid lg:grid-cols-[0.62fr_1.38fr] gap-8 items-start">
          <div className="pt-1">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.55rem] xl:text-[2.75rem] leading-[1.08] font-semibold text-white max-w-[580px]">
              A Eco Mundi atua junto a instituições{" "}
              <span className="text-lime-300">públicas ou privadas</span>{" "}
              sujeitas a exigências ambientais, regulatórias e de integridade,
              com foco em{" "}
              <span className="text-lime-300">
                conformidade, gestão de riscos e segurança
              </span>{" "}
              para tomada de decisão.
            </h2>

            <div className="mt-6 h-[2px] w-14 bg-lime-300" />

            <p className="mt-7 max-w-[430px] text-white/90 text-base leading-relaxed">
              Transformamos exigências em estratégia e segurança em vantagem
              competitiva.
            </p>
          </div>

          <div className="pt-6 lg:pt-2 xl:pt-4">
            <div className="grid grid-cols-5 gap-y-8">
              {sectors.slice(0, 5).map((sector) => {
                const Icon = sector.icon;
                const hasDescription = Boolean(sector.description);

                return (
                  <button
                    key={sector.title}
                    type="button"
                    onClick={() => handleOpenSector(sector)}
                    className={`group text-center px-3 border-r border-lime-300/30 last:border-r-0 ${
                      hasDescription ? "cursor-pointer" : "cursor-default"
                    }`}
                  >
                    <Icon className="mx-auto mb-3 h-16 w-16 xl:h-[4.75rem] xl:w-[4.75rem] text-lime-300 stroke-[1.45] group-hover:scale-110 transition-transform duration-300" />

                    <h3 className="min-h-[44px] text-white text-[13px] xl:text-sm font-semibold leading-snug">
                      {sector.title}
                    </h3>

                    <span className="mt-2 inline-flex items-center gap-1 text-lime-300 text-[13px] xl:text-sm font-semibold">
                      Saiba mais
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                );
              })}

              <div className="col-span-5 grid grid-cols-4 gap-y-8 max-w-[830px] mx-auto w-full pt-2">
                {sectors.slice(5).map((sector) => {
                  const Icon = sector.icon;
                  const hasDescription = Boolean(sector.description);

                  return (
                    <button
                      key={sector.title}
                      type="button"
                      onClick={() => handleOpenSector(sector)}
                      className={`group text-center px-3 border-r border-lime-300/30 last:border-r-0 ${
                        hasDescription ? "cursor-pointer" : "cursor-default"
                      }`}
                    >
                      <Icon className="mx-auto mb-3 h-16 w-16 xl:h-[4.75rem] xl:w-[4.75rem] text-lime-300 stroke-[1.45] group-hover:scale-110 transition-transform duration-300" />

                      <h3 className="min-h-[44px] text-white text-[13px] xl:text-sm font-semibold leading-snug">
                        {sector.title}
                      </h3>

                      <span className="mt-2 inline-flex items-center gap-1 text-lime-300 text-[13px] xl:text-sm font-semibold">
                        Saiba mais
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-12 max-w-[930px] rounded-2xl border border-lime-300/30 bg-black/25 backdrop-blur-md py-4 px-6 shadow-[0_0_40px_rgba(132,204,22,0.08)]">
              <div className="flex flex-col md:flex-row md:items-center gap-5">
                <div className="flex items-center gap-4 flex-1">
                  <div className="shrink-0 h-16 w-16 flex items-center justify-center">
                    <ShieldCheck className="h-14 w-14 text-lime-300 stroke-[1.4]" />
                  </div>

                  <p className="text-white text-lg leading-snug">
                    O maior risco é operar sob a percepção de conformidade sem
                    possuir{" "}
                    <span className="font-semibold text-lime-300">
                      segurança regulatória.
                    </span>
                  </p>
                </div>

                <a
                  href="#contato"
                  className="inline-flex items-center justify-center gap-3 rounded-xl border border-lime-300/60 bg-lime-700/90 px-6 py-3.5 text-white text-[15px] font-medium hover:bg-lime-600 transition"
                >
                  Diagnóstico Preliminar de Segurança Regulatória
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedSector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl border border-lime-300/30 bg-[#061a10] p-7 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedSector(null)}
              className="absolute right-5 top-5 text-white/70 hover:text-lime-300 transition"
              aria-label="Fechar"
            >
              <X className="h-6 w-6" />
            </button>

            <p className="text-sm tracking-[0.25em] uppercase text-lime-300 font-semibold mb-4">
              Área de atuação
            </p>

            <h3 className="font-serif text-3xl font-semibold text-white mb-5 pr-10">
              {selectedSector.title}
            </h3>

            <p className="text-white/85 text-lg leading-relaxed">
              {selectedSector.description}
            </p>

            <div className="mt-7 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSector(null)}
                className="rounded-xl border border-lime-300/50 px-5 py-3 text-white hover:bg-lime-700/50 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}