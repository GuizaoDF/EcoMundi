import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ClipboardCheck,
  FileSearch,
  Leaf,
  RefreshCcw,
  ShieldCheck,
  Target,
  Landmark,
  GraduationCap,
  SearchCheck,
  type LucideIcon,
} from "lucide-react";

const mainServices = [
  {
    number: "01",
    title: "Diagnóstico",
    description:
      "Identificação de riscos, vulnerabilidades regulatórias ocultas, passivos ocultos e oportunidades de melhoria.",
    icon: SearchCheck,
  },
  {
    number: "02",
    title: "Planejamento Integrado",
    description:
      "Definição de estratégias, prioridades e planos de ação alinhados aos objetivos da organização.",
    icon: ClipboardCheck,
  },
  {
    number: "03",
    title: "Implementação",
    description:
      "Estruturação de procedimentos, controles internos e mecanismos de governança e conformidade.",
    icon: Target,
  },
  {
    number: "04",
    title: "Monitoramento",
    description:
      "Acompanhamento contínuo de indicadores, requisitos regulatórios e desempenho operacional.",
    icon: BarChart3,
  },
  {
    number: "05",
    title: "Melhoria Contínua",
    description:
      "Atualização permanente dos processos diante de mudanças regulatórias, riscos emergentes e necessidades organizacionais.",
    icon: RefreshCcw,
  },
  {
    number: "06",
    title: "Não encontrou o que procura?",
    description:
      "Atuamos também em outras áreas e demandas específicas não contempladas nesta apresentação. Fale com nossa equipe.",
    icon: SearchCheck,
  },
];

const specializedSolutions: { title: string; icon: LucideIcon }[] = [
  { title: "Licenciamento Ambiental", icon: Leaf },
  { title: "Gestão de Riscos e Compliance Ambiental", icon: ShieldCheck },
  { title: "Auditorias e Due Diligence", icon: FileSearch },
  { title: "Treinamentos e Capacitações", icon: GraduationCap },
  { title: "Governança Institucional", icon: Landmark },
];

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-8 mb-12 sm:mb-14">
      <div className="hidden sm:block h-px flex-1 max-w-[100px] md:max-w-[180px] bg-[#173b22]/20" />
      <div className="text-center px-2">
        <h3 className="font-serif text-2xl sm:text-3xl lg:text-[2rem] font-semibold text-[#173b22] uppercase tracking-[0.08em]">
          {title}
        </h3>
        <div className="w-12 h-1 bg-emerald-400 mx-auto mt-3 rounded-full" />
      </div>
      <div className="hidden sm:block h-px flex-1 max-w-[100px] md:max-w-[180px] bg-[#173b22]/20" />
    </div>
  );
}

function ServiceNumberBadge({ number }: { number: string }) {
  return (
    <div className="relative flex shrink-0 items-center justify-center w-[72px] sm:w-[100px] lg:w-[110px] self-stretch min-h-[112px] bg-[#173b22]">
      <span className="font-serif text-3xl sm:text-[2.35rem] lg:text-[2.65rem] font-light tracking-[0.12em] text-white tabular-nums">
        {number}
      </span>
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full border-y-[14px] border-y-transparent border-l-[11px] border-l-[#173b22]"
        aria-hidden="true"
      />
    </div>
  );
}

export function Services() {
  return (
    <section id="servicos" className="bg-[#f7f7f2] scroll-mt-[120px]">
      {/* Header */}
      <div className="relative overflow-hidden bg-[#173b22]">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">
          <div className="flex gap-5 sm:gap-6 max-w-3xl">
            <div className="w-1 sm:w-1.5 shrink-0 rounded-full bg-emerald-400 self-stretch min-h-[100px]" />
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-white leading-tight mb-4 sm:mb-5">
                Escopo de Serviços
              </h2>
              <p className="text-white/90 text-base sm:text-lg lg:text-xl font-medium leading-relaxed">
                Governança institucional e segurança regulatória para proteger o
                que mais importa: sua empresa, suas operações e seus
                investimentos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-14 sm:py-16 lg:py-20">
          <SectionHeading title="Nossos Serviços" />

          <div className="space-y-4 sm:space-y-5">
            {mainServices.map((service) => {
              const Icon = service.icon;

              return (
                <article
                  key={service.number}
                  className="group grid grid-cols-[72px_1fr] sm:grid-cols-[100px_88px_1fr_auto] lg:grid-cols-[110px_100px_1fr_150px] items-center bg-white rounded-2xl border border-[#dfe7d8] shadow-[0_4px_24px_rgba(23,59,34,0.06)] hover:shadow-[0_8px_32px_rgba(23,59,34,0.12)] hover:border-emerald-400/40 transition-all duration-300 overflow-hidden"
                >
                  <ServiceNumberBadge number={service.number} />

                  <div className="hidden sm:flex justify-center py-6">
                    <div className="w-[72px] h-[72px] lg:w-20 lg:h-20 rounded-full bg-emerald-400/10 flex items-center justify-center group-hover:bg-emerald-400/15 transition-colors">
                      <Icon
                        className="w-9 h-9 lg:w-10 lg:h-10 text-[#173b22] stroke-[1.5]"
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  <div className="col-span-1 sm:col-span-1 p-5 sm:p-6 lg:p-8 sm:pl-0">
                    <div className="flex items-start gap-4 sm:block">
                      <div className="sm:hidden shrink-0 w-14 h-14 rounded-full bg-emerald-400/10 flex items-center justify-center">
                        <Icon
                          className="w-7 h-7 text-[#173b22] stroke-[1.5]"
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <h4 className="font-serif text-lg sm:text-xl lg:text-2xl font-semibold text-[#173b22] uppercase tracking-wide mb-1.5 sm:mb-2">
                          {service.title}
                          {service.number === "01" && (
                            <span className="ml-2 align-middle text-xs font-sans font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full normal-case tracking-normal">
                              Gratuito e Confidencial
                            </span>
                          )}
                        </h4>
                        <p className="text-[#4a5f50] text-sm sm:text-base leading-relaxed">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 sm:col-span-1 flex justify-end sm:justify-center px-5 pb-5 sm:px-0 sm:pb-0 sm:pr-6 lg:pr-8">
                    <Link
                      href={service.number === "01" ? "/diagnostico" : "#contato"}
                      className="inline-flex items-center gap-2 text-emerald-600 font-semibold text-sm sm:text-base hover:text-emerald-400 transition-colors whitespace-nowrap"
                    >
                      {service.number === "01" ? "Fazer diagnóstico" : "Saiba mais"}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="pt-16 sm:pt-20 lg:pt-24">
            <SectionHeading title="Soluções Especializadas" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-6">
              {specializedSolutions.map((solution) => {
                const Icon = solution.icon;

                return (
                  <div
                    key={solution.title}
                    className="group relative flex flex-col items-center bg-white rounded-2xl border border-[#dfe7d8] px-5 pt-8 pb-10 text-center shadow-[0_4px_20px_rgba(23,59,34,0.05)] hover:shadow-[0_10px_36px_rgba(23,59,34,0.12)] hover:-translate-y-1 hover:border-emerald-400/30 transition-all duration-300"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-400/10 flex items-center justify-center mb-5 group-hover:bg-emerald-400/15 transition-colors">
                      <Icon
                        className="w-8 h-8 text-[#173b22] stroke-[1.5]"
                        aria-hidden="true"
                      />
                    </div>
                    <h4 className="text-[#173b22] font-semibold text-sm sm:text-[15px] leading-snug flex-1">
                      {solution.title}
                    </h4>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-emerald-400 rounded-full group-hover:w-14 transition-all duration-300" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
