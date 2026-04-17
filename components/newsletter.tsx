"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Loader2 } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setStatus("error");
      setMessage("Por favor, insira seu e-mail.");
      return;
    }

    setStatus("loading");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setStatus("success");
    setMessage("Inscrição realizada com sucesso!");
    setEmail("");

    // Reset after 3 seconds
    setTimeout(() => {
      setStatus("idle");
      setMessage("");
    }, 3000);
  };

  return (
    <section className="py-24 sm:py-32 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-primary-foreground mb-4 text-balance">
            Fique por dentro das novidades
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 leading-relaxed">
            Receba em primeira mão conteúdos sobre direito ambiental, 
            sustentabilidade, ESG e oportunidades de negócios sustentáveis.
          </p>

          {status === "success" ? (
            <div className="flex items-center justify-center gap-3 text-primary-foreground bg-primary-foreground/10 py-4 px-6 rounded-lg">
              <CheckCircle className="w-6 h-6" />
              <span className="font-medium">{message}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Seu melhor e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-primary-foreground/40"
                disabled={status === "loading"}
              />
              <Button
                type="submit"
                disabled={status === "loading"}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-medium px-8"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Inscrever-se"
                )}
              </Button>
            </form>
          )}

          {status === "error" && (
            <p className="mt-3 text-sm text-red-200">{message}</p>
          )}

          <p className="mt-6 text-sm text-primary-foreground/60">
            Ao se inscrever, você concorda com nossa política de privacidade. 
            Você pode cancelar a inscrição a qualquer momento.
          </p>
        </div>
      </div>
    </section>
  );
}
