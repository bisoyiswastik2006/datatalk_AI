import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  RotateCcw,
  ArrowUpRight,
  Database,
  Search,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';
import { useQuery, QueryFlowState } from '../../context/QueryContext';
import { deriveSuggestedQuestions } from '../../utils/questions';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { SynthesizedAnswer } from '../../components/query/SynthesizedAnswer';
import { SqlViewer } from '../../components/query/SqlViewer';
import { ResultTable } from '../../components/query/ResultTable';
import { ChartPanel } from '../../components/query/ChartPanel';
import { WarningsBanner } from '../../components/query/WarningsBanner';
import { StateContainer } from '../../components/states/StateContainer';
import { StateSelectorPill } from '../../components/states/StateSelectorPill';
import { MOCK_QUERY_RESPONSES } from '../../services/mocks/mockData';

export const AskYourDataPage: React.FC = () => {
  const { activeDataset, activeSchema } = useDataset();
  const {
    state,
    queryResult,
    messages,
    error,
    askQuestion,
    resetQueryState,
    setStateDirectly,
  } = useQuery();

  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastDatasetIdRef = useRef<string | null>(activeDataset?.id || null);

  // Clear chat and query results automatically when switching dataset
  useEffect(() => {
    if (activeDataset?.id !== lastDatasetIdRef.current) {
      lastDatasetIdRef.current = activeDataset?.id || null;
      resetQueryState();
    }
  }, [activeDataset?.id, resetQueryState]);

  // Support initializing state from URL query param (e.g. ?state=results or ?state=error)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlState = params.get('state') as QueryFlowState | null;
    if (urlState) {
      handleStatePillChange(urlState);
    }
  }, []);

  // Derive suggested questions from active dataset schema
  const suggestedQuestions = deriveSuggestedQuestions(activeSchema);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, state]);

  // Handle question submission
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed || !activeDataset || isBusy) return;

    askQuestion(trimmed, activeDataset.id);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestedClick = (question: string) => {
    if (!activeDataset || isBusy) return;
    askQuestion(question, activeDataset.id);
  };

  const handleStatePillChange = (newState: QueryFlowState) => {
    setStateDirectly(newState);
    if (newState === 'results' && !queryResult) {
      // Mock result preview for state inspector
      askQuestion('Which region drove the highest revenue in Q3?', activeDataset?.id || 'ds-default');
    }
  };

  const isBusy = state === 'generating_sql' || state === 'executing';
  const hasConversation = messages.length > 0 || state !== 'idle';
  const effectiveResult = queryResult || (state === 'results' ? MOCK_QUERY_RESPONSES.default : null);

  // Generate dynamic follow-up prompts from result columns
  const followUpSuggestions = React.useMemo(() => {
    if (!effectiveResult?.columns) return [];
    const cols = effectiveResult.columns;
    const suggestions: string[] = [];
    if (cols.length >= 2) {
      suggestions.push(`Sort by ${cols[1].toLowerCase()} in ascending order`);
      suggestions.push(`Show top 5 only`);
      if (cols.length >= 3) {
        suggestions.push(`Compare ${cols[0].toLowerCase()} against ${cols[2].toLowerCase()}`);
      }
    }
    return suggestions.slice(0, 3);
  }, [effectiveResult]);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Header & Toolbar Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-title-page font-semibold tracking-tight text-main">
              Ask Your Data
            </h2>
            {activeDataset ? (
              <Badge variant="tint" size="sm" className="font-mono">
                {activeDataset.name}
              </Badge>
            ) : (
              <Badge variant="warning" size="sm">
                No dataset active
              </Badge>
            )}
          </div>
          <p className="text-body text-secondary">
            Natural language questions translated into read-only SQL queries, tabular results, and dynamic charts.
          </p>
        </div>

        {/* State Demo Pill & Reset Controls */}
        <div className="flex items-center gap-3">
          <StateSelectorPill
            currentState={state}
            onSelectState={handleStatePillChange}
          />
          {hasConversation && (
            <Button
              variant="outline"
              size="md"
              onClick={resetQueryState}
              icon={<RotateCcw className="w-4 h-4" />}
              title="Reset conversation"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {!hasConversation ? (
          /* Empty State: Centered Large Input + Schema-derived Suggested Questions */
          <div className="flex-1 overflow-y-auto custom-scrollbar flex items-center justify-center p-4">
            <div className="max-w-3xl w-full space-y-8 my-auto py-6">
              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto shadow-sm">
                  <Sparkles className="w-7 h-7" aria-hidden="true" />
                </div>
                <h1 className="text-title-page font-semibold text-main tracking-tight">
                  What would you like to discover?
                </h1>
                <p className="text-body text-secondary max-w-xl mx-auto leading-relaxed">
                  Type questions in plain English. DataTalk AI inspects your schema, generates safe read-only SQL, and produces interactive tables and charts.
                </p>
              </div>

              {/* Large Centered Query Input */}
              <Card variant="glass" padded="sm" className="shadow-lg border-primary/20">
                <form onSubmit={handleSubmit} className="relative flex items-center">
                  <div className="absolute left-4 text-secondary pointer-events-none">
                    <Search className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    disabled={!activeDataset || isBusy}
                    placeholder={
                      activeDataset
                        ? `Ask a question about ${activeDataset.name}...`
                        : 'Please select or upload a dataset to begin...'
                    }
                    className="w-full min-h-[56px] pl-12 pr-32 bg-transparent text-control text-main placeholder:text-secondary focus:outline-none"
                    aria-label="Natural language query input"
                  />
                  <div className="absolute right-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={!inputVal.trim() || !activeDataset || isBusy}
                      icon={<Send className="w-4 h-4" />}
                    >
                      Ask
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Suggested Questions Grid (schema-derived) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-caption text-secondary px-1">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Database className="w-4 h-4 text-primary" aria-hidden="true" />
                    <span>Suggested questions from schema</span>
                  </div>
                  <span>Click to run instantly</span>
                </div>

                {activeDataset ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {suggestedQuestions.slice(0, 4).map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestedClick(q)}
                        disabled={isBusy}
                        className="group p-4 rounded-xl bg-card border border-border hover:border-primary text-left text-body text-main transition-all flex items-start justify-between gap-3 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
                      >
                        <span className="leading-snug">{q}</span>
                        <ArrowUpRight className="w-5 h-5 text-primary shrink-0 opacity-60 group-hover:opacity-100 transition-opacity mt-0.5" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <Card variant="default" padded="md" className="text-center space-y-2">
                    <Lock className="w-6 h-6 text-secondary mx-auto" aria-hidden="true" />
                    <p className="text-caption text-secondary">
                      Connect a dataset using the selector in the top bar to preview suggested schema questions.
                    </p>
                  </Card>
                )}
              </div>

              {/* Engine & Safety Guarantee Strip */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-caption text-secondary pt-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Read-only SQL execution
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  DuckDB in-memory engine
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Zero telemetry on raw data
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Conversation Thread & Results Dashboard View */
          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-1">
              {/* Messages & Results Stream */}
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}
                  >
                    {isUser ? (
                      <div className="bg-primary text-primary-text font-medium rounded-2xl rounded-br-none px-5 py-3.5 max-w-2xl text-body shadow-sm">
                        <p>{msg.content}</p>
                        <span className="block text-right text-caption opacity-80 mt-1 font-mono">
                          {msg.timestamp}
                        </span>
                      </div>
                    ) : (
                      <div className="w-full space-y-4">
                        {/* Clarification Options if prompt returned them */}
                        {msg.clarificationOptions && msg.clarificationOptions.length > 0 && (
                          <Card variant="glass" padded="md" className="space-y-3 max-w-xl">
                            <span className="text-caption font-semibold text-secondary block">
                              Clarification required:
                            </span>
                            <div className="space-y-2">
                              {msg.clarificationOptions.map((opt, i) => (
                                <button
                                  key={i}
                                  onClick={() => handleSuggestedClick(opt)}
                                  className="w-full text-left min-h-[40px] px-4 py-2.5 rounded-lg bg-page hover:bg-card border border-border text-caption text-main transition-colors cursor-pointer"
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </Card>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Current Active Query State / Execution Response */}
              {isBusy && (
                <div className="p-6">
                  <StateContainer stateType={state as any} />
                </div>
              )}

              {/* State handling for non-results states (e.g., error, rejected, timeout, etc.) */}
              {!isBusy &&
                state !== 'idle' &&
                state !== 'results' && (
                  <div className="py-4">
                    <StateContainer
                      stateType={state as any}
                      errorMessage={error}
                      onRetry={() => {
                        if (messages.length > 0) {
                          const lastUser = [...messages].reverse().find((m) => m.role === 'user');
                          if (lastUser && activeDataset) {
                            askQuestion(lastUser.content, activeDataset.id);
                          }
                        }
                      }}
                      onRephrase={() => {
                        setInputVal('');
                      }}
                      onSelectOption={(opt) => {
                        if (activeDataset) {
                          askQuestion(opt, activeDataset.id);
                        }
                      }}
                    />
                  </div>
                )}

              {/* Rich Analytical Results Studio Card */}
              {!isBusy && effectiveResult && (state === 'results' || messages.length > 0) && (
                <div className="space-y-4 bg-card border border-border rounded-2xl p-6 shadow-sm">
                  {/* Synthesized Natural Language Answer */}
                  <SynthesizedAnswer response={effectiveResult} />

                  {/* Generated SQL Viewer */}
                  {effectiveResult.sql && (
                    <SqlViewer
                      sql={effectiveResult.sql}
                      dialect="DuckDB ANSI-92"
                      defaultExpanded={true}
                    />
                  )}

                  {/* Results Table & Plotly Chart Grid */}
                  {effectiveResult.rows && effectiveResult.rows.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[380px]">
                      {/* Left: Tabular Results */}
                      <div className="h-full min-h-[340px]">
                        <ResultTable
                          columns={effectiveResult.columns || []}
                          rows={effectiveResult.rows || []}
                          rowCount={effectiveResult.row_count}
                          tableName="Query results"
                        />
                      </div>

                      {/* Right: Plotly Chart */}
                      <div className="h-full min-h-[340px]">
                        <ChartPanel
                          columns={effectiveResult.columns || []}
                          rows={effectiveResult.rows || []}
                          chartHint={effectiveResult.chart}
                        />
                      </div>
                    </div>
                  )}

                  {/* Warnings Banner if any */}
                  {effectiveResult.warnings && effectiveResult.warnings.length > 0 && (
                    <WarningsBanner warnings={effectiveResult.warnings} />
                  )}

                  {/* Follow-up Suggestion Chips */}
                  {followUpSuggestions.length > 0 && (
                    <div className="pt-2 border-t border-border flex flex-wrap items-center gap-2">
                      <span className="text-caption font-medium text-secondary">
                        Suggested follow-ups:
                      </span>
                      {followUpSuggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestedClick(sug)}
                          className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-page border border-border hover:border-primary text-caption font-medium text-main transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <span>{sug}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Persistent Bottom Query Bar */}
            <div className="shrink-0 pt-2">
              <Card variant="glass" padded="sm" className="shadow-md">
                <form onSubmit={handleSubmit} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <textarea
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={!activeDataset || isBusy}
                      placeholder={
                        activeDataset
                          ? `Ask a follow-up or a new question about ${activeDataset.name}...`
                          : 'Connect a dataset to query...'
                      }
                      rows={1}
                      className="w-full min-h-[46px] py-2.5 px-3.5 bg-page border border-border rounded-lg text-control text-main placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none custom-scrollbar"
                      aria-label="Natural language query input"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={!inputVal.trim() || !activeDataset || isBusy}
                      icon={<Send className="w-4 h-4" />}
                      title="Send query"
                    >
                      Ask
                    </Button>
                  </div>
                  <div className="flex items-center justify-between text-caption text-secondary px-1">
                    <span>Press Enter to send, Shift + Enter for new line</span>
                    <span>Safe read-only execution</span>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
