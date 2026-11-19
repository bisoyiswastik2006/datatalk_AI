import React, { useState } from 'react';
import {
  Layers,
  Play,
  Download,
  Sliders,
  Check,
} from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ChartPanel } from '../../components/query/ChartPanel';
import { useToast } from '../../components/common/Toast';
import {
  executeBackendPredictiveAnalysis,
  BackendPredictiveResponse,
} from '../../services/backendApi';

type ModelType = 'xgboost' | 'randomforest' | 'arima' | 'elasticnet';

export const PredictiveAnalyticsPage: React.FC = () => {
  const { activeDataset } = useDataset();
  const { showToast } = useToast();

  const [selectedModel, setSelectedModel] = useState<ModelType>('xgboost');

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'quantity',
    'region',
    'category',
    'customer_id',
  ]);

  const [isTraining, setIsTraining] = useState(false);
  const [trainProgress, setTrainProgress] = useState(0);
  const [predictionResult, setPredictionResult] =
    useState<BackendPredictiveResponse | null>(null);

  const datasetName = activeDataset?.name || 'No dataset selected';

  const models: {
    id: ModelType;
    name: string;
    category: string;
    description: string;
    badge: string;
  }[] = [
    {
      id: 'xgboost',
      name: 'XGBoost Forecaster',
      category: 'Gradient Boosting',
      description: 'Optimized tree ensemble engineered for structured tabular data with fast inference.',
      badge: 'Recommended',
    },
    {
      id: 'randomforest',
      name: 'Random Forest Regressor',
      category: 'Bagged Trees',
      description: 'Robust to outliers and sparse features, excellent resistance to overfitting.',
      badge: 'Stable',
    },
    {
      id: 'arima',
      name: 'ARIMA Time-Series',
      category: 'Autoregressive',
      description: 'Decomposes temporal patterns using autoregressive time-series forecasting.',
      badge: 'Temporal',
    },
    {
      id: 'elasticnet',
      name: 'ElasticNet Linear',
      category: 'L1/L2 Regularized',
      description: 'Interpretable regression baseline with feature coefficient analysis.',
      badge: 'Interpretable',
    },
  ];

  // Features available in the current sales dataset.
  // The target column (sales_amount) is predicted, not used as an input feature.
  const featuresList = [
    { id: 'quantity', name: 'quantity', type: 'INTEGER' },
    { id: 'region', name: 'region', type: 'VARCHAR' },
    { id: 'category', name: 'category', type: 'VARCHAR' },
    { id: 'customer_id', name: 'customer_id', type: 'VARCHAR' },
    { id: 'customer_name', name: 'customer_name', type: 'VARCHAR' },
    { id: 'order_date', name: 'order_date', type: 'DATE' },
  ];

  const toggleFeature = (id: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(id)
        ? prev.filter((feature) => feature !== id)
        : [...prev, id]
    );
  };

  const formatNumber = (value: number | null | undefined, decimals = 2) => {
    if (value === null || value === undefined || !Number.isFinite(value)) {
      return 'N/A';
    }

    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const getFeatureImportance = (featureId: string) => {
    if (!predictionResult?.feature_importance) {
      return null;
    }

    const matchingFeatures = predictionResult.feature_importance.filter(
      (item) =>
        item.name === featureId ||
        item.name.toLowerCase().includes(featureId.toLowerCase())
    );

    if (matchingFeatures.length === 0) {
      return null;
    }

    return matchingFeatures.reduce(
      (total, item) => total + item.weight,
      0
    );
  };

  const handleTrainModel = async () => {
    if (!activeDataset?.id) {
      showToast('Please select a dataset before training.', 'error');
      return;
    }

    if (selectedModel !== 'arima' && selectedFeatures.length === 0) {
      showToast('Please select at least one input feature.', 'error');
      return;
    }

    setIsTraining(true);
    setTrainProgress(15);
    setPredictionResult(null);

    try {
      const result = await executeBackendPredictiveAnalysis(
        activeDataset.id,
        selectedModel,
        selectedFeatures
      );

      if (!result.success) {
        throw new Error(result.message || 'Model training failed.');
      }

      setPredictionResult(result);
      setTrainProgress(100);

      showToast(
        `${models.find((model) => model.id === selectedModel)?.name} trained successfully.`,
        'success'
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to train the predictive model.';

      showToast(message, 'error');
    } finally {
      setIsTraining(false);
    }
  };

  // Actual vs predicted chart from backend results.
  const predictionChart = {
    columns: predictionResult?.chart.columns || [
      'Sample Index',
      'Actual',
      'Predicted',
    ],
    rows: predictionResult?.chart.rows || [],
    chartHint: {
      type: 'line' as const,
      x: predictionResult?.chart.columns[0] || 'Sample Index',
      y: predictionResult?.chart.columns[2] || 'Predicted',
      title: 'Actual vs Model-Predicted Values',
    },
  };

  // Download actual backend predictions as CSV.
  const handleExportPredictions = () => {
    if (!predictionResult || predictionResult.predictions.length === 0) {
      showToast('Train a model before exporting predictions.', 'error');
      return;
    }

    const headers = [
      'Record ID',
      'Actual',
      'Predicted',
      'Difference',
      'Absolute Error',
      'Error Percentage',
      'Residual Standard Deviation',
    ];

    const rows = predictionResult.predictions.map((item) => [
      item.id,
      item.actual,
      item.predicted,
      item.difference,
      item.absolute_error,
      item.error_percentage ?? '',
      item.confidence_bound,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${selectedModel}_predictions.csv`;
    link.click();

    URL.revokeObjectURL(url);

    showToast('Prediction results exported successfully.', 'success');
  };

  const selectedModelMetrics =
    predictionResult?.model === selectedModel
      ? predictionResult.metrics
      : null;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-caption text-secondary">
            <span>Workspace</span>
            <span>/</span>
            <span className="font-mono text-primary font-medium">
              {datasetName}
            </span>
            <span>/</span>
            <span className="text-main font-medium">
              Predictive Analytics
            </span>
          </div>

          <h2 className="text-title-page font-semibold tracking-tight text-main mt-1 flex items-center gap-2">
            <span>Predictive Machine Learning Engine</span>
            <Badge variant="tint" size="sm">
              Backend Model Training
            </Badge>
          </h2>

          <p className="text-body text-secondary mt-1">
            Train, validate, and evaluate machine-learning models using your selected dataset.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="gradient"
            size="sm"
            onClick={handleTrainModel}
            disabled={isTraining || !activeDataset}
            icon={<Play className="w-4 h-4 fill-current" />}
          >
            {isTraining
              ? `Training (${trainProgress}%)`
              : 'Train Selected Model'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportPredictions}
            disabled={!predictionResult}
            icon={<Download className="w-4 h-4" />}
          >
            Export Predictions
          </Button>
        </div>
      </div>

      {/* Model Selection Cards */}
      <div className="space-y-3">
        <h3 className="text-caption font-semibold uppercase tracking-wider text-secondary">
          1. Select Algorithmic Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {models.map((mod) => {
            const isSelected = mod.id === selectedModel;

            const modelMetrics =
              predictionResult?.model === mod.id
                ? predictionResult.metrics
                : null;

            return (
              <Card
                key={mod.id}
                variant="glass"
                padded="md"
                hoverable
                onClick={() => {
                  setSelectedModel(mod.id);
                  setPredictionResult(null);
                }}
                className={`flex flex-col justify-between space-y-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'ring-2 ring-primary border-primary shadow-glow'
                    : 'hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-mono font-semibold text-secondary">
                    {mod.category}
                  </span>

                  <Badge
                    variant={isSelected ? 'primary' : 'outline'}
                    size="sm"
                  >
                    {mod.badge}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-semibold text-main text-caption">
                    {mod.name}
                  </h4>

                  <p className="text-xs text-secondary mt-1 line-clamp-2">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs font-mono">
                  <span className="text-secondary">
                    R²:{' '}
                    <strong className="text-main">
                      {formatNumber(modelMetrics?.r2, 3)}
                    </strong>
                  </span>

                  <span className="text-secondary">
                    RMSE:{' '}
                    <strong className="text-main">
                      {formatNumber(modelMetrics?.rmse)}
                    </strong>
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Performance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card variant="glass" padded="md" className="space-y-1">
          <span className="text-caption font-medium text-secondary">
            R² Coefficient of Determination
          </span>

          <div className="text-3xl font-semibold text-main font-mono tracking-tight text-cyan-400">
            {formatNumber(selectedModelMetrics?.r2, 3)}
          </div>

          <p className="text-caption text-secondary">
            {selectedModelMetrics?.r2 !== null &&
            selectedModelMetrics?.r2 !== undefined
              ? 'Calculated using held-out test records'
              : 'Train a model to view this metric'}
          </p>
        </Card>

        <Card variant="glass" padded="md" className="space-y-1">
          <span className="text-caption font-medium text-secondary">
            Root Mean Squared Error (RMSE)
          </span>

          <div className="text-3xl font-semibold text-main font-mono tracking-tight">
            {formatNumber(selectedModelMetrics?.rmse)}
          </div>

          <p className="text-caption text-secondary">
            {predictionResult
              ? `${predictionResult.testing_records} testing records`
              : 'Awaiting model evaluation'}
          </p>
        </Card>

        <Card variant="glass" padded="md" className="space-y-1">
          <span className="text-caption font-medium text-secondary">
            Mean Absolute Error (MAE)
          </span>

          <div className="text-3xl font-semibold text-main font-mono tracking-tight">
            {formatNumber(selectedModelMetrics?.mae)}
          </div>

          <p className="text-caption text-secondary">
            Average absolute prediction error
          </p>
        </Card>

        <Card variant="glass" padded="md" className="space-y-1">
          <span className="text-caption font-medium text-secondary">
            Training Time
          </span>

          <div className="text-3xl font-semibold text-main font-mono tracking-tight text-emerald-400">
            {selectedModelMetrics
              ? `${formatNumber(selectedModelMetrics.training_time_ms, 0)} ms`
              : '—'}
          </div>

          <p className="text-caption text-secondary">
            Backend model training duration
          </p>
        </Card>
      </div>

      {/* Feature Selection & Validation Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Feature Selection */}
        <div className="lg:col-span-4 space-y-4">
          <Card variant="glass" padded="md" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-title-card text-main flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" />
                <span>Feature Selection</span>
              </h4>

              <span className="text-xs font-mono text-secondary">
                {selectedFeatures.length} active
              </span>
            </div>

            <p className="text-caption text-secondary">
              Select input attributes for model training. Feature importance is displayed after training.
            </p>

            <div className="space-y-2">
              {featuresList.map((feat) => {
                const isActive = selectedFeatures.includes(feat.id);
                const importance = getFeatureImportance(feat.id);

                return (
                  <div
                    key={feat.id}
                    onClick={() => toggleFeature(feat.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-page border-primary/60'
                        : 'bg-page/40 border-border opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                          isActive
                            ? 'bg-primary border-primary text-primary-text'
                            : 'border-border'
                        }`}
                      >
                        {isActive && <Check className="w-3 h-3" />}
                      </div>

                      <div>
                        <div className="font-mono text-xs font-semibold text-main">
                          {feat.name}
                        </div>

                        <span className="text-[10px] text-secondary font-mono">
                          {feat.type}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-medium text-primary">
                        {importance !== null
                          ? `${formatNumber(importance, 1)}%`
                          : predictionResult
                            ? 'N/A'
                            : '—'}
                      </span>

                      <div className="text-[9px] text-secondary">
                        {predictionResult ? 'Importance' : 'Not trained'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Validation Chart */}
        <div className="lg:col-span-8 h-[380px]">
          {predictionResult ? (
            <ChartPanel
              columns={predictionChart.columns}
              rows={predictionChart.rows}
              chartHint={predictionChart.chartHint}
            />
          ) : (
            <Card
              variant="glass"
              padded="md"
              className="h-full flex items-center justify-center"
            >
              <div className="text-center space-y-2">
                <Layers className="w-10 h-10 text-secondary mx-auto opacity-50" />

                <h4 className="font-semibold text-main">
                  Actual vs Predicted Chart
                </h4>

                <p className="text-caption text-secondary">
                  Train a model to generate predictions and visualize its results.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Prediction Results Table */}
      <Card variant="glass" padded="md" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />

            <h4 className="font-semibold text-title-card text-main">
              Holdout Inference Sample
            </h4>
          </div>

          <Badge variant="outline" size="sm">
            {predictionResult
              ? `${predictionResult.testing_records} Test Records`
              : 'Awaiting Training'}
          </Badge>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-caption">
            <thead>
              <tr className="border-b border-border text-secondary text-xs font-mono uppercase">
                <th className="pb-2.5 font-medium">Record ID</th>
                <th className="pb-2.5 font-medium">Actual Ground Truth</th>
                <th className="pb-2.5 font-medium">Model Forecast</th>
                <th className="pb-2.5 font-medium">Residual Delta</th>
                <th className="pb-2.5 font-medium">Absolute Error</th>
                <th className="pb-2.5 font-medium text-right">
                  Residual SD
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60">
              {predictionResult?.predictions.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-page/50 transition-colors"
                >
                  <td className="py-2.5 font-mono text-primary font-medium">
                    {row.id}
                  </td>

                  <td className="py-2.5 font-mono text-main">
                    {formatNumber(row.actual)}
                  </td>

                  <td className="py-2.5 font-mono font-semibold text-main">
                    {formatNumber(row.predicted)}
                  </td>

                  <td className="py-2.5 font-mono text-secondary">
                    {row.difference >= 0 ? '+' : ''}
                    {formatNumber(row.difference)}
                  </td>

                  <td className="py-2.5 font-mono text-emerald-400">
                    {formatNumber(row.absolute_error)}
                  </td>

                  <td className="py-2.5 font-mono text-secondary text-right">
                    ±{formatNumber(row.confidence_bound)}
                  </td>
                </tr>
              ))}

              {!predictionResult && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-secondary"
                  >
                    No prediction results yet. Select a model and click
                    Train Selected Model.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {predictionResult && (
          <p className="text-xs text-secondary">
            Target: {predictionResult.target} | Training records:{' '}
            {predictionResult.training_records} | Testing records:{' '}
            {predictionResult.testing_records}. Residual SD is an estimate
            based on prediction errors, not a calibrated confidence interval.
          </p>
        )}
      </Card>
    </div>
  );
};