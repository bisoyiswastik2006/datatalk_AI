import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  Save,
  DollarSign,
  Percent,
  Users,
  Package,
  Sparkles,
} from 'lucide-react';

import { useDataset } from '../../context/DatasetContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ChartPanel } from '../../components/query/ChartPanel';
import { useToast } from '../../components/common/Toast';

import {
  executeBackendWhatIf,
  BackendWhatIfResponse,
} from '../../services/backendApi';

export const WhatIfSimulatorPage: React.FC = () => {
  const { activeDataset } = useDataset();
  const { showToast } = useToast();

  // Simulation Controls State

  const [priceChange, setPriceChange] = useState<number>(10);
  const [discountCap, setDiscountCap] = useState<number>(15);
  const [adSpend, setAdSpend] = useState<number>(45);
  const [churnDelta, setChurnDelta] = useState<number>(-3);

  const [activeScenario, setActiveScenario] = useState<
    'custom' | 'growth' | 'margin' | 'defensive'
  >('custom');

  // Backend Response State

  const [simulationData, setSimulationData] =
    useState<BackendWhatIfResponse | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const datasetName = activeDataset?.name || 'No dataset selected';

  // --------------------------------------------------
  // PRESET SCENARIOS
  // --------------------------------------------------

  const applyScenario = (
    type: 'growth' | 'margin' | 'defensive'
  ) => {
    setActiveScenario(type);

    if (type === 'growth') {
      setPriceChange(5);
      setDiscountCap(20);
      setAdSpend(80);
      setChurnDelta(-5);

      showToast(
        'Aggressive Growth Loaded: Parameters set for maximum acquisition velocity.',
        'info'
      );
    } else if (type === 'margin') {
      setPriceChange(18);
      setDiscountCap(10);
      setAdSpend(30);
      setChurnDelta(2);

      showToast(
        'Margin Optimization Loaded: Parameters tuned for higher revenue per order.',
        'info'
      );
    } else if (type === 'defensive') {
      setPriceChange(-5);
      setDiscountCap(12);
      setAdSpend(25);
      setChurnDelta(-6);

      showToast(
        'Defensive Retention Loaded: Parameters focused on customer retention.',
        'info'
      );
    }
  };

  // --------------------------------------------------
  // RESET SIMULATION
  // --------------------------------------------------

  const handleReset = () => {
    setPriceChange(0);
    setDiscountCap(18);
    setAdSpend(40);
    setChurnDelta(0);

    setActiveScenario('custom');

    showToast(
      'Simulation Reset: Parameters returned to baseline.',
      'info'
    );
  };

  // --------------------------------------------------
  // CONNECT TO BACKEND
  // --------------------------------------------------

  useEffect(() => {
    if (!activeDataset?.id) {
      setSimulationData(null);
      setError('Please select a dataset to run the simulation.');
      return;
    }

    let cancelled = false;

    const fetchSimulation = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await executeBackendWhatIf(
          activeDataset.id,
          priceChange,
          discountCap,
          adSpend,
          churnDelta
        );

        if (!cancelled) {
          setSimulationData(response);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : 'Unable to generate scenario analysis.';

          setError(message);
          setSimulationData(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchSimulation();

    return () => {
      cancelled = true;
    };
  }, [
    activeDataset?.id,
    priceChange,
    discountCap,
    adSpend,
    churnDelta,
  ]);

  // --------------------------------------------------
  // BACKEND METRICS
  // --------------------------------------------------

  const baselineRevenue =
    simulationData?.baseline.revenue ?? 0;

  const simulatedRevenue =
    simulationData?.simulation.revenue ?? 0;

  const baselineOrders =
    simulationData?.baseline.orders ?? 0;

  const simulatedOrders =
    simulationData?.simulation.orders ?? 0;

  const revenueDifference =
    simulationData?.simulation.revenue_change_pct ?? 0;

  const ordersDifference =
    simulationData?.simulation.orders_change_pct ?? 0;

  // --------------------------------------------------
  // CHART DATA FROM BACKEND
  // --------------------------------------------------

  const trajectoryChart = simulationData?.chart ?? {
    columns: [
      'Period',
      'Baseline Revenue',
      'Projected Revenue',
    ],
    rows: [],
    chartHint: {
      type: 'line' as const,
      x: 'Period',
      y: 'Projected Revenue',
      title: 'Baseline vs Projected Revenue',
    },
  };

  // --------------------------------------------------
  // SAVE SCENARIO
  // --------------------------------------------------

  const handleSaveScenario = () => {
    if (!simulationData) {
      showToast(
        'Please wait for the simulation to complete.',
        'error'
      );
      return;
    }

    showToast(
      `Model "${activeScenario.toUpperCase()}" analysis completed successfully.`,
      'success'
    );
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

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
              What-If Simulator
            </span>
          </div>

          <h2 className="text-title-page font-semibold tracking-tight text-main mt-1 flex items-center gap-2">

            <span>What-If Scenario Simulator</span>

            <Badge variant="tint" size="sm">
              Monte Carlo Sandbox
            </Badge>

          </h2>

          <p className="text-body text-secondary mt-1">
            Simulate parameter adjustments to predict revenue velocity,
            demand changes, and customer retention sensitivity.
          </p>
        </div>

        <div className="flex items-center gap-3">

          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Reset
          </Button>

          <Button
            variant="gradient"
            size="sm"
            onClick={handleSaveScenario}
            icon={<Save className="w-4 h-4" />}
          >
            Save Scenario
          </Button>

        </div>
      </div>

      {/* Loading and Error Status */}

      {isLoading && (
        <div className="text-caption text-primary">
          Recalculating scenario using your selected dataset...
        </div>
      )}

      {error && (
        <Card variant="glass" padded="md">
          <p className="text-sm text-red-400">
            {error}
          </p>
        </Card>
      )}

      {/* Preset Scenario Tabs */}

      <div className="flex flex-wrap items-center gap-3 border-b border-border/80 pb-3">

        <span className="text-caption font-medium text-secondary mr-2">
          Preset Models:
        </span>

        <button
          onClick={() => applyScenario('growth')}
          className={`px-3 py-1.5 rounded-xl text-caption font-medium transition-all cursor-pointer ${
            activeScenario === 'growth'
              ? 'bg-primary text-primary-text font-semibold shadow-sm'
              : 'bg-page border border-border text-secondary hover:text-main'
          }`}
        >
          Aggressive Growth (+Ad Spend)
        </button>

        <button
          onClick={() => applyScenario('margin')}
          className={`px-3 py-1.5 rounded-xl text-caption font-medium transition-all cursor-pointer ${
            activeScenario === 'margin'
              ? 'bg-primary text-primary-text font-semibold shadow-sm'
              : 'bg-page border border-border text-secondary hover:text-main'
          }`}
        >
          Margin Optimization (+Price, -Discount)
        </button>

        <button
          onClick={() => applyScenario('defensive')}
          className={`px-3 py-1.5 rounded-xl text-caption font-medium transition-all cursor-pointer ${
            activeScenario === 'defensive'
              ? 'bg-primary text-primary-text font-semibold shadow-sm'
              : 'bg-page border border-border text-secondary hover:text-main'
          }`}
        >
          Defensive Retention (-Churn Focus)
        </button>

      </div>

      {/* Before-and-After KPI Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

        {/* Metric 1: Revenue */}

        <Card variant="glass" padded="md" className="space-y-2">

          <div className="flex items-center justify-between text-secondary">

            <span className="text-caption font-medium">
              Projected Revenue
            </span>

            <div className="w-8 h-8 rounded-lg bg-primary-tint flex items-center justify-center text-primary">
              <DollarSign className="w-4 h-4" />
            </div>

          </div>

          <div className="text-3xl font-semibold text-main font-mono tracking-tight">

            {simulationData
              ? `$${(simulatedRevenue / 1000).toFixed(1)}k`
              : '--'}

          </div>

          <div className="flex items-center justify-between text-caption pt-1 border-t border-border/60">

            <span className="text-secondary">
              Base: {simulationData
                ? `$${(baselineRevenue / 1000).toFixed(1)}k`
                : '--'}
            </span>

            <span
              className={`font-mono font-semibold ${
                revenueDifference >= 0
                  ? 'text-emerald-400'
                  : 'text-red-400'
              }`}
            >
              {simulationData
                ? `${revenueDifference >= 0 ? '+' : ''}${revenueDifference.toFixed(1)}%`
                : '--'}
            </span>

          </div>

        </Card>

        {/* Metric 2: Profit Margin */}

        <Card variant="glass" padded="md" className="space-y-2">

          <div className="flex items-center justify-between text-secondary">

            <span className="text-caption font-medium">
              Net Margin
            </span>

            <div className="w-8 h-8 rounded-lg bg-primary-tint flex items-center justify-center text-primary">
              <Percent className="w-4 h-4" />
            </div>

          </div>

          <div className="text-3xl font-semibold text-main font-mono tracking-tight">
            N/A
          </div>

          <div className="flex items-center justify-between text-caption pt-1 border-t border-border/60">

            <span className="text-secondary">
              Not available
            </span>

            <span className="font-mono font-semibold text-secondary">
              No cost data
            </span>

          </div>

        </Card>

        {/* Metric 3: Customer LTV */}

        <Card variant="glass" padded="md" className="space-y-2">

          <div className="flex items-center justify-between text-secondary">

            <span className="text-caption font-medium">
              Customer LTV
            </span>

            <div className="w-8 h-8 rounded-lg bg-primary-tint flex items-center justify-center text-primary">
              <Users className="w-4 h-4" />
            </div>

          </div>

          <div className="text-3xl font-semibold text-main font-mono tracking-tight">
            N/A
          </div>

          <div className="flex items-center justify-between text-caption pt-1 border-t border-border/60">

            <span className="text-secondary">
              Not available
            </span>

            <span className="font-mono font-semibold text-secondary">
              No customer history
            </span>

          </div>

        </Card>

        {/* Metric 4: Total Orders */}

        <Card variant="glass" padded="md" className="space-y-2">

          <div className="flex items-center justify-between text-secondary">

            <span className="text-caption font-medium">
              Order Velocity
            </span>

            <div className="w-8 h-8 rounded-lg bg-primary-tint flex items-center justify-center text-primary">
              <Package className="w-4 h-4" />
            </div>

          </div>

          <div className="text-3xl font-semibold text-main font-mono tracking-tight">

            {simulationData
              ? simulatedOrders.toLocaleString()
              : '--'}

          </div>

          <div className="flex items-center justify-between text-caption pt-1 border-t border-border/60">

            <span className="text-secondary">
              Base: {simulationData
                ? baselineOrders.toLocaleString()
                : '--'}
            </span>

            <span
              className={`font-mono font-semibold ${
                ordersDifference >= 0
                  ? 'text-emerald-400'
                  : 'text-red-400'
              }`}
            >
              {simulationData
                ? `${ordersDifference >= 0 ? '+' : ''}${ordersDifference.toFixed(1)}%`
                : '--'}
            </span>

          </div>

        </Card>

      </div>

      {/* Interactive Controls & Trajectory Chart */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Sliders */}

        <div className="lg:col-span-5 space-y-4">

          <Card variant="glass" padded="lg" className="space-y-6">

            <div className="flex items-center justify-between">

              <h3 className="font-semibold text-title-card text-main flex items-center gap-2">

                <SlidersHorizontal className="w-4 h-4 text-primary" />

                <span>Simulation Levers</span>

              </h3>

              <span className="text-xs font-mono text-secondary">
                Dynamic Recalculation
              </span>

            </div>

            {/* Slider 1: Price Change */}

            <div className="space-y-2">

              <div className="flex items-center justify-between text-caption font-medium">

                <span className="text-main">
                  Pricing Shift
                </span>

                <span className="font-mono text-primary font-semibold">
                  {priceChange >= 0
                    ? `+${priceChange}%`
                    : `${priceChange}%`}
                </span>

              </div>

              <input
                type="range"
                min="-20"
                max="40"
                step="1"
                value={priceChange}
                onChange={(e) => {
                  setPriceChange(Number(e.target.value));
                  setActiveScenario('custom');
                }}
                className="w-full accent-primary h-2 bg-page rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[11px] text-secondary font-mono">
                <span>-20% (Discount push)</span>
                <span>0% (Baseline)</span>
                <span>+40% (Premium)</span>
              </div>

            </div>

            {/* Slider 2: Discount Cap */}

            <div className="space-y-2">

              <div className="flex items-center justify-between text-caption font-medium">

                <span className="text-main">
                  Promotion Discount Ceiling
                </span>

                <span className="font-mono text-primary font-semibold">
                  {discountCap}% Max
                </span>

              </div>

              <input
                type="range"
                min="0"
                max="35"
                step="1"
                value={discountCap}
                onChange={(e) => {
                  setDiscountCap(Number(e.target.value));
                  setActiveScenario('custom');
                }}
                className="w-full accent-primary h-2 bg-page rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[11px] text-secondary font-mono">
                <span>0% (No promos)</span>
                <span>18% (Standard)</span>
                <span>35% (Deep sale)</span>
              </div>

            </div>

            {/* Slider 3: Marketing Spend */}

            <div className="space-y-2">

              <div className="flex items-center justify-between text-caption font-medium">

                <span className="text-main">
                  Marketing & Growth Budget
                </span>

                <span className="font-mono text-primary font-semibold">
                  ${adSpend}k / mo
                </span>

              </div>

              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={adSpend}
                onChange={(e) => {
                  setAdSpend(Number(e.target.value));
                  setActiveScenario('custom');
                }}
                className="w-full accent-primary h-2 bg-page rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[11px] text-secondary font-mono">
                <span>$10k (Lean)</span>
                <span>$40k (Baseline)</span>
                <span>$100k (Aggressive)</span>
              </div>

            </div>

            {/* Slider 4: Churn Shift */}

            <div className="space-y-2">

              <div className="flex items-center justify-between text-caption font-medium">

                <span className="text-main">
                  Customer Retention Sensitivity
                </span>

                <span className="font-mono text-primary font-semibold">
                  {churnDelta <= 0
                    ? `${churnDelta}% Churn`
                    : `+${churnDelta}% Churn`}
                </span>

              </div>

              <input
                type="range"
                min="-8"
                max="8"
                step="1"
                value={churnDelta}
                onChange={(e) => {
                  setChurnDelta(Number(e.target.value));
                  setActiveScenario('custom');
                }}
                className="w-full accent-primary h-2 bg-page rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[11px] text-secondary font-mono">
                <span>-8% (High Retention)</span>
                <span>0% (Baseline)</span>
                <span>+8% (Elevated Loss)</span>
              </div>

            </div>

          </Card>

        </div>

        {/* Right Column: Chart & Scenario Breakdown */}

        <div className="lg:col-span-7 space-y-4">

          <div className="h-[360px]">

            <ChartPanel
              columns={trajectoryChart.columns}
              rows={trajectoryChart.rows}
              chartHint={trajectoryChart.chartHint}
            />

          </div>

          <Card variant="glass" padded="md" className="space-y-3">

            <h4 className="font-semibold text-main text-caption flex items-center gap-2">

              <Sparkles className="w-4 h-4 text-primary" />

              <span>Scenario Risk & Sensitivity Assessment</span>

            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-caption">

              {/* Risk Assessment */}

              <div className="p-3 rounded-xl bg-page border border-border">

                <span className="text-xs text-secondary">
                  Scenario Risk
                </span>

                <div className="font-semibold text-main font-mono text-base mt-1">

                  {simulationData?.assessment.risk_level || '--'}

                </div>

                <p className="text-[11px] text-secondary mt-0.5">
                  {simulationData?.assessment.summary || 'Waiting for analysis'}
                </p>

              </div>

              {/* Revenue Impact */}

              <div className="p-3 rounded-xl bg-page border border-border">

                <span className="text-xs text-secondary">
                  Revenue Impact
                </span>

                <div className="font-semibold text-main font-mono text-base mt-1">

                  {simulationData
                    ? `${revenueDifference >= 0 ? '+' : ''}${revenueDifference.toFixed(2)}%`
                    : '--'}

                </div>

                <p className="text-[11px] text-secondary mt-0.5">
                  Compared with actual baseline
                </p>

              </div>

              {/* Order Impact */}

              <div className="p-3 rounded-xl bg-page border border-border">

                <span className="text-xs text-secondary">
                  Order Impact
                </span>

                <div className="font-semibold text-main font-mono text-base mt-1">

                  {simulationData
                    ? `${ordersDifference >= 0 ? '+' : ''}${ordersDifference.toFixed(2)}%`
                    : '--'}

                </div>

                <p className="text-[11px] text-secondary mt-0.5">
                  Estimated order change
                </p>

              </div>

            </div>

            {/* Model Assumptions */}

            {simulationData && (
              <div className="pt-3 border-t border-border/60">

                <p className="text-xs font-medium text-secondary mb-2">
                  Model Assumptions
                </p>

                <ul className="space-y-1">

                  {simulationData.assumptions.map(
                    (assumption, index) => (
                      <li
                        key={index}
                        className="text-[11px] text-secondary"
                      >
                        • {assumption}
                      </li>
                    )
                  )}

                </ul>

              </div>
            )}

          </Card>

        </div>

      </div>

    </div>
  );
};