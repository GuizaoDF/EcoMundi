"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNews } from "@/contexts/news-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  "Legislação",
  "ESG",
  "Sustentabilidade",
  "Regularização",
  "Due Diligence",
  "Governança",
  "Investimentos",
  "Eventos",
];

interface NewsFormProps {
  onSuccess?: () => void;
}

export function NewsForm({ onSuccess }: NewsFormProps) {
  const { addNews } = useNews();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    category: "",
    imageUrl: "",
  });
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setFormData((prev) => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validação simples
    if (!formData.title || !formData.excerpt || !formData.content || !formData.category) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      setIsSubmitting(false);
      return;
    }

    // Usa imagem padrão se nenhuma foi selecionada
    const imageUrl = formData.imageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop";

    addNews({
      ...formData,
      imageUrl,
      author: formData.author || "Equipe ECO MUNDI",
    });

    // Reset form
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      author: "",
      category: "",
      imageUrl: "",
    });
    setPreviewImage(null);
    setIsSubmitting(false);
    
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div className="space-y-2">
        <Label>Imagem de Capa</Label>
        <div
          className={`relative border-2 border-dashed rounded-lg transition-colors ${
            previewImage ? "border-primary" : "border-border hover:border-primary/50"
          }`}
        >
          {previewImage ? (
            <div className="relative aspect-video">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={removeImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center py-10 cursor-pointer">
              <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-sm text-foreground font-medium mb-1">
                Clique para fazer upload
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG ou WEBP (máx. 5MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          placeholder="Digite o título da notícia"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Categoria *</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Excerpt */}
      <div className="space-y-2">
        <Label htmlFor="excerpt">Resumo *</Label>
        <Textarea
          id="excerpt"
          placeholder="Um breve resumo da notícia (aparecerá no card)"
          value={formData.excerpt}
          onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
          rows={2}
          required
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="content">Conteúdo Completo *</Label>
        <Textarea
          id="content"
          placeholder="Digite o conteúdo completo da notícia..."
          value={formData.content}
          onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
          rows={6}
          required
        />
      </div>

      {/* Author */}
      <div className="space-y-2">
        <Label htmlFor="author">Autor</Label>
        <Input
          id="author"
          placeholder="Nome do autor (opcional)"
          value={formData.author}
          onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
        />
        <p className="text-xs text-muted-foreground">
          Se não informado, será usado &quot;Equipe ECO MUNDI&quot;
        </p>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="min-w-32">
          {isSubmitting ? "Publicando..." : "Publicar Notícia"}
        </Button>
      </div>
    </form>
  );
}
