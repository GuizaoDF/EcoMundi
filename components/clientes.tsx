// components/Clientes.tsx

import {
  Building2,
  Leaf,
  MapPinned,
  Network,
  Users,
} from "lucide-react";

const clientes = [
  {
    nome: "Cliente 1",
    logo: "/clientes/cliente-1.png",
  },
  {
    nome: "Cliente 2",
    logo: "/clientes/cliente-2.png",
  },
  {
    nome: "Cliente 3",
    logo: "/clientes/cliente-3.png",
  },
  {
    nome: "Cliente 4",
    logo: "/clientes/cliente-4.png",
  },
  {
    nome: "Cliente 5",
    logo: "/clientes/cliente-5.png",
  },
  {
    nome: "Cliente 6",
    logo: "/clientes/cliente-6.png",
  },
  {
    nome: "Cliente 7",
    logo: "/clientes/cliente-7.png",
  },
  {
    nome: "Cliente 8",
    logo: "/clientes/cliente-8.png",
  },
  {
    nome: "Cliente 9",
    logo: "/clientes/cliente-9.png",
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
                  <p className="mt-1 text-sm text-neutral-600">
                    {item.texto}
                  </p>
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
            <div
              key={`${cliente.nome}-${index}`}
              className="flex h-32 w-64 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-[#06351f]/10 bg-white/90 px-8 shadow-[0_12px_35px_rgba(0,0,0,0.06)]"
            >
              <img
                src={cliente.logo}
                alt={cliente.nome}
                className="max-h-24 max-w-[90%] object-contain opacity-95"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}