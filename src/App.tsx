import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { GrammarEditor } from './components/GrammarEditor';
import { OperationButtons } from './components/OperationButtons';
import type { OperationType } from './components/OperationButtons';
import { ResultsPanel } from './components/ResultsPanel';
import { Toast } from './components/ErrorNotification';
import { TheoryGuideModal } from './components/TheoryGuideModal';
import { EXAMPLE_GRAMMARS } from './core/examples';
import type { ExampleGrammar } from './core/examples';
import { validateAndParseGrammar } from './core/grammarValidation';
import { computeFirstSets } from './core/firstSets';
import { computeFollowSets } from './core/followSets';
import { buildParsingTable } from './core/parsingTable';
import type {
  FirstSets,
  FollowSets,
  Grammar,
  ParsingTable,
  ValidationError,
  ValidationResult,
} from './core/types';

export function App() {
  // Grammar editor state
  const defaultExample = EXAMPLE_GRAMMARS[0];
  const [grammarText, setGrammarText] = useState(defaultExample.grammar);
  const [activeOperation, setActiveOperation] = useState<OperationType>('first');
  const [isDirty, setIsDirty] = useState(false);
  const [defaultInput, setDefaultInput] = useState(defaultExample.defaultInput || 'id + id * id');

  // Computed state
  const [currentGrammar, setCurrentGrammar] = useState<Grammar | undefined>(undefined);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [firstSets, setFirstSets] = useState<FirstSets | undefined>(undefined);
  const [firstSetsMap, setFirstSetsMap] = useState<Record<string, Set<string>> | undefined>(undefined);
  const [followSets, setFollowSets] = useState<FollowSets | undefined>(undefined);
  const [followSetsMap, setFollowSetsMap] = useState<Record<string, Set<string>> | undefined>(undefined);
  const [parsingTable, setParsingTable] = useState<ParsingTable | undefined>(undefined);

  // UI state
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);
  const [isTheoryModalOpen, setIsTheoryModalOpen] = useState(false);

  // Invalidate all results when grammar changes
  const handleGrammarChange = (newText: string) => {
    setGrammarText(newText);
    setIsDirty(true);
  };

  /**
   * Performs grammar validation on demand
   */
  const handleValidate = () => {
    const res: ValidationResult = validateAndParseGrammar(grammarText);
    setValidationErrors(res.errors);

    if (res.isValid && res.grammar) {
      setCurrentGrammar(res.grammar);
      setToast({
        type: 'success',
        message: `Grammar is syntactically valid! (${res.grammar.productions.length} productions, start symbol '${res.grammar.startSymbol}')`,
      });
    } else {
      setToast({
        type: 'error',
        message: `Grammar validation failed with ${res.errors.length} issue${res.errors.length > 1 ? 's' : ''}.`,
      });
    }
  };

  /**
   * Executes the requested operation independently
   */
  const executeOperation = useCallback(
    (op: OperationType, textToUse?: string) => {
      const text = textToUse !== undefined ? textToUse : grammarText;
      const res: ValidationResult = validateAndParseGrammar(text);

      if (!res.isValid || !res.grammar) {
        setValidationErrors(res.errors);
        setCurrentGrammar(undefined);
        setFirstSets(undefined);
        setFollowSets(undefined);
        setParsingTable(undefined);
        setIsDirty(false);
        setActiveOperation(op);
        setToast({
          type: 'error',
          message: 'Cannot calculate operation: Grammar contains syntax errors.',
        });
        return;
      }

      setValidationErrors(res.errors);
      setCurrentGrammar(res.grammar);
      setIsDirty(false);
      setActiveOperation(op);

      const g = res.grammar;

      if (op === 'first') {
        const { firstSets: fSets, firstSetsMap: fMap } = computeFirstSets(g);
        setFirstSets(fSets);
        setFirstSetsMap(fMap);
        setToast({
          type: 'success',
          message: `FIRST sets computed successfully for ${g.nonTerminals.length} non-terminals.`,
        });
      } else if (op === 'follow') {
        const fMap = firstSetsMap || computeFirstSets(g).firstSetsMap;
        setFirstSetsMap(fMap);
        const { followSets: foSets, followSetsMap: foMap } = computeFollowSets(g, fMap);
        setFollowSets(foSets);
        setFollowSetsMap(foMap);
        setToast({
          type: 'success',
          message: `FOLLOW sets computed successfully for ${g.nonTerminals.length} non-terminals.`,
        });
      } else if (op === 'table' || op === 'parse') {
        const fMap = firstSetsMap || computeFirstSets(g).firstSetsMap;
        const foMap = followSetsMap || computeFollowSets(g, fMap).followSetsMap;
        setFirstSetsMap(fMap);
        setFollowSetsMap(foMap);
        const table = buildParsingTable(g, fMap, foMap);
        setParsingTable(table);

        if (table.isLL1) {
          setToast({
            type: 'success',
            message: 'Conflict-free LL(1) predictive parsing table generated.',
          });
        } else {
          setToast({
            type: 'warning',
            message: `Parsing table generated with ${table.conflicts.length} LL(1) conflict${table.conflicts.length > 1 ? 's' : ''}.`,
          });
        }
      }
    },
    [grammarText, firstSetsMap, followSetsMap]
  );

  // Initial calculation on component mount
  useEffect(() => {
    executeOperation('first', defaultExample.grammar);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectExample = (example: ExampleGrammar) => {
    setGrammarText(example.grammar);
    setDefaultInput(example.defaultInput || 'id + id * id');
    setIsDirty(false);
    // Execute the currently active operation with the newly selected example
    executeOperation(activeOperation, example.grammar);
    setToast({
      type: 'info',
      message: `Loaded: ${example.name}`,
    });
  };

  const handleClear = () => {
    setGrammarText('');
    setCurrentGrammar(undefined);
    setValidationErrors([]);
    setFirstSets(undefined);
    setFollowSets(undefined);
    setParsingTable(undefined);
    setIsDirty(false);
    setToast({
      type: 'info',
      message: 'Grammar editor cleared.',
    });
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Application Header */}
      <Header onOpenQuickGuide={() => setIsTheoryModalOpen(true)} />

      {/* Main Responsive Grid Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Section: Grammar Editor (5 columns on desktop) */}
          <section className="lg:col-span-5 h-[620px] flex flex-col">
            <GrammarEditor
              value={grammarText}
              onChange={handleGrammarChange}
              onValidate={handleValidate}
              onClear={handleClear}
              onSelectExample={handleSelectExample}
              isDirty={isDirty}
            />
          </section>

          {/* Right Section: Operations and Results (7 columns on desktop) */}
          <section className="lg:col-span-7 h-[620px] flex flex-col space-y-3">
            {/* 4 Operation Buttons/Tabs */}
            <OperationButtons
              activeOperation={activeOperation}
              onSelectOperation={(op) => executeOperation(op)}
              isStale={isDirty}
            />

            {/* Results Output Panel */}
            <div className="flex-1 min-h-0">
              <ResultsPanel
                operation={activeOperation}
                grammar={currentGrammar}
                firstSets={firstSets}
                followSets={followSets}
                parsingTable={parsingTable}
                errors={validationErrors}
                isStale={isDirty}
                onRecalculate={() => executeOperation(activeOperation)}
                defaultInput={defaultInput}
              />
            </div>
          </section>
        </div>
      </main>

      {/* Theory & Syntax Guide Modal */}
      <TheoryGuideModal
        isOpen={isTheoryModalOpen}
        onClose={() => setIsTheoryModalOpen(false)}
      />

      {/* Feedback Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
