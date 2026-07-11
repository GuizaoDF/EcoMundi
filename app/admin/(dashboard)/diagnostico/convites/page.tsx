"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MailPlus,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  Search,
  X,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Formulario {
  id: number;
  nome: string;
  ativo: number;
}

interface Convite {
  id: number;
  email: string;
  nome_empresa: string | null;
  nome_contato: string | null;
  status: "pendente" | "concluido";
  criado_em: string;
  concluido_em: string | null;
  resultado_id: number | null;
  formulario_nome: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

const POR_PAGINA = 20;

export default function AdminConvitesPage() {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [convites, setConvites] = useState<Convite[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Novo convite
  const [criando, setCriando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [novoEmail, setNovoEmail] = useState("");
  const [novoNomeEmpresa, setNovoNomeEmpresa] = useState("");
  const [novoNomeContato, setNovoNomeContato] = useState("");
  const [novoFormularioId, setNovoFormularioId] = useState("");
  const [novaMensagem, setNovaMensagem] = useState("");

  // Ações
  const [excluindo, setExcluindo] = useState<number | null>(null);
  const [reenviando, setReenviando] = useState<number | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<number | null>(null);

  function toast(message: string, type: "success" | "error" = "success") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }

  async function carregarFormularios() {
    const res = await fetch("/api/admin/diagnostico/formularios");
    const data = await res.json();
    if (data.success) {
      setFormularios(data.data);
      const ativo = data.data.find((f: Formulario) => f.ativo);
      if (ativo && !novoFormularioId) setNovoFormularioId(String(ativo.id));
    }
  }

  async function carregar() {
    setLoading(true);
    const p = new URLSearchParams();
    if (busca) p.set("busca", busca);
    if (statusFiltro) p.set("status", statusFiltro);
    p.set("page", String(pagina));
    p.set("per_page", String(POR_PAGINA));
    const res = await fetch(`/api/admin/diagnostico/convites?${p}`);
    const data = await res.json();
    if (data.success) {
      setConvites(data.data);
      setTotal(data.total);
      setTotalPaginas(data.total_paginas);
    }
    setLoading(false);
  }

  useEffect(() => { carregarFormularios(); }, []);
  useEffect(() => { setPagina(1); }, [busca, statusFiltro]);
  useEffect(() => { carregar(); }, [busca, statusFiltro, pagina]);

  async function criarConvite() {
    if (!novoEmail || !novoFormularioId) return;
    setSalvando(true);
    try {
      const res = await fetch("/api/admin/diagnostico/convites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formulario_id: Number(novoFormularioId),
          email: novoEmail,
          nome_empresa: novoNomeEmpresa || null,
          nome_contato: novoNomeContato || null,
          mensagem: novaMensagem || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast("Convite enviado com sucesso!");
        setCriando(false);
        setNovoEmail("");
        setNovoNomeEmpresa("");
        setNovoNomeContato("");
        setNovaMensagem("");
        carregar();
      } else {
        toast(data.message || "Erro ao enviar convite.", "error");
      }
    } catch {
      toast("Erro ao enviar convite.", "error");
    } finally {
      setSalvando(false);
    }
  }

  async function reenviar(id: number) {
    setReenviando(id);
    try {
      const res = await fetch(`/api/admin/diagnostico/convites/${id}/reenviar`, { method: "POST" });
      const data = await res.json();
      if (data.success) toast("E-mail reenviado!");
      else toast(data.message || "Erro ao reenviar.", "error");
    } catch {
      toast("Erro ao reenviar.", "error");
    } finally {
      setReenviando(null);
    }
  }

  async function excluir(id: number) {
    setExcluindo(id);
    try {
      const res = await fetch(`/api/admin/diagnostico/convites/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast("Convite excluído.");
        setConfirmandoExclusao(null);
        carregar();
      } else {
        toast(data.message || "Erro ao excluir.", "error");
      }
    } catch {
      toast("Erro ao excluir.", "error");
    } finally {
      setExcluindo(null);
    }
  }

  return (
    <div>
      {/* Barra de ações */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por empresa, contato ou e-mail..."
              className="h-10 w-72 rounded-xl border border-[#E6DED0] pl-9 pr-4 text-sm outline-none focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10"
            />
          </div>
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="h-10 rounded-xl border border-[#E6DED0] bg-white px-3 text-sm outline-none focus:border-[#0f3d2e]"
          >
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="concluido">Concluído</option>
          </select>
        </div>
        <button
          onClick={() => setCriando(true)}
          className="flex items-center gap-2 rounded-xl bg-[#0f3d2e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0a2e22] transition"
        >
          <MailPlus size={16} />
          Novo Convite
        </button>
      </div>

      {/* Formulário de novo convite */}
      {criando && (
        <div className="mb-6 rounded-2xl border border-[#E6DED0] bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-[#0f3d2e]">Novo Convite</h3>
            <button onClick={() => setCriando(false)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#0f3d2e]">
                E-mail <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={novoEmail}
                onChange={(e) => setNovoEmail(e.target.value)}
                placeholder="email@empresa.com"
                className="h-10 w-full rounded-xl border border-[#E6DED0] px-3 text-sm outline-none focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#0f3d2e]">
                Formulário <span className="text-red-500">*</span>
              </label>
              <select
                value={novoFormularioId}
                onChange={(e) => setNovoFormularioId(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#E6DED0] bg-white px-3 text-sm outline-none focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10"
              >
                <option value="">Selecione...</option>
                {formularios.map((f) => (
                  <option key={f.id} value={String(f.id)}>
                    {f.nome}{f.ativo ? " (ativo)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#0f3d2e]">Empresa</label>
              <input
                type="text"
                value={novoNomeEmpresa}
                onChange={(e) => setNovoNomeEmpresa(e.target.value)}
                placeholder="Razão social ou nome fantasia"
                className="h-10 w-full rounded-xl border border-[#E6DED0] px-3 text-sm outline-none focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#0f3d2e]">Nome do Contato</label>
              <input
                type="text"
                value={novoNomeContato}
                onChange={(e) => setNovoNomeContato(e.target.value)}
                placeholder="Nome da pessoa que vai responder"
                className="h-10 w-full rounded-xl border border-[#E6DED0] px-3 text-sm outline-none focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-[#0f3d2e]">
                Mensagem personalizada <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                placeholder="Mensagem que aparecerá no e-mail de convite..."
                rows={3}
                className="w-full rounded-xl border border-[#E6DED0] px-3 py-2.5 text-sm outline-none focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10 resize-none"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={() => setCriando(false)}
              className="rounded-xl border border-[#E6DED0] px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              onClick={criarConvite}
              disabled={salvando || !novoEmail || !novoFormularioId}
              className="flex items-center gap-2 rounded-xl bg-[#0f3d2e] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0a2e22] disabled:opacity-50 transition"
            >
              {salvando ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              {salvando ? "Enviando..." : "Enviar Convite"}
            </button>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Carregando convites...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F7F5F0]">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-[#4a5f50] uppercase tracking-wider">Empresa / Contato</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-[#4a5f50] uppercase tracking-wider">E-mail</th>
                  <th className="hidden px-4 py-4 text-left text-xs font-semibold text-[#4a5f50] uppercase tracking-wider lg:table-cell">Formulário</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-[#4a5f50] uppercase tracking-wider">Status</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-[#4a5f50] uppercase tracking-wider">Data</th>
                  <th className="px-4 py-4 text-right text-xs font-semibold text-[#4a5f50] uppercase tracking-wider" />
                </tr>
              </thead>
              <tbody>
                {convites.map((c) => (
                  <tr key={c.id} className="border-t border-[#F0EBE3] transition hover:bg-[#faf8f3]">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">{c.nome_empresa || "—"}</p>
                      {c.nome_contato && (
                        <p className="text-xs text-gray-400 mt-0.5">{c.nome_contato}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-gray-600">{c.email}</td>
                    <td className="hidden px-4 py-4 text-gray-500 lg:table-cell">{c.formulario_nome}</td>
                    <td className="px-4 py-4">
                      {c.status === "concluido" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
                          <CheckCircle2 size={12} />
                          Concluído
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-800">
                          <Clock size={12} />
                          Pendente
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-gray-500">
                      {new Date(c.criado_em).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {c.status === "concluido" && c.resultado_id && (
                          <Link
                            href={`/admin/diagnostico/resultados/${c.resultado_id}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-[#0f3d2e]/10 hover:text-[#0f3d2e] transition"
                            title="Ver resultado"
                          >
                            <Eye size={15} />
                          </Link>
                        )}
                        {c.status === "pendente" && (
                          <button
                            onClick={() => reenviar(c.id)}
                            disabled={reenviando === c.id}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition disabled:opacity-40"
                            title="Reenviar e-mail"
                          >
                            {reenviando === c.id ? (
                              <RefreshCw size={14} className="animate-spin" />
                            ) : (
                              <Send size={14} />
                            )}
                          </button>
                        )}
                        {confirmandoExclusao === c.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => excluir(c.id)}
                              disabled={excluindo === c.id}
                              className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700 transition disabled:opacity-40"
                            >
                              {excluindo === c.id ? "..." : "Confirmar"}
                            </button>
                            <button
                              onClick={() => setConfirmandoExclusao(null)}
                              className="rounded-lg border border-[#E6DED0] px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmandoExclusao(c.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                            title="Excluir"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {convites.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                        <MailPlus size={28} className="text-gray-400" />
                      </div>
                      <p className="font-semibold text-gray-500">Nenhum convite encontrado</p>
                      <p className="mt-1 text-sm text-gray-400">Crie um novo convite para enviar o diagnóstico.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[#E6DED0] px-6 py-4">
          <span className="text-sm text-gray-500">{total} convite{total !== 1 ? "s" : ""}</span>
          {totalPaginas > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E6DED0] text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="text-sm text-gray-500">
                {pagina} / {totalPaginas}
              </span>
              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E6DED0] text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
              >
                <ChevronRight size={15} />
              </button>
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
            {t.type === "error" ? <X size={15} /> : <CheckCircle2 size={15} />}
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
