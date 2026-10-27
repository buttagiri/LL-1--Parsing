import type { Grammar, ValidationResult } from './types';
import { validateAndParseGrammar } from './grammarValidation';

/**
 * Parses raw grammar input string and returns the parsed grammar or validation errors.
 */
export function parseGrammar(input: string): ValidationResult {
  return validateAndParseGrammar(input);
}

/**
 * Helper to check if a symbol in a grammar is a non-terminal.
 */
export function isNonTerminal(symbol: string, grammar: Grammar): boolean {
  return grammar.nonTerminals.includes(symbol);
}

/**
 * Helper to check if a symbol in a grammar is a terminal.
 */
export function isTerminal(symbol: string, grammar: Grammar): boolean {
  return grammar.terminals.includes(symbol);
}
