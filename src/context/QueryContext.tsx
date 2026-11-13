import React, { createContext, useContext, useState, useCallback } from 'react';
import { QueryResponse } from '../types/query';
import { ChatMessage } from '../types/chat';
import { api } from '../services/api';
import { stripEmoji } from '../utils/text';

export type QueryFlowState =
  | 'idle'
  | 'uploading'
  | 'validation_failed'
  | 'processing'
  | 'generating_sql'
  | 'executing'
  | 'results'
  | 'not_answerable'
  | 'needs_clarification'
  | 'rejected'
  | 'timeout'
  | 'empty_result'
  | 'backend_unavailable'
  | 'llm_not_configured'
  | 'error';

interface QueryContextType {
  state: QueryFlowState;
  queryResult: QueryResponse | null;
  messages: ChatMessage[];
  currentQuestion: string;
  error: string | null;
  askQuestion: (question: string, datasetId: string) => Promise<void>;
  resetQueryState: () => void;
  setStateDirectly: (state: QueryFlowState) => void;
}

const QueryContext = createContext<QueryContextType | undefined>(undefined);

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<QueryFlowState>('idle');
  const [queryResult, setQueryResult] = useState<QueryResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const resetQueryState = useCallback(() => {
    setState('idle');
    setQueryResult(null);
    setMessages([]);
    setCurrentQuestion('');
    setError(null);
  }, []);

  const askQuestion = useCallback(
    async (question: string, datasetId: string) => {
      const sanitizedQuestion = stripEmoji(question.trim());
      if (!sanitizedQuestion) return;

      const userMessageId = `user-${Date.now()}`;
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Add user message to chat history
      setMessages((prev) => [
        ...prev,
        {
          id: userMessageId,
          role: 'user',
          content: sanitizedQuestion,
          timestamp: now,
        },
      ]);

      setCurrentQuestion(sanitizedQuestion);
      setError(null);

      try {
        // Step 1: Generating SQL
        setState('generating_sql');
        await new Promise((resolve) => setTimeout(resolve, 350));

        // Step 2: Executing
        setState('executing');
        const response = await api.executeQuery({
          dataset_id: datasetId,
          question: sanitizedQuestion,
        });

        // Safeguard: Strip emoji from model output
        if (response.answer) {
          response.answer = stripEmoji(response.answer);
        }
        if (response.message) {
          response.message = stripEmoji(response.message);
        }

        setQueryResult(response);

        // Map response status to flow state
        let targetState: QueryFlowState = 'results';
        if (response.status === 'not_answerable') targetState = 'not_answerable';
        else if (response.status === 'needs_clarification') targetState = 'needs_clarification';
        else if (response.status === 'rejected') targetState = 'rejected';
        else if (response.status === 'timeout') targetState = 'timeout';
        else if (response.status === 'empty_result' || (response.rows && response.rows.length === 0)) {
          targetState = 'empty_result';
        } else if (response.status === 'error') targetState = 'error';

        setState(targetState);

        // Add assistant reply to chat history
        const assistantMessage: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content:
            response.answer ||
            response.message ||
            'Query completed successfully with results shown in the workspace.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          queryId: response.query_id,
          queryResult: response,
          clarificationOptions: response.clarification_options,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? stripEmoji(err.message)
            : 'An unexpected query execution failure occurred';
        setError(errorMsg);
        setState('error');

        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: errorMsg,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            error: errorMsg,
          },
        ]);
      }
    },
    []
  );

  return (
    <QueryContext.Provider
      value={{
        state,
        queryResult,
        messages,
        currentQuestion,
        error,
        askQuestion,
        resetQueryState,
        setStateDirectly: setState,
      }}
    >
      {children}
    </QueryContext.Provider>
  );
};

export const useQuery = () => {
  const context = useContext(QueryContext);
  if (!context) {
    throw new Error('useQuery must be used within a QueryProvider');
  }
  return context;
};
