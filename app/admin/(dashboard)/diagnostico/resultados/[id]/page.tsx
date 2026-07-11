"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  UtensilsCrossed,
  CalendarDays,
  Waves,
  Flame,
  PawPrint,
  Stethoscope,
  Coffee,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

interface ScoreCategoria {
  categoria_id: number;
  nome: string;
  pontuacao: number;
  pontuacao_max: number;
  percentual: number;
}

interface Resposta {
  pergunta_id: number;
  pergunta_texto: string;
  alternativa_texto: string;
  pontuacao: number;
  categoria_nome: string;
}

interface Resultado {
  id: number;
  formulario_id: number;
  formulario_nome: string;
  nome: string;
  email: string;
  razao_social: string | null;
  cnpj: string | null;
  num_hospedes: string | null;
  tem_restaurante: string | null;
  tem_eventos: number | null;
  tem_piscina: number | null;
  tem_caldeira: number | null;
  tem_animais: number | null;
  tem_ambulatorio: number | null;
  tem_refeitorio: number | null;
  pontuacao_total: number;
  pontuacao_maxima: number;
  percentual: number;
  classificacao: string;
  email_enviado: number;
  criado_em: string;
  scores_categoria: ScoreCategoria[];
  respostas: Resposta[];
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

const CLASSIFICACAO_CORES: Record<string, { bg: string; text: string; border: string }> = {
  "Crítico":               { bg: "bg-red-100",    text: "text-red-700",    border: "border-red-200" },
  "Vulnerável":            { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  "Em Desenvolvimento":    { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
  "Conformidade Adequada": { bg: "bg-green-100",  text: "text-green-800",  border: "border-green-200" },
};

function getBarColor(percentual: number) {
  if (percentual < 25) return "#dc2626";
  if (percentual < 50) return "#ea580c";
  if (percentual < 75) return "#ca8a04";
  return "#15803d";
}

export default function ResultadoDetalhe() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  function toast(message: string, type: "success" | "error" = "success") {
    const tid = Date.now();
    setToasts((prev) => [...prev, { id: tid, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== tid)), 3500);
  }

  useEffect(() => {
    fetch(`/api/admin/diagnostico/resultados/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setResultado(data.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function excluir() {
    setExcluindo(true);
    try {
      const res = await fetch(`/api/admin/diagnostico/resultados/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast("Resultado excluído.");
        setTimeout(() => router.push("/admin/diagnostico"), 1000);
      } else {
        toast("Erro ao excluir resultado.", "error");
        setConfirmandoExclusao(false);
      }
    } finally {
      setExcluindo(false);
    }
  }

  if (loading) {
    return <div className="py-16 text-center text-gray-400">Carregando resultado...</div>;
  }

  if (!resultado) {
    return (
      <div className="py-16 text-center text-gray-400">
        Resultado não encontrado.{" "}
        <Link href="/admin/diagnostico" className="text-[#0f3d2e] hover:underline">
          Voltar
        </Link>
      </div>
    );
  }

  const cores = CLASSIFICACAO_CORES[resultado.classificacao] ?? CLASSIFICACAO_CORES["Crítico"];
  const percentualFormatado = parseFloat(String(resultado.percentual)).toFixed(1);

  // Sort scores by percentual ascending (weakest first)
  const scoresOrdenados = [...resultado.scores_categoria].sort((a, b) => a.percentual - b.percentual);

  // Group respostas by categoria
  const categorias = resultado.scores_categoria.map((sc) => ({
    ...sc,
    respostas: resultado.respostas.filter((r) => r.categoria_nome === sc.nome),
  }));

  const perfil = [
    resultado.tem_restaurante && resultado.tem_restaurante !== "NÃO" && { icon: UtensilsCrossed, label: `Restaurante: ${resultado.tem_restaurante}` },
    resultado.tem_eventos && { icon: CalendarDays, label: "Local para Eventos" },
    resultado.tem_piscina && { icon: Waves, label: "Piscina" },
    resultado.tem_caldeira && { icon: Flame, label: "Caldeira" },
    resultado.tem_animais && { icon: PawPrint, label: "Atividades com Animais" },
    resultado.tem_ambulatorio && { icon: Stethoscope, label: "Ambulatório" },
    resultado.tem_refeitorio && { icon: Coffee, label: "Refeitório" },
  ].filter(Boolean) as { icon: any; label: string }[];

  return (
    <div className="space-y-6">
      {/* Navegação */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/diagnostico"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f3d2e] hover:underline"
        >
          <ArrowLeft size={15} />
          Voltar aos Resultados
        </Link>
        {!confirmandoExclusao ? (
          <button
            onClick={() => setConfirmandoExclusao(true)}
            className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <Trash2 size={15} />
            Excluir resultado
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={excluir}
              disabled={excluindo}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {excluindo && <Loader2 size={14} className="animate-spin" />}
              Confirmar exclusão
            </button>
            <button
              onClick={() => setConfirmandoExclusao(false)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold transition hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Header card */}
      <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
        <div className={`h-2 ${cores.bg.replace("bg-", "bg-").replace("-100", "-400")}`}
          style={{ backgroundColor: getBarColor(resultado.percentual) }}
        />
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Nome</p>
              <p className="mt-1 font-semibold text-gray-800">{resultado.nome}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">E-mail</p>
              <p className="mt-1 font-semibold text-gray-800">{resultado.email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Razão Social</p>
              <p className="mt-1 font-semibold text-gray-800">{resultado.razao_social || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">CNPJ</p>
              <p className="mt-1 font-semibold text-gray-800">{resultado.cnpj || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Hóspedes/Mês</p>
              <p className="mt-1 font-semibold text-gray-800">{resultado.num_hospedes || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Formulário</p>
              <p className="mt-1 font-semibold text-gray-800">{resultado.formulario_nome}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Data</p>
              <p className="mt-1 font-semibold text-gray-800">
                {new Date(resultado.criado_em).toLocaleString("pt-BR")}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Classificação</p>
              <span className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${cores.bg} ${cores.text}`}>
                {resultado.classificacao}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">E-mail Enviado</p>
              <p className="mt-1 font-semibold text-gray-800">{resultado.email_enviado ? "Sim" : "Não"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Perfil do hotel */}
      {perfil.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {perfil.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-xl border border-[#E6DED0] bg-white px-3 py-2 text-sm font-medium text-gray-700"
            >
              <Icon size={15} className="text-[#0f3d2e]" />
              {label}
            </div>
          ))}
        </div>
      )}

      {/* Score geral */}
      <div className="rounded-2xl border border-[#E6DED0] bg-white p-6">
        <div className="flex items-end gap-6">
          <div>
            <p className="text-5xl font-bold" style={{ color: getBarColor(resultado.percentual) }}>
              {percentualFormatado}%
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {resultado.pontuacao_total} de {resultado.pontuacao_maxima} pontos
            </p>
          </div>
          <div className="flex-1">
            <div className="h-4 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${resultado.percentual}%`,
                  backgroundColor: getBarColor(resultado.percentual),
                }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-400">
              <span>0%</span>
              <span>25% — Vulnerável</span>
              <span>50% — Em Desenvolvimento</span>
              <span>75% — Conformidade</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* BarChart por categoria */}
      <div className="rounded-2xl border border-[#E6DED0] bg-white p-6">
        <h3 className="mb-4 font-semibold text-[#0f3d2e]">Pontuação por Categoria</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={scoresOrdenados}
            layout="vertical"
            margin={{ left: 0, right: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <YAxis dataKey="nome" type="category" width={220} tick={{ fontSize: 11 }} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
            <Bar dataKey="percentual" radius={[0, 4, 4, 0]}>
              {scoresOrdenados.map((entry, index) => (
                <Cell key={index} fill={getBarColor(entry.percentual)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Listagem de respostas por categoria */}
      <div className="space-y-4">
        {categorias.map((cat) => (
          <div key={cat.categoria_id} className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
            <div className="flex items-center justify-between border-b border-[#E6DED0] px-6 py-4">
              <h4 className="font-semibold text-[#0f3d2e]">{cat.nome}</h4>
              <div className="flex items-center gap-3">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${cat.percentual}%`, backgroundColor: getBarColor(cat.percentual) }}
                  />
                </div>
                <span className="text-sm font-semibold" style={{ color: getBarColor(cat.percentual) }}>
                  {parseFloat(String(cat.percentual)).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="divide-y divide-[#F0EBE3]">
              {cat.respostas.map((r) => (
                <div key={r.pergunta_id} className="flex items-start gap-4 px-6 py-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{r.pergunta_texto}</p>
                    <p className="mt-1 text-sm text-gray-500">{r.alternativa_texto}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    r.pontuacao >= 3 ? "bg-green-100 text-green-700" :
                    r.pontuacao >= 2 ? "bg-yellow-100 text-yellow-800" :
                    r.pontuacao >= 1 ? "bg-orange-100 text-orange-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {r.pontuacao}/4
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
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
