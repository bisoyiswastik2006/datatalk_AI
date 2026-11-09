import { useState, useEffect } from 'react';
import { DatasetProvider, useDataset } from './context/DatasetContext';
import { QueryProvider, useQuery, QueryFlowState } from './context/QueryContext';
import { AppShell } from './components/layout/AppShell';
import { WorkbenchView } from './components/layout/Sidebar';
import { UploadZone } from './components/dataset/UploadZone';
import { DatasetPreviewModal } from './components/dataset/DatasetPreviewModal';
import { DatasetSwitcher } from './components/dataset/DatasetSwitcher';
import { QueryStudio } from './components/query/QueryStudio';
import { AssistantPanel } from './components/assistant/AssistantPanel';
import { StateContainer } from './components/states/StateContainer';
import { StateSelectorPill } from './components/states/StateSelectorPill';
import { DataExplorerView } from './components/explorer/DataExplorerView';
import { SchemaModelsView } from './components/schema/SchemaModelsView';
import { SavedNotebooksView } from './components/notebooks/SavedNotebooksView';
import { deriveSuggestedQuestions } from './utils/questions';
import { config } from './config';
import { DatasetDetail } from './types/dataset';
import { api } from './services/api';
import { MOCK_SCHEMAS, MOCK_PREVIEWS } from './services/mocks/mockData';
import { Sparkles, ArrowRight } from 'lucide-react';

function DataTalkApp() {
  const {
    datasets,
    activeDataset,
    activeSchema,
    activePreview,
    selectDataset,
    deleteDataset,
    refreshActivePreview,
  } = useDataset();

  const {
    state: queryState,
    queryResult,
    messages,
    askQuestion,
    resetQueryState,
    setStateDirectly,
  } = useQuery();

  const [currentView, setCurrentView] = useState<WorkbenchView>('query-studio');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [pendingPreviewDataset, setPendingPreviewDataset] = useState<DatasetDetail | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Handle initial URL parameters for screenshot verification or direct linking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === 'results') {
      selectDataset('dataset-retail-01').then(() => {
        askQuestion('Compare regional revenue for Q3 2024 and rank by highest sales.', 'dataset-retail-01');
      });
    } else if (viewParam === 'preview') {
      api.getDataset('dataset-excel-02').then((detail) => {
        setPendingPreviewDataset(detail);
        selectDataset('dataset-excel-02');
      });
    }
  }, []);

  // Derive suggested questions dynamically from the active schema
  const suggestedQuestions = deriveSuggestedQuestions(activeSchema);

  // Handle uploading file
  const handleFileSelected = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadError(null);
      const res = await api.uploadDataset(file);
      const detail = await api.getDataset(res.dataset_id);
      // Open preview modal for confirmation
      setPendingPreviewDataset(detail);
      await selectDataset(detail.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle quick start template selection
  const handleSelectQuickStart = async (datasetId: string) => {
    await selectDataset(datasetId);
  };

  // Confirm using the dataset from preview modal
  const handleConfirmDataset = () => {
    setPendingPreviewDataset(null);
    setIsUploadModalOpen(false);
  };

  const handleSelectStateDemo = (targetState: QueryFlowState) => {
    setStateDirectly(targetState);
  };

  return (
    <>
      <AppShell
        topBarProps={{
          activeDatasetName: activeDataset?.name || null,
          activeDatasetSize: activeDataset?.formatted_size || null,
          systemStatus: activeDataset ? 'System ready' : null,
          latencyMs: queryResult?.execution_ms ?? (activeDataset ? 38 : null),
          schemaVerified: activeSchema?.verified ?? null,
          isMockMode: config.useMocks,
          onOpenUpload: () => setIsUploadModalOpen(true),
          onOpenSwitcher: () => setIsSwitcherOpen(true),
        }}
        currentView={currentView}
        onViewChange={setCurrentView}
        engineName={activeDataset?.metadata?.engine || null}
        memoryUsage={
          activeDataset?.metadata?.memory_mb
            ? `${(activeDataset.metadata.memory_mb / 1024).toFixed(1)} GB / 4 GB`
            : null
        }
        assistantPanel={
          <AssistantPanel
            datasetName={activeDataset?.name || null}
            datasetRows={activeDataset?.total_rows || null}
            messages={messages}
            suggestedQuestions={suggestedQuestions}
            isProcessing={queryState === 'generating_sql' || queryState === 'executing'}
            isDisabled={!activeDataset}
            onSendMessage={(q) => {
              if (activeDataset) {
                askQuestion(q, activeDataset.id);
              }
            }}
            onResetChat={resetQueryState}
          />
        }
      >
        {/* State Demo Selector Pill positioned in top right of workspace */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-mono text-ink-muted">
            {activeDataset ? (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-status-success inline-block" />
                Active: <span className="font-semibold text-ink">{activeDataset.name}</span>
              </span>
            ) : (
              <span>No dataset loaded</span>
            )}
          </div>
          <StateSelectorPill
            currentState={queryState}
            onSelectState={handleSelectStateDemo}
          />
        </div>

        {/* Dynamic Workspace Content depending on dataset and query states */}
        {!activeDataset ? (
          /* Empty State: Upload Zone */
          <div className="flex-1 flex flex-col justify-center">
            <UploadZone
              onFileSelected={handleFileSelected}
              onSelectQuickStart={handleSelectQuickStart}
              isUploading={isUploading}
              uploadError={uploadError}
            />
          </div>
        ) : currentView === 'data-explorer' ? (
          <DataExplorerView
            dataset={activeDataset}
            preview={activePreview}
            onSelectTable={refreshActivePreview}
          />
        ) : currentView === 'schema-models' ? (
          <SchemaModelsView
            dataset={activeDataset}
            schema={activeSchema}
          />
        ) : currentView === 'saved-notebooks' ? (
          <SavedNotebooksView
            dataset={activeDataset}
            messages={messages}
            onRerunQuery={(q) => {
              setCurrentView('query-studio');
              askQuestion(q, activeDataset.id);
            }}
          />
        ) : queryState === 'results' && queryResult ? (
          /* Results State: Synthesized Answer, SQL Viewer, Result Table, Chart */
          <QueryStudio queryResponse={queryResult} />
        ) : queryState !== 'idle' ? (
          /* Specific Error and Progress States */
          <div className="flex-1 flex items-center justify-center p-6">
            <StateContainer
              stateType={queryState as any}
              errorMessage={queryResult?.message || undefined}
              clarificationOptions={queryResult?.clarification_options}
              suggestedAlternatives={queryResult?.suggested_alternatives}
              onRetry={() => {
                if (activeDataset) {
                  askQuestion('Compare regional revenue for Q3 2024 and rank by highest sales.', activeDataset.id);
                }
              }}
              onUploadNew={() => setIsUploadModalOpen(true)}
              onSelectOption={(opt) => {
                if (activeDataset) {
                  askQuestion(opt, activeDataset.id);
                }
              }}
              onRephrase={() => setStateDirectly('idle')}
            />
          </div>
        ) : (
          /* Ready State: Dataset Loaded, waiting for query */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-full bg-tint/60 border border-tint flex items-center justify-center text-primary">
              <Sparkles className="w-7 h-7" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-ink">
                {activeDataset.name} is ready for queries
              </h2>
              <p className="text-xs text-ink-muted leading-relaxed max-w-md">
                Ask any natural language question about {activeDataset.name} in the assistant panel on the right, or pick one of the schema-derived questions below:
              </p>
            </div>

            {suggestedQuestions.length > 0 && (
              <div className="w-full space-y-2 pt-2 text-left">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => askQuestion(q, activeDataset.id)}
                    className="w-full p-3 rounded-lg bg-surface border border-tint hover:border-secondary hover:bg-tint/20 text-xs text-ink transition-colors cursor-pointer flex items-center justify-between group shadow-subtle"
                  >
                    <span>{q}</span>
                    <ArrowRight className="w-4 h-4 text-secondary group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </AppShell>

      {/* Dataset Preview Modal */}
      {(pendingPreviewDataset || (isUploadModalOpen && activeDataset)) && (
        <DatasetPreviewModal
          isOpen={Boolean(pendingPreviewDataset || isUploadModalOpen)}
          onClose={() => {
            setPendingPreviewDataset(null);
            setIsUploadModalOpen(false);
          }}
          dataset={pendingPreviewDataset || activeDataset!}
          schema={activeSchema || (pendingPreviewDataset ? MOCK_SCHEMAS[pendingPreviewDataset.id] : null)}
          preview={activePreview || (pendingPreviewDataset ? MOCK_PREVIEWS[pendingPreviewDataset.id] : null)}
          onConfirm={handleConfirmDataset}
          onSelectTable={(table) => refreshActivePreview(table)}
        />
      )}

      {/* Dataset Switcher Modal */}
      <DatasetSwitcher
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        datasets={datasets}
        activeDatasetId={activeDataset?.id}
        onSelectDataset={(id) => selectDataset(id)}
        onDeleteDataset={(id) => deleteDataset(id)}
        onOpenUpload={() => setIsUploadModalOpen(true)}
      />
    </>
  );
}

export function App() {
  return (
    <DatasetProvider>
      <QueryProvider>
        <DataTalkApp />
      </QueryProvider>
    </DatasetProvider>
  );
}

export default App;
