import React from 'react';
import type { ParsingTable, Grammar } from '../core/types';
import { CheckCircle2, AlertTriangle, ShieldAlert, Layers, Hash, AlertOctagon } from 'lucide-react';

interface ParsingTableViewProps {
  table: ParsingTable;
  grammar: Grammar;
}

export const ParsingTableView: React.FC<ParsingTableViewProps> = ({ table }) => {
  const { nonTerminals, terminals, cells, conflicts, isLL1, stats } = table;

  return (
    <div className="space-y-6">
      {/* Grammar Status Banner */}
      <div
        className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 shadow-md ${
          isLL1
            ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
            : 'bg-rose-950/30 border-rose-800/50 text-rose-200'
        }`}
      >
        <div className="flex items-center space-x-3">
          {isLL1 ? (
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold tracking-tight">
                {isLL1 ? 'LL(1) Grammar' : 'Not LL(1) Grammar'}
              </span>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  isLL1 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {isLL1 ? 'Deterministic' : `${conflicts.length} Conflict${conflicts.length > 1 ? 's' : ''}`}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {isLL1
                ? 'Every cell in the predictive parsing table contains at most one production rule.'
                : 'One or more parsing table cells contain multiple competing productions.'}
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 max-w-xs text-right hidden md:block">
          Predictive parsing table M[A, a] allows 1-token lookahead without backtracking.
        </div>
      </div>

      {/* Conflicts Diagnostic Panel (if any) */}
      {!isLL1 && conflicts.length > 0 && (
        <div className="rounded-xl border border-rose-800/60 bg-rose-950/20 p-4 space-y-3">
          <div className="flex items-center space-x-2 text-rose-300">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Detected LL(1) Parsing Table Conflicts ({conflicts.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {conflicts.map((conf, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-900/90 border border-rose-800/40 text-xs font-mono space-y-2"
              >
                <div className="flex items-center justify-between font-sans">
                  <span className="font-bold text-rose-400 font-mono text-sm">
                    M[{conf.nonTerminal}, {conf.terminal}]
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                    {conf.conflictType}
                  </span>
                </div>

                <div className="space-y-1 bg-slate-950/80 p-2 rounded border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-sans">Conflicting productions:</div>
                  {conf.productions.map((p) => (
                    <div key={p.id} className="text-cyan-300 font-semibold pl-2 border-l-2 border-rose-500">
                      {p.raw}
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  {conf.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parsing Table Container with Sticky Headers & Scroll */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 shadow-inner overflow-hidden">
        <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
          <table className="w-full border-collapse text-left font-mono text-xs">
            <thead className="bg-slate-900 sticky top-0 z-20 shadow border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-bold text-slate-300 bg-slate-900 border-r border-slate-800 sticky left-0 z-30 min-w-[120px]">
                  M[A, a]
                </th>
                {terminals.map((term) => (
                  <th
                    key={term}
                    className="py-3 px-3.5 font-bold text-cyan-300 border-r border-slate-800/80 text-center min-w-[110px]"
                  >
                    <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 inline-block">
                      {term}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {nonTerminals.map((nt) => (
                <tr key={nt} className="hover:bg-slate-900/40 transition">
                  {/* Sticky Non-Terminal Column */}
                  <td className="py-3 px-4 font-bold text-indigo-300 bg-slate-900/90 border-r border-slate-800 sticky left-0 z-10 shadow-sm">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-200">
                      {nt}
                    </span>
                  </td>

                  {/* Terminal Cells */}
                  {terminals.map((term) => {
                    const cellProds = cells[nt]?.[term] || [];
                    const hasConflict = cellProds.length > 1;
                    const isEmpty = cellProds.length === 0;

                    return (
                      <td
                        key={term}
                        className={`py-2.5 px-2.5 border-r border-slate-800/60 text-center transition ${
                          hasConflict
                            ? 'bg-rose-950/50 hover:bg-rose-900/50 ring-1 ring-inset ring-rose-500/50'
                            : isEmpty
                            ? 'text-slate-600 hover:bg-slate-900/20'
                            : 'hover:bg-slate-900/60'
                        }`}
                      >
                        {isEmpty ? (
                          <span className="text-slate-600 font-sans select-none">—</span>
                        ) : hasConflict ? (
                          <div className="space-y-1">
                            {cellProds.map((prod) => (
                              <div
                                key={prod.id}
                                className="px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-700 text-[11px] font-bold shadow-sm"
                              >
                                {prod.raw}
                              </div>
                            ))}
                            <span className="text-[10px] text-rose-400 font-sans font-bold block mt-0.5">
                              ⚠️ Conflict
                            </span>
                          </div>
                        ) : (
                          <span className="inline-block px-2 py-1 rounded bg-slate-900/90 text-cyan-200 border border-slate-700/80 text-[11px] font-medium shadow-sm">
                            {cellProds[0].raw}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Metrics / Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center space-x-2 text-slate-400 text-xs">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Non-Terminals</span>
          </div>
          <div className="text-lg font-bold text-slate-100 mt-1 font-mono">
            {stats.nonTerminalsCount}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center space-x-2 text-slate-400 text-xs">
            <Hash className="w-3.5 h-3.5 text-blue-400" />
            <span>Terminals (+ $)</span>
          </div>
          <div className="text-lg font-bold text-slate-100 mt-1 font-mono">
            {stats.terminalsCount}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center space-x-2 text-slate-400 text-xs">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Productions</span>
          </div>
          <div className="text-lg font-bold text-slate-100 mt-1 font-mono">
            {stats.productionsCount}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center space-x-2 text-slate-400 text-xs">
            <AlertTriangle className={`w-3.5 h-3.5 ${stats.conflictsCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
            <span>Conflicts</span>
          </div>
          <div className={`text-lg font-bold mt-1 font-mono ${stats.conflictsCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {stats.conflictsCount}
          </div>
        </div>
      </div>
    </div>
  );
};
