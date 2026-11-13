import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DatasetDetail, SchemaResponse, DatasetPreviewResponse } from '../types/dataset';
import { api } from '../services/api';

interface DatasetContextType {
  datasets: DatasetDetail[];
  activeDataset: DatasetDetail | null;
  activeSchema: SchemaResponse | null;
  activePreview: DatasetPreviewResponse | null;
  isLoading: boolean;
  error: string | null;
  loadDatasets: () => Promise<void>;
  selectDataset: (datasetId: string) => Promise<void>;
  clearActiveDataset: () => void;
  deleteDataset: (datasetId: string) => Promise<void>;
  refreshActivePreview: (table?: string) => Promise<void>;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export const DatasetProvider: React.FC<{
  children: React.ReactNode;
  onDatasetChanged?: () => void;
}> = ({ children, onDatasetChanged }) => {
  const [datasets, setDatasets] = useState<DatasetDetail[]>([]);
  const [activeDataset, setActiveDataset] = useState<DatasetDetail | null>(null);
  const [activeSchema, setActiveSchema] = useState<SchemaResponse | null>(null);
  const [activePreview, setActivePreview] = useState<DatasetPreviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectDataset = useCallback(
    async (datasetId: string) => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch detail, schema and preview in parallel
        const [detail, schema, preview] = await Promise.all([
          api.getDataset(datasetId),
          api.getSchema(datasetId),
          api.getPreview(datasetId),
        ]);

        // Switching dataset clears previous query results and chat
        if (onDatasetChanged) {
          onDatasetChanged();
        }

        setActiveDataset(detail);
        setActiveSchema(schema);
        setActivePreview(preview);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : `Failed to load dataset ${datasetId}`;
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [onDatasetChanged]
  );

  const loadDatasets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getDatasets();
      setDatasets(data);
      const isExplicitEmpty = new URLSearchParams(window.location.search).get('empty') === 'true';
      if (data.length > 0 && !isExplicitEmpty) {
        selectDataset(data[0].id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch datasets';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [selectDataset]);

  const clearActiveDataset = useCallback(() => {
    setActiveDataset(null);
    setActiveSchema(null);
    setActivePreview(null);
    if (onDatasetChanged) {
      onDatasetChanged();
    }
  }, [onDatasetChanged]);

  const deleteDataset = useCallback(
    async (datasetId: string) => {
      try {
        setIsLoading(true);
        await api.deleteDataset(datasetId);
        if (activeDataset?.id === datasetId) {
          clearActiveDataset();
        }
        await loadDatasets();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : `Failed to delete dataset ${datasetId}`;
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [activeDataset?.id, clearActiveDataset, loadDatasets]
  );

  const refreshActivePreview = useCallback(
    async (table?: string) => {
      if (!activeDataset) return;
      try {
        const preview = await api.getPreview(activeDataset.id, table);
        setActivePreview(preview);
      } catch (err: unknown) {
        console.error('Failed to refresh preview', err);
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

