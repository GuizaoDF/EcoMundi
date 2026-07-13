"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { useEffect, useRef, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Unlink,
  Undo,
  Redo,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
        active
          ? "bg-[#0f3d2e] text-white"
          : "text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
      }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="mx-1 h-6 w-px bg-[#E6DED0]" />;
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const contentLoaded = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "min-h-[380px] px-4 py-3 text-sm leading-relaxed outline-none",
      },
    },
  });

  // Load content once it's available (handles async DB load on edit page)
  useEffect(() => {
    if (editor && content && !contentLoaded.current) {
      editor.commands.setContent(content, false);
      contentLoaded.current = true;
    }
  }, [content, editor]);

  const handleAddLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL do link:", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const e = editor;

  return (
    <div className="overflow-hidden rounded-xl border border-[#E6DED0] transition focus-within:border-[#0f3d2e] focus-within:ring-2 focus-within:ring-[#0f3d2e]/10">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[#E6DED0] bg-[#F7F5F0] px-3 py-2">
        <ToolbarButton onClick={() => e.chain().focus().undo().run()} disabled={!e.can().undo()} title="Desfazer (Ctrl+Z)">
          <Undo size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => e.chain().focus().redo().run()} disabled={!e.can().redo()} title="Refazer (Ctrl+Y)">
          <Redo size={15} />
        </ToolbarButton>

        <Sep />

        <ToolbarButton onClick={() => e.chain().focus().toggleHeading({ level: 1 }).run()} active={e.isActive("heading", { level: 1 })} title="Título 1">
          <Heading1 size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => e.chain().focus().toggleHeading({ level: 2 }).run()} active={e.isActive("heading", { level: 2 })} title="Título 2">
          <Heading2 size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => e.chain().focus().toggleHeading({ level: 3 }).run()} active={e.isActive("heading", { level: 3 })} title="Título 3">
          <Heading3 size={15} />
        </ToolbarButton>

        <Sep />

        <ToolbarButton onClick={() => e.chain().focus().toggleBold().run()} active={e.isActive("bold")} title="Negrito (Ctrl+B)">
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => e.chain().focus().toggleItalic().run()} active={e.isActive("italic")} title="Itálico (Ctrl+I)">
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => e.chain().focus().toggleUnderline().run()} active={e.isActive("underline")} title="Sublinhado (Ctrl+U)">
          <UnderlineIcon size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => e.chain().focus().toggleStrike().run()} active={e.isActive("strike")} title="Tachado">
          <Strikethrough size={15} />
        </ToolbarButton>

        <Sep />

        <ToolbarButton onClick={() => e.chain().focus().setTextAlign("left").run()} active={e.isActive({ textAlign: "left" })} title="Alinhar à esquerda">
          <AlignLeft size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => e.chain().focus().setTextAlign("center").run()} active={e.isActive({ textAlign: "center" })} title="Centralizar">
          <AlignCenter size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => e.chain().focus().setTextAlign("right").run()} active={e.isActive({ textAlign: "right" })} title="Alinhar à direita">
          <AlignRight size={15} />
        </ToolbarButton>

        <Sep />

        <ToolbarButton onClick={() => e.chain().focus().toggleBulletList().run()} active={e.isActive("bulletList")} title="Lista com marcadores">
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => e.chain().focus().toggleOrderedList().run()} active={e.isActive("orderedList")} title="Lista numerada">
          <ListOrdered size={15} />
        </ToolbarButton>

        <Sep />

        <ToolbarButton onClick={() => e.chain().focus().toggleBlockquote().run()} active={e.isActive("blockquote")} title="Citação">
          <Quote size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => e.chain().focus().setHorizontalRule().run()} title="Linha divisória">
          <Minus size={15} />
        </ToolbarButton>

        <Sep />

        <ToolbarButton onClick={handleAddLink} active={e.isActive("link")} title="Inserir link">
          <LinkIcon size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => e.chain().focus().unsetLink().run()} disabled={!e.isActive("link")} title="Remover link">
          <Unlink size={15} />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <div className="relative bg-white">
        {e.isEmpty && placeholder && (
          <p className="pointer-events-none absolute left-4 top-3 text-sm text-gray-400">
            {placeholder}
          </p>
        )}
        <div className="prose prose-sm max-w-none prose-headings:text-[#0f3d2e] prose-a:text-[#0f3d2e]">
          <EditorContent editor={e} />
        </div>
      </div>
    </div>
  );
}
