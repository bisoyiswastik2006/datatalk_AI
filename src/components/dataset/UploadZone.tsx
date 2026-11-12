import React, { useState, useRef } from 'react';
import { Upload, Database, Table, AlertCircle, ArrowUpRight } from 'lucide-react';
import { Button } from '../common/Button';
import { config } from '../../config';

export interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  onSelectQuickStart?: (datasetId: string) => void;
  isUploading?: boolean;
  uploadError?: string | null;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelected,
  onSelectQuickStart,
  isUploading = false,
  uploadError,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = ['csv', 'xlsx', 'xls', 'sqlite', 'db'];
  const maxBytes = config.maxFileSizeMb * 1024 * 1024;

  const validateAndHandle = (file: File) => {
    setValidationError(null);
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !allowedExtensions.includes(extension)) {
      setValidationError(
        `Unsupported file type '.${extension}'. Only CSV, XLSX, and SQLite files are supported.`
      );
      return;
    }

    if (file.size > maxBytes) {
      setValidationError(
        `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the configured limit of ${config.maxFileSizeMb} MB.`
      );
      return;
    }

    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndHandle(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full justify-between gap-6 py-1">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-title-page font-semibold text-main leading-tight">
          Data Connection & Schema Engine
        </h1>
      </div>

      {/* Main Drag-and-Drop Card */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors shadow-sm ${
          isDragOver
            ? 'border-primary bg-primary-tint'
            : 'border-border bg-card hover:border-primary'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.sqlite,.db"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              validateAndHandle(e.target.files[0]);
            }
          }}
          disabled={isUploading}
        />

        <div className="w-14 h-14 rounded-lg bg-page border border-border flex items-center justify-center text-primary mb-4">
          <Upload className="w-7 h-7" aria-hidden="true" />
        </div>

        <h2 className="text-title-card font-semibold text-main mb-1.5">
          Upload a CSV, Excel, or SQLite file to begin
        </h2>
        <p className="text-body text-secondary max-w-md mb-6 leading-relaxed">
          Drag and drop your file here, or click to browse from your computer. Files are parsed and registered securely for natural language exploration.
        </p>

        <div className="flex items-center gap-3.5">
          <Button
            variant="primary"
            size="md"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            icon={<Upload className="w-4 h-4" />}
          >
            {isUploading ? 'Validating file...' : 'Choose file'}
          </Button>
          <span className="text-caption text-secondary">or drop raw files here</span>
        </div>

        {/* Error notification */}
        {(validationError || uploadError) && (
          <div className="mt-5 p-3.5 rounded-lg bg-error/15 border border-error/40 text-error text-caption flex items-center gap-2.5 max-w-lg">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{validationError || uploadError}</span>
          </div>
        )}

        {/* Supported formats and dynamic file size limit from config */}
        <div className="mt-6 text-caption text-secondary flex items-center gap-2 bg-page px-4 py-2 rounded-lg border border-border">
          <Database className="w-4 h-4 text-primary" aria-hidden="true" />
          <span>
            Supported formats: .csv, .xlsx, .sqlite, .db (up to {config.maxFileSizeMb} MB)
          </span>
        </div>
      </div>

      {/* Quick-Start Environments */}
      <div className="pt-4 border-t border-border space-y-3">
        <div className="flex items-center justify-between text-caption font-medium text-secondary">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-primary" aria-hidden="true" />
            <span>Quick-start environments</span>
          </div>
          <span>Zero configuration - Loads instantly</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onSelectQuickStart && onSelectQuickStart('dataset-retail-01')}
            className="p-4 rounded-lg bg-card border border-border hover:border-primary text-left transition-colors cursor-pointer group shadow-sm focus-visible:ring-2 focus-visible:ring-primary min-h-[110px]"
          >
            <div className="flex items-center justify-between text-caption font-medium text-secondary mb-1.5">
              <span>Retail & commerce</span>
              <span className="flex items-center gap-1 font-mono">
                CSV <ArrowUpRight className="w-3.5 h-3.5 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
              </span>
            </div>
            <div className="font-semibold text-title-card text-main mb-1">Superstore Sales</div>
            <div className="text-caption text-secondary line-clamp-2 leading-relaxed">
              Transactional records covering global sales, profit margins, ship modes, and customer segments.
            </div>
          </button>

          <button
            onClick={() => onSelectQuickStart && onSelectQuickStart('dataset-sqlite-03')}
            className="p-4 rounded-lg bg-card border border-border hover:border-primary text-left transition-colors cursor-pointer group shadow-sm focus-visible:ring-2 focus-visible:ring-primary min-h-[110px]"
          >
            <div className="flex items-center justify-between text-caption font-medium text-secondary mb-1.5">
              <span>Relational schema</span>
              <span className="flex items-center gap-1 font-mono">
                SQLite <ArrowUpRight className="w-3.5 h-3.5 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
              </span>
            </div>
            <div className="font-semibold text-title-card text-main mb-1">Northwind Relational</div>
            <div className="text-caption text-secondary line-clamp-2 leading-relaxed">
              Multi-table relational schema with customers, suppliers, inventory orders, and order details.
            </div>
          </button>

          <button
            onClick={() => onSelectQuickStart && onSelectQuickStart('dataset-excel-02')}
            className="p-4 rounded-lg bg-card border border-border hover:border-primary text-left transition-colors cursor-pointer group shadow-sm focus-visible:ring-2 focus-visible:ring-primary min-h-[110px]"
          >
            <div className="flex items-center justify-between text-caption font-medium text-secondary mb-1.5">
              <span>Corporate finance</span>
              <span className="flex items-center gap-1 font-mono">
                XLSX <ArrowUpRight className="w-3.5 h-3.5 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
              </span>
            </div>
            <div className="font-semibold text-title-card text-main mb-1">Financial Q4 Model</div>
            <div className="text-caption text-secondary line-clamp-2 leading-relaxed">
              Audited EBITDA projections, departmental burn rates, and quarterly return distributions.
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
