import type { FollowSets, Grammar } from './types';
import { END_MARKER, EPSILON } from './types';
import { calculateFirstOfSequence, computeFirstSets } from './firstSets';
import { compareGrammarSymbols } from './tokenizer';

/**
 * Computes FOLLOW sets for all non-terminals in the grammar using an iterative fixed-point algorithm.
 * Reuses the FIRST-set engine and sequence calculation.
 */
export function computeFollowSets(
  grammar: Grammar,
  firstSetsMap?: Record<string, Set<string>>
): {
  followSets: FollowSets;
  followSetsMap: Record<string, Set<string>>;
} {
  // If firstSetsMap not supplied, compute it
  const firstMap = firstSetsMap || computeFirstSets(grammar).firstSetsMap;

  const followSetsMap: Record<string, Set<string>> = {};
  for (const nt of grammar.nonTerminals) {
    followSetsMap[nt] = new Set<string>();
  }

  // Rule 1: Add $ to FOLLOW(S), where S is the start symbol
  if (grammar.startSymbol && followSetsMap[grammar.startSymbol]) {
    followSetsMap[grammar.startSymbol].add(END_MARKER);
  }

  let changed = true;
  let iterations = 0;
  const maxIterations = (grammar.nonTerminals.length + grammar.terminals.length + 2) * 5;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    for (const prod of grammar.productions) {
      const A = prod.lhs;

      for (let i = 0; i < prod.rhs.length; i++) {
        const B = prod.rhs[i];

        // Only compute FOLLOW for non-terminals
        if (!grammar.nonTerminals.includes(B)) {
          continue;
        }

        const bFollow = followSetsMap[B];
        const prevSize = bFollow.size;

        const beta = prod.rhs.slice(i + 1);
        const firstBeta = calculateFirstOfSequence(beta, firstMap, grammar);

        // Rule 2: Add FIRST(β) excluding ε to FOLLOW(B)
        for (const sym of firstBeta) {
          if (sym !== EPSILON) {
            bFollow.add(sym);
          }
        }

        // Rule 3 & 4: If β can derive ε (or is empty), add FOLLOW(A) to FOLLOW(B)
        if (firstBeta.has(EPSILON)) {
          const aFollow = followSetsMap[A];
          for (const sym of aFollow) {
            bFollow.add(sym);
          }
        }

        if (bFollow.size > prevSize) {
          changed = true;
        }
      }
    }
  }

  // Convert Sets to deterministic, sorted arrays
  const followSets: FollowSets = {};
  for (const nt of grammar.nonTerminals) {
    const rawItems = Array.from(followSetsMap[nt]);
    // Deterministic sorting using standard compiler academic ordering
    followSets[nt] = rawItems.sort(compareGrammarSymbols);
  }

  return { followSets, followSetsMap };
}
