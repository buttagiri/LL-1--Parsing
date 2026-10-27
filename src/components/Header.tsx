import React from 'react';
import { Cpu, Sparkles, BookOpen } from 'lucide-react';

interface HeaderProps {
  onOpenQuickGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenQuickGuide }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Title */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
            <Cpu className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-100 tracking-tight">
                LL(1) Parser Visualizer
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-cyan-400 border border-cyan-500/20">
                Compiler Design
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Explore FIRST, FOLLOW, and predictive parsing tables interactively
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenQuickGuide}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="View CFG syntax & algorithms guide"
          >
            <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden xs:inline">Syntax & Theory Guide</span>
          </button>

          <div className="flex items-center space-x-1 text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-mono text-[11px]">Academic Edition</span>
          </div>
        </div>
      </div>
    </header>
  );
};
