// components/Clientes.tsx

"use client";

import { useState } from "react";
import {
  Building2,
  CalendarCheck,
  MousePointerClick,
  Leaf,
  MapPinned,
  Network,
  Quote,
  Users,
  X,
} from "lucide-react";

const clientes = [
  {
    nome: "Verde Nova",
    logo: "/clientes/cliente-1.png",
    segmento: "Soluções ambientais",
    localizacao: "Atuação nacional",
    parceria: "Parceria desde 2022",
    depoimento:
      "A atuação da Eco Mundi trouxe segurança regulatória e clareza técnica fundamentais para a tomada de decisões estratégicas da nossa organização.",
    desafio:
      "Estruturar a governança ambiental e garantir conformidade legal em um cenário regulatório complexo.",
    atuacao:
      "Diagnóstico ambiental, mapeamento de riscos, adequação regulatória e suporte técnico contínuo.",
    resultado:
      "Maior previsibilidade regulatória, redução de passivos e fortalecimento da sustentabilidade corporativa.",
    responsavel: "Diretoria Executiva",
  },
  {
    nome: "Construtiva",
    logo: "/clientes/cliente-2.png",
    segmento: "Engenharia e infraestrutura",
    localizacao: "Projetos estratégicos",
    parceria: "Parceria institucional",
    depoimento:
      "A Eco Mundi demonstrou visão integrada entre técnica, regulação e estratégia, apoiando decisões críticas com segurança.",
    desafio:
      "Apoiar projetos de infraestrutura sujeitos a licenciamento, condicionantes e obrigações ambientais.",
    atuacao:
      "Planejamento regulatório, suporte em processos administrativos e organização de requisitos ambientais.",
    resultado:
      "Mais segurança para execução dos projetos e redução de riscos operacionais e reputacionais.",
    responsavel: "Coordenação de Projetos",
  },
  {
    nome: "Águas Claras",
    logo: "/clientes/cliente-3.png",
    segmento: "Saneamento e meio ambiente",
    localizacao: "Gestão ambiental",
    parceria: "Atuação técnica",
    depoimento:
      "O suporte da Eco Mundi agregou organização, visão estratégica e segurança jurídica aos processos ambientais.",
    desafio:
      "Aprimorar controles ambientais e apoiar a gestão de riscos regulatórios em operações sensíveis.",
    atuacao:
      "Monitoramento de obrigações, análise de conformidade, suporte técnico-jurídico e gestão de riscos.",
    resultado:
      "Processos mais organizados, maior aderência regulatória e melhor capacidade de resposta institucional.",
    responsavel: "Gerência de Sustentabilidade",
  },
];

const indicadores = [
  {
    icon: Users,
    destaque: "+20 anos",
    texto: "de experiência combinada",
  },
  {
    icon: Building2,
    destaque: "+9 setores",
    texto: "estratégicos atendidos",
  },
  {
    icon: MapPinned,
    destaque: "Atuação nacional",
    texto: "em todo o território brasileiro",
  },
  {
    icon: Network,
    destaque: "Rede multidisciplinar",
    texto: "de especialistas",
  },
];

export function Clientes() {
  const [clienteSelecionado, setClienteSelecionado] =
    useState<(typeof clientes)[0] | null>(null);

  const logos = [...clientes, ...clientes, ...clientes];

  return (
    <section className="relative overflow-hidden bg-[#f7f7f2] py-20 sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#dfeee5_0%,transparent_38%)] opacity-80" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-3">
          <Leaf className="h-4 w-4 text-[#0b5f3a]" />
          <p className="text-xs sm:text-sm uppercase tracking-[0.32em] text-[#0b5f3a]/80 font-semibold">
            Experiência e confiança
          </p>
        </div>

        <h2 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-serif leading-tight text-[#06351f]">
          Organizações que confiam
          <br className="hidden sm:block" /> em nossa atuação
        </h2>

        <p className="mt-6 max-w-3xl mx-auto text-base sm:text-lg text-neutral-600 leading-relaxed">
          Atuamos ao lado de empresas, instituições e projetos de diversos
          setores, promovendo segurança regulatória, governança e
          sustentabilidade.
        </p>

        <div className="mx-auto mt-8 flex items-center justify-center gap-3">
          <div className="h-px w-24 bg-[#0b5f3a]/30" />
          <Leaf className="h-4 w-4 text-[#0b5f3a]/80" />
          <div className="h-px w-24 bg-[#0b5f3a]/30" />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {indicadores.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.destaque}
                className="flex items-center gap-5 rounded-3xl border border-[#06351f]/10 bg-white/65 p-6 text-left shadow-[0_12px_35px_rgba(0,0,0,0.04)] backdrop-blur-sm"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e4efe7] text-[#0b5f3a]">
                  <Icon className="h-6 w-6" />
                </div>

                <div>
                  <p className="font-serif text-2xl text-[#06351f]">
                    {item.destaque}
                  </p>
                  <p className="mt-1 text-sm text-neutral-600">{item.texto}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative mt-14 w-full overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 sm:w-32 bg-gradient-to-r from-[#f7f7f2] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 sm:w-32 bg-gradient-to-l from-[#f7f7f2] to-transparent" />

        <div className="flex w-max animate-logo-scroll items-center gap-5 sm:gap-6 px-4">
          {logos.map((cliente, index) => (
            <button
              key={`${cliente.nome}-${index}`}
              type="button"
              onClick={() => setClienteSelecionado(cliente)}
              className="group relative flex h-32 w-64 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-[#06351f]/10 bg-white/90 px-8 shadow-[0_12px_35px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1 hover:border-[#0b5f3a]/25 hover:bg-white hover:shadow-[0_18px_45px_rgba(0,0,0,0.10)]"
            >
              <img
                src={cliente.logo}
                alt={cliente.nome}
                className="max-h-24 max-w-[90%] object-contain opacity-95 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
              />

              <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-[#06351f]/88 opacity-0 transition-all duration-300 group-hover:opacity-100">
                <span className="text-sm font-medium text-white">
                  Conheça o case
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-6 flex items-center justify-center gap-2 text-sm text-[#06351f]/80">
        <MousePointerClick className="h-4 w-4" />
        <span>Clique em uma marca para conhecer o case</span>
      </div>

      {clienteSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Fechar case"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setClienteSelecionado(null)}
          />

          <div className="relative w-full max-w-5xl rounded-[2rem] bg-white p-5 shadow-2xl">
            <button
              type="button"
              aria-label="Fechar"
              onClick={() => setClienteSelecionado(null)}
              className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#06351f] shadow-md transition hover:scale-105"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid gap-8 rounded-[1.6rem] bg-gradient-to-br from-white to-[#edf5ef] p-6 sm:p-8 lg:grid-cols-[0.85fr_1.4fr_0.75fr]">
              <div className="rounded-3xl bg-[#edf5ef] p-6">
                <div className="flex h-32 items-center justify-center">
                  <img
                    src={clienteSelecionado.logo}
                    alt={clienteSelecionado.nome}
                    className="max-h-24 max-w-full object-contain"
                  />
                </div>

                <div className="mt-8 space-y-5 text-sm text-neutral-700">
                  <div className="flex gap-3">
                    <Leaf className="mt-0.5 h-5 w-5 text-[#0b5f3a]" />
                    <div>
                      <p className="font-medium text-[#06351f]">Segmento</p>
                      <p>{clienteSelecionado.segmento}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <MapPinned className="mt-0.5 h-5 w-5 text-[#0b5f3a]" />
                    <div>
                      <p className="font-medium text-[#06351f]">Atuação</p>
                      <p>{clienteSelecionado.localizacao}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CalendarCheck className="mt-0.5 h-5 w-5 text-[#0b5f3a]" />
                    <div>
                      <p className="font-medium text-[#06351f]">Relação</p>
                      <p>{clienteSelecionado.parceria}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="py-2">
                <Quote className="h-9 w-9 text-[#0b5f3a]" />

                <p className="mt-4 font-serif text-xl sm:text-2xl leading-relaxed text-[#06351f]">
                  {clienteSelecionado.depoimento}
                </p>

                <div className="mt-7 h-px w-36 bg-[#0b5f3a]/35" />

                <div className="mt-6 space-y-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0b5f3a]">
                      Desafio
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                      {clienteSelecionado.desafio}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0b5f3a]">
                      Atuação da Eco Mundi
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                      {clienteSelecionado.atuacao}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0b5f3a]">
                      Resultado
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                      {clienteSelecionado.resultado}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center rounded-3xl bg-[#edf5ef] p-6 text-center">
                <div>
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#0b5f3a]/40 text-[#0b5f3a]">
                    <Quote className="h-8 w-8" />
                  </div>

                  <p className="mt-6 text-sm font-medium text-[#06351f]">
                    {clienteSelecionado.responsavel}
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    {clienteSelecionado.nome}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}