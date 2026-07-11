"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Mail,
  Newspaper,
  Users,
  Send,
  LogOut,
  ClipboardList,
  ClipboardCheck,
  MailPlus,
} from "lucide-react";

const menu = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { section: "CONTEÚDO" },
  { title: "Notícias", icon: Newspaper, href: "/admin/noticias" },
  { title: "Newsletter", icon: Send, href: "/admin/newsletter" },
  { section: "RELACIONAMENTO" },
  { title: "Contatos", icon: Mail, href: "/admin/contatos" },
  { section: "DIAGNÓSTICO" },
  { title: "Resultados", icon: ClipboardList, href: "/admin/diagnostico", isActive: (p: string) => p === "/admin/diagnostico" || p.startsWith("/admin/diagnostico/resultados") },
  { title: "Formulários", icon: ClipboardCheck, href: "/admin/diagnostico/formularios" },
  { title: "Convites", icon: MailPlus, href: "/admin/diagnostico/convites" },
  { section: "ADMINISTRAÇÃO" },
  { title: "Usuários", icon: Users, href: "/admin/usuarios" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <aside className="w-72 bg-[#102419] text-white flex flex-col">

      {/* Logo */}
      <div className="p-8 border-b border-white/10">
        <Image
          src="/logo.png"
          alt="ECO MUNDI"
          width={185}
          height={70}
          className="bg-white rounded-xl p-3"
        />
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto py-6">
        {menu.map((item, index) => {
          if ("section" in item) {
            return (
              <p
                key={index}
                className="px-8 mt-8 mb-3 text-xs tracking-widest text-white/40 font-semibold"
              >
                {item.section}
              </p>
            );
          }

          const Icon = item.icon!;
          const active = "isActive" in item && item.isActive
            ? item.isActive(pathname)
            : item.href === "/admin"
              ? pathname === "/admin"
              : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`mx-4 mb-1 flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                active
                  ? "bg-white text-[#102419] font-semibold shadow"
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              <Icon size={20} />
              {item.title}
            </Link>
          );
        })}
      </div>

      {/* Rodapé */}
      <div className="border-t border-white/10 p-5">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-red-500/20 text-red-300 transition"
        >
          <LogOut size={20} />
          Sair
        </button>
      </div>

    </aside>
  );
}
