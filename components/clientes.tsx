// components/Clientes.tsx

"use client";

import { useState } from "react";
import { X } from "lucide-react";

const clientes = [
  {
    nome: "Cliente 1",
    logo: "/clientes/cliente-1.png",
    segmento: "Governança ambiental",
    depoimento:
      "A atuação da Eco Mundi contribuiu para trazer mais segurança regulatória ao projeto, apoiando decisões estratégicas com clareza técnica e visão integrada.",
    responsavel: "Responsável institucional",
    cargo: "Diretoria Executiva",
  },
  {
    nome: "Cliente 2",
    logo: "/clientes/cliente-2.png",
    segmento: "Compliance regulatório",
    depoimento:
      "Encontramos na Eco Mundi uma parceira técnica capaz de compreender os riscos do negócio e propor soluções objetivas para uma operação mais segura.",
    responsavel: "Gestor do projeto",
    cargo: "Coordenação de Operações",
  },
  {
    nome: "Cliente 3",
    logo: "/clientes/cliente-3.png",
    segmento: "Sustentabilidade e gestão de riscos",
    depoimento:
      "O suporte prestado agregou visão estratégica, segurança jurídica e organização aos processos ambientais da instituição.",
    responsavel: "Cliente institucional",
    cargo: "Gerência de Sustentabilidade",
  },
];

export function Clientes() {
  const [clienteSelecionado, setClienteSelecionado] =
    useState<(typeof clientes)[0] | null>(null);

  const logos = [...clientes, ...clientes, ...clientes];

  return (
    <section className="relative overflow-hidden bg-[#f7f7f2] py-20 sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#dfeee5_0%,transparent_35%)] opacity-70" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#0b5f3a]/75 font-semibold">
          Experiência e confiança
        </p>

        <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-serif text-[#06351f]">
          Clientes e instituições atendidas
        </h2>

        <p className="mt-5 max-w-3xl mx-auto text-base sm:text-lg text-neutral-600 leading-relaxed">
          Organizações que contam com nossa atuação em governança ambiental,
          segurança regulatória e sustentabilidade.
        </p>
      </div>

      <div className="relative mt-14 w-full overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 sm:w-32 bg-gradient-to-r from-[#f7f7f2] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 sm:w-32 bg-gradient-to-l from-[#f7f7f2] to-transparent" />

        <div className="flex w-max animate-logo-scroll items-center gap-6 sm:gap-8 px-4">
          {logos.map((cliente, index) => (
            <button
              key={`${cliente.nome}-${index}`}
              type="button"
              onClick={() => setClienteSelecionado(cliente)}
              className="
                group
                flex h-28 w-56 shrink-0 items-center justify-center
                rounded-3xl
                border border-[#06351f]/10
                bg-white/85
                px-8
                shadow-[0_12px_35px_rgba(0,0,0,0.06)]
                backdrop-blur-sm
                transition-all duration-500
                hover:-translate-y-1
                hover:border-[#0b5f3a]/25
                hover:bg-white
                hover:shadow-[0_18px_45px_rgba(0,0,0,0.10)]
              "
            >
              <img
                src={cliente.logo}
                alt={cliente.nome}
                className="
                  max-h-16
                  max-w-full
                  object-contain
                  opacity-90
                  transition-all
                  duration-500
                  group-hover:scale-105
                  group-hover:opacity-100
                "
              />
            </button>
          ))}
        </div>
      </div>

      {clienteSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Fechar depoimento"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setClienteSelecionado(null)}
          />

          <div className="relative w-full max-w-2xl rounded-[2rem] bg-[#f7f7f2] p-6 sm:p-8 shadow-2xl">
            <button
              type="button"
              aria-label="Fechar"
              onClick={() => setClienteSelecionado(null)}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#06351f] shadow-md transition hover:scale-105"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="rounded-3xl bg-white p-6 sm:p-8">
              <div className="flex h-24 items-center justify-center">
                <img
                  src={clienteSelecionado.logo}
                  alt={clienteSelecionado.nome}
                  className="max-h-16 max-w-full object-contain"
                />
              </div>

              <div className="mt-8 text-center">
                <p className="text-xs uppercase tracking-[0.25em] text-[#0b5f3a]/70 font-semibold">
                  {clienteSelecionado.segmento}
                </p>

                <p className="mt-6 text-xl sm:text-2xl font-serif leading-relaxed text-[#06351f]">
                  “{clienteSelecionado.depoimento}”
                </p>

                <div className="mt-8">
                  <p className="font-semibold text-neutral-800">
                    {clienteSelecionado.responsavel}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {clienteSelecionado.cargo}
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