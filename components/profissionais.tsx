// components/profissionais.tsx

const profissionais = [
  {
    nome: "Carolina Mota da Cunha",
    especialidade: "Direito Ambiental e Gestão Regulatória",
    descricao:
      "Atuação estratégica em licenciamento ambiental, gestão regulatória e defesa administrativa, com participação institucional junto à OAB/DF e ao CONAM-DF.",
    imagem: "/profissional-1.jpg",
  },
  {
    nome: "Peter Otávio Costa",
    especialidade: "Governança Ambiental e Compliance",
    descricao:
      "Especialista em governança ambiental, compliance regulatório e relações institucionais, com experiência em infraestrutura, setor produtivo e sustentabilidade corporativa.",
    imagem: "/profissional-2.jpg",
  },
  {
    nome: "Josiane Benedet",
    especialidade: "Comunicação Estratégica e Sustentabilidade",
    descricao:
      "Especialista em comunicação empresarial, educação ambiental e gestão de projetos socioambientais voltados ao fortalecimento institucional.",
    imagem: "/profissional-3.jpg",
  },
];

export function Profissionais() {
  return (
    <section
      id="profissionais"
   className="relative min-h-screen overflow-hidden scroll-mt-[120px]"
    >
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <p className="max-w-5xl mx-auto text-lg md:text-xl font-semibold leading-relaxed text-[#071a4d]">
            A Eco Mundi atua sob coordenação de profissionais com experiência em
            governança ambiental, compliance regulatório, gestão de riscos,
            comunicação estratégica e articulação institucional.
            
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch max-w-6xl mx-auto">
          {profissionais.map((profissional) => (
            <div
              key={profissional.nome}
              className="group bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full rounded-lg"
            >
              <div className="h-[300px] overflow-hidden bg-slate-100">
                <img
                  src={profissional.imagem}
                  alt={profissional.nome}
                  className="h-full w-full object-cover object-top grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                />
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-base font-semibold tracking-wide text-[#123d22]">
                  {profissional.nome}
                </h3>

                <p className="mt-2 text-sm font-semibold text-[#8a9f45]">
                  {profissional.especialidade}
                </p>

                <p className="mt-4 text-[14px] leading-7 text-slate-600">
                  {profissional.descricao}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}