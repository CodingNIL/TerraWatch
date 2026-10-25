import React from 'react';
import {
  Satellite,
  Compass,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  BarChart3,
  Binary,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface OverviewViewProps {
  onStartAnalysis: () => void;
  onLoadSample: (sampleId: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onStartAnalysis,
  onLoadSample,
}) => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-b from-space-900 to-space-950 border border-slate-800/80 p-8 sm:p-10 shadow-2xl overflow-hidden">
        {/* Subtle cartographic background grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-mint-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-mint-500/10 border border-mint-500/30 text-mint-accent text-xs font-mono">
            <Satellite className="w-3.5 h-3.5" />
            <span>Deterministic Satellite Change Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-100 leading-tight">
            Earth Observation <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-mint-400 to-mint-accent">
              Intelligence
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            TerraWatch isolates, quantifies, and clusters surface modifications between multi-temporal
            satellite acquisitions. Powered by subpixel ORB geometric registration and multi-spectral
            NumPy differencing — engineered for transparent, local execution without paid APIs or cloud dependencies.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onStartAnalysis}
              className="px-6 py-3 rounded-xl bg-mint-500 hover:bg-mint-400 text-space-950 font-bold text-xs tracking-wider uppercase font-mono transition-all shadow-lg hover:shadow-mint-500/25 active:scale-95 flex items-center space-x-2"
            >
              <span>Start New Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onLoadSample('reservoir_flood')}
              className="px-5 py-3 rounded-xl bg-space-850 hover:bg-space-800 text-slate-200 font-mono text-xs border border-slate-700/80 transition-colors flex items-center space-x-2 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-mint-accent" />
              <span>Load Flood Demo</span>
            </button>

            <button
              onClick={() => onLoadSample('urban_expansion')}
              className="px-5 py-3 rounded-xl bg-space-850 hover:bg-space-800 text-slate-200 font-mono text-xs border border-slate-700/80 transition-colors flex items-center space-x-2 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Load Urban Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-Step Workflow Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Compass className="w-4 h-4 text-mint-accent" />
          <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-slate-200">
            Three-Step Verification Pipeline
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-space-900 border border-slate-800/80 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="text-[10px] font-mono text-mint-accent font-bold px-2 py-0.5 rounded bg-space-800 border border-mint-500/30 inline-block">
              STEP 01
            </div>
            <h3 className="text-sm font-bold text-slate-100 font-mono">
              Multi-Temporal Ingestion
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload reference (earlier) and comparison (later) satellite acquisitions in JPEG, PNG, or WebP up to 10 MB. In-memory validation prevents memory exhaustion.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-space-900 border border-slate-800/80 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="text-[10px] font-mono text-mint-accent font-bold px-2 py-0.5 rounded bg-space-800 border border-mint-500/30 inline-block">
              STEP 02
            </div>
            <h3 className="text-sm font-bold text-slate-100 font-mono">
              ORB Subpixel Registration
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              OpenCV feature matching extracts invariant descriptors and applies robust RANSAC affine transformations to align sensor geometry before differencing.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-space-900 border border-slate-800/80 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="text-[10px] font-mono text-mint-accent font-bold px-2 py-0.5 rounded bg-space-800 border border-mint-500/30 inline-block">
              STEP 03
            </div>
            <h3 className="text-sm font-bold text-slate-100 font-mono">
              Morphology & Intelligence
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracts connected change clusters, computes changed surface percentages, renders translucent coral overlays, and compiles automated JSON and Markdown briefs.
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Scientific Disclaimer Banner */}
      <div className="p-5 rounded-2xl bg-space-950 border border-slate-800 flex items-start space-x-3.5">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-200 font-mono uppercase">
            Scientific Cautious Interpretation Policy
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Visual change detection identifies radiometric, spectral, and textural divergence between image pairs.
            It does not establish whether surface variation results from natural phenomena (floods, seasonal vegetation,
            drought) or anthropogenic activities (construction, deforestation). All reported statistics operate in sensor pixel
            coordinates and must be verified against independent ground truth.
          </p>
        </div>
      </div>
    </div>
  );
};
