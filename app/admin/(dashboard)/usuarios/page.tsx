"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";

interface Usuario {
  id: number;
  nome: string;
  login: string;
  ativo: number;
  criado_em: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

interface ModalState {
  aberto: boolean;
  usuario: Usuario | null;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<number | null>(null);

  const [modal, setModal] = useState<ModalState>({ aberto: false, usuario: null });
  const [nome, setNome] = useState("");
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [salvando, setSalvando] = useState(false);

  function toast(message: string, type: "success" | "error" = "success") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }

  async function carregar() {
    try {
      const res = await fetch("/api/admin/usuarios");
      const data = await res.json();
      if (data.success) setUsuarios(data.data);
    } catch {
      toast("Erro ao carregar usuários.", "error");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  function abrirNovo() {
    setModal({ aberto: true, usuario: null });
    setNome("");
    setLogin("");
    setSenha("");
    setMostrarSenha(false);
  }

  function abrirEdicao(u: Usuario) {
    setModal({ aberto: true, usuario: u });
    setNome(u.nome);
    setLogin(u.login);
    setSenha("");
    setMostrarSenha(false);
  }

  function fecharModal() {
    setModal({ aberto: false, usuario: null });
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!modal.usuario && !senha) { toast("Informe uma senha.", "error"); return; }
    setSalvando(true);
    try {
      const isEdicao = !!modal.usuario;
      const url = isEdicao ? `/api/admin/usuarios/${modal.usuario!.id}` : "/api/admin/usuarios";
      const body: any = { nome, login };
      if (senha) body.senha = senha;

      const res = await fetch(url, {
        method: isEdicao ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        toast(isEdicao ? "Usuário atualizado." : "Usuário criado.");
        fecharModal();
        carregar();
      } else {
        toast(data.message || "Erro ao salvar.", "error");
      }
    } catch {
      toast("Erro ao salvar.", "error");
    } finally {
      setSalvando(false);
    }
  }

  async function alternarAtivo(u: Usuario) {
    try {
      const res = await fetch(`/api/admin/usuarios/${u.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !u.ativo }),
      });
      const data = await res.json();
      if (data.success) {
        toast(u.ativo ? "Usuário desativado." : "Usuário ativado.");
        carregar();
      } else {
        toast(data.message || "Erro.", "error");
      }
    } catch {
      toast("Erro ao alterar status.", "error");
    }
  }

  async function excluir(id: number) {
    try {
      const res = await fetch(`/api/admin/usuarios/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast("Usuário removido.");
        setConfirmandoExclusao(null);
        carregar();
      } else {
        toast(data.message || "Erro ao excluir.", "error");
      }
    } catch {
      toast("Erro ao excluir.", "error");
    }
  }

  const ativos = usuarios.filter((u) => u.ativo).length;
  const inativos = usuarios.filter((u) => !u.ativo).length;

  return (
    <div className="space-y-6">

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total", value: usuarios.length, color: "#0f3d2e", icon: <Users size={22} /> },
          { label: "Ativos", value: ativos, color: "#16a34a", icon: <ShieldCheck size={22} /> },
          { label: "Inativos", value: inativos, color: "#dc2626", icon: <ShieldOff size={22} /> },
        ].map((c) => (
          <div key={c.label} className="relative overflow-hidden rounded-2xl border border-[#E6DED0] bg-white p-6">
            <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl" style={{ backgroundColor: c.color }} />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{c.label}</p>
                <p className="mt-3 text-4xl font-bold" style={{ color: c.color }}>{c.value}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `${c.color}18`, color: c.color }}>
                {c.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
        <div className="flex items-center justify-between border-b border-[#E6DED0] px-6 py-4">
          <p className="text-sm font-semibold text-[#0f3d2e]">
            {usuarios.length} usuário{usuarios.length !== 1 ? "s" : ""}
          </p>
          <button
            onClick={abrirNovo}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0f3d2e] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Plus size={16} />
            Novo usuário
          </button>
        </div>

        {carregando ? (
          <div className="py-16 text-center text-sm text-gray-400">Carregando...</div>
        ) : usuarios.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">Nenhum usuário cadastrado.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E6DED0] bg-[#F7F5F0]">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Login</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Criado em</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6DED0]">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-[#F7F5F0]/60 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0f3d2e]/10 text-xs font-bold text-[#0f3d2e]">
                        {u.nome.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{u.nome}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-600">{u.login}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => alternarAtivo(u)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition hover:opacity-80 ${
                        u.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {u.ativo ? <ShieldCheck size={12} /> : <ShieldOff size={12} />}
                      {u.ativo ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(u.criado_em).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4">
                    {confirmandoExclusao === u.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => excluir(u.id)}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setConfirmandoExclusao(null)}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold transition hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => abrirEdicao(u)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-[#F7F5F0] hover:text-[#0f3d2e]"
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setConfirmandoExclusao(u.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                          title="Excluir"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal.aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#E6DED0] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E6DED0] px-6 py-4">
              <h2 className="text-base font-semibold text-[#0f3d2e]">
                {modal.usuario ? "Editar usuário" : "Novo usuário"}
              </h2>
              <button
                onClick={fecharModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={salvar} className="space-y-5 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Nome completo</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  placeholder="Ex: João Silva"
                  className="w-full rounded-xl border border-[#E6DED0] px-4 py-3 text-sm outline-none transition focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Login</label>
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  required
                  placeholder="Ex: joao.silva"
                  autoComplete="off"
                  className="w-full rounded-xl border border-[#E6DED0] px-4 py-3 text-sm font-mono outline-none transition focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Senha
                  {modal.usuario && (
                    <span className="ml-1 text-xs text-gray-400">(deixe em branco para manter)</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder={modal.usuario ? "Nova senha (opcional)" : "Mínimo 6 caracteres"}
                    required={!modal.usuario}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-[#E6DED0] px-4 py-3 pr-11 text-sm outline-none transition focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    tabIndex={-1}
                  >
                    {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold transition hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 rounded-xl bg-[#0f3d2e] py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {salvando ? "Salvando..." : modal.usuario ? "Salvar alterações" : "Criar usuário"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
