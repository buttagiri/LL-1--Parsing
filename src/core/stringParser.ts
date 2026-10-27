import type { Grammar, ParsingTable, ParseStep, StringParseResult } from './types';
import { END_MARKER, EPSILON } from './types';
import { tokenizeSymbols } from './tokenizer';

/**
 * Parses an input string step-by-step using the LL(1) predictive parsing table.
 */
export function parseInputStringLL1(
  input: string,
  grammar: Grammar,
  table: ParsingTable
): StringParseResult {
  const steps: ParseStep[] = [];

  if (!table.isLL1) {
    return {
      success: false,
      steps: [],
      error: 'Cannot parse string: The grammar contains LL(1) parsing table conflicts. Resolve conflicts or use an unambiguous LL(1) grammar.',
    };
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return {
      success: false,
      steps: [],
      error: 'Input string cannot be empty. Enter tokens separated by spaces, e.g. "id + id".',
    };
  }

  // Tokenize input string using known terminals
  const rawTokens = tokenizeSymbols(trimmed, []);
  if (rawTokens.length === 0) {
    return {
      success: false,
      steps: [],
      error: 'Could not tokenize input string.',
    };
  }

  // Validate that all tokens exist in the grammar terminals (except optional $)
  for (const token of rawTokens) {
    if (token === END_MARKER) continue;
    if (!grammar.terminals.includes(token)) {
      return {
        success: false,
        steps: [],
        error: `Unexpected token '${token}'. Valid terminal symbols for this grammar are: ${grammar.terminals.join(', ') || 'none'}`,
      };
    }
  }

  // Append $ automatically if not already present at the end
  const tokens = [...rawTokens];
  if (tokens[tokens.length - 1] !== END_MARKER) {
    tokens.push(END_MARKER);
  }

  // Initialize Stack: Bottom is $, Top is Start Symbol
  // In array representation: index 0 is bottom ($), last element is top of stack
  const stack: string[] = [END_MARKER, grammar.startSymbol];
  let cursor = 0;
  let stepCount = 1;
  const maxSteps = 500;

  while (stack.length > 0 && stepCount <= maxSteps) {
    const top = stack[stack.length - 1];
    const lookahead = tokens[cursor] || END_MARKER;

    const currentStackStr = stack.join(' ');
    const currentInputStr = tokens.slice(cursor).join(' ');

    // Case 1: Match end markers
    if (top === END_MARKER && lookahead === END_MARKER) {
      steps.push({
        step: stepCount++,
        stack: currentStackStr,
        remainingInput: currentInputStr,
        action: 'Accept',
        type: 'accept',
        details: 'Input successfully parsed according to LL(1) grammar.',
      });
      return {
        success: true,
        steps,
      };
    }

    // Case 2: Top matches lookahead terminal
    if (top === lookahead) {
      steps.push({
        step: stepCount++,
        stack: currentStackStr,
        remainingInput: currentInputStr,
        action: `Match '${lookahead}'`,
        type: 'match',
        details: `Terminal '${lookahead}' matched and popped from stack.`,
      });
      stack.pop();
      cursor++;
      continue;
    }

    // Case 3: Top is a non-terminal -> Expand production from table M[top, lookahead]
    if (grammar.nonTerminals.includes(top)) {
      const prods = table.cells[top]?.[lookahead] || [];

      if (prods.length === 0) {
        steps.push({
          step: stepCount++,
          stack: currentStackStr,
          remainingInput: currentInputStr,
          action: `Error: No entry in M[${top}, ${lookahead}]`,
          type: 'error',
          details: `Predictive parsing error: Non-terminal '${top}' cannot expand on lookahead '${lookahead}'.`,
        });
        return {
          success: false,
          steps,
          error: `Syntax error at lookahead '${lookahead}': No rule in parsing table M[${top}, ${lookahead}].`,
        };
      }

      if (prods.length > 1) {
        steps.push({
          step: stepCount++,
          stack: currentStackStr,
          remainingInput: currentInputStr,
          action: `Error: Conflict in M[${top}, ${lookahead}]`,
          type: 'error',
          details: `Multiple rules found: ${prods.map((p) => p.raw).join(' | ')}`,
        });
        return {
          success: false,
          steps,
          error: `Ambiguous transition in M[${top}, ${lookahead}].`,
        };
      }

      const prod = prods[0];
      stack.pop();

      // Push RHS in reverse order, unless RHS is epsilon
      if (!(prod.rhs.length === 1 && prod.rhs[0] === EPSILON)) {
        for (let i = prod.rhs.length - 1; i >= 0; i--) {
          stack.push(prod.rhs[i]);
        }
      }

      steps.push({
        step: stepCount++,
        stack: currentStackStr,
        remainingInput: currentInputStr,
        action: `Output ${prod.raw}`,
        type: 'expand',
        details: `Expanded non-terminal '${top}' using production ${prod.raw}.`,
      });
      continue;
    }

    // Case 4: Top is a terminal but does not match lookahead
    steps.push({
      step: stepCount++,
      stack: currentStackStr,
      remainingInput: currentInputStr,
      action: `Error: Expected '${top}', found '${lookahead}'`,
      type: 'error',
      details: `Terminal mismatch on stack: Expected '${top}' but input token is '${lookahead}'.`,
    });

    return {
      success: false,
      steps,
      error: `Syntax error: Expected terminal '${top}', but found '${lookahead}'.`,
    };
  }

  if (stepCount > maxSteps) {
    return {
      success: false,
      steps,
      error: 'Parsing step limit exceeded (infinite loop safety limit reached).',
    };
  }

  return {
    success: false,
    steps,
    error: 'Unexpected end of parsing without acceptance.',
  };
}
