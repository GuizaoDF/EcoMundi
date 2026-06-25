"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Newspaper } from "lucide-react";

interface Noticia {
  id: number;
  titulo: string;
  slug: string;
  resumo: string | null;
  criado_em: string;
  has_imagem: number;
}

const CARD_COLORS = [
  "from-[#0f3d2e] to-[#1a5c44]",
  "from-[#1a5c44] to-[#2d7a5e]",
  "from-[#2a6049] to-[#0f3d2e]",
  "from-[#3a7a60] to-[#1e4d38]",
];

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/noticias")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setNoticias(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="ECO MUNDI - Página inicial">
            <Image
              src="/images/logo-eco-mundi-site.png"
              alt="ECO MUNDI Consultoria e Gestão"
              width={659}
              height={184}
              className="h-14 w-auto"
              priority
            />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Blog & Notícias
          </p>
          <h1 className="mb-6 text-balance font-serif text-4xl font-semibold text-foreground sm:text-5xl">
            Fique por dentro do Direito Ambiental
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Artigos, análises e atualizações sobre legislação ambiental, ESG,
            sustentabilidade e as principais novidades do setor.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="aspect-[16/10] bg-muted" />
                  <div className="space-y-3 p-6">
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-3 rounded bg-muted" />
                    <div className="h-3 w-5/6 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : noticias.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <Newspaper className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg text-muted-foreground">
                Nenhuma notícia publicada ainda.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {noticias.map((noticia, index) => (
                <Link
                  key={noticia.id}
                  href={`/noticias/${noticia.slug}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
                >
                  {/* Imagem ou gradiente */}
                  {noticia.has_imagem ? (
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={`/api/noticias/${noticia.slug}/imagem?v=${noticia.id}`}
                        alt={noticia.titulo}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div
                      className={`flex aspect-[16/10] items-center justify-center bg-gradient-to-br ${CARD_COLORS[index % CARD_COLORS.length]}`}
                    >
                      <Newspaper className="h-10 w-10 text-white/30 transition-transform duration-500 group-hover:scale-110" />
                    </div>
                  )}

                  <div className="p-6">
                    <h2 className="mb-3 line-clamp-2 font-serif text-xl font-semibold text-foreground transition-colors group-hover:text-primary">
                      {noticia.titulo}
                    </h2>

                    {noticia.resumo && (
                      <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {noticia.resumo}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(noticia.criado_em).toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ECO MUNDI Advocacia. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
