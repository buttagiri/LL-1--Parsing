export const EPSILON = 'ε';
export const EPSILON_ALT = 'epsilon';
export const END_MARKER = '$';

export interface Production {
  id: string; // e.g., "P1"
  lhs: string; // Non-terminal
  rhs: string[]; // Sequence of symbols. Epsilon is represented as [EPSILON]
  raw: string; // Formatted string representation e.g. "E -> T E'"
  originalLine?: number;
}

export interface Grammar {
  productions: Production[];
  nonTerminals: string[]; // Deterministic order (order of first appearance)
  terminals: string[]; // Deterministic order
  startSymbol: string;
}

export type FirstSets = Record<string, string[]>;
export type FollowSets = Record<string, string[]>;

export interface TableConflict {
  nonTerminal: string;
  terminal: string;
  productions: Production[];
  conflictType: 'FIRST_FIRST' | 'FIRST_FOLLOW' | 'MULTIPLE_PRODUCTIONS';
  description: string;
}

export interface ParsingTable {
  // M[nonTerminal][terminal] = list of matching productions (more than 1 means conflict)
  cells: Record<string, Record<string, Production[]>>;
  conflicts: TableConflict[];
  isLL1: boolean;
  terminals: string[]; // All terminals + END_MARKER ($)
  nonTerminals: string[];
  stats: {
    nonTerminalsCount: number;
    terminalsCount: number;
    productionsCount: number;
    conflictsCount: number;
  };
}

export interface ValidationError {
  line?: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  grammar?: Grammar;
}

export type ParseActionType = 'expand' | 'match' | 'accept' | 'error';

export interface ParseStep {
  step: number;
  stack: string; // String representation e.g. "$ E"
  remainingInput: string; // String representation e.g. "id + id $"
  action: string;
  type: ParseActionType;
  details?: string;
}

export interface StringParseResult {
  success: boolean;
  steps: ParseStep[];
  error?: string;
}
