"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

type Status = "loading" | "success" | "error";

export default function CancelarInscricaoPage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Link de cancelamento inválido.");
      return;
    }

    fetch("/api/newsletter/cancelar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setMessage(data.message ?? "Não foi possível cancelar a inscrição.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Erro de conexão. Tente novamente mais tarde.");
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-20 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="ECO MUNDI - Página inicial">
            <Image
              src="/images/logo-eco-mundi-site.png"
              alt="ECO MUNDI Consultoria e Gestão"
              width={659}
              height={184}
              className="h-14 w-auto"
              priority
            />
          </Link>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-160px)] items-center justify-center px-4 py-20">
        <div className="mx-auto w-full max-w-md text-center">
          {status === "loading" && (
            <div className="space-y-4">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <p className="font-serif text-xl text-foreground">Processando…</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h1 className="font-serif text-3xl font-semibold text-foreground">
                Inscrição cancelada
              </h1>
              <p className="leading-relaxed text-muted-foreground">
                Você foi removido da nossa newsletter com sucesso.
                Lamentamos a sua saída — caso mude de ideia, você pode
                se inscrever novamente a qualquer momento.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Voltar ao site
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-10 w-10 text-destructive" />
              </div>
              <h1 className="font-serif text-3xl font-semibold text-foreground">
                Link inválido
              </h1>
              <p className="leading-relaxed text-muted-foreground">
                {message || "Este link de cancelamento é inválido ou expirou."}
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                Voltar ao site
              </Link>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ECO MUNDI. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
