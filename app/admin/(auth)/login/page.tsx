"use client";

import Image from "next/image";
import { Leaf, LockKeyhole, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [error, setError] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setCarregando(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, senha }),
      });

      const data = await res.json();

      if (data.success) {
        router.replace("/admin");
      } else {
        setError(data.message || "Usuário ou senha inválidos.");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f1ea] flex items-center justify-center p-6">
      <section className="w-full max-w-7xl min-h-[680px] bg-white rounded-[32px] overflow-hidden shadow-sm border border-[#e2d8c7] grid grid-cols-1 lg:grid-cols-2">

        {/* LADO ESQUERDO */}
        <div className="bg-[#102419] text-white p-12 lg:p-14 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 mb-16">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <Leaf size={24} />
              </div>
              <span className="tracking-[0.35em] text-sm font-medium">ECO MUNDI</span>
            </div>

            <h1 className="font-serif text-5xl lg:text-6xl leading-tight mb-8">
              Painel de gestão
              <br />
              ambiental e notícias
            </h1>

            <p className="text-lg leading-8 text-white/80 max-w-md">
              Área restrita para administração de conteúdos institucionais do
              site ECO MUNDI.
            </p>
          </div>

          <p className="text-white/60 text-sm">Consultoria e Gestão Ambiental</p>
        </div>

        {/* LADO DIREITO */}
        <div className="bg-[#fbfbfa] flex items-center justify-center p-8 lg:p-14">
          <div className="w-full max-w-lg">

            <div className="flex justify-center mb-10">
              <Image
                src="/logo.png"
                alt="ECO MUNDI"
                width={260}
                height={100}
                priority
              />
            </div>

            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-full bg-[#eee6d8] flex items-center justify-center">
                <LockKeyhole size={24} className="text-[#102419]" />
              </div>
            </div>

            <div className="text-center mb-10">
              <h2 className="font-serif text-4xl text-[#102419] mb-3">
                Acesso Administrativo
              </h2>
              <p className="text-gray-600">
                Entre com seu usuário e senha para continuar.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-[#102419]">
                  Usuário
                </label>
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="Digite seu usuário"
                  required
                  autoComplete="username"
                  className="w-full h-14 rounded-xl border border-gray-300 px-5 text-base outline-none focus:border-[#102419] focus:ring-2 focus:ring-[#102419]/10 transition"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-[#102419]">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite sua senha"
                    required
                    autoComplete="current-password"
                    className="w-full h-14 rounded-xl border border-gray-300 px-5 pr-12 text-base outline-none focus:border-[#102419] focus:ring-2 focus:ring-[#102419]/10 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    tabIndex={-1}
                  >
                    {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="w-full h-14 rounded-xl bg-[#102419] text-white font-semibold hover:bg-[#183626] transition disabled:opacity-60"
              >
                {carregando ? "Entrando..." : "Entrar no painel"}
              </button>
            </form>

          </div>
        </div>

      </section>
    </main>
  );
}
