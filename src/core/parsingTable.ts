import type { Grammar, ParsingTable, Production, TableConflict } from './types';
import { END_MARKER, EPSILON } from './types';
import { calculateFirstOfSequence, computeFirstSets } from './firstSets';
import { computeFollowSets } from './followSets';
import { compareGrammarSymbols } from './tokenizer';

/**
 * Builds the LL(1) predictive parsing table M[A, a] from the grammar,
 * using computed FIRST and FOLLOW sets, and detects any LL(1) conflicts.
 */
export function buildParsingTable(
  grammar: Grammar,
  firstSetsMap?: Record<string, Set<string>>,
  followSetsMap?: Record<string, Set<string>>
): ParsingTable {
  const fMap = firstSetsMap || computeFirstSets(grammar).firstSetsMap;
  const foMap = followSetsMap || computeFollowSets(grammar, fMap).followSetsMap;

  // Terminals including the end marker $, sorted deterministically
  const rawTerminals = grammar.terminals.filter((t) => t !== EPSILON);
  if (!rawTerminals.includes(END_MARKER)) {
    rawTerminals.push(END_MARKER);
  }
  const terminalsWithEnd = rawTerminals.sort(compareGrammarSymbols);

  // Initialize cells: M[nonTerminal][terminal] = Production[]
  const cells: Record<string, Record<string, Production[]>> = {};
  for (const nt of grammar.nonTerminals) {
    cells[nt] = {};
    for (const term of terminalsWithEnd) {
      cells[nt][term] = [];
    }
  }

  // Map to track the reason each production entered M[A, a] (for conflict diagnosis)
  // key: `${A}#${a}#${prod.id}` -> 'FIRST' | 'FOLLOW'
  const entryReasons = new Map<string, 'FIRST' | 'FOLLOW'>();

  // Populate table
  for (const prod of grammar.productions) {
    const A = prod.lhs;
    const alphaFirst = calculateFirstOfSequence(prod.rhs, fMap, grammar);

    // Rule 1: For each terminal 'a' in FIRST(alpha), excluding ε
    for (const a of alphaFirst) {
      if (a !== EPSILON && terminalsWithEnd.includes(a)) {
        cells[A][a].push(prod);
        entryReasons.set(`${A}#${a}#${prod.id}`, 'FIRST');
      }
    }

    // Rule 2 & 3: If ε is in FIRST(alpha), for each terminal 'b' in FOLLOW(A) (including $)
    if (alphaFirst.has(EPSILON)) {
      const aFollow = foMap[A] || new Set<string>();
      for (const b of aFollow) {
        if (terminalsWithEnd.includes(b)) {
          // Avoid duplicate insertion of the exact same production in the same cell
          if (!cells[A][b].some((p) => p.id === prod.id)) {
            cells[A][b].push(prod);
            entryReasons.set(`${A}#${b}#${prod.id}`, 'FOLLOW');
          }
        }
      }
    }
  }

  // Detect conflicts
  const conflicts: TableConflict[] = [];

  for (const nt of grammar.nonTerminals) {
    for (const term of terminalsWithEnd) {
      const cellProds = cells[nt][term];
      if (cellProds.length > 1) {
        // More than one production for M[nt, term] -> Conflict!
        const reasons = cellProds.map(
          (p) => entryReasons.get(`${nt}#${term}#${p.id}`) || 'UNKNOWN'
        );

        let conflictType: TableConflict['conflictType'] = 'MULTIPLE_PRODUCTIONS';
        let description = '';

        const hasFirst = reasons.includes('FIRST');
        const hasFollow = reasons.includes('FOLLOW');
        const firstCount = reasons.filter((r) => r === 'FIRST').length;

        if (firstCount >= 2) {
          conflictType = 'FIRST_FIRST';
          description = `FIRST/FIRST conflict: Multiple distinct alternatives for '${nt}' have '${term}' in their FIRST sets. The parser cannot decide which production to expand when looking ahead at '${term}'.`;
        } else if (hasFirst && hasFollow) {
          conflictType = 'FIRST_FOLLOW';
          description = `FIRST/FOLLOW conflict: One alternative for '${nt}' derives '${term}', while a nullable alternative allows '${nt}' to derive ε with '${term}' in FOLLOW('${nt}'). The parser cannot decide whether to expand or derive ε.`;
        } else {
          conflictType = 'MULTIPLE_PRODUCTIONS';
          description = `Multiple conflicting productions placed in cell M[${nt}, ${term}]. The grammar is ambiguous or requires more than 1 symbol of lookahead.`;
        }

        conflicts.push({
          nonTerminal: nt,
          terminal: term,
          productions: [...cellProds],
          conflictType,
          description,
        });
      }
    }
  }

  const isLL1 = conflicts.length === 0;

  return {
    cells,
    conflicts,
    isLL1,
    terminals: terminalsWithEnd,
    nonTerminals: grammar.nonTerminals,
    stats: {
      nonTerminalsCount: grammar.nonTerminals.length,
      terminalsCount: grammar.terminals.length,
      productionsCount: grammar.productions.length,
      conflictsCount: conflicts.length,
    },
  };
}
