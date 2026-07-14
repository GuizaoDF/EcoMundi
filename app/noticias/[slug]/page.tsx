"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Newspaper } from "lucide-react";

interface Noticia {
  id: number;
  titulo: string;
  slug: string;
  resumo: string | null;
  conteudo: string | null;
  imagem: string | null;
  criado_em: string;
}

export default function NoticiaPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/noticias/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setNoticia(data.data);
        } else {
          router.replace("/noticias");
        }
      })
      .catch(() => router.replace("/noticias"))
      .finally(() => setLoading(false));
  }, [slug, router]);

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
            href="/noticias"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Notícias
          </Link>
        </div>
      </header>

      {loading ? (
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-3/4 rounded-xl bg-muted" />
            <div className="h-4 w-1/3 rounded bg-muted" />
            <div className="aspect-video rounded-2xl bg-muted" />
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 rounded bg-muted" style={{ width: `${85 + Math.random() * 15}%` }} />
              ))}
            </div>
          </div>
        </div>
      ) : noticia ? (
        <>
          {/* Hero com imagem ou gradiente */}
          {noticia.imagem ? (
            <div className="aspect-[21/8] w-full overflow-hidden">
              <img
                src={noticia.imagem}
                alt={noticia.titulo}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-[21/8] w-full items-center justify-center bg-gradient-to-br from-[#0f3d2e] to-[#1a5c44]">
              <Newspaper className="h-16 w-16 text-white/20" />
            </div>
          )}

          {/* Conteúdo */}
          <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            {/* Meta */}
            <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(noticia.criado_em).toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>

            {/* Título */}
            <h1 className="mb-6 font-serif text-3xl font-semibold leading-snug text-foreground sm:text-4xl">
              {noticia.titulo}
            </h1>

            {/* Resumo em destaque */}
            {noticia.resumo && (
              <p className="mb-8 border-l-4 border-primary pl-5 text-lg leading-relaxed text-muted-foreground">
                {noticia.resumo}
              </p>
            )}

            {/* Divisor */}
            <hr className="mb-8 border-border" />

            {/* Corpo do artigo */}
            {noticia.conteudo ? (
              <div
                className="prose prose-lg max-w-none prose-headings:text-foreground prose-a:text-primary"
                dangerouslySetInnerHTML={{ __html: noticia.conteudo }}
              />
            ) : (
              <p className="text-muted-foreground">Conteúdo não disponível.</p>
            )}

            {/* Voltar */}
            <div className="mt-12 border-t border-border pt-8">
              <Link
                href="/noticias"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Ver todas as notícias
              </Link>
            </div>
          </article>
        </>
      ) : null}

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ECO MUNDI. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
