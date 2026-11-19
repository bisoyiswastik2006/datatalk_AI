import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

import {
  DatasetDetail,
  SchemaResponse,
  DatasetPreviewResponse,
} from '../types/dataset';

import {
  getBackendDataset,
  getBackendSchema,
  getBackendPreview,
  getBackendDatasets,
  deleteBackendDataset,
} from '../services/backendApi';

interface DatasetContextType {
  datasets: DatasetDetail[];
  activeDataset: DatasetDetail | null;
  activeSchema: SchemaResponse | null;
  activePreview: DatasetPreviewResponse | null;
  isLoading: boolean;
  error: string | null;
  loadDatasets: () => Promise<void>;
  selectDataset: (datasetId: string) => Promise<void>;
  selectBackendDataset: (datasetId: string) => Promise<void>;
  clearActiveDataset: () => void;
  deleteDataset: (datasetId: string) => Promise<void>;
  refreshActivePreview: (table?: string) => Promise<void>;
}

const DatasetContext = createContext<DatasetContextType | undefined>(
  undefined
);

export const DatasetProvider: React.FC<{
  children: React.ReactNode;
  onDatasetChanged?: () => void;
}> = ({ children, onDatasetChanged }) => {
  const [datasets, setDatasets] = useState<DatasetDetail[]>([]);
  const [activeDataset, setActiveDataset] =
    useState<DatasetDetail | null>(null);
  const [activeSchema, setActiveSchema] =
    useState<SchemaResponse | null>(null);
  const [activePreview, setActivePreview] =
    useState<DatasetPreviewResponse | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Select a real backend dataset
  const selectBackendDataset = useCallback(
    async (datasetId: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const [detail, schema, preview] = await Promise.all([
          getBackendDataset(datasetId),
          getBackendSchema(datasetId),
          getBackendPreview(datasetId),
        ]);

        setDatasets((previous) => {
          const exists = previous.some((item) => item.id === detail.id);

          if (exists) {
            return previous.map((item) =>
              item.id === detail.id ? detail : item
            );
          }

          return [detail, ...previous];
        });

        setActiveDataset(detail);
        setActiveSchema(schema);
        setActivePreview(preview);

        onDatasetChanged?.();
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : `Failed to load backend dataset ${datasetId}`;

        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [onDatasetChanged]
  );

  // All dataset selections now use the backend
  const selectDataset = useCallback(
    async (datasetId: string) => {
      await selectBackendDataset(datasetId);
    },
    [selectBackendDataset]
  );

  // Load datasets exclusively from FastAPI
  const loadDatasets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const backendData = await getBackendDatasets();

      setDatasets(backendData);

      const isExplicitEmpty =
        new URLSearchParams(window.location.search).get('empty') === 'true';

      if (backendData.length > 0 && !isExplicitEmpty) {
        const currentStillExists = backendData.some(
          (dataset) => dataset.id === activeDataset?.id
        );

        if (!currentStillExists) {
          await selectBackendDataset(backendData[0].id);
        }
      } else if (backendData.length === 0) {
        setActiveDataset(null);
        setActiveSchema(null);
        setActivePreview(null);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to fetch backend datasets';

      setError(msg);
      console.error('Failed to load backend datasets:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeDataset?.id, selectBackendDataset]);

  const clearActiveDataset = useCallback(() => {
    setActiveDataset(null);
    setActiveSchema(null);
    setActivePreview(null);

    onDatasetChanged?.();
  }, [onDatasetChanged]);

  // Backend deletion will be connected in the next step
  const deleteDataset = useCallback(
  async (datasetId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Prevent deletion of predefined datasets
      if (datasetId === 'dataset-retail-01') {
        setError('Predefined datasets cannot be deleted.');
        return;
      }

      await deleteBackendDataset(datasetId);

      if (activeDataset?.id === datasetId) {
        clearActiveDataset();
      }

      await loadDatasets();

    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : `Failed to delete dataset ${datasetId}`;

      setError(msg);
    } finally {
      setIsLoading(false);
    }
  },
  [activeDataset?.id, clearActiveDataset, loadDatasets]
);

  // Refresh preview using real backend data
  const refreshActivePreview = useCallback(
    async (table?: string) => {
      if (!activeDataset) return;

      try {
        const preview = await getBackendPreview(
          activeDataset.id,
          table
        );

        setActivePreview(preview);
      } catch (err) {
        console.error('Failed to refresh backend preview:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to refresh dataset preview'
        );
      }
    },
    [activeDataset]
  );

  useEffect(() => {
    loadDatasets();
  }, [loadDatasets]);

  return (
    <DatasetContext.Provider
      value={{
        datasets,
        activeDataset,
        activeSchema,
        activePreview,
        isLoading,
        error,
        loadDatasets,
        selectDataset,
        selectBackendDataset,
        clearActiveDataset,
        deleteDataset,
        refreshActivePreview,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
};

export const useDataset = () => {
  const context = useContext(DatasetContext);

  if (!context) {
    throw new Error('useDataset must be used within a DatasetProvider');
  }

  return context;
};