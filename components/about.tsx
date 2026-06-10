const pillars = [
  {
    emoji: "⚡",
    title: "Governança e Inteligência Regulatória",
    subtitle: "O que entregamos",
    description:
      "Atuamos na estruturação de soluções e mecanismos de governança ambiental, conformidade regulatória e gestão integrada de riscos, permitindo que organizações ampliem previsibilidade, identifiquem, reduzam, gerenciem vulnerabilidades e fortaleçam seus processos decisórios.",
  },
  {
    emoji: "⚖️",
    title: "Articulação Estratégica Integrada",
    subtitle: "Onde atuamos",
    description:
      "Resolvemos gargalos institucionais complexos de ponta a ponta. Atuamos diretamente na governança de crises ambientais, gestão de embargos, autos de infração e na interlocução estratégica com os órgãos de controle e regulação, promovendo interlocução qualificada, mitigação de riscos e maior segurança operacional.",
  },
  {
    emoji: "📈",
    title: "Continuidade Operacional e Proteção Institucional",
    subtitle: "Para quem",
    description:
      "Desenvolvemos soluções voltadas à redução de passivos, conformidade normativa e fortalecimento da continuidade operacional, contribuindo para a proteção institucional e a sustentabilidade dos negócios. Transformamos exigências ambientais legais em vantagens competitivas de mercado.",
  },
];

export function About() {
  return (
    <section id="sobre" className="py-24 sm:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-sm tracking-[0.2em] uppercase text-primary font-medium mb-4">
            Sobre Nós
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mb-6 text-balance">
            Atuação estratégica em inteligência regulatória, conformidade ambiental e gestão integrada de riscos.
          </h2>
        </div>

        <div className="max-w-3xl mx-auto text-center mb-20">
          <p className="text-muted-foreground text-lg leading-relaxed mb-6">
            Há duas décadas, a Eco Mundi consolida-se como uma parceira de alto nível para
            instituições públicas e privadas em todo o território nacional. Unimos excelência
            técnica, articulação e suporte institucional para garantir que organizações públicas
            e privadas prosperem com maior segurança jurídica, previsibilidade e sustentabilidade
            institucional.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Mais do que atender exigências legais, auxiliamos organizações a reduzir
            vulnerabilidades, ampliar previsibilidade e proteger seus ativos institucionais.
          </p>
        </div>

        <div className="mb-12 text-center">
          <p className="text-sm tracking-[0.2em] uppercase text-primary font-medium mb-4">
            Nossos Pilares de Atuação
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="group p-6 bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <p className="text-xs tracking-[0.15em] uppercase text-primary font-medium mb-2">
                {pillar.subtitle}
              </p>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-3">
                <span className="mr-2" aria-hidden="true">
                  {pillar.emoji}
                </span>
                {pillar.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
