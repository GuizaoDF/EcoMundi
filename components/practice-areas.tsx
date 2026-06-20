"use client";

import { useState } from "react";
import {
  Building2,
  Briefcase,
  Scale,
  Sprout,
  FileSearch,
  Leaf,
  Calendar,
  Globe2,
  ChevronDown,
} from "lucide-react";

const practiceAreas = [
  {
    icon: Building2,
    title: "Governança Regulatória",
    description:
      "Governança regulatória, ambiental, urbanística, fundiária e institucional para projetos de todos os portes.",
  },
  {
    icon: Briefcase,
    title: "Consultoria Estratégica",
    description:
      "Consultoria ambiental, empresarial e estratégica para tomada de decisões assertivas.",
  },
  {
    icon: Scale,
    title: "Advocacia Consultiva",
    description:
      "Atuação jurídica em processos administrativos e judiciais relacionados aos projetos desenvolvidos.",
  },
  {
    icon: Sprout,
    title: "Negócios Sustentáveis",
    description:
      "Modelagem e implantação de negócios sustentáveis alinhados às melhores práticas ESG.",
  },
  {
    icon: FileSearch,
    title: "Due Diligence",
    description:
      "Due diligence regulatória, ambiental, fundiária e imobiliária para garantir segurança nas transações.",
  },
  {
    icon: Leaf,
    title: "Consultoria ESG",
    description:
      "Sustentabilidade, mudanças do clima, logística reversa, educação ambiental e eficiência energética.",
  },
  {
    icon: Calendar,
    title: "Eventos e Cultura",
    description:
      "Assessoramento e estruturação de eventos culturais, históricos, artísticos, turísticos e gastronômicos.",
  },
  {
    icon: Globe2,
    title: "Articulação Institucional",
    description:
      "Articulação nacional e internacional via embaixadas, câmaras de comércio, fundos de investimento e entidades empresariais.",
  },
];

export function PracticeAreas() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section id="atuacao" className="py-20 sm:py-24 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <p className="text-sm tracking-[0.2em] uppercase text-primary font-medium mb-4">
            Áreas de Atuação
          </p>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mb-6 text-balance">
            Soluções Completas para Seu Negócio
          </h2>

          <p className="text-muted-foreground text-lg leading-relaxed">
            Oferecemos uma abordagem integrada que cobre todas as frentes
            necessárias para o sucesso da sua atividade.
          </p>
        </div>

        {/* Desktop */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {practiceAreas.map((area) => (
            <div
              key={area.title}
              className="group min-h-[250px] p-6 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <area.icon className="w-6 h-6 text-primary" />
              </div>

              <h3 className="font-serif text-lg font-semibold text-foreground mb-3">
                {area.title}
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {area.description}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile */}
        <div className="md:hidden space-y-3">
          {practiceAreas.map((area, index) => (
            <div
              key={area.title}
              className="bg-card rounded-lg border border-border overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedIndex(expandedIndex === index ? null : index)
                }
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <area.icon className="w-5 h-5 text-primary" />
                  </div>

                  <span className="font-serif font-semibold text-foreground">
                    {area.title}
                  </span>
                </div>

                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform ${
                    expandedIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedIndex === index && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed pl-[52px]">
                    {area.description}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}