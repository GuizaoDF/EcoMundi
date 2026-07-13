"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen, Download, X, Loader2, CheckCircle } from "lucide-react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

interface Ebook {
  id: number;
  titulo: string;
  descricao: string | null;
  has_capa: number;
  arquivo_nome: string | null;
}

interface ModalState {
  ebook: Ebook;
  status: "idle" | "loading" | "success" | "error";
  message: string;
}

const CARD_COLORS = [
  "from-[#0f3d2e] to-[#1a5c44]",
  "from-[#1a5c44] to-[#2d7a5e]",
  "from-[#2a6049] to-[#0f3d2e]",
  "from-[#3a7a60] to-[#1e4d38]",
];

export default function EbooksPage() {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState<ModalState | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [nomeError, setNomeError] = useState("");
  const [emailError, setEmailError] = useState("");
  const captchaRef = useRef<HCaptcha>(null);

  useEffect(() => {
    fetch("/api/ebooks")
      .then((r) => r.json())
      .then((data) => { if (data.success) setEbooks(data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function openModal(ebook: Ebook) {
    setModal({ ebook, status: "idle", message: "" });
    setNome("");
    setEmail("");
    setNewsletter(true);
    setCaptchaToken(null);
    setNomeError("");
    setEmailError("");
  }

  function closeModal() {
    if (modal?.status === "loading") return;
    setModal(null);
  }

  function validateEmail(v: string) {
    if (!v) return "Por favor, insira seu e-mail.";
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Digite um e-mail válido.";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!modal) return;

    const nErr = nome.trim() ? "" : "Por favor, insira seu nome.";
    const eErr = validateEmail(email);
    setNomeError(nErr);
    setEmailError(eErr);
    if (nErr || eErr) return;

    if (!captchaToken) {
      setModal((m) => m && ({ ...m, status: "error", message: "Complete a verificação de segurança." }));
      return;
    }

    setModal((m) => m && ({ ...m, status: "loading", message: "" }));
    try {
      const res = await fetch("/api/ebook-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ebook_id: modal.ebook.id,
          nome: nome.trim(),
          email: email.trim(),
          inscrito_newsletter: newsletter,
          hcaptchaToken: captchaToken,
        }),
      });
      const data = await res.json();
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);

      if (data.success) {
        setModal((m) => m && ({ ...m, status: "success", message: "" }));
        window.open(`/api/ebooks/${modal.ebook.id}/arquivo`, "_blank");
      } else {
        setModal((m) => m && ({ ...m, status: "error", message: data.message || "Erro ao processar. Tente novamente." }));
      }
    } catch {
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
      setModal((m) => m && ({ ...m, status: "error", message: "Erro de conexão. Tente novamente." }));
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-20 sm:h-24 lg:h-28 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="ECO MUNDI - Página inicial">
            <Image
              src="/images/logo-eco-mundi-site.png"
              alt="ECO MUNDI Consultoria e Gestão"
              width={659}
              height={184}
              className="h-16 sm:h-20 lg:h-24 w-auto"
              priority
            />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background pt-8 pb-16 sm:pt-10 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Materiais gratuitos
          </p>
          <h1 className="mb-6 text-balance font-serif text-4xl font-semibold text-foreground sm:text-5xl">
            E-books e Guias
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Baixe gratuitamente nossos materiais sobre direito ambiental, ESG e sustentabilidade.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="aspect-[16/10] bg-muted" />
                  <div className="space-y-3 p-6">
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-3 rounded bg-muted" />
                    <div className="h-3 w-5/6 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : ebooks.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg text-muted-foreground">
                Nenhum e-book disponível no momento.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {ebooks.map((eb, index) => (
                <div
                  key={eb.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
                >
                  {eb.has_capa ? (
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={`/api/ebooks/${eb.id}/capa`}
                        alt={eb.titulo}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div
                      className={`flex aspect-[16/10] items-center justify-center bg-gradient-to-br ${CARD_COLORS[index % CARD_COLORS.length]}`}
                    >
                      <BookOpen className="h-10 w-10 text-white/30 transition-transform duration-500 group-hover:scale-110" />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="mb-3 font-serif text-xl font-semibold text-foreground transition-colors group-hover:text-primary">
                      {eb.titulo}
                    </h2>
                    {eb.descricao && (
                      <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                        {eb.descricao}
                      </p>
                    )}
                    <button
                      onClick={() => openModal(eb)}
                      className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                    >
                      <Download size={16} /> Baixar grátis
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ECO MUNDI Advocacia. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {modal.status === "success" ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground">Download iniciado!</h3>
                <p className="text-sm text-muted-foreground">
                  Se o download não começar automaticamente,{" "}
                  <a
                    href={`/api/ebooks/${modal.ebook.id}/arquivo`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-primary underline"
                  >
                    clique aqui
                  </a>.
                </p>
                <button
                  onClick={closeModal}
                  className="mt-2 w-full rounded-xl border border-border py-3 text-sm font-semibold transition hover:bg-muted"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-foreground">Baixar e-book</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{modal.ebook.titulo}</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => {
                        setNome(e.target.value);
                        if (nomeError) setNomeError(e.target.value.trim() ? "" : "Por favor, insira seu nome.");
                      }}
                      placeholder="Seu nome"
                      disabled={modal.status === "loading"}
                      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/10 ${nomeError ? "border-red-400 focus:border-red-400" : "border-border focus:border-primary"}`}
                    />
                    {nomeError && <p className="mt-1 text-xs text-red-500">{nomeError}</p>}
                  </div>

                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError(validateEmail(e.target.value));
                      }}
                      placeholder="Seu e-mail"
                      disabled={modal.status === "loading"}
                      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/10 ${emailError ? "border-red-400 focus:border-red-400" : "border-border focus:border-primary"}`}
                    />
                    {emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 transition hover:bg-muted/50">
                    <input
                      type="checkbox"
                      checked={newsletter}
                      onChange={(e) => setNewsletter(e.target.checked)}
                      className="mt-0.5 accent-primary"
                    />
                    <span className="text-sm text-muted-foreground">
                      Quero receber conteúdos sobre direito ambiental e ESG da ECO MUNDI
                    </span>
                  </label>

                  <div className="flex justify-center">
                    <HCaptcha
                      ref={captchaRef}
                      sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                      onVerify={(token) => setCaptchaToken(token)}
                      onExpire={() => setCaptchaToken(null)}
                    />
                  </div>

                  {modal.status === "error" && (
                    <p className="text-center text-sm text-red-500">{modal.message}</p>
                  )}

                  <button
                    type="submit"
                    disabled={modal.status === "loading"}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                  >
                    {modal.status === "loading" ? (
                      <><Loader2 size={16} className="animate-spin" /> Processando...</>
                    ) : (
                      <><Download size={16} /> Baixar grátis</>
                    )}
                  </button>

                  <p className="text-center text-xs text-muted-foreground">
                    Ao baixar, você concorda com nossa política de privacidade.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
