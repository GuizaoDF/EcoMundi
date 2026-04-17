import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const services = [
  {
    number: "01",
    title: "Consultoria Ambiental e ESG",
    description:
      "Assessoria completa em sustentabilidade, mudanças climáticas, logística reversa, educação ambiental e eficiência energética para empresas de todos os portes.",
    features: [
      "Diagnóstico e adequação ESG",
      "Relatórios de sustentabilidade",
      "Programa de logística reversa",
      "Eficiência operacional e energética",
    ],
  },
  {
    number: "02",
    title: "Regularização e Due Diligence",
    description:
      "Análise técnica e jurídica completa para garantir segurança em transações imobiliárias, investimentos e projetos de desenvolvimento.",
    features: [
      "Due diligence ambiental e fundiária",
      "Regularização urbanística",
      "Licenciamento ambiental",
      "Análise de passivos ambientais",
    ],
  },
  {
    number: "03",
    title: "Estruturação de Projetos",
    description:
      "Modelagem jurídica e financeira para captação de recursos, financiamento e parcerias em projetos de desenvolvimento sustentável.",
    features: [
      "Estruturação de investimentos",
      "Captação de recursos e financiamento",
      "Parcerias público-privadas",
      "Projetos de turismo sustentável",
    ],
  },
];

export function Services() {
  return (
    <section id="servicos" className="py-24 sm:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-sm tracking-[0.2em] uppercase text-primary font-medium mb-4">
            Nossos Serviços
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mb-6 text-balance">
            Uma abordagem integrada para resultados consistentes
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Combinamos expertise jurídica com visão estratégica para entregar soluções que 
            impulsionam o desenvolvimento sustentável dos nossos clientes.
          </p>
        </div>

        {/* Services List */}
        <div className="space-y-8">
          {services.map((service, index) => (
            <div
              key={service.number}
              className="group grid lg:grid-cols-2 gap-8 p-8 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors"
            >
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <span className="font-serif text-4xl font-bold text-primary/20">
                    {service.number}
                  </span>
                  <h3 className="font-serif text-2xl font-semibold text-foreground pt-2">
                    {service.title}
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {service.description}
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="group/btn border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Link href="#contato">
                    Saiba Mais
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </div>
              <div className="lg:pl-8 lg:border-l lg:border-border">
                <p className="text-sm font-medium text-foreground mb-4 uppercase tracking-wider">
                  Inclui
                </p>
                <ul className="space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
