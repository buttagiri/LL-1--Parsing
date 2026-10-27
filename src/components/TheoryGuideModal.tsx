import React from 'react';
import { X, BookOpen, Layers, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface TheoryGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TheoryGuideModal: React.FC<TheoryGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                LL(1) Compiler Theory & Quick Guide
              </h3>
              <p className="text-xs text-slate-400">
                Mathematical foundations of Top-Down Predictive Parsing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* Section 1: Grammar Syntax */}
          <section className="space-y-2">
            <h4 className="text-sm font-bold text-cyan-300 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>1. Supported Grammar Syntax</span>
            </h4>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1 text-slate-200">
              <div>E -&gt; T E'</div>
              <div>E' -&gt; + T E' | ε</div>
              <div>T -&gt; F T'</div>
              <div>T' -&gt; * F T' | ε</div>
              <div>F -&gt; ( E ) | id</div>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
              <li><strong className="text-slate-200">Non-Terminals:</strong> Symbols appearing on the left-hand side of production rules (e.g. <code className="text-cyan-300">E</code>, <code className="text-cyan-300">E'</code>, <code className="text-cyan-300">Expr</code>).</li>
              <li><strong className="text-slate-200">Terminals:</strong> Symbols not appearing on any LHS (e.g. <code className="text-cyan-300">+</code>, <code className="text-cyan-300">*</code>, <code className="text-cyan-300">(</code>, <code className="text-cyan-300">)</code>, <code className="text-cyan-300">id</code>).</li>
              <li><strong className="text-slate-200">Epsilon:</strong> Represented as <code className="text-amber-300">ε</code> or keyword <code className="text-amber-300">epsilon</code>. Must be alone on the right-hand side.</li>
              <li><strong className="text-slate-200">Start Symbol:</strong> LHS of the first valid production rule.</li>
            </ul>
          </section>

          {/* Section 2: FIRST Set Algorithm */}
          <section className="space-y-2">
            <h4 className="text-sm font-bold text-blue-300 flex items-center space-x-2">
              <ArrowRight className="w-4 h-4 text-blue-400" />
              <span>2. FIRST Set Algorithm (Iterative Fixed-Point)</span>
            </h4>
            <p className="text-slate-400">
              For any grammar symbol sequence <code className="text-cyan-200">α</code>, <code className="text-cyan-200">FIRST(α)</code> is the set of terminals that begin strings derived from <code className="text-cyan-200">α</code>:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <li>If <code className="text-cyan-300">a</code> is terminal, <code className="text-cyan-300">FIRST(a) = {'{ a }'}</code>.</li>
              <li>If <code className="text-cyan-300">X -&gt; ε</code>, add <code className="text-amber-300">ε</code> to <code className="text-cyan-300">FIRST(X)</code>.</li>
              <li>For <code className="text-cyan-300">A -&gt; Y1 Y2 ... Yk</code>: Add <code className="text-cyan-300">FIRST(Y1) - {'{ ε }'}</code>. If <code className="text-cyan-300">Y1 ⇒* ε</code>, add <code className="text-cyan-300">FIRST(Y2) - {'{ ε }'}</code>, continuing until a symbol cannot derive <code className="text-amber-300">ε</code>. If all derive <code className="text-amber-300">ε</code>, add <code className="text-amber-300">ε</code>.</li>
            </ol>
          </section>

          {/* Section 3: FOLLOW Set Algorithm */}
          <section className="space-y-2">
            <h4 className="text-sm font-bold text-teal-300 flex items-center space-x-2">
              <ArrowRight className="w-4 h-4 text-teal-400" />
              <span>3. FOLLOW Set Algorithm</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <li>Add input end-marker <code className="text-purple-300 font-bold">$</code> to <code className="text-teal-300">FOLLOW(S)</code> where <code className="text-teal-300">S</code> is the start symbol.</li>
              <li>For production <code className="text-teal-300">A -&gt; α B β</code>: Add <code className="text-teal-300">FIRST(β) - {'{ ε }'}</code> to <code className="text-teal-300">FOLLOW(B)</code>.</li>
              <li>If <code className="text-teal-300">β ⇒* ε</code> (or <code className="text-teal-300">β</code> is empty), add everything in <code className="text-teal-300">FOLLOW(A)</code> to <code className="text-teal-300">FOLLOW(B)</code>.</li>
              <li>Repeat iteratively until no FOLLOW set changes. Epsilon is <strong className="text-rose-400">never</strong> in a FOLLOW set.</li>
            </ol>
          </section>

          {/* Section 4: LL(1) Table & Conflicts */}
          <section className="space-y-2">
            <h4 className="text-sm font-bold text-indigo-300 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>4. LL(1) Table Construction & Conflict Rules</span>
            </h4>
            <p className="text-slate-400">
              For each production <code className="text-cyan-200">A -&gt; α</code>:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <li>For each terminal <code className="text-cyan-300">a ∈ FIRST(α)</code>: place <code className="text-cyan-300">A -&gt; α</code> into <code className="text-cyan-300">M[A, a]</code>.</li>
              <li>If <code className="text-amber-300">ε ∈ FIRST(α)</code>: for each <code className="text-cyan-300">b ∈ FOLLOW(A)</code> (including <code className="text-purple-300">$</code>), place <code className="text-cyan-300">A -&gt; α</code> into <code className="text-cyan-300">M[A, b]</code>.</li>
            </ul>

            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/50 space-y-1">
              <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>Difference: Grammar Syntax Error vs LL(1) Conflict</span>
              </div>
              <p className="text-[11px] text-amber-200 leading-relaxed">
                A <strong>Grammar Syntax Error</strong> occurs when the input fails context-free grammar definition rules (e.g. missing arrow, undefined non-terminal). An <strong>LL(1) Conflict</strong> occurs when a syntactically valid grammar cannot be parsed with 1-token lookahead because multiple rules map to the same cell <code className="font-mono">M[A, a]</code> (due to left-recursion, common prefixes, or ambiguity).
              </p>
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-800/80 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
