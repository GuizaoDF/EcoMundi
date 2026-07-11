"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Pencil,
  ChevronUp,
  ChevronDown,
  Save,
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  ClipboardCopy,
} from "lucide-react";

interface CampoPerfil {
  id: string;
  label: string;
  tipo: "text" | "number" | "boolean" | "select";
  obrigatorio: boolean;
  opcoes?: string[];
}

interface CampoExistente extends CampoPerfil {
  formulario_id: number;
  formulario_nome: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

const TIPO_LABELS: Record<CampoPerfil["tipo"], string> = {
  text: "Texto",
  number: "Número",
  boolean: "Sim / Não",
  select: "Seleção",
};

function slug(label: string) {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);
}

const CAMPO_VAZIO: Omit<CampoPerfil, "id"> = {
  label: "",
  tipo: "boolean",
  obrigatorio: true,
  opcoes: [],
};

export default function CamposPerfilPage() {
  const params = useParams();
  const formularioId = params.id as string;

  const [formularioNome, setFormularioNome] = useState("");
  const [campos, setCampos] = useState<CampoPerfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [adicionando, setAdicionando] = useState(false);
  const [editandoIdx, setEditandoIdx] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<CampoPerfil, "id">>(CAMPO_VAZIO);
  const [formId, setFormId] = useState<string | null>(null);
  const [novaOpcao, setNovaOpcao] = useState("");

  // Campos existentes de outros formulários
  const [camposExistentes, setCamposExistentes] = useState<CampoExistente[]>([]);
  const [mostrandoExistentes, setMostrandoExistentes] = useState(false);
  const [buscaExistente, setBuscaExistente] = useState("");

  const [toasts, setToasts] = useState<Toast[]>([]);

  function toast(message: string, type: "success" | "error" = "success") {
    const tid = Date.now();
    setToasts((prev) => [...prev, { id: tid, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== tid)), 3500);
  }

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/diagnostico/formularios/${formularioId}`).then((r) => r.json()),
      fetch(`/api/admin/diagnostico/formularios`).then((r) => r.json()),
    ]).then(([detalhe, lista]) => {
      if (detalhe.success) {
        setFormularioNome(detalhe.data.nome);
        setCampos(detalhe.data.campos_perfil ?? []);
      }
      if (lista.success) {
        const existentes: CampoExistente[] = [];
        for (const f of lista.data) {
          if (String(f.id) === formularioId) continue;
          for (const c of f.campos_perfil ?? []) {
            existentes.push({ ...c, formulario_id: f.id, formulario_nome: f.nome });
          }
        }
        setCamposExistentes(existentes);
      }
    }).finally(() => setLoading(false));
  }, [formularioId]);

  async function salvar(lista: CampoPerfil[]) {
    setSalvando(true);
    try {
      const res = await fetch(`/api/admin/diagnostico/formularios/${formularioId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campos_perfil: lista }),
      });
      const data = await res.json();
      if (data.success) {
        setCampos(lista);
        toast("Perfil da empresa salvo.");
      } else {
        toast(data.message || "Erro ao salvar.", "error");
      }
    } finally {
      setSalvando(false);
    }
  }

  function iniciarAdicao() {
    setEditandoIdx(null);
    setForm(CAMPO_VAZIO);
    setFormId(null);
    setNovaOpcao("");
    setMostrandoExistentes(false);
    setBuscaExistente("");
    setAdicionando(true);
  }

  function iniciarEdicao(idx: number) {
    setAdicionando(false);
    const c = campos[idx];
    setForm({ label: c.label, tipo: c.tipo, obrigatorio: c.obrigatorio, opcoes: c.opcoes ?? [] });
    setFormId(c.id);
    setNovaOpcao("");
    setMostrandoExistentes(false);
    setBuscaExistente("");
    setEditandoIdx(idx);
  }

  function cancelar() {
    setAdicionando(false);
    setEditandoIdx(null);
    setFormId(null);
    setNovaOpcao("");
    setMostrandoExistentes(false);
    setBuscaExistente("");
    setForm(CAMPO_VAZIO);
  }

  function carregarExistente(c: CampoExistente) {
    setForm({ label: c.label, tipo: c.tipo, obrigatorio: c.obrigatorio, opcoes: c.opcoes ?? [] });
    // Preserva o id original apenas para campos de outros formulários (reuso semântico).
    // Para campos do próprio formulário, gera novo id a partir do rótulo alterado.
    setFormId(String(c.formulario_id) === formularioId ? null : c.id);
    setMostrandoExistentes(false);
    setBuscaExistente("");
  }

  function confirmar() {
    if (!form.label.trim()) { toast("Informe o rótulo do campo.", "error"); return; }
    if (form.tipo === "select" && (!form.opcoes || form.opcoes.length < 2)) {
      toast("Adicione ao menos 2 opções para campos de seleção.", "error");
      return;
    }

    const novoId = editandoIdx !== null
      ? campos[editandoIdx].id
      : ((formId ?? slug(form.label)) || `campo_${Date.now()}`);

    if (editandoIdx === null && idsJaAdicionados.has(novoId)) {
      toast("Já existe um campo com esse rótulo. Altere o nome para criar um campo diferente.", "error");
      return;
    }

    const novoCampo: CampoPerfil = {
      id: novoId,
      label: form.label.trim(),
      tipo: form.tipo,
      obrigatorio: form.obrigatorio,
      ...(form.tipo === "select" ? { opcoes: form.opcoes } : {}),
    };

    let nova: CampoPerfil[];
    if (editandoIdx !== null) {
      nova = campos.map((c, i) => (i === editandoIdx ? novoCampo : c));
    } else {
      nova = [...campos, novoCampo];
    }

    salvar(nova);
    cancelar(); // also resets formId
  }

  function remover(idx: number) {
    salvar(campos.filter((_, i) => i !== idx));
  }

  function mover(idx: number, dir: -1 | 1) {
    const nova = [...campos];
    const alvo = idx + dir;
    if (alvo < 0 || alvo >= nova.length) return;
    [nova[idx], nova[alvo]] = [nova[alvo], nova[idx]];
    salvar(nova);
  }

  function adicionarOpcao() {
    const op = novaOpcao.trim();
    if (!op) return;
    setForm((f) => ({ ...f, opcoes: [...(f.opcoes ?? []), op] }));
    setNovaOpcao("");
  }

  function removerOpcao(i: number) {
    setForm((f) => ({ ...f, opcoes: (f.opcoes ?? []).filter((_, idx) => idx !== i) }));
  }

  const idsJaAdicionados = new Set(campos.map((c) => c.id));

  // Campos do formulário atual derivados do state (sempre atualizados)
  const camposDoFormularioAtual: CampoExistente[] = campos.map((c) => ({
    ...c,
    formulario_id: Number(formularioId),
    formulario_nome: `${formularioNome} (este formulário)`,
  }));

  // Lista completa para "Carregar existente": campos deste formulário (como template) + outros formulários
  const todosCamposParaCarregar = [...camposDoFormularioAtual, ...camposExistentes];

  const existentesFiltrados = todosCamposParaCarregar.filter((c) => {
    const isFromCurrentForm = String(c.formulario_id) === formularioId;
    // Campos de outros formulários: ocultar se o id já existe na lista atual (evita duplicata de id)
    if (!isFromCurrentForm && idsJaAdicionados.has(c.id)) return false;
    const q = buscaExistente.toLowerCase();
    return c.label.toLowerCase().includes(q) || c.formulario_nome.toLowerCase().includes(q);
  });

  if (loading) {
    return <div className="py-16 text-center text-gray-400">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Navegação */}
      <div className="flex items-center justify-between">
        <Link
          href={`/admin/diagnostico/formularios/${formularioId}/perguntas`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f3d2e] hover:underline"
        >
          <ArrowLeft size={15} />
          Perguntas do formulário
        </Link>
      </div>

      <div className="mb-2">
        <h2 className="text-lg font-bold text-[#0f3d2e]">{formularioNome}</h2>
        <p className="text-sm text-gray-500">
          Campos de identificação da empresa exibidos no Passo 2 do formulário.
        </p>
      </div>

      {/* Botão adicionar */}
      {!adicionando && editandoIdx === null && (
        <button
          onClick={iniciarAdicao}
          className="flex items-center gap-2 rounded-xl bg-[#0f3d2e] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Plus size={16} />
          Adicionar campo
        </button>
      )}

      {/* Formulário de adição/edição */}
      {(adicionando || editandoIdx !== null) && (
        <div className="rounded-2xl border border-[#E6DED0] bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#0f3d2e]">
              {editandoIdx !== null ? "Editar campo" : "Novo campo"}
            </h3>
            {/* Botão carregar existente — só aparece na adição e quando há campos em outros formulários */}
            {editandoIdx === null && todosCamposParaCarregar.length > 0 && (
              <button
                type="button"
                onClick={() => { setMostrandoExistentes((v) => !v); setBuscaExistente(""); }}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                  mostrandoExistentes
                    ? "border-[#0f3d2e] bg-[#0f3d2e] text-white"
                    : "border-[#E6DED0] text-gray-600 hover:border-[#0f3d2e] hover:text-[#0f3d2e]"
                }`}
              >
                <ClipboardCopy size={13} />
                Carregar existente
              </button>
            )}
          </div>

          {/* Painel de campos existentes */}
          {mostrandoExistentes && (
            <div className="rounded-xl border border-[#E6DED0] bg-gray-50 p-4 space-y-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={buscaExistente}
                  onChange={(e) => setBuscaExistente(e.target.value)}
                  placeholder="Buscar por rótulo ou formulário..."
                  className="h-9 w-full rounded-lg border border-[#E6DED0] bg-white pl-8 pr-4 text-sm outline-none transition focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10"
                />
              </div>
              {existentesFiltrados.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-2">Nenhum campo encontrado.</p>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-1.5">
                  {existentesFiltrados.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => carregarExistente(c)}
                      className="w-full rounded-lg border border-[#E6DED0] bg-white px-3 py-2.5 text-left transition hover:border-[#0f3d2e] hover:bg-[#0f3d2e]/5 group"
                    >
                      <p className="text-sm font-semibold text-[#0f3d2e] leading-snug group-hover:text-[#0f3d2e]">
                        {c.label}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                          {TIPO_LABELS[c.tipo]}
                        </span>
                        {c.obrigatorio && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-600">
                            Obrigatório
                          </span>
                        )}
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          {c.formulario_nome}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Rótulo *</label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="Ex: Possui piscina?"
              className="h-11 w-full rounded-xl border border-[#E6DED0] px-4 text-sm outline-none transition focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as CampoPerfil["tipo"], opcoes: [] }))}
                className="h-11 w-full rounded-xl border border-[#E6DED0] px-4 text-sm outline-none transition focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10"
              >
                {(Object.keys(TIPO_LABELS) as CampoPerfil["tipo"][]).map((t) => (
                  <option key={t} value={t}>{TIPO_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.obrigatorio}
                  onChange={(e) => setForm((f) => ({ ...f, obrigatorio: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-[#0f3d2e] accent-[#0f3d2e]"
                />
                <span className="text-sm font-semibold text-gray-700">Obrigatório</span>
              </label>
            </div>
          </div>

          {/* Opções para tipo select */}
          {form.tipo === "select" && (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Opções <span className="font-normal text-gray-400">(mínimo 2)</span>
              </label>
              <div className="space-y-2 mb-3">
                {(form.opcoes ?? []).map((op, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="flex-1 rounded-lg border border-[#E6DED0] bg-gray-50 px-3 py-2 text-sm text-gray-700">
                      {op}
                    </span>
                    <button
                      type="button"
                      onClick={() => removerOpcao(i)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={novaOpcao}
                  onChange={(e) => setNovaOpcao(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); adicionarOpcao(); } }}
                  placeholder="Nova opção..."
                  className="h-10 flex-1 rounded-xl border border-[#E6DED0] px-4 text-sm outline-none transition focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10"
                />
                <button
                  type="button"
                  onClick={adicionarOpcao}
                  className="flex items-center gap-2 rounded-xl border border-[#0f3d2e] px-4 py-2 text-sm font-semibold text-[#0f3d2e] transition hover:bg-[#0f3d2e]/5"
                >
                  <Plus size={14} />
                  Adicionar
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={confirmar}
              disabled={salvando}
              className="flex items-center gap-2 rounded-xl bg-[#0f3d2e] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {salvando ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Salvar
            </button>
            <button
              onClick={cancelar}
              className="rounded-xl border border-[#E6DED0] px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de campos */}
      {campos.length === 0 ? (
        <div className="rounded-2xl border border-[#E6DED0] bg-white py-14 text-center">
          <p className="font-semibold text-gray-500">Nenhum campo de identificação configurado</p>
          <p className="mt-1 text-sm text-gray-400">
            Sem campos configurados, o Passo 2 exibe apenas razão social, CNPJ e telefone.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {campos.map((campo, idx) => (
            <div
              key={campo.id}
              className="flex items-start gap-3 rounded-2xl border border-[#E6DED0] bg-white p-4"
            >
              {/* Reordenar */}
              <div className="flex flex-col gap-1 pt-0.5">
                <button
                  onClick={() => mover(idx, -1)}
                  disabled={idx === 0 || salvando}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E6DED0] text-gray-400 transition hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => mover(idx, 1)}
                  disabled={idx === campos.length - 1 || salvando}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E6DED0] text-gray-400 transition hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#0f3d2e] text-sm leading-snug">{campo.label}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    {TIPO_LABELS[campo.tipo]}
                  </span>
                  {campo.obrigatorio && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                      Obrigatório
                    </span>
                  )}
                  {campo.tipo === "select" && campo.opcoes && (
                    <span className="text-xs text-gray-400">
                      {campo.opcoes.join(" · ")}
                    </span>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => iniciarEdicao(idx)}
                  disabled={adicionando || editandoIdx !== null}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E6DED0] text-gray-500 transition hover:bg-gray-50 disabled:opacity-40"
                  title="Editar campo"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => remover(idx)}
                  disabled={salvando}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50 disabled:opacity-40"
                  title="Remover campo"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
