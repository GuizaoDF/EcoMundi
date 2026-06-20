// components/profissionais.tsx

const profissionais = [
  {
    nome: "Peter Otávio Costa",
    especialidade: "Governança Ambiental e Compliance",
    descricao:
      "Especialista em governança ambiental, compliance regulatório e relações institucionais, com experiência em infraestrutura, setor produtivo e sustentabilidade corporativa.",
    imagem: "/profissional-1.jpg",
  },
  {
    nome: "Carolina Mota da Cunha",
    especialidade: "Direito Ambiental e Gestão Regulatória",
  descricao:
  "Atuação estratégica em licenciamento ambiental, gestão regulatória e defesa administrativa, com participação institucional junto à OAB/DF e ao CONAM-DF.",
imagem: "/profissional-2.jpg",
},
  {
    nome: "Josiane Benedet",
    especialidade: "Comunicação Estratégica e Sustentabilidade",
    descricao:
      "Especialista em comunicação empresarial, educação ambiental e gestão de projetos socioambientais voltados ao fortalecimento institucional.",
    imagem: "/profissional-3.jpg",
  },
  {
    nome: "Luiz Carlos de Carvalho",
    especialidade:
      "Gestão Comercial, Marketing Digital, Publicidade e Novos Negócios",
    descricao:
      "Administrador de Empresas, especialista em Marketing e Vendas. Diretor da SEC Estratégias, representante da Editora Globo e Valor Econômico no Paraná, Diretor de Novos Negócios da Eco Mundi Consultoria e Gestão e Vice-Presidente do Instituto Eco Habitat.",
    imagem: "/profissional-4.jpg",
  },
];

export function Profissionais() {
  return (
    <section
      id="profissionais"
      className="relative py-24 overflow-hidden scroll-mt-[120px]"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Texto de abertura */}
        <div className="mb-14 text-center">
          <p className="max-w-5xl mx-auto text-lg md:text-xl font-semibold leading-relaxed text-[#071a4d]">
            A Eco Mundi atua sob coordenação de profissionais com experiência em
            governança ambiental, compliance regulatório, gestão de riscos,
            comunicação estratégica e articulação institucional.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch max-w-7xl mx-auto">
          {profissionais.map((profissional) => (
            <div
              key={profissional.nome}
              className="group flex flex-col h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="h-[260px] overflow-hidden bg-slate-100">
                <img
                  src={profissional.imagem}
                  alt={profissional.nome}
                  className="h-full w-full object-cover object-top grayscale transition-all duration-500 group-hover:grayscale-0"
                />
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-center text-[15px] font-semibold leading-snug text-[#123d22]">
                  {profissional.nome}
                </h3>

                <p className="mt-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a9f45]">
                  {profissional.especialidade}
                </p>

                <div className="w-12 h-px bg-[#8a9f45]/30 mx-auto mt-4" />

                <p className="mt-4 text-[13px] leading-6 text-slate-600 text-justify">
                  {profissional.descricao}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Rede de especialistas */}
        <div className="mt-16 max-w-5xl mx-auto text-center">
          <div className="w-24 h-px bg-[#8a9f45]/40 mx-auto mb-6" />

          <p className="text-lg md:text-xl leading-relaxed text-[#071a4d] font-medium">
          Contando com uma rede multidisciplinar nacional de especialistas parceiros, os quais são acionados conforme a natureza e
          complexidade dos projetos.
          </p>
        </div>
      </div>
    </section>
  );
}