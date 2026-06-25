"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Newspaper,
  Globe,
  FileText,
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  CheckSquare,
  Minus,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Card from "@/components/admin/Card";

interface Noticia {
  id: number;
  titulo: string;
  slug: string;
  resumo: string | null;
  has_imagem: number;
  publicado: number;
  criado_em: string;
  atualizado_em: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

type SortKey = "titulo" | "publicado" | "criado_em";
type SortDir = "asc" | "desc";

const POR_PAGINA = 20;

export default function AdminNoticiasPage() {
  const router = useRouter();

  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "publicadas" | "rascunhos">("todos");

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set());
  const [confirmandoExclusaoLote, setConfirmandoExclusaoLote] = useState(false);
  const [confirmandoExclusaoId, setConfirmandoExclusaoId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("criado_em");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    carregarNoticias();
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

  async function carregarNoticias() {
    try {
      const response = await fetch("/api/admin/noticias");
      const data = await response.json();
      if (data.success) setNoticias(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function alternarPublicado(id: number, publicadoAtual: number) {
    const novoPublicado = publicadoAtual ? 0 : 1;
    const res = await fetch(`/api/admin/noticias/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicado: novoPublicado }),
    });
    const data = await res.json();
    if (data.success) {
      setNoticias((lista) =>
        lista.map((n) => (n.id === id ? { ...n, publicado: novoPublicado } : n))
      );
      toast(novoPublicado ? "Notícia publicada." : "Notícia movida para rascunho.");
    } else {
      toast(data.message || "Erro ao atualizar.", "error");
    }
  }

  async function excluirNoticia(id: number) {
    const res = await fetch(`/api/admin/noticias/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setNoticias((lista) => lista.filter((n) => n.id !== id));
      setConfirmandoExclusaoId(null);
      toast("Notícia excluída.");
    } else {
      toast(data.message || "Erro ao excluir.", "error");
    }
  }

  async function publicarLote(publicado: number) {
    const ids = Array.from(selecionados);
    await Promise.all(
      ids.map((id) =>
        fetch(`/api/admin/noticias/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicado }),
        })
      )
    );
    setNoticias((lista) =>
      lista.map((n) => (selecionados.has(n.id) ? { ...n, publicado } : n))
    );
    toast(
      publicado
        ? `${ids.length} notícia(s) publicada(s).`
        : `${ids.length} notícia(s) movida(s) para rascunho.`
    );
    setSelecionados(new Set());
  }

  async function excluirLote() {
    const ids = Array.from(selecionados);
    await Promise.all(
      ids.map((id) => fetch(`/api/admin/noticias/${id}`, { method: "DELETE" }))
    );
    setNoticias((lista) => lista.filter((n) => !selecionados.has(n.id)));
    toast(`${ids.length} notícia(s) excluída(s).`);
    setSelecionados(new Set());
    setConfirmandoExclusaoLote(false);
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
    const idsNaPagina = noticiasPagina.map((n) => n.id);
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

  const totalNoticias = noticias.length;
  const totalPublicadas = noticias.filter((n) => n.publicado).length;
  const totalRascunhos = noticias.filter((n) => !n.publicado).length;

  const noticiasFiltradas = useMemo(() => {
    const textoBusca = busca.toLowerCase().trim();

    const filtered = noticias.filter((n) => {
      const correspondeBusca =
        !textoBusca || n.titulo.toLowerCase().includes(textoBusca);

      const correspondeStatus =
        filtroStatus === "todos" ||
        (filtroStatus === "publicadas" && n.publicado) ||
        (filtroStatus === "rascunhos" && !n.publicado);

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
  }, [noticias, busca, filtroStatus, sortKey, sortDir]);

  const totalFiltradas = noticiasFiltradas.length;
  const totalPaginas = Math.ceil(totalFiltradas / POR_PAGINA);
  const noticiasPagina = noticiasFiltradas.slice(
    (pagina - 1) * POR_PAGINA,
    pagina * POR_PAGINA
  );

  const idsNaPagina = noticiasPagina.map((n) => n.id);
  const todosSelecionados =
    idsNaPagina.length > 0 && idsNaPagina.every((id) => selecionados.has(id));
  const algunsSelecionados =
    idsNaPagina.some((id) => selecionados.has(id)) && !todosSelecionados;

  const statusTabs = [
    { value: "todos", label: "Todas", count: totalNoticias },
    { value: "publicadas", label: "Publicadas", count: totalPublicadas },
    { value: "rascunhos", label: "Rascunhos", count: totalRascunhos },
  ] as const;

  return (
    <div>
      {/* Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card
          title="Total de notícias"
          value={totalNoticias}
          icon={<Newspaper size={24} />}
        />
        <Card
          title="Publicadas"
          value={totalPublicadas}
          icon={<Globe size={24} />}
          color="#15803d"
        />
        <Card
          title="Rascunhos"
          value={totalRascunhos}
          icon={<FileText size={24} />}
          color="#d97706"
        />
      </div>

      {/* Card principal */}
      <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">

        {/* Cabeçalho */}
        <div className="flex flex-col gap-4 border-b border-[#E6DED0] p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar por título..."
                className="h-11 w-72 rounded-xl border border-[#E6DED0] pl-10 pr-4 text-sm outline-none transition focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10"
              />
            </div>

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
                        ? tab.value === "publicadas"
                          ? "bg-green-100 text-green-700"
                          : tab.value === "rascunhos"
                          ? "bg-amber-100 text-amber-700"
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

          <button
            onClick={() => router.push("/admin/noticias/nova")}
            className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[#0f3d2e] px-5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Plus size={16} />
            Nova notícia
          </button>
        </div>

        {/* Barra de ações em lote */}
        {selecionados.size > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-[#E6DED0] bg-[#0f3d2e]/5 px-6 py-3">
            <span className="text-sm font-semibold text-[#0f3d2e]">
              {selecionados.size} selecionada{selecionados.size !== 1 ? "s" : ""}
            </span>

            <div className="ml-1 flex flex-wrap gap-2">
              <button
                onClick={() => publicarLote(1)}
                className="flex items-center gap-1.5 rounded-lg border border-green-300 bg-white px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50 transition"
              >
                <Globe size={13} /> Publicar
              </button>
              <button
                onClick={() => publicarLote(0)}
                className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition"
              >
                <FileText size={13} /> Mover para rascunho
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
          <div className="p-12 text-center text-gray-400">Carregando notícias...</div>
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
                    onClick={() => toggleSort("titulo")}
                    className="cursor-pointer select-none px-4 py-4 text-left font-semibold hover:bg-[#ebe7e0] transition"
                  >
                    <div className="flex items-center gap-1.5">
                      Título {getSortIcon("titulo")}
                    </div>
                  </th>

                  <th
                    onClick={() => toggleSort("publicado")}
                    className="cursor-pointer select-none px-4 py-4 text-center font-semibold hover:bg-[#ebe7e0] transition"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      Status {getSortIcon("publicado")}
                    </div>
                  </th>

                  <th
                    onClick={() => toggleSort("criado_em")}
                    className="cursor-pointer select-none px-4 py-4 text-left font-semibold hover:bg-[#ebe7e0] transition"
                  >
                    <div className="flex items-center gap-1.5">
                      Criada em {getSortIcon("criado_em")}
                    </div>
                  </th>

                  <th className="px-4 py-4 text-right font-semibold" />
                </tr>
              </thead>

              <tbody>
                {noticiasPagina.map((noticia) => (
                  <tr
                    key={noticia.id}
                    className={`border-t border-[#F0EBE3] transition hover:bg-[#faf8f3] ${
                      selecionados.has(noticia.id) ? "bg-[#f0f7f4]" : ""
                    }`}
                  >
                    <td
                      className="w-12 px-5 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => toggleSelecionado(noticia.id)}
                        className="flex items-center justify-center text-[#0f3d2e]"
                      >
                        {selecionados.has(noticia.id) ? (
                          <CheckSquare size={17} />
                        ) : (
                          <div className="h-[17px] w-[17px] rounded border-2 border-gray-300" />
                        )}
                      </button>
                    </td>

                    {/* Título + resumo */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-16 shrink-0 items-center justify-center rounded-lg ${
                            noticia.has_imagem
                              ? "bg-[#0f3d2e]/20"
                              : "bg-[#0f3d2e]/10"
                          }`}
                        >
                          <Newspaper
                            size={18}
                            className={noticia.has_imagem ? "text-[#0f3d2e]/60" : "text-[#0f3d2e]/30"}
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{noticia.titulo}</p>
                          {noticia.resumo && (
                            <p className="mt-0.5 line-clamp-1 max-w-sm text-xs text-gray-400">
                              {noticia.resumo}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status (clicável) */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => alternarPublicado(noticia.id, noticia.publicado)}
                        title={noticia.publicado ? "Clique para mover para rascunho" : "Clique para publicar"}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition hover:opacity-75"
                        style={
                          noticia.publicado
                            ? { background: "#dcfce7", color: "#15803d" }
                            : { background: "#fef3c7", color: "#92400e" }
                        }
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            background: noticia.publicado ? "#16a34a" : "#d97706",
                          }}
                        />
                        {noticia.publicado ? "Publicada" : "Rascunho"}
                      </button>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-gray-500">
                      {new Date(noticia.criado_em).toLocaleDateString("pt-BR")}
                    </td>

                    {/* Ações */}
                    <td className="px-4 py-4 text-right">
                      {confirmandoExclusaoId === noticia.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => excluirNoticia(noticia.id)}
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
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() =>
                              router.push(`/admin/noticias/${noticia.id}/editar`)
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-[#0f3d2e]/10 hover:text-[#0f3d2e]"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setConfirmandoExclusaoId(noticia.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {noticiasPagina.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                        <Newspaper size={28} className="text-gray-400" />
                      </div>
                      <p className="font-semibold text-gray-500">
                        Nenhuma notícia encontrada
                      </p>
                      <p className="mt-1 text-sm text-gray-400">
                        {busca || filtroStatus !== "todos"
                          ? "Tente ajustar os filtros ou a busca."
                          : "Clique em \"Nova notícia\" para começar."}
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
            {totalFiltradas === totalNoticias
              ? `${totalNoticias} notícia${totalNoticias !== 1 ? "s" : ""}`
              : `${totalFiltradas} de ${totalNoticias} notícias`}
            {selecionados.size > 0 && (
              <span className="ml-3 font-semibold text-[#0f3d2e]">
                · {selecionados.size} selecionada{selecionados.size !== 1 ? "s" : ""}
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
