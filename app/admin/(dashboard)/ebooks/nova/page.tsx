"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImageIcon, FileText, X, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

interface Toast { id: number; message: string; type: "success" | "error"; }

export default function NovoEbookPage() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [imagem, setImagem] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  function toast(message: string, type: "success" | "error" = "success") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }

  function handleImagem(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast("A imagem deve ter no máximo 5MB.", "error"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setImagem(ev.target?.result as string);
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
    if (!pdfFile) { toast("Selecione um arquivo PDF.", "error"); return; }

    setSalvando(true);
    try {
      const formData = new FormData();
      formData.append("titulo", titulo);
      formData.append("descricao", descricao);
      formData.append("ativo", ativo ? "1" : "0");
      formData.append("pdf", pdfFile);
      if (imagem) formData.append("imagem_capa", imagem);

      const res = await fetch("/api/admin/ebooks", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        router.push("/admin/ebooks");
      } else {
        toast(data.message || "Erro ao salvar.", "error");
      }
    } catch {
      toast("Erro ao salvar.", "error");
    } finally {
      setSalvando(false);
    }
  }

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
              <div className="border-b border-[#E6DED0] px-6 py-4">
                <p className="text-sm font-semibold text-[#0f3d2e]">Título</p>
              </div>
              <div className="p-6">
                <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título do e-book..." required
                  className="w-full rounded-xl border border-[#E6DED0] px-4 py-3 text-lg font-semibold outline-none transition focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10" />
              </div>
            </div>

            {/* Descrição */}
            <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
              <div className="border-b border-[#E6DED0] px-6 py-4">
                <p className="text-sm font-semibold text-[#0f3d2e]">Descrição</p>
              </div>
              <div className="p-6">
                <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={4}
                  placeholder="Breve descrição do conteúdo do e-book..."
                  className="w-full resize-none rounded-xl border border-[#E6DED0] px-4 py-3 text-sm outline-none transition focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10" />
              </div>
            </div>

            {/* Arquivo PDF */}
            <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
              <div className="border-b border-[#E6DED0] px-6 py-4">
                <p className="text-sm font-semibold text-[#0f3d2e]">Arquivo PDF</p>
              </div>
              <div className="p-6">
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
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E6DED0] p-8 transition hover:border-[#0f3d2e]/40 hover:bg-[#F7F5F0]">
                    <FileText size={28} className="text-gray-300" />
                    <p className="text-sm font-semibold text-gray-500">Clique para selecionar o PDF</p>
                    <p className="text-xs text-gray-400">PDF — máx. 10MB</p>
                    <input type="file" accept="application/pdf" className="hidden" onChange={handlePdf} />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Coluna lateral */}
          <div className="flex flex-col gap-5">

            {/* Publicação */}
            <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
              <div className="border-b border-[#E6DED0] px-6 py-4">
                <p className="text-sm font-semibold text-[#0f3d2e]">Visibilidade</p>
              </div>
              <div className="p-6 flex flex-col gap-3">
                {[
                  { value: true, label: "Ativo", sub: "Visível no site", color: "text-green-600" },
                  { value: false, label: "Inativo", sub: "Não visível no site", color: "text-gray-400" },
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
                  {salvando ? "Salvando..." : "Salvar e-book"}
                </button>
              </div>
            </div>

            {/* Imagem de capa */}
            <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
              <div className="border-b border-[#E6DED0] px-6 py-4">
                <p className="text-sm font-semibold text-[#0f3d2e]">Imagem de capa</p>
              </div>
              <div className="p-6">
                {imagem ? (
                  <div className="relative overflow-hidden rounded-xl border border-[#E6DED0]">
                    <img src={imagem} alt="Capa" className="h-44 w-full object-cover" />
                    <button type="button" onClick={() => setImagem("")}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white transition hover:bg-black/80">
                      <X size={14} />
                    </button>
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
