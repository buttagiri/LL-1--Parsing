# LL(1) Parser Visualizer

> **Interactive FIRST, FOLLOW, and Predictive Parsing Table Generator**
> Academic Compiler Design Mini-Project

![LL(1) Parser Visualizer Preview](https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/cpu.svg)

---

## 1. Project Overview

The **LL(1) Parser Visualizer** is a responsive, web-based educational developer tool designed for compiler design courses and demonstrations. It interactively analyzes Context-Free Grammars (CFGs) and independently executes the three foundational operations of top-down predictive parsing:

1. **FIRST Set Calculation** — Computes lookahead sets for all non-terminals using an iterative fixed-point algorithm that handles cyclic, recursive, and nullable grammars safely without freezing.
2. **FOLLOW Set Calculation** — Computes context following sets with proper end-marker (`$`) propagation and guarantees that $\epsilon$ is never placed in any FOLLOW set.
3. **LL(1) Predictive Parsing Table Construction** — Dynamically constructs matrix $M[A, a]$ and detects, highlights, and explains **FIRST/FIRST** and **FIRST/FOLLOW** parsing table conflicts.
4. **Step-by-Step String Parser (Automata Simulator)** — An interactive pushdown stack simulation tracing tokens against table rules with step-by-step stack inspection, actions (`Expand`, `Match`, `Accept`, `Error`), and clear syntax diagnosis.

All operations share the same grammar input in the editor, allowing instant exploration without re-entering grammar rules.

---

## 2. Key Features

- **Real-Time Context-Free Grammar Validation**: Detects empty inputs, missing arrows, undefined non-terminals, invalid left-hand sides, empty alternatives, and illegal $\epsilon$ mixtures.
- **Independent Operations**: Separate tabs/buttons for FIRST, FOLLOW, LL(1) Table, and String Parser. Intermediate results are cached but strictly invalidated whenever grammar text is edited.
- **Cycle-Safe Iterative Fixed-Point Engine**: Built with robust convergence loops; cyclic and direct/indirect left-recursive grammars terminate cleanly without stack overflow.
- **Detailed LL(1) Conflict Diagnostics**: Identifies the exact conflicting cells $M[A, a]$, lists competing productions, and provides actionable advice (e.g. left-factoring or eliminating left recursion).
- **One-Click Preloaded Examples**:
  - *1. Standard Arithmetic Expressions* (Unambiguous LL(1))
  - *2. Nullable Grammar* (Epsilon Propagation across sequences)
  - *3. FIRST/FIRST Conflict* (Common prefixes requiring left-factoring)
  - *4. Direct Left-Recursive Grammar* (Highlights LL(1) incompatibility)
  - *5. Dangling Else* (FIRST/FOLLOW lookahead conflict)
- **One-Click Copy Results**: Copy FIRST sets, FOLLOW sets, text-based parsing tables, or execution traces formatted for academic assignments and reports.
- **Compiler Developer-Tool Aesthetics**: Dark navy/charcoal IDE theme, monospace editor with synchronized line numbers, quick-insert symbol bar ($\epsilon$, `->`, `|`, `'`), and responsive tables with sticky headers.

---

## 3. Technology Stack

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v4 (dark compiler-themed UI)
- **Icons**: Lucide React
- **Test Framework**: Vitest + React Testing Library + JSDOM
- **Execution Runtime**: Node.js (v18+)

---

## 4. Supported Grammar Syntax

| Element | Format / Examples | Notes |
| :--- | :--- | :--- |
| **Production Rule** | `E -> T E'` or `E → T E'` | One rule per line. Standard ASCII `->` and Unicode `→` supported. |
| **Alternatives** | `F -> ( E ) \| id` | Alternatives separated by pipe `\|`. Empty alternatives are prohibited. |
| **Non-Terminals** | `E`, `E'`, `T_1`, `Expr` | Defined by appearance on the Left-Hand Side (LHS). Supports primes (`'`). |
| **Terminals** | `+`, `*`, `(`, `)`, `;`, `id`, `num` | Inferred automatically: Any symbol on the RHS not appearing on any LHS. |
| **Epsilon** | `ε` or `epsilon` | Must appear alone as the RHS of an alternative (e.g. `A -> ε`). |
| **End Marker** | `$` | Input end-marker; automatically placed in `FOLLOW(StartSymbol)`. |
| **Spacing** | `+ T E'` | Grammar symbols must be separated by spaces for unambiguous tokenization. |

### Example CFG Syntax

```
E -> T E'
E' -> + T E' | ε
T -> F T'
T' -> * F T' | ε
F -> ( E ) | id
```

---

## 5. Theory & Core Algorithms

### 5.1 FIRST Set Algorithm
For any string of grammar symbols $\alpha$:
- If $a$ is a terminal, $\text{FIRST}(a) = \{ a \}$.
- If $X \rightarrow \epsilon$, add $\epsilon$ to $\text{FIRST}(X)$.
- For production $A \rightarrow Y_1 Y_2 \dots Y_k$:
  1. Add all non-$\epsilon$ symbols from $\text{FIRST}(Y_1)$ to $\text{FIRST}(A)$.
  2. If $Y_1 \Rightarrow^* \epsilon$, add non-$\epsilon$ symbols from $\text{FIRST}(Y_2)$, and so on.
  3. If all $Y_1, \dots, Y_k$ can derive $\epsilon$, add $\epsilon$ to $\text{FIRST}(A)$.
- Repeat iteratively over all rules until no set changes (fixed-point convergence).

### 5.2 FOLLOW Set Algorithm
For non-terminals:
1. Place input end-marker `$` in $\text{FOLLOW}(S)$, where $S$ is the grammar's start symbol.
2. For production $A \rightarrow \alpha B \beta$:
   - Add all non-$\epsilon$ symbols of $\text{FIRST}(\beta)$ to $\text{FOLLOW}(B)$.
3. For production $A \rightarrow \alpha B$ or $A \rightarrow \alpha B \beta$ where $\beta \Rightarrow^* \epsilon$:
   - Add everything in $\text{FOLLOW}(A)$ to $\text{FOLLOW}(B)$.
4. Repeat until fixed point is reached. **$\epsilon$ is never added to a FOLLOW set.**

### 5.3 Parsing Table Construction & Conflict Detection
For each production $A \rightarrow \alpha$:
1. For every terminal $a \in \text{FIRST}(\alpha)$ (excluding $\epsilon$), add $A \rightarrow \alpha$ to $M[A, a]$.
2. If $\epsilon \in \text{FIRST}(\alpha)$, then for every terminal $b \in \text{FOLLOW}(A)$ (including `$`), add $A \rightarrow \alpha$ to $M[A, b]$.
3. **Conflict Detection**:
   - If $|M[A, a]| > 1$, the grammar is **Not LL(1)**.
   - **FIRST/FIRST Conflict**: Multiple alternatives for $A$ share lookahead terminal $a$ in their FIRST sets.
   - **FIRST/FOLLOW Conflict**: One alternative produces $a$ while a nullable alternative allows $a$ via $\text{FOLLOW}(A)$.

### 5.4 Grammar Syntax Error vs. LL(1) Conflict

- **Grammar Syntax Error**: A structural defect in the input grammar definition itself (e.g. missing arrow, undeclared non-terminal, invalid epsilon placement). The parser refuses to generate tables from invalid CFGs.
- **LL(1) Conflict**: The grammar is a syntactically valid context-free grammar, but its predictive parsing table contains cells with multiple competing productions. Such grammars cannot be parsed deterministically with 1 token of lookahead without backtracking or transformations.

---

## 6. Installation & Execution (Windows PowerShell)

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm (v9.0.0 or higher)

Verify your installation in PowerShell:
```powershell
node -v
npm -v
```

### Step 1: Install Dependencies
Open Windows PowerShell in the project directory:
```powershell
npm install
```

### Step 2: Run Development Server
```powershell
npm run dev
```
Open `http://localhost:5173` in your web browser.

### Step 3: Run the Automated Test Suite
Execute all 35 compiler and UI integration tests with Vitest:
```powershell
npm test
```

### Step 4: Run Production Build
Verify TypeScript typecheck and compile the production bundle:
```powershell
npm run build
```

To preview the built production bundle locally:
```powershell
npm run preview
```

---

## 7. Project Architecture

```
d:/PROJECT/
├── index.html                     # HTML5 entrypoint with Google Fonts & Meta tags
├── package.json                   # Project metadata, scripts, and dependencies
├── tsconfig.json                  # Root TypeScript configuration
├── tsconfig.app.json              # Client source TypeScript configuration
├── tsconfig.node.json             # Vite toolchain TypeScript configuration
├── vite.config.ts                 # Vite + React + Tailwind CSS + Vitest config
│
├── src/
│   ├── main.tsx                   # React root entrypoint
│   ├── App.tsx                    # Main visualizer layout and state controller
│   ├── index.css                  # Global Tailwind CSS and custom scrollbar styles
│   │
│   ├── core/                      # Pure compiler algorithms (Framework-agnostic)
│   │   ├── types.ts               # Core domain models (Grammar, Production, Table, etc.)
│   │   ├── tokenizer.ts           # CFG symbol tokenizer and academic comparator
│   │   ├── grammarValidation.ts   # Grammar syntax parser & error diagnostics
│   │   ├── grammarParser.ts       # Grammar parsing helper interface
│   │   ├── firstSets.ts           # Iterative fixed-point FIRST set calculator
│   │   ├── followSets.ts          # Iterative fixed-point FOLLOW set calculator
│   │   ├── parsingTable.ts        # LL(1) table generator & conflict detection
│   │   ├── stringParser.ts        # Pushdown stack machine predictive simulator
│   │   └── examples.ts            # Curated academic example grammars
│   │
│   ├── components/                # React UI Components
│   │   ├── Header.tsx             # Top navigation, logo, and guide trigger
│   │   ├── GrammarEditor.tsx      # Code editor with line numbers & quick symbols
│   │   ├── OperationButtons.tsx   # Tabs for FIRST, FOLLOW, Table, and String Parser
│   │   ├── ResultsPanel.tsx       # Results container with copy buttons & stale banner
│   │   ├── FirstSetsView.tsx      # FIRST sets table with nullable indicators
│   │   ├── FollowSetsView.tsx     # FOLLOW sets table with end-marker note
│   │   ├── ParsingTableView.tsx   # Matrix table with sticky headers & conflict alerts
│   │   ├── StringParserView.tsx   # Step-by-step stack machine parsing trace
│   │   ├── ExampleSelector.tsx    # Dropdown selector for preloaded grammars
│   │   ├── ErrorNotification.tsx  # Error cards and toast notification components
│   │   └── TheoryGuideModal.tsx   # Interactive modal explaining compiler theory
│   │
│   ├── utils/
│   │   └── formatOutput.ts        # Text formatters for clean clipboard copying
│   │
│   └── tests/                     # Automated Vitest test suites
│       ├── setup.ts               # Jest-DOM matchers setup
│       ├── grammarValidation.test.ts # CFG parsing & syntax validation tests
│       ├── firstSets.test.ts      # FIRST set algorithm unit tests
│       ├── followSets.test.ts     # FOLLOW set algorithm unit tests
│       ├── parsingTable.test.ts   # Parsing table & conflict detection tests
│       ├── stringParser.test.ts   # String parser simulation tests
│       └── App.test.tsx           # UI component integration tests
```

---

## 8. Test Suite Summary

The automated test suite contains **35 tests across 6 test files**, covering all requirements:

| Test File | Tests | Coverage |
| :--- | :--- | :--- |
| `grammarValidation.test.ts` | 9 | Multi-alternatives, primes (`E'`), empty grammars, missing arrows, undefined non-terminals, epsilon mixtures, duplicate rules, Unicode arrows. |
| `firstSets.test.ts` | 5 | Standard expressions, nullable grammars, direct left-recursion cycles, mutual recursion, multi-symbol sequence calculations. |
| `followSets.test.ts` | 5 | Start-symbol `$`, repeated non-terminals, nullable suffix propagation, multi-production dependencies, $\epsilon$ absence invariant. |
| `parsingTable.test.ts` | 5 | Table cell population, $\epsilon$-rule placement using FOLLOW, FIRST/FIRST conflict detection, dangling else FIRST/FOLLOW conflict, left-recursive conflict. |
| `stringParser.test.ts` | 5 | Successful acceptance of token sequences, nested parenthesis expressions, rejection of invalid token syntax, undeclared terminal rejection, conflict refusal. |
| `App.test.tsx` | 6 | Component rendering, independent tab switching, stale dirty tracking on edit, error view display, modal open/close. |

---

## 9. Screenshots & Visual Interface

| Section | Description |
| :--- | :--- |
| **Grammar Editor** | Monospace editor with line numbers, syntax error highlighting, and quick symbol insertion chips. |
| **FIRST Sets View** | Structured view highlighting nullable non-terminals with mathematical definitions. |
| **FOLLOW Sets View** | Formatted table displaying followers with special notes regarding start symbol `$`. |
| **Parsing Table View** | Color-coded matrix with sticky headers, conflicts highlighted in rose, and grammar statistics. |
| **String Parser Trace**| Step-by-step stack simulation showing Stack, Remaining Input, and Parser Actions. |

*(Screenshots can be captured during demonstration or via web browser preview)*

---

## 10. Limitations & Considerations

1. **Deterministic Lookahead**: The LL(1) parsing technique is strictly limited to 1 token of lookahead ($k=1$). Grammars requiring $k > 1$ tokens (such as general LR(1) or ambiguous grammars) will produce table conflicts.
2. **Left-Recursion**: Grammars with direct or indirect left-recursion cannot be parsed with an LL(1) table without transformation. The visualizer detects and highlights this conflict safely without infinite loops.
3. **Symbol Separation**: Whitespace-separated symbols (e.g. `+ T E'`) are recommended for clear token distinction, especially when multi-character identifiers (`id`, `num`, `while`) are used.

---

## 11. Academic Demonstration Walkthrough

1. **Step 1**: Click **Load Example** and choose *1. Standard Arithmetic Expressions*.
2. **Step 2**: Click **FIRST Sets** to view the computed FIRST sets for `E`, `E'`, `T`, `T'`, and `F`.
3. **Step 3**: Click **FOLLOW Sets** to observe the followers and see why `$` is placed in `FOLLOW(E)`.
4. **Step 4**: Click **LL(1) Table** to examine the conflict-free predictive matrix.
5. **Step 5**: Click **String Parser** and enter `id + id * id` to watch the step-by-step stack expansion and matching in real-time.
6. **Step 6**: Click **Load Example** and choose *3. LL(1) FIRST/FIRST Conflict* to see conflict diagnosis in action.

---

*Developed with React, TypeScript, and Tailwind CSS for Compiler Design Education.*
