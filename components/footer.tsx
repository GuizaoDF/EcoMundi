"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Linkedin, Instagram, Mail, X } from "lucide-react";

type ModalType = "privacy" | "terms" | null;

const footerLinks = {
  empresa: [
    { label: "Sobre Nós", href: "#sobre" },
    { label: "Áreas de Atuação", href: "#atuacao" },
    { label: "Serviços", href: "#servicos" },
    { label: "Notícias", href: "/noticias" },
    { label: "Contato", href: "#contato" },
  ],
  areas: [
    { label: "Direito Ambiental", href: "#atuacao" },
    { label: "Consultoria ESG", href: "#atuacao" },
    { label: "Due Diligence", href: "#atuacao" },
    { label: "Regularização Fundiária", href: "#atuacao" },
    { label: "Gestão Ambiental", href: "#atuacao" },
  ],
  contato: [
    { label: "contatobsb@ecomundi.com.br", href: "mailto:contatobsb@ecomundi.com.br" },
    { label: "WhatsApp: (61) 99168-4992", href: "https://wa.me/5561991684992" },
    { label: "Brasília - DF", href: "#contato" },
  ],
};

const socialLinks = [
  {
    icon: Linkedin,
    href: "https://www.linkedin.com/company/ecomundiconsultoriaegest%C3%A3o/",
    label: "LinkedIn",
  },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Mail, href: "mailto:contatobsb@ecomundi.com.br", label: "E-mail" },
];

export function Footer() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  useEffect(() => {
    if (!activeModal) return;

    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveModal(null);
      }
    }

    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [activeModal]);

  return (
    <>
      <footer className="bg-foreground text-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors group"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 text-background/70 group-hover:text-primary-foreground transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-serif font-semibold text-background mb-4">
                Empresa
              </h4>

              <ul className="space-y-3">
                {footerLinks.empresa.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-background/60 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-serif font-semibold text-background mb-4">
                Áreas de Atuação
              </h4>

              <ul className="space-y-3">
                {footerLinks.areas.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-background/60 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-serif font-semibold text-background mb-4">
                Contato
              </h4>

              <ul className="space-y-3">
                {footerLinks.contato.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={
                        link.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="text-sm text-background/60 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-background/10">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-background/50">
                &copy; {new Date().getFullYear()} Eco Mundi.
                Todos os direitos reservados.
              </p>

              <p className="text-xs text-background/50">
              Eco Mundi Consultoria Inteligente — CNPJ: 07.970.394/0001-50
              </p>

              <div className="flex gap-6">
                <button
                  type="button"
                  onClick={() => setActiveModal("privacy")}
                  className="text-sm text-background/50 hover:text-background/80 transition-colors"
                >
                  Política de Privacidade
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModal("terms")}
                  className="text-sm text-background/50 hover:text-background/80 transition-colors"
                >
                  Termos de Uso
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative w-full max-w-4xl h-[85vh] rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-neutral-200 bg-white px-6 py-5">
              <div>
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-neutral-900">
                  {activeModal === "privacy"
                    ? "Política de Privacidade"
                    : "Termos de Uso"}
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Última atualização: Maio de 2026.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-shrink-0 rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="h-[calc(85vh-96px)] overflow-y-auto px-6 py-6">
              {activeModal === "privacy" ? <PrivacyContent /> : <TermsContent />}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-6 text-sm md:text-base leading-relaxed text-neutral-700">
      <p>
        A Eco Mundi valoriza a privacidade e a segurança das informações de seus
        clientes, parceiros e usuários. Esta Política de Privacidade descreve como
        coletamos, usamos, armazenamos e protegemos os dados pessoais fornecidos
        em nosso site, em estrita conformidade com a Lei Geral de Proteção de Dados
        (LGPD - Lei nº 13.709/2018).
      </p>

      <section>
        <h3 className="font-semibold text-lg text-neutral-900 mb-2">
          1. Dados Coletados e Finalidade
        </h3>

        <p>
          <strong>Dados coletados:</strong> Nome, e-mail corporativo, empresa, cargo,
          segmento de atuação e descrição do desafio regulatório.
        </p>

        <p className="mt-2">
          <strong>Finalidade:</strong> Utilizados exclusivamente para qualificar o
          atendimento inicial, realizar análises preliminares de exposição de risco,
          enviar materiais informativos, atualizações regulatórias e propostas
          comerciais solicitadas.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-lg text-neutral-900 mb-2">
          2. Base Legal para o Tratamento de Dados
        </h3>

        <p>Tratamos os seus dados com base nas seguintes hipóteses legais da LGPD:</p>

        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>
            <strong>Consentimento:</strong> quando você se cadastra espontaneamente
            em nossa newsletter.
          </li>
          <li>
            <strong>Procedimentos Preliminares à Execução de Contrato:</strong> quando
            você preenche o formulário solicitando um diagnóstico preliminar ou
            proposta de consultoria.
          </li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-lg text-neutral-900 mb-2">
          3. Compartilhamento e Segurança dos Dados
        </h3>

        <p>
          A Eco Mundi não comercializa, aluga ou compartilha seus dados pessoais ou
          institucionais com terceiros para fins publicitários.
        </p>

        <p className="mt-2">
          Os dados armazenados são protegidos por rígidos protocolos de segurança
          digital, visando impedir o acesso não autorizado, vazamento ou alteração das
          informações.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-lg text-neutral-900 mb-2">
          4. Direitos do Titular dos Dados (LGPD)
        </h3>

        <p>
          Você, como titular dos dados, possui o direito de, a qualquer momento,
          solicitar à Eco Mundi:
        </p>

        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>Confirmação da existência do tratamento de seus dados.</li>
          <li>Acesso aos dados armazenados.</li>
          <li>Correção de dados incompletos ou desatualizados.</li>
          <li>Eliminação dos dados ou revogação do consentimento.</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-lg text-neutral-900 mb-2">
          5. Uso de Cookies
        </h3>

        <p>
          Nosso site utiliza cookies técnicos essenciais para garantir o funcionamento
          correto da página.
        </p>

        <p className="mt-2">
          Também utilizamos cookies de análise, como Google Analytics, de forma
          agregada e anônima, para compreender o fluxo de navegação e melhorar a
          experiência do usuário.
        </p>

        <p className="mt-2">
          Você pode gerenciar as preferências de cookies diretamente em seu navegador.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-lg text-neutral-900 mb-2">
          6. Contato com o Encarregado de Dados (DPO)
        </h3>

        <p>
          Para exercer seus direitos de titular ou esclarecer dúvidas sobre esta
          Política, entre em contato pelo e-mail:
        </p>

        <a
          href="mailto:contatobsb@ecomundi.com.br"
          className="mt-2 inline-block font-medium text-primary hover:underline"
        >
          contatobsb@ecomundi.com.br
        </a>
      </section>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="space-y-6 text-sm md:text-base leading-relaxed text-neutral-700">
      <p>
        Este Termo de Uso estabelece as condições gerais para acesso e utilização do
        site da Eco Mundi Consultoria e Gestão Ambiental.
      </p>

      <section>
        <h3 className="font-semibold text-lg text-neutral-900 mb-2">
          1. Aceitação dos Termos
        </h3>
        <p>
          Ao acessar e utilizar este site, o usuário declara estar ciente e de acordo
          com as condições estabelecidas neste Termo de Uso.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-lg text-neutral-900 mb-2">
          2. Finalidade do Site
        </h3>
        <p>
          O site possui caráter exclusivamente institucional e informativo, destinado à
          apresentação da Eco Mundi, suas áreas de atuação, serviços, conteúdos técnicos
          e canais de contato.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-lg text-neutral-900 mb-2">
          3. Propriedade Intelectual
        </h3>
        <p>
          Todo o conteúdo disponibilizado neste site, incluindo textos, imagens,
          logotipos, marcas, layouts, materiais técnicos e demais elementos visuais ou
          informativos, é de propriedade da Eco Mundi ou utilizado mediante autorização.
        </p>
        <p className="mt-2">
          É vedada a reprodução, distribuição, alteração ou utilização de qualquer
          conteúdo sem autorização prévia e expressa da Eco Mundi.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-lg text-neutral-900 mb-2">
          4. Limitação de Responsabilidade
        </h3>
        <p>
          As informações disponibilizadas no site possuem caráter meramente informativo
          e não constituem parecer técnico, jurídico, ambiental ou consultoria
          profissional individualizada.
        </p>
        <p className="mt-2">
          A Eco Mundi não se responsabiliza por decisões tomadas exclusivamente com base
          nas informações disponibilizadas neste site.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-lg text-neutral-900 mb-2">
          5. Links Externos
        </h3>
        <p>
          O site poderá conter links para páginas de terceiros. A Eco Mundi não se
          responsabiliza pelo conteúdo, políticas, práticas ou disponibilidade desses
          sites externos.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-lg text-neutral-900 mb-2">
          6. Disponibilidade do Serviço
        </h3>
        <p>
          A Eco Mundi poderá alterar, suspender ou interromper o funcionamento do site,
          total ou parcialmente, a qualquer momento, sem necessidade de aviso prévio.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-lg text-neutral-900 mb-2">
          7. Proteção de Dados
        </h3>
        <p>
          O tratamento de dados pessoais realizado por meio deste site segue as
          disposições descritas na Política de Privacidade da Eco Mundi.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-lg text-neutral-900 mb-2">
          8. Alterações dos Termos
        </h3>
        <p>
          A Eco Mundi poderá atualizar este Termo de Uso periodicamente. A versão mais
          recente estará sempre disponível neste site.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-lg text-neutral-900 mb-2">
          9. Legislação Aplicável
        </h3>
        <p>
          Este Termo de Uso é regido pelas leis da República Federativa do Brasil,
          especialmente pela legislação civil brasileira e pela Lei Geral de Proteção de
          Dados (LGPD).
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-lg text-neutral-900 mb-2">
          10. Contato
        </h3>
        <p>
          Em caso de dúvidas sobre este Termo de Uso, entre em contato pelo e-mail:
        </p>

        <a
          href="mailto:contatobsb@ecomundi.com.br"
          className="mt-2 inline-block font-medium text-primary hover:underline"
        >
          contatobsb@ecomundi.com.br
        </a>
      </section>
    </div>
  );
}