import React, { useState } from 'react';
import { Terminal, Copy, Check, ChevronUp, ChevronDown } from 'lucide-react';

export interface SqlViewerProps {
  sql: string;
  dialect?: string;
  defaultExpanded?: boolean;
}

export const SqlViewer: React.FC<SqlViewerProps> = ({
  sql,
  dialect = 'DuckDB ANSI-92',
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy SQL', err);
    }
  };

  if (!sql) return null;

  return (
    <div className="rounded-lg border border-tint bg-[#0E1C2B] text-[#E0EBF5] shadow-card overflow-hidden">
      {/* Header Bar */}
      <div className="px-4 py-2.5 bg-[#14283D] border-b border-[#203D5B] flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-secondary" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wider text-white">
            Generated SQL
          </span>
          {dialect && (
            <span className="text-[11px] font-mono text-[#8BB8CD] bg-[#0E1C2B] px-2 py-0.5 rounded border border-[#203D5B]">
              {dialect}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs text-[#8BB8CD] hover:text-white hover:bg-[#203D5B] transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-secondary"
            aria-label="Copy SQL query"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-status-success" aria-hidden="true" />
                <span className="text-status-success">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Copy SQL</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs text-[#8BB8CD] hover:text-white hover:bg-[#203D5B] transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-secondary"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Hide query' : 'Show query'}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Hide query</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Show query</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SQL Body */}
      {isExpanded && (
        <div className="p-4 overflow-x-auto custom-scrollbar select-text">
          <pre className="font-mono text-xs leading-relaxed tracking-wide text-[#C8DFDB]">
            <code>{sql}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

