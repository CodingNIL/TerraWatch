import React, { useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Code,
  Eye,
  ShieldAlert,
  Calendar,
  Layers,
  Cpu
} from 'lucide-react';
import { AnalysisResponse } from '../../types/analysis';
import { downloadJsonReport, downloadMarkdownReport } from '../../utils/downloadReport';
import { formatDate } from '../../utils/formatters';

interface ReportPanelProps {
  result: AnalysisResponse;
}

export const ReportPanel: React.FC<ReportPanelProps> = ({ result }) => {
  const [viewMode, setViewMode] = useState<'brief' | 'markdown' | 'json'>('brief');
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(result.markdown_report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = result.statistics;

  return (
    <div className="rounded-2xl bg-space-900 border border-slate-800/80 p-5 shadow-lg space-y-5">
      {/* Header and Download CTA Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-mint-accent" />
            <h3 className="font-semibold text-slate-100 text-sm tracking-wide uppercase font-mono">
              Intelligence Brief & Export
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-800 border border-slate-700 text-slate-300">
              {result.analysis_id}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated multi-temporal change assessment documentation and structured deliverables
          </p>
        </div>

        {/* View Mode & Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Format Tabs */}
          <div className="flex items-center p-1 bg-space-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('brief')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                viewMode === 'brief'
                  ? 'bg-space-800 text-mint-accent shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Brief
            </button>
            <button
              onClick={() => setViewMode('markdown')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                viewMode === 'markdown'
                  ? 'bg-space-800 text-mint-accent shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Markdown
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                viewMode === 'json'
                  ? 'bg-space-800 text-mint-accent shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              JSON
            </button>
          </div>

          {/* Download Markdown */}
          <button
            onClick={() => downloadMarkdownReport(result.markdown_report, result.analysis_id)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-space-800 hover:bg-space-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors shadow-sm"
            title="Download Markdown Report"
          >
            <Download className="w-3.5 h-3.5 text-mint-accent" />
            <span>.MD</span>
          </button>

          {/* Download JSON */}
          <button
            onClick={() => downloadJsonReport(result.json_report, result.analysis_id)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-space-800 hover:bg-space-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors shadow-sm"
            title="Download JSON Report"
          >
            <Download className="w-3.5 h-3.5 text-coral-400" />
            <span>.JSON</span>
          </button>

          {/* Copy to Clipboard */}
          <button
            onClick={handleCopyMarkdown}
            className="p-1.5 rounded-xl bg-space-800 hover:bg-space-700 text-slate-300 border border-slate-700 transition-colors"
            title="Copy Report to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'brief' && (
        <div className="space-y-4">
          {/* Executive Overview Block */}
          <div className="p-4 rounded-xl bg-space-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono border-b border-slate-850 pb-2">
              <span className="text-slate-400">Analysis Reference:</span>
              <span className="text-mint-accent font-bold">{result.analysis_id}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-500 uppercase text-[10px] block">Analyzed Timestamp (UTC)</span>
                <span className="text-slate-200">{formatDate(result.timestamp)}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase text-[10px] block">Registration Method</span>
                <span className="text-slate-200">
                  {result.alignment.method} ({result.alignment.status})
                </span>
              </div>
            </div>

            {/* Analytical Assessment */}
            <div className="pt-2">
              <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                Radiometric & Textural Assessment
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans bg-space-900/60 p-3 rounded-lg border border-slate-800/80">
                {result.interpretation}
              </p>
            </div>
          </div>

          {/* Methodological Limitations Banner */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-700/40 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 font-mono">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>Scientific Causal Attribution Policy & Methodological Limitations</span>
            </div>
            <p className="text-xs text-amber-200/90 leading-relaxed font-sans">
              Visual change detection identifies pixel-level reflectance and textural divergence between
              acquisitions. It does not establish whether changes stem from natural disasters, anthropogenic
              activity, or seasonal factors. Measurements are in image pixel space without georeferenced land area.
            </p>
            <ul className="list-disc list-inside text-[11px] text-amber-300/80 space-y-1 font-mono pt-1">
              {result.limitations.map((lim, idx) => (
                <li key={idx} className="leading-snug">
                  {lim}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {viewMode === 'markdown' && (
        <div className="relative">
          <pre className="p-4 rounded-xl bg-space-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-96 whitespace-pre-wrap leading-relaxed select-text">
            {result.markdown_report}
          </pre>
        </div>
      )}

      {viewMode === 'json' && (
        <div className="relative">
          <pre className="p-4 rounded-xl bg-space-950 border border-slate-800 text-xs font-mono text-mint-accent/90 overflow-x-auto max-h-96 whitespace-pre leading-relaxed select-text">
            {JSON.stringify(result.json_report, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
