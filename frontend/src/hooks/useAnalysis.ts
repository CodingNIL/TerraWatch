import { useState, useCallback } from 'react';
import {
  AnalysisResponse,
  AnalysisStage,
  SensitivityLevel,
  UploadedImageState
} from '../types/analysis';
import { runAnalysis, fetchSampleData, dataUrlToFile } from '../services/api';

export function useAnalysis() {
  const [beforeImage, setBeforeImage] = useState<UploadedImageState | null>(null);
  const [afterImage, setAfterImage] = useState<UploadedImageState | null>(null);

  const [sensitivity, setSensitivity] = useState<SensitivityLevel>('medium');
  const [alignImages, setAlignImages] = useState<boolean>(true);
  const [minRegionSize, setMinRegionSize] = useState<number>(50);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [stage, setStage] = useState<AnalysisStage>('idle');
  const [stageMessage, setStageMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [activeRegionId, setActiveRegionId] = useState<number | null>(null);

  const resetAnalysis = useCallback(() => {
    setResult(null);
    setError(null);
    setStage('idle');
    setStageMessage('');
    setActiveRegionId(null);
  }, []);

  const resetAll = useCallback(() => {
    resetAnalysis();
    setBeforeImage(null);
    setAfterImage(null);
  }, [resetAnalysis]);

  const loadSample = useCallback(async (sampleId: string) => {
    try {
      setError(null);
      setStage('validating');
      setStageMessage('Loading sample satellite imagery from backend...');

      const sampleData = await fetchSampleData(sampleId);

      const beforeFile = await dataUrlToFile(sampleData.before_data_url, sampleData.before_filename);
      const afterFile = await dataUrlToFile(sampleData.after_data_url, sampleData.after_filename);

      setBeforeImage({
        file: beforeFile,
        previewUrl: sampleData.before_data_url,
        filename: sampleData.before_filename,
        sizeBytes: sampleData.before_bytes,
        dimensions: sampleData.dimensions,
        captureDate: sampleId === 'reservoir_flood' ? '2026-04-12' : '2026-03-01',
        isSample: true,
      });

      setAfterImage({
        file: afterFile,
        previewUrl: sampleData.after_data_url,
        filename: sampleData.after_filename,
        sizeBytes: sampleData.after_bytes,
        dimensions: sampleData.dimensions,
        captureDate: sampleId === 'reservoir_flood' ? '2026-04-20' : '2026-09-18',
        isSample: true,
      });

      // Clear previous results
      setResult(null);
      setStage('idle');
      setStageMessage('');
    } catch (err: any) {
      setError(err?.message || 'Failed to load sample dataset');
      setStage('error');
    }
  }, []);

  const executeAnalysis = useCallback(async () => {
    if (!beforeImage?.file || !afterImage?.file) {
      setError('Please provide both Reference (Before) and Comparison (After) images.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setActiveRegionId(null);

    try {
      setStage('validating');
      setStageMessage('Verifying radiometric integrity and dimension safety limits...');
      await new Promise(r => setTimeout(r, 200));

      setStage('aligning');
      setStageMessage(alignImages ? 'Executing subpixel ORB feature registration & RANSAC warp...' : 'Using original comparison geometry...');
      await new Promise(r => setTimeout(r, 250));

      setStage('differencing');
      setStageMessage('Computing multi-channel spectral and textural divergence map...');

      const response = await runAnalysis({
        beforeImage: beforeImage.file,
        afterImage: afterImage.file,
        sensitivity,
        alignImages,
        minRegionSize,
        beforeDate: beforeImage.captureDate,
        afterDate: afterImage.captureDate,
      });

      setStage('extracting');
      setStageMessage('Extracting connected spatial regions and morphological contours...');
      await new Promise(r => setTimeout(r, 200));

      setStage('reporting');
      setStageMessage('Compiling intelligence analytics and generating structured reports...');
      await new Promise(r => setTimeout(r, 150));

      setResult(response);
      setStage('done');
      setStageMessage('Analysis completed successfully.');
    } catch (err: any) {
      setError(err?.message || 'An error occurred during change analysis.');
      setStage('error');
    } finally {
      setIsAnalyzing(false);
    }
  }, [beforeImage, afterImage, sensitivity, alignImages, minRegionSize]);

  return {
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
  };
}
