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
      "Grandes obras, concessões e operações estratégicas exigem licenciamentos complexos, planejamento de longo prazo, governança ambiental, segurança regulatória e gestão integrada de riscos.",
  },
  {
    icon: Factory,
    title: "Indústrias e operações sujeitas a licenciamento",
    description:
      "Atividades com potencial impacto ambiental demandam controle contínuo de emissões, resíduos, efluentes, condicionantes e obrigações regulatórias, reduzindo riscos à continuidade operacional.",
  },
  {
    icon: Hotel,
    title: "Hotelaria e turismo",
    description:
      "Empreendimentos turísticos dependem da regularidade de licenças, do uso responsável de recursos naturais e da gestão de riscos ambientais, operacionais e reputacionais.",
  },
  {
    icon: GraduationCap,
    title: "Escola e redes de ensino",
    description:
      "Instituições de ensino precisam fortalecer sua governança, prevenir passivos, atender exigências regulatórias e ampliar a segurança perante famílias, comunidade acadêmica e órgãos de controle.",
  },
  {
    icon: Home,
    title: "Empreendimentos imobiliários",
    description:
      "Projetos imobiliários exigem análise de viabilidade, regularização fundiária, licenciamento, due diligence ambiental e atuação estratégica em processos administrativos e judiciais.",
  },
  {
    icon: Tractor,
    title: "Agronegócio e Logística",
    description:
      "Setores ligados ao uso do solo, armazenamento, transporte e cadeias produtivas dependem de conformidade ambiental para reduzir riscos, preservar crédito e evitar barreiras comerciais.",
  },
  {
    icon: HandCoins,
    title: "Investimentos e operações",
    description:
      "Operações societárias, fusões, aquisições e investimentos exigem avaliação prévia de passivos ambientais, riscos regulatórios e impactos que podem comprometer o valor real do negócio.",
  },
  {
    icon: Hospital,
    title: "Hospitais, clínicas e laboratórios",
    description:
      "Serviços de saúde exigem gestão rigorosa de resíduos, licenças sanitárias e ambientais, rastreabilidade e controles internos para reduzir riscos operacionais, sanções e impactos reputacionais.",
  },
  {
    icon: Landmark,
    title: "Instituições públicas e privadas",
    description:
      "Organizações sujeitas a requisitos ambientais, condicionantes, obrigações regulatórias e mecanismos de controle precisam de governança, conformidade e segurança institucional.",
  },
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
    <section
      id="sobre"
      className="relative min-h-screen overflow-hidden scroll-mt-[120px]"
    >
      <div
        className="absolute inset-0 bg-cover bg-[center_5%] bg-no-repeat brightness-110"
        style={{
          backgroundImage: "url('/about-bg.png')",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[#061a10]/70 via-[#061a10]/55 to-[#061a10]/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 xl:pt-28 pb-14">
        <div className="grid lg:grid-cols-[0.62fr_1.38fr] gap-10 lg:gap-8 items-start">
          <div className="pt-1">
            <h2 className="font-serif text-[clamp(1.8rem,5vw,2.75rem)] leading-[1.08] font-semibold text-white max-w-[580px]">
              A Eco Mundi atua junto a instituições{" "}
              <span className="text-emerald-400">públicas ou privadas</span>{" "}
              sujeitas a exigências ambientais, regulatórias e de integridade,
              com foco em{" "}
              <span className="text-emerald-400">
                conformidade, gestão de riscos e segurança
              </span>{" "}
              para tomada de decisão.
            </h2>

            <div className="mt-6 h-[2px] w-14 bg-emerald-400" />

            <p className="mt-7 max-w-[430px] text-white/90 text-base leading-relaxed">
              Transformamos exigências em estratégia e segurança em vantagem
              competitiva.
            </p>
          </div>

          <div className="pt-4 lg:pt-2 xl:pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-8 gap-x-4">
              {sectors.slice(0, 5).map((sector, index) => {
                const Icon = sector.icon;
                const hasDescription = Boolean(sector.description);

                return (
                  <button
                    key={sector.title}
                    type="button"
                    onClick={() => handleOpenSector(sector)}
                    className={`
                      group text-center px-2 sm:px-3
                      border-emerald-400/30
                      ${index % 2 === 0 ? "border-r sm:border-r" : "sm:border-r"}
                      lg:border-r
                      lg:last:border-r-0
                      ${hasDescription ? "cursor-pointer" : "cursor-default"}
                    `}
                  >
                    <Icon className="mx-auto mb-3 h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 xl:h-[4.75rem] xl:w-[4.75rem] text-emerald-400 stroke-[1.45] group-hover:scale-110 transition-transform duration-300" />

                    <h3 className="min-h-[44px] text-white text-xs sm:text-[13px] xl:text-sm font-semibold leading-snug">
                      {sector.title}
                    </h3>

                    <span className="mt-2 inline-flex items-center gap-1 text-emerald-400 text-xs sm:text-[13px] xl:text-sm font-semibold">
                      Saiba mais
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                );
              })}

              <div className="col-span-full grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4 max-w-[830px] mx-auto w-full pt-2">
                {sectors.slice(5).map((sector, index) => {
                  const Icon = sector.icon;
                  const hasDescription = Boolean(sector.description);

                  return (
                    <button
                      key={sector.title}
                      type="button"
                      onClick={() => handleOpenSector(sector)}
                      className={`
                        group text-center px-2 sm:px-3
                        border-emerald-400/30
                        ${index % 2 === 0 ? "border-r" : ""}
                        md:border-r
                        md:last:border-r-0
                        ${hasDescription ? "cursor-pointer" : "cursor-default"}
                      `}
                    >
                      <Icon className="mx-auto mb-3 h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 xl:h-[4.75rem] xl:w-[4.75rem] text-emerald-400 stroke-[1.45] group-hover:scale-110 transition-transform duration-300" />

                      <h3 className="min-h-[44px] text-white text-xs sm:text-[13px] xl:text-sm font-semibold leading-snug">
                        {sector.title}
                      </h3>

                      <span className="mt-2 inline-flex items-center gap-1 text-emerald-400 text-xs sm:text-[13px] xl:text-sm font-semibold">
                        Saiba mais
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-12 lg:mt-20 max-w-[930px] rounded-2xl border border-emerald-400/30 bg-black/25 backdrop-blur-md py-5 px-4 sm:px-6 shadow-[0_0_40px_rgba(52,211,153,0.08)]">
              <div className="flex flex-col md:flex-row md:items-center gap-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 text-center sm:text-left">
                  <div className="shrink-0 h-14 w-14 sm:h-16 sm:w-16 mx-auto sm:mx-0 flex items-center justify-center">
                    <ShieldCheck className="h-12 w-12 sm:h-14 sm:w-14 text-emerald-400 stroke-[1.4]" />
                  </div>

                  <p className="text-white text-base sm:text-lg leading-snug">
                    O maior risco é operar sob a percepção de conformidade sem
                    possuir{" "}
                    <span className="font-semibold text-emerald-400">
                      segurança regulatória.
                    </span>
                  </p>
                </div>

                <a
                  href="/diagnostico"
                  className="w-full md:w-auto inline-flex items-center justify-center gap-3 rounded-xl bg-primary px-4 sm:px-6 py-3.5 text-center text-[14px] sm:text-[15px] font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/90 hover:-translate-y-0.5"
                >
                  Diagnóstico Preliminar de Segurança Regulatória
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedSector && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-[fadeIn_220ms_ease-out]"
          onClick={() => setSelectedSector(null)}
        >
          <aside
            className="
              fixed right-0 top-0 h-full w-full md:max-w-xl
              bg-[#061a10]/95 border-l border-emerald-400/30
              shadow-2xl px-6 py-8 sm:px-7 md:px-10 md:py-10
              animate-[drawerIn_320ms_ease-out]
            "
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedSector(null)}
              className="absolute right-6 top-6 text-white/70 hover:text-emerald-400 transition"
              aria-label="Fechar"
            >
              <X className="h-7 w-7" />
            </button>

            <div className="mt-16">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400/90">
                Saiba mais
              </p>

              <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-white drop-shadow-sm pr-8">
                {selectedSector.title}
              </h3>

              <div className="mt-6 h-[2px] w-16 bg-emerald-400" />

              <p className="mt-7 text-white/85 text-base sm:text-lg leading-relaxed">
                {selectedSector.description}
              </p>

              <div className="mt-9">
                <button
                  type="button"
                  onClick={() => setSelectedSector(null)}
                  className="rounded-xl border border-emerald-400/40 px-6 py-3.5 text-white font-medium hover:bg-emerald-500/50 transition"
                >
                  Entendi
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}