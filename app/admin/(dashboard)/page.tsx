"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Mail,
  Newspaper,
  Send,
  Users,
  MailOpen,
  ArrowRight,
  Pencil,
  Plus,
  Globe,
  FileText,
  TrendingUp,
} from "lucide-react";

interface Stats {
  contatos: { total: number; nao_lidos: number };
  newsletter: { total: number; ativos: number };
  noticias: { total: number; publicadas: number; rascunhos: number };
  usuarios: { total: number; ativos: number };
}

interface ContatoRecente {
  id: number;
  nome: string;
  empresa: string | null;
  email: string;
  lido: number;
  criado_em: string;
}

interface NoticiaRecente {
  id: number;
  titulo: string;
  slug: string;
  publicado: number;
  criado_em: string;
}

function tempoRelativo(data: string) {
  const diff = Date.now() - new Date(data).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min}min atrás`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d atrás`;
  return new Date(data).toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [contatos, setContatos] = useState<ContatoRecente[]>([]);
  const [noticias, setNoticias] = useState<NoticiaRecente[]>([]);
  const [usuario, setUsuario] = useState<string>("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/dashboard").then((r) => r.json()),
      fetch("/api/admin/auth/me").then((r) => r.json()),
    ]).then(([dash, me]) => {
      if (dash.success) {
        setStats(dash.stats);
        setContatos(dash.contatos_recentes);
        setNoticias(dash.noticias_recentes);
      }
      if (me.success) setUsuario(me.usuario.nome);
    }).finally(() => setCarregando(false));
  }, []);

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

  const cards = stats
    ? [
        {
          label: "Mensagens não lidas",
          value: stats.contatos.nao_lidos,
          sub: `${stats.contatos.total} total`,
          icon: <Mail size={22} />,
          color: stats.contatos.nao_lidos > 0 ? "#b45309" : "#0f3d2e",
          href: "/admin/contatos",
        },
        {
          label: "Inscritos na newsletter",
          value: stats.newsletter.ativos,
          sub: `${stats.newsletter.total} total`,
          icon: <Send size={22} />,
          color: "#1d4ed8",
          href: "/admin/newsletter",
        },
        {
          label: "Notícias publicadas",
          value: stats.noticias.publicadas,
          sub: `${stats.noticias.rascunhos} rascunho${stats.noticias.rascunhos !== 1 ? "s" : ""}`,
          icon: <Newspaper size={22} />,
          color: "#0f3d2e",
          href: "/admin/noticias",
        },
        {
          label: "Usuários ativos",
          value: stats.usuarios.ativos,
          sub: `${stats.usuarios.total} total`,
          icon: <Users size={22} />,
          color: "#6d28d9",
          href: "/admin/usuarios",
        },
      ]
    : [];

  return (
    <div className="space-y-8">

      {/* Saudação */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-1">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="font-serif text-3xl text-[#0f3d2e]">
            {saudacao}{usuario ? `, ${usuario.split(" ")[0]}` : ""}!
          </h1>
        </div>
        <Link
          href="/admin/noticias/nova"
          className="inline-flex items-center gap-2 rounded-xl bg-[#0f3d2e] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Plus size={16} />
          Nova notícia
        </Link>
      </div>

      {/* Cards de stats */}
      {carregando ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-[#E6DED0] bg-white p-6">
              <div className="h-3 w-24 rounded bg-gray-200" />
              <div className="mt-4 h-9 w-16 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="group relative overflow-hidden rounded-2xl border border-[#E6DED0] bg-white p-6 transition hover:shadow-md"
            >
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl" style={{ backgroundColor: c.color }} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">{c.label}</p>
                  <p className="mt-3 text-4xl font-bold" style={{ color: c.color }}>
                    {c.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{c.sub}</p>
                </div>
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl transition group-hover:scale-110"
                  style={{ background: `${c.color}15`, color: c.color }}
                >
                  {c.icon}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold" style={{ color: c.color }}>
                Ver todos <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Últimos contatos + Últimas notícias */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* Últimas mensagens */}
        <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
          <div className="flex items-center justify-between border-b border-[#E6DED0] px-6 py-4">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-[#0f3d2e]" />
              <h2 className="text-sm font-semibold text-[#0f3d2e]">Últimas mensagens</h2>
              {stats && stats.contatos.nao_lidos > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                  {stats.contatos.nao_lidos} não {stats.contatos.nao_lidos === 1 ? "lida" : "lidas"}
                </span>
              )}
            </div>
            <Link
              href="/admin/contatos"
              className="text-xs font-semibold text-[#0f3d2e] hover:underline"
            >
              Ver todas
            </Link>
          </div>

          {carregando ? (
            <div className="divide-y divide-[#E6DED0]">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
                    <div className="h-2.5 w-48 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : contatos.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-gray-400">
              <MailOpen size={32} className="opacity-30" />
              <p className="text-sm">Nenhuma mensagem recebida</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#E6DED0]">
              {contatos.map((c) => (
                <li key={c.id}>
                  <Link
                    href="/admin/contatos"
                    className="flex items-center gap-4 px-6 py-3.5 transition hover:bg-[#F7F5F0]"
                  >
                    <div className="relative shrink-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0f3d2e]/10 text-sm font-bold text-[#0f3d2e]">
                        {c.nome.charAt(0).toUpperCase()}
                      </div>
                      {!c.lido && (
                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm ${!c.lido ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                        {c.nome}
                      </p>
                      <p className="truncate text-xs text-gray-400">
                        {c.empresa || c.email}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-gray-400">
                      {tempoRelativo(c.criado_em)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Últimas notícias */}
        <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
          <div className="flex items-center justify-between border-b border-[#E6DED0] px-6 py-4">
            <div className="flex items-center gap-2">
              <Newspaper size={16} className="text-[#0f3d2e]" />
              <h2 className="text-sm font-semibold text-[#0f3d2e]">Últimas notícias</h2>
            </div>
            <Link
              href="/admin/noticias"
              className="text-xs font-semibold text-[#0f3d2e] hover:underline"
            >
              Ver todas
            </Link>
          </div>

          {carregando ? (
            <div className="divide-y divide-[#E6DED0]">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-48 animate-pulse rounded bg-gray-200" />
                    <div className="h-2.5 w-24 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : noticias.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-400">
              <Newspaper size={32} className="opacity-30" />
              <p className="text-sm">Nenhuma notícia cadastrada</p>
              <Link
                href="/admin/noticias/nova"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f3d2e] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
              >
                <Plus size={13} /> Criar primeira notícia
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[#E6DED0]">
              {noticias.map((n) => (
                <li key={n.id}>
                  <Link
                    href={`/admin/noticias/${n.id}/editar`}
                    className="flex items-center gap-4 px-6 py-3.5 transition hover:bg-[#F7F5F0]"
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: n.publicado ? "#0f3d2e15" : "#f3f4f6",
                        color: n.publicado ? "#0f3d2e" : "#9ca3af",
                      }}
                    >
                      {n.publicado ? <Globe size={16} /> : <FileText size={16} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{n.titulo}</p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-medium ${
                            n.publicado ? "text-green-600" : "text-gray-400"
                          }`}
                        >
                          {n.publicado ? "Publicada" : "Rascunho"}
                        </span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">{tempoRelativo(n.criado_em)}</span>
                      </div>
                    </div>
                    <Pencil size={14} className="shrink-0 text-gray-300" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
        <div className="border-b border-[#E6DED0] px-6 py-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#0f3d2e]" />
            <h2 className="text-sm font-semibold text-[#0f3d2e]">Ações rápidas</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-[#E6DED0] sm:grid-cols-4">
          {[
            { label: "Nova notícia", icon: <Plus size={20} />, href: "/admin/noticias/nova", color: "#0f3d2e" },
            { label: "Ver mensagens", icon: <Mail size={20} />, href: "/admin/contatos", color: "#b45309" },
            { label: "Newsletter", icon: <Send size={20} />, href: "/admin/newsletter", color: "#1d4ed8" },
            { label: "Usuários", icon: <Users size={20} />, href: "/admin/usuarios", color: "#6d28d9" },
          ].map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="group flex flex-col items-center gap-3 px-6 py-6 transition hover:bg-[#F7F5F0]"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl transition group-hover:scale-110"
                style={{ background: `${a.color}12`, color: a.color }}
              >
                {a.icon}
              </div>
              <span className="text-xs font-semibold text-gray-600">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
