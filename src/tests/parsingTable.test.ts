import { describe, it, expect } from 'vitest';
import { validateAndParseGrammar } from '../core/grammarValidation';
import { buildParsingTable } from '../core/parsingTable';
import { END_MARKER } from '../core/types';

describe('LL(1) Predictive Parsing Table', () => {
  it('builds a conflict-free LL(1) table for standard expression grammar', () => {
    const raw = `
      E -> T E'
      E' -> + T E' | ε
      T -> F T'
      T' -> * F T' | ε
      F -> ( E ) | id
    `;
    const { grammar } = validateAndParseGrammar(raw);
    const table = buildParsingTable(grammar!);

    expect(table.isLL1).toBe(true);
    expect(table.conflicts).toHaveLength(0);

    // Check key table cells
    expect(table.cells['E']['id'].map((p) => p.raw)).toEqual(["E -> T E'"]);
    expect(table.cells['E']['('].map((p) => p.raw)).toEqual(["E -> T E'"]);
    expect(table.cells["E'"]['+'].map((p) => p.raw)).toEqual(["E' -> + T E'"]);
    expect(table.cells["E'"][')'].map((p) => p.raw)).toEqual(["E' -> ε"]);
    expect(table.cells["E'"][END_MARKER].map((p) => p.raw)).toEqual(["E' -> ε"]);

    // Check empty cells
    expect(table.cells['E']['+']).toHaveLength(0);
    expect(table.cells['E'][END_MARKER]).toHaveLength(0);
  });

  it('builds a conflict-free table for nullable grammar', () => {
    const raw = `
      S -> A B
      A -> a | ε
      B -> b | ε
    `;
    const { grammar } = validateAndParseGrammar(raw);
    const table = buildParsingTable(grammar!);

    expect(table.isLL1).toBe(true);
    expect(table.conflicts).toHaveLength(0);
    expect(table.cells['A']['a'].map((p) => p.raw)).toEqual(['A -> a']);
    expect(table.cells['A']['b'].map((p) => p.raw)).toEqual(['A -> ε']);
    expect(table.cells['A'][END_MARKER].map((p) => p.raw)).toEqual(['A -> ε']);
  });

  it('detects FIRST/FIRST conflict', () => {
    const raw = `
      S -> a A | a B
      A -> b
      B -> c
    `;
    const { grammar } = validateAndParseGrammar(raw);
    const table = buildParsingTable(grammar!);

    expect(table.isLL1).toBe(false);
    expect(table.conflicts.length).toBeGreaterThan(0);

    const sConflict = table.conflicts.find(
      (c) => c.nonTerminal === 'S' && c.terminal === 'a'
    );
    expect(sConflict).toBeDefined();
    expect(sConflict?.conflictType).toBe('FIRST_FIRST');
    expect(sConflict?.productions.map((p) => p.raw)).toContain('S -> a A');
    expect(sConflict?.productions.map((p) => p.raw)).toContain('S -> a B');
  });

  it('detects FIRST/FOLLOW conflict on dangling else', () => {
    const raw = `
      S -> if cond then S S' | other
      S' -> else S | ε
    `;
    const { grammar } = validateAndParseGrammar(raw);
    const table = buildParsingTable(grammar!);

    expect(table.isLL1).toBe(false);
    const sPrimeConflict = table.conflicts.find(
      (c) => c.nonTerminal === "S'" && c.terminal === 'else'
    );
    expect(sPrimeConflict).toBeDefined();
    expect(sPrimeConflict?.conflictType).toBe('FIRST_FOLLOW');
  });

  it('detects conflict on left-recursive grammar', () => {
    const raw = `
      E -> E + T | T
      T -> id
    `;
    const { grammar } = validateAndParseGrammar(raw);
    const table = buildParsingTable(grammar!);

    expect(table.isLL1).toBe(false);
    const eConflict = table.conflicts.find(
      (c) => c.nonTerminal === 'E' && c.terminal === 'id'
    );
    expect(eConflict).toBeDefined();
  });
});
