"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Send,
  UserCheck,
  UserX,
  Trash2,
  Search,
  Download,
  Plus,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  CheckSquare,
  Minus,
  CheckCircle2,
  XCircle,
  X,
  TrendingUp,
  TrendingDown,
} from "lucide-react";


interface Subscriber {
  id: number;
  email: string;
  ativo: number;
  criado_em: string;
}

const AVATAR_COLORS: Record<string, string> = {
  a: "#0f3d2e", b: "#1d4ed8", c: "#7c3aed", d: "#b45309", e: "#0369a1",
  f: "#15803d", g: "#9f1239", h: "#0f3d2e", i: "#6d28d9", j: "#b45309",
  k: "#1d4ed8", l: "#15803d", m: "#7c3aed", n: "#0369a1", o: "#b45309",
  p: "#0f3d2e", q: "#9f1239", r: "#1d4ed8", s: "#7c3aed", t: "#15803d",
  u: "#0369a1", v: "#b45309", w: "#0f3d2e", x: "#6d28d9", y: "#15803d", z: "#1d4ed8",
};

function avatarColor(email: string): string {
  const ch = email[0].toLowerCase();
  return AVATAR_COLORS[ch] ?? "#0f3d2e";
}

function tempoRelativo(data: string): string {
  const diff = Date.now() - new Date(data).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min}min atrás`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d atrás`;
  return new Date(data).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" });
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

type SortKey = "email" | "ativo" | "criado_em";
type SortDir = "asc" | "desc";

const POR_PAGINA = 20;

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "ativos" | "inativos">("todos");

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set());
  const [confirmandoExclusaoLote, setConfirmandoExclusaoLote] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("criado_em");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [pagina, setPagina] = useState(1);

  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [novoEmail, setNovoEmail] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [confirmandoExclusaoId, setConfirmandoExclusaoId] = useState<number | null>(null);

  useEffect(() => {
    carregarSubscribers();
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [busca, filtroStatus]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setModalNovoAberto(false);
        setConfirmandoExclusaoId(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function toast(message: string, type: "success" | "error" = "success") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPagina(1);
  }

  function getSortIcon(col: SortKey) {
    if (sortKey !== col)
      return <ChevronsUpDown size={13} className="shrink-0 opacity-30" />;
    return sortDir === "asc" ? (
      <ChevronUp size={13} className="shrink-0" />
    ) : (
      <ChevronDown size={13} className="shrink-0" />
    );
  }

  async function carregarSubscribers() {
    try {
      const response = await fetch("/api/admin/newsletter");
      const data = await response.json();
      if (data.success) setSubscribers(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function alternarAtivo(id: number, ativoAtual: number) {
    const novoAtivo = ativoAtual ? 0 : 1;
    await fetch(`/api/admin/newsletter/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: novoAtivo }),
    });
    setSubscribers((lista) =>
      lista.map((s) => (s.id === id ? { ...s, ativo: novoAtivo } : s))
    );
    toast(novoAtivo ? "Inscrito ativado." : "Inscrito desativado.");
  }

  async function excluirSubscriber(id: number) {
    await fetch(`/api/admin/newsletter/${id}`, { method: "DELETE" });
    setSubscribers((lista) => lista.filter((s) => s.id !== id));
    setConfirmandoExclusaoId(null);
    toast("Inscrito removido.");
  }

  async function alternarAtivoLote(ativo: number) {
    const ids = Array.from(selecionados);
    await Promise.all(
      ids.map((id) =>
        fetch(`/api/admin/newsletter/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ativo }),
        })
      )
    );
    setSubscribers((lista) =>
      lista.map((s) => (selecionados.has(s.id) ? { ...s, ativo } : s))
    );
    toast(
      ativo
        ? `${ids.length} inscrito(s) ativado(s).`
        : `${ids.length} inscrito(s) desativado(s).`
    );
    setSelecionados(new Set());
  }

  async function excluirLote() {
    const ids = Array.from(selecionados);
    await Promise.all(
      ids.map((id) => fetch(`/api/admin/newsletter/${id}`, { method: "DELETE" }))
    );
    setSubscribers((lista) => lista.filter((s) => !selecionados.has(s.id)));
    toast(`${ids.length} inscrito(s) removido(s).`);
    setSelecionados(new Set());
    setConfirmandoExclusaoLote(false);
  }

  async function adicionarSubscriber(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      const response = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: novoEmail.trim() }),
      });
      const data = await response.json();

      if (data.success) {
        await carregarSubscribers();
        setNovoEmail("");
        setModalNovoAberto(false);
        toast("Inscrito adicionado com sucesso.");
      } else {
        toast(data.message || "Erro ao adicionar inscrito.", "error");
      }
    } catch {
      toast("Erro ao adicionar inscrito.", "error");
    } finally {
      setSalvando(false);
    }
  }

  function exportarCSV() {
    const linhas = [
      ["E-mail", "Status", "Data de inscrição"],
      ...subscribersFiltrados.map((s) => [
        s.email,
        s.ativo ? "Ativo" : "Inativo",
        new Date(s.criado_em).toLocaleDateString("pt-BR"),
      ]),
    ];
    const csv = linhas.map((l) => l.join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("CSV exportado com sucesso.");
  }

  function toggleSelecionado(id: number) {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleTodos() {
    const idsNaPagina = subscribersPagina.map((s) => s.id);
    const todosSel = idsNaPagina.every((id) => selecionados.has(id));
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (todosSel) {
        idsNaPagina.forEach((id) => next.delete(id));
      } else {
        idsNaPagina.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  const totalSubscribers = subscribers.length;
  const totalAtivos = subscribers.filter((s) => s.ativo).length;
  const totalInativos = subscribers.filter((s) => !s.ativo).length;
  const taxaAtivacao = totalSubscribers > 0 ? Math.round((totalAtivos / totalSubscribers) * 100) : 0;

  const agora = new Date();
  const inicioMesAtual = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const inicioMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
  const novosMesAtual = subscribers.filter((s) => new Date(s.criado_em) >= inicioMesAtual).length;
  const novosMesAnterior = subscribers.filter(
    (s) => new Date(s.criado_em) >= inicioMesAnterior && new Date(s.criado_em) < inicioMesAtual
  ).length;
  const crescimento = novosMesAnterior > 0
    ? Math.round(((novosMesAtual - novosMesAnterior) / novosMesAnterior) * 100)
    : novosMesAtual > 0 ? 100 : 0;

  const dadosMensais = useMemo(() => {
    const meses: { label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      const fim = new Date(agora.getFullYear(), agora.getMonth() - i + 1, 1);
      const count = subscribers.filter(
        (s) => new Date(s.criado_em) >= d && new Date(s.criado_em) < fim
      ).length;
      meses.push({
        label: d.toLocaleDateString("pt-BR", { month: "short" }),
        count,
      });
    }
    return meses;
  }, [subscribers]);

  const maxMensal = Math.max(...dadosMensais.map((m) => m.count), 1);

  const subscribersFiltrados = useMemo(() => {
    const textoBusca = busca.toLowerCase().trim();

    const filtered = subscribers.filter((s) => {
      const correspondeBusca =
        !textoBusca || s.email.toLowerCase().includes(textoBusca);

      const correspondeStatus =
        filtroStatus === "todos" ||
        (filtroStatus === "ativos" && s.ativo) ||
        (filtroStatus === "inativos" && !s.ativo);

      return correspondeBusca && correspondeStatus;
    });

    filtered.sort((a, b) => {
      let va: any = a[sortKey] ?? "";
      let vb: any = b[sortKey] ?? "";
      if (sortKey === "criado_em") {
        va = new Date(va).getTime();
        vb = new Date(vb).getTime();
      } else if (typeof va === "string") {
        va = va.toLowerCase();
        vb = vb.toLowerCase();
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [subscribers, busca, filtroStatus, sortKey, sortDir]);

  const totalFiltrados = subscribersFiltrados.length;
  const totalPaginas = Math.ceil(totalFiltrados / POR_PAGINA);
  const subscribersPagina = subscribersFiltrados.slice(
    (pagina - 1) * POR_PAGINA,
    pagina * POR_PAGINA
  );

  const idsNaPagina = subscribersPagina.map((s) => s.id);
  const todosSelecionados =
    idsNaPagina.length > 0 && idsNaPagina.every((id) => selecionados.has(id));
  const algunsSelecionados =
    idsNaPagina.some((id) => selecionados.has(id)) && !todosSelecionados;

  const statusTabs = [
    { value: "todos", label: "Todos", count: totalSubscribers },
    { value: "ativos", label: "Ativos", count: totalAtivos },
    { value: "inativos", label: "Inativos", count: totalInativos },
  ] as const;

  return (
    <div>
      {/* Cards de estatísticas */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total */}
        <div className="relative overflow-hidden rounded-2xl border border-[#E6DED0] bg-white p-6">
          <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-[#0f3d2e]" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Total de inscritos</p>
              <p className="mt-3 text-4xl font-bold text-[#0f3d2e]">{totalSubscribers}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f3d2e]/10 text-[#0f3d2e]">
              <Send size={20} />
            </div>
          </div>
        </div>

        {/* Ativos */}
        <div className="relative overflow-hidden rounded-2xl border border-[#E6DED0] bg-white p-6">
          <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-green-600" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Ativos</p>
              <p className="mt-3 text-4xl font-bold text-green-600">{totalAtivos}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{ width: `${taxaAtivacao}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{taxaAtivacao}% de ativação</span>
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <UserCheck size={20} />
            </div>
          </div>
        </div>

        {/* Inativos */}
        <div className="relative overflow-hidden rounded-2xl border border-[#E6DED0] bg-white p-6">
          <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gray-300" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Inativos</p>
              <p className="mt-3 text-4xl font-bold text-gray-400">{totalInativos}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
              <UserX size={20} />
            </div>
          </div>
        </div>

        {/* Novos este mês */}
        <div className="relative overflow-hidden rounded-2xl border border-[#E6DED0] bg-white p-6">
          <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-blue-600" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Novos este mês</p>
              <p className="mt-3 text-4xl font-bold text-blue-600">{novosMesAtual}</p>
              <div className="mt-1 flex items-center gap-1">
                {crescimento > 0 ? (
                  <>
                    <TrendingUp size={13} className="text-green-500" />
                    <span className="text-xs font-semibold text-green-600">+{crescimento}%</span>
                  </>
                ) : crescimento < 0 ? (
                  <>
                    <TrendingDown size={13} className="text-red-500" />
                    <span className="text-xs font-semibold text-red-600">{crescimento}%</span>
                  </>
                ) : (
                  <>
                    <Minus size={13} className="text-gray-400" />
                    <span className="text-xs text-gray-400">igual ao mês anterior</span>
                  </>
                )}
                <span className="text-xs text-gray-400">vs mês anterior</span>
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de crescimento */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
        <div className="border-b border-[#E6DED0] px-6 py-4">
          <p className="text-sm font-semibold text-[#0f3d2e]">Inscrições por mês</p>
          <p className="text-xs text-gray-400">Últimos 6 meses</p>
        </div>
        <div className="flex items-end gap-3 px-6 py-6" style={{ height: 140 }}>
          {dadosMensais.map((m, i) => {
            const pct = maxMensal > 0 ? (m.count / maxMensal) * 100 : 0;
            const isAtual = i === dadosMensais.length - 1;
            return (
              <div key={i} className="group flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 opacity-0 group-hover:opacity-100 transition">
                  {m.count}
                </span>
                <div className="relative w-full overflow-hidden rounded-t-lg bg-gray-100" style={{ height: 72 }}>
                  <div
                    className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-500 ${
                      isAtual ? "bg-[#0f3d2e]" : "bg-[#0f3d2e]/30 group-hover:bg-[#0f3d2e]/50"
                    }`}
                    style={{ height: `${Math.max(pct, m.count > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <span className="text-xs font-medium capitalize text-gray-400">{m.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card principal */}
      <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">

        {/* Cabeçalho com busca, filtros e botões */}
        <div className="flex flex-col gap-4 border-b border-[#E6DED0] p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Busca */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar por e-mail..."
                className="h-11 w-72 rounded-xl border border-[#E6DED0] pl-10 pr-4 text-sm outline-none transition focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10"
              />
            </div>

            {/* Tabs de status */}
            <div className="flex shrink-0 rounded-xl bg-[#F7F5F0] p-1">
              {statusTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFiltroStatus(tab.value)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    filtroStatus === tab.value
                      ? "bg-white text-[#0f3d2e] shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      filtroStatus === tab.value
                        ? tab.value === "ativos"
                          ? "bg-green-100 text-green-700"
                          : tab.value === "inativos"
                          ? "bg-gray-200 text-gray-600"
                          : "bg-[#0f3d2e]/10 text-[#0f3d2e]"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex shrink-0 gap-2">
            <button
              onClick={exportarCSV}
              className="flex h-11 items-center gap-2 rounded-xl border border-[#E6DED0] px-4 text-sm font-semibold text-[#102419] transition hover:bg-[#F7F5F0]"
            >
              <Download size={16} />
              Exportar CSV
            </button>
            <button
              onClick={() => setModalNovoAberto(true)}
              className="flex h-11 items-center gap-2 rounded-xl bg-[#0f3d2e] px-4 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <Plus size={16} />
              Novo inscrito
            </button>
          </div>
        </div>

        {/* Barra de ações em lote */}
        {selecionados.size > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-[#E6DED0] bg-[#0f3d2e]/5 px-6 py-3">
            <span className="text-sm font-semibold text-[#0f3d2e]">
              {selecionados.size} selecionado{selecionados.size !== 1 ? "s" : ""}
            </span>

            <div className="ml-1 flex flex-wrap gap-2">
              <button
                onClick={() => alternarAtivoLote(1)}
                className="flex items-center gap-1.5 rounded-lg border border-green-300 bg-white px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50 transition"
              >
                <UserCheck size={13} /> Ativar
              </button>
              <button
                onClick={() => alternarAtivoLote(0)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                <UserX size={13} /> Desativar
              </button>
              {!confirmandoExclusaoLote ? (
                <button
                  onClick={() => setConfirmandoExclusaoLote(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                >
                  <Trash2 size={13} /> Excluir
                </button>
              ) : (
                <>
                  <button
                    onClick={excluirLote}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
                  >
                    Confirmar exclusão
                  </button>
                  <button
                    onClick={() => setConfirmandoExclusaoLote(false)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => {
                setSelecionados(new Set());
                setConfirmandoExclusaoLote(false);
              }}
              className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition"
            >
              Limpar seleção
            </button>
          </div>
        )}

        {/* Tabela */}
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            Carregando inscritos...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F7F5F0] text-[#0f3d2e]">
                <tr>
                  <th className="w-12 px-5 py-4">
                    <button
                      onClick={toggleTodos}
                      className="flex items-center justify-center text-[#0f3d2e]"
                    >
                      {todosSelecionados ? (
                        <CheckSquare size={17} />
                      ) : algunsSelecionados ? (
                        <Minus size={17} className="opacity-60" />
                      ) : (
                        <div className="h-[17px] w-[17px] rounded border-2 border-gray-300" />
                      )}
                    </button>
                  </th>

                  <th
                    onClick={() => toggleSort("email")}
                    className="cursor-pointer select-none px-4 py-4 text-left font-semibold hover:bg-[#ebe7e0] transition"
                  >
                    <div className="flex items-center gap-1.5">
                      E-mail {getSortIcon("email")}
                    </div>
                  </th>

                  <th
                    onClick={() => toggleSort("ativo")}
                    className="cursor-pointer select-none px-4 py-4 text-center font-semibold hover:bg-[#ebe7e0] transition"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      Status {getSortIcon("ativo")}
                    </div>
                  </th>

                  <th
                    onClick={() => toggleSort("criado_em")}
                    className="cursor-pointer select-none px-4 py-4 text-left font-semibold hover:bg-[#ebe7e0] transition"
                  >
                    <div className="flex items-center gap-1.5">
                      Data de inscrição {getSortIcon("criado_em")}
                    </div>
                  </th>

                  <th className="px-4 py-4 text-right font-semibold" />
                </tr>
              </thead>

              <tbody>
                {subscribersPagina.map((subscriber) => (
                  <tr
                    key={subscriber.id}
                    className={`border-t border-[#F0EBE3] transition hover:bg-[#faf8f3] ${
                      selecionados.has(subscriber.id) ? "bg-[#f0f7f4]" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td
                      className="w-12 px-5 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => toggleSelecionado(subscriber.id)}
                        className="flex items-center justify-center text-[#0f3d2e]"
                      >
                        {selecionados.has(subscriber.id) ? (
                          <CheckSquare size={17} />
                        ) : (
                          <div className="h-[17px] w-[17px] rounded border-2 border-gray-300" />
                        )}
                      </button>
                    </td>

                    {/* E-mail com avatar */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                          style={{ backgroundColor: avatarColor(subscriber.email) }}
                        >
                          {subscriber.email[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">
                          {subscriber.email}
                        </span>
                      </div>
                    </td>

                    {/* Status (clicável para alternar) */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => alternarAtivo(subscriber.id, subscriber.ativo)}
                        title={subscriber.ativo ? "Clique para desativar" : "Clique para ativar"}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition hover:opacity-75"
                        style={
                          subscriber.ativo
                            ? { background: "#dcfce7", color: "#15803d" }
                            : { background: "#f3f4f6", color: "#6b7280" }
                        }
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            background: subscriber.ativo ? "#16a34a" : "#9ca3af",
                          }}
                        />
                        {subscriber.ativo ? "Ativo" : "Inativo"}
                      </button>
                    </td>

                    {/* Data */}
                    <td className="whitespace-nowrap px-4 py-4">
                      <p className="text-sm text-gray-700">
                        {new Date(subscriber.criado_em).toLocaleDateString("pt-BR")}
                      </p>
                      <p className="text-xs text-gray-400">{tempoRelativo(subscriber.criado_em)}</p>
                    </td>

                    {/* Ações */}
                    <td className="px-4 py-4 text-right">
                      {confirmandoExclusaoId === subscriber.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => excluirSubscriber(subscriber.id)}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => setConfirmandoExclusaoId(null)}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmandoExclusaoId(subscriber.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                          title="Remover inscrito"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {subscribersPagina.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                        <Send size={28} className="text-gray-400" />
                      </div>
                      <p className="font-semibold text-gray-500">
                        Nenhum inscrito encontrado
                      </p>
                      <p className="mt-1 text-sm text-gray-400">
                        Tente ajustar os filtros ou a busca.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Rodapé */}
        <div className="flex items-center justify-between border-t border-[#E6DED0] px-6 py-4">
          <span className="text-sm text-gray-500">
            {totalFiltrados === totalSubscribers
              ? `${totalSubscribers} inscrito${totalSubscribers !== 1 ? "s" : ""}`
              : `${totalFiltrados} de ${totalSubscribers} inscritos`}
            {selecionados.size > 0 && (
              <span className="ml-3 font-semibold text-[#0f3d2e]">
                · {selecionados.size} selecionado{selecionados.size !== 1 ? "s" : ""}
              </span>
            )}
          </span>

          {totalPaginas > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="rounded-lg border border-[#E6DED0] bg-white px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
              >
                Anterior
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPagina(p)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                    p === pagina
                      ? "border-[#0f3d2e] bg-[#0f3d2e] text-white"
                      : "border-[#E6DED0] bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                className="rounded-lg border border-[#E6DED0] bg-white px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
              >
                Próximo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal — Novo inscrito */}
      {modalNovoAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setModalNovoAberto(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E6DED0] px-6 py-5">
              <h2 className="text-lg font-bold text-[#0f3d2e]">Novo inscrito</h2>
              <button
                onClick={() => setModalNovoAberto(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={adicionarSubscriber} className="p-6">
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Endereço de e-mail
              </label>
              <input
                type="email"
                value={novoEmail}
                onChange={(e) => setNovoEmail(e.target.value)}
                placeholder="exemplo@email.com"
                required
                autoFocus
                className="h-11 w-full rounded-xl border border-[#E6DED0] px-4 text-sm outline-none transition focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10"
              />

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalNovoAberto(false)}
                  className="rounded-xl border border-[#E6DED0] px-5 py-2.5 text-sm font-semibold hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="rounded-xl bg-[#0f3d2e] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition"
                >
                  {salvando ? "Salvando..." : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${
              t.type === "error" ? "bg-red-600" : "bg-[#0f3d2e]"
            }`}
          >
            {t.type === "error" ? (
              <XCircle size={17} />
            ) : (
              <CheckCircle2 size={17} />
            )}
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
