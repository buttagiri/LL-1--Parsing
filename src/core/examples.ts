export interface ExampleGrammar {
  id: string;
  name: string;
  category: 'LL(1)' | 'Conflict' | 'Nullable' | 'Left-Recursive';
  description: string;
  grammar: string;
  defaultInput?: string;
  expectedProperties: string;
}

export const EXAMPLE_GRAMMARS: ExampleGrammar[] = [
  {
    id: 'standard-expr',
    name: '1. Standard Arithmetic Expressions',
    category: 'LL(1)',
    description: 'Classic unambiguous arithmetic grammar with operator precedence (+, *) and parentheses.',
    grammar: `E -> T E'
E' -> + T E' | ε
T -> F T'
T' -> * F T' | ε
F -> ( E ) | id`,
    defaultInput: 'id + id * id',
    expectedProperties: 'Unambiguous LL(1) grammar with 0 conflicts. Demonstrates elimated left-recursion with primes.',
  },
  {
    id: 'nullable-propagation',
    name: '2. Nullable Grammar (Epsilon Propagation)',
    category: 'Nullable',
    description: 'Demonstrates multi-symbol epsilon derivation and FOLLOW propagation across nullable non-terminals.',
    grammar: `S -> A B
A -> a | ε
B -> b | ε`,
    defaultInput: 'a b',
    expectedProperties: 'Conflict-free LL(1). FIRST(S) = { a, b, ε }. FOLLOW(A) includes FIRST(B) and FOLLOW(S).',
  },
  {
    id: 'first-first-conflict',
    name: '3. LL(1) FIRST/FIRST Conflict',
    category: 'Conflict',
    description: 'Two production alternatives for S share the common prefix terminal "a", causing non-determinism.',
    grammar: `S -> a A | a B
A -> b
B -> c`,
    defaultInput: 'a b',
    expectedProperties: 'Not LL(1). Produces FIRST/FIRST conflict at M[S, a]. Requires left-factoring to become LL(1).',
  },
  {
    id: 'left-recursion',
    name: '4. Direct Left-Recursive Grammar',
    category: 'Left-Recursive',
    description: 'Direct left recursion (E -> E + T). Algorithms terminate safely and highlight LL(1) incompatibility.',
    grammar: `E -> E + T | T
T -> id`,
    defaultInput: 'id + id',
    expectedProperties: 'Not LL(1). Algorithms terminate without freezing. Table cell M[E, id] contains multiple rules.',
  },
  {
    id: 'if-then-else',
    name: '5. Conditional Statement (Dangling Else)',
    category: 'Conflict',
    description: 'Classic programming language ambiguity showing FIRST/FOLLOW conflict at lookahead "else".',
    grammar: `S -> if cond then S S' | other
S' -> else S | ε`,
    defaultInput: 'if cond then other else other',
    expectedProperties: 'Not LL(1). FIRST/FOLLOW conflict at M[S\', else] between expanding "else S" and deriving ε.',
  },
];
