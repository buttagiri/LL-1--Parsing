import { END_MARKER, EPSILON, EPSILON_ALT } from './types';

/**
 * Checks if a string represents epsilon (ε or 'epsilon' case-insensitively)
 */
export function isEpsilon(token: string): boolean {
  const normalized = token.trim().toLowerCase();
  return token === EPSILON || normalized === EPSILON_ALT || normalized === 'eps';
}

/**
 * Deterministic grammar symbol comparator designed for standard academic presentation:
 * Follows operator precedence, standard punctuation, identifiers, epsilon, and end-marker.
 */
export function compareGrammarSymbols(a: string, b: string): number {
  if (a === b) return 0;
  if (a === END_MARKER) return 1;
  if (b === END_MARKER) return -1;
  if (a === EPSILON) return 1;
  if (b === EPSILON) return -1;

  const predefinedRank: Record<string, number> = {
    '(': 10,
    '*': 20,
    '/': 25,
    '%': 28,
    '+': 30,
    '-': 35,
    ')': 40,
    ',': 45,
    ';': 50,
  };

  const rankA = predefinedRank[a];
  const rankB = predefinedRank[b];

  if (rankA !== undefined && rankB !== undefined) {
    return rankA - rankB;
  }
  if (rankA !== undefined && rankB === undefined) {
    if (a === '(') return -1;
    if (a === ')') return 1;
    return -1;
  }
  if (rankA === undefined && rankB !== undefined) {
    if (b === '(') return 1;
    if (b === ')') return -1;
    return 1;
  }

  return a.localeCompare(b);
}

/**
 * Tokenizes a single production side (LHS or RHS alternative).
 * Handles whitespace-separated symbols, apostrophes (E'), punctuation,
 * and alphanumeric multi-character symbols.
 */
export function tokenizeSymbols(text: string, knownNonTerminals: string[] = []): string[] {
  const trimmed = text.trim();
  if (!trimmed) {
    return [];
  }

  // If input is purely whitespace-delimited tokens, split directly
  const rawParts = trimmed.split(/\s+/).filter(Boolean);
  const tokens: string[] = [];

  for (const part of rawParts) {
    if (isEpsilon(part)) {
      tokens.push(EPSILON);
      continue;
    }

    if (knownNonTerminals.includes(part)) {
      tokens.push(part);
      continue;
    }

    if (/^[a-zA-Z_][a-zA-Z0-9_]*'*$/.test(part) || /^[^a-zA-Z0-9_\s]$/.test(part)) {
      tokens.push(part);
    } else {
      const subTokens = subTokenizeConcatenated(part, knownNonTerminals);
      tokens.push(...subTokens);
    }
  }

  return tokens;
}

function subTokenizeConcatenated(str: string, knownNonTerminals: string[]): string[] {
  const tokens: string[] = [];
  let i = 0;
  const sortedNTs = [...knownNonTerminals].sort((a, b) => b.length - a.length);

  while (i < str.length) {
    let matchedNT = false;
    for (const nt of sortedNTs) {
      if (str.startsWith(nt, i)) {
        tokens.push(nt);
        i += nt.length;
        matchedNT = true;
        break;
      }
    }
    if (matchedNT) continue;

    if (str[i] === EPSILON) {
      tokens.push(EPSILON);
      i++;
      continue;
    }
    if (str.slice(i).toLowerCase().startsWith(EPSILON_ALT)) {
      tokens.push(EPSILON);
      i += EPSILON_ALT.length;
      continue;
    }

    const identMatch = str.slice(i).match(/^[a-zA-Z_][a-zA-Z0-9_]*'*/);
    if (identMatch) {
      const match = identMatch[0];
      if (isEpsilon(match)) {
        tokens.push(EPSILON);
      } else {
        tokens.push(match);
      }
      i += match.length;
      continue;
    }

    const numMatch = str.slice(i).match(/^[0-9]+/);
    if (numMatch) {
      tokens.push(numMatch[0]);
      i += numMatch[0].length;
      continue;
    }

    tokens.push(str[i]);
    i++;
  }

  return tokens;
}
