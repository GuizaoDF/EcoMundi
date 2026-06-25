"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Globe, FileText, CheckCircle2, XCircle, ImageIcon, X } from "lucide-react";
import Link from "next/link";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

function gerarSlug(titulo: string) {
  return titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function NovaNoticiaPage() {
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEditado, setSlugEditado] = useState(false);
  const [resumo, setResumo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [imagem, setImagem] = useState("");
  const [publicado, setPublicado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  function toast(message: string, type: "success" | "error" = "success") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }

  function handleImagemChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast("A imagem deve ter no máximo 5MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setImagem(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleTituloChange(value: string) {
    setTitulo(value);
    if (!slugEditado) {
      setSlug(gerarSlug(value));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!titulo.trim() || !slug.trim()) {
      toast("Título e slug são obrigatórios.", "error");
      return;
    }

    setSalvando(true);
    try {
      const res = await fetch("/api/admin/noticias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, slug, resumo, conteudo, imagem, publicado }),
      });
      const data = await res.json();

      if (data.success) {
        router.push("/admin/noticias");
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
      {/* Botão voltar */}
      <div className="mb-6">
        <Link
          href="/admin/noticias"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0f3d2e] transition"
        >
          <ArrowLeft size={16} />
          Voltar para notícias
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

          {/* Coluna principal */}
          <div className="flex flex-col gap-5">

            {/* Título */}
            <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
              <div className="border-b border-[#E6DED0] px-6 py-4">
                <p className="text-sm font-semibold text-[#0f3d2e]">Título</p>
              </div>
              <div className="p-6">
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => handleTituloChange(e.target.value)}
                  placeholder="Digite o título da notícia..."
                  required
                  className="w-full rounded-xl border border-[#E6DED0] px-4 py-3 text-lg font-semibold outline-none transition focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10"
                />
              </div>
            </div>

            {/* Slug */}
            <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
              <div className="border-b border-[#E6DED0] px-6 py-4">
                <p className="text-sm font-semibold text-[#0f3d2e]">Slug (URL)</p>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 rounded-xl border border-[#E6DED0] px-4 py-3 focus-within:border-[#0f3d2e] focus-within:ring-2 focus-within:ring-[#0f3d2e]/10 transition">
                  <span className="shrink-0 text-sm text-gray-400">/noticias/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setSlugEditado(true);
                    }}
                    placeholder="slug-da-noticia"
                    required
                    className="min-w-0 flex-1 text-sm outline-none"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Gerado automaticamente a partir do título. Pode ser editado manualmente.
                </p>
              </div>
            </div>

            {/* Resumo */}
            <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
              <div className="flex items-center justify-between border-b border-[#E6DED0] px-6 py-4">
                <p className="text-sm font-semibold text-[#0f3d2e]">Resumo</p>
                <span className="text-xs text-gray-400">{resumo.length} / 300</span>
              </div>
              <div className="p-6">
                <textarea
                  value={resumo}
                  onChange={(e) => setResumo(e.target.value)}
                  maxLength={300}
                  rows={3}
                  placeholder="Breve descrição que aparece na listagem e nas redes sociais..."
                  className="w-full resize-none rounded-xl border border-[#E6DED0] px-4 py-3 text-sm outline-none transition focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10"
                />
              </div>
            </div>

            {/* Conteúdo */}
            <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
              <div className="border-b border-[#E6DED0] px-6 py-4">
                <p className="text-sm font-semibold text-[#0f3d2e]">Conteúdo</p>
              </div>
              <div className="p-6">
                <textarea
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  rows={18}
                  placeholder="Escreva o conteúdo completo da notícia aqui..."
                  className="w-full resize-y rounded-xl border border-[#E6DED0] px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10"
                />
              </div>
            </div>
          </div>

          {/* Coluna lateral */}
          <div className="flex flex-col gap-5">

            {/* Publicação */}
            <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
              <div className="border-b border-[#E6DED0] px-6 py-4">
                <p className="text-sm font-semibold text-[#0f3d2e]">Publicação</p>
              </div>
              <div className="p-6">
                <div className="flex flex-col gap-3">
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E6DED0] p-4 transition hover:bg-[#F7F5F0]">
                    <input
                      type="radio"
                      name="status"
                      checked={!publicado}
                      onChange={() => setPublicado(false)}
                      className="accent-[#0f3d2e]"
                    />
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-amber-600" />
                      <div>
                        <p className="text-sm font-semibold">Rascunho</p>
                        <p className="text-xs text-gray-400">Não visível no site</p>
                      </div>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E6DED0] p-4 transition hover:bg-[#F7F5F0]">
                    <input
                      type="radio"
                      name="status"
                      checked={publicado}
                      onChange={() => setPublicado(true)}
                      className="accent-[#0f3d2e]"
                    />
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-green-600" />
                      <div>
                        <p className="text-sm font-semibold">Publicada</p>
                        <p className="text-xs text-gray-400">Visível no site</p>
                      </div>
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={salvando}
                  className="mt-5 w-full rounded-xl bg-[#0f3d2e] py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {salvando ? "Salvando..." : publicado ? "Publicar notícia" : "Salvar rascunho"}
                </button>
              </div>
            </div>

            {/* Imagem */}
            <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
              <div className="border-b border-[#E6DED0] px-6 py-4">
                <p className="text-sm font-semibold text-[#0f3d2e]">Imagem de capa</p>
              </div>
              <div className="p-6">
                {imagem ? (
                  <div className="relative overflow-hidden rounded-xl border border-[#E6DED0]">
                    <img src={imagem} alt="Preview" className="h-44 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImagem("")}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white transition hover:bg-black/80"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E6DED0] p-8 transition hover:border-[#0f3d2e]/40 hover:bg-[#F7F5F0]">
                    <ImageIcon size={28} className="text-gray-300" />
                    <p className="text-sm font-semibold text-gray-500">Clique para selecionar</p>
                    <p className="text-xs text-gray-400">JPG, PNG ou WebP — máx. 5MB</p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleImagemChange}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

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
