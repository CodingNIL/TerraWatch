export type SensitivityLevel = 'low' | 'medium' | 'high';

export type AlignmentStatusType =
  | 'aligned'
  | 'fallback_identity'
  | 'fallback_resized'
  | 'disabled'
  | 'failed';

export type ChangeIntensityCategory =
  | 'Negligible'
  | 'Low'
  | 'Moderate'
  | 'Significant'
  | 'Extensive';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RegionDetail {
  id: number;
  bbox: BoundingBox;
  centroid_x: number;
  centroid_y: number;
  area_pixels: number;
  area_percentage: number;
  mean_intensity: number;
}

export interface ImageMetadata {
  filename: string;
  format: string;
  width: number;
  height: number;
  size_bytes: number;
  capture_date?: string | null;
}

export interface AlignmentInfo {
  status: AlignmentStatusType;
  method: string;
  inliers: number;
  matches_found: number;
  message: string;
}

export interface StatisticsInfo {
  total_pixels: number;
  changed_pixels: number;
  changed_percentage: number;
  retained_regions_count: number;
  filtered_noise_count: number;
  intensity_category: ChangeIntensityCategory;
  largest_region_pixels: number;
  largest_region_percentage: number;
}

export interface AnalysisResponse {
  analysis_id: string;
  timestamp: string;
  before_image: ImageMetadata;
  after_image: ImageMetadata;
  comparison_dimensions: { width: number; height: number };
  sensitivity: SensitivityLevel;
  min_region_size: number;
  alignment: AlignmentInfo;
  statistics: StatisticsInfo;
  regions: RegionDetail[];
  difference_mask_data_url: string;
  change_overlay_data_url: string;
  aligned_after_data_url?: string | null;
  interpretation: string;
  limitations: string[];
  markdown_report: string;
  json_report: Record<string, any>;
}

export interface SampleItem {
  id: string;
  title: string;
  description: string;
  before_filename: string;
  after_filename: string;
  expected_change_type: string;
  recommended_sensitivity: SensitivityLevel;
  recommended_min_region_size: number;
}

export interface SampleDataResponse {
  sample_id: string;
  before_filename: string;
  after_filename: string;
  before_data_url: string;
  after_data_url: string;
  before_bytes: number;
  after_bytes: number;
  dimensions: { width: number; height: number };
}

export interface UploadedImageState {
  file?: File;
  previewUrl: string;
  filename: string;
  sizeBytes: number;
  dimensions?: { width: number; height: number };
  captureDate?: string;
  isSample?: boolean;
}

export type AnalysisStage =
  | 'idle'
  | 'validating'
  | 'aligning'
  | 'differencing'
  | 'extracting'
  | 'reporting'
  | 'done'
  | 'error';
