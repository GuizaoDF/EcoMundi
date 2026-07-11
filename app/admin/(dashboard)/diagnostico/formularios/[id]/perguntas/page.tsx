"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Plus,
  Save,
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";

interface Categoria {
  id: number;
  nome: string;
  descricao: string | null;
  ordem: number;
  ativo: number;
}

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
  ativo: number;
  alternativas: Alternativa[];
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

const SCORE_LABELS = ["R1", "R2", "R3", "R4", "R5"];

export default function PerguntasFormularioPage() {
  const params = useParams();
  const formularioId = params.id as string;

  const [formularioNome, setFormularioNome] = useState("");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState<number | null>(null);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [expandida, setExpandida] = useState<number | null>(null);
  const [editandoCategoria, setEditandoCategoria] = useState<number | null>(null);
  const [editCatNome, setEditCatNome] = useState("");
  const [editCatDescricao, setEditCatDescricao] = useState("");
  const [criandoCategoria, setCriandoCategoria] = useState(false);
  const [novaCatNome, setNovaCatNome] = useState("");
  const [novaCatDescricao, setNovaCatDescricao] = useState("");
  const [editandoPergunta, setEditandoPergunta] = useState<number | null>(null);
  const [criandoPergunta, setCriandoPergunta] = useState(false);
  const [editPergTexto, setEditPergTexto] = useState("");
  const [editAlternativas, setEditAlternativas] = useState<{ id?: number; texto: string; pontuacao: number; ordem: number }[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [loadingPerguntas, setLoadingPerguntas] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  function toast(message: string, type: "success" | "error" = "success") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }

  async function carregarFormulario() {
    const res = await fetch(`/api/admin/diagnostico/formularios/${formularioId}`);
    const data = await res.json();
    if (data.success) setFormularioNome(data.data.nome);
  }

  async function carregarCategorias() {
    const res = await fetch(`/api/admin/diagnostico/categorias?formulario_id=${formularioId}`);
    const data = await res.json();
    if (data.success) {
      setCategorias(data.data);
      if (!categoriaAtiva && data.data.length > 0) {
        setCategoriaAtiva(data.data[0].id);
      }
    }
  }

  async function carregarPerguntas(catId: number) {
    setLoadingPerguntas(true);
    try {
      const res = await fetch(`/api/admin/diagnostico/perguntas?categoria_id=${catId}`);
      const data = await res.json();
      if (data.success) setPerguntas(data.data);
    } finally {
      setLoadingPerguntas(false);
    }
  }

  useEffect(() => {
    carregarFormulario();
    carregarCategorias();
  }, [formularioId]);

  useEffect(() => {
    if (categoriaAtiva) carregarPerguntas(categoriaAtiva);
  }, [categoriaAtiva]);

  function iniciarEdicaoCategoria(cat: Categoria) {
    setEditandoCategoria(cat.id);
    setEditCatNome(cat.nome);
    setEditCatDescricao(cat.descricao || "");
  }

  async function salvarCategoria(id: number) {
    setSalvando(true);
    try {
      const cat = categorias.find((c) => c.id === id);
      const res = await fetch(`/api/admin/diagnostico/categorias/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: editCatNome,
          descricao: editCatDescricao || null,
          ordem: cat?.ordem,
          ativo: cat?.ativo,
        }),
      });
      if (res.ok) {
        toast("Categoria atualizada.");
        setEditandoCategoria(null);
        carregarCategorias();
      } else {
        toast("Erro ao salvar categoria.", "error");
      }
    } finally {
      setSalvando(false);
    }
  }

  async function toggleAtivoCategoria(cat: Categoria) {
    await fetch(`/api/admin/diagnostico/categorias/${cat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: cat.nome, descricao: cat.descricao, ordem: cat.ordem, ativo: cat.ativo ? 0 : 1 }),
    });
    carregarCategorias();
  }

  async function reordenarCategoria(cat: Categoria, direcao: "up" | "down") {
    const idx = categorias.findIndex((c) => c.id === cat.id);
    const outro = direcao === "up" ? categorias[idx - 1] : categorias[idx + 1];
    if (!outro) return;

    await Promise.all([
      fetch(`/api/admin/diagnostico/categorias/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: cat.nome, descricao: cat.descricao, ordem: outro.ordem, ativo: cat.ativo }),
      }),
      fetch(`/api/admin/diagnostico/categorias/${outro.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: outro.nome, descricao: outro.descricao, ordem: cat.ordem, ativo: outro.ativo }),
      }),
    ]);
    carregarCategorias();
  }

  async function criarCategoria() {
    if (!novaCatNome.trim()) return;
    setSalvando(true);
    try {
      const ordem = categorias.length + 1;
      const res = await fetch("/api/admin/diagnostico/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formulario_id: Number(formularioId), nome: novaCatNome.trim(), descricao: novaCatDescricao.trim() || null, ordem }),
      });
      const data = await res.json();
      if (data.success) {
        toast("Categoria criada.");
        setNovaCatNome("");
        setNovaCatDescricao("");
        setCriandoCategoria(false);
        carregarCategorias();
      }
    } finally {
      setSalvando(false);
    }
  }

  function iniciarEdicaoPergunta(p: Pergunta) {
    setCriandoPergunta(false);
    setEditandoPergunta(p.id);
    setEditPergTexto(p.texto);
    const alts = [...p.alternativas].sort((a, b) => a.ordem - b.ordem);
    while (alts.length < 5) alts.push({ id: undefined as any, texto: "", pontuacao: alts.length, ordem: alts.length + 1 });
    setEditAlternativas(alts.map((a) => ({ id: a.id, texto: a.texto, pontuacao: a.pontuacao, ordem: a.ordem })));
    setExpandida(p.id);
  }

  function iniciarCriacaoPergunta() {
    setEditandoPergunta(null);
    setCriandoPergunta(true);
    setEditPergTexto("");
    setEditAlternativas([
      { texto: "", pontuacao: 0, ordem: 1 },
      { texto: "", pontuacao: 1, ordem: 2 },
      { texto: "", pontuacao: 2, ordem: 3 },
      { texto: "", pontuacao: 3, ordem: 4 },
      { texto: "", pontuacao: 4, ordem: 5 },
    ]);
  }

  async function salvarPergunta() {
    if (!editPergTexto.trim() || !categoriaAtiva) return;
    setSalvando(true);
    try {
      if (editandoPergunta) {
        const res = await fetch(`/api/admin/diagnostico/perguntas/${editandoPergunta}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            texto: editPergTexto,
            ordem: perguntas.find((p) => p.id === editandoPergunta)?.ordem,
            ativo: perguntas.find((p) => p.id === editandoPergunta)?.ativo,
            alternativas: editAlternativas,
          }),
        });
        if (res.ok) {
          toast("Pergunta atualizada.");
          setEditandoPergunta(null);
          carregarPerguntas(categoriaAtiva);
        } else {
          toast("Erro ao salvar pergunta.", "error");
        }
      } else {
        const res = await fetch("/api/admin/diagnostico/perguntas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoria_id: categoriaAtiva,
            texto: editPergTexto,
            ordem: perguntas.length + 1,
            alternativas: editAlternativas,
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast("Pergunta criada.");
          setCriandoPergunta(false);
          carregarPerguntas(categoriaAtiva);
        } else {
          toast("Erro ao criar pergunta.", "error");
        }
      }
    } finally {
      setSalvando(false);
    }
  }

  async function toggleAtivoPergunta(p: Pergunta) {
    await fetch(`/api/admin/diagnostico/perguntas/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: p.texto, ordem: p.ordem, ativo: p.ativo ? 0 : 1, alternativas: p.alternativas }),
    });
    if (categoriaAtiva) carregarPerguntas(categoriaAtiva);
  }

  async function excluirPergunta(id: number) {
    const res = await fetch(`/api/admin/diagnostico/perguntas/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      if (data.desativada) {
        toast("Pergunta desativada (possui respostas registradas).");
      } else {
        toast("Pergunta excluída.");
      }
      if (categoriaAtiva) carregarPerguntas(categoriaAtiva);
    } else {
      toast("Erro ao excluir pergunta.", "error");
    }
  }

  const catAtual = categorias.find((c) => c.id === categoriaAtiva);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/diagnostico/formularios"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f3d2e] hover:underline"
        >
          <ArrowLeft size={15} />
          Voltar aos Formulários
        </Link>
        <p className="mt-1 text-sm text-gray-500">{formularioNome}</p>
      </div>

      <div className="flex gap-6">
        {/* Painel esquerdo: categorias */}
        <div className="w-72 shrink-0">
          <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
            <div className="flex items-center justify-between border-b border-[#E6DED0] px-4 py-3">
              <h3 className="font-semibold text-[#0f3d2e]">Categorias</h3>
              <button
                onClick={() => setCriandoCategoria((v) => !v)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#0f3d2e] transition hover:bg-[#0f3d2e]/10"
                title="Nova categoria"
              >
                <Plus size={16} />
              </button>
            </div>

            {criandoCategoria && (
              <div className="border-b border-[#E6DED0] p-4 space-y-3">
                <input
                  type="text"
                  value={novaCatNome}
                  onChange={(e) => setNovaCatNome(e.target.value)}
                  placeholder="Nome da categoria"
                  className="h-9 w-full rounded-lg border border-[#E6DED0] px-3 text-sm outline-none focus:border-[#0f3d2e]"
                  autoFocus
                />
                <textarea
                  value={novaCatDescricao}
                  onChange={(e) => setNovaCatDescricao(e.target.value)}
                  placeholder="Descrição (opcional)"
                  rows={2}
                  className="w-full rounded-lg border border-[#E6DED0] px-3 py-2 text-sm outline-none focus:border-[#0f3d2e]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={criarCategoria}
                    disabled={salvando || !novaCatNome.trim()}
                    className="flex-1 rounded-lg bg-[#0f3d2e] py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Criar
                  </button>
                  <button
                    onClick={() => { setCriandoCategoria(false); setNovaCatNome(""); setNovaCatDescricao(""); }}
                    className="rounded-lg border border-[#E6DED0] px-3 py-1.5 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="max-h-[600px] overflow-y-auto">
              {categorias.map((cat, idx) => (
                <div
                  key={cat.id}
                  className={`border-b border-[#F0EBE3] last:border-b-0 ${
                    categoriaAtiva === cat.id ? "bg-[#f0f7f4]" : "hover:bg-[#faf8f3]"
                  }`}
                >
                  {editandoCategoria === cat.id ? (
                    <div className="p-3 space-y-2">
                      <input
                        type="text"
                        value={editCatNome}
                        onChange={(e) => setEditCatNome(e.target.value)}
                        className="h-8 w-full rounded-lg border border-[#E6DED0] px-2 text-sm outline-none focus:border-[#0f3d2e]"
                        autoFocus
                      />
                      <textarea
                        value={editCatDescricao}
                        onChange={(e) => setEditCatDescricao(e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-[#E6DED0] px-2 py-1 text-sm outline-none focus:border-[#0f3d2e]"
                      />
                      <div className="flex gap-1.5">
                        <button onClick={() => salvarCategoria(cat.id)} disabled={salvando} className="flex items-center gap-1 rounded-lg bg-[#0f3d2e] px-2 py-1 text-xs font-semibold text-white">
                          <Save size={11} /> Salvar
                        </button>
                        <button onClick={() => setEditandoCategoria(null)} className="rounded-lg border border-[#E6DED0] px-2 py-1 text-xs">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex cursor-pointer items-center gap-2 p-3"
                      onClick={() => setCategoriaAtiva(cat.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium leading-snug ${cat.ativo ? "text-gray-800" : "text-gray-400 line-through"}`}>
                          {cat.nome}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => reordenarCategoria(cat, "up")}
                          disabled={idx === 0}
                          className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-[#0f3d2e] disabled:opacity-20"
                        >
                          <ChevronUp size={13} />
                        </button>
                        <button
                          onClick={() => reordenarCategoria(cat, "down")}
                          disabled={idx === categorias.length - 1}
                          className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-[#0f3d2e] disabled:opacity-20"
                        >
                          <ChevronDown size={13} />
                        </button>
                        <button
                          onClick={() => toggleAtivoCategoria(cat)}
                          className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-[#0f3d2e]"
                          title={cat.ativo ? "Desativar" : "Ativar"}
                        >
                          {cat.ativo ? <Eye size={13} /> : <EyeOff size={13} />}
                        </button>
                        <button
                          onClick={() => iniciarEdicaoCategoria(cat)}
                          className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-[#0f3d2e]"
                        >
                          <Pencil size={13} />
                        </button>
                      </div>
                      {categoriaAtiva === cat.id && (
                        <ChevronRight size={14} className="shrink-0 text-[#0f3d2e]" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Painel direito: perguntas */}
        <div className="flex-1 min-w-0">
          {!catAtual ? (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-[#E6DED0] bg-white text-gray-400">
              Selecione uma categoria
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
              <div className="flex items-center justify-between border-b border-[#E6DED0] px-6 py-4">
                <div>
                  <h3 className="font-semibold text-[#0f3d2e]">{catAtual.nome}</h3>
                  {catAtual.descricao && <p className="mt-0.5 text-xs text-gray-500">{catAtual.descricao}</p>}
                </div>
                <button
                  onClick={iniciarCriacaoPergunta}
                  className="flex items-center gap-2 rounded-xl bg-[#0f3d2e] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  <Plus size={15} />
                  Nova Pergunta
                </button>
              </div>

              {loadingPerguntas ? (
                <div className="p-8 text-center text-gray-400">Carregando perguntas...</div>
              ) : (
                <div className="divide-y divide-[#F0EBE3]">
                  {/* Form para nova pergunta */}
                  {criandoPergunta && (
                    <div className="p-6 bg-[#faf8f3]">
                      <h4 className="mb-4 text-sm font-semibold text-[#0f3d2e]">Nova Pergunta</h4>
                      <EditPerguntaForm
                        texto={editPergTexto}
                        onTextoChange={setEditPergTexto}
                        alternativas={editAlternativas}
                        onAlternativasChange={setEditAlternativas}
                        onSalvar={salvarPergunta}
                        onCancelar={() => setCriandoPergunta(false)}
                        salvando={salvando}
                      />
                    </div>
                  )}

                  {perguntas.length === 0 && !criandoPergunta && (
                    <div className="py-12 text-center text-gray-400">
                      Nenhuma pergunta nesta categoria. Clique em "Nova Pergunta" para adicionar.
                    </div>
                  )}

                  {perguntas.map((p) => (
                    <div key={p.id} className={p.ativo ? "" : "opacity-60"}>
                      {/* Cabeçalho da pergunta */}
                      <div
                        className="flex cursor-pointer items-start gap-3 p-5 hover:bg-[#faf8f3] transition"
                        onClick={() => {
                          if (editandoPergunta === p.id) return;
                          setExpandida(expandida === p.id ? null : p.id);
                        }}
                      >
                        <span className="mt-0.5 shrink-0 rounded-full bg-[#0f3d2e]/10 px-2 py-0.5 text-xs font-bold text-[#0f3d2e]">
                          {p.ordem}
                        </span>
                        <p className={`flex-1 text-sm leading-snug ${p.ativo ? "text-gray-800" : "text-gray-400 line-through"}`}>
                          {p.texto}
                        </p>
                        <div className="flex shrink-0 items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleAtivoPergunta(p)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:text-[#0f3d2e] transition"
                            title={p.ativo ? "Desativar" : "Ativar"}
                          >
                            {p.ativo ? <Eye size={15} /> : <EyeOff size={15} />}
                          </button>
                          <button
                            onClick={() => iniciarEdicaoPergunta(p)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:text-[#0f3d2e] transition"
                            title="Editar"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => excluirPergunta(p.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:text-red-500 transition"
                            title="Excluir"
                          >
                            <Trash2 size={15} />
                          </button>
                          <ChevronDown
                            size={15}
                            className={`text-gray-400 transition-transform ${expandida === p.id ? "rotate-180" : ""}`}
                          />
                        </div>
                      </div>

                      {/* Conteúdo expandido */}
                      {expandida === p.id && (
                        <div className="border-t border-[#F0EBE3] bg-[#faf8f3] px-5 py-4">
                          {editandoPergunta === p.id ? (
                            <EditPerguntaForm
                              texto={editPergTexto}
                              onTextoChange={setEditPergTexto}
                              alternativas={editAlternativas}
                              onAlternativasChange={setEditAlternativas}
                              onSalvar={salvarPergunta}
                              onCancelar={() => setEditandoPergunta(null)}
                              salvando={salvando}
                            />
                          ) : (
                            <div className="space-y-2">
                              {[...p.alternativas].sort((a, b) => a.ordem - b.ordem).map((alt, i) => (
                                <div key={alt.id} className="flex items-start gap-3">
                                  <span className="mt-0.5 w-8 shrink-0 text-xs font-bold text-[#0f3d2e]">{SCORE_LABELS[i]}</span>
                                  <span className="text-sm text-gray-600">{alt.texto}</span>
                                  <span className="ml-auto shrink-0 rounded-full bg-[#0f3d2e]/10 px-2 py-0.5 text-xs font-semibold text-[#0f3d2e]">
                                    {alt.pontuacao} pts
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${
              t.type === "error" ? "bg-red-600" : "bg-[#0f3d2e]"
            }`}
          >
            {t.type === "error" ? <XCircle size={17} /> : <CheckCircle2 size={17} />}
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

function EditPerguntaForm({
  texto,
  onTextoChange,
  alternativas,
  onAlternativasChange,
  onSalvar,
  onCancelar,
  salvando,
}: {
  texto: string;
  onTextoChange: (v: string) => void;
  alternativas: { id?: number; texto: string; pontuacao: number; ordem: number }[];
  onAlternativasChange: (v: { id?: number; texto: string; pontuacao: number; ordem: number }[]) => void;
  onSalvar: () => void;
  onCancelar: () => void;
  salvando: boolean;
}) {
  const SCORE_LABELS = ["R1", "R2", "R3", "R4", "R5"];

  function updateAlt(i: number, field: "texto" | "pontuacao", value: string | number) {
    const next = alternativas.map((a, idx) =>
      idx === i ? { ...a, [field]: value } : a
    );
    onAlternativasChange(next);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-600">Texto da pergunta *</label>
        <textarea
          value={texto}
          onChange={(e) => onTextoChange(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-[#E6DED0] px-4 py-3 text-sm outline-none focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10"
          placeholder="Digite a pergunta..."
          autoFocus
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold text-gray-600">Alternativas (5 fixas)</label>
        <div className="space-y-2">
          {alternativas.slice(0, 5).map((alt, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-8 shrink-0 text-xs font-bold text-[#0f3d2e]">{SCORE_LABELS[i]}</span>
              <input
                type="text"
                value={alt.texto}
                onChange={(e) => updateAlt(i, "texto", e.target.value)}
                className="h-9 flex-1 rounded-lg border border-[#E6DED0] px-3 text-sm outline-none focus:border-[#0f3d2e]"
                placeholder={`Alternativa ${SCORE_LABELS[i]}...`}
              />
              <select
                value={alt.pontuacao}
                onChange={(e) => updateAlt(i, "pontuacao", Number(e.target.value))}
                className="h-9 w-20 rounded-lg border border-[#E6DED0] px-2 text-sm outline-none focus:border-[#0f3d2e]"
              >
                <option value={0}>0 pts</option>
                <option value={1}>1 pt</option>
                <option value={2}>2 pts</option>
                <option value={3}>3 pts</option>
                <option value={4}>4 pts</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onSalvar}
          disabled={salvando || !texto.trim()}
          className="flex items-center gap-2 rounded-xl bg-[#0f3d2e] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {salvando ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Salvar
        </button>
        <button
          onClick={onCancelar}
          className="flex items-center gap-2 rounded-xl border border-[#E6DED0] px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
        >
          <X size={15} />
          Cancelar
        </button>
      </div>
    </div>
  );
}
