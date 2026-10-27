import { describe, it, expect } from 'vitest';
import { validateAndParseGrammar } from '../core/grammarValidation';
import { buildParsingTable } from '../core/parsingTable';
import { parseInputStringLL1 } from '../core/stringParser';

describe('LL(1) Predictive String Parser', () => {
  const exprGrammarRaw = `
    E -> T E'
    E' -> + T E' | ε
    T -> F T'
    T' -> * F T' | ε
    F -> ( E ) | id
  `;
  const { grammar } = validateAndParseGrammar(exprGrammarRaw);
  const table = buildParsingTable(grammar!);

  it('successfully parses valid expression "id + id * id"', () => {
    const result = parseInputStringLL1('id + id * id', grammar!, table);
    expect(result.success).toBe(true);
    expect(result.steps.length).toBeGreaterThan(0);
    const lastStep = result.steps[result.steps.length - 1];
    expect(lastStep.type).toBe('accept');
  });

  it('successfully parses nested expression "( id + id ) * id"', () => {
    const result = parseInputStringLL1('( id + id ) * id', grammar!, table);
    expect(result.success).toBe(true);
    expect(result.steps[result.steps.length - 1].type).toBe('accept');
  });

  it('rejects invalid syntax with unexpected consecutive operators "id + + id"', () => {
    const result = parseInputStringLL1('id + + id', grammar!, table);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/syntax error/i);
    expect(result.steps.some((s) => s.type === 'error')).toBe(true);
  });

  it('rejects input with undeclared terminal tokens', () => {
    const result = parseInputStringLL1('id + foo', grammar!, table);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/unexpected token 'foo'/i);
  });

  it('refuses to parse on grammar with LL(1) conflicts', () => {
    const conflictRaw = `
      S -> a A | a B
      A -> b
      B -> c
    `;
    const { grammar: confGrammar } = validateAndParseGrammar(conflictRaw);
    const confTable = buildParsingTable(confGrammar!);
    const result = parseInputStringLL1('a b', confGrammar!, confTable);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/conflicts/i);
  });
});
