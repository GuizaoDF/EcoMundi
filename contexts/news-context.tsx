"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  author: string;
  date: string;
  category: string;
}

interface NewsContextType {
  news: NewsItem[];
  addNews: (news: Omit<NewsItem, "id" | "date">) => void;
  deleteNews: (id: string) => void;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

// Notícias iniciais de demonstração
const initialNews: NewsItem[] = [
  {
    id: "1",
    title: "Nova Legislação Ambiental: O que Muda em 2026",
    excerpt: "Análise completa das mudanças na legislação ambiental brasileira e seus impactos para empresas.",
    content: "A nova legislação ambiental traz mudanças significativas para o setor empresarial. Entre as principais alterações estão novos requisitos de licenciamento, metas de sustentabilidade e obrigações de relatórios ESG. Empresas de todos os portes precisam se adequar às novas exigências até o final do ano.",
    imageUrl: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?q=80&w=800&auto=format&fit=crop",
    author: "Equipe ECO MUNDI",
    date: "15 de Abril, 2026",
    category: "Legislação",
  },
  {
    id: "2",
    title: "ESG: Tendências e Oportunidades para 2026",
    excerpt: "Conheça as principais tendências em ESG e como sua empresa pode se beneficiar.",
    content: "O mercado de ESG continua em expansão, com investidores cada vez mais exigentes quanto às práticas sustentáveis das empresas. Neste artigo, exploramos as principais tendências para 2026 e como as organizações podem se posicionar estrategicamente.",
    imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=800&auto=format&fit=crop",
    author: "Equipe ECO MUNDI",
    date: "10 de Abril, 2026",
    category: "ESG",
  },
  {
    id: "3",
    title: "Regularização Fundiária: Guia Completo",
    excerpt: "Entenda o processo de regularização fundiária e os passos necessários para sua propriedade.",
    content: "A regularização fundiária é um processo fundamental para garantir a segurança jurídica de propriedades. Neste guia, explicamos passo a passo como realizar a regularização, os documentos necessários e os prazos envolvidos.",
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop",
    author: "Equipe ECO MUNDI",
    date: "5 de Abril, 2026",
    category: "Regularização",
  },
];

export function NewsProvider({ children }: { children: ReactNode }) {
  const [news, setNews] = useState<NewsItem[]>(initialNews);

  const addNews = (newNews: Omit<NewsItem, "id" | "date">) => {
    const newsItem: NewsItem = {
      ...newNews,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };
    setNews((prev) => [newsItem, ...prev]);
  };

  const deleteNews = (id: string) => {
    setNews((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <NewsContext.Provider value={{ news, addNews, deleteNews }}>
      {children}
    </NewsContext.Provider>
  );
}

export function useNews() {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error("useNews must be used within a NewsProvider");
  }
  return context;
}
