"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Plus, Calendar, User, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNews } from "@/contexts/news-context";
import { NewsCard } from "@/components/news-card";
import { NewsForm } from "@/components/news-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const NEWS_ADMIN_STORAGE_KEY = "ecomundi.news.isAdmin";

export default function NoticiasPage() {
  const { news } = useNews();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [adminError, setAdminError] = useState<string | null>(null);

  const expectedAdminKey = useMemo(() => process.env.NEXT_PUBLIC_NEWS_ADMIN_KEY ?? "", []);

  useEffect(() => {
    try {
      setIsAdmin(localStorage.getItem(NEWS_ADMIN_STORAGE_KEY) === "1");
    } catch {
      setIsAdmin(false);
    }
  }, []);

  const handleAdminLogin = () => {
    const normalized = adminKey.trim();
    if (!expectedAdminKey) {
      setAdminError("Senha ADM não configurada.");
      return;
    }
    if (normalized !== expectedAdminKey) {
      setAdminError("Senha incorreta.");
      return;
    }

    try {
      localStorage.setItem(NEWS_ADMIN_STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setIsAdmin(true);
    setAdminKey("");
    setAdminError(null);
    setIsAdminDialogOpen(false);
  };

  const handleAdminLogout = () => {
    try {
      localStorage.removeItem(NEWS_ADMIN_STORAGE_KEY);
    } catch {
      // ignore
    }
    setIsAdmin(false);
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center" aria-label="ECO MUNDI - Página inicial">
              <Image
                src="/images/logo-eco-mundi-site.png"
                alt="ECO MUNDI Consultoria e Gestão"
                width={659}
                height={184}
                className="h-14 w-auto"
                priority
              />
            </Link>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              
              {isAdmin ? (
                <>
                  <Button variant="outline" onClick={handleAdminLogout}>
                    Sair (ADM)
                  </Button>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Notícia
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="font-serif text-2xl">
                          Publicar Nova Notícia
                        </DialogTitle>
                      </DialogHeader>
                      <NewsForm onSuccess={() => setIsDialogOpen(false)} />
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Entrar (ADM)</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-serif text-2xl">Acesso do Administrador</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="adminKey">Senha</Label>
                        <Input
                          id="adminKey"
                          type="password"
                          value={adminKey}
                          onChange={(e) => {
                            setAdminKey(e.target.value);
                            setAdminError(null);
                          }}
                          placeholder="Digite a senha de administrador"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAdminLogin();
                          }}
                        />
                        {adminError ? (
                          <p className="text-sm text-destructive">{adminError}</p>
                        ) : null}
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsAdminDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleAdminLogin}>Entrar</Button>
                      </div>
                      {!expectedAdminKey ? (
                        <p className="text-xs text-muted-foreground">
                          Defina a variável <span className="font-mono">NEXT_PUBLIC_NEWS_ADMIN_KEY</span> para habilitar o acesso ADM.
                        </p>
                      ) : null}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm tracking-[0.2em] uppercase text-primary font-medium mb-4">
            Blog & Notícias
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-foreground mb-6 text-balance">
            Fique por dentro do Direito Ambiental
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Artigos, análises e atualizações sobre legislação ambiental, ESG, 
            sustentabilidade e as principais novidades do setor.
          </p>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {news.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">
                Nenhuma notícia publicada ainda.
              </p>
              {isAdmin ? (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Publicar Primeira Notícia
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Para publicar notícias, faça login como administrador.
                </p>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((item) => (
                <NewsCard key={item.id} news={item} canManage={isAdmin} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ECO MUNDI Advocacia. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
