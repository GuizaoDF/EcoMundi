import Link from "next/link";
import Image from "next/image";
import { Linkedin, Instagram, Mail } from "lucide-react";

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
  ],
  contato: [
    { label: "contato@ecomundi.com.br", href: "mailto:contato@ecomundi.com.br" },
    { label: "WhatsApp: (61) 99124-8073", href: "https://wa.me/5561991248073" },
    { label: "Brasília - DF", href: "#contato" },
  ],
};

const socialLinks = [
  { icon: Linkedin, href: "https://www.linkedin.com/company/ecomundiconsultoriaegest%C3%A3o/", label: "LinkedIn" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Mail, href: "mailto:contato@ecomundi.com.br", label: "E-mail" },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            {/* Social Links */}
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

          {/* Links - Empresa */}
          <div>
            <h4 className="font-serif font-semibold text-background mb-4">Empresa</h4>
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

          {/* Links - Áreas */}
          <div>
            <h4 className="font-serif font-semibold text-background mb-4">Áreas de Atuação</h4>
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

          {/* Links - Contato */}
          <div>
            <h4 className="font-serif font-semibold text-background mb-4">Contato</h4>
            <ul className="space-y-3">
              {footerLinks.contato.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-background/60 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-background/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-background/50">
              &copy; {new Date().getFullYear()} ECO MUNDI Consultoria e Gestão. Todos os direitos reservados.
            </p>
            <div className="flex gap-6">
              <Link
                href="#"
                className="text-sm text-background/50 hover:text-background/80 transition-colors"
              >
                Política de Privacidade
              </Link>
              <Link
                href="#"
                className="text-sm text-background/50 hover:text-background/80 transition-colors"
              >
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
