import { QueryResponse } from './query';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  queryId?: string;
  queryResult?: QueryResponse;
  isProcessing?: boolean;
  error?: string;
  clarificationOptions?: string[];
}

