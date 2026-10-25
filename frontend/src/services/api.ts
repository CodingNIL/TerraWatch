import {
  AnalysisResponse,
  SampleItem,
  SampleDataResponse,
  SensitivityLevel
} from '../types/analysis';

const API_BASE = '/api';

export interface HealthInfo {
  status: string;
  service: string;
  version: string;
  cv2_version: string;
  numpy_version: string;
}

export async function checkHealth(): Promise<HealthInfo> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error(`API health check failed with status ${res.status}`);
  }
  return res.json();
}

export async function fetchSamples(): Promise<SampleItem[]> {
  const res = await fetch(`${API_BASE}/analysis/samples`);
  if (!res.ok) {
    throw new Error(`Failed to fetch samples: ${res.statusText}`);
  }
  const data = await res.json();
  return data.samples;
}

export async function fetchSampleData(sampleId: string): Promise<SampleDataResponse> {
  const res = await fetch(`${API_BASE}/analysis/samples/${sampleId}/data`);
  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    throw new Error(errorJson?.detail || `Failed to fetch sample data (${res.status})`);
  }
  return res.json();
}

/** Helper to convert a data URL to a File */
export async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || 'image/png' });
}

export interface RunAnalysisParams {
  beforeImage: File;
  afterImage: File;
  sensitivity: SensitivityLevel;
  alignImages: boolean;
  minRegionSize: number;
  beforeDate?: string;
  afterDate?: string;
}

export async function runAnalysis(params: RunAnalysisParams): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append('before_image', params.beforeImage);
  formData.append('after_image', params.afterImage);
  formData.append('sensitivity', params.sensitivity);
  formData.append('align_images', String(params.alignImages));
  formData.append('min_region_size', String(params.minRegionSize));

  if (params.beforeDate) {
    formData.append('before_date', params.beforeDate);
  }
  if (params.afterDate) {
    formData.append('after_date', params.afterDate);
  }

  const res = await fetch(`${API_BASE}/analysis/detect`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let errorDetail = `Analysis failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.detail) {
        errorDetail = errJson.detail;
      }
    } catch {
      // fallback
    }
    throw new Error(errorDetail);
  }

  return res.json();
}
