from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

SensitivityLevel = Literal["low", "medium", "high"]
AlignmentStatusType = Literal["aligned", "fallback_identity", "fallback_resized", "disabled", "failed"]
ChangeIntensityCategory = Literal["Negligible", "Low", "Moderate", "Significant", "Extensive"]


class BoundingBox(BaseModel):
    x: int
    y: int
    width: int
    height: int


class RegionDetail(BaseModel):
    id: int
    bbox: BoundingBox
    centroid_x: float
    centroid_y: float
    area_pixels: int
    area_percentage: float
    mean_intensity: float


class ImageMetadata(BaseModel):
    filename: str
    format: str
    width: int
    height: int
    size_bytes: int
    capture_date: Optional[str] = None


class AlignmentInfo(BaseModel):
    status: AlignmentStatusType
    method: str
    inliers: int = 0
    matches_found: int = 0
    message: str


class StatisticsInfo(BaseModel):
    total_pixels: int
    changed_pixels: int
    changed_percentage: float
    retained_regions_count: int
    filtered_noise_count: int
    intensity_category: ChangeIntensityCategory
    largest_region_pixels: int
    largest_region_percentage: float


class AnalysisResponse(BaseModel):
    analysis_id: str
    timestamp: str
    before_image: ImageMetadata
    after_image: ImageMetadata
    comparison_dimensions: Dict[str, int]
    sensitivity: SensitivityLevel
    min_region_size: int
    alignment: AlignmentInfo
    statistics: StatisticsInfo
    regions: List[RegionDetail]
    difference_mask_data_url: str
    change_overlay_data_url: str
    aligned_after_data_url: Optional[str] = None
    interpretation: str
    limitations: List[str]
    markdown_report: str
    json_report: Dict[str, Any]


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    cv2_version: str
    numpy_version: str


class SampleItem(BaseModel):
    id: str
    title: str
    description: str
    before_filename: str
    after_filename: str
    expected_change_type: str
    recommended_sensitivity: SensitivityLevel
    recommended_min_region_size: int


class SampleListResponse(BaseModel):
    samples: List[SampleItem]
