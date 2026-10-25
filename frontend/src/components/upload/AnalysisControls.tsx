import React from 'react';
import {
  Sliders,
  Sparkles,
  Layers,
  HelpCircle,
  Play,
  Loader2,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { SensitivityLevel, AnalysisStage } from '../../types/analysis';

interface AnalysisControlsProps {
  sensitivity: SensitivityLevel;
  onSensitivityChange: (level: SensitivityLevel) => void;
  alignImages: boolean;
  onAlignImagesChange: (enabled: boolean) => void;
  minRegionSize: number;
  onMinRegionSizeChange: (val: number) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  stage: AnalysisStage;
  stageMessage: string;
  hasBothImages: boolean;
}

export const AnalysisControls: React.FC<AnalysisControlsProps> = ({
  sensitivity,
  onSensitivityChange,
  alignImages,
  onAlignImagesChange,
  minRegionSize,
  onMinRegionSizeChange,
  onAnalyze,
  isAnalyzing,
  stage,
  stageMessage,
  hasBothImages,
}) => {
  const sensitivityOptions: {
    level: SensitivityLevel;
    label: string;
    desc: string;
  }[] = [
    {
      level: 'low',
      label: 'Low',
      desc: 'Threshold ~55. Captures only drastic, high-contrast surface changes.',
    },
    {
      level: 'medium',
      label: 'Medium',
      desc: 'Threshold ~38. Recommended balance between sensitivity and noise rejection.',
    },
    {
      level: 'high',
      label: 'High',
      desc: 'Threshold ~24. Highly sensitive, detects subtle spectral and textural shifts.',
    },
  ];

  return (
    <div className="rounded-2xl bg-space-900 border border-slate-800/80 p-5 shadow-lg space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-mint-accent" />
          <h3 className="font-semibold text-slate-100 text-sm tracking-wide uppercase font-mono">
            Analysis Parameters
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500">Engine: OpenCV 5.0</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Sensitivity Preset */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 font-mono flex items-center space-x-1">
              <span>Sensitivity Preset</span>
            </label>
            <span className="text-[10px] font-mono text-slate-400 capitalize">
              {sensitivity}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-1 bg-space-950 rounded-xl border border-slate-800">
            {sensitivityOptions.map((opt) => {
              const isSelected = sensitivity === opt.level;
              return (
                <button
                  key={opt.level}
                  type="button"
                  onClick={() => onSensitivityChange(opt.level)}
                  disabled={isAnalyzing}
                  className={`py-1.5 text-xs font-medium rounded-lg transition-all text-center ${
                    isSelected
                      ? 'bg-space-800 text-mint-accent border border-mint-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={opt.desc}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500">
            {sensitivityOptions.find((o) => o.level === sensitivity)?.desc}
          </p>
        </div>

        {/* 2. Image Alignment Toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 font-mono flex items-center space-x-1">
              <span>Image Registration</span>
            </label>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                alignImages
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {alignImages ? 'ORB Enabled' : 'Bypassed'}
            </span>
          </div>

          <div
            onClick={() => !isAnalyzing && onAlignImagesChange(!alignImages)}
            className="flex items-center justify-between p-2.5 rounded-xl bg-space-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-mint-accent" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-200 font-medium">Subpixel Align</span>
                <span className="text-[10px] text-slate-500">ORB + RANSAC affine</span>
              </div>
            </div>

            <div
              className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                alignImages ? 'bg-mint-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-space-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  alignImages ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Automatically corrects viewpoint shift, scale drift, and rotational jitter.
          </p>
        </div>

        {/* 3. Minimum Region Size */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 font-mono flex items-center space-x-1">
              <span>Min Region Size</span>
            </label>
            <span className="text-[10px] font-mono text-mint-accent bg-space-950 px-2 py-0.5 rounded border border-slate-800">
              {minRegionSize} px
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-space-950 border border-slate-800 flex items-center space-x-3">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="range"
              min="10"
              max="300"
              step="5"
              value={minRegionSize}
              onChange={(e) => onMinRegionSizeChange(parseInt(e.target.value, 10))}
              disabled={isAnalyzing}
              className="w-full accent-mint-500 cursor-pointer"
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Connected components below this pixel area are filtered out as sensor noise.
          </p>
        </div>
      </div>

      {/* CTA Analyze Button & Multi-stage Progress */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full">
          {isAnalyzing ? (
            <div className="flex items-center space-x-3 text-xs font-mono text-slate-300 bg-space-950 px-4 py-2.5 rounded-xl border border-mint-500/30">
              <Loader2 className="w-4 h-4 text-mint-accent animate-spin flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-mint-accent font-semibold tracking-wide uppercase text-[10px]">
                  Pipeline Stage: {stage}
                </span>
                <span className="text-slate-400 text-[11px] truncate">{stageMessage}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 font-mono">
              Ready to process multi-temporal satellite imagery with deterministic OpenCV differencing.
            </p>
          )}
        </div>

        <button
          onClick={onAnalyze}
          disabled={!hasBothImages || isAnalyzing}
          className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-mint-500 to-mint-400 hover:from-mint-400 hover:to-mint-accent text-space-950 font-bold text-xs tracking-wider uppercase font-mono transition-all shadow-lg hover:shadow-mint-500/25 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
              <span>Analyzing Imagery...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Analyze Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
