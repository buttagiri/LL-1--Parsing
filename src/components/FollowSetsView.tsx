import React from 'react';
import type { FollowSets, Grammar } from '../core/types';
import { END_MARKER } from '../core/types';
import { Info, HelpCircle } from 'lucide-react';

interface FollowSetsViewProps {
  followSets: FollowSets;
  grammar: Grammar;
}

export const FollowSetsView: React.FC<FollowSetsViewProps> = ({ followSets, grammar }) => {
  const nonTerminals = grammar.nonTerminals;

  return (
    <div className="space-y-4">
      {/* Mathematical Theory Intro Card */}
      <div className="p-3.5 rounded-xl bg-teal-950/30 border border-teal-900/40 text-xs text-teal-200/90 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-teal-300">
            Definition of FOLLOW(A):
          </p>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            <span className="font-mono text-teal-200">FOLLOW(A)</span> is the set of terminal symbols that can appear immediately to the right of non-terminal <span className="font-mono text-teal-200">A</span> in some sentential form. Epsilon (<span className="font-mono text-amber-300">ε</span>) is <span className="font-semibold text-rose-300">never</span> in a FOLLOW set.
          </p>
        </div>
      </div>

      {/* Start Symbol End Marker Explanation Note */}
      <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center space-x-2">
        <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          <strong className="text-cyan-300">Why does '$' appear in FOLLOW({grammar.startSymbol})?</strong> The special end-marker <code className="text-cyan-400 font-bold">$</code> designates end-of-input. Because <code className="text-cyan-300 font-bold">{grammar.startSymbol}</code> is the grammar's start symbol, it can be validly followed by the end of the entire input.
        </span>
      </div>

      {/* Results Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-inner">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-4 w-1/4 font-semibold">Non-Terminal</th>
              <th className="py-2.5 px-4 font-semibold">FOLLOW Set Result</th>
              <th className="py-2.5 px-4 text-right w-24 font-semibold">Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {nonTerminals.map((nt) => {
              const set = followSets[nt] || [];
              const isStart = nt === grammar.startSymbol;

              return (
                <tr key={nt} className="hover:bg-slate-900/50 transition">
                  <td className="py-3 px-4 font-bold text-teal-400">
                    <span className="inline-flex items-center space-x-1.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-teal-300">
                        {nt}
                      </span>
                      {isStart && (
                        <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          Start Symbol
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
                                sym === END_MARKER
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
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
    </div>
  );
};
