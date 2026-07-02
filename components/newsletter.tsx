"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Loader2 } from "lucide-react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);

  function validateFormat(value: string) {
    if (!value) return "Por favor, insira seu e-mail.";
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
      ? ""
      : "Digite um e-mail válido (ex: nome@dominio.com)";
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const err = validateFormat(email);
    if (err) {
      setEmailError(err);
      return;
    }
    setEmailError("");

    if (!captchaToken) {
      setStatus("error");
      setMessage("Por favor, complete a verificação de segurança.");
      return;
    }

    try {
      setStatus("loading");
      setMessage("");

      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, hcaptchaToken: captchaToken }),
      });

      const data = await response.json();

      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);

      if (!response.ok) {
        setStatus("error");
        setMessage(data.message || "Erro ao realizar inscrição.");
        return;
      }

      setStatus("success");
      setMessage(data.message || "Inscrição realizada com sucesso!");
      setEmail("");

      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 4000);
    } catch {
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
      setStatus("error");
      setMessage("Erro de conexão. Tente novamente.");
    }
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
            <div className="max-w-md mx-auto">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="Seu melhor e-mail"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(validateFormat(e.target.value));
                    }}
                    className={`bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-primary-foreground/40 ${
                      emailError ? "border-red-400" : ""
                    }`}
                    disabled={status === "loading"}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={status === "loading"}
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-medium px-8 shrink-0"
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

              {emailError && (
                <p className="mt-2 text-sm text-red-300 flex items-center gap-1">
                  <span>⚠</span> {emailError}
                </p>
              )}

              {status === "error" && !emailError && (
                <p className="mt-2 text-sm text-red-300">{message}</p>
              )}

              <div className="mt-4 flex justify-center">
                <HCaptcha
                  ref={captchaRef}
                  sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                  onVerify={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                />
              </div>
            </div>
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