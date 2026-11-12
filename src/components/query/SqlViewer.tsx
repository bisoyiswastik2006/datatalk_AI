import React, { useState } from 'react';
import { Terminal, Copy, Check, ChevronUp, ChevronDown } from 'lucide-react';

export interface SqlViewerProps {
  sql: string;
  dialect?: string;
  defaultExpanded?: boolean;
}

/**
 * Formats SQL keywords and literals into accessible syntax tokens
 * using CSS variables that pass WCAG AA contrast in both light and dark mode:
 * - text-sql-keyword: #0058FD (light) / #00B8FC (dark)
 * - text-sql-literal: #4A5361 (light) / #A8B0BD (dark)
 * - text-sql-text: #000000 (light) / #FFFFFF (dark)
 */
const renderHighlightedSql = (sql: string) => {
  const keywords = new Set([
    'SELECT', 'FROM', 'WHERE', 'GROUP', 'BY', 'ORDER', 'DESC', 'ASC',
    'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL', 'LIKE', 'ILIKE', 'JOIN',
    'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'AS', 'LIMIT', 'OFFSET',
    'HAVING', 'UNION', 'ALL', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
    'BETWEEN', 'OVER', 'PARTITION', 'DISTINCT', 'COUNT', 'SUM', 'AVG',
    'MIN', 'MAX', 'CAST', 'ROUND', 'COALESCE', 'DATE', 'YEAR', 'MONTH',
  ]);

  // Tokenize words, quoted strings, and punctuation
  const tokenRegex = /('(?:''|[^'])*'|\b\w+\b|[^\s\w]+|\s+)/g;
  const parts = sql.match(tokenRegex) || [sql];

  return parts.map((part, index) => {
    const upper = part.toUpperCase();
    if (keywords.has(upper)) {
      return (
        <span key={index} className="text-sql-keyword font-semibold">
          {part}
        </span>
      );
    }
    if (part.startsWith("'") && part.endsWith("'")) {
      return (
        <span key={index} className="text-sql-literal">
          {part}
        </span>
      );
    }
    if (/^\d+(\.\d+)?$/.test(part)) {
      return (
        <span key={index} className="text-sql-literal font-medium">
          {part}
        </span>
      );
    }
    return (
      <span key={index} className="text-sql-text">
        {part}
      </span>
    );
  });
};

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
    <div className="rounded-lg border border-sql-border bg-card text-main shadow-sm overflow-hidden">
      {/* Header Bar */}
      <div className="px-4 py-2.5 bg-card border-b border-sql-border flex items-center justify-between select-none min-h-[46px]">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-primary" aria-hidden="true" />
          <span className="text-caption font-semibold text-main">
            Generated SQL
          </span>
          {dialect && (
            <span className="text-caption font-mono text-secondary bg-page px-2.5 py-0.5 rounded-md border border-border">
              {dialect}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-lg text-caption text-secondary hover:text-main hover:bg-page transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-primary"
            aria-label="Copy SQL query"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-primary" aria-hidden="true" />
                <span className="text-primary font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" aria-hidden="true" />
                <span>Copy SQL</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-lg text-caption text-secondary hover:text-main hover:bg-page transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-primary"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Hide query' : 'Show query'}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" aria-hidden="true" />
                <span>Hide query</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
                <span>Show query</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SQL Body: 15px monospace, line-height 1.5, theme background */}
      {isExpanded && (
        <div className="p-4 overflow-x-auto custom-scrollbar select-text bg-sql-bg">
          <pre className="font-mono text-code leading-relaxed tracking-wide">
            <code>{renderHighlightedSql(sql)}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
