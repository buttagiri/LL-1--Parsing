import type { FirstSets, FollowSets, ParsingTable, StringParseResult } from '../core/types';

/**
 * Formats FIRST sets into copyable clean text
 */
export function formatFirstSetsText(firstSets: FirstSets): string {
  return Object.entries(firstSets)
    .map(([nt, set]) => `FIRST(${nt}) = { ${set.join(', ')} }`)
    .join('\n');
}

/**
 * Formats FOLLOW sets into copyable clean text
 */
export function formatFollowSetsText(followSets: FollowSets): string {
  return Object.entries(followSets)
    .map(([nt, set]) => `FOLLOW(${nt}) = { ${set.join(', ')} }`)
    .join('\n');
}

/**
 * Formats the LL(1) parsing table as a text table
 */
export function formatParsingTableText(table: ParsingTable): string {
  const header = ['Non-Terminal', ...table.terminals].join('\t');
  const rows = table.nonTerminals.map((nt) => {
    const rowValues = table.terminals.map((term) => {
      const prods = table.cells[nt]?.[term] || [];
      if (prods.length === 0) return '—';
      return prods.map((p) => p.raw).join(' | ');
    });
    return [nt, ...rowValues].join('\t');
  });

  const conflictSummary =
    table.conflicts.length === 0
      ? 'Classification: LL(1) Grammar (No conflicts)'
      : `Classification: Not LL(1) (${table.conflicts.length} conflict${table.conflicts.length > 1 ? 's' : ''})\n` +
        table.conflicts
          .map((c) => `- M[${c.nonTerminal}, ${c.terminal}]: ${c.conflictType} -> ${c.productions.map((p) => p.raw).join(' vs ')}`)
          .join('\n');

  return [header, ...rows, '', conflictSummary].join('\n');
}

/**
 * Formats string parsing trace steps as text
 */
export function formatParseTraceText(result: StringParseResult): string {
  if (result.steps.length === 0) {
    return result.error || 'No parse trace available.';
  }

  const header = ['Step', 'Stack', 'Input', 'Action'].join('\t');
  const rows = result.steps.map((s) => [s.step, s.stack, s.remainingInput, s.action].join('\t'));

  const status = result.success ? '\nStatus: String ACCEPTED' : `\nStatus: String REJECTED (${result.error})`;
  return [header, ...rows, status].join('\n');
}
