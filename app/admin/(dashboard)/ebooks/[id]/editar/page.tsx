"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, ImageIcon, FileText, X, CheckCircle2, XCircle, Trash2, Download, Mail } from "lucide-react";
import Link from "next/link";

interface Download {
  id: number;
  nome: string;
  email: string;
  inscrito_newsletter: number;
  criado_em: string;
}

interface Toast { id: number; message: string; type: "success" | "error"; }

export default function EditarEbookPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [imagem, setImagem] = useState("");
  const [imagemAtual, setImagemAtual] = useState(false);
  const [removerCapa, setRemoverCapa] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [arquivoNomeAtual, setArquivoNomeAtual] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  function toast(message: string, type: "success" | "error" = "success") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/ebooks/${id}`).then((r) => r.json()),
      fetch(`/api/admin/ebooks/${id}/downloads`).then((r) => r.json()),
    ]).then(([eb, dl]) => {
      if (eb.success) {
        setTitulo(eb.data.titulo);
        setDescricao(eb.data.descricao || "");
        setAtivo(!!eb.data.ativo);
        setImagemAtual(!!eb.data.has_capa);
        setArquivoNomeAtual(eb.data.arquivo_nome);
      } else {
        toast("E-book não encontrado.", "error");
        router.push("/admin/ebooks");
      }
      if (dl.success) setDownloads(dl.data);
    }).finally(() => setLoading(false));
  }, [id, router]);

  function handleImagem(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast("A imagem deve ter no máximo 5MB.", "error"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setImagem(ev.target?.result as string); setRemoverCapa(false); };
    reader.readAsDataURL(file);
  }

  function handlePdf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast("O PDF deve ter no máximo 10MB.", "error"); return; }
    if (file.type !== "application/pdf") { toast("Selecione um arquivo PDF.", "error"); return; }
    setPdfFile(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) { toast("Título é obrigatório.", "error"); return; }

    setSalvando(true);
    try {
      const formData = new FormData();
      formData.append("titulo", titulo);
      formData.append("descricao", descricao);
      formData.append("ativo", ativo ? "1" : "0");
      if (pdfFile) formData.append("pdf", pdfFile);
      if (imagem) formData.append("imagem_capa", imagem);
      if (removerCapa) formData.append("remover_capa", "1");

      const res = await fetch(`/api/admin/ebooks/${id}`, { method: "PUT", body: formData });
      const data = await res.json();
      if (data.success) {
        toast("E-book salvo com sucesso.");
        if (pdfFile) setArquivoNomeAtual(pdfFile.name);
        if (imagem) { setImagemAtual(true); setImagem(""); }
        if (removerCapa) { setImagemAtual(false); setRemoverCapa(false); }
        setPdfFile(null);
      } else {
        toast(data.message || "Erro ao salvar.", "error");
      }
    } catch {
      toast("Erro ao salvar.", "error");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    const res = await fetch(`/api/admin/ebooks/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) router.push("/admin/ebooks");
    else toast(data.message || "Erro ao excluir.", "error");
  }

  if (loading) return <div className="flex items-center justify-center py-24 text-gray-400">Carregando...</div>;

  const temCapa = imagemAtual && !removerCapa;

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/ebooks" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0f3d2e] transition">
          <ArrowLeft size={16} /> Voltar para e-books
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="flex flex-col gap-5">

            {/* Título */}
            <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
              <div className="border-b border-[#E6DED0] px-6 py-4"><p className="text-sm font-semibold text-[#0f3d2e]">Título</p></div>
              <div className="p-6">
                <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título do e-book..." required
                  className="w-full rounded-xl border border-[#E6DED0] px-4 py-3 text-lg font-semibold outline-none transition focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10" />
              </div>
            </div>

            {/* Descrição */}
            <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
              <div className="border-b border-[#E6DED0] px-6 py-4"><p className="text-sm font-semibold text-[#0f3d2e]">Descrição</p></div>
              <div className="p-6">
                <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={4}
                  placeholder="Breve descrição do conteúdo do e-book..."
                  className="w-full resize-none rounded-xl border border-[#E6DED0] px-4 py-3 text-sm outline-none transition focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10" />
              </div>
            </div>

            {/* Arquivo PDF */}
            <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
              <div className="border-b border-[#E6DED0] px-6 py-4"><p className="text-sm font-semibold text-[#0f3d2e]">Arquivo PDF</p></div>
              <div className="p-6 flex flex-col gap-3">
                {arquivoNomeAtual && !pdfFile && (
                  <div className="flex items-center gap-3 rounded-xl border border-[#E6DED0] bg-[#F7F5F0] px-4 py-3">
                    <FileText size={18} className="shrink-0 text-[#0f3d2e]" />
                    <p className="text-sm text-gray-600">Arquivo atual: <strong>{arquivoNomeAtual}</strong></p>
                  </div>
                )}
                {pdfFile ? (
                  <div className="flex items-center justify-between rounded-xl border border-[#E6DED0] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="shrink-0 text-[#0f3d2e]" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{pdfFile.name}</p>
                        <p className="text-xs text-gray-400">{(pdfFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setPdfFile(null)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition">
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E6DED0] p-6 transition hover:border-[#0f3d2e]/40 hover:bg-[#F7F5F0]">
                    <FileText size={24} className="text-gray-300" />
                    <p className="text-sm font-semibold text-gray-500">{arquivoNomeAtual ? "Substituir PDF" : "Selecionar PDF"}</p>
                    <p className="text-xs text-gray-400">PDF — máx. 10MB</p>
                    <input type="file" accept="application/pdf" className="hidden" onChange={handlePdf} />
                  </label>
                )}
              </div>
            </div>

            {/* Downloads */}
            <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
              <div className="border-b border-[#E6DED0] px-6 py-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-[#0f3d2e]">Downloads</p>
                <span className="rounded-full bg-[#0f3d2e]/10 px-3 py-0.5 text-xs font-semibold text-[#0f3d2e]">{downloads.length}</span>
              </div>
              {downloads.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400">Nenhum download registrado ainda.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F7F5F0] text-[#0f3d2e]">
                      <tr>
                        <th className="px-5 py-3 text-left font-semibold">Nome</th>
                        <th className="px-4 py-3 text-left font-semibold">E-mail</th>
                        <th className="px-4 py-3 text-center font-semibold">Newsletter</th>
                        <th className="px-4 py-3 text-left font-semibold">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {downloads.map((d) => (
                        <tr key={d.id} className="border-t border-[#F0EBE3]">
                          <td className="px-5 py-3 font-medium text-gray-800">{d.nome}</td>
                          <td className="px-4 py-3 text-gray-600">{d.email}</td>
                          <td className="px-4 py-3 text-center">
                            {d.inscrito_newsletter ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                                <Mail size={10} /> Sim
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {new Date(d.criado_em).toLocaleDateString("pt-BR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Coluna lateral */}
          <div className="flex flex-col gap-5">

            {/* Visibilidade */}
            <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
              <div className="border-b border-[#E6DED0] px-6 py-4"><p className="text-sm font-semibold text-[#0f3d2e]">Visibilidade</p></div>
              <div className="p-6 flex flex-col gap-3">
                {[
                  { value: true, label: "Ativo", sub: "Visível no site" },
                  { value: false, label: "Inativo", sub: "Não visível no site" },
                ].map((opt) => (
                  <label key={String(opt.value)} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E6DED0] p-4 transition hover:bg-[#F7F5F0]">
                    <input type="radio" name="ativo" checked={ativo === opt.value} onChange={() => setAtivo(opt.value)} className="accent-[#0f3d2e]" />
                    <div>
                      <p className="text-sm font-semibold">{opt.label}</p>
                      <p className="text-xs text-gray-400">{opt.sub}</p>
                    </div>
                  </label>
                ))}
                <button type="submit" disabled={salvando}
                  className="mt-2 w-full rounded-xl bg-[#0f3d2e] py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                  {salvando ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </div>

            {/* Imagem de capa */}
            <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
              <div className="border-b border-[#E6DED0] px-6 py-4"><p className="text-sm font-semibold text-[#0f3d2e]">Imagem de capa</p></div>
              <div className="p-6">
                {imagem ? (
                  <div className="relative overflow-hidden rounded-xl border border-[#E6DED0]">
                    <img src={imagem} alt="Capa" className="h-44 w-full object-cover" />
                    <button type="button" onClick={() => setImagem("")}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white transition hover:bg-black/80">
                      <X size={14} />
                    </button>
                  </div>
                ) : temCapa ? (
                  <div className="relative overflow-hidden rounded-xl border border-[#E6DED0]">
                    <img src={`/api/ebooks/${id}/capa`} alt="Capa atual" className="h-44 w-full object-cover" />
                    <button type="button" onClick={() => setRemoverCapa(true)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white transition hover:bg-black/80">
                      <X size={14} />
                    </button>
                    <label className="absolute bottom-2 right-2 cursor-pointer rounded-lg bg-black/60 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-black/80">
                      Trocar imagem
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImagem} />
                    </label>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E6DED0] p-8 transition hover:border-[#0f3d2e]/40 hover:bg-[#F7F5F0]">
                    <ImageIcon size={28} className="text-gray-300" />
                    <p className="text-sm font-semibold text-gray-500">Clique para selecionar</p>
                    <p className="text-xs text-gray-400">JPG, PNG ou WebP — máx. 5MB</p>
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImagem} />
                  </label>
                )}
              </div>
            </div>

            {/* Zona de perigo */}
            <div className="overflow-hidden rounded-2xl border border-red-200 bg-white">
              <div className="border-b border-red-100 px-6 py-4"><p className="text-sm font-semibold text-red-600">Zona de perigo</p></div>
              <div className="p-6">
                {!confirmandoExclusao ? (
                  <button type="button" onClick={() => setConfirmandoExclusao(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50">
                    <Trash2 size={16} /> Excluir e-book
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-center text-xs text-gray-500">Tem certeza? Esta ação não pode ser desfeita.</p>
                    <button type="button" onClick={excluir} className="w-full rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700">Confirmar exclusão</button>
                    <button type="button" onClick={() => setConfirmandoExclusao(false)} className="w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold transition hover:bg-gray-50">Cancelar</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

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
