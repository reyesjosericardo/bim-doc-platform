'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { useEffect } from 'react';

interface Props {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
}

export function RichTextEditor({ value, onChange, disabled = false }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: value,
    editable: !disabled,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes (e.g. after LLM generation)
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) return null;

  const btn = (active: boolean, onClick: () => void, title: string, label: React.ReactNode) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
        active
          ? 'bg-brand-600 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className={`border rounded-lg overflow-hidden ${disabled ? 'opacity-60' : 'border-gray-300 focus-within:border-brand-500'}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-gray-200 bg-gray-50">
        {btn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), 'Negrita', <strong>B</strong>)}
        {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), 'Cursiva', <em>I</em>)}
        {btn(editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), 'Subrayado', <span className="underline">U</span>)}
        <div className="w-px h-4 bg-gray-300 mx-1" />
        {btn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), 'Lista con viñetas', '≡')}
        {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), 'Lista numerada', '1.')}
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button
          type="button"
          title="Deshacer"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="px-2 py-1 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30"
        >
          ↩
        </button>
        <button
          type="button"
          title="Rehacer"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="px-2 py-1 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30"
        >
          ↪
        </button>
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none px-3 py-2 min-h-[80px] text-gray-800 focus:outline-none [&_.ProseMirror]:outline-none"
      />
    </div>
  );
}
