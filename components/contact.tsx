"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Phone,
  Mail,
  Loader2,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const offices = [
  {
    city: "Brasília - DF",
    address: [
      "Edifício Embassy Tower – SRT Sul",
      "Qd. 701 Bloco K, nº 701, conj. 610",
      "– Asa Sul, Brasília/DF",
    ],
    cep: "70340-908",
    phone: "(61) 99168-4992",
    phoneHref: "tel:+5561991684992",
    email: "contatobsb@ecomundi.com.br",
    mapsHref:
      "https://www.google.com/maps/search/?api=1&query=Edifício Embassy Tower SRT Sul Qd 701 Bloco K 701 Conjunto 610 Asa Sul Brasília DF",
  },
  {
    city: "Curitiba - PR",
    address: ["Av. República Argentina, 1336", "Curitiba/PR"],
    cep: "80620-010",
    phone: "(41) 3019-3716",
    phoneHref: "tel:+554130193716",
    email: "contatocwb@ecomundi.com.br",
    mapsHref:
      "https://www.google.com/maps/search/?api=1&query=Av. República Argentina 1336 Curitiba PR",
  },
];

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    
    if (!response.ok) {
      throw new Error("Erro ao enviar mensagem");
    }
    
    setStatus("success");
    setFormData({ name: "", email: "", company: "", message: "" });

    setTimeout(() => {
      setStatus("idle");
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <section
      id="contato"
      className="relative py-24 sm:py-32 bg-[#f7f5f0] overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-border" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.04fr_0.96fr] gap-14 xl:gap-20 items-start">
          <div>
            <p className="text-sm tracking-[0.24em] uppercase text-primary font-semibold mb-4">
              Contato
            </p>

            <h2 className="font-serif text-4xl sm:text-5xl lg:text-5xl xl:text-6xl leading-[0.95] font-semibold text-foreground mb-7 text-balance">
              Vamos conversar sobre seu projeto?
            </h2>

            <p className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-2xl">
              Entre em contato conosco para agendar uma consultoria. Nossa
              equipe está pronta para entender suas necessidades, apresentar as
              melhores soluções e caminhar com você em cada etapa do seu
              projeto.
            </p>

            <div className="space-y-7 max-w-3xl">
              <a
                href="https://wa.me/5561991684992?text=Olá! Gostaria de mais informações sobre os serviços da ECO MUNDI."
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-[#25D366]/20 bg-gradient-to-r from-[#25D366]/10 to-primary/10 p-5 sm:p-6 flex items-center justify-between gap-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#25D366] rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    <FaWhatsapp className="w-6 h-6 text-white" />
                  </div>

                  <div>
                    <p className="font-semibold text-foreground">
                      WhatsApp Corporativo
                    </p>

                    <p className="text-lg font-semibold text-foreground">
                      (61) 99168-4992
                    </p>

                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Clique para iniciar uma conversa
                    </p>
                  </div>
                </div>

                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-[#25D366] transition-colors shrink-0" />
              </a>

              <div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>

                  <div>
                    <p className="text-sm tracking-[0.18em] uppercase font-semibold text-foreground">
                      Presença nacional
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Atendimento estratégico em Brasília e Curitiba
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl overflow-hidden bg-primary text-white shadow-xl shadow-primary/10">
                  <div className="grid md:grid-cols-2">
                    {offices.map((office, index) => (
                      <div
                        key={office.city}
                        className={`p-6 sm:p-7 lg:p-8 flex flex-col min-h-[330px] ${
                          index === 0
                            ? "border-b md:border-b-0 md:border-r border-white/20"
                            : ""
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-5">
                          <MapPin className="w-5 h-5 text-white/90 mt-1 shrink-0" />

                          <h4 className="font-serif text-2xl font-semibold text-white">
                            {office.city}
                          </h4>
                        </div>

                        <div className="space-y-1 text-sm leading-relaxed text-white/85 mb-5">
                          {office.address.map((line) => (
                            <p key={line}>{line}</p>
                          ))}
                        </div>

                        <p className="text-sm text-white/90 font-medium">
                          CEP: {office.cep}
                        </p>

                        <div className="mt-auto pt-5">
                          <div className="h-px bg-white/20 mb-5" />

                          <div className="space-y-3 text-sm">
                            <a
                              href={office.phoneHref}
                              className="flex items-center gap-2 text-white/85 hover:text-white transition-colors"
                            >
                              <Phone className="w-4 h-4 shrink-0" />
                              {office.phone}
                            </a>

                            <a
                              href={`mailto:${office.email}`}
                              className="flex items-center gap-2 text-white/85 hover:text-white transition-colors break-all"
                            >
                              <Mail className="w-4 h-4 shrink-0" />
                              {office.email}
                            </a>

                            <a
                              href={office.mapsHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 pt-2 text-white font-medium underline underline-offset-4 hover:text-white/80 transition-colors"
                            >
                              Ver no mapa
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/90 p-7 sm:p-9 lg:p-10 rounded-2xl border border-border shadow-sm lg:sticky lg:top-28">
            {status === "success" ? (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>

                <h3 className="font-serif text-2xl font-semibold text-foreground mb-3">
                  Mensagem enviada!
                </h3>

                <p className="text-muted-foreground">
                  Entraremos em contato em breve.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="mb-7">
                  <h3 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-3">
                    Solicite uma análise preliminar
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Nossa equipe avaliará sua demanda e retornará com
                    orientações iniciais.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Seu nome"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={status === "loading"}
                      className="h-12 bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={status === "loading"}
                      className="h-12 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Empresa / Organização</Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="Nome da empresa"
                    value={formData.company}
                    onChange={handleChange}
                    disabled={status === "loading"}
                    className="h-12 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">
                    Conte-nos sobre sua demanda
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Descreva brevemente seu projeto, desafio regulatório, demanda ambiental ou necessidade institucional..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                    disabled={status === "loading"}
                    className="min-h-[320px] bg-white resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar mensagem"
                  )}
                </Button>

                <div className="flex items-start gap-2 text-xs text-muted-foreground pt-2">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p>
                    Seus dados serão utilizados exclusivamente para retorno
                    comercial e qualificação inicial da demanda.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}