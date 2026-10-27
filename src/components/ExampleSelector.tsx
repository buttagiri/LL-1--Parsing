import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sparkles, AlertTriangle, Layers, Repeat, ArrowRight } from 'lucide-react';
import { EXAMPLE_GRAMMARS } from '../core/examples';
import type { ExampleGrammar } from '../core/examples';

interface ExampleSelectorProps {
  onSelectExample: (example: ExampleGrammar) => void;
}

export const ExampleSelector: React.FC<ExampleSelectorProps> = ({ onSelectExample }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCategoryBadge = (category: ExampleGrammar['category']) => {
    switch (category) {
      case 'LL(1)':
        return <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">LL(1)</span>;
      case 'Nullable':
        return <span className="px-1.5 py-0.5 text-[10px] rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">Nullable ε</span>;
      case 'Conflict':
        return <span className="px-1.5 py-0.5 text-[10px] rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">Conflict</span>;
      case 'Left-Recursive':
        return <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">Left-Recursive</span>;
    }
  };

  const getCategoryIcon = (category: ExampleGrammar['category']) => {
    switch (category) {
      case 'LL(1)':
        return <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Nullable':
        return <Layers className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Conflict':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
      case 'Left-Recursive':
        return <Repeat className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition shadow-sm"
      >
        <span className="flex items-center space-x-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Load Example</span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl shadow-black/80 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3.5 py-2.5 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">Preloaded Grammar Examples</span>
            <span className="text-[10px] text-slate-400">5 Curated Tests</span>
          </div>

          <div className="p-1.5 max-h-[380px] overflow-y-auto space-y-1">
            {EXAMPLE_GRAMMARS.map((eg) => (
              <button
                key={eg.id}
                onClick={() => {
                  onSelectExample(eg);
                  setIsOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-lg hover:bg-slate-800/80 transition group border border-transparent hover:border-slate-700/60"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5">
                    {getCategoryIcon(eg.category)}
                    <span className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 transition">
                      {eg.name}
                    </span>
                  </div>
                  {getCategoryBadge(eg.category)}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                  {eg.description}
                </p>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono bg-slate-950/60 px-2 py-1 rounded">
                  <span className="truncate max-w-[200px]">{eg.grammar.split('\n')[0]} ...</span>
                  <span className="flex items-center text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                    Load <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
