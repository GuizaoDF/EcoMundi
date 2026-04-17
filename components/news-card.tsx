"use client";

import { Calendar, User, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewsItem, useNews } from "@/contexts/news-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface NewsCardProps {
  news: NewsItem;
  canManage?: boolean;
}

export function NewsCard({ news, canManage = false }: NewsCardProps) {
  const { deleteNews } = useNews();

  return (
    <article className="group bg-card rounded-lg border border-border overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
      {/* Image */}
      <div className="aspect-[16/10] overflow-hidden relative">
        <img
          src={news.imageUrl}
          alt={news.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
            <Tag className="w-3 h-3" />
            {news.category}
          </span>
        </div>
        {/* Delete button */}
        {canManage && (
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="icon" variant="destructive" className="h-8 w-8">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir notícia?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. A notícia será removida permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteNews(news.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-serif text-xl font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {news.title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
          {news.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {news.date}
          </span>
          <span className="inline-flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {news.author}
          </span>
        </div>
      </div>
    </article>
  );
}
