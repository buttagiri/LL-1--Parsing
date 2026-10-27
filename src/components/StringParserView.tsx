import React, { useState } from 'react';
import type { Grammar, ParsingTable, StringParseResult } from '../core/types';
import { parseInputStringLL1 } from '../core/stringParser';
import { Play, CheckCircle2, AlertCircle, ShieldAlert, Sparkles, CornerDownLeft } from 'lucide-react';

interface StringParserViewProps {
  grammar: Grammar;
  table: ParsingTable;
  defaultInput?: string;
}

export const StringParserView: React.FC<StringParserViewProps> = ({
  grammar,
  table,
  defaultInput = 'id + id * id',
}) => {
  const [inputString, setInputString] = useState(defaultInput);
  const [parseResult, setParseResult] = useState<StringParseResult | null>(() => {
    if (table.isLL1 && defaultInput) {
      return parseInputStringLL1(defaultInput, grammar, table);
    }
    return null;
  });

  const handleParse = (overrideInput?: string) => {
    const textToParse = overrideInput !== undefined ? overrideInput : inputString;
    const res = parseInputStringLL1(textToParse, grammar, table);
    setParseResult(res);
  };

  const handleQuickInsert = (token: string) => {
    const updated = inputString.trim() ? `${inputString.trim()} ${token}` : token;
    setInputString(updated);
  };

  if (!table.isLL1) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900 border border-rose-800/40 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-100">
            Cannot Run String Parser on Ambiguous Grammar
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            The grammar contains {table.conflicts.length} LL(1) parsing table conflict{table.conflicts.length > 1 ? 's' : ''}. Deterministic predictive parsing requires every cell to have at most one rule.
          </p>
        </div>
        <p className="text-xs text-rose-300 font-mono bg-rose-950/40 py-2 px-3 rounded-lg border border-rose-900/40 inline-block">
          Resolve conflicts or load an LL(1) example grammar (e.g. Standard Expressions)
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Input String Formulation Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputString}
              onChange={(e) => setInputString(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleParse()}
              placeholder="e.g. id + id * id"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-600 font-mono text-xs focus:outline-none focus:border-cyan-500 transition shadow-inner"
            />
          </div>

          <button
            type="button"
            onClick={() => handleParse()}
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs transition shadow-md shadow-cyan-600/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Parse String</span>
            <CornerDownLeft className="w-3 h-3 text-cyan-200" />
          </button>
        </div>

        {/* Quick Token Insertion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
          <span className="text-[11px] text-slate-400 mr-1">Insert terminal token:</span>
          {grammar.terminals.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => handleQuickInsert(term)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-mono text-xs transition"
            >
              {term}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setInputString('')}
            className="text-[11px] text-slate-400 hover:text-rose-400 transition ml-auto"
          >
            Clear input
          </button>
        </div>
      </div>

      {/* Result Status Banner */}
      {parseResult && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            parseResult.success
              ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
              : 'bg-rose-950/30 border-rose-800/60 text-rose-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {parseResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>
              {parseResult.success
                ? 'Input String ACCEPTED — Matches Language Grammar'
                : `Input String REJECTED — ${parseResult.error || 'Syntax Error'}`}
            </span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
            {parseResult.steps.length} steps
          </span>
        </div>
      )}

      {/* Parsing Trace Step-by-Step Table */}
      {parseResult && parseResult.steps.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-950 shadow-inner overflow-hidden">
          <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead className="bg-slate-900 sticky top-0 z-10 border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 w-16 text-center font-semibold">Step</th>
                  <th className="py-2.5 px-4 font-semibold w-1/3">Stack (Top on right)</th>
                  <th className="py-2.5 px-4 font-semibold w-1/3">Remaining Input</th>
                  <th className="py-2.5 px-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {parseResult.steps.map((st) => {
                  let badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';
                  if (st.type === 'accept') {
                    badgeStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold';
                  } else if (st.type === 'error') {
                    badgeStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold';
                  } else if (st.type === 'expand') {
                    badgeStyle = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
                  } else if (st.type === 'match') {
                    badgeStyle = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
                  }

                  return (
                    <tr key={st.step} className="hover:bg-slate-900/40 transition">
                      <td className="py-2.5 px-3 text-center text-slate-400 text-[11px]">
                        {st.step}
                      </td>
                      <td className="py-2.5 px-4 text-indigo-300 font-semibold tracking-wide">
                        {st.stack}
                      </td>
                      <td className="py-2.5 px-4 text-cyan-200">
                        {st.remainingInput}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] inline-block border ${badgeStyle}`}>
                          {st.action}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Educational Footer */}
      <div className="flex items-center space-x-2 text-xs text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span>
          Simulation uses the standard LL(1) table-driven predictive parsing algorithm with stack push/pop operations.
        </span>
      </div>
    </div>
  );
};
