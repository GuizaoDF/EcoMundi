// components/profissionais.tsx

const profissionais = [
  {
    nome: "Carolina Mota da Cunha",
    descricao:
      "Advogada especialista em Direito Ambiental, Vice-Presidente da Comissão de Direito Ambiental da OAB/DF e Membro Titular da OAB/DF na Câmara de Julgamento de Autos de Infração do CONAM-DF. Possui experiência em licenciamento ambiental, gestão regulatória e suporte jurídico estratégico.",
    imagem: "/profissional-1.jpg",
  },
  {
    nome: "Peter Otávio Costa",
    descricao:
      "Advogado, consultor e perito ambiental, certificado em Compliance e Liderança em Governança pela LEC. Presidente da Comissão de Direito Ambiental e Sustentabilidade da OAB/DF, Membro da Comissão de Direito Ambiental da OAB Nacional e Conselheiro do CONAM/DF. Especialista em Governança Ambiental e Compliance Regulatório com atuação no setor de infraestrutura, setor produtivo e relações institucionais.",
    imagem: "/profissional-2.jpg",
  },
  {
    nome: "Josiane Benedet",
    descricao:
      "Gestora ambiental e jornalista especialista em comunicação empresarial estratégica, educação ambiental e gestão de projetos socioambientais.",
    imagem: "/profissional-3.jpg",
  },
];

export function Profissionais() {
  return (
    <section id="profissionais" className="py-24 bg-[#f7f7f2]">
      <div className="container mx-auto px-4">
        <div className="mb-14 text-center">
          <p className="text-sm tracking-[0.35em] uppercase text-emerald-700 font-semibold">
            Equipe
          </p>

          <h2 className="mt-4 text-4xl md:text-5xl font-serif text-[#123d22]">
            Profissionais | ECO MUNDI
          </h2>

          <p className="mt-6 max-w-3xl mx-auto text-slate-600">
            Conheça os profissionais responsáveis pela atuação técnica,
            estratégica e institucional da ECO MUNDI Consultoria e Gestão.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {profissionais.map((profissional) => (
            <div
              key={profissional.nome}
              className="group bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full rounded-lg"
            >
              <div className="aspect-[4/5] overflow-hidden bg-slate-100">
                <img
                  src={profissional.imagem}
                  alt={profissional.nome}
                  className="h-full w-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                />
              </div>

              <div className="p-7 flex flex-col flex-1">
                <h3 className="text-lg font-semibold tracking-wide text-[#123d22]">
                  {profissional.nome}
                </h3>

                <p className="mt-5 text-[15px] leading-7 text-slate-600">
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