"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  TrendingUp,
  Award,
  AlertTriangle,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Card from "@/components/admin/Card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  LineChart,
  Line,
} from "recharts";

interface Formulario {
  id: number;
  nome: string;
  ativo: number;
}

interface Stats {
  total: number;
  media_percentual: number;
  por_classificacao: { classificacao: string; total: number }[];
  media_por_categoria: { nome: string; media_percentual: number }[];
  resultados_por_mes: { mes: string; total: number }[];
}

interface Resultado {
  id: number;
  nome: string;
  email: string;
  razao_social: string | null;
  classificacao: string;
  percentual: number;
  pontuacao_total: number;
  pontuacao_maxima: number;
  formulario_nome: string;
  criado_em: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

const CLASSIFICACAO_CORES: Record<string, { bg: string; text: string; dot: string }> = {
  "Crítico":               { bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-500" },
  "Vulnerável":            { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
  "Em Desenvolvimento":    { bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-500" },
  "Conformidade Adequada": { bg: "bg-green-100",  text: "text-green-800",  dot: "bg-green-500" },
};

const PIE_COLORS: Record<string, string> = {
  "Crítico":               "#dc2626",
  "Vulnerável":            "#ea580c",
  "Em Desenvolvimento":    "#ca8a04",
  "Conformidade Adequada": "#15803d",
};

const POR_PAGINA = 20;

export default function AdminDiagnosticoPage() {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [formularioFiltro, setFormularioFiltro] = useState<string>("all");
  const [busca, setBusca] = useState("");
  const [classificacaoFiltro, setClassificacaoFiltro] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  function toast(message: string, type: "success" | "error" = "success") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }

  useEffect(() => {
    fetch("/api/admin/diagnostico/formularios")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setFormularios(data.data);
          const ativo = data.data.find((f: Formulario) => f.ativo);
          if (ativo) setFormularioFiltro(String(ativo.id));
        }
      });
  }, []);

  useEffect(() => {
    setLoadingStats(true);
    const params = formularioFiltro !== "all" ? `?formulario_id=${formularioFiltro}` : "";
    fetch(`/api/admin/diagnostico/stats${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setStats(data);
      })
      .finally(() => setLoadingStats(false));
  }, [formularioFiltro]);

  useEffect(() => {
    setPagina(1);
  }, [formularioFiltro, busca, classificacaoFiltro]);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (formularioFiltro !== "all") p.set("formulario_id", formularioFiltro);
    if (busca) p.set("busca", busca);
    if (classificacaoFiltro) p.set("classificacao", classificacaoFiltro);
    p.set("page", String(pagina));
    p.set("per_page", String(POR_PAGINA));

    fetch(`/api/admin/diagnostico/resultados?${p}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setResultados(data.data);
          setTotal(data.total);
          setTotalPaginas(data.total_paginas);
        }
      })
      .finally(() => setLoading(false));
  }, [formularioFiltro, busca, classificacaoFiltro, pagina]);

  const totalCriticos = stats?.por_classificacao.find((p) => p.classificacao === "Crítico")?.total ?? 0;
  const melhorCategoria = stats?.media_por_categoria.reduce(
    (best, cat) => (cat.media_percentual > best.media_percentual ? cat : best),
    { nome: "—", media_percentual: 0 }
  );

  return (
    <div>
      {/* Filtro de formulário */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <select
          value={formularioFiltro}
          onChange={(e) => setFormularioFiltro(e.target.value)}
          className="h-10 rounded-xl border border-[#E6DED0] bg-white px-3 text-sm font-semibold text-[#0f3d2e] outline-none focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10"
        >
          <option value="all">Todos os formulários</option>
          {formularios.map((f) => (
            <option key={f.id} value={String(f.id)}>
              {f.nome}{f.ativo ? " (ativo)" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Cards de estatísticas */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card
          title="Total de Diagnósticos"
          value={stats?.total ?? 0}
          icon={<ClipboardList size={24} />}
        />
        <Card
          title="Média Geral"
          value={stats ? `${stats.media_percentual.toFixed(1)}%` : "—"}
          icon={<TrendingUp size={24} />}
          color="#15803d"
        />
        <Card
          title="Melhor Categoria"
          value={melhorCategoria?.nome.split(" ")[0] ?? "—"}
          icon={<Award size={24} />}
          color="#ca8a04"
        />
        <Card
          title="Críticos"
          value={totalCriticos}
          icon={<AlertTriangle size={24} />}
          color="#dc2626"
        />
      </div>

      {/* Gráficos */}
      {!loadingStats && stats && (
        <div className="mb-6 grid gap-6 lg:grid-cols-3">
          {/* PieChart: distribuição por classificação */}
          <div className="bg-white rounded-2xl border border-[#dfe7d8] p-6">
            <h3 className="mb-4 text-sm font-semibold text-[#0f3d2e]">Distribuição por Classificação</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats.por_classificacao}
                  dataKey="total"
                  nameKey="classificacao"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {stats.por_classificacao.map((entry, index) => (
                    <Cell key={index} fill={PIE_COLORS[entry.classificacao] ?? "#6b7280"} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* BarChart: média por categoria */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#dfe7d8] p-6">
            <h3 className="mb-4 text-sm font-semibold text-[#0f3d2e]">Média por Categoria (%)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={stats.media_por_categoria}
                layout="vertical"
                margin={{ left: 0, right: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <YAxis dataKey="nome" type="category" width={220} tick={{ fontSize: 11 }} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                <Bar dataKey="media_percentual" fill="#0f3d2e" radius={[0, 4, 4, 0]}>
                  <LabelList
                    dataKey="media_percentual"
                    position="right"
                    formatter={(v: number) => `${v.toFixed(1)}%`}
                    style={{ fontSize: 11, fill: "#4a5f50" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!loadingStats && stats && (
        <div className="mb-6 bg-white rounded-2xl border border-[#dfe7d8] p-6">
          <h3 className="mb-4 text-sm font-semibold text-[#0f3d2e]">Diagnósticos por Mês</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.resultados_por_mes} margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#0f3d2e" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabela de resultados */}
      <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
        <div className="flex flex-col gap-4 border-b border-[#E6DED0] p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar por nome, email ou empresa..."
              className="h-11 w-full rounded-xl border border-[#E6DED0] pl-10 pr-4 text-sm outline-none transition focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10"
            />
          </div>
          <select
            value={classificacaoFiltro}
            onChange={(e) => setClassificacaoFiltro(e.target.value)}
            className="h-11 rounded-xl border border-[#E6DED0] px-3 text-sm outline-none focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10"
          >
            <option value="">Todas as classificações</option>
            <option value="Crítico">Crítico</option>
            <option value="Vulnerável">Vulnerável</option>
            <option value="Em Desenvolvimento">Em Desenvolvimento</option>
            <option value="Conformidade Adequada">Conformidade Adequada</option>
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">Carregando resultados...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F7F5F0]">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-[#4a5f50] uppercase tracking-wider">Nome</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-[#4a5f50] uppercase tracking-wider">Empresa</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-[#4a5f50] uppercase tracking-wider">Classificação</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-[#4a5f50] uppercase tracking-wider">%</th>
                  <th className="hidden px-4 py-4 text-left text-xs font-semibold text-[#4a5f50] uppercase tracking-wider lg:table-cell">Formulário</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-[#4a5f50] uppercase tracking-wider">Data</th>
                  <th className="px-4 py-4 text-right text-xs font-semibold text-[#4a5f50] uppercase tracking-wider" />
                </tr>
              </thead>
              <tbody>
                {resultados.map((r) => {
                  const cores = CLASSIFICACAO_CORES[r.classificacao] ?? CLASSIFICACAO_CORES["Crítico"];
                  return (
                    <tr key={r.id} className="border-t border-[#F0EBE3] transition hover:bg-[#faf8f3]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0f3d2e]/10 text-xs font-bold text-[#0f3d2e]">
                            {r.nome[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">{r.nome}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-500">{r.razao_social || "—"}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cores.bg} ${cores.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${cores.dot}`} />
                          {r.classificacao}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-semibold text-[#0f3d2e]">{parseFloat(String(r.percentual)).toFixed(1)}%</td>
                      <td className="hidden px-4 py-4 text-gray-500 lg:table-cell">{r.formulario_nome}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-gray-500">
                        {new Date(r.criado_em).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/admin/diagnostico/resultados/${r.id}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-[#0f3d2e]/10 hover:text-[#0f3d2e]"
                          title="Ver resultado"
                        >
                          <Eye size={17} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}

                {resultados.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                        <ClipboardList size={28} className="text-gray-400" />
                      </div>
                      <p className="font-semibold text-gray-500">Nenhum resultado encontrado</p>
                      <p className="mt-1 text-sm text-gray-400">Tente ajustar os filtros ou a busca.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[#E6DED0] px-6 py-4">
          <span className="text-sm text-gray-500">{total} resultado{total !== 1 ? "s" : ""}</span>
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

      {/* Toast notifications */}
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
