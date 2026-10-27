import React, { useState } from 'react';
import { Copy, Check, Info, Sparkles, Terminal } from 'lucide-react';
import type { OperationType } from './OperationButtons';
import { FirstSetsView } from './FirstSetsView';
import { FollowSetsView } from './FollowSetsView';
import { ParsingTableView } from './ParsingTableView';
import { StringParserView } from './StringParserView';
import type { FirstSets, FollowSets, Grammar, ParsingTable, ValidationError } from '../core/types';
import { formatFirstSetsText, formatFollowSetsText, formatParsingTableText } from '../utils/formatOutput';
import { ErrorNotification } from './ErrorNotification';

interface ResultsPanelProps {
  operation: OperationType;
  grammar?: Grammar;
  firstSets?: FirstSets;
  followSets?: FollowSets;
  parsingTable?: ParsingTable;
  errors?: ValidationError[];
  isStale?: boolean;
  onRecalculate?: () => void;
  defaultInput?: string;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  operation,
  grammar,
  firstSets,
  followSets,
  parsingTable,
  errors = [],
  isStale,
  onRecalculate,
  defaultInput,
}) => {
  const [copied, setCopied] = useState(false);

  const getHeaderInfo = () => {
    switch (operation) {
      case 'first':
        return {
          title: 'Operation 1: FIRST Set Calculation',
          subtitle: 'Determines the set of terminals that can begin strings derived from each non-terminal.',
          badge: 'FIRST(X)',
        };
      case 'follow':
        return {
          title: 'Operation 2: FOLLOW Set Calculation',
          subtitle: 'Determines the set of terminals that can appear immediately to the right of each non-terminal.',
          badge: 'FOLLOW(A)',
        };
      case 'table':
        return {
          title: 'Operation 3: LL(1) Predictive Parsing Table',
          subtitle: 'Constructs the 2D matrix M[A, a] using FIRST and FOLLOW sets to guide deterministic top-down parsing.',
          badge: 'Table M[A, a]',
        };
      case 'parse':
        return {
          title: 'Optional Feature: Step-by-Step String Parser',
          subtitle: 'Simulates the pushdown stack machine matching input tokens against table rules.',
          badge: 'Trace Simulation',
        };
    }
  };

  const handleCopy = async () => {
    let textToCopy = '';
    if (operation === 'first' && firstSets) {
      textToCopy = formatFirstSetsText(firstSets);
    } else if (operation === 'follow' && followSets) {
      textToCopy = formatFollowSetsText(followSets);
    } else if (operation === 'table' && parsingTable) {
      textToCopy = formatParsingTableText(parsingTable);
    }

    if (textToCopy) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback
      }
    }
  };

  const fatalErrors = errors.filter((e) => e.severity === 'error');
  const info = getHeaderInfo();

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-full">
      {/* Panel Header */}
      <div className="px-5 py-4 bg-slate-800/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold text-slate-100 tracking-tight">
              {info.title}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              {info.badge}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {info.subtitle}
          </p>
        </div>

        {/* Copy Button */}
        {operation !== 'parse' && grammar && !fatalErrors.length && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition shadow-sm"
            title="Copy formatted result to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span>Copy Results</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Stale Warning Bar if Grammar was Edited */}
      {isStale && onRecalculate && (
        <div className="px-5 py-2.5 bg-amber-950/40 border-b border-amber-900/60 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Grammar changed in editor. Results may be outdated.</span>
          </div>
          <button
            type="button"
            onClick={onRecalculate}
            className="px-2.5 py-1 rounded-md bg-amber-600/30 hover:bg-amber-600/40 text-amber-200 border border-amber-500/40 text-[11px] font-medium transition"
          >
            Update Calculation
          </button>
        </div>
      )}

      {/* Main Panel Content Area */}
      <div className="p-5 flex-1 overflow-y-auto">
        {/* If fatal grammar validation errors exist, show error diagnostic */}
        {fatalErrors.length > 0 ? (
          <div className="space-y-4">
            <ErrorNotification
              errors={fatalErrors}
              title="Grammar Syntax Error — Cannot Compute Sets"
            />
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold font-sans">
                <Terminal className="w-4 h-4" />
                <span>How to fix:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 font-mono text-[11px]">
                <li>Ensure production rules follow format: <code className="text-cyan-300">NonTerminal -&gt; symbols</code></li>
                <li>Separate grammar symbols with spaces (e.g. <code className="text-cyan-300">+ T E'</code>)</li>
                <li>Use <code className="text-cyan-300">ε</code> or <code className="text-cyan-300">epsilon</code> alone on right-hand side for empty productions</li>
                <li>Make sure all non-terminals referenced on RHS have a corresponding production</li>
              </ul>
            </div>
          </div>
        ) : !grammar ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-slate-500 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center border border-slate-700">
              <Sparkles className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">No grammar loaded</p>
              <p className="text-xs text-slate-500 mt-1">
                Enter context-free grammar productions or select an example above to begin.
              </p>
            </div>
          </div>
        ) : (
          <div>
            {operation === 'first' && firstSets && (
              <FirstSetsView firstSets={firstSets} grammar={grammar} />
            )}

            {operation === 'follow' && followSets && (
              <FollowSetsView followSets={followSets} grammar={grammar} />
            )}

            {operation === 'table' && parsingTable && (
              <ParsingTableView table={parsingTable} grammar={grammar} />
            )}

            {operation === 'parse' && parsingTable && (
              <StringParserView
                grammar={grammar}
                table={parsingTable}
                defaultInput={defaultInput}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
