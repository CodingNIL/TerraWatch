import React, { useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { NavTab } from './components/layout/Sidebar';
import { OverviewView } from './components/layout/OverviewView';
import { AboutView } from './components/layout/AboutView';
import { ReportsArchiveView } from './components/layout/ReportsArchiveView';
import { ImageDropzone } from './components/upload/ImageDropzone';
import { AnalysisControls } from './components/upload/AnalysisControls';
import { ComparisonViewer } from './components/analysis/ComparisonViewer';
import { ChangeOverlay } from './components/analysis/ChangeOverlay';
import { ChangeMaskViewer } from './components/analysis/ChangeMaskViewer';
import { AnalysisMetrics } from './components/analysis/AnalysisMetrics';
import { RegionList } from './components/analysis/RegionList';
import { ReportPanel } from './components/reports/ReportPanel';
import { useAnalysis } from './hooks/useAnalysis';
import {
  RotateCcw,
  Sparkles,
  AlertCircle,
  SplitSquareVertical,
  Eye,
  Binary,
  LayoutGrid,
  Layers
} from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [visualTab, setVisualTab] = useState<'slider' | 'overlay' | 'mask' | 'grid'>('overlay');

  const {
    beforeImage,
    setBeforeImage,
    afterImage,
    setAfterImage,
    sensitivity,
    setSensitivity,
    alignImages,
    setAlignImages,
    minRegionSize,
    setMinRegionSize,
    isAnalyzing,
    stage,
    stageMessage,
    error,
    result,
    activeRegionId,
    setActiveRegionId,
    loadSample,
    executeAnalysis,
    resetAnalysis,
    resetAll,
  } = useAnalysis();

  const handleStartAnalysis = () => {
    setCurrentTab('analysis');
  };

  const handleLoadSampleFromAnywhere = async (sampleId: string) => {
    setCurrentTab('analysis');
    await loadSample(sampleId);
  };

  const handleNewAnalysis = () => {
    resetAll();
    setCurrentTab('analysis');
  };

  return (
    <AppShell
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      onNewAnalysis={handleNewAnalysis}
      onLoadSample={handleLoadSampleFromAnywhere}
      isAnalyzing={isAnalyzing}
      hasResults={!!result}
    >
      {/* 1. OVERVIEW TAB */}
      {currentTab === 'overview' && (
        <OverviewView
          onStartAnalysis={handleStartAnalysis}
          onLoadSample={handleLoadSampleFromAnywhere}
        />
      )}

      {/* 2. ABOUT & METHODOLOGY TAB */}
      {currentTab === 'about' && <AboutView />}

      {/* 3. REPORTS ARCHIVE TAB */}
      {currentTab === 'reports' && (
        <ReportsArchiveView
          currentResult={result}
          onNavigateToAnalysis={() => setCurrentTab('analysis')}
        />
      )}

      {/* 4. CHANGE ANALYSIS WORKSPACE TAB */}
      {currentTab === 'analysis' && (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
          {/* Workspace Title & Quick Reset */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
            <div>
              <div className="flex items-center space-x-2 text-mint-accent text-xs font-mono mb-1">
                <Layers className="w-4 h-4" />
                <span>GEOSPATIAL CHANGE EXTRACTION</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight font-mono">
                Satellite Change Workstation
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={resetAll}
                disabled={isAnalyzing}
                className="px-3 py-1.5 rounded-xl bg-space-850 hover:bg-space-800 text-slate-300 hover:text-slate-100 text-xs font-mono border border-slate-700/80 transition-colors flex items-center space-x-1.5 disabled:opacity-40"
                title="Clear all images and restart"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Workspace</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-coral-500/10 border border-coral-500/30 flex items-start space-x-3 text-xs text-coral-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold font-mono">Processing or Validation Error</span>
                <p className="leading-relaxed font-sans">{error}</p>
              </div>
            </div>
          )}

          {/* Multi-temporal Upload Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ImageDropzone
              label="BEFORE — Reference Image"
              sublabel="Baseline earlier satellite observation"
              imageState={beforeImage}
              onImageSelected={setBeforeImage}
              onRemove={() => setBeforeImage(null)}
              disabled={isAnalyzing}
            />

            <ImageDropzone
              label="AFTER — Comparison Image"
              sublabel="Subsequent satellite observation for change evaluation"
              imageState={afterImage}
              onImageSelected={setAfterImage}
              onRemove={() => setAfterImage(null)}
              disabled={isAnalyzing}
            />
          </div>

          {/* Analysis Controls Bar */}
          <AnalysisControls
            sensitivity={sensitivity}
            onSensitivityChange={setSensitivity}
            alignImages={alignImages}
            onAlignImagesChange={setAlignImages}
            minRegionSize={minRegionSize}
            onMinRegionSizeChange={setMinRegionSize}
            onAnalyze={executeAnalysis}
            isAnalyzing={isAnalyzing}
            stage={stage}
            stageMessage={stageMessage}
            hasBothImages={!!(beforeImage && afterImage)}
          />

          {/* RESULTS SECTION (when analysis succeeds) */}
          {result && beforeImage && afterImage && (
            <div className="space-y-6 pt-4 border-t border-slate-800/80">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-mint-500 animate-pulse" />
                  <h2 className="text-xl font-bold text-slate-100 font-mono tracking-wide uppercase">
                    Detection Results & Intelligence
                  </h2>
                </div>

                {/* Visualizer Mode Tabs */}
                <div className="flex items-center p-1 bg-space-900 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setVisualTab('overlay')}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      visualTab === 'overlay'
                        ? 'bg-space-800 text-coral-400 border border-coral-500/30 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Overlay</span>
                  </button>
                  <button
                    onClick={() => setVisualTab('slider')}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      visualTab === 'slider'
                        ? 'bg-space-800 text-mint-accent border border-mint-500/30 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <SplitSquareVertical className="w-3.5 h-3.5" />
                    <span>Comparison Slider</span>
                  </button>
                  <button
                    onClick={() => setVisualTab('mask')}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      visualTab === 'mask'
                        ? 'bg-space-800 text-slate-100 border border-slate-700 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Binary className="w-3.5 h-3.5" />
                    <span>Difference Mask</span>
                  </button>
                  <button
                    onClick={() => setVisualTab('grid')}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      visualTab === 'grid'
                        ? 'bg-space-800 text-slate-100 border border-slate-700 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>All Visuals</span>
                  </button>
                </div>
              </div>

              {/* Authoritative Metrics KPIs */}
              <AnalysisMetrics result={result} />

              {/* Spatial Visualizations Based on Visual Tab */}
              {visualTab === 'overlay' && (
                <ChangeOverlay
                  result={result}
                  activeRegionId={activeRegionId}
                  onSelectRegion={setActiveRegionId}
                />
              )}

              {visualTab === 'slider' && (
                <ComparisonViewer
                  beforeImage={beforeImage}
                  afterImage={afterImage}
                  result={result}
                />
              )}

              {visualTab === 'mask' && <ChangeMaskViewer result={result} />}

              {visualTab === 'grid' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <ComparisonViewer
                    beforeImage={beforeImage}
                    afterImage={afterImage}
                    result={result}
                  />
                  <ChangeOverlay
                    result={result}
                    activeRegionId={activeRegionId}
                    onSelectRegion={setActiveRegionId}
                  />
                  <div className="lg:col-span-2">
                    <ChangeMaskViewer result={result} />
                  </div>
                </div>
              )}

              {/* Detected Region List & Spatial Drill-down */}
              <RegionList
                regions={result.regions}
                activeRegionId={activeRegionId}
                onSelectRegion={setActiveRegionId}
              />

              {/* Downloadable Intelligence Reports & Attributions */}
              <ReportPanel result={result} />
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}

export default App;
