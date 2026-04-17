"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Loader2, CheckCircle, MessageCircle } from "lucide-react";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

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
    <section id="contato" className="py-24 sm:py-32 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left Column - Info */}
          <div>
            <p className="text-sm tracking-[0.2em] uppercase text-primary font-medium mb-4">
              Contato
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mb-6 text-balance">
              Vamos conversar sobre seu projeto?
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-10">
              Entre em contato conosco para agendar uma consultoria. Nossa equipe está 
              pronta para entender suas necessidades e apresentar as melhores soluções.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">E-mail</p>
                  <a
                    href="mailto:contato@ecomundi.com.br"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    contato@ecomundi.com.br
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">WhatsApp</p>
                  <a
                    href="https://wa.me/5561991248073?text=Olá! Gostaria de mais informações sobre os serviços da ECO MUNDI."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-green-600 transition-colors"
                  >
                    (61) 99124-8073
                  </a>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Clique para iniciar uma conversa
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Endereço</p>
                  <p className="text-muted-foreground">
                    Asa Sul, Brasília - DF
                    <br />
                    CEP: 70390-145
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="bg-card p-8 sm:p-10 rounded-lg border border-border">
            {status === "success" ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
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
                <div className="grid sm:grid-cols-2 gap-6">
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Descreva brevemente seu projeto ou necessidade..."
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    disabled={status === "loading"}
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
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
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
