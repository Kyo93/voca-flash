import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { Markdown } from 'tiptap-markdown'
import { useTranslation } from 'react-i18next'

interface MarkdownStorage {
  markdown: {
    getMarkdown: () => string
  }
}

function getMarkdown(editor: Editor): string {
  const storage = editor.storage as Partial<MarkdownStorage>
  return storage.markdown?.getMarkdown() ?? editor.getText()
}

interface RichNoteEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

const MenuButton = ({ 
  onClick, 
  isActive = false, 
  disabled = false, 
  title, 
  icon,
  className = ""
}: { 
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  icon: string
  className?: string
}) => (
  <button
    onClick={(e) => {
      e.preventDefault()
      onClick()
    }}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-lg transition-all active:scale-90 flex items-center justify-center ${
      isActive 
        ? 'bg-primary text-on-primary shadow-sm' 
        : 'hover:bg-primary/10 text-on-surface-variant hover:text-primary'
    } ${disabled ? 'opacity-30 cursor-not-allowed' : ''} ${className}`}
  >
    <span className="material-symbols-outlined text-[20px]">{icon}</span>
  </button>
)

export default function RichNoteEditor({ content, onChange, placeholder }: RichNoteEditorProps) {
  const { t } = useTranslation()
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        underline: false,
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: placeholder || t('editor.placeholder'),
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
        tightListClass: 'tight',
        bulletListMarker: '-',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(getMarkdown(editor))
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[300px] p-8 text-xl leading-relaxed font-normal text-on-surface bg-surface-container-lowest/50',
      },
    },
  })

  if (!editor) return null

  return (
    <div className="flex flex-col bg-surface rounded-3xl overflow-hidden border border-outline-variant/10 sun-drenched-shadow-lg group transition-all focus-within:ring-2 focus-within:ring-primary/20">
      {/* Gmail-style Premium Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-3 bg-surface-container-low border-b border-outline-variant/10 backdrop-blur-md sticky top-0 z-20">
        
        {/* History Group */}
        <div className="flex items-center bg-surface-container-lowest/50 rounded-xl p-1 mr-2 border border-outline-variant/5">
          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title={t('editor.toolbar.undo')}
            icon="undo"
          />
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title={t('editor.toolbar.redo')}
            icon="redo"
          />
        </div>

        {/* Text Style Group */}
        <div className="flex items-center bg-surface-container-lowest/50 rounded-xl p-1 mr-2 border border-outline-variant/5">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title={t('editor.toolbar.bold')}
            icon="format_bold"
            className="font-bold"
          />
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title={t('editor.toolbar.italic')}
            icon="format_italic"
          />
          <MenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title={t('editor.toolbar.underline')}
            icon="format_underlined"
          />
          <MenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title={t('editor.toolbar.strikethrough')}
            icon="format_strikethrough"
          />
        </div>

        {/* Lists & Alignment Group */}
        <div className="flex items-center bg-surface-container-lowest/50 rounded-xl p-1 mr-2 border border-outline-variant/5">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title={t('editor.toolbar.bulletList')}
            icon="format_list_bulleted"
          />
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title={t('editor.toolbar.numberedList')}
            icon="format_list_numbered"
          />
          <div className="w-px h-4 bg-outline-variant/20 mx-1" />
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title={t('editor.toolbar.alignLeft')}
            icon="format_align_left"
          />
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title={t('editor.toolbar.alignCenter')}
            icon="format_align_center"
          />
        </div>

        {/* Color Group */}
        <div className="flex items-center bg-surface-container-lowest/50 rounded-xl p-1 mr-2 border border-outline-variant/5">
          <div className="flex items-center gap-1.5 px-2">
            {[
              { color: 'var(--color-error)', labelKey: 'editor.colors.red' },
              { color: 'var(--color-success)', labelKey: 'editor.colors.green' },
              { color: 'var(--color-tertiary)', labelKey: 'editor.colors.blue' },
              { color: 'var(--color-primary)', labelKey: 'editor.colors.amber' },
              { color: 'var(--color-secondary)', labelKey: 'editor.colors.purple' }
            ].map((preset) => (
              <button
                key={preset.color}
                onClick={() => editor.chain().focus().setColor(preset.color).run()}
                className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-125 active:scale-90 ${
                  editor.isActive('textStyle', { color: preset.color }) ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-white/10'
                }`}
                style={{ backgroundColor: preset.color }}
                title={t('editor.toolbar.colorText', { color: t(preset.labelKey) })}
              />
            ))}
            <button
              onClick={() => editor.chain().focus().unsetColor().run()}
              className="ml-1 p-1.5 hover:bg-primary/10 text-on-surface-variant rounded-lg transition-all"
              title={t('editor.toolbar.resetColor')}
            >
              <span className="material-symbols-outlined text-[18px]">format_color_reset</span>
            </button>
          </div>
        </div>

        {/* Utility Group */}
        <div className="flex items-center bg-surface-container-lowest/50 rounded-xl p-1 ml-auto border border-outline-variant/5">
          <MenuButton
            onClick={() => {
              const url = window.prompt(t('editor.linkPrompt'), editor.getAttributes('link').href || '')
              if (url === '') {
                editor.chain().focus().extendMarkRange('link').unsetLink().run()
              } else if (url) {
                editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
              }
            }}
            isActive={editor.isActive('link')}
            title={t('editor.toolbar.link')}
            icon="link"
          />
          <MenuButton
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            title={t('editor.toolbar.clearFormatting')}
            icon="format_clear"
          />
        </div>
      </div>

      <div 
        className="relative flex-1 bg-surface-container-lowest/30 cursor-text"
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent editor={editor} className="h-full" />
        <div className="absolute top-6 right-8 text-[10px] font-black text-on-surface-variant/10 uppercase tracking-[0.2em] pointer-events-none select-none italic">
          {t('common.draftingMode')}
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-6 py-2 bg-surface-container-low border-t border-outline-variant/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/40">
            {t('editor.status.characters', { count: getMarkdown(editor).length })}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/40">
            {t('editor.status.words', { count: getMarkdown(editor).split(/\s+/).filter(Boolean).length })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${editor.isFocused ? 'bg-primary animate-pulse' : 'bg-on-surface-variant/20'}`} />
          <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/40">
            {editor.isFocused ? t('editor.status.editing') : t('editor.status.saved')}
          </span>
        </div>
      </div>
    </div>
  )
}
