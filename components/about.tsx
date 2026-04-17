import { Scale, Leaf, Globe, Handshake } from "lucide-react";

const values = [
  {
    icon: Scale,
    title: "Excelência Técnica",
    description: "Atuação especializada com profundo conhecimento técnico em gestão ambiental e regulatória.",
  },
  {
    icon: Leaf,
    title: "Sustentabilidade",
    description: "Compromisso com soluções que conciliam desenvolvimento econômico e preservação ambiental.",
  },
  {
    icon: Globe,
    title: "Visão Global",
    description: "Articulação institucional nacional e internacional para projetos de grande impacto.",
  },
  {
    icon: Handshake,
    title: "Parceria Estratégica",
    description: "Relacionamento de confiança construído através de resultados consistentes.",
  },
];

export function About() {
  return (
    <section id="sobre" className="py-24 sm:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-sm tracking-[0.2em] uppercase text-primary font-medium mb-4">
            Sobre Nós
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mb-6 text-balance">
            Dedicados à Sustentabilidade e ao Crescimento Responsável
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            A ECO MUNDI é uma consultoria especializada em gestão ambiental que oferece 
            soluções completas para empresas, investidores e projetos que buscam 
            desenvolvimento sustentável com segurança jurídica e excelência operacional.
          </p>
        </div>

        {/* Two Column Content */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          <div>
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-6">
              Nossa Missão
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Orientar empresas, negócios e instituições a trabalharem com práticas sustentáveis 
              adequadas, minimizando impactos socioambientais de suas atividades enquanto promovemos 
              o crescimento econômico responsável.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Desde nossa fundação, desenvolvemos expertise em governança regulatória, consultoria ESG, 
              estruturação de investimentos e articulação institucional, sempre com foco na excelência 
              e na entrega de resultados concretos para nossos clientes.
            </p>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop"
                alt="Escritório moderno"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/10 rounded-lg -z-10" />
          </div>
        </div>

        {/* Values Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value) => (
            <div
              key={value.title}
              className="p-6 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <value.icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-serif text-lg font-semibold text-foreground mb-2">
                {value.title}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
