import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import {
  FaBold,
  FaItalic,
  FaList,
  FaListOl,
  FaCode,
  FaUndoAlt,
  FaRedoAlt,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaLink,
  FaUnlink,
} from 'react-icons/fa';
import './RichTextEditor.css';

const RichTextEditor = ({ value = '', onChange = () => { } }) => {
  const [linkUrl, setLinkUrl] = React.useState('');
  const [openNewTab, setOpenNewTab] = React.useState(false);
  const [showLinkInput, setShowLinkInput] = React.useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-gray-700 hover:text-gray-800 underline cursor-pointer',
          'data-new-tab': false,
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when value prop changes (for edit mode)
  React.useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return <div className="text-gray-900">Loading editor...</div>;

  const buttonClass = (isActive) =>
    `flex items-center justify-center p-2 rounded transition ${isActive
      ? 'bg-gray-800 text-white'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 bg-gray-50 p-3 border-b border-gray-300">
        {/* Text Styling */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={buttonClass(editor.isActive('bold'))}
          title="Bold (Ctrl+B)"
        >
          <FaBold className="text-sm" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={buttonClass(editor.isActive('italic'))}
          title="Italic (Ctrl+I)"
        >
          <FaItalic className="text-sm" />
        </button>

        <div className="w-px bg-gray-300 mx-1"></div>

        {/* Paragraph */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={buttonClass(editor.isActive('paragraph'))}
          title="Paragraph"
        >
          <span className="text-xs font-bold">¶</span>
        </button>

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={buttonClass(editor.isActive('heading', { level: 1 }))}
          title="Heading 1"
        >
          <span className="text-xs font-bold">H1</span>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={buttonClass(editor.isActive('heading', { level: 2 }))}
          title="Heading 2"
        >
          <span className="text-xs font-bold">H2</span>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={buttonClass(editor.isActive('heading', { level: 3 }))}
          title="Heading 3"
        >
          <span className="text-xs font-bold">H3</span>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={buttonClass(editor.isActive('heading', { level: 4 }))}
          title="Heading 4"
        >
          <span className="text-xs font-bold">H4</span>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          className={buttonClass(editor.isActive('heading', { level: 5 }))}
          title="Heading 5"
        >
          <span className="text-xs font-bold">H5</span>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
          className={buttonClass(editor.isActive('heading', { level: 6 }))}
          title="Heading 6"
        >
          <span className="text-xs font-bold">H6</span>
        </button>

        <div className="w-px bg-gray-300 mx-1"></div>

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={buttonClass(editor.isActive('bulletList'))}
          title="Bullet List"
        >
          <FaList className="text-sm" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={buttonClass(editor.isActive('orderedList'))}
          title="Ordered List"
        >
          <FaListOl className="text-sm" />
        </button>

        <div className="w-px bg-gray-300 mx-1"></div>

        {/* Code Block */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={buttonClass(editor.isActive('codeBlock'))}
          title="Code Block"
        >
          <FaCode className="text-sm" />
        </button>

        <div className="w-px bg-gray-300 mx-1"></div>

        {/* Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={buttonClass(editor.isActive({ textAlign: 'left' }))}
          title="Align Left"
        >
          <FaAlignLeft className="text-sm" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={buttonClass(editor.isActive({ textAlign: 'center' }))}
          title="Align Center"
        >
          <FaAlignCenter className="text-sm" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={buttonClass(editor.isActive({ textAlign: 'right' }))}
          title="Align Right"
        >
          <FaAlignRight className="text-sm" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={buttonClass(editor.isActive({ textAlign: 'justify' }))}
          title="Justify"
        >
          <FaAlignJustify className="text-sm" />
        </button>

        <div className="w-px bg-gray-300 mx-1"></div>

        {/* Link */}
        {showLinkInput ? (
          <div className="flex gap-1 items-center flex-wrap">
            <input
              type="text"
              placeholder="Enter URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-800"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  editor.chain().focus().setLink({ href: linkUrl, target: openNewTab ? '_blank' : null }).run();
                  setLinkUrl('');
                  setOpenNewTab(false);
                  setShowLinkInput(false);
                } else if (e.key === 'Escape') {
                  setShowLinkInput(false);
                }
              }}
              autoFocus
            />
            <label className="flex items-center gap-1 text-xs whitespace-nowrap">
              <input
                type="checkbox"
                checked={openNewTab}
                onChange={(e) => setOpenNewTab(e.target.checked)}
                className="w-4 h-4"
              />
              <span>New Tab</span>
            </label>
            <button
              type="button"
              onClick={() => {
                if (linkUrl) {
                  editor.chain().focus().setLink({ href: linkUrl, target: openNewTab ? '_blank' : null }).run();
                  setLinkUrl('');
                  setOpenNewTab(false);
                  setShowLinkInput(false);
                }
              }}
              className="px-2 py-1 bg-gray-800 text-white rounded text-xs font-semibold hover:bg-black"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLinkInput(false);
                setLinkUrl('');
                setOpenNewTab(false);
              }}
              className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-black"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                setShowLinkInput(true);
                setLinkUrl('');
                setOpenNewTab(false);
              }}
              className={buttonClass(editor.isActive('link'))}
              title="Add Link"
            >
              <FaLink className="text-sm" />
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().unsetLink().run()}
              disabled={!editor.isActive('link')}
              className={buttonClass(false)}
              title="Remove Link"
            >
              <FaUnlink className="text-sm" />
            </button>
          </>
        )}

        <div className="w-px bg-gray-300 mx-1"></div>

        {/* Undo/Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className={buttonClass(false)}
          title="Undo (Ctrl+Z)"
        >
          <FaUndoAlt className="text-sm" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className={buttonClass(false)}
          title="Redo (Ctrl+Y)"
        >
          <FaRedoAlt className="text-sm" />
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none focus:outline-none px-4 py-3 min-h-40 bg-white"
      />
    </div>
  );
};

export default RichTextEditor;
