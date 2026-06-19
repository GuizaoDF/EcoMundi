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
  Zap,
  Scale,
  TrendingUp,
} from "lucide-react";

const pillars = [
  {
    icon: Zap,
    number: "01",
    title: "Governança e Inteligência Regulatória",
    subtitle: "O que entregamos",
    description:
      "Estruturamos soluções de governança ambiental, conformidade regulatória e gestão integrada de riscos para ampliar previsibilidade, reduzir vulnerabilidades e fortalecer processos decisórios.",
  },
  {
    icon: Scale,
    number: "02",
    title: "Articulação Estratégica Integrada",
    subtitle: "Onde atuamos",
    description:
      "Atuamos em gargalos institucionais complexos, crises ambientais, embargos, autos de infração e interlocução estratégica com órgãos de controle e regulação.",
  },
  {
    icon: TrendingUp,
    number: "03",
    title: "Continuidade Operacional e Proteção Institucional",
    subtitle: "Para quem",
    description:
      "Desenvolvemos soluções para redução de passivos, conformidade normativa e proteção institucional, transformando exigências ambientais em vantagem competitiva.",
  },
];

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
    <section id="sobre" className="relative overflow-hidden bg-[#f7f7f2] py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">
          <div>
            <p className="text-sm tracking-[0.25em] uppercase text-primary font-semibold mb-5">
              Sobre a Eco Mundi
            </p>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground leading-tight">
              Inteligência regulatória, conformidade ambiental e gestão de riscos para decisões seguras.
            </h2>
          </div>

          <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
            <p>
              Há duas décadas, a Eco Mundi consolida-se como parceira estratégica
              de instituições públicas e privadas em todo o território nacional.
            </p>

            <p>
              Unimos excelência técnica, articulação institucional e visão
              regulatória para reduzir vulnerabilidades, ampliar previsibilidade
              e proteger ativos institucionais.
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] bg-[#061a10] p-6 sm:p-8 lg:p-10 mb-20">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/hero-bg.png')" }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#061a10]/95 via-[#061a10]/72 to-[#061a10]/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/10" />

          <div className="relative z-10 grid lg:grid-cols-[0.82fr_1.18fr] gap-10 items-center">
            <div>
              <h3 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] leading-tight font-semibold text-white">
                A Eco Mundi atua junto a instituições{" "}
                <span className="text-lime-300">públicas ou privadas</span>{" "}
                sujeitas a exigências ambientais, regulatórias e de integridade,
                com foco em{" "}
                <span className="text-lime-300">
                  conformidade, gestão de riscos e segurança
                </span>{" "}
                para tomada de decisão.
              </h3>

              <div className="mt-6 h-[2px] w-14 bg-lime-300" />

              <p className="mt-8 max-w-md text-white/85 text-lg leading-relaxed">
                Transformamos exigências em estratégia e segurança em vantagem competitiva.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
              {sectors.map((sector) => {
                const Icon = sector.icon;

                return (
                  <a
                    key={sector.title}
                    href="#servicos"
                    className="group text-center px-4 py-3 border-r border-lime-300/20 hover:bg-white/[0.04] transition"
                  >
                    <Icon className="mx-auto mb-3 h-14 w-14 text-lime-300 stroke-[1.4] group-hover:scale-110 transition-transform duration-300" />

                    <h4 className="min-h-[48px] text-white text-sm font-semibold leading-snug">
                      {sector.title}
                    </h4>

                    <span className="mt-2 inline-flex items-center gap-1 text-lime-300 text-sm font-semibold">
                      Saiba mais
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 mt-10 max-w-4xl rounded-2xl border border-lime-300/60 bg-black/25 backdrop-blur-md p-5 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-5 flex-1">
                <div className="shrink-0 h-16 w-16 rounded-full border border-lime-300/60 flex items-center justify-center">
                  <ShieldCheck className="h-9 w-9 text-lime-300" />
                </div>

                <p className="text-white text-lg leading-snug">
                  O maior risco é operar sob a percepção de conformidade sem possuir{" "}
                  <span className="font-semibold text-lime-300">
                    segurança regulatória.
                  </span>
                </p>
              </div>

              <a
                href="#contato"
                className="inline-flex items-center justify-center gap-3 rounded-xl border border-lime-300/60 bg-lime-700/80 px-8 py-4 text-white font-medium hover:bg-lime-600 transition"
              >
                Diagnóstico Preliminar
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <p className="text-sm tracking-[0.25em] uppercase text-primary font-semibold mb-3">
            Nossos Pilares
          </p>

          <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground">
            Atuação estratégica de ponta a ponta
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;

            return (
              <div
                key={pillar.title}
                className="group relative overflow-hidden rounded-2xl bg-white border border-black/5 p-8 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="mb-8 flex items-center justify-between">
                  <div className="w-14 h-14 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>

                  <span className="font-serif text-5xl text-primary/20">
                    {pillar.number}
                  </span>
                </div>

                <p className="text-xs tracking-[0.2em] uppercase text-primary font-semibold mb-3">
                  {pillar.subtitle}
                </p>

                <h4 className="font-serif text-2xl font-semibold text-foreground mb-5 leading-snug">
                  {pillar.title}
                </h4>

                <p className="text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}