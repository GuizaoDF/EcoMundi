"use client";

import {
  Bell,
  Search,
  UserCircle2,
} from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({
  title,
  subtitle,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between mb-10">

      {/* Esquerda */}

      <div>

        <h1 className="text-4xl font-serif text-[#102419]">
          {title}
        </h1>

        {subtitle && (
          <p className="text-gray-500 mt-2">
            {subtitle}
          </p>
        )}

      </div>

      {/* Direita */}

      <div className="flex items-center gap-5">

        {/* Pesquisa */}

        <div className="hidden lg:flex items-center bg-white rounded-xl border border-[#E6DED0] px-4 h-11 w-72">

          <Search
            size={18}
            className="text-gray-400"
          />

          <input
            type="text"
            placeholder="Pesquisar..."
            className="ml-3 w-full outline-none bg-transparent text-sm"
          />

        </div>

        {/* Notificação */}

        <button className="w-11 h-11 rounded-xl bg-white border border-[#E6DED0] flex items-center justify-center hover:bg-gray-50 transition">

          <Bell size={20} />

        </button>

        {/* Usuário */}

        <div className="flex items-center gap-3 bg-white border border-[#E6DED0] rounded-xl px-3 py-2">

          <UserCircle2
            size={38}
            className="text-[#102419]"
          />

          <div>

            <p className="font-semibold text-[#102419]">
              Administrador
            </p>

            <span className="text-xs text-gray-500">
              ECO MUNDI
            </span>

          </div>

        </div>

      </div>

    </header>
  );
}