"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Inbox,
  Mail,
  MailOpen,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  CheckSquare,
  Minus,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Card from "@/components/admin/Card";

interface Contato {
  id: number;
  nome: string;
  email: string;
  empresa: string | null;
  mensagem: string;
  lido: number;
  criado_em: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

type SortKey = "nome" | "empresa" | "email" | "criado_em" | "lido";
type SortDir = "asc" | "desc";

const POR_PAGINA = 20;

export default function AdminContatosPage() {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [contatoSelecionado, setContatoSelecionado] = useState<Contato | null>(null);
  const [loading, setLoading] = useState(true);
  const [abrindo, setAbrindo] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "novas" | "lidas">("todos");

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set());
  const [confirmandoExclusaoLote, setConfirmandoExclusaoLote] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("criado_em");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    carregarContatos();
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") fecharModal();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [busca, filtroStatus]);

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

  async function carregarContatos() {
    try {
      const response = await fetch("/api/admin/contatos");
      const data = await response.json();
      if (data.success) setContatos(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function visualizarContato(id: number) {
    try {
      setAbrindo(true);
      const response = await fetch(`/api/admin/contatos/${id}`);
      const data = await response.json();

      if (data.success) {
        setContatoSelecionado(data.data);
        setConfirmandoExclusao(false);

        if (!data.data.lido) {
          await fetch(`/api/admin/contatos/${id}`, { method: "PUT" });
          setContatos((lista) =>
            lista.map((c) => (c.id === id ? { ...c, lido: 1 } : c))
          );
          setContatoSelecionado({ ...data.data, lido: 1 });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAbrindo(false);
    }
  }

  async function alternarLido(id: number, lidoAtual: number) {
    const novoLido = lidoAtual ? 0 : 1;
    await fetch(`/api/admin/contatos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lido: novoLido }),
    });
    setContatos((lista) =>
      lista.map((c) => (c.id === id ? { ...c, lido: novoLido } : c))
    );
    setContatoSelecionado((prev) => (prev ? { ...prev, lido: novoLido } : null));
    toast(novoLido ? "Marcada como lida." : "Marcada como nova.");
  }

  async function excluirContato(id: number) {
    await fetch(`/api/admin/contatos/${id}`, { method: "DELETE" });
    setContatos((lista) => lista.filter((c) => c.id !== id));
    fecharModal();
    toast("Contato excluído com sucesso.");
  }

  async function marcarLoteLido(lido: number) {
    const ids = Array.from(selecionados);
    await Promise.all(
      ids.map((id) =>
        fetch(`/api/admin/contatos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lido }),
        })
      )
    );
    setContatos((lista) =>
      lista.map((c) => (selecionados.has(c.id) ? { ...c, lido } : c))
    );
    toast(
      lido
        ? `${ids.length} mensagem(ns) marcada(s) como lida(s).`
        : `${ids.length} mensagem(ns) marcada(s) como nova(s).`
    );
    setSelecionados(new Set());
  }

  async function excluirLote() {
    const ids = Array.from(selecionados);
    await Promise.all(
      ids.map((id) => fetch(`/api/admin/contatos/${id}`, { method: "DELETE" }))
    );
    setContatos((lista) => lista.filter((c) => !selecionados.has(c.id)));
    toast(`${ids.length} contato(s) excluído(s).`);
    setSelecionados(new Set());
    setConfirmandoExclusaoLote(false);
  }

  function fecharModal() {
    setContatoSelecionado(null);
    setConfirmandoExclusao(false);
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
    const idsNaPagina = contatosPagina.map((c) => c.id);
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

  const totalContatos = contatos.length;
  const totalNovas = contatos.filter((c) => !c.lido).length;
  const totalLidas = contatos.filter((c) => c.lido).length;

  const contatosFiltrados = useMemo(() => {
    const textoBusca = busca.toLowerCase().trim();

    const filtered = contatos.filter((c) => {
      const correspondeBusca =
        !textoBusca ||
        c.nome.toLowerCase().includes(textoBusca) ||
        c.email.toLowerCase().includes(textoBusca) ||
        (c.empresa || "").toLowerCase().includes(textoBusca);

      const correspondeStatus =
        filtroStatus === "todos" ||
        (filtroStatus === "novas" && !c.lido) ||
        (filtroStatus === "lidas" && c.lido);

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
  }, [contatos, busca, filtroStatus, sortKey, sortDir]);

  const totalFiltrados = contatosFiltrados.length;
  const totalPaginas = Math.ceil(totalFiltrados / POR_PAGINA);
  const contatosPagina = contatosFiltrados.slice(
    (pagina - 1) * POR_PAGINA,
    pagina * POR_PAGINA
  );

  const idsNaPagina = contatosPagina.map((c) => c.id);
  const todosSelecionados =
    idsNaPagina.length > 0 && idsNaPagina.every((id) => selecionados.has(id));
  const algunsSelecionados =
    idsNaPagina.some((id) => selecionados.has(id)) && !todosSelecionados;

  const statusTabs = [
    { value: "todos", label: "Todos", count: totalContatos },
    { value: "novas", label: "Novas", count: totalNovas },
    { value: "lidas", label: "Lidas", count: totalLidas },
  ] as const;

  return (
    <div>
      {/* Cards de estatísticas */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card
          title="Total de contatos"
          value={totalContatos}
          icon={<Inbox size={24} />}
        />
        <Card
          title="Novas mensagens"
          value={totalNovas}
          icon={<Mail size={24} />}
          color="#dc2626"
        />
        <Card
          title="Mensagens lidas"
          value={totalLidas}
          icon={<MailOpen size={24} />}
          color="#15803d"
        />
      </div>

      {/* Card principal */}
      <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">

        {/* Cabeçalho com busca e filtros */}
        <div className="flex flex-col gap-4 border-b border-[#E6DED0] p-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Busca */}
          <div className="relative max-w-md flex-1">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar por nome, e-mail ou empresa..."
              className="h-11 w-full rounded-xl border border-[#E6DED0] pl-10 pr-4 text-sm outline-none transition focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10"
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
                      ? tab.value === "novas"
                        ? "bg-red-100 text-red-600"
                        : tab.value === "lidas"
                        ? "bg-green-100 text-green-700"
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

        {/* Barra de ações em lote */}
        {selecionados.size > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-[#E6DED0] bg-[#0f3d2e]/5 px-6 py-3">
            <span className="text-sm font-semibold text-[#0f3d2e]">
              {selecionados.size} selecionado{selecionados.size !== 1 ? "s" : ""}
            </span>

            <div className="ml-1 flex flex-wrap gap-2">
              <button
                onClick={() => marcarLoteLido(1)}
                className="flex items-center gap-1.5 rounded-lg border border-green-300 bg-white px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50 transition"
              >
                <MailOpen size={13} /> Marcar como lidas
              </button>
              <button
                onClick={() => marcarLoteLido(0)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                <Mail size={13} /> Marcar como novas
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
            Carregando contatos...
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

                  {(
                    [
                      { col: "nome", label: "Nome" },
                      { col: "empresa", label: "Empresa" },
                      { col: "email", label: "E-mail" },
                    ] as { col: SortKey; label: string }[]
                  ).map(({ col, label }) => (
                    <th
                      key={col}
                      onClick={() => toggleSort(col)}
                      className="cursor-pointer select-none px-4 py-4 text-left font-semibold hover:bg-[#ebe7e0] transition"
                    >
                      <div className="flex items-center gap-1.5">
                        {label} {getSortIcon(col)}
                      </div>
                    </th>
                  ))}

                  <th className="hidden px-4 py-4 text-left font-semibold lg:table-cell">
                    Mensagem
                  </th>

                  <th
                    onClick={() => toggleSort("criado_em")}
                    className="cursor-pointer select-none px-4 py-4 text-left font-semibold hover:bg-[#ebe7e0] transition"
                  >
                    <div className="flex items-center gap-1.5">
                      Data {getSortIcon("criado_em")}
                    </div>
                  </th>

                  <th
                    onClick={() => toggleSort("lido")}
                    className="cursor-pointer select-none px-4 py-4 text-center font-semibold hover:bg-[#ebe7e0] transition"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      Status {getSortIcon("lido")}
                    </div>
                  </th>

                  <th className="px-4 py-4 text-right font-semibold" />
                </tr>
              </thead>

              <tbody>
                {contatosPagina.map((contato) => (
                  <tr
                    key={contato.id}
                    className={`border-t border-[#F0EBE3] transition hover:bg-[#faf8f3] ${
                      selecionados.has(contato.id) ? "bg-[#f0f7f4]" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td
                      className="w-12 px-5 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => toggleSelecionado(contato.id)}
                        className="flex items-center justify-center text-[#0f3d2e]"
                      >
                        {selecionados.has(contato.id) ? (
                          <CheckSquare size={17} />
                        ) : (
                          <div className="h-[17px] w-[17px] rounded border-2 border-gray-300" />
                        )}
                      </button>
                    </td>

                    {/* Nome com avatar e indicador */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0f3d2e]/10 text-sm font-bold text-[#0f3d2e]">
                          {contato.nome[0].toUpperCase()}
                        </div>
                        <div className="flex items-center gap-2">
                          {!contato.lido && (
                            <div className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                          )}
                          <span
                            className={
                              !contato.lido
                                ? "font-semibold text-gray-900"
                                : "text-gray-700"
                            }
                          >
                            {contato.nome}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-gray-500">
                      {contato.empresa || "—"}
                    </td>

                    <td className="px-4 py-4 text-gray-500">{contato.email}</td>

                    <td className="hidden px-4 py-4 text-gray-400 lg:table-cell">
                      <span className="line-clamp-1 max-w-xs">
                        {contato.mensagem}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-gray-500">
                      {new Date(contato.criado_em).toLocaleDateString("pt-BR")}
                    </td>

                    <td className="px-4 py-4 text-center">
                      {contato.lido ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Lida
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          Nova
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => visualizarContato(contato.id)}
                        disabled={abrindo}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-[#0f3d2e]/10 hover:text-[#0f3d2e] disabled:opacity-40"
                        title="Ver mensagem"
                      >
                        <Eye size={17} />
                      </button>
                    </td>
                  </tr>
                ))}

                {contatosPagina.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                        <Inbox size={28} className="text-gray-400" />
                      </div>
                      <p className="font-semibold text-gray-500">
                        Nenhum contato encontrado
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

        {/* Rodapé com contador e paginação */}
        <div className="flex items-center justify-between border-t border-[#E6DED0] px-6 py-4">
          <span className="text-sm text-gray-500">
            {totalFiltrados === totalContatos
              ? `${totalContatos} contato${totalContatos !== 1 ? "s" : ""}`
              : `${totalFiltrados} de ${totalContatos} contatos`}
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

      {/* Modal de visualização */}
      {contatoSelecionado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={fecharModal}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do modal */}
            <div className="flex items-start justify-between gap-4 border-b border-[#E6DED0] p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0f3d2e]/10 text-lg font-bold text-[#0f3d2e]">
                  {contatoSelecionado.nome[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#0f3d2e]">
                    {contatoSelecionado.nome}
                  </h2>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {new Date(contatoSelecionado.criado_em).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
              <button
                onClick={fecharModal}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 transition"
              >
                ✕
              </button>
            </div>

            {/* Dados de contato */}
            <div className="grid gap-4 bg-[#faf8f5] p-6 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Empresa
                </p>
                <p className="mt-1 font-semibold text-gray-800">
                  {contatoSelecionado.empresa || "Não informado"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  E-mail
                </p>
                <p className="mt-1 font-semibold text-gray-800">
                  {contatoSelecionado.email}
                </p>
              </div>
            </div>

            {/* Mensagem */}
            <div className="p-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Mensagem
              </p>
              <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl border border-[#E6DED0] p-4 text-sm leading-relaxed text-gray-700">
                {contatoSelecionado.mensagem}
              </div>
            </div>

            {/* Ações do modal */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E6DED0] px-6 py-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    alternarLido(contatoSelecionado.id, contatoSelecionado.lido)
                  }
                  className="flex items-center gap-2 rounded-xl border border-[#E6DED0] px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-[#f7f5f0] transition"
                >
                  {contatoSelecionado.lido ? (
                    <>
                      <Mail size={15} /> Marcar como nova
                    </>
                  ) : (
                    <>
                      <MailOpen size={15} /> Marcar como lida
                    </>
                  )}
                </button>

                {!confirmandoExclusao ? (
                  <button
                    onClick={() => setConfirmandoExclusao(true)}
                    className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 size={15} /> Excluir
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => excluirContato(contatoSelecionado.id)}
                      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
                    >
                      Confirmar exclusão
                    </button>
                    <button
                      onClick={() => setConfirmandoExclusao(false)}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              <a
                href={`mailto:${contatoSelecionado.email}`}
                className="rounded-xl bg-[#0f3d2e] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
              >
                Responder por e-mail
              </a>
            </div>
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
