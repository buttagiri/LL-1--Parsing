import type { Grammar, Production, ValidationError, ValidationResult } from './types';
import { EPSILON } from './types';
import { isEpsilon, tokenizeSymbols } from './tokenizer';

/**
 * Validates and parses raw grammar text into a structured Grammar object.
 */
export function validateAndParseGrammar(rawText: string): ValidationResult {
  const errors: ValidationError[] = [];

  const trimmedText = rawText.trim();
  if (!trimmedText) {
    return {
      isValid: false,
      errors: [
        {
          message: 'Grammar cannot be empty. Please enter context-free grammar production rules.',
          severity: 'error',
        },
      ],
    };
  }

  const rawLines = rawText.split(/\r?\n/);
  interface ParsedLine {
    lineNumber: number;
    lhs: string;
    rhsParts: string[];
  }

  const parsedLines: ParsedLine[] = [];
  const nonTerminalSet = new Set<string>();
  const nonTerminalsOrdered: string[] = [];

  // Pass 1: Parse LHS and identify all Non-Terminals
  for (let i = 0; i < rawLines.length; i++) {
    const lineNumber = i + 1;
    const line = rawLines[i].trim();

    // Skip empty lines and comment lines (e.g. // or #)
    if (!line || line.startsWith('//') || line.startsWith('#')) {
      continue;
    }

    // Check for arrow: -> or →
    const arrowMatch = line.match(/->|→/);
    if (!arrowMatch || arrowMatch.index === undefined) {
      errors.push({
        line: lineNumber,
        message: `Line ${lineNumber}: Missing production arrow (-> or →). Expected format: NonTerminal -> symbols.`,
        severity: 'error',
      });
      continue;
    }

    const lhsRaw = line.slice(0, arrowMatch.index).trim();
    const rhsRaw = line.slice(arrowMatch.index + arrowMatch[0].length).trim();

    if (!lhsRaw) {
      errors.push({
        line: lineNumber,
        message: `Line ${lineNumber}: Missing left-hand side non-terminal before arrow.`,
        severity: 'error',
      });
      continue;
    }

    // Validate LHS is a single valid identifier (letters, digits, underscores, apostrophes)
    if (isEpsilon(lhsRaw)) {
      errors.push({
        line: lineNumber,
        message: `Line ${lineNumber}: Epsilon cannot be used as a left-hand side non-terminal.`,
        severity: 'error',
      });
      continue;
    }

    if (!/^[a-zA-Z_][a-zA-Z0-9_]*'*$/.test(lhsRaw)) {
      errors.push({
        line: lineNumber,
        message: `Line ${lineNumber}: Invalid left-hand side '${lhsRaw}'. LHS must be a single non-terminal (e.g. E, E', Expr).`,
        severity: 'error',
      });
      continue;
    }

    if (!rhsRaw) {
      errors.push({
        line: lineNumber,
        message: `Line ${lineNumber}: Missing right-hand side symbols after arrow. For an empty production, explicitly use 'ε' or 'epsilon'.`,
        severity: 'error',
      });
      continue;
    }

    // Check for empty alternatives (e.g. | b or a | or a || b)
    const rawAlternatives = rhsRaw.split('|').map((alt) => alt.trim());
    let hasEmptyAlt = false;

    for (const alt of rawAlternatives) {
      if (!alt) {
        errors.push({
          line: lineNumber,
          message: `Line ${lineNumber}: Empty alternative found. To produce the empty string, explicitly use 'ε' or 'epsilon'.`,
          severity: 'error',
        });
        hasEmptyAlt = true;
        break;
      }
    }

    if (hasEmptyAlt) {
      continue;
    }

    if (!nonTerminalSet.has(lhsRaw)) {
      nonTerminalSet.add(lhsRaw);
      nonTerminalsOrdered.push(lhsRaw);
    }

    parsedLines.push({
      lineNumber,
      lhs: lhsRaw,
      rhsParts: rawAlternatives,
    });
  }

  // If pass 1 encountered fatal syntax errors, return them
  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
    };
  }

  if (parsedLines.length === 0) {
    return {
      isValid: false,
      errors: [
        {
          message: 'No valid production rules found. Please define at least one production (e.g. S -> a).',
          severity: 'error',
        },
      ],
    };
  }

  // Pass 2: Tokenize RHS alternatives, validate symbols and epsilon usage
  const productions: Production[] = [];
  const terminalSet = new Set<string>();
  const terminalsOrdered: string[] = [];
  const seenProductions = new Set<string>();
  let prodCount = 1;

  for (const pl of parsedLines) {
    for (const altText of pl.rhsParts) {
      const tokens = tokenizeSymbols(altText, nonTerminalsOrdered);

      if (tokens.length === 0) {
        errors.push({
          line: pl.lineNumber,
          message: `Line ${pl.lineNumber}: Empty alternative found in production for '${pl.lhs}'.`,
          severity: 'error',
        });
        continue;
      }

      // Check epsilon usage: cannot be mixed with other symbols
      const epsilonIndex = tokens.indexOf(EPSILON);
      if (epsilonIndex !== -1 && tokens.length > 1) {
        errors.push({
          line: pl.lineNumber,
          message: `Line ${pl.lineNumber}: Epsilon (ε) cannot appear alongside other symbols in the same alternative '${altText}'. Epsilon must appear alone (e.g. ${pl.lhs} -> ε).`,
          severity: 'error',
        });
        continue;
      }

      // Check for undefined non-terminals:
      // An uppercase word or symbol ending with apostrophe not in nonTerminalSet
      for (const tok of tokens) {
        if (tok === EPSILON) continue;

        if (nonTerminalSet.has(tok)) {
          // Valid non-terminal
          continue;
        }

        // Heuristic: uppercase identifier or ending in prime is intended as a non-terminal
        if (/^[A-Z][a-zA-Z0-9_]*'*$/.test(tok) || /'*$/.test(tok) && tok.includes("'")) {
          errors.push({
            line: pl.lineNumber,
            message: `Line ${pl.lineNumber}: Undefined non-terminal '${tok}'. Add a production for '${tok}' or correct the symbol.`,
            severity: 'error',
          });
          continue;
        }

        // Otherwise, it is a terminal symbol
        if (!terminalSet.has(tok)) {
          terminalSet.add(tok);
          terminalsOrdered.push(tok);
        }
      }

      // Check duplicate production
      const prodSignature = `${pl.lhs}->${tokens.join(' ')}`;
      if (seenProductions.has(prodSignature)) {
        errors.push({
          line: pl.lineNumber,
          message: `Line ${pl.lineNumber}: Duplicate production rule '${pl.lhs} -> ${tokens.join(' ')}' ignored.`,
          severity: 'warning',
        });
        continue;
      }
      seenProductions.add(prodSignature);

      const production: Production = {
        id: `P${prodCount++}`,
        lhs: pl.lhs,
        rhs: tokens,
        raw: `${pl.lhs} -> ${tokens.join(' ')}`,
        originalLine: pl.lineNumber,
      };

      productions.push(production);
    }
  }

  const fatalErrors = errors.filter((e) => e.severity === 'error');
  if (fatalErrors.length > 0) {
    return {
      isValid: false,
      errors,
    };
  }

  const startSymbol = nonTerminalsOrdered[0];

  const grammar: Grammar = {
    productions,
    nonTerminals: nonTerminalsOrdered,
    terminals: terminalsOrdered,
    startSymbol,
  };

  return {
    isValid: true,
    errors,
    grammar,
  };
}
