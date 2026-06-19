"use client";

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
} from "lucide-react";

const sectors = [
  { icon: Building2, title: "Infraestrutura, portos e aeroportos" },
  { icon: Factory, title: "Indústrias e operações sujeitas a licenciamento" },
  { icon: Hotel, title: "Hotelaria e turismo" },
  { icon: GraduationCap, title: "Escola e redes de ensino" },
  { icon: Home, title: "Empreendimentos imobiliários" },
  { icon: Tractor, title: "Agronegócio e Logística" },
  { icon: HandCoins, title: "Investimentos e operações" },
  { icon: Hospital, title: "Hospitais, clínicas e laboratórios" },
  { icon: Landmark, title: "Instituições públicas e privadas" },
];

export function About() {
  return (
    <section id="sobre" className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/hero-bg.png')",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[#061a10]/95 via-[#061a10]/65 to-[#061a10]/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/10" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-[0.75fr_1.25fr] gap-10 items-center">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[3.2rem] leading-tight font-semibold text-white">
              A Eco Mundi atua junto a instituições{" "}
              <span className="text-lime-300">públicas ou privadas</span>{" "}
              sujeitas a exigências ambientais, regulatórias e de integridade,
              com foco em{" "}
              <span className="text-lime-300">
                conformidade, gestão de riscos e segurança
              </span>{" "}
              para tomada de decisão.
            </h2>

            <div className="mt-6 h-[2px] w-16 bg-lime-300" />

            <p className="mt-8 max-w-md text-white/90 text-lg leading-relaxed">
              Transformamos exigências em estratégia e segurança em vantagem
              competitiva.
            </p>
          </div>

          <div className="grid grid-cols-5 gap-y-10">
            {sectors.slice(0, 5).map((sector) => {
              const Icon = sector.icon;

              return (
                <a
                  key={sector.title}
                  href="#servicos"
                  className="group text-center px-4 border-r border-lime-300/30 last:border-r-0"
                >
                  <Icon className="mx-auto mb-4 h-20 w-20 text-lime-300 stroke-[1.4] group-hover:scale-110 transition-transform duration-300" />

                  <h3 className="min-h-[50px] text-white text-sm font-semibold leading-snug">
                    {sector.title}
                  </h3>

                  <span className="mt-3 inline-flex items-center gap-1 text-lime-300 text-sm font-semibold">
                    Saiba mais
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </a>
              );
            })}

            <div className="col-span-5 grid grid-cols-4 gap-y-10 max-w-[850px] mx-auto w-full">
              {sectors.slice(5).map((sector) => {
                const Icon = sector.icon;

                return (
                  <a
                    key={sector.title}
                    href="#servicos"
                    className="group text-center px-4 border-r border-lime-300/30 last:border-r-0"
                  >
                    <Icon className="mx-auto mb-4 h-20 w-20 text-lime-300 stroke-[1.4] group-hover:scale-110 transition-transform duration-300" />

                    <h3 className="min-h-[50px] text-white text-sm font-semibold leading-snug">
                      {sector.title}
                    </h3>

                    <span className="mt-3 inline-flex items-center gap-1 text-lime-300 text-sm font-semibold">
                      Saiba mais
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-10 max-w-4xl rounded-2xl border border-lime-300/70 bg-black/25 backdrop-blur-md p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-5 flex-1">
              <div className="shrink-0 h-20 w-20 flex items-center justify-center">
                <ShieldCheck className="h-16 w-16 text-lime-300 stroke-[1.4]" />
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
              className="inline-flex items-center justify-center gap-3 rounded-xl border border-lime-300/60 bg-lime-700/90 px-9 py-5 text-white font-medium hover:bg-lime-600 transition"
            >
              Diagnóstico Preliminar de Segurança Regulatória
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}