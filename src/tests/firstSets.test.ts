import { describe, it, expect } from 'vitest';
import { validateAndParseGrammar } from '../core/grammarValidation';
import { computeFirstSets, calculateFirstOfSequence } from '../core/firstSets';
import { EPSILON } from '../core/types';

describe('FIRST Set Calculation', () => {
  it('computes correct FIRST sets for standard expression grammar', () => {
    const raw = `
      E -> T E'
      E' -> + T E' | ε
      T -> F T'
      T' -> * F T' | ε
      F -> ( E ) | id
    `;
    const { grammar } = validateAndParseGrammar(raw);
    const { firstSets } = computeFirstSets(grammar!);

    expect(firstSets['E']).toEqual(['(', 'id']);
    expect(firstSets["E'"]).toEqual(['+', EPSILON]);
    expect(firstSets['T']).toEqual(['(', 'id']);
    expect(firstSets["T'"]).toEqual(['*', EPSILON]);
    expect(firstSets['F']).toEqual(['(', 'id']);
  });

  it('computes correct FIRST sets for nullable grammar with epsilon propagation', () => {
    const raw = `
      S -> A B
      A -> a | ε
      B -> b | ε
    `;
    const { grammar } = validateAndParseGrammar(raw);
    const { firstSets } = computeFirstSets(grammar!);

    expect(firstSets['S']).toEqual(['a', 'b', EPSILON]);
    expect(firstSets['A']).toEqual(['a', EPSILON]);
    expect(firstSets['B']).toEqual(['b', EPSILON]);
  });

  it('handles direct left recursion without infinite loop', () => {
    const raw = `
      E -> E + T | T
      T -> id
    `;
    const { grammar } = validateAndParseGrammar(raw);
    const { firstSets } = computeFirstSets(grammar!);

    expect(firstSets['E']).toEqual(['id']);
    expect(firstSets['T']).toEqual(['id']);
  });

  it('handles indirect mutual recursion', () => {
    const raw = `
      A -> B a
      B -> A b | c
    `;
    const { grammar } = validateAndParseGrammar(raw);
    const { firstSets } = computeFirstSets(grammar!);

    expect(firstSets['A']).toEqual(['c']);
    expect(firstSets['B']).toEqual(['c']);
  });

  it('correctly calculates FIRST of a sequence of symbols', () => {
    const raw = `
      A -> a | ε
      B -> b | ε
      C -> c
    `;
    const { grammar } = validateAndParseGrammar(raw);
    const { firstSetsMap } = computeFirstSets(grammar!);

    // Sequence [A, B] -> both nullable -> { a, b, ε }
    const seqAB = calculateFirstOfSequence(['A', 'B'], firstSetsMap, grammar!);
    expect(Array.from(seqAB).sort()).toEqual(['a', 'b', EPSILON].sort());

    // Sequence [A, B, C] -> C is not nullable -> { a, b, c } (no ε)
    const seqABC = calculateFirstOfSequence(['A', 'B', 'C'], firstSetsMap, grammar!);
    expect(Array.from(seqABC).sort()).toEqual(['a', 'b', 'c'].sort());

    // Sequence [C, A] -> C is first and not nullable -> { c }
    const seqCA = calculateFirstOfSequence(['C', 'A'], firstSetsMap, grammar!);
    expect(Array.from(seqCA)).toEqual(['c']);
  });
});
