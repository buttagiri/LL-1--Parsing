import { describe, it, expect } from 'vitest';
import { validateAndParseGrammar } from '../core/grammarValidation';
import { EPSILON } from '../core/types';

describe('Grammar Validation & Parser', () => {
  it('parses valid grammar with multiple alternatives and apostrophes', () => {
    const raw = `
      E -> T E'
      E' -> + T E' | ε
      T -> F T'
      T' -> * F T' | ε
      F -> ( E ) | id
    `;
    const res = validateAndParseGrammar(raw);
    expect(res.isValid).toBe(true);
    expect(res.grammar).toBeDefined();
    expect(res.grammar?.startSymbol).toBe('E');
    expect(res.grammar?.nonTerminals).toEqual(['E', "E'", 'T', "T'", 'F']);
    expect(res.grammar?.terminals).toContain('+');
    expect(res.grammar?.terminals).toContain('*');
    expect(res.grammar?.terminals).toContain('(');
    expect(res.grammar?.terminals).toContain(')');
    expect(res.grammar?.terminals).toContain('id');
  });

  it('rejects empty grammar', () => {
    const res = validateAndParseGrammar('   \n  \t  ');
    expect(res.isValid).toBe(false);
    expect(res.errors[0].message).toMatch(/cannot be empty/i);
  });

  it('detects missing production arrow', () => {
    const raw = `
      E -> T E'
      E' + T E'
    `;
    const res = validateAndParseGrammar(raw);
    expect(res.isValid).toBe(false);
    expect(res.errors.some((e) => e.message.includes('Missing production arrow'))).toBe(true);
  });

  it('detects undefined non-terminals', () => {
    const raw = `
      E -> T X
      T -> id
    `;
    const res = validateAndParseGrammar(raw);
    expect(res.isValid).toBe(false);
    expect(res.errors.some((e) => e.message.includes("Undefined non-terminal 'X'"))).toBe(true);
  });

  it('detects epsilon mixed with other symbols in the same alternative', () => {
    const raw = `
      A -> a ε
    `;
    const res = validateAndParseGrammar(raw);
    expect(res.isValid).toBe(false);
    expect(res.errors.some((e) => e.message.includes('Epsilon (ε) cannot appear alongside'))).toBe(true);
  });

  it('detects empty alternative', () => {
    const raw = `
      A -> a | | b
    `;
    const res = validateAndParseGrammar(raw);
    expect(res.isValid).toBe(false);
    expect(res.errors.some((e) => e.message.includes('Empty alternative found'))).toBe(true);
  });

  it('handles duplicate productions gracefully with a warning', () => {
    const raw = `
      A -> a | a
    `;
    const res = validateAndParseGrammar(raw);
    expect(res.isValid).toBe(true);
    expect(res.grammar?.productions.length).toBe(1);
    expect(res.errors.some((e) => e.severity === 'warning')).toBe(true);
  });

  it('supports Unicode arrow → as well as ASCII ->', () => {
    const raw = `
      S → a S | b
    `;
    const res = validateAndParseGrammar(raw);
    expect(res.isValid).toBe(true);
    expect(res.grammar?.productions.length).toBe(2);
  });

  it('supports "epsilon" keyword as canonical ε', () => {
    const raw = `
      S -> a | epsilon
    `;
    const res = validateAndParseGrammar(raw);
    expect(res.isValid).toBe(true);
    const epsProd = res.grammar?.productions.find((p) => p.rhs.includes(EPSILON));
    expect(epsProd).toBeDefined();
  });
});
