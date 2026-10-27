import React from 'react';
import { ListTree, ArrowRightLeft, Grid3X3, Play } from 'lucide-react';

export type OperationType = 'first' | 'follow' | 'table' | 'parse';

interface OperationButtonsProps {
  activeOperation: OperationType;
  onSelectOperation: (op: OperationType) => void;
  isStale?: boolean;
}

export const OperationButtons: React.FC<OperationButtonsProps> = ({
  activeOperation,
  onSelectOperation,
  isStale,
}) => {
  const operations: {
    id: OperationType;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      id: 'first',
      label: 'FIRST Sets',
      sublabel: 'Lookahead sets',
      icon: <ListTree className="w-4 h-4" />,
      color: 'from-blue-600 to-cyan-500',
    },
    {
      id: 'follow',
      label: 'FOLLOW Sets',
      sublabel: 'Context followers',
      icon: <ArrowRightLeft className="w-4 h-4" />,
      color: 'from-cyan-600 to-teal-500',
    },
    {
      id: 'table',
      label: 'LL(1) Table',
      sublabel: 'Predictive matrix',
      icon: <Grid3X3 className="w-4 h-4" />,
      color: 'from-indigo-600 to-blue-500',
    },
    {
      id: 'parse',
      label: 'String Parser',
      sublabel: 'Step-by-step trace',
      icon: <Play className="w-4 h-4" />,
      color: 'from-violet-600 to-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {operations.map((op) => {
        const isActive = activeOperation === op.id;

        return (
          <button
            key={op.id}
            onClick={() => onSelectOperation(op.id)}
            className={`relative p-3 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between overflow-hidden group ${
              isActive
                ? 'bg-slate-800 border-cyan-500/50 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Active Top Gradient Bar */}
            {isActive && (
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${op.color}`} />
            )}

            <div className="flex items-center justify-between w-full mb-1">
              <span
                className={`p-1.5 rounded-lg ${
                  isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                } transition`}
              >
                {op.icon}
              </span>
              {isActive && isStale && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Grammar changed since calculation" />
              )}
            </div>

            <div>
              <div className={`text-xs font-bold tracking-tight ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                {op.label}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {op.sublabel}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
