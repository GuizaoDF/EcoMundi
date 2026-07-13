"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Download, X, Loader2, CheckCircle } from "lucide-react";
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

export function Ebooks() {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loaded, setLoaded] = useState(false);
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
      .finally(() => setLoaded(true));
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
        body: JSON.stringify({ ebook_id: modal.ebook.id, nome: nome.trim(), email: email.trim(), inscrito_newsletter: newsletter, hcaptchaToken: captchaToken }),
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

  if (!loaded || ebooks.length === 0) return null;

  return (
    <>
      <section className="py-24 sm:py-32 bg-[#F7F5F0]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              Materiais gratuitos
            </span>
            <h2 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
              E-books e Guias
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Baixe gratuitamente nossos materiais sobre direito ambiental, ESG e sustentabilidade.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ebooks.map((eb) => (
              <div key={eb.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition hover:shadow-md">
                {eb.has_capa ? (
                  <img src={`/api/ebooks/${eb.id}/capa`} alt={eb.titulo} className="h-48 w-full object-cover" />
                ) : (
                  <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-[#0f3d2e] to-[#1a5c44]">
                    <BookOpen className="h-16 w-16 text-white/20" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="mb-2 font-serif text-lg font-semibold text-foreground">{eb.titulo}</h3>
                  {eb.descricao && (
                    <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">{eb.descricao}</p>
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
        </div>
      </section>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>

            {modal.status === "success" ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground">Download iniciado!</h3>
                <p className="text-sm text-muted-foreground">
                  Se o download não começar automaticamente,{" "}
                  <a href={`/api/ebooks/${modal.ebook.id}/arquivo`} target="_blank" rel="noreferrer" className="font-semibold text-primary underline">clique aqui</a>.
                </p>
                <button onClick={closeModal} className="mt-2 w-full rounded-xl border border-border py-3 text-sm font-semibold transition hover:bg-muted">
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
                  <button onClick={closeModal} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => { setNome(e.target.value); if (nomeError) setNomeError(e.target.value.trim() ? "" : "Por favor, insira seu nome."); }}
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
                      onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(validateEmail(e.target.value)); }}
                      placeholder="Seu melhor e-mail"
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
    </>
  );
}
