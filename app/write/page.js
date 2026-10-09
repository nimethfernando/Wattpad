'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { 
  PenTool, 
  Save, 
  Sparkles, 
  Eye, 
  Heart, 
  MessageSquare, 
  CheckCircle, 
  BarChart3, 
  BookOpen, 
  Calendar, 
  Plus, 
  Clock, 
  AlertCircle,
  Trash2,
  ArrowUpDown,
  Edit,
  FolderOpen,
  Image as ImageIcon,
  Layers,
  FileText,
  Building2,
  X,
  HelpCircle,
  ChevronRight,
  Hash,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  Quote,
  Wand2,
  Type,
  Sliders,
  Check,
  RefreshCw,
  Sun,
  Moon,
  Coffee,
  Code,
  Upload,
  FileUp,
  Camera
} from 'lucide-react';
import { AGE_RATINGS, AGE_THRESHOLDS } from '@/lib/agePolicy';

export const PRESET_COVERS = [
  {
    title: 'Fantasy Castle',
    genre: 'fantasy',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    emoji: '🏰'
  },
  {
    title: 'Romance Sunset',
    genre: 'romance',
    url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
    emoji: '💖'
  },
  {
    title: 'Cyberpunk Neon',
    genre: 'sci-fi',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    emoji: '🌃'
  },
  {
    title: 'Mystery Fog',
    genre: 'mystery',
    url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80',
    emoji: '🕵️'
  },
  {
    title: 'Dark Academia',
    genre: 'thriller',
    url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
    emoji: '📚'
  },
  {
    title: 'Cosmic Starfield',
    genre: 'adventure',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
    emoji: '🌌'
  }
];

export const CHAPTER_TEMPLATES = [
  {
    id: 'classic_novel',
    name: 'Classic Novel Chapter',
    badge: 'Popular',
    desc: 'Prologue hook, atmospheric description, scene break, dialogue quote & discovery.',
    content: `## Prologue: Before the Shadows Fell

The autumn wind swept through the high stone battlements of the ancient city, carrying with it the cold scent of impending rain.

Elena wrapped her woollen cloak tighter around her trembling shoulders, her eyes fixed on the distant lantern light flickering in the watchtower.

* * *

### ACT I: THE HIDDEN LIBRARY

Deep beneath the royal archives, a chamber had been sealed three centuries ago by the High Council. No key had turned in its bronze lock since the Great Reckoning.

> "True power is never found in the crown, but in the forgotten truths written in the dust."

She reached out her hand, and the ancient bronze mechanism hummed softly to life, awaiting her command.`
  },
  {
    id: 'romance_scene',
    name: 'Romantic Encounter',
    badge: 'Dialogue-Driven',
    desc: 'Emotional character interaction, cozy setting, romantic dialogue callout, and romantic cliffhanger.',
    content: `## Scene 1: The Rainy Cafe on Rue Saint-Honoré

It started with a misplaced umbrella and an apologetic smile under the warm glow of the streetlamps.

> "Excuse me, I believe this belongs to you," he said, holding the silver-handled umbrella with a quiet smile.

Their eyes met, and for a fleeting second, the roar of the bustling evening traffic seemed to fade into complete silence. Neither of them moved to break the spell.

* * *

### LATER THAT EVENING

Neither of them wanted the walk along the river to end. The rain had softened into a gentle mist, wrapping the city in quiet mystery.`
  },
  {
    id: 'mystery_investigation',
    name: 'Mystery & Investigation',
    badge: 'Thrilling',
    desc: 'Crime scene details, forensic timestamp, clue callout, and investigative tension.',
    content: `## 2:43 AM: The Shattered Mirror

The detective stepped carefully across the velvet rug, avoiding the glinting shards of glass scattered across the study floor.

### LOCATION: PENTHOUSE ARCHIVES

The mahogany jewelry box sat completely untouched on the dresser, yet the antique mirror above it was shattered violently from the inside out.

> "Look closely at the strike marks. The blow came from behind the glass, not from inside this room."

He crouched down, retrieving a small silver key with an eagle crest engraved into the head.`
  }
];

// Helper: Process, resize, and compress image file directly from author's device
export function processImageFile(file, maxWidth = 800, maxHeight = 1067, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file selected.'));
    if (!file.type || !file.type.startsWith('image/')) {
      return reject(new Error('Please select an image file (PNG, JPG, JPEG, WEBP).'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Error reading image file from your device.'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image data.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({
          dataUrl,
          name: file.name,
          sizeKb: Math.round((dataUrl.length * 0.75) / 1024)
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Helper: Convert serialized paragraphs into visual WYSIWYG HTML
export function chapterContentToHtml(rawText) {
  if (!rawText || !rawText.trim()) {
    return '<p class="book-paragraph"><br></p>';
  }

  const blocks = rawText.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  const htmlParts = [];

  for (const block of blocks) {
    if (block === '* * *' || block === '---' || block === '***' || block === '— — —' || block === '✦ ✦ ✦') {
      htmlParts.push('<div class="book-scene-break" contenteditable="false"><span class="break-line"></span><span class="break-symbol">✦ ✦ ✦</span><span class="break-line"></span></div>');
    } else if (block.startsWith('## ')) {
      htmlParts.push(`<h2 class="book-subheading">${formatInlineToHtml(block.slice(3))}</h2>`);
    } else if (block.startsWith('### ')) {
      htmlParts.push(`<h3 class="book-section">${formatInlineToHtml(block.slice(4))}</h3>`);
    } else if (block.startsWith('# ')) {
      htmlParts.push(`<h1 class="book-heading">${formatInlineToHtml(block.slice(2))}</h1>`);
    } else if (block.startsWith('> ')) {
      htmlParts.push(`<blockquote class="book-quote">${formatInlineToHtml(block.slice(2))}</blockquote>`);
    } else if (block.startsWith('![') && block.includes('](') && block.endsWith(')')) {
      const match = block.match(/\!\[(.*?)\]\((.*?)\)/);
      if (match) {
        const alt = match[1] || 'Illustration';
        const src = match[2];
        htmlParts.push(`<div class="book-img-box" contenteditable="false"><img src="${src}" alt="${alt}" class="book-img" /><p class="book-caption">${alt}</p></div>`);
      } else {
        htmlParts.push(`<p class="book-paragraph">${formatInlineToHtml(block)}</p>`);
      }
    } else {
      htmlParts.push(`<p class="book-paragraph">${formatInlineToHtml(block)}</p>`);
    }
  }

  return htmlParts.join('\n');
}

function formatInlineToHtml(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

function serializeInlineNode(node) {
  if (!node) return '';
  if (node.nodeType === 3) {
    return node.textContent;
  }
  if (node.nodeType === 1) {
    const tag = node.tagName.toLowerCase();
    if (tag === 'br') return '\n';
    if (tag === 'strong' || tag === 'b') {
      const inner = Array.from(node.childNodes).map(serializeInlineNode).join('');
      return inner.trim() ? `**${inner}**` : '';
    }
    if (tag === 'em' || tag === 'i') {
      const inner = Array.from(node.childNodes).map(serializeInlineNode).join('');
      return inner.trim() ? `*${inner}*` : '';
    }
    if (tag === 'u') {
      const inner = Array.from(node.childNodes).map(serializeInlineNode).join('');
      return inner.trim() ? `<u>${inner}</u>` : '';
    }
    return Array.from(node.childNodes).map(serializeInlineNode).join('');
  }
  return '';
}

// Helper: Convert WYSIWYG DOM back to serialized paragraphs for reader & storage
export function domToChapterContent(element) {
  if (!element) return '';
  const blocks = [];
  const children = element.childNodes;

  for (let i = 0; i < children.length; i++) {
    const node = children[i];

    if (node.nodeType === 3) {
      const text = node.textContent.trim();
      if (text) blocks.push(text);
      continue;
    }

    if (node.nodeType === 1) {
      const tag = node.tagName.toLowerCase();

      // Scene break
      if (node.classList?.contains('book-scene-break') || tag === 'hr') {
        blocks.push('* * *');
        continue;
      }

      // Image box
      if (node.classList?.contains('book-img-box') || tag === 'img') {
        const img = tag === 'img' ? node : node.querySelector('img');
        if (img) {
          const alt = img.getAttribute('alt') || 'Illustration';
          const src = img.getAttribute('src') || '';
          if (src) blocks.push(`![${alt}](${src})`);
        }
        continue;
      }

      // Headings
      if (tag === 'h1') {
        const t = node.textContent.trim();
        if (t) blocks.push(`# ${t}`);
        continue;
      }
      if (tag === 'h2') {
        const t = node.textContent.trim();
        if (t) blocks.push(`## ${t}`);
        continue;
      }
      if (tag === 'h3') {
        const t = node.textContent.trim();
        if (t) blocks.push(`### ${t}`);
        continue;
      }
      if (tag === 'blockquote') {
        const t = node.textContent.trim();
        if (t) blocks.push(`> ${t}`);
        continue;
      }

      // Nested scene break or image
      if (node.querySelector && node.querySelector('.book-scene-break')) {
        blocks.push('* * *');
        continue;
      }
      if (node.querySelector && node.querySelector('.book-img-box')) {
        const img = node.querySelector('img');
        if (img) {
          const alt = img.getAttribute('alt') || 'Illustration';
          const src = img.getAttribute('src') || '';
          if (src) blocks.push(`![${alt}](${src})`);
        }
        continue;
      }

      // Regular paragraph or div
      const inline = serializeInlineNode(node).trim();
      if (inline && inline !== '<br>') {
        blocks.push(inline);
      }
    }
  }

  return blocks.join('\n\n');
}

// Inline token renderer for Reader Preview
function formatInlineText(text) {
  if (!text) return '';
  const tokens = text.split(/(\*\*[\s\S]+?\*\*|\*[\s\S]+?\*)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return <strong key={idx} className="font-extrabold">{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      return <em key={idx} className="italic">{token.slice(1, -1)}</em>;
    }
    return token;
  });
}

// -------------------------------------------------------------
// Visual WYSIWYG Book Editor for Authors & Non-Coders
// -------------------------------------------------------------
export function VisualBookEditor({
  value = '',
  onChange,
  placeholder = 'Write your chapter here...',
  storyTitle = 'Your Story',
  chapterTitle = 'Chapter 1',
  authorName = 'Author',
  minHeight = 'min-h-[420px]'
}) {
  const [activeTab, setActiveTab] = useState('visual'); // 'visual' | 'preview'
  const [isRawMode, setIsRawMode] = useState(false);
  const [showTips, setShowTips] = useState(false);
  
  // Reader preview customization
  const [readerTheme, setReaderTheme] = useState('white'); // 'white' | 'sepia' | 'dark'
  const [readerFontSize, setReaderFontSize] = useState(18); // 16, 18, 20
  const [readerFontFamily, setReaderFontFamily] = useState('serif'); // 'serif' | 'sans'

  // Image modal state
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imgUrl, setImgUrl] = useState('');
  const [imgCaption, setImgCaption] = useState('');

  // Templates modal state
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  const editorRef = useRef(null);
  const isInternalChangeRef = useRef(false);

  // Sync external value changes into editor innerHTML (e.g. templates, resets, chapter switches)
  useEffect(() => {
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }
    if (editorRef.current) {
      const currentContent = domToChapterContent(editorRef.current);
      if (currentContent !== value || !editorRef.current.innerHTML.trim()) {
        editorRef.current.innerHTML = chapterContentToHtml(value);
      }
    }
  }, [value, activeTab]);

  const handleTabChange = (tab) => {
    if (tab === 'preview') {
      if (editorRef.current && !isRawMode) {
        const currentContent = domToChapterContent(editorRef.current);
        if (currentContent !== value && onChange) {
          onChange(currentContent);
        }
      }
    } else if (tab === 'visual') {
      if (editorRef.current && !isRawMode) {
        const domContent = domToChapterContent(editorRef.current);
        if (!editorRef.current.innerHTML.trim() || domContent !== value) {
          editorRef.current.innerHTML = chapterContentToHtml(value);
        }
      }
    }
    setActiveTab(tab);
  };

  const handleEditorInput = () => {
    if (!editorRef.current) return;
    isInternalChangeRef.current = true;
    const serialized = domToChapterContent(editorRef.current);
    if (onChange) {
      onChange(serialized);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
    if (text) {
      const paras = text.split(/\r?\n\r?\n/).filter(p => p.trim());
      if (paras.length > 1) {
        const html = paras.map(p => `<p class="book-paragraph">${p.replace(/\n/g, '<br>')}</p>`).join('');
        document.execCommand('insertHTML', false, html);
      } else {
        document.execCommand('insertText', false, text);
      }
      handleEditorInput();
    }
  };

  const insertHtmlAtCursor = (htmlToInsert) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        document.execCommand('insertHTML', false, htmlToInsert);
        handleEditorInput();
        return;
      }
    }
    editorRef.current.innerHTML += htmlToInsert;
    handleEditorInput();
  };

  const formatCommand = (cmd, val = null) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(cmd, false, val);
    handleEditorInput();
  };

  const insertSubheading = () => {
    insertHtmlAtCursor('<h2 class="book-subheading">Scene Title</h2><p class="book-paragraph"><br></p>');
  };

  const insertSection = () => {
    insertHtmlAtCursor('<h3 class="book-section">LOCATION / TIME / POV</h3><p class="book-paragraph"><br></p>');
  };

  const insertSceneBreak = () => {
    insertHtmlAtCursor('<div class="book-scene-break" contenteditable="false"><span class="break-line"></span><span class="break-symbol">✦ ✦ ✦</span><span class="break-line"></span></div><p class="book-paragraph"><br></p>');
  };

  const insertQuote = () => {
    insertHtmlAtCursor('<blockquote class="book-quote">"Speak your dialogue or thought here..."</blockquote><p class="book-paragraph"><br></p>');
  };

  const handleInsertImageSubmit = (e) => {
    e.preventDefault();
    if (!imgUrl.trim()) return;
    const safeCaption = imgCaption.trim() || 'Illustration';
    insertHtmlAtCursor(`<div class="book-img-box" contenteditable="false"><img src="${imgUrl.trim()}" alt="${safeCaption}" class="book-img" /><p class="book-caption">${safeCaption}</p></div><p class="book-paragraph"><br></p>`);
    setImgUrl('');
    setImgCaption('');
    setImageModalOpen(false);
  };

  const handleApplyTemplate = (tpl) => {
    if (value && value.trim() && !window.confirm('Applying this starter template will replace your current text in this chapter. Continue?')) {
      return;
    }
    isInternalChangeRef.current = false;
    if (onChange) {
      onChange(tpl.content);
    }
    if (editorRef.current) {
      editorRef.current.innerHTML = chapterContentToHtml(tpl.content);
    }
    setTemplateModalOpen(false);
  };

  const handleClearEditor = () => {
    if (window.confirm('Are you sure you want to clear this entire chapter?')) {
      isInternalChangeRef.current = false;
      if (onChange) onChange('');
      if (editorRef.current) {
        editorRef.current.innerHTML = '<p class="book-paragraph"><br></p>';
      }
    }
  };

  // Word count & read time
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Parsed blocks for Live Reader Preview
  const previewBlocks = value.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);

  return (
    <div className="space-y-3">
      {/* 1. Header Navigation: Visual Book Writer vs Live Reader Preview */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => handleTabChange('visual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'visual'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Visual Book Writer</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Reader Preview</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold flex items-center gap-1">
            <span>📝</span> {wordCount.toLocaleString()} words
          </span>
          <span className="hidden sm:inline font-semibold">
            ⏱️ ~{readTimeMinutes} min read
          </span>
          <button
            type="button"
            onClick={() => setShowTips(!showTips)}
            className="text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center gap-1 cursor-pointer text-xs"
            title="Formatting Tips"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Writer Guide</span>
          </button>
        </div>
      </div>

      {/* Guide Banner */}
      {showTips && (
        <div className="p-3.5 bg-brand-500/10 dark:bg-brand-950/40 border border-brand-500/20 rounded-2xl text-xs space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between font-bold text-brand-700 dark:text-brand-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Non-Coder Book Writing Guide
            </span>
            <button type="button" onClick={() => setShowTips(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 text-[11px] text-slate-600 dark:text-slate-300">
            <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
              <p className="font-bold text-slate-800 dark:text-slate-200">1. Subheadings & Sections</p>
              <p className="mt-0.5">Click <strong className="text-brand-600">+ Subheading</strong> to title a new scene with an orange accent bar, or <strong className="text-brand-600">+ Section</strong> for timestamps/POV.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
              <p className="font-bold text-slate-800 dark:text-slate-200">2. Scene Breaks (✦ ✦ ✦)</p>
              <p className="mt-0.5">Click <strong className="text-amber-600">✦ Scene Break</strong> to insert an ornamental novel divider between major scenes.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
              <p className="font-bold text-slate-800 dark:text-slate-200">3. Interactive Comments</p>
              <p className="mt-0.5">Press Enter to start a new paragraph. Every paragraph automatically becomes an interactive comment balloon for your readers!</p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW A: VISUAL BOOK WRITER (Always mounted to preserve DOM state & cursor) */}
      <div className={activeTab === 'visual' ? 'space-y-3' : 'hidden'}>
          {/* Visual Toolbar */}
          <div className="p-2.5 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
            {/* Story Elements (1-Click Insertion) */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={insertSubheading}
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-brand-50 dark:hover:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-bold text-xs border border-slate-200 dark:border-slate-600 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Insert Visual Subheading (Scene Title)"
              >
                <span className="w-1.5 h-3.5 bg-brand-500 rounded-full inline-block"></span>
                <span>+ Subheading</span>
              </button>

              <button
                type="button"
                onClick={insertSection}
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-600 shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
                title="Insert Section Header (Location, Time or POV)"
              >
                <Hash className="w-3 h-3 opacity-60 text-slate-500" />
                <span>+ Section</span>
              </button>

              <button
                type="button"
                onClick={insertSceneBreak}
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold text-xs border border-slate-200 dark:border-slate-600 shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
                title="Insert Visual Ornamental Divider (✦ ✦ ✦)"
              >
                <span>✦ Scene Break</span>
              </button>

              <button
                type="button"
                onClick={insertQuote}
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-600 shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
                title="Insert Dialogue Callout or Character Quote"
              >
                <Quote className="w-3 h-3 text-brand-500" />
                <span>Quote</span>
              </button>

              <button
                type="button"
                onClick={() => setImageModalOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-600 shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
                title="Insert Book Illustration with Caption"
              >
                <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                <span>+ Image</span>
              </button>

              <span className="h-5 w-px bg-slate-300 dark:bg-slate-600 mx-1"></span>

              {/* Text Styling */}
              <button
                type="button"
                onClick={() => formatCommand('bold')}
                className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-black text-xs border border-slate-200 dark:border-slate-600 shadow-2xs flex items-center justify-center transition-all cursor-pointer"
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => formatCommand('italic')}
                className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 italic font-serif text-xs border border-slate-200 dark:border-slate-600 shadow-2xs flex items-center justify-center transition-all cursor-pointer"
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => formatCommand('underline')}
                className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs border border-slate-200 dark:border-slate-600 shadow-2xs flex items-center justify-center transition-all cursor-pointer"
                title="Underline (Ctrl+U)"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Templates & Actions */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setTemplateModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all hover:brightness-105 cursor-pointer"
                title="1-Click Starter Story Templates"
              >
                <Wand2 className="w-3 h-3" />
                <span>Templates</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isRawMode && editorRef.current) {
                    const serialized = domToChapterContent(editorRef.current);
                    if (onChange) onChange(serialized);
                  } else if (isRawMode && editorRef.current) {
                    editorRef.current.innerHTML = chapterContentToHtml(value);
                  }
                  setIsRawMode(!isRawMode);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-600 shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
                title="Toggle Plain Text / Markdown Mode"
              >
                <Code className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isRawMode ? 'Visual' : 'Raw'}</span>
              </button>

              <button
                type="button"
                onClick={handleClearEditor}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Clear Chapter"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Visual Content Canvas */}
          {isRawMode ? (
            <textarea
              rows={16}
              value={value}
              onChange={(e) => {
                isInternalChangeRef.current = false;
                if (onChange) onChange(e.target.value);
              }}
              placeholder={placeholder}
              className="w-full p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-brand-500 font-mono text-sm leading-relaxed text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          ) : (
            <div className="relative">
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleEditorInput}
                onPaste={handlePaste}
                data-placeholder={placeholder}
                className={`w-full p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-brand-500/50 font-serif text-base sm:text-lg leading-relaxed shadow-xs text-slate-900 dark:text-slate-100 ${minHeight} book-manuscript-canvas`}
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 px-1">
            <span>💡 Double Enter starts a new paragraph. Formatting happens visually without typing code.</span>
            <span>All changes are automatically synced for readers!</span>
          </div>
        </div>

      {/* VIEW B: LIVE READER PREVIEW */}
      <div className={activeTab === 'preview' ? 'space-y-4' : 'hidden'}>
          {/* Reader Preference Bar */}
          <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Theme:</span>
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setReaderTheme('white')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    readerTheme === 'white' ? 'bg-slate-100 text-slate-900 font-black shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  <Sun className="w-3 h-3 text-amber-500" /> Light
                </button>
                <button
                  type="button"
                  onClick={() => setReaderTheme('sepia')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    readerTheme === 'sepia' ? 'bg-[#f4ebe1] text-[#4a3525] font-black shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  <Coffee className="w-3 h-3 text-[#9c6a46]" /> Sepia
                </button>
                <button
                  type="button"
                  onClick={() => setReaderTheme('dark')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    readerTheme === 'dark' ? 'bg-slate-800 text-white font-black shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  <Moon className="w-3 h-3 text-indigo-400" /> Dark
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setReaderFontFamily('serif')}
                  className={`px-2 py-0.5 rounded text-xs font-serif ${readerFontFamily === 'serif' ? 'bg-brand-500 text-white font-bold' : 'text-slate-500'}`}
                >
                  Serif
                </button>
                <button
                  type="button"
                  onClick={() => setReaderFontFamily('sans')}
                  className={`px-2 py-0.5 rounded text-xs font-sans ${readerFontFamily === 'sans' ? 'bg-brand-500 text-white font-bold' : 'text-slate-500'}`}
                >
                  Sans
                </button>
              </div>

              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setReaderFontSize(Math.max(14, readerFontSize - 2))}
                  className="px-2 py-0.5 rounded font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  A-
                </button>
                <span className="px-1 font-mono text-[11px] font-bold">{readerFontSize}px</span>
                <button
                  type="button"
                  onClick={() => setReaderFontSize(Math.min(24, readerFontSize + 2))}
                  className="px-2 py-0.5 rounded font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  A+
                </button>
              </div>
            </div>
          </div>

          {/* Reader Paper Simulation */}
          <div
            className={`rounded-3xl p-6 sm:p-12 border transition-colors shadow-xl ${
              readerTheme === 'white'
                ? 'bg-white text-slate-900 border-slate-200'
                : readerTheme === 'sepia'
                ? 'bg-[#fbf7ee] text-[#4a3525] border-[#ebdccb]'
                : 'bg-slate-950 text-slate-100 border-slate-800'
            }`}
          >
            {/* Chapter Header */}
            <header className="mb-10 text-center space-y-2 pb-6 border-b border-black/10 dark:border-white/10">
              <span className="text-xs uppercase font-extrabold tracking-widest text-brand-600 dark:text-brand-400">
                {chapterTitle || 'Chapter'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">{storyTitle || 'Untitled Story'}</h2>
              <p className="text-xs opacity-70">
                By {authorName} • Live Reader View
              </p>
            </header>

            {/* Paragraphs */}
            {previewBlocks.length === 0 ? (
              <div className="text-center py-12 text-slate-400 italic text-sm">
                Chapter is currently empty. Switch back to "Visual Book Writer" to begin writing!
              </div>
            ) : (
              <div
                className={`space-y-6 ${readerFontFamily === 'serif' ? 'font-serif' : 'font-sans'}`}
                style={{ fontSize: `${readerFontSize}px`, lineHeight: 1.8 }}
              >
                {previewBlocks.map((rawText, idx) => {
                  const isSceneBreak = rawText === '---' || rawText === '***' || rawText === '* * *' || rawText === '— — —' || rawText === '✦ ✦ ✦';

                  if (isSceneBreak) {
                    return (
                      <div key={idx} className="relative group py-6 my-4 flex items-center justify-center gap-4 text-brand-500/80 select-none">
                        <span className="h-px w-20 sm:w-32 bg-gradient-to-r from-transparent via-slate-400/50 to-transparent"></span>
                        <span className="font-serif text-sm tracking-widest text-slate-400">✦ ✦ ✦</span>
                        <span className="h-px w-20 sm:w-32 bg-gradient-to-r from-transparent via-slate-400/50 to-transparent"></span>
                        <span className="absolute right-[-10px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-[10px] font-extrabold bg-brand-500 text-white px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> 0
                        </span>
                      </div>
                    );
                  }

                  if (rawText.startsWith('## ')) {
                    return (
                      <div key={idx} className="relative group p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all mt-7 mb-2">
                        <h3 className="text-xl sm:text-2xl font-bold text-brand-600 dark:text-brand-400 tracking-tight flex items-center gap-2.5 font-sans">
                          <span className="w-1.5 h-5 bg-brand-500 rounded-full inline-block shrink-0"></span>
                          <span>{formatInlineText(rawText.slice(3))}</span>
                        </h3>
                        <span className="absolute right-[-10px] top-3 opacity-0 group-hover:opacity-100 text-[10px] font-extrabold bg-brand-500 text-white px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> 0
                        </span>
                      </div>
                    );
                  }

                  if (rawText.startsWith('### ')) {
                    return (
                      <div key={idx} className="relative group p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all mt-5 mb-1">
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 font-sans">
                          {formatInlineText(rawText.slice(4))}
                        </h4>
                        <span className="absolute right-[-10px] top-2 opacity-0 group-hover:opacity-100 text-[10px] font-extrabold bg-brand-500 text-white px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> 0
                        </span>
                      </div>
                    );
                  }

                  if (rawText.startsWith('> ')) {
                    return (
                      <div key={idx} className="relative group p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all my-4">
                        <blockquote className="border-l-4 border-brand-500 pl-4 py-2 italic font-serif bg-brand-500/5 rounded-r-xl leading-relaxed">
                          {formatInlineText(rawText.slice(2))}
                        </blockquote>
                        <span className="absolute right-[-10px] top-2 opacity-0 group-hover:opacity-100 text-[10px] font-extrabold bg-brand-500 text-white px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> 0
                        </span>
                      </div>
                    );
                  }

                  if (rawText.startsWith('![') && rawText.includes('](') && rawText.endsWith(')')) {
                    const match = rawText.match(/\!\[(.*?)\]\((.*?)\)/);
                    if (match) {
                      return (
                        <div key={idx} className="relative group p-2 my-6 text-center">
                          <img src={match[2]} alt={match[1]} className="max-h-96 rounded-2xl mx-auto shadow-md border object-cover" />
                          {match[1] && match[1].toLowerCase() !== 'illustration' && (
                            <p className="text-xs opacity-70 italic mt-2">{match[1]}</p>
                          )}
                          <span className="absolute right-[-10px] top-2 opacity-0 group-hover:opacity-100 text-[10px] font-extrabold bg-brand-500 text-white px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> 0
                          </span>
                        </div>
                      );
                    }
                  }

                  return (
                    <div key={idx} className="relative group p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                      <p className="leading-relaxed">
                        {formatInlineText(rawText)}
                      </p>
                      <span className="absolute right-[-10px] top-2 opacity-0 group-hover:opacity-100 text-[10px] font-extrabold bg-brand-500 text-white px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> 0
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      {/* MODAL: ADD ILLUSTRATION */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-500" />
                <h3 className="font-black text-base">Insert Book Illustration</h3>
              </div>
              <button type="button" onClick={() => setImageModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Device Upload Button */}
            <div className="space-y-1.5">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                1. Upload from Your Device:
              </span>
              <label className="flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 border-dashed border-brand-400/80 dark:border-brand-500/60 bg-brand-50/50 dark:bg-brand-950/20 hover:bg-brand-50 dark:hover:bg-brand-950/40 cursor-pointer transition-all group">
                <Upload className="w-4 h-4 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-brand-700 dark:text-brand-300">
                  Select image from computer / phone
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const res = await processImageFile(file, 900, 700, 0.85);
                        setImgUrl(res.dataUrl);
                        if (!imgCaption) setImgCaption(file.name.replace(/\.[^/.]+$/, ''));
                      } catch (err) {
                        alert(err.message);
                      }
                    }
                  }}
                />
              </label>
            </div>

            {/* 2. Preset Artwork */}
            <div>
              <span className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">2. Or Pick Preset Artwork:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { title: 'Ancient Citadel', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80' },
                  { title: 'Enchanted Forest', url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80' },
                  { title: 'Neon Cybercity', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80' }
                ].map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setImgUrl(item.url);
                      setImgCaption(item.title);
                    }}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-left transition-all cursor-pointer group"
                  >
                    <img src={item.url} alt={item.title} className="w-full aspect-video object-cover rounded-lg mb-1" />
                    <span className="text-[10px] font-bold block truncate">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleInsertImageSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">3. Or Paste Direct Image Link</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imgUrl}
                  onChange={(e) => setImgUrl(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Caption / Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. The Moonlit Gateway"
                  value={imgCaption}
                  onChange={(e) => setImgCaption(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setImageModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 cursor-pointer"
                >
                  Insert Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: STARTER STORY TEMPLATES */}
      {templateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-brand-500" />
                <div>
                  <h3 className="font-black text-base">Starter Book Templates</h3>
                  <p className="text-xs text-slate-400">Choose a 1-click template to start your chapter with professional structure.</p>
                </div>
              </div>
              <button type="button" onClick={() => setTemplateModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {CHAPTER_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-brand-500 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">{tpl.name}</h4>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
                        {tpl.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{tpl.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="shrink-0 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 cursor-pointer transition-all hover:scale-105"
                  >
                    Apply Template
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setTemplateModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Component Styles */}
      <style jsx global>{`
        .book-manuscript-canvas {
          font-variant-ligatures: common-ligatures;
        }
        .book-manuscript-canvas:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
          display: block;
        }
        .book-subheading {
          font-size: 1.35rem;
          font-weight: 800;
          color: #ea580c;
          border-left: 4px solid #ea580c;
          padding-left: 0.75rem;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }
        .book-section {
          font-size: 0.8rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #64748b;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .book-scene-break {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin: 1.75rem 0;
          user-select: none;
        }
        .book-scene-break .break-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, transparent, #cbd5e1, transparent);
        }
        .book-scene-break .break-symbol {
          font-family: serif;
          font-size: 0.875rem;
          letter-spacing: 0.25em;
          color: #ea580c;
          font-weight: bold;
        }
        .book-quote {
          border-left: 4px solid #ea580c;
          padding: 0.75rem 1rem;
          margin: 1.25rem 0;
          font-style: italic;
          background: rgba(234, 88, 12, 0.05);
          border-radius: 0 0.75rem 0.75rem 0;
        }
        .book-img-box {
          margin: 1.5rem 0;
          text-align: center;
          user-select: none;
        }
        .book-img {
          max-height: 22rem;
          border-radius: 1rem;
          margin: 0 auto;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          display: block;
        }
        .book-caption {
          font-size: 0.75rem;
          font-style: italic;
          color: #94a3b8;
          margin-top: 0.5rem;
        }
        .book-paragraph {
          margin-bottom: 1.15rem;
          line-height: 1.85;
        }
      `}</style>
    </div>
  );
}

export default function AuthorStudio() {
  const router = useRouter();
  const { genres, stories, setStories, deleteStory, user, publishStory, addChapterToStory, updateStory, openBankDetailsModal, t } = useApp();
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'stories' | 'analytics'

  // Author stories
  const myStories = stories.filter(s => s.authorUsername === user?.username || s.author === user?.name);

  // Studio Mode: Create a brand new story OR serialize another chapter to existing story
  const [editorMode, setEditorMode] = useState('new_story'); // 'new_story' | 'add_chapter'
  const [selectedExistingStoryId, setSelectedExistingStoryId] = useState('');
  const [existingChapterNumber, setExistingChapterNumber] = useState(2);
  const [existingChapterTitle, setExistingChapterTitle] = useState('');
  const [existingChapterContent, setExistingChapterContent] = useState('');
  const [existingPages, setExistingPages] = useState([
    {
      pageNumber: 1,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      caption: 'Page 1',
      text: ''
    }
  ]);
  const [existingPublishSuccess, setExistingPublishSuccess] = useState(false);
  const [existingPublishing, setExistingPublishing] = useState(false);

  // Story Form State (New Story)
  const [storyTitle, setStoryTitle] = useState('');
  const [storyDescription, setStoryDescription] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('fantasy');
  const [contentType, setContentType] = useState('story'); // 'story' | 'picture_book'
  const [ageRating, setAgeRating] = useState('13+');
  const [maturity, setMaturity] = useState('everyone');
  const [language, setLanguage] = useState('en');
  const [copyright, setCopyright] = useState('All Rights Reserved');
  const [tagsInput, setTagsInput] = useState('magic, serialized, mystery');
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80');
  const [coverUploadTab, setCoverUploadTab] = useState('device'); // 'device' | 'presets' | 'url'
  const [deviceCoverInfo, setDeviceCoverInfo] = useState(null); // { name, sizeKb }

  const handleDeviceCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await processImageFile(file, 800, 1067, 0.85);
      setCoverUrl(res.dataUrl);
      setDeviceCoverInfo({ name: file.name, sizeKb: res.sizeKb });
    } catch (err) {
      alert(err.message || 'Failed to process image file from device.');
    }
  };

  const updatePageImageFromDevice = async (index, file, isExisting = false, isModal = false) => {
    if (!file) return;
    try {
      const res = await processImageFile(file, 1200, 900, 0.85);
      if (isModal) {
        setModalPages(prev => prev.map((item, i) => i === index ? { ...item, image: res.dataUrl } : item));
      } else if (isExisting) {
        setExistingPages(prev => prev.map((item, i) => i === index ? { ...item, image: res.dataUrl } : item));
      } else {
        setPages(prev => prev.map((item, i) => i === index ? { ...item, image: res.dataUrl } : item));
      }
    } catch (err) {
      alert(err.message || 'Failed to upload page image.');
    }
  };

  // Modal State: "+ Add Chapter" from My Serials tab
  const [addChapterModalOpen, setAddChapterModalOpen] = useState(false);
  const [targetStoryForChapter, setTargetStoryForChapter] = useState(null);
  const [modalChapterNumber, setModalChapterNumber] = useState(2);
  const [modalChapterTitle, setModalChapterTitle] = useState('');
  const [modalChapterContent, setModalChapterContent] = useState('');
  const [modalPages, setModalPages] = useState([]);
  const [modalPublishSuccess, setModalPublishSuccess] = useState(false);
  const [modalPublishing, setModalPublishing] = useState(false);

  // Picture Book Pages (One by one image uploading)
  const [pages, setPages] = useState([
    {
      pageNumber: 1,
      image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      caption: 'The Journey Begins',
      text: 'Deep in the heart of the enchanted forest, a tiny spark of starlight fell to the mossy ground.'
    }
  ]);

  const addPage = () => {
    setPages(prev => [
      ...prev,
      {
        pageNumber: prev.length + 1,
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        caption: `Page ${prev.length + 1}`,
        text: ''
      }
    ]);
  };

  const removePage = (indexToRemove) => {
    if (pages.length <= 1) {
      alert('Picture books must have at least 1 page.');
      return;
    }
    setPages(prev => prev.filter((_, idx) => idx !== indexToRemove).map((p, idx) => ({ ...p, pageNumber: idx + 1 })));
  };

  const updatePage = (index, field, value) => {
    setPages(prev => prev.map((p, idx) => idx === index ? { ...p, [field]: value } : p));
  };

  // Chapter Content (For standard text novels with multi-chapter drafting)
  const [draftChapters, setDraftChapters] = useState([
    { id: 1, number: 1, title: '', content: '' }
  ]);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [publishStatus, setPublishStatus] = useState('published'); // 'draft' | 'published' | 'scheduled'
  const [autoSaved, setAutoSaved] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const activeDraftChapter = draftChapters[activeChapterIndex] || draftChapters[0];

  const handleChapterTitleChange = (val) => {
    setDraftChapters(prev => prev.map((ch, idx) => idx === activeChapterIndex ? { ...ch, title: val } : ch));
  };

  const handleChapterContentChange = (val) => {
    setDraftChapters(prev => prev.map((ch, idx) => idx === activeChapterIndex ? { ...ch, content: val } : ch));
    setAutoSaved(true);
    setTimeout(() => setAutoSaved(false), 2000);
  };

  const handleAddNewChapter = () => {
    const nextNum = draftChapters.length + 1;
    const newChap = {
      id: Date.now(),
      number: nextNum,
      title: `Chapter ${nextNum}: `,
      content: ''
    };
    setDraftChapters(prev => [...prev, newChap]);
    setActiveChapterIndex(draftChapters.length);
  };

  const handleRemoveChapter = (indexToRemove) => {
    if (draftChapters.length <= 1) return;
    setDraftChapters(prev => prev.filter((_, idx) => idx !== indexToRemove).map((ch, idx) => ({ ...ch, number: idx + 1 })));
    if (activeChapterIndex >= indexToRemove && activeChapterIndex > 0) {
      setActiveChapterIndex(prev => prev - 1);
    }
  };

  const handlePublish = (e) => {
    e.preventDefault();
    if (contentType === 'story') {
      const hasContent = draftChapters.some(c => c.content && c.content.trim());
      if (!storyTitle.trim() || !hasContent) {
        alert('Please provide a Story Title and Chapter Content.');
        return;
      }
    }

    if (contentType === 'picture_book' && (!storyTitle.trim() || pages.length === 0)) {
      alert('Please provide a Story Title and at least one Illustrated Page.');
      return;
    }

    const slug = storyTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const minAge = AGE_THRESHOLDS[ageRating] || 13;
    const targetAudience = ageRating === '3+' 
      ? 'Toddlers & Early Readers' 
      : ageRating === '7+' 
      ? 'Children & Family' 
      : ageRating === '13+' 
      ? 'Young Adult' 
      : ageRating === '16+' 
      ? 'Older Teens & Adults' 
      : 'Mature Adults (18+)';

    let publishedChapters = [];
    if (contentType === 'story') {
      publishedChapters = draftChapters.map((ch, idx) => {
        const paragraphs = (ch.content || '').split('\n\n').filter(p => p.trim() !== '').map((text, pIdx) => ({
          id: pIdx + 1,
          text: text.trim(),
          comments: []
        }));
        return {
          id: ch.id || (Date.now() + idx + 1),
          number: idx + 1,
          title: ch.title.trim() || `Chapter ${idx + 1}`,
          publishedAt: new Date().toISOString().split('T')[0],
          reads: 1,
          votes: 1,
          paragraphs,
          pages: []
        };
      });
    } else {
      publishedChapters = [
        {
          id: Date.now() + 1,
          number: 1,
          title: "Illustrated Edition",
          publishedAt: new Date().toISOString().split('T')[0],
          reads: 1,
          votes: 1,
          paragraphs: [],
          pages: pages
        }
      ];
    }

    const newStory = {
      id: Date.now(),
      slug,
      title: storyTitle,
      author: user?.name || "Author",
      authorUsername: user?.username || "author",
      authorAvatar: user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      genre: genres.find(g => g.slug === selectedGenre)?.name || "Fantasy",
      genreSlug: selectedGenre,
      cover: coverUrl,
      description: storyDescription || "A thrilling serialized narrative updated weekly.",
      status: "ongoing",
      language,
      maturity: ageRating === '18+' ? 'mature' : maturity,
      ageRating,
      minAge,
      contentType,
      targetAudience,
      isOriginal: user?.role === 'admin',
      isEditorsPick: false,
      isTrending: true,
      reads: 1,
      votes: 1,
      commentsCount: 0,
      lastUpdated: "Just now",
      tags: tagsInput.split(',').map(s => s.trim()),
      copyright,
      chapters: publishedChapters
    };

    publishStory(newStory);
    setPublishSuccess(true);
    setTimeout(() => {
      router.push(`/story/${slug}`);
    }, 1500);
  };

  const handleReorderChapters = (storyId) => {
    const target = stories.find(s => s.id === storyId);
    if (target) {
      const updated = {
        ...target,
        chapters: [...target.chapters].reverse()
      };
      updateStory(updated);
      alert('Chapter order updated!');
    }
  };

  const handleOpenAddChapterModal = (story) => {
    setTargetStoryForChapter(story);
    const nextNum = (story.chapters?.length || 0) + 1;
    setModalChapterNumber(nextNum);
    setModalChapterTitle(`Chapter ${nextNum}: `);
    setModalChapterContent('');
    setModalPages([
      {
        pageNumber: 1,
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        caption: `Chapter ${nextNum} - Page 1`,
        text: ''
      }
    ]);
    setModalPublishSuccess(false);
    setAddChapterModalOpen(true);
  };

  const handleModalPublishChapter = async (e) => {
    e.preventDefault();
    if (!targetStoryForChapter) return;

    if (targetStoryForChapter.contentType === 'picture_book') {
      if (modalPages.length === 0) {
        alert('Please add at least one page for this picture book chapter.');
        return;
      }
    } else {
      if (!modalChapterContent.trim()) {
        alert('Please provide chapter content.');
        return;
      }
    }

    setModalPublishing(true);
    const paragraphs = modalChapterContent.split('\n\n').filter(p => p.trim() !== '').map((text, idx) => ({
      id: idx + 1,
      text: text.trim(),
      comments: []
    }));

    const chapterNum = Number(modalChapterNumber) || ((targetStoryForChapter.chapters?.length || 0) + 1);
    const newChapter = {
      id: Date.now(),
      number: chapterNum,
      title: modalChapterTitle.trim() || `Chapter ${chapterNum}`,
      publishedAt: new Date().toISOString().split('T')[0],
      reads: 1,
      votes: 0,
      paragraphs: targetStoryForChapter.contentType === 'picture_book' ? [] : paragraphs,
      pages: targetStoryForChapter.contentType === 'picture_book' ? modalPages : []
    };

    await addChapterToStory(targetStoryForChapter.id, newChapter);
    setModalPublishing(false);
    setModalPublishSuccess(true);
    setTimeout(() => {
      setModalPublishSuccess(false);
      setAddChapterModalOpen(false);
      router.push(`/read/${targetStoryForChapter.slug}?chapter=${chapterNum}`);
    }, 1200);
  };

  const handleExistingStoryPublish = async (e) => {
    e.preventDefault();
    const currentStory = myStories.find(s => String(s.id) === String(selectedExistingStoryId)) || myStories[0];
    if (!currentStory) {
      alert('Please select a book to add a chapter to.');
      return;
    }

    if (currentStory.contentType === 'picture_book') {
      if (existingPages.length === 0) {
        alert('Please provide at least one page.');
        return;
      }
    } else {
      if (!existingChapterContent.trim()) {
        alert('Please provide chapter content.');
        return;
      }
    }

    setExistingPublishing(true);
    const chapterNum = Number(existingChapterNumber) || ((currentStory.chapters?.length || 0) + 1);
    const paragraphs = existingChapterContent.split('\n\n').filter(p => p.trim() !== '').map((text, idx) => ({
      id: idx + 1,
      text: text.trim(),
      comments: []
    }));

    const newChapter = {
      id: Date.now(),
      number: chapterNum,
      title: existingChapterTitle.trim() || `Chapter ${chapterNum}`,
      publishedAt: new Date().toISOString().split('T')[0],
      reads: 1,
      votes: 0,
      paragraphs: currentStory.contentType === 'picture_book' ? [] : paragraphs,
      pages: currentStory.contentType === 'picture_book' ? existingPages : []
    };

    await addChapterToStory(currentStory.id, newChapter);
    setExistingPublishing(false);
    setExistingPublishSuccess(true);
    setTimeout(() => {
      setExistingPublishSuccess(false);
      router.push(`/read/${currentStory.slug}?chapter=${chapterNum}`);
    }, 1400);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Author Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Author Studio & Dashboard</span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Create & Manage Serial Stories</h1>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none w-full sm:w-auto pb-1">
            <button 
              onClick={() => setActiveTab('editor')}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'editor' 
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" /> Studio Editor
            </button>
            <button 
              onClick={() => setActiveTab('stories')}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'stories' 
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" /> My Serials ({myStories.length})
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'analytics' 
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Creator Analytics
            </button>
            <button 
              type="button"
              onClick={() => openBankDetailsModal()}
              className="shrink-0 flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 shadow-sm"
              title="Add or update your bank payout account for 90% royalties"
            >
              <Building2 className="w-3.5 h-3.5" /> 
              <span>{user?.bankDetails ? `Bank (${user.bankDetails.bankName})` : '+ Add Bank Details'}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: STUDIO EDITOR */}
        {activeTab === 'editor' && (
          <div className="mt-8 space-y-6">
            {/* Mode Switcher: Write New Book vs Add Chapter to Existing Serial */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setEditorMode('new_story')}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  editorMode === 'new_story'
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" /> + Write New Book
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditorMode('add_chapter');
                  if (!selectedExistingStoryId && myStories.length > 0) {
                    const firstStory = myStories[0];
                    setSelectedExistingStoryId(firstStory.id);
                    const nextNum = (firstStory.chapters?.length || 0) + 1;
                    setExistingChapterNumber(nextNum);
                    setExistingChapterTitle(`Chapter ${nextNum}: `);
                  }
                }}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  editorMode === 'add_chapter'
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <Plus className="w-3.5 h-3.5" /> + Add Chapter to Existing Book ({myStories.length > 0 ? myStories.length : '0 published'})
              </button>
            </div>

            {editorMode === 'add_chapter' ? (
              myStories.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 max-w-xl mx-auto shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <h4 className="font-black text-lg">No Published Books Found Yet</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-6 leading-relaxed">
                    You currently have 0 published books in your catalog. You can write and draft multiple chapters in the <strong>"+ Write New Book"</strong> tab right now, or publish Chapter 1 to launch your book and serialize Chapter 2 here!
                  </p>
                  <button
                    type="button"
                    onClick={() => setEditorMode('new_story')}
                    className="px-6 py-2.5 rounded-full bg-brand-500 text-white text-xs font-bold hover:bg-brand-600 cursor-pointer shadow-md shadow-brand-500/20"
                  >
                    ← Back to Write New Book
                  </button>
                </div>
              ) : (
                (() => {
                  const currentStory = myStories.find(s => String(s.id) === String(selectedExistingStoryId)) || myStories[0];
                  return (
                    <form onSubmit={handleExistingStoryPublish} className="grid lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-8 space-y-5">
                        {existingPublishSuccess && (
                          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-500" /> Chapter {existingChapterNumber} published successfully! Redirecting...
                          </div>
                        )}

                        {/* Story Selection & Chapter Info */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                              Select Book to Continue Serializing
                            </label>
                            <select
                              value={currentStory.id}
                              onChange={(e) => {
                                const st = myStories.find(s => String(s.id) === String(e.target.value));
                                setSelectedExistingStoryId(e.target.value);
                                if (st) {
                                  const nextNum = (st.chapters?.length || 0) + 1;
                                  setExistingChapterNumber(nextNum);
                                  setExistingChapterTitle(`Chapter ${nextNum}: `);
                                }
                              }}
                              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm font-bold outline-none border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                            >
                              {myStories.map(s => (
                                <option key={s.id} value={s.id}>
                                  {s.title} ({s.chapters?.length || 0} Chapters)
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 flex items-center gap-4">
                            <img src={currentStory.cover} alt={currentStory.title} className="w-12 aspect-[3/4] object-cover rounded-lg border shadow-xs shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-black uppercase text-brand-600">{currentStory.genre}</span>
                              <h4 className="font-black text-sm text-slate-900 dark:text-white truncate">{currentStory.title}</h4>
                              <p className="text-xs text-slate-500">Currently: {currentStory.chapters?.length || 0} Chapters • Appending Chapter {existingChapterNumber}</p>
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-12 gap-3">
                            <div className="sm:col-span-3">
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Chapter No.
                              </label>
                              <input 
                                type="number" 
                                min="1"
                                value={existingChapterNumber}
                                onChange={(e) => setExistingChapterNumber(e.target.value)}
                                required
                                className="w-full text-base font-bold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                              />
                            </div>
                            <div className="sm:col-span-9">
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Chapter Title
                              </label>
                              <input 
                                type="text" 
                                placeholder={`e.g. Chapter ${existingChapterNumber}: Into the Shadows`}
                                value={existingChapterTitle}
                                onChange={(e) => setExistingChapterTitle(e.target.value)}
                                required
                                className="w-full text-sm font-bold px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Chapter Body or Picture Book Pages */}
                        {currentStory.contentType === 'picture_book' ? (
                          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b">
                              <span className="text-xs font-bold text-slate-400 uppercase">Pages ({existingPages.length})</span>
                              <button
                                type="button"
                                onClick={() => setExistingPages(prev => [...prev, { pageNumber: prev.length + 1, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', caption: `Page ${prev.length + 1}`, text: '' }])}
                                className="px-3 py-1 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add Page
                              </button>
                            </div>
                            {existingPages.map((p, idx) => (
                              <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2 border">
                                <div className="flex items-center justify-between text-xs font-bold">
                                  <span>Page {idx + 1}</span>
                                  {existingPages.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => setExistingPages(prev => prev.filter((_, i) => i !== idx))}
                                      className="text-rose-500 hover:underline"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="url"
                                    placeholder="Image URL or upload from device"
                                    value={p.image}
                                    onChange={(e) => setExistingPages(prev => prev.map((item, i) => i === idx ? { ...item, image: e.target.value } : item))}
                                    className="flex-1 p-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                  />
                                  <label className="shrink-0 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-brand-50 dark:hover:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center gap-1 cursor-pointer border border-slate-200 dark:border-slate-600" title="Upload Page Image from Device">
                                    <Upload className="w-3 h-3" />
                                    <span className="hidden sm:inline">Upload</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => updatePageImageFromDevice(idx, e.target.files?.[0], true, false)}
                                    />
                                  </label>
                                </div>
                                <textarea
                                  rows={2}
                                  placeholder="Narration / dialogue..."
                                  value={p.text}
                                  onChange={(e) => setExistingPages(prev => prev.map((item, i) => i === idx ? { ...item, text: e.target.value } : item))}
                                  className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                Chapter Body (Paragraphs & Scenes)
                              </span>
                              <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">
                                Visual Book Writer Active
                              </span>
                            </div>
                            <VisualBookEditor 
                              value={existingChapterContent}
                              onChange={setExistingChapterContent}
                              placeholder="Write your next serialized chapter here. Use the visual buttons above to add subheadings, scene breaks, and dialogue without needing any code!"
                              storyTitle={currentStory.title}
                              chapterTitle={existingChapterTitle || `Chapter ${existingChapterNumber}`}
                              authorName={user?.name || "Author"}
                            />
                          </div>
                        )}

                        {/* Publish Chapter Button */}
                        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                          <p className="text-xs text-slate-400">
                            Appends directly to <span className="font-bold text-slate-800 dark:text-slate-200">"{currentStory.title}"</span>
                          </p>
                          <button 
                            type="submit"
                            disabled={existingPublishing}
                            className="flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                          >
                            <Sparkles className="w-4 h-4" /> {existingPublishing ? 'Publishing...' : `Publish Chapter ${existingChapterNumber}`}
                          </button>
                        </div>
                      </div>

                      {/* Right Sidebar */}
                      <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Book Details</h3>
                          <div className="w-32 aspect-[3/4] rounded-xl overflow-hidden border shadow-sm mx-auto">
                            <img src={currentStory.cover} alt={currentStory.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="space-y-1 text-center">
                            <h4 className="font-black text-sm">{currentStory.title}</h4>
                            <p className="text-xs text-brand-600 font-bold">{currentStory.genre}</p>
                            <p className="text-[11px] text-slate-400">{currentStory.chapters?.length || 0} Existing Chapters • {(currentStory.reads || 0).toLocaleString()} Reads</p>
                          </div>
                          <div className="pt-2 border-t text-xs text-slate-500 space-y-1">
                            <p><span className="font-bold">Maturity:</span> {currentStory.maturity}</p>
                            <p><span className="font-bold">Age Rating:</span> {currentStory.ageRating || '13+'}</p>
                            <p><span className="font-bold">Status:</span> {currentStory.status}</p>
                          </div>
                        </div>
                      </div>
                    </form>
                  );
                })()
              )
            ) : (
              <form onSubmit={handlePublish} className="grid lg:grid-cols-12 gap-8">
                {/* Writing Workspace */}
                <div className="lg:col-span-8 space-y-5">
                  {publishSuccess && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500" /> Story and Chapter published successfully! Redirecting...
                    </div>
                  )}

                  {/* Story Title & Chapters */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5">
                    {/* Serialization Guidance Banner */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-brand-500/10 via-amber-500/10 to-transparent border border-brand-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-start sm:items-center gap-2.5 text-slate-700 dark:text-slate-300">
                        <BookOpen className="w-4 h-4 text-brand-500 shrink-0 mt-0.5 sm:mt-0" />
                        <div>
                          <strong className="text-brand-600 dark:text-brand-400">Where to add Chapter 2:</strong> You can add and draft Chapter 2 right here using the <strong>"+ Add Chapter 2"</strong> button below, or publish Chapter 1 first to launch your serial and add subsequent chapters anytime!
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddNewChapter}
                        className="shrink-0 px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> + Add Chapter {draftChapters.length + 1}
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Story Title
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. Crown of Thorns & Neon"
                        value={storyTitle}
                        onChange={(e) => setStoryTitle(e.target.value)}
                        required
                        className="w-full text-xl font-black px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                    </div>

                    {/* Chapter Tabs & Selector (For Text Novels) */}
                    {contentType === 'story' && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Book Chapters ({draftChapters.length})
                          </label>
                          <span className="text-[11px] text-slate-400">
                            Editing Chapter {activeChapterIndex + 1} of {draftChapters.length}
                          </span>
                        </div>

                        {/* Interactive Chapter Stepper */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                          {draftChapters.map((ch, idx) => (
                            <div
                              key={ch.id || idx}
                              onClick={() => setActiveChapterIndex(idx)}
                              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0 border ${
                                activeChapterIndex === idx
                                  ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-400'
                              }`}
                            >
                              <span>Chapter {ch.number || idx + 1}</span>
                              {ch.title && (
                                <span className={`max-w-[120px] truncate text-[11px] ${activeChapterIndex === idx ? 'text-white/80' : 'text-slate-400'}`}>
                                  {ch.title.replace(/^Chapter\s+\d+:\s*/i, '')}
                                </span>
                              )}
                              {draftChapters.length > 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveChapter(idx);
                                  }}
                                  className={`ml-1 hover:text-rose-300 p-0.5 rounded-full ${activeChapterIndex === idx ? 'text-white/80' : 'text-slate-400'}`}
                                  title="Remove this draft chapter"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={handleAddNewChapter}
                            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> + Add Chapter {draftChapters.length + 1}
                          </button>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Chapter {activeChapterIndex + 1} Title
                          </label>
                          <input 
                            type="text" 
                            placeholder={`e.g. Chapter ${activeChapterIndex + 1}: The Discovery`}
                            value={activeDraftChapter?.title || ''}
                            onChange={(e) => handleChapterTitleChange(e.target.value)}
                            className="w-full text-sm font-bold px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Canvas: Picture Book vs Novel */}
                  {contentType === 'story' ? (
                    /* Text Novel Canvas with Auto-Save */
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Chapter {activeChapterIndex + 1} Body (Paragraphs & Scenes)
                        </span>
                        <div className="flex items-center gap-2 text-xs">
                          {autoSaved ? (
                            <span className="text-emerald-500 font-semibold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Auto-saved draft
                            </span>
                          ) : (
                            <span className="text-slate-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> Auto-save active
                            </span>
                          )}
                        </div>
                      </div>

                      <VisualBookEditor 
                        key={`draft-chapter-${activeChapterIndex}`}
                        value={activeDraftChapter?.content || ''}
                        onChange={handleChapterContentChange}
                        placeholder={`Begin drafting Chapter ${activeChapterIndex + 1} here. Use the visual buttons above to add subheadings, scene breaks, and dialogue without needing any code!`}
                        storyTitle={storyTitle || "Untitled Story"}
                        chapterTitle={activeDraftChapter?.title || `Chapter ${activeChapterIndex + 1}`}
                        authorName={user?.name || "Author"}
                      />
                    </div>
                  ) : (
                /* Picture Book / Comic Page Builder */
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Illustrated Pages ({pages.length})
                      </span>
                      <p className="text-xs text-slate-500">Upload or provide images and narration for each page in sequence.</p>
                    </div>
                    <button
                      type="button"
                      onClick={addPage}
                      className="px-3 py-1.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Page
                    </button>
                  </div>

                  <div className="space-y-6">
                    {pages.map((p, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-brand-600 dark:text-brand-400">
                            Page {idx + 1}
                          </span>
                          {pages.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePage(idx)}
                              className="text-xs text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> Remove Page
                            </button>
                          )}
                        </div>

                        <div className="grid sm:grid-cols-12 gap-3">
                          <div className="sm:col-span-4 aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                            <img src={p.image} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>

                          <div className="sm:col-span-8 space-y-2">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Page Illustration (URL or Device)</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="url"
                                  value={p.image}
                                  onChange={(e) => updatePage(idx, 'image', e.target.value)}
                                  placeholder="https://... or upload from device"
                                  className="flex-1 p-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                <label className="shrink-0 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center gap-1 cursor-pointer border border-slate-200 dark:border-slate-700" title="Upload from Device">
                                  <Upload className="w-3 h-3" />
                                  <span className="hidden sm:inline">Upload</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => updatePageImageFromDevice(idx, e.target.files?.[0], false, false)}
                                  />
                                </label>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Caption (Optional)</label>
                              <input
                                type="text"
                                value={p.caption}
                                onChange={(e) => updatePage(idx, 'caption', e.target.value)}
                                placeholder="e.g. In the deep enchanted forest"
                                className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Narration / Page Text</label>
                              <textarea
                                rows={2}
                                value={p.text}
                                onChange={(e) => updatePage(idx, 'text', e.target.value)}
                                placeholder="Story dialogue or narrative text for this page..."
                                className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addPage}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-500 hover:text-brand-500 hover:border-brand-500 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Append Another Page
                  </button>
                </div>
              )}

              {/* Publishing Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <select 
                    value={publishStatus}
                    onChange={(e) => setPublishStatus(e.target.value)}
                    className="w-full sm:w-auto p-2.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none cursor-pointer text-slate-900 dark:text-white"
                  >
                    <option value="published">Publish Immediately</option>
                    <option value="draft">Save as Draft</option>
                    <option value="scheduled">Schedule Release</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> {draftChapters.length > 1 ? `Publish Book & All ${draftChapters.length} Chapters` : (t.publishChapter || 'Publish Story & Chapter 1')}
                </button>
              </div>
            </div>

            {/* Right: Story Settings Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Story Settings</h3>

                {/* Content Format Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Story Format</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setContentType('story')}
                      className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                        contentType === 'story'
                          ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Text Novel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentType('picture_book')}
                      className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                        contentType === 'picture_book'
                          ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Picture Book</span>
                    </button>
                  </div>
                </div>

                {/* Age Rating (DOB Protection) */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Age Rating (DOB Protection)
                  </label>
                  <select 
                    value={ageRating}
                    onChange={(e) => {
                      const newRating = e.target.value;
                      setAgeRating(newRating);
                      if (newRating === '18+') {
                        setMaturity('mature');
                      } else {
                        setMaturity('everyone');
                      }
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-brand-600 dark:text-brand-400 outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="3+">👶 3+ (Kids & Toddlers)</option>
                    <option value="7+">🧒 7+ (Children & Family)</option>
                    <option value="13+">🧑 13+ (Teens & YA)</option>
                    <option value="16+">🧑‍🎤 16+ (Upper YA)</option>
                    <option value="18+">🔥 18+ (Mature / Adult Only)</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {ageRating === '18+' 
                      ? '⚠️ Restricted to users with verified DOB 18+. Completely hidden from minors.' 
                      : `Accessible to readers verified aged ${ageRating} and above.`}
                  </p>
                </div>

                {/* Cover Image with Device Upload, Presets & URL */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-500">Book Cover Image</label>
                    <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">
                      Device Upload
                    </span>
                  </div>

                  {/* Mode Switcher Tabs */}
                  <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setCoverUploadTab('device')}
                      className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        coverUploadTab === 'device'
                          ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>My Device</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverUploadTab('presets')}
                      className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        coverUploadTab === 'presets'
                          ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span>🎨 Presets</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverUploadTab('url')}
                      className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        coverUploadTab === 'url'
                          ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span>🔗 Link URL</span>
                    </button>
                  </div>

                  {/* TAB 1: UPLOAD FROM DEVICE */}
                  {coverUploadTab === 'device' && (
                    <div className="space-y-2">
                      <label className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-brand-400/80 dark:border-brand-500/60 bg-brand-50/50 dark:bg-brand-950/20 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-all cursor-pointer group text-center">
                        <Upload className="w-6 h-6 text-brand-600 dark:text-brand-400 mb-1.5 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-brand-700 dark:text-brand-300">
                          Upload Cover from Your Device
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5">
                          Tap to choose photo from computer or phone (PNG, JPG, WEBP)
                        </span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleDeviceCoverUpload} 
                        />
                      </label>
                      {deviceCoverInfo && (
                        <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                          <span className="flex items-center gap-1 truncate">
                            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{deviceCoverInfo.name}</span>
                          </span>
                          <span className="text-[10px] opacity-75 shrink-0">~{deviceCoverInfo.sizeKb} KB</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: PRESETS */}
                  {coverUploadTab === 'presets' && (
                    <div>
                      <span className="block text-[11px] font-bold text-slate-400 mb-1.5">
                        🎨 Click a preset cover to apply:
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {PRESET_COVERS.map((preset, idx) => {
                          const isSelected = coverUrl === preset.url;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setCoverUrl(preset.url);
                                setDeviceCoverInfo(null);
                                if (preset.genre && genres.some(g => g.slug === preset.genre)) {
                                  setSelectedGenre(preset.genre);
                                }
                              }}
                              className={`group relative aspect-[3/4] rounded-xl overflow-hidden border text-left transition-all cursor-pointer ${
                                isSelected 
                                  ? 'ring-2 ring-brand-500 border-transparent shadow-md scale-[1.02]' 
                                  : 'border-slate-200 dark:border-slate-700 hover:border-brand-400 opacity-80 hover:opacity-100'
                              }`}
                            >
                              <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-1.5">
                                <span className="text-[9px] font-black text-white leading-tight flex items-center gap-0.5 truncate">
                                  <span>{preset.emoji}</span> {preset.title}
                                </span>
                              </div>
                              {isSelected && (
                                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px] shadow-sm">
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: CUSTOM URL */}
                  {coverUploadTab === 'url' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Paste Direct Image URL</label>
                      <input 
                        type="url" 
                        value={coverUrl}
                        onChange={(e) => {
                          setCoverUrl(e.target.value);
                          setDeviceCoverInfo(null);
                        }}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                    </div>
                  )}

                  {/* Active Cover Preview Card */}
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
                    <div className="w-14 aspect-[3/4] rounded-xl overflow-hidden border shrink-0 bg-slate-200 dark:bg-slate-700 shadow-xs relative">
                      <img src={coverUrl} alt="Cover preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Book Cover Preview</span>
                      <p className="text-xs font-black truncate text-slate-800 dark:text-slate-200">
                        {deviceCoverInfo?.name || PRESET_COVERS.find(p => p.url === coverUrl)?.title || "Custom Story Cover"}
                      </p>
                      <label className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer">
                        <Upload className="w-3 h-3" />
                        <span>Change from Device</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleDeviceCoverUpload} 
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Description / Hook</label>
                  <textarea 
                    rows={3}
                    placeholder="Hook readers in 2-3 sentences..."
                    value={storyDescription}
                    onChange={(e) => setStoryDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                {/* Genre Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Primary Genre</label>
                  <select 
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                  >
                    {genres.map(g => (
                      <option key={g.id} value={g.slug}>{g.name}</option>
                    ))}
                  </select>
                </div>

                {/* Maturity Rating */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Maturity Flag</label>
                  <select 
                    value={maturity}
                    onChange={(e) => setMaturity(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                  >
                    <option value="everyone">Everyone (All Ages)</option>
                    <option value="mature">Mature 18+ (Age Gate Triggered)</option>
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Tags & Tropes (comma-separated)</label>
                  <input 
                    type="text" 
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g. fantasy, romance, enemies-to-lovers"
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                {/* Copyright */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Copyright License</label>
                  <select 
                    value={copyright}
                    onChange={(e) => setCopyright(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                  >
                    <option value="All Rights Reserved">All Rights Reserved</option>
                    <option value="Creative Commons (CC-BY)">Creative Commons</option>
                    <option value="Public Domain">Public Domain</option>
                  </select>
                </div>
              </div>

              {/* Guidelines helper card */}
              <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <h4 className="font-bold text-amber-800 dark:text-amber-300">Creator Standards</h4>
                  <p className="text-amber-700 dark:text-amber-400 leading-relaxed">
                    Serialized stories that maintain consistent weekly release schedules receive featured carousels and eligibility for Golden Quill awards.
                  </p>
                </div>
              </div>
            </div>
          </form>
          )}
        </div>
      )}

        {/* TAB 2: MY SERIALS (Manage, Delete, Reorder Chapters) */}
        {activeTab === 'stories' && (
          <div className="mt-8 space-y-6">
            <h3 className="font-black text-lg">Manage Your Published Serials</h3>

            {myStories.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <h4 className="font-bold">No serial stories yet</h4>
                <p className="text-xs text-slate-500 mt-1">Use the Studio Editor tab to write your very first chapter.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myStories.map(s => (
                  <div key={s.id} className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 shadow-sm">
                    <div className="flex items-center gap-4">
                      <img src={s.cover} alt={s.title} className="w-14 aspect-[3/4] object-cover rounded-xl shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-brand-600 uppercase">{s.genre}</span>
                        <h4 className="font-black text-base text-slate-900 dark:text-white line-clamp-1">{s.title}</h4>
                        <p className="text-xs text-slate-400">{s.chapters.length} Chapters • {s.reads.toLocaleString()} Reads • {s.votes.toLocaleString()} Votes</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
                      <button 
                        onClick={() => handleOpenAddChapterModal(s)}
                        className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> + Add Chapter {s.chapters.length + 1}
                      </button>
                      <button 
                        onClick={() => handleReorderChapters(s.id)}
                        className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" /> Reorder Chapters
                      </button>
                      <Link 
                        href={`/story/${s.slug}`}
                        className="flex-1 md:flex-initial text-center px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold hover:bg-slate-200"
                      >
                        View Public Page
                      </Link>
                      <button 
                        onClick={() => deleteStory(s.id)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                        title="Delete Story"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CREATOR ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="mt-8 space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-400 font-bold">Total Chapter Reads</span>
                <p className="text-2xl sm:text-3xl font-black mt-2">142,500</p>
                <span className="text-[11px] text-emerald-500 font-bold mt-1 block">↑ 18.4% this week</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-400 font-bold">Total Votes Received</span>
                <p className="text-2xl sm:text-3xl font-black mt-2">9,840</p>
                <span className="text-[11px] text-emerald-500 font-bold mt-1 block">↑ 9.2% this week</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-400 font-bold">Inline Annotations</span>
                <p className="text-2xl sm:text-3xl font-black mt-2">1,320</p>
                <span className="text-[11px] text-emerald-500 font-bold mt-1 block">94 new today</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-400 font-bold">Follower Base</span>
                <p className="text-2xl sm:text-3xl font-black mt-2">4,890</p>
                <span className="text-[11px] text-emerald-500 font-bold mt-1 block">↑ 310 this month</span>
              </div>
            </div>

            {/* Reads Over Time Timeline Chart (Scope 4: reads over time) */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Reads Over Time</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Daily reading traffic and chapter completion velocity (Past 7 Days)</p>
                </div>
                <span className="self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                  Weekly Reads: 37,700
                </span>
              </div>

              <div className="pt-4 flex items-end justify-between gap-3 h-44 border-b border-slate-100 dark:border-slate-800 pb-2">
                {[
                  { day: "Mon", reads: 3200, height: "45%" },
                  { day: "Tue", reads: 4800, height: "65%" },
                  { day: "Wed", reads: 4100, height: "55%" },
                  { day: "Thu", reads: 5600, height: "78%" },
                  { day: "Fri", reads: 6900, height: "92%" },
                  { day: "Sat", reads: 7200, height: "100%" },
                  { day: "Sun", reads: 5900, height: "80%" }
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded shadow">
                      {item.reads.toLocaleString()}
                    </div>
                    <div 
                      className="w-full max-w-[44px] bg-gradient-to-t from-brand-600 to-amber-500 rounded-t-xl group-hover:brightness-110 transition-all cursor-pointer shadow-sm"
                      style={{ height: item.height }}
                    />
                    <span className="text-[11px] font-bold text-slate-400">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Audience Geography & Top Chapters */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Audience Country Breakdown</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-bold pb-1">
                      <span>United States</span>
                      <span>42%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: '42%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-bold pb-1">
                      <span>India</span>
                      <span>28%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: '28%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-bold pb-1">
                      <span>Georgia</span>
                      <span>15%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-bold pb-1">
                      <span>United Kingdom & Other</span>
                      <span>15%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Performing Chapters */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Top Performing Chapters</h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  <div className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-bold">The Shadow Alchemist • Chapter 1</p>
                      <p className="text-[11px] text-slate-400">The Whispering Observatory</p>
                    </div>
                    <span className="font-bold text-brand-600">45,200 reads</span>
                  </div>
                  <div className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-bold">The Shadow Alchemist • Chapter 2</p>
                      <p className="text-[11px] text-slate-400">Pact of Mercury and Bone</p>
                    </div>
                    <span className="font-bold text-brand-600">38,900 reads</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* 4. MODAL: ADD CHAPTER TO SERIAL STORY */}
      {addChapterModalOpen && targetStoryForChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img 
                  src={targetStoryForChapter.cover} 
                  alt={targetStoryForChapter.title} 
                  className="w-12 aspect-[3/4] object-cover rounded-lg border shadow-sm shrink-0"
                />
                <div>
                  <span className="text-[10px] font-black uppercase text-brand-600 tracking-wider">
                    Add Serial Chapter
                  </span>
                  <h3 className="text-lg font-black line-clamp-1">{targetStoryForChapter.title}</h3>
                  <p className="text-xs text-slate-400">
                    Currently: {targetStoryForChapter.chapters?.length || 0} Chapters • Appending Chapter {modalChapterNumber}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setAddChapterModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalPublishSuccess ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black">Chapter {modalChapterNumber} Published!</h4>
                <p className="text-xs text-slate-500">Your new chapter is now live for all readers in the Avora Library.</p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Link 
                    href={`/read/${targetStoryForChapter.slug}?chapter=${modalChapterNumber}`}
                    className="px-6 py-2.5 rounded-full bg-brand-500 text-white font-bold text-xs hover:bg-brand-600"
                  >
                    Read Chapter {modalChapterNumber} →
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleModalPublishChapter} className="space-y-5">
                <div className="grid sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Chapter Number
                    </label>
                    <input 
                      type="number" 
                      min="1"
                      value={modalChapterNumber}
                      onChange={(e) => setModalChapterNumber(e.target.value)}
                      required
                      className="w-full text-base font-bold px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-9">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Chapter Title
                    </label>
                    <input 
                      type="text" 
                      placeholder={`e.g. Chapter ${modalChapterNumber}: Pact of Mercury`}
                      value={modalChapterTitle}
                      onChange={(e) => setModalChapterTitle(e.target.value)}
                      required
                      className="w-full text-sm font-bold px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {targetStoryForChapter.contentType === 'picture_book' ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-400 uppercase">Pages ({modalPages.length})</span>
                      <button
                        type="button"
                        onClick={() => setModalPages(prev => [...prev, { pageNumber: prev.length + 1, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', caption: `Page ${prev.length + 1}`, text: '' }])}
                        className="px-3 py-1 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Page
                      </button>
                    </div>
                    {modalPages.map((p, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2 border">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span>Page {idx + 1}</span>
                          {modalPages.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setModalPages(prev => prev.filter((_, i) => i !== idx))}
                              className="text-rose-500 hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            placeholder="Image URL or upload from device"
                            value={p.image}
                            onChange={(e) => setModalPages(prev => prev.map((item, i) => i === idx ? { ...item, image: e.target.value } : item))}
                            className="flex-1 p-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                          />
                          <label className="shrink-0 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-brand-50 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center gap-1 cursor-pointer border border-slate-200 dark:border-slate-600" title="Upload Page Image from Device">
                            <Upload className="w-3 h-3" />
                            <span className="hidden sm:inline">Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => updatePageImageFromDevice(idx, e.target.files?.[0], false, true)}
                            />
                          </label>
                        </div>
                        <textarea
                          rows={2}
                          placeholder="Narration / dialogue..."
                          value={p.text}
                          onChange={(e) => setModalPages(prev => prev.map((item, i) => i === idx ? { ...item, text: e.target.value } : item))}
                          className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Chapter Body (Paragraphs & Scenes)
                    </label>
                    <VisualBookEditor 
                      value={modalChapterContent}
                      onChange={setModalChapterContent}
                      placeholder="Write your next serialized chapter here. Use the visual buttons to format scenes and dialogue without needing any code!"
                      storyTitle={targetStoryForChapter.title}
                      chapterTitle={modalChapterTitle || `Chapter ${modalChapterNumber}`}
                      authorName={user?.name || "Author"}
                      minHeight="min-h-[300px]"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    type="button"
                    onClick={() => setAddChapterModalOpen(false)}
                    className="px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={modalPublishing}
                    className="flex items-center gap-1.5 px-7 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> 
                    <span>{modalPublishing ? 'Publishing...' : `Publish Chapter ${modalChapterNumber}`}</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
