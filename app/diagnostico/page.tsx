"use client";

import { useState, useRef, useEffect } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Loader2,
  ClipboardCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

type Classificacao =
  | "Crítico"
  | "Vulnerável"
  | "Em Desenvolvimento"
  | "Conformidade Adequada";

interface Alternativa {
  id: number;
  texto: string;
  pontuacao: number;
  ordem: number;
}

interface Pergunta {
  id: number;
  texto: string;
  ordem: number;
  alternativas: Alternativa[];
}

interface Categoria {
  id: number;
  nome: string;
  descricao: string;
  perguntas: Pergunta[];
}

interface CampoPerfil {
  id: string;
  label: string;
  tipo: "text" | "number" | "boolean" | "select";
  obrigatorio: boolean;
  opcoes?: string[];
}

interface FormularioData {
  id: number;
  nome: string;
  descricao: string;
  categorias: Categoria[];
  campos_perfil?: CampoPerfil[];
}

interface CategoriaResultado {
  nome: string;
  percentual: number;
  pontuacao: number;
  pontuacao_max: number;
}

interface Resultado {
  resultado_id: number;
  pontuacao_total: number;
  pontuacao_maxima: number;
  percentual: number;
  classificacao: Classificacao;
  categorias: CategoriaResultado[];
}

type Etapa = "intro" | "dados" | "identificacao" | "perguntas" | "resultado" | "indisponivel";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const classificacaoConfig: Record<
  Classificacao,
  { bg: string; text: string; border: string; bar: string; label: string }
> = {
  Crítico: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    bar: "bg-red-500",
    label: "Crítico",
  },
  Vulnerável: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    bar: "bg-orange-500",
    label: "Vulnerável",
  },
  "Em Desenvolvimento": {
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-200",
    bar: "bg-yellow-500",
    label: "Em Desenvolvimento",
  },
  "Conformidade Adequada": {
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-200",
    bar: "bg-green-600",
    label: "Conformidade Adequada",
  },
};

function getBarColor(percentual: number) {
  if (percentual < 25) return "bg-red-500";
  if (percentual < 50) return "bg-orange-500";
  if (percentual < 75) return "bg-yellow-500";
  return "bg-green-600";
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function formatCnpj(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

function validateCnpj(value: string) {
  const d = value.replace(/\D/g, "");
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const calc = (s: string, len: number) => {
    let sum = 0, pos = len - 7;
    for (let i = len; i >= 1; i--) { sum += parseInt(s[len - i]) * pos--; if (pos < 2) pos = 9; }
    return sum % 11 < 2 ? 0 : 11 - (sum % 11);
  };
  return calc(d, 12) === parseInt(d[12]) && calc(d, 13) === parseInt(d[13]);
}

function formatTelefone(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function validateTelefone(value: string) {
  const d = value.replace(/\D/g, "");
  return d.length === 10 || d.length === 11;
}

const STORAGE_KEY = "ecomundi_diagnostico";

// ─── Component ───────────────────────────────────────────────────────────────

export default function DiagnosticoPage() {
  const [etapa, setEtapa] = useState<Etapa>("intro");
  const [carregando, setCarregando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [formulario, setFormulario] = useState<FormularioData | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  // Dados pessoais
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);

  // Identificação da empresa
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [cnpjError, setCnpjError] = useState("");
  const [cnpjTouched, setCnpjTouched] = useState(false);
  const [telefone, setTelefone] = useState("");
  const [telefoneError, setTelefoneError] = useState("");
  const [telefoneTouched, setTelefoneTouched] = useState(false);

  // Perguntas
  const [perguntaDestaque, setPerguntaDestaque] = useState<number | null>(null);

  // Progresso salvo
  const [progressoSalvo, setProgressoSalvo] = useState<any>(null);
  const [camposPerfil, setCamposPerfil] = useState<CampoPerfil[]>([]);
  const [dadosPerfil, setDadosPerfil] = useState<Record<string, string | boolean>>({});

  // Respostas: pergunta_id → alternativa_id
  const [respostas, setRespostas] = useState<Record<number, number>>({});

  // Resultado
  const [resultado, setResultado] = useState<Resultado | null>(null);

  // Trava de reenvio
  const [verificandoTrava, setVerificandoTrava] = useState(false);
  const [travaAtiva, setTravaAtiva] = useState(false);

  // Convite
  const [conviteToken, setConviteToken] = useState<string | null>(null);
  const [conviteInfo, setConviteInfo] = useState<{
    formulario_id: number;
    email: string;
    nome_empresa: string | null;
    nome_contato: string | null;
  } | null>(null);
  const [conviteErro, setConviteErro] = useState<string | null>(null);
  const [validandoConvite, setValidandoConvite] = useState(false);

  // ── localStorage: carregar progresso salvo ──────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setProgressoSalvo(JSON.parse(saved));
    } catch {}
  }, []);

  // ── localStorage: salvar progresso ──────────────────────────────────────
  useEffect(() => {
    if (etapa !== "perguntas" && etapa !== "identificacao" && etapa !== "dados") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        formulario_id: formulario?.id,
        etapa, stepIndex, nome, email,
        razaoSocial, cnpj, telefone, dadosPerfil, respostas,
        savedAt: new Date().toISOString(),
      }));
    } catch {}
  }, [etapa, stepIndex, respostas, nome, email, razaoSocial, cnpj, telefone, dadosPerfil]);

  // ── localStorage: limpar ao concluir ────────────────────────────────────
  useEffect(() => {
    if (etapa === "resultado") {
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    }
  }, [etapa]);

  // ── Retomar progresso salvo ──────────────────────────────────────────────
  async function retomar() {
    if (!progressoSalvo) return;
    setCarregando(true);
    setErro(null);
    try {
      const url = progressoSalvo.formulario_id
        ? `/api/diagnostico/perguntas?formulario_id=${progressoSalvo.formulario_id}`
        : "/api/diagnostico/perguntas";
      const res = await fetch(url);
      const data = await res.json();
      if (!data.success || !data.ativo) {
        localStorage.removeItem(STORAGE_KEY);
        setProgressoSalvo(null);
        setErro("O formulário foi atualizado. Por favor, inicie um novo diagnóstico.");
        return;
      }
      setFormulario({ ...data.formulario, categorias: data.categorias ?? [] });
      setCamposPerfil(data.formulario.campos_perfil ?? []);
      setNome(progressoSalvo.nome || "");
      setEmail(progressoSalvo.email || "");
      setRazaoSocial(progressoSalvo.razaoSocial || "");
      setCnpj(progressoSalvo.cnpj || "");
      setTelefone(progressoSalvo.telefone || "");
      setDadosPerfil(progressoSalvo.dadosPerfil || {});
      setRespostas(progressoSalvo.respostas || {});
      setStepIndex(progressoSalvo.stepIndex || 0);
      setEtapa(progressoSalvo.etapa || "perguntas");
      setProgressoSalvo(null);
    } catch {
      setErro("Erro ao retomar. Tente iniciar novamente.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("convite");
    if (!token) return;
    setConviteToken(token);
    setValidandoConvite(true);
    fetch(`/api/diagnostico/convite/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setConviteInfo(data.data);
        } else {
          setConviteErro(data.message ?? "Convite inválido ou já utilizado.");
        }
      })
      .catch(() => setConviteErro("Erro ao validar o convite."))
      .finally(() => setValidandoConvite(false));
  }, []);

  // ── Iniciar: buscar formulário ativo (ou do convite) ─────────────────────
  async function iniciar() {
    setCarregando(true);
    setErro(null);
    try {
      const url = conviteInfo
        ? `/api/diagnostico/perguntas?formulario_id=${conviteInfo.formulario_id}`
        : "/api/diagnostico/perguntas";
      const res = await fetch(url);
      const data = await res.json();
      if (!data.success || !data.ativo) {
        setEtapa("indisponivel");
        return;
      }
      const campos: CampoPerfil[] = data.formulario.campos_perfil ?? [];
      setFormulario({ ...data.formulario, categorias: data.categorias ?? [] });
      setCamposPerfil(campos);
      setDadosPerfil({});
      // Pré-preencher campos do convite
      if (conviteInfo) {
        if (conviteInfo.nome_contato) setNome(conviteInfo.nome_contato);
        if (conviteInfo.email) setEmail(conviteInfo.email);
        if (conviteInfo.nome_empresa) setRazaoSocial(conviteInfo.nome_empresa);
      }
      setEtapa("dados");
    } catch {
      setErro("Erro ao carregar o diagnóstico. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  // ── Enviar formulário ─────────────────────────────────────────────────────
  async function submeter() {
    if (!formulario) return;
    setEnviando(true);
    setErro(null);
    try {
      const todasRespostas = formulario.categorias.flatMap((cat) =>
        cat.perguntas.map((p) => ({
          pergunta_id: p.id,
          alternativa_id: respostas[p.id],
        }))
      );

      const res = await fetch("/api/diagnostico/submeter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formulario_id: formulario.id,
          nome,
          email,
          telefone: telefone || undefined,
          razao_social: razaoSocial,
          cnpj,
          dados_perfil: Object.keys(dadosPerfil).length > 0 ? dadosPerfil : undefined,
          hcaptchaToken: captchaToken,
          respostas: todasRespostas,
          convite_token: conviteToken ?? undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErro(data.message || "Erro ao enviar diagnóstico.");
        captchaRef.current?.resetCaptcha();
        setCaptchaToken(null);
        return;
      }
      setResultado(data.data);
      setEtapa("resultado");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErro("Erro ao enviar. Tente novamente.");
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
    } finally {
      setEnviando(false);
    }
  }

  // ── Navegação entre steps de perguntas ───────────────────────────────────
  const categoriaAtual = formulario?.categorias[stepIndex];
  const totalSteps = formulario?.categorias.length ?? 0;

  function todasRespondidas() {
    if (!categoriaAtual) return false;
    return categoriaAtual.perguntas.every((p) => respostas[p.id] !== undefined);
  }

  function selecionarResposta(perguntaId: number, altId: number) {
    const novas = { ...respostas, [perguntaId]: altId };
    setRespostas(novas);
    if (!categoriaAtual) return;
    const completo = categoriaAtual.perguntas.every((p) => novas[p.id] !== undefined);
    if (!completo) return;
    if (stepIndex === totalSteps - 1) {
      setTimeout(() => {
        document.getElementById("captcha-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 400);
    }
  }

  useEffect(() => {
    if (etapa === "perguntas") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (etapa === "perguntas" && stepIndex === totalSteps - 1) {
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
    }
  }, [stepIndex, etapa]);

  function avancarPerguntas() {
    if (!todasRespondidas()) {
      const faltando = categoriaAtual?.perguntas.find((p) => respostas[p.id] === undefined);
      if (faltando) {
        document.getElementById(`q-${faltando.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        setPerguntaDestaque(faltando.id);
        setTimeout(() => setPerguntaDestaque(null), 1500);
      }
      return;
    }
    if (stepIndex === totalSteps - 1 && !captchaToken) {
      document.getElementById("captcha-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (stepIndex < totalSteps - 1) {
      setStepIndex((s) => s + 1);
    } else {
      submeter();
    }
  }

  // ── Progress bar ─────────────────────────────────────────────────────────
  const progressoPerguntas =
    etapa === "perguntas" ? ((stepIndex + 1) / totalSteps) * 100 : 0;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  // ── Intro ─────────────────────────────────────────────────────────────────
  if (etapa === "intro") {
    return (
      <div className="min-h-screen bg-[#f7f7f2]">
        <section className="relative overflow-hidden bg-[#173b22]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
            <div className="flex gap-5 sm:gap-6">
              <div className="w-1 sm:w-1.5 shrink-0 rounded-full bg-emerald-400 self-stretch min-h-[120px]" />
              <div>
                <div className="inline-flex items-center gap-2 text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-4">
                  <ClipboardCheck className="w-4 h-4" />
                  Gratuito e Confidencial
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-white leading-tight mb-5">
                  Diagnóstico Preliminar de Conformidade Regulatória e
                  Sustentabilidade Corporativa
                </h1>
                <p className="text-white/85 text-base sm:text-lg leading-relaxed max-w-2xl mb-8">
                  Avalie em minutos o nível de maturidade regulatória da sua
                  empresa. Ao final, você receberá uma pontuação detalhada por
                  categoria e um relatório completo no seu e-mail.
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-white/70 mb-10">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Resultado imediato na tela
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Análise enviada por e-mail
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    100% gratuito e confidencial
                  </span>
                </div>
                {progressoSalvo && !conviteErro && (
                  <div className="mb-4 rounded-xl border border-emerald-400/40 bg-emerald-900/20 px-4 py-4 text-sm text-emerald-300">
                    <p className="font-semibold mb-2">Você tem um diagnóstico em andamento.</p>
                    <div className="flex gap-3">
                      <button
                        onClick={retomar}
                        disabled={carregando}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-bold text-[#173b22] transition hover:bg-emerald-300 disabled:opacity-60"
                      >
                        {carregando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        Retomar
                      </button>
                      <button
                        onClick={() => { localStorage.removeItem(STORAGE_KEY); setProgressoSalvo(null); }}
                        className="rounded-lg border border-emerald-400/40 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-900/30"
                      >
                        Começar do zero
                      </button>
                    </div>
                  </div>
                )}
                {conviteErro && (
                  <div className="mb-4 rounded-xl border border-red-400/40 bg-red-900/30 px-4 py-3 text-sm text-red-300">
                    {conviteErro}
                  </div>
                )}
                {conviteInfo && !conviteErro && (
                  <div className="mb-4 rounded-xl border border-emerald-400/40 bg-emerald-900/20 px-4 py-3 text-sm text-emerald-300">
                    Este diagnóstico foi preparado especialmente para{" "}
                    <strong>{conviteInfo.nome_empresa || conviteInfo.email}</strong>.
                  </div>
                )}
                {erro && (
                  <p className="text-red-300 text-sm mb-4">{erro}</p>
                )}
                <Button
                  onClick={iniciar}
                  disabled={carregando || validandoConvite || !!conviteErro}
                  className="bg-emerald-400 hover:bg-emerald-300 text-[#173b22] font-bold text-base px-8 py-4 h-auto rounded-xl transition-all"
                >
                  {carregando ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  {carregando ? "Carregando..." : "Iniciar Diagnóstico"}
                  {!carregando && <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>
                <p className="text-white/50 text-xs mt-4">
                  Não é uma auditoria, certificação ou declaração jurídica de conformidade.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ── Indisponível ──────────────────────────────────────────────────────────
  if (etapa === "indisponivel") {
    return (
      <div className="min-h-screen bg-[#f7f7f2] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <ClipboardCheck className="w-12 h-12 text-[#173b22]/30 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-semibold text-[#173b22] mb-3">
            Diagnóstico em atualização
          </h2>
          <p className="text-[#4a5f50] mb-6">
            Estamos preparando um novo formulário de diagnóstico. Em breve o serviço estará disponível novamente.
          </p>
          <Link
            href="/#contato"
            className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-400 transition-colors"
          >
            Falar com nossa equipe
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ── Resultado ─────────────────────────────────────────────────────────────
  if (etapa === "resultado" && resultado) {
    const cfg = classificacaoConfig[resultado.classificacao];
    return (
      <div className="min-h-screen bg-[#f7f7f2]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 pt-24 sm:pt-28 lg:pt-32">
          {/* Badge e score */}
          <div className="bg-white rounded-2xl border border-[#dfe7d8] shadow-[0_4px_24px_rgba(23,59,34,0.08)] p-8 sm:p-10 mb-6 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#173b22] mb-4">
              Diagnóstico concluído!
            </h2>
            <div
              className={`inline-block ${cfg.bg} ${cfg.text} border ${cfg.border} text-sm font-semibold px-4 py-1.5 rounded-full mb-6`}
            >
              {resultado.classificacao}
            </div>
            <div className="text-6xl sm:text-7xl font-bold text-[#173b22] mb-2">
              {resultado.percentual.toFixed(1)}%
            </div>
            {/* Barra de progresso */}
            <div className="w-full bg-[#f7f7f2] rounded-full h-4 overflow-hidden">
              <div
                className={`h-4 rounded-full transition-all duration-700 ${cfg.bar}`}
                style={{ width: `${resultado.percentual}%` }}
              />
            </div>
            <p className="text-[#4a5f50] text-xs mt-3">
              Um relatório detalhado foi enviado para{" "}
              <strong>{email}</strong>
            </p>
          </div>

          {/* Grid de categorias */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {resultado.categorias.map((cat) => {
              const barCor = getBarColor(cat.percentual);
              return (
                <div
                  key={cat.nome}
                  className="bg-white rounded-2xl border border-[#dfe7d8] p-5"
                >
                  <p className="text-sm font-semibold text-[#173b22] mb-2 leading-snug">
                    {cat.nome}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-[#f7f7f2] rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${barCor}`}
                        style={{ width: `${cat.percentual}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-[#173b22] w-12 text-right">
                      {cat.percentual.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="bg-[#173b22] rounded-2xl p-8 text-center">
            <h3 className="font-serif text-xl font-semibold text-white mb-2">
              Quer aprofundar este diagnóstico?
            </h3>
            <p className="text-white/75 text-sm mb-6">
              Nossa equipe pode elaborar um plano de ação personalizado para
              as áreas com maior vulnerabilidade regulatória.
            </p>
            <Link
              href="/#contato"
              className="inline-flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-[#173b22] font-bold px-8 py-3 rounded-xl transition-colors"
            >
              Falar com um especialista
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Layout compartilhado para etapas de formulário ───────────────────────
  return (
    <div className="min-h-screen bg-[#f7f7f2]">
      {/* Barra de progresso (só nas perguntas) */}
      {etapa === "perguntas" && (
        <div className="fixed top-20 sm:top-24 lg:top-28 left-0 right-0 z-40 h-1 bg-[#dfe7d8]">
          <div
            className="h-1 bg-emerald-400 transition-all duration-500"
            style={{ width: `${progressoPerguntas}%` }}
          />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 pt-24 sm:pt-28 lg:pt-32">
        {/* ── Etapa: Dados Pessoais ─────────────────────────────────────── */}
        {etapa === "dados" && (
          <div>
            <div className="mb-8">
              <p className="text-emerald-600 text-sm font-semibold uppercase tracking-widest mb-2">
                Passo 1 de 3
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#173b22] mb-2">
                Seus dados de contato
              </h2>
              <p className="text-[#4a5f50] text-sm">
                Usaremos seu e-mail para enviar o relatório completo.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#dfe7d8] shadow-[0_4px_24px_rgba(23,59,34,0.06)] p-6 sm:p-8 space-y-5">
              <div>
                <Label htmlFor="nome" className="text-sm font-semibold text-[#173b22] mb-1.5 block">
                  Nome completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className="border-[#dfe7d8] focus-visible:ring-emerald-400/30 focus-visible:border-emerald-400"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-semibold text-[#173b22] mb-1.5 block">
                  E-mail <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailTouched) {
                      setEmailError(
                        validateEmail(e.target.value)
                          ? ""
                          : "Digite um e-mail válido (ex: nome@dominio.com)"
                      );
                    }
                  }}
                  onBlur={() => {
                    setEmailTouched(true);
                    setEmailError(
                      validateEmail(email)
                        ? ""
                        : "Digite um e-mail válido (ex: nome@dominio.com)"
                    );
                  }}
                  placeholder="seu@email.com"
                  className={`border-[#dfe7d8] focus-visible:ring-emerald-400/30 focus-visible:border-emerald-400 ${
                    emailTouched && emailError
                      ? "border-red-400 focus-visible:border-red-400"
                      : emailTouched && email && !emailError
                      ? "border-emerald-400"
                      : ""
                  }`}
                />
                {emailTouched && emailError && (
                  <p className="text-red-500 text-xs mt-1">{emailError}</p>
                )}
              </div>

              {erro && (
                <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {erro}
                </div>
              )}

              <Button
                onClick={() => {
                  if (!nome.trim()) { setErro("Informe seu nome."); return; }
                  if (!validateEmail(email)) {
                    setEmailTouched(true);
                    setEmailError("Digite um e-mail válido.");
                    return;
                  }
                  setErro(null);
                  setEtapa("identificacao");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full bg-[#173b22] hover:bg-[#0f2a18] text-white font-semibold py-3 h-auto rounded-xl"
                disabled={!nome || !email}
              >
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Etapa: Identificação da Empresa ──────────────────────────────── */}
        {etapa === "identificacao" && (
          <div>
            <div className="mb-8">
              <p className="text-emerald-600 text-sm font-semibold uppercase tracking-widest mb-2">
                Passo 2 de 3
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#173b22] mb-2">
                Identificação da empresa
              </h2>
              <p className="text-[#4a5f50] text-sm">
                Estas informações contextualizam seu diagnóstico.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#dfe7d8] shadow-[0_4px_24px_rgba(23,59,34,0.06)] p-6 sm:p-8 space-y-5">
              {/* Razão social */}
              <div>
                <Label htmlFor="razao" className="text-sm font-semibold text-[#173b22] mb-1.5 block">
                  Razão social e nome fantasia <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="razao"
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  placeholder="Nome da empresa"
                  className="border-[#dfe7d8] focus-visible:ring-emerald-400/30 focus-visible:border-emerald-400"
                />
              </div>

              {/* CNPJ */}
              <div>
                <Label htmlFor="cnpj" className="text-sm font-semibold text-[#173b22] mb-1.5 block">
                  CNPJ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cnpj"
                  value={cnpj}
                  onChange={(e) => {
                    const formatted = formatCnpj(e.target.value);
                    setCnpj(formatted);
                    if (cnpjTouched) {
                      setCnpjError(
                        formatted.replace(/\D/g, "").length === 14 && !validateCnpj(formatted)
                          ? "CNPJ inválido."
                          : ""
                      );
                    }
                  }}
                  onBlur={() => {
                    setCnpjTouched(true);
                    if (!cnpj.trim()) { setCnpjError(""); return; }
                    setCnpjError(validateCnpj(cnpj) ? "" : "CNPJ inválido.");
                  }}
                  placeholder="00.000.000/0000-00"
                  className={`border-[#dfe7d8] focus-visible:ring-emerald-400/30 focus-visible:border-emerald-400 ${
                    cnpjTouched && cnpjError
                      ? "border-red-400 focus-visible:border-red-400"
                      : cnpjTouched && cnpj && !cnpjError
                      ? "border-emerald-400"
                      : ""
                  }`}
                />
                {cnpjTouched && cnpjError && (
                  <p className="text-red-500 text-xs mt-1">{cnpjError}</p>
                )}
              </div>

              {/* Telefone */}
              <div>
                <Label htmlFor="telefone" className="text-sm font-semibold text-[#173b22] mb-1.5 block">
                  Telefone
                </Label>
                <Input
                  id="telefone"
                  value={telefone}
                  onChange={(e) => {
                    const formatted = formatTelefone(e.target.value);
                    setTelefone(formatted);
                    if (telefoneTouched && formatted) {
                      setTelefoneError(validateTelefone(formatted) ? "" : "Telefone inválido.");
                    } else {
                      setTelefoneError("");
                    }
                  }}
                  onBlur={() => {
                    setTelefoneTouched(true);
                    if (!telefone.trim()) { setTelefoneError(""); return; }
                    setTelefoneError(validateTelefone(telefone) ? "" : "Telefone inválido.");
                  }}
                  placeholder="(00) 00000-0000"
                  className={`border-[#dfe7d8] focus-visible:ring-emerald-400/30 focus-visible:border-emerald-400 ${
                    telefoneTouched && telefoneError
                      ? "border-red-400 focus-visible:border-red-400"
                      : telefoneTouched && telefone && !telefoneError
                      ? "border-emerald-400"
                      : ""
                  }`}
                />
                {telefoneTouched && telefoneError && (
                  <p className="text-red-500 text-xs mt-1">{telefoneError}</p>
                )}
              </div>

              {/* Campos de perfil dinâmicos */}
              {camposPerfil.map((campo) => {
                if (campo.tipo === "boolean") {
                  return (
                    <div key={campo.id}>
                      <Label className="text-sm font-semibold text-[#173b22] mb-2 block">
                        {campo.label}
                        {campo.obrigatorio && <span className="text-red-500"> *</span>}
                      </Label>
                      <div className="flex gap-3">
                        {([true, false] as const).map((v) => (
                          <button
                            key={String(v)}
                            type="button"
                            onClick={() => setDadosPerfil((d) => ({ ...d, [campo.id]: v }))}
                            className={`px-6 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                              dadosPerfil[campo.id] === v
                                ? "bg-[#173b22] text-white border-[#173b22]"
                                : "bg-white text-[#4a5f50] border-[#dfe7d8] hover:border-[#173b22]/30"
                            }`}
                          >
                            {v ? "SIM" : "NÃO"}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (campo.tipo === "select" && campo.opcoes) {
                  return (
                    <div key={campo.id}>
                      <Label className="text-sm font-semibold text-[#173b22] mb-2 block">
                        {campo.label}
                        {campo.obrigatorio && <span className="text-red-500"> *</span>}
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {campo.opcoes.map((op) => (
                          <button
                            key={op}
                            type="button"
                            onClick={() => setDadosPerfil((d) => ({ ...d, [campo.id]: op }))}
                            className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all text-left ${
                              dadosPerfil[campo.id] === op
                                ? "bg-[#173b22] text-white border-[#173b22]"
                                : "bg-white text-[#4a5f50] border-[#dfe7d8] hover:border-[#173b22]/30"
                            }`}
                          >
                            {op}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={campo.id}>
                    <Label className="text-sm font-semibold text-[#173b22] mb-1.5 block">
                      {campo.label}
                      {campo.obrigatorio && <span className="text-red-500"> *</span>}
                    </Label>
                    <Input
                      type={campo.tipo === "number" ? "number" : "text"}
                      value={String(dadosPerfil[campo.id] ?? "")}
                      onChange={(e) => setDadosPerfil((d) => ({ ...d, [campo.id]: e.target.value }))}
                      className="border-[#dfe7d8] focus-visible:ring-emerald-400/30 focus-visible:border-emerald-400"
                    />
                  </div>
                );
              })}

              {erro && (
                <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {erro}
                </div>
              )}

              {travaAtiva && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <p>
                    Identificamos que este e-mail ou CNPJ já realizou o diagnóstico anteriormente.{" "}
                    <Link href="/#contato" className="font-semibold underline underline-offset-2">
                      Entre em contato
                    </Link>{" "}
                    para solicitar uma nova avaliação.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => { setTravaAtiva(false); setEtapa("dados"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="flex-1 border-[#dfe7d8] text-[#4a5f50] hover:bg-[#f7f7f2] py-3 h-auto rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
                <Button
                  disabled={verificandoTrava}
                  onClick={async () => {
                    if (!razaoSocial.trim() || !cnpj.trim()) {
                      setErro("Razão social e CNPJ são obrigatórios.");
                      return;
                    }
                    if (!validateCnpj(cnpj)) {
                      setCnpjTouched(true);
                      setCnpjError("CNPJ inválido.");
                      setErro("Verifique os campos antes de continuar.");
                      return;
                    }
                    for (const campo of camposPerfil.filter((c) => c.obrigatorio)) {
                      const val = dadosPerfil[campo.id];
                      const vazio = campo.tipo === "boolean"
                        ? val === undefined
                        : !String(val ?? "").trim();
                      if (vazio) {
                        setErro(`O campo "${campo.label}" é obrigatório.`);
                        return;
                      }
                    }
                    setErro(null);
                    setTravaAtiva(false);
                    setVerificandoTrava(true);
                    try {
                      const params = new URLSearchParams({
                        formulario_id: String(formulario?.id ?? ""),
                        email,
                        cnpj,
                      });
                      const res = await fetch(`/api/diagnostico/verificar?${params}`);
                      const data = await res.json();
                      if (data.bloqueado) {
                        setTravaAtiva(true);
                        return;
                      }
                    } catch {
                      // falha silenciosa — deixa prosseguir
                    } finally {
                      setVerificandoTrava(false);
                    }
                    setStepIndex(0);
                    setEtapa("perguntas");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="flex-1 bg-[#173b22] hover:bg-[#0f2a18] text-white font-semibold py-3 h-auto rounded-xl disabled:opacity-70"
                >
                  {verificandoTrava ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      Iniciar Questionário
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Etapa: Perguntas ─────────────────────────────────────────────── */}
        {etapa === "perguntas" && categoriaAtual && (
          <div>
            {/* Header da categoria */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <p className="text-emerald-600 text-sm font-semibold uppercase tracking-widest">
                  Passo 3 de 3 — Categoria {stepIndex + 1} de {totalSteps}
                </p>
                <span className="text-sm text-[#4a5f50]">
                  {Math.round(progressoPerguntas)}%
                </span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#173b22] mb-1">
                {categoriaAtual.nome}
              </h2>
              {categoriaAtual.descricao && (
                <p className="text-[#4a5f50] text-sm">{categoriaAtual.descricao}</p>
              )}
            </div>

            {/* Perguntas */}
            <div className="space-y-5">
              {categoriaAtual.perguntas.map((pergunta, qi) => {
                const destaque = perguntaDestaque === pergunta.id;
                return (
                  <div
                    key={pergunta.id}
                    id={`q-${pergunta.id}`}
                    className={`bg-white rounded-2xl border shadow-[0_4px_24px_rgba(23,59,34,0.06)] p-5 sm:p-6 transition-all duration-300 ${
                      destaque ? "border-red-400 ring-2 ring-red-300/50" : "border-[#dfe7d8]"
                    }`}
                  >
                    <p className="text-sm sm:text-base font-semibold text-[#173b22] mb-4 leading-snug">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-400/20 text-emerald-700 text-xs font-bold mr-2 shrink-0">
                        {qi + 1}
                      </span>
                      {pergunta.texto}
                    </p>
                    <div className="space-y-2">
                      {pergunta.alternativas.map((alt) => {
                        const selecionada = respostas[pergunta.id] === alt.id;
                        return (
                          <button
                            key={alt.id}
                            type="button"
                            onClick={() => selecionarResposta(pergunta.id, alt.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                              selecionada
                                ? "bg-[#173b22] text-white border-[#173b22]"
                                : "bg-[#f7f7f2] text-[#4a5f50] border-[#dfe7d8] hover:border-[#173b22]/30 hover:bg-[#f0f4ee]"
                            }`}
                          >
                            {alt.texto}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {stepIndex === totalSteps - 1 && (
              <div id="captcha-section" className="pt-2 flex justify-center">
                <HCaptcha
                  ref={captchaRef}
                  sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                  onVerify={setCaptchaToken}
                  onExpire={() => setCaptchaToken(null)}
                  theme="light"
                />
              </div>
            )}

            {erro && (
              <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 rounded-lg p-3 mt-4">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {erro}
              </div>
            )}

            {/* Navegação */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  if (stepIndex > 0) {
                    setStepIndex((s) => s - 1);
                  } else {
                    setEtapa("identificacao");
                  }
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex-1 border-[#dfe7d8] text-[#4a5f50] hover:bg-[#f7f7f2] py-3 h-auto rounded-xl"
                disabled={enviando}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
              <Button
                onClick={avancarPerguntas}
                disabled={enviando}
                className="flex-1 bg-[#173b22] hover:bg-[#0f2a18] text-white font-semibold py-3 h-auto rounded-xl disabled:opacity-40"
              >
                {enviando ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {enviando
                  ? "Enviando..."
                  : stepIndex < totalSteps - 1
                  ? "Próxima categoria"
                  : "Ver resultado"}
                {!enviando && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
            <p className="text-center text-xs text-[#4a5f50] mt-3">
              {todasRespondidas() && stepIndex === totalSteps - 1 && !captchaToken
                ? "Complete a verificação de segurança para enviar."
                : !todasRespondidas()
                ? "Responda todas as perguntas para avançar."
                : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
