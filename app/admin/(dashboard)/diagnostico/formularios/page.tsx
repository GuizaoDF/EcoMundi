"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardCheck,
  Plus,
  Trash2,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
  Pencil,
} from "lucide-react";

interface Formulario {
  id: number;
  nome: string;
  descricao: string | null;
  ativo: number;
  total_resultados: number;
  criado_em: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

export default function AdminFormulariosPage() {
  const router = useRouter();
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [criando, setCriando] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [ativando, setAtivando] = useState<number | null>(null);
  const [excluindo, setExcluindo] = useState<number | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<number | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  function toast(message: string, type: "success" | "error" = "success") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }

  async function carregar() {
    try {
      const res = await fetch("/api/admin/diagnostico/formularios");
      const data = await res.json();
      if (data.success) setFormularios(data.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function ativar(id: number) {
    setAtivando(id);
    try {
      const res = await fetch(`/api/admin/diagnostico/formularios/${id}/ativar`, { method: "PUT" });
      if (res.ok) {
        toast("Formulário ativado com sucesso.");
        carregar();
      } else {
        toast("Erro ao ativar formulário.", "error");
      }
    } finally {
      setAtivando(null);
    }
  }

  async function criar() {
    if (!novoNome.trim()) return;
    setSalvando(true);
    try {
      const res = await fetch("/api/admin/diagnostico/formularios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: novoNome.trim(), descricao: novaDescricao.trim() || null }),
      });
      const data = await res.json();
      if (data.success) {
        toast("Formulário criado com sucesso.");
        setNovoNome("");
        setNovaDescricao("");
        setCriando(false);
        carregar();
      } else {
        toast(data.message || "Erro ao criar formulário.", "error");
      }
    } finally {
      setSalvando(false);
    }
  }

  function iniciarEdicao(f: Formulario) {
    setEditandoId(f.id);
    setEditNome(f.nome);
    setEditDescricao(f.descricao ?? "");
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setEditNome("");
    setEditDescricao("");
  }

  async function salvarEdicao(id: number) {
    if (!editNome.trim()) return;
    setSalvandoEdicao(true);
    try {
      const res = await fetch(`/api/admin/diagnostico/formularios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: editNome.trim(), descricao: editDescricao.trim() || null }),
      });
      const data = await res.json();
      if (data.success) {
        toast("Formulário atualizado com sucesso.");
        cancelarEdicao();
        carregar();
      } else {
        toast(data.message || "Erro ao atualizar formulário.", "error");
      }
    } finally {
      setSalvandoEdicao(false);
    }
  }

  async function excluir(id: number) {
    setExcluindo(id);
    try {
      const res = await fetch(`/api/admin/diagnostico/formularios/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast("Formulário excluído.");
        setConfirmandoExclusao(null);
        carregar();
      } else {
        toast(data.message || "Erro ao excluir formulário.", "error");
        setConfirmandoExclusao(null);
      }
    } finally {
      setExcluindo(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Apenas um formulário pode estar ativo por vez. O formulário ativo é exibido no site público.
        </p>
        <button
          onClick={() => setCriando((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-[#0f3d2e] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Plus size={16} />
          Novo Formulário
        </button>
      </div>

      {/* Inline form para novo formulário */}
      {criando && (
        <div className="mb-6 rounded-2xl border border-[#E6DED0] bg-white p-6">
          <h3 className="mb-4 font-semibold text-[#0f3d2e]">Novo Formulário</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Nome *</label>
              <input
                type="text"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Ex: Diagnóstico Hotelaria 2026"
                className="h-11 w-full rounded-xl border border-[#E6DED0] px-4 text-sm outline-none transition focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Descrição</label>
              <textarea
                value={novaDescricao}
                onChange={(e) => setNovaDescricao(e.target.value)}
                placeholder="Descreva o objetivo deste formulário..."
                rows={3}
                className="w-full rounded-xl border border-[#E6DED0] px-4 py-3 text-sm outline-none transition focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={criar}
                disabled={salvando || !novoNome.trim()}
                className="flex items-center gap-2 rounded-xl bg-[#0f3d2e] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {salvando && <Loader2 size={15} className="animate-spin" />}
                Criar
              </button>
              <button
                onClick={() => { setCriando(false); setNovoNome(""); setNovaDescricao(""); }}
                className="rounded-xl border border-[#E6DED0] px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-gray-400">Carregando formulários...</div>
      ) : formularios.length === 0 ? (
        <div className="rounded-2xl border border-[#E6DED0] bg-white py-16 text-center">
          <ClipboardCheck size={32} className="mx-auto mb-4 text-gray-300" />
          <p className="font-semibold text-gray-500">Nenhum formulário cadastrado</p>
          <p className="mt-1 text-sm text-gray-400">Clique em "Novo Formulário" para começar.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {formularios.map((f) => (
            <div
              key={f.id}
              className={`overflow-hidden rounded-2xl border bg-white transition ${
                f.ativo
                  ? "border-[#0f3d2e] shadow-[0_0_0_1px_#0f3d2e10]"
                  : "border-[#E6DED0]"
              }`}
            >
              {f.ativo === 1 && (
                <div className="h-1 bg-[#0f3d2e]" />
              )}
              <div className="p-6">
                {editandoId === f.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-700">Nome *</label>
                      <input
                        type="text"
                        value={editNome}
                        onChange={(e) => setEditNome(e.target.value)}
                        className="h-11 w-full rounded-xl border border-[#E6DED0] px-4 text-sm outline-none transition focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-700">Descrição</label>
                      <textarea
                        value={editDescricao}
                        onChange={(e) => setEditDescricao(e.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-[#E6DED0] px-4 py-3 text-sm outline-none transition focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => salvarEdicao(f.id)}
                        disabled={salvandoEdicao || !editNome.trim()}
                        className="flex items-center gap-2 rounded-xl bg-[#0f3d2e] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                      >
                        {salvandoEdicao && <Loader2 size={15} className="animate-spin" />}
                        Salvar
                      </button>
                      <button
                        onClick={cancelarEdicao}
                        className="rounded-xl border border-[#E6DED0] px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-[#0f3d2e]">{f.nome}</h3>
                        {f.ativo ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                            Inativo
                          </span>
                        )}
                      </div>
                      {f.descricao && (
                        <p className="mt-1 text-sm text-gray-500">{f.descricao}</p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-400">
                        <span>{f.total_resultados} resultado{f.total_resultados !== 1 ? "s" : ""}</span>
                        <span>Criado em {new Date(f.criado_em).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {!f.ativo && (
                        <button
                          onClick={() => ativar(f.id)}
                          disabled={ativando === f.id}
                          className="flex items-center gap-2 rounded-xl border border-[#0f3d2e] px-4 py-2 text-sm font-semibold text-[#0f3d2e] transition hover:bg-[#0f3d2e]/5 disabled:opacity-50"
                        >
                          {ativando === f.id && <Loader2 size={14} className="animate-spin" />}
                          Ativar
                        </button>
                      )}

                      <button
                        onClick={() => router.push(`/admin/diagnostico/formularios/${f.id}/perguntas`)}
                        className="flex items-center gap-2 rounded-xl bg-[#0f3d2e] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                      >
                        Gerenciar Perguntas
                        <ChevronRight size={15} />
                      </button>

                      <button
                        onClick={() => iniciarEdicao(f)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E6DED0] text-gray-500 transition hover:bg-gray-50"
                        title="Editar nome e descrição"
                      >
                        <Pencil size={15} />
                      </button>

                      {f.total_resultados === 0 ? (
                        confirmandoExclusao === f.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => excluir(f.id)}
                              disabled={excluindo === f.id}
                              className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                            >
                              {excluindo === f.id && <Loader2 size={14} className="animate-spin" />}
                              Confirmar
                            </button>
                            <button
                              onClick={() => setConfirmandoExclusao(null)}
                              className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold transition hover:bg-gray-50"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmandoExclusao(f.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 text-red-500 transition hover:bg-red-50"
                            title="Excluir formulário"
                          >
                            <Trash2 size={16} />
                          </button>
                        )
                      ) : (
                        <button
                          disabled
                          title="Não é possível excluir um formulário com resultados"
                          className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-xl border border-gray-200 text-gray-300"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
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
