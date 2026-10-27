import React, { useRef, useId } from 'react';
import { Trash2, CheckCircle2, Code2, HelpCircle } from 'lucide-react';
import { ExampleSelector } from './ExampleSelector';
import type { ExampleGrammar } from '../core/examples';
import { EPSILON } from '../core/types';

interface GrammarEditorProps {
  value: string;
  onChange: (val: string) => void;
  onValidate: () => void;
  onClear: () => void;
  onSelectExample: (eg: ExampleGrammar) => void;
  isDirty?: boolean;
}

export const GrammarEditor: React.FC<GrammarEditorProps> = ({
  value,
  onChange,
  onValidate,
  onClear,
  onSelectExample,
  isDirty,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const textareaId = useId();

  const lines = value.split('\n');
  const lineCount = Math.max(lines.length, 8);

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const insertSymbol = (sym: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + sym + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + sym.length, start + sym.length);
    }, 10);
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-full">
      {/* Editor Header */}
      <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-md bg-blue-500/10 text-cyan-400">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <label htmlFor={textareaId} className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
              Context-Free Grammar
            </label>
            <span className="text-[11px] text-slate-400">
              One production rule per line. Spaces between symbols.
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5">
          <ExampleSelector onSelectExample={onSelectExample} />

          <button
            type="button"
            onClick={onValidate}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 transition shadow-sm"
            title="Check syntax and symbol definitions"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Validate</span>
          </button>

          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition"
            title="Clear grammar editor"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Body with Line Numbers */}
      <div className="relative flex-1 flex min-h-[260px] bg-slate-950 font-mono text-xs">
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          aria-hidden="true"
          className="select-none py-3 px-2 bg-slate-900/60 text-slate-500 text-right font-mono border-r border-slate-800/80 w-10 overflow-hidden leading-6"
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          id={textareaId}
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          placeholder={`E -> T E'\nE' -> + T E' | ε\nT -> F T'\nT' -> * F T' | ε\nF -> ( E ) | id`}
          spellCheck={false}
          className="flex-1 w-full py-3 px-3.5 bg-transparent text-slate-100 placeholder-slate-600 resize-none outline-none font-mono leading-6 selection:bg-cyan-500/30 whitespace-pre"
        />

        {/* Stale/Dirty Indicator Badge */}
        {isDirty && (
          <div className="absolute top-2 right-3 z-10 px-2 py-0.5 rounded-md text-[10px] font-sans font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow">
            Edited (Recalculate)
          </div>
        )}
      </div>

      {/* Symbol Shortcut Bar & Syntax Hint */}
      <div className="px-3.5 py-2.5 bg-slate-900/90 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-1 text-slate-400">
          <span className="text-[11px] text-slate-400 mr-1">Insert symbol:</span>
          <button
            type="button"
            onClick={() => insertSymbol(EPSILON)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-mono text-xs font-semibold transition"
            title="Insert Epsilon (ε)"
          >
            ε
          </button>
          <button
            type="button"
            onClick={() => insertSymbol(' -> ')}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono text-xs transition"
            title="Insert Production Arrow"
          >
            -&gt;
          </button>
          <button
            type="button"
            onClick={() => insertSymbol(' | ')}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono text-xs transition"
            title="Insert Alternative Pipe"
          >
            |
          </button>
          <button
            type="button"
            onClick={() => insertSymbol("'")}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono text-xs transition"
            title="Insert Prime"
          >
            '
          </button>
        </div>

        <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Epsilon: <code className="text-cyan-400">ε</code> or <code className="text-cyan-400">epsilon</code></span>
        </div>
      </div>
    </div>
  );
};
