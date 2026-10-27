import type { FirstSets, Grammar } from './types';
import { EPSILON } from './types';
import { compareGrammarSymbols } from './tokenizer';

/**
 * Calculates the FIRST set of a sequence of grammar symbols X1 X2 ... Xn
 * given current FIRST sets for all non-terminals.
 */
export function calculateFirstOfSequence(
  sequence: string[],
  firstSets: Record<string, Set<string>>,
  grammar: Grammar
): Set<string> {
  const result = new Set<string>();

  if (sequence.length === 0 || (sequence.length === 1 && sequence[0] === EPSILON)) {
    result.add(EPSILON);
    return result;
  }

  let allCanDeriveEpsilon = true;

  for (const symbol of sequence) {
    if (symbol === EPSILON) {
      continue;
    }

    if (!grammar.nonTerminals.includes(symbol)) {
      // It's a terminal
      result.add(symbol);
      allCanDeriveEpsilon = false;
      break;
    }

    // It's a non-terminal
    const ntFirst = firstSets[symbol] || new Set<string>();
    let symbolHasEpsilon = false;

    for (const item of ntFirst) {
      if (item === EPSILON) {
        symbolHasEpsilon = true;
      } else {
        result.add(item);
      }
    }

    if (!symbolHasEpsilon) {
      allCanDeriveEpsilon = false;
      break;
    }
  }

  if (allCanDeriveEpsilon) {
    result.add(EPSILON);
  }

  return result;
}

/**
 * Computes FIRST sets for all non-terminals in the grammar using an iterative fixed-point algorithm.
 * Handles recursion, left-recursion, cycles, and nullable chains safely.
 */
export function computeFirstSets(grammar: Grammar): {
  firstSets: FirstSets;
  firstSetsMap: Record<string, Set<string>>;
} {
  const firstSetsMap: Record<string, Set<string>> = {};

  // Initialize empty set for every non-terminal
  for (const nt of grammar.nonTerminals) {
    firstSetsMap[nt] = new Set<string>();
  }

  let changed = true;
  let iterations = 0;
  // Safety bound to prevent runaway loops in case of any theoretical issue
  const maxIterations = (grammar.nonTerminals.length + grammar.terminals.length + 2) * 5;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    for (const prod of grammar.productions) {
      const nt = prod.lhs;
      const currentSet = firstSetsMap[nt];
      const prevSize = currentSet.size;

      if (prod.rhs.length === 1 && prod.rhs[0] === EPSILON) {
        currentSet.add(EPSILON);
      } else {
        let allDeriveEpsilon = true;

        for (const symbol of prod.rhs) {
          if (symbol === EPSILON) {
            continue;
          }

          if (!grammar.nonTerminals.includes(symbol)) {
            // Terminal symbol
            currentSet.add(symbol);
            allDeriveEpsilon = false;
            break;
          }

          // Non-terminal symbol
          const symFirst = firstSetsMap[symbol];
          let symbolHasEpsilon = false;

          for (const item of symFirst) {
            if (item === EPSILON) {
              symbolHasEpsilon = true;
            } else {
              currentSet.add(item);
            }
          }

          if (!symbolHasEpsilon) {
            allDeriveEpsilon = false;
            break;
          }
        }

        if (allDeriveEpsilon) {
          currentSet.add(EPSILON);
        }
      }

      if (currentSet.size > prevSize) {
        changed = true;
      }
    }
  }

  // Convert Sets to deterministic, sorted arrays
  const firstSets: FirstSets = {};
  for (const nt of grammar.nonTerminals) {
    const rawItems = Array.from(firstSetsMap[nt]);
    // Deterministic sorting using standard compiler academic ordering
    firstSets[nt] = rawItems.sort(compareGrammarSymbols);
  }

  return { firstSets, firstSetsMap };
}
