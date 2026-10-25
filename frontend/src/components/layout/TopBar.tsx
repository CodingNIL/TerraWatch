import React, { useEffect, useState } from 'react';
import {
  Activity,
  Plus,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { checkHealth, HealthInfo } from '../../services/api';

interface TopBarProps {
  onNewAnalysis: () => void;
  onLoadSample: (sampleId: string) => void;
  isAnalyzing: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onNewAnalysis,
  onLoadSample,
  isAnalyzing,
}) => {
  const [health, setHealth] = useState<HealthInfo | null>(null);
  const [healthError, setHealthError] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const fetchHealth = async () => {
    setIsChecking(true);
    try {
      const data = await checkHealth();
      setHealth(data);
      setHealthError(false);
    } catch {
      setHealthError(true);
      setHealth(null);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-space-900/90 backdrop-blur border-b border-slate-800/80 px-6 flex items-center justify-between z-20">
      {/* Left: Mission Mode & System Indicator */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-500 uppercase">Mission:</span>
          <span className="text-slate-200 font-medium px-2 py-0.5 rounded bg-space-800 border border-slate-700/60">
            EO-SURVEILLANCE
          </span>
        </div>

        <div className="h-4 w-px bg-slate-800 hidden sm:block" />

        {/* Backend API status */}
        <div className="flex items-center space-x-2 text-xs">
          {healthError ? (
            <div className="flex items-center space-x-1.5 text-coral-400 bg-coral-500/10 px-2.5 py-1 rounded-full border border-coral-500/30">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-coral-500"></span>
              </span>
              <span className="font-mono">Backend Offline</span>
              <button
                onClick={fetchHealth}
                disabled={isChecking}
                className="hover:text-slate-200 transition-colors ml-1"
                title="Retry connection"
              >
                <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
              </button>
            </div>
          ) : health ? (
            <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/40">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[11px]">
                API Online • CV {health.cv2_version}
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
              <RefreshCw className="w-3 h-3 animate-spin text-mint-accent" />
              <span>Connecting API...</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Quick Demo Dataset & New Analysis CTA */}
      <div className="flex items-center space-x-3">
        {/* Sample dataset selector */}
        <div className="relative group">
          <button
            type="button"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-space-800 hover:bg-space-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors shadow-sm"
          >
            <Database className="w-3.5 h-3.5 text-mint-accent" />
            <span>Load Demo Data</span>
          </button>

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-1 w-64 p-1.5 bg-space-900 border border-slate-700/80 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
            <div className="px-2 py-1 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Select Sample Scenario
            </div>
            <button
              onClick={() => onLoadSample('reservoir_flood')}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-space-800 text-xs text-slate-200 transition-colors flex flex-col"
            >
              <div className="flex items-center space-x-1.5 font-medium text-mint-accent">
                <Sparkles className="w-3 h-3" />
                <span>Hydrological Inundation</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5">
                River flood event submerging cropland
              </span>
            </button>
            <button
              onClick={() => onLoadSample('urban_expansion')}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-space-800 text-xs text-slate-200 transition-colors flex flex-col"
            >
              <div className="flex items-center space-x-1.5 font-medium text-amber-400">
                <Sparkles className="w-3 h-3" />
                <span>Industrial Site Clearing</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5">
                Deforestation & logistics facility development
              </span>
            </button>
          </div>
        </div>

        {/* New Analysis Primary Button */}
        <button
          onClick={onNewAnalysis}
          disabled={isAnalyzing}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-mint-500 hover:bg-mint-400 text-space-950 font-semibold text-xs tracking-wide transition-all shadow-md hover:shadow-mint-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Analysis</span>
        </button>
      </div>
    </header>
  );
};
