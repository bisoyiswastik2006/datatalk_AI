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
    <div className="flex flex-col h-full bg-card text-main select-none overflow-hidden">
      {/* Assistant Header */}
      <div className="px-4 py-3 bg-card border-b border-border flex items-center justify-between shrink-0 min-h-[56px]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-text font-bold shrink-0">
            <Bot className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-title-card font-semibold text-main leading-tight">Data assistant</h2>
            {datasetName ? (
              <p className="text-caption font-mono text-secondary truncate">
                {datasetName}{' '}
                {datasetRows !== undefined && datasetRows !== null && (
                  <span className="font-sans">({datasetRows.toLocaleString()} rows)</span>
                )}
              </p>
            ) : (
              <p className="text-caption text-secondary">No dataset active</p>
            )}
          </div>
        </div>

        {onResetChat && (
          <button
            onClick={onResetChat}
            disabled={isDisabled || messages.length === 0}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-secondary hover:text-main hover:bg-page transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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
          <div className="p-5 rounded-lg bg-page border border-border text-center space-y-2 mt-4 shadow-sm">
            <Lock className="w-8 h-8 text-secondary mx-auto" aria-hidden="true" />
            <p className="text-title-card font-semibold text-main">
              Select a dataset to start asking questions.
            </p>
            <p className="text-body text-secondary leading-relaxed">
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
                className={`max-w-[88%] rounded-lg p-3.5 text-body leading-relaxed select-text shadow-sm ${
                  isUser
                    ? 'bg-primary text-primary-text rounded-br-none'
                    : 'bg-card border border-border text-main rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Clarification Chips if prompt requested clarification */}
                {msg.clarificationOptions && msg.clarificationOptions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-border space-y-2">
                    <span className="text-caption font-medium text-secondary block">
                      Options:
                    </span>
                    {msg.clarificationOptions.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => onSendMessage(opt)}
                        className="w-full text-left min-h-[40px] px-3.5 py-2 rounded-lg bg-page hover:bg-card border border-border text-caption text-main transition-colors cursor-pointer"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-caption text-secondary mt-1 px-1 font-mono">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center gap-2.5 text-caption text-secondary p-3 bg-page rounded-lg border border-border">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
            <span>Analyzing query and generating SQL...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Section */}
      {!isDisabled && suggestedQuestions.length > 0 && (
        <div className="px-4 py-2.5 border-t border-border bg-card shrink-0 space-y-2">
          <div className="flex items-center justify-between text-caption font-medium text-secondary">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-primary" aria-hidden="true" />
              <span>Suggested questions</span>
            </div>
            <span>Auto-generated</span>
          </div>

          <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => onSendMessage(q)}
                disabled={isProcessing}
                className="w-full flex items-center justify-between min-h-[40px] p-2.5 rounded-lg bg-page border border-border hover:border-primary text-left text-caption text-main transition-colors cursor-pointer group shadow-sm disabled:opacity-50"
              >
                <span className="truncate pr-2">{q}</span>
                <ArrowUpRight className="w-4 h-4 text-primary shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input Section: 16px font, minimum 40px touch targets */}
      <div className="p-3.5 bg-card border-t border-border shrink-0">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="relative">
            <textarea
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isDisabled || isProcessing}
              placeholder={
                isDisabled
                  ? 'Connect a dataset to query...'
                  : `Ask a question about ${datasetName || 'your data'}...`
              }
              rows={2}
              className="w-full min-h-[46px] p-3 text-control bg-page border border-border rounded-lg text-main placeholder:text-secondary resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:opacity-50 disabled:cursor-not-allowed custom-scrollbar"
              aria-label="Natural language query input"
            />
          </div>

          <div className="flex items-center justify-between text-caption text-secondary">
            <div className="flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-primary" aria-hidden="true" />
              <span>Natural language to SQL</span>
            </div>

            <button
              type="submit"
              disabled={!inputVal.trim() || isDisabled || isProcessing}
              className="w-10 h-10 min-h-[40px] rounded-lg bg-primary text-primary-text flex items-center justify-center hover:opacity-90 active:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-primary"
              title="Send question"
              aria-label="Send question"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
