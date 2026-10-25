import React from 'react';
import {
  FileText,
  Clock,
  Download,
  AlertCircle,
  FolderArchive,
  ArrowRight,
  Database
} from 'lucide-react';
import { AnalysisResponse } from '../../types/analysis';
import { downloadJsonReport, downloadMarkdownReport } from '../../utils/downloadReport';
import { formatDate } from '../../utils/formatters';

interface ReportsArchiveViewProps {
  currentResult: AnalysisResponse | null;
  onNavigateToAnalysis: () => void;
}

export const ReportsArchiveView: React.FC<ReportsArchiveViewProps> = ({
  currentResult,
  onNavigateToAnalysis,
}) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-mint-accent text-xs font-mono mb-1">
          <FolderArchive className="w-4 h-4" />
          <span>INTELLIGENCE ARCHIVE & PERSISTENCE</span>
        </div>
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight font-mono">
            Reports Archive
          </h1>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-space-800 border border-slate-700 text-slate-400">
            Planned Multi-User Feature
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review current session deliverables and roadmap for historical cataloging
        </p>
      </div>

      {/* Active Session Report Card if available */}
      {currentResult ? (
        <div className="p-5 rounded-2xl bg-space-900 border border-mint-500/30 space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono uppercase text-mint-accent font-bold px-2 py-0.5 rounded bg-space-800 border border-mint-500/40 inline-block mb-1">
                Active Session Deliverable
              </span>
              <h2 className="text-lg font-bold text-slate-100 font-mono">
                {currentResult.analysis_id}
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                Generated: {formatDate(currentResult.timestamp)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => downloadMarkdownReport(currentResult.markdown_report, currentResult.analysis_id)}
                className="px-3 py-1.5 rounded-xl bg-space-800 hover:bg-space-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5 text-mint-accent" />
                <span>Markdown</span>
              </button>
              <button
                onClick={() => downloadJsonReport(currentResult.json_report, currentResult.analysis_id)}
                className="px-3 py-1.5 rounded-xl bg-space-800 hover:bg-space-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5 text-coral-400" />
                <span>JSON</span>
              </button>
              <button
                onClick={onNavigateToAnalysis}
                className="px-3 py-1.5 rounded-xl bg-mint-500 hover:bg-mint-400 text-space-950 font-bold text-xs font-mono transition-colors flex items-center space-x-1"
              >
                <span>View Full Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-space-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Altered Surface</span>
              <span className="text-slate-100 font-bold">{currentResult.statistics.changed_percentage.toFixed(2)}%</span>
            </div>
            <div className="p-3 bg-space-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Category</span>
              <span className="text-coral-400 font-bold">{currentResult.statistics.intensity_category}</span>
            </div>
            <div className="p-3 bg-space-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Retained Regions</span>
              <span className="text-slate-100 font-bold">{currentResult.statistics.retained_regions_count}</span>
            </div>
            <div className="p-3 bg-space-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Registration</span>
              <span className="text-slate-100 font-bold">{currentResult.alignment.status.toUpperCase()}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-space-900 border border-slate-800/80 text-center space-y-3">
          <Clock className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-200 font-mono">
            No Active Analysis in Current Session
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Run an analysis in the Change Analysis tab or load a demo dataset to generate downloadable intelligence reports.
          </p>
          <button
            onClick={onNavigateToAnalysis}
            className="px-4 py-2 rounded-xl bg-mint-500 hover:bg-mint-400 text-space-950 font-bold text-xs font-mono transition-all inline-flex items-center space-x-1.5"
          >
            <span>Launch Change Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Planned Feature Roadmap Box */}
      <div className="p-5 rounded-2xl bg-space-950 border border-slate-800 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
          <Database className="w-4 h-4 text-slate-400" />
          <span className="font-bold uppercase">Planned Archive Roadmap</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          In this local hackathon MVP, all processing is stateless and in-memory to preserve security,
          prevent unnecessary disk bloat, and run without database credentials. The following enterprise capabilities
          are scheduled for future milestones:
        </p>
        <ul className="text-xs font-mono text-slate-400 space-y-1.5 list-disc list-inside">
          <li>PostgreSQL / PostGIS integration for persistent spatial polygon indexing</li>
          <li>Cloud Object Storage (S3 / GCS) retention for massive multi-spectral raster tiers</li>
          <li>Automated PDF intelligence dossier generation with custom agency watermarking</li>
        </ul>
      </div>
    </div>
  );
};
