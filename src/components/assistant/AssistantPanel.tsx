import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  RotateCcw,
  ArrowUpRight,
  Send,
  HelpCircle,
  Code2,
  Lock,
} from 'lucide-react';
import { ChatMessage } from '../../types/chat';

export interface AssistantPanelProps {
  datasetName?: string | null;
  datasetRows?: number | null;
  messages: ChatMessage[];
  suggestedQuestions: string[];
  isProcessing?: boolean;
  isDisabled?: boolean;
  onSendMessage: (question: string) => void;
  onResetChat?: () => void;
}

export const AssistantPanel: React.FC<AssistantPanelProps> = ({
  datasetName,
  datasetRows,
  messages,
  suggestedQuestions,
  isProcessing = false,
  isDisabled = false,
  onSendMessage,
  onResetChat,
}) => {
  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || isDisabled || isProcessing) return;
    onSendMessage(inputVal);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-tint/40 text-ink select-none overflow-hidden">
      {/* Assistant Header */}
      <div className="px-4 py-3 bg-tint/60 border-b border-tint flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
            <Bot className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-ink leading-tight">Data assistant</h2>
            {datasetName ? (
              <p className="text-[11px] font-mono text-ink-muted truncate">
                {datasetName}{' '}
                {datasetRows !== undefined && datasetRows !== null && (
                  <span className="font-sans">({datasetRows.toLocaleString()} rows)</span>
                )}
              </p>
            ) : (
              <p className="text-[11px] text-ink-muted">No dataset active</p>
            )}
          </div>
        </div>

        {onResetChat && (
          <button
            onClick={onResetChat}
            disabled={isDisabled || messages.length === 0}
            className="p-1.5 rounded text-ink-muted hover:text-ink hover:bg-tint transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Reset conversation"
            aria-label="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Chat Thread Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {isDisabled && messages.length === 0 && (
          <div className="p-4 rounded-lg bg-surface/80 border border-tint text-center space-y-2 mt-4">
            <Lock className="w-8 h-8 text-ink-muted mx-auto" aria-hidden="true" />
            <p className="text-sm font-semibold text-ink">
              Select a dataset to start asking questions.
            </p>
            <p className="text-xs text-ink-muted leading-relaxed">
              Your natural language queries, generated SQL, and visual data summaries will appear here once data is connected.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed select-text shadow-subtle ${
                  isUser
                    ? 'bg-primary text-white rounded-br-none'
                    : 'bg-surface border border-tint text-ink rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Clarification Chips if prompt requested clarification */}
                {msg.clarificationOptions && msg.clarificationOptions.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-tint/60 space-y-1.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-ink-muted block">
                      Options:
                    </span>
                    {msg.clarificationOptions.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => onSendMessage(opt)}
                        className="w-full text-left px-2 py-1.5 rounded bg-tint/30 hover:bg-tint border border-tint text-xs text-ink transition-colors cursor-pointer"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-[10px] text-ink-muted mt-1 px-1 font-mono">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-ink-muted p-2 bg-surface/70 rounded border border-tint">
            <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span>Analyzing query and generating SQL...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Section */}
      {!isDisabled && suggestedQuestions.length > 0 && (
        <div className="px-4 py-2 border-t border-tint bg-surface/30 shrink-0 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-ink-muted">
            <span className="font-semibold">Suggested Schema Queries</span>
            <HelpCircle className="w-3 h-3 text-ink-muted" aria-hidden="true" />
          </div>

          <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => onSendMessage(q)}
                disabled={isProcessing}
                className="w-full flex items-center justify-between p-2 rounded bg-surface border border-tint hover:border-secondary hover:bg-tint/20 text-left text-xs text-ink transition-colors cursor-pointer group shadow-subtle disabled:opacity-50"
              >
                <span className="truncate pr-2">{q}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-secondary shrink-0 group-hover:text-primary transition-colors" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Query Input Box */}
      <div className="p-3 bg-surface border-t border-tint shrink-0">
        <form onSubmit={handleSubmit} className="relative">
          <label htmlFor="query-input" className="sr-only">
            Ask a question about the active dataset
          </label>
          <textarea
            id="query-input"
            rows={2}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isDisabled || isProcessing}
            placeholder={
              isDisabled
                ? 'Select a dataset to start asking questions...'
                : datasetName
                ? `Ask a question about ${datasetName}...`
                : 'Ask a question about your data...'
            }
            className="w-full pl-3 pr-10 py-2 rounded bg-surface border border-tint text-xs text-ink placeholder:text-ink-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-tint/20 disabled:cursor-not-allowed custom-scrollbar"
          />

          <div className="flex items-center justify-between mt-1 px-1">
            <div className="flex items-center gap-2 text-[10px] font-mono text-ink-muted">
              <span className="flex items-center gap-1">
                <Code2 className="w-3 h-3" aria-hidden="true" />
                Natural Language to SQL
              </span>
            </div>

            <button
              type="submit"
              disabled={isDisabled || isProcessing || !inputVal.trim()}
              className="p-1.5 rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Send question"
            >
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

