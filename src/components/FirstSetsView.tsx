import React from 'react';
import type { FirstSets, Grammar } from '../core/types';
import { EPSILON } from '../core/types';
import { Info, Sparkles } from 'lucide-react';

interface FirstSetsViewProps {
  firstSets: FirstSets;
  grammar: Grammar;
}

export const FirstSetsView: React.FC<FirstSetsViewProps> = ({ firstSets, grammar }) => {
  const nonTerminals = grammar.nonTerminals;

  return (
    <div className="space-y-4">
      {/* Mathematical Theory Intro Card */}
      <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-900/40 text-xs text-blue-200/90 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-cyan-300">
            Definition of FIRST(X):
          </p>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            <span className="font-mono text-cyan-200">FIRST(X)</span> is the set of terminals that begin strings derived from <span className="font-mono text-cyan-200">X</span>. If <span className="font-mono text-cyan-200">X ⇒* ε</span>, then <span className="font-mono text-cyan-200">ε</span> is also in <span className="font-mono text-cyan-200">FIRST(X)</span>.
          </p>
        </div>
      </div>

      {/* Results Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-inner">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-4 w-1/4 font-semibold">Non-Terminal</th>
              <th className="py-2.5 px-4 font-semibold">FIRST Set Result</th>
              <th className="py-2.5 px-4 text-right w-24 font-semibold">Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {nonTerminals.map((nt) => {
              const set = firstSets[nt] || [];
              const hasEpsilon = set.includes(EPSILON);

              return (
                <tr key={nt} className="hover:bg-slate-900/50 transition">
                  <td className="py-3 px-4 font-bold text-cyan-400">
                    <span className="inline-flex items-center space-x-1.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300">
                        {nt}
                      </span>
                      {hasEpsilon && (
                        <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Nullable
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-slate-500">{'{'}</span>
                      {set.length === 0 ? (
                        <span className="text-slate-600 italic">∅ (empty)</span>
                      ) : (
                        set.map((sym, idx) => (
                          <React.Fragment key={sym}>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                sym === EPSILON
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-slate-800 text-slate-100 border border-slate-700'
                              }`}
                            >
                              {sym}
                            </span>
                            {idx < set.length - 1 && (
                              <span className="text-slate-600">,</span>
                            )}
                          </React.Fragment>
                        ))
                      )}
                      <span className="text-slate-500">{'}'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400 text-xs">
                    {set.length} symbol{set.length !== 1 ? 's' : ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span className="flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Calculated for {nonTerminals.length} non-terminals across {grammar.productions.length} productions</span>
        </span>
        <span className="text-[11px] text-slate-400">Fixed-Point Iterative Algorithm</span>
      </div>
    </div>
  );
};
