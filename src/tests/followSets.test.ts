import { describe, it, expect } from 'vitest';
import { validateAndParseGrammar } from '../core/grammarValidation';
import { computeFollowSets } from '../core/followSets';
import { END_MARKER, EPSILON } from '../core/types';

describe('FOLLOW Set Calculation', () => {
  it('computes correct FOLLOW sets for standard expression grammar', () => {
    const raw = `
      E -> T E'
      E' -> + T E' | ε
      T -> F T'
      T' -> * F T' | ε
      F -> ( E ) | id
    `;
    const { grammar } = validateAndParseGrammar(raw);
    const { followSets } = computeFollowSets(grammar!);

    expect(followSets['E']).toEqual([')', END_MARKER]);
    expect(followSets["E'"]).toEqual([')', END_MARKER]);
    expect(followSets['T']).toEqual(['+', ')', END_MARKER]);
    expect(followSets["T'"]).toEqual(['+', ')', END_MARKER]);
    expect(followSets['F']).toEqual(['*', '+', ')', END_MARKER]);
  });

  it('computes correct FOLLOW sets for nullable grammar', () => {
    const raw = `
      S -> A B
      A -> a | ε
      B -> b | ε
    `;
    const { grammar } = validateAndParseGrammar(raw);
    const { followSets } = computeFollowSets(grammar!);

    expect(followSets['S']).toEqual([END_MARKER]);
    expect(followSets['A']).toEqual(['b', END_MARKER]);
    expect(followSets['B']).toEqual([END_MARKER]);
  });

  it('handles repeated non-terminals in productions', () => {
    const raw = `
      S -> A b A
      A -> a
    `;
    const { grammar } = validateAndParseGrammar(raw);
    const { followSets } = computeFollowSets(grammar!);

    expect(followSets['S']).toEqual([END_MARKER]);
    expect(followSets['A']).toEqual(['b', END_MARKER]);
  });

  it('never contains epsilon in any FOLLOW set', () => {
    const raw = `
      S -> A B C
      A -> a | ε
      B -> b | ε
      C -> c | ε
    `;
    const { grammar } = validateAndParseGrammar(raw);
    const { followSets } = computeFollowSets(grammar!);

    for (const nt of Object.keys(followSets)) {
      expect(followSets[nt]).not.toContain(EPSILON);
    }
  });

  it('handles mutually dependent FOLLOW sets across multiple productions', () => {
    const raw = `
      S -> a A | b B
      A -> c S
      B -> d S
    `;
    const { grammar } = validateAndParseGrammar(raw);
    const { followSets } = computeFollowSets(grammar!);

    expect(followSets['S']).toContain(END_MARKER);
    expect(followSets['A']).toContain(END_MARKER);
    expect(followSets['B']).toContain(END_MARKER);
  });
});
