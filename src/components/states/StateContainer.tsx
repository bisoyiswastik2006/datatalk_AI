import React from 'react';
import {
  UploadCloud,
  FileX2,
  RefreshCw,
  Sparkles,
  Terminal,
  HelpCircle,
  GitFork,
  ShieldAlert,
  TimerOff,
  SearchX,
  WifiOff,
  KeyRound,
  AlertCircle,
  RotateCcw,
  Upload,
} from 'lucide-react';
import { StateView } from './StateView';

export interface StateContainerProps {
  stateType:
    | 'uploading'
    | 'validation_failed'
    | 'processing'
    | 'generating_sql'
    | 'executing'
    | 'not_answerable'
    | 'needs_clarification'
    | 'rejected'
    | 'timeout'
    | 'empty_result'
    | 'backend_unavailable'
    | 'llm_not_configured'
    | 'error';
  errorMessage?: string | null;
  clarificationOptions?: string[];
  suggestedAlternatives?: string[];
  onRetry?: () => void;
  onUploadNew?: () => void;
  onSelectOption?: (option: string) => void;
  onRephrase?: () => void;
}

export const StateContainer: React.FC<StateContainerProps> = ({
  stateType,
  errorMessage,
  clarificationOptions = [],
  suggestedAlternatives = [],
  onRetry,
  onUploadNew,
  onSelectOption,
  onRephrase,
}) => {
  switch (stateType) {
    case 'uploading':
      return (
        <StateView
          icon={<UploadCloud className="w-7 h-7 animate-bounce" aria-hidden="true" />}
          badgeText="Uploading"
          badgeVariant="primary"
          title="Uploading dataset"
          description="Transferring and inspecting raw file buffers. Please keep this window open while the file is transmitted."
          primaryActionText="Cancel upload"
          onPrimaryAction={onRetry}
        />
      );

    case 'validation_failed':
      return (
        <StateView
          icon={<FileX2 className="w-7 h-7 text-status-error" aria-hidden="true" />}
          badgeText="Validation Error"
          badgeVariant="error"
          title="File validation failed"
          description={
            errorMessage ||
            "The selected file could not be parsed. Ensure the file is an uncorrupted CSV, Excel (.xlsx), or SQLite (.sqlite/.db) file within the size limit."
          }
          primaryActionText="Try another file"
          primaryActionIcon={<Upload className="w-4 h-4" />}
          onPrimaryAction={onUploadNew}
        />
      );

    case 'processing':
      return (
        <StateView
          icon={<RefreshCw className="w-7 h-7 animate-spin text-primary" aria-hidden="true" />}
          badgeText="Processing"
          badgeVariant="tint"
          title="Analyzing schema & registering tables"
          description="Inferring column datatypes, counting distinct values, validating row delimiters, and creating temporary query views."
        />
      );

    case 'generating_sql':
      return (
        <StateView
          icon={<Sparkles className="w-7 h-7 text-primary animate-pulse" aria-hidden="true" />}
          badgeText="Synthesizing"
          badgeVariant="primary"
          title="Generating analytical query"
          description="Translating your natural language question into safe, dialect-compliant SQL based on the active dataset schema."
        />
      );

    case 'executing':
      return (
        <StateView
          icon={<Terminal className="w-7 h-7 text-primary" aria-hidden="true" />}
          badgeText="Executing"
          badgeVariant="tint"
          title="Running query on database engine"
          description="Scanning tables, applying filters, aggregating metrics, and formatting tabular result sets."
        />
      );

    case 'not_answerable':
      return (
        <StateView
          icon={<HelpCircle className="w-7 h-7 text-ink-muted" aria-hidden="true" />}
          badgeText="Out of Scope"
          badgeVariant="warning"
          title="Question cannot be answered from schema"
          description={
            errorMessage ||
            "The question asks for metrics or attributes that do not exist in the active dataset schema."
          }
          details={
            suggestedAlternatives.length > 0 ? (
              <div className="space-y-2 mt-2">
                <span className="text-[11px] font-mono text-ink-muted uppercase tracking-wider block">
                  Recommended Questions:
                </span>
                <div className="space-y-1.5">
                  {suggestedAlternatives.map((alt, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectOption && onSelectOption(alt)}
                      className="w-full text-left p-2.5 rounded bg-surface border border-tint hover:border-secondary text-xs text-ink transition-colors cursor-pointer"
                    >
                      {alt}
                    </button>
                  ))}
                </div>
              </div>
            ) : undefined
          }
          primaryActionText="Rephrase question"
          onPrimaryAction={onRephrase}
        />
      );

    case 'needs_clarification':
      return (
        <StateView
          icon={<GitFork className="w-7 h-7 text-secondary" aria-hidden="true" />}
          badgeText="Ambiguity Detected"
          badgeVariant="warning"
          title="Clarification needed"
          description={
            errorMessage ||
            "Multiple interpretations or columns match your query. Select one of the options below to proceed:"
          }
          details={
            clarificationOptions.length > 0 ? (
              <div className="space-y-2 mt-2">
                <div className="space-y-1.5">
                  {clarificationOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectOption && onSelectOption(opt)}
                      className="w-full text-left p-2.5 rounded bg-tint/30 border border-tint hover:border-primary hover:bg-tint text-xs text-ink transition-colors cursor-pointer font-medium"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ) : undefined
          }
          primaryActionText="Rephrase query"
          onPrimaryAction={onRephrase}
        />
      );

    case 'rejected':
      return (
        <StateView
          icon={<ShieldAlert className="w-7 h-7 text-status-error" aria-hidden="true" />}
          badgeText="Security Guardrail"
          badgeVariant="error"
          title="Generated SQL rejected"
          description={
            errorMessage ||
            "DataTalk AI enforces strict read-only execution. Queries attempting write operations, table modifications, or disallowed functions are blocked."
          }
          primaryActionText="Rephrase query"
          onPrimaryAction={onRephrase}
        />
      );

    case 'timeout':
      return (
        <StateView
          icon={<TimerOff className="w-7 h-7 text-status-warning" aria-hidden="true" />}
          badgeText="Timeout Exceeded"
          badgeVariant="warning"
          title="Query execution timed out"
          description={
            errorMessage ||
            "The query took longer than the allocated execution budget. Try filtering by a specific time period, category, or limiting the scope."
          }
          primaryActionText="Retry with filter"
          primaryActionIcon={<RotateCcw className="w-4 h-4" />}
          onPrimaryAction={onRetry}
          secondaryActionText="Rephrase question"
          onSecondaryAction={onRephrase}
        />
      );

    case 'empty_result':
      return (
        <StateView
          icon={<SearchX className="w-7 h-7 text-ink-muted" aria-hidden="true" />}
          badgeText="Zero Rows"
          badgeVariant="outline"
          title="No records matched criteria"
          description={
            errorMessage ||
            "The query executed successfully and safely, but no records satisfied the specified conditions or filters."
          }
          primaryActionText="Try wider search"
          onPrimaryAction={onRephrase}
        />
      );

    case 'backend_unavailable':
      return (
        <StateView
          icon={<WifiOff className="w-7 h-7 text-status-error" aria-hidden="true" />}
          badgeText="Service Unavailable"
          badgeVariant="error"
          title="Cannot connect to DataTalk AI backend"
          description="The backend service is currently unreachable. Please check if the server is running on the configured API base URL."
          primaryActionText="Retry connection"
          primaryActionIcon={<RotateCcw className="w-4 h-4" />}
          onPrimaryAction={onRetry}
        />
      );

    case 'llm_not_configured':
      return (
        <StateView
          icon={<KeyRound className="w-7 h-7 text-status-warning" aria-hidden="true" />}
          badgeText="Provider Error"
          badgeVariant="warning"
          title="LLM provider not configured"
          description="The backend does not have an active LLM provider configured. Contact your administrator or ensure the provider credentials are set."
          primaryActionText="Retry"
          primaryActionIcon={<RotateCcw className="w-4 h-4" />}
          onPrimaryAction={onRetry}
        />
      );

    case 'error':
    default:
      return (
        <StateView
          icon={<AlertCircle className="w-7 h-7 text-status-error" aria-hidden="true" />}
          badgeText="Error"
          badgeVariant="error"
          title="Query execution error"
          description={
            errorMessage ||
            "An unexpected error occurred during query execution. Review the question or try again."
          }
          primaryActionText="Try again"
          primaryActionIcon={<RotateCcw className="w-4 h-4" />}
          onPrimaryAction={onRetry}
          secondaryActionText="Rephrase question"
          onSecondaryAction={onRephrase}
        />
      );
  }
};

