"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen, Plus, Pencil, Trash2, Globe, FileText,
  Download, CheckCircle2, XCircle, Users,
} from "lucide-react";
import Card from "@/components/admin/Card";

interface Ebook {
  id: number;
  titulo: string;
  descricao: string | null;
  arquivo_nome: string | null;
  arquivo_tamanho: number | null;
  has_capa: number;
  ativo: number;
  criado_em: string;
  total_downloads: number;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminEbooksPage() {
  const router = useRouter();
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmandoExclusaoId, setConfirmandoExclusaoId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  function toast(message: string, type: "success" | "error" = "success") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }

  useEffect(() => {
    fetch("/api/admin/ebooks")
      .then((r) => r.json())
      .then((data) => { if (data.success) setEbooks(data.data); })
      .finally(() => setLoading(false));
  }, []);

  async function alternarAtivo(id: number, ativoAtual: number) {
    const formData = new FormData();
    const eb = ebooks.find((e) => e.id === id)!;
    formData.append("titulo", eb.titulo);
    formData.append("ativo", ativoAtual ? "0" : "1");
    const res = await fetch(`/api/admin/ebooks/${id}`, { method: "PUT", body: formData });
    const data = await res.json();
    if (data.success) {
      setEbooks((list) => list.map((e) => e.id === id ? { ...e, ativo: ativoAtual ? 0 : 1 } : e));
      toast(ativoAtual ? "E-book desativado." : "E-book ativado.");
    } else {
      toast(data.message || "Erro ao atualizar.", "error");
    }
  }

  async function excluir(id: number) {
    const res = await fetch(`/api/admin/ebooks/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setEbooks((list) => list.filter((e) => e.id !== id));
      setConfirmandoExclusaoId(null);
      toast("E-book excluído.");
    } else {
      toast(data.message || "Erro ao excluir.", "error");
    }
  }

  const totalAtivos = ebooks.filter((e) => e.ativo).length;
  const totalDownloads = ebooks.reduce((s, e) => s + e.total_downloads, 0);

  return (
    <div>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card title="Total de e-books" value={ebooks.length} icon={<BookOpen size={24} />} />
        <Card title="Ativos" value={totalAtivos} icon={<Globe size={24} />} color="#15803d" />
        <Card title="Downloads totais" value={totalDownloads} icon={<Download size={24} />} color="#0f3d2e" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
        <div className="flex items-center justify-between border-b border-[#E6DED0] p-5">
          <p className="text-sm font-semibold text-[#0f3d2e]">E-books cadastrados</p>
          <button
            onClick={() => router.push("/admin/ebooks/nova")}
            className="flex h-10 items-center gap-2 rounded-xl bg-[#0f3d2e] px-4 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Plus size={15} /> Novo e-book
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">Carregando...</div>
        ) : ebooks.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
              <BookOpen size={28} className="text-gray-400" />
            </div>
            <p className="font-semibold text-gray-500">Nenhum e-book cadastrado</p>
            <p className="mt-1 text-sm text-gray-400">Clique em "Novo e-book" para começar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F7F5F0] text-[#0f3d2e]">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">E-book</th>
                  <th className="px-4 py-4 text-center font-semibold">Status</th>
                  <th className="px-4 py-4 text-center font-semibold">Downloads</th>
                  <th className="px-4 py-4 text-left font-semibold">Arquivo</th>
                  <th className="px-4 py-4 text-right font-semibold" />
                </tr>
              </thead>
              <tbody>
                {ebooks.map((eb) => (
                  <tr key={eb.id} className="border-t border-[#F0EBE3] transition hover:bg-[#faf8f3]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0f3d2e]/10">
                          <BookOpen size={18} className="text-[#0f3d2e]/60" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{eb.titulo}</p>
                          {eb.descricao && (
                            <p className="mt-0.5 line-clamp-1 max-w-xs text-xs text-gray-400">{eb.descricao}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => alternarAtivo(eb.id, eb.ativo)}
                        title={eb.ativo ? "Clique para desativar" : "Clique para ativar"}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition hover:opacity-75"
                        style={eb.ativo
                          ? { background: "#dcfce7", color: "#15803d" }
                          : { background: "#f3f4f6", color: "#6b7280" }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: eb.ativo ? "#16a34a" : "#9ca3af" }} />
                        {eb.ativo ? "Ativo" : "Inativo"}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-600">
                        <Users size={13} />
                        <span className="font-semibold">{eb.total_downloads}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-500">
                      {eb.arquivo_nome ? (
                        <div>
                          <p className="text-xs font-medium text-gray-700">{eb.arquivo_nome}</p>
                          {eb.arquivo_tamanho && (
                            <p className="text-xs text-gray-400">{formatBytes(eb.arquivo_tamanho)}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Sem arquivo</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {confirmandoExclusaoId === eb.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => excluir(eb.id)} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition">Confirmar</button>
                          <button onClick={() => setConfirmandoExclusaoId(null)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 transition">Cancelar</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => router.push(`/admin/ebooks/${eb.id}/editar`)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-[#0f3d2e]/10 hover:text-[#0f3d2e]" title="Editar">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => setConfirmandoExclusaoId(eb.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600" title="Excluir">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${t.type === "error" ? "bg-red-600" : "bg-[#0f3d2e]"}`}>
            {t.type === "error" ? <XCircle size={17} /> : <CheckCircle2 size={17} />}
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
