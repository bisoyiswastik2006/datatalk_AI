export interface AppConfig {
  apiBaseUrl: string;
  useMocks: boolean;
  maxFileSizeMb: number;
}

export const config: AppConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  useMocks: import.meta.env.VITE_USE_MOCKS === 'true',
  maxFileSizeMb: Number(import.meta.env.VITE_MAX_FILE_SIZE_MB) || 50,
};

