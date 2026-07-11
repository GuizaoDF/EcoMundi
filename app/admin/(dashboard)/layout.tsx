"use client";

import { usePathname } from "next/navigation";

import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/admin": {
    title: "Dashboard",
    subtitle: "Visão geral do painel administrativo.",
  },
  "/admin/contatos": {
    title: "Contatos",
    subtitle: "Mensagens enviadas pelo formulário do site.",
  },
  "/admin/newsletter": {
    title: "Newsletter",
    subtitle: "Gerencie os inscritos da newsletter.",
  },
  "/admin/noticias": {
    title: "Notícias",
    subtitle: "Gerencie as notícias publicadas.",
  },
  "/admin/noticias/nova": {
    title: "Nova Notícia",
    subtitle: "Preencha os dados da nova publicação.",
  },
  "/admin/usuarios": {
    title: "Usuários",
    subtitle: "Controle de acesso ao painel administrativo.",
  },
  "/admin/diagnostico": {
    title: "Diagnóstico",
    subtitle: "Resultados e analytics dos questionários.",
  },
  "/admin/diagnostico/formularios": {
    title: "Formulários",
    subtitle: "Gerencie os questionários de diagnóstico.",
  },
  "/admin/diagnostico/convites": {
    title: "Convites",
    subtitle: "Envie convites personalizados para o diagnóstico.",
  },
};

function getPageInfo(pathname: string) {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (/^\/admin\/noticias\/\d+\/editar$/.test(pathname))
    return { title: "Editar Notícia", subtitle: "Atualize os dados da publicação." };
  if (/^\/admin\/diagnostico\/resultados\/\d+$/.test(pathname))
    return { title: "Resultado", subtitle: "Detalhe do diagnóstico realizado." };
  if (/^\/admin\/diagnostico\/formularios\/\d+\/perguntas$/.test(pathname))
    return { title: "Perguntas", subtitle: "Gerencie categorias, perguntas e alternativas." };
  return { title: "Painel", subtitle: "" };
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const page = getPageInfo(pathname);

  return (
    <div className="flex min-h-screen bg-[#F7F5F0]">
      <Sidebar />
      <div className="flex-1">
        <div className="p-10">
          <Header title={page.title} subtitle={page.subtitle} />
          {children}
        </div>
      </div>
    </div>
  );
}
