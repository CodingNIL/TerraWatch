import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from fastapi.responses import JSONResponse
import cv2
import numpy as np

from app.config import SAMPLES_DIR
from app.schemas import (
    AnalysisResponse,
    SampleListResponse,
    SampleItem,
    SensitivityLevel
)
from app.services.image_loader import validate_and_load_image, LoadedImage
from app.services.image_registration import align_images_orb_ransac
from app.services.change_detector import detect_changes_cv
from app.services.statistics import compute_statistics
from app.services.report_generator import (
    generate_interpretation_and_limitations,
    generate_markdown_report,
    generate_json_report
)
from app.utils.image_encoding import cv2_to_data_url

router = APIRouter(prefix="/analysis", tags=["Analysis"])


@router.post("/detect", response_model=AnalysisResponse)
async def detect_changes(
    before_image: UploadFile = File(..., description="Reference earlier satellite image (JPEG, PNG, WebP)"),
    after_image: UploadFile = File(..., description="Comparison later satellite image (JPEG, PNG, WebP)"),
    sensitivity: str = Form("medium", description="Sensitivity preset: low, medium, or high"),
    align_images: bool = Form(True, description="Enable ORB+RANSAC feature-based image registration"),
    min_region_size: int = Form(50, description="Minimum connected component area in pixels"),
    before_date: Optional[str] = Form(None, description="Optional user-entered capture date for reference image"),
    after_date: Optional[str] = Form(None, description="Optional user-entered capture date for comparison image")
) -> AnalysisResponse:
    """
    Core change detection endpoint. Validates images, executes ORB registration if enabled,
    runs deterministic OpenCV/NumPy change detection, calculates statistics, and produces reports.
    """
    sens_clean = sensitivity.lower().strip()
    if sens_clean not in {"low", "medium", "high"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid sensitivity preset '{sensitivity}'. Allowed: low, medium, high."
        )

    if min_region_size < 1 or min_region_size > 50000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="min_region_size must be between 1 and 50,000 pixels."
        )

    # 1. Validate and load both images
    before_loaded = await validate_and_load_image(before_image, label="Reference Image (Before)", capture_date=before_date)
    after_loaded = await validate_and_load_image(after_image, label="Comparison Image (After)", capture_date=after_date)

    # 2. Image registration (ORB + RANSAC affine)
    aligned_after_bgr, alignment_info = align_images_orb_ransac(
        ref_bgr=before_loaded.bgr,
        target_bgr=after_loaded.bgr,
        enabled=align_images
    )

    # 3. Deterministic Change Detection
    mask, overlay_bgr, regions, total_changed_pixels, filtered_noise_count = detect_changes_cv(
        ref_bgr=before_loaded.bgr,
        aligned_target_bgr=aligned_after_bgr,
        sensitivity=sens_clean,  # type: ignore
        min_region_size=min_region_size
    )

    # 4. Calculate Statistics
    ref_h, ref_w = before_loaded.bgr.shape[:2]
    total_pixels = ref_h * ref_w
    stats = compute_statistics(
        total_pixels=total_pixels,
        changed_pixels=total_changed_pixels,
        regions=regions,
        filtered_noise_count=filtered_noise_count
    )

    # 5. Generate Cautious Interpretations & Methodological Limitations
    interpretation, limitations = generate_interpretation_and_limitations(
        stats=stats,
        alignment=alignment_info,
        sensitivity=sens_clean  # type: ignore
    )

    # 6. Metadata and Identifiers
    analysis_id = f"TW-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
    timestamp_iso = datetime.now(timezone.utc).isoformat()
    comparison_dimensions = {"width": ref_w, "height": ref_h}

    # 7. Formulate Reports
    markdown_report = generate_markdown_report(
        analysis_id=analysis_id,
        timestamp=timestamp_iso,
        before_meta=before_loaded.metadata,
        after_meta=after_loaded.metadata,
        comparison_dims=comparison_dimensions,
        sensitivity=sens_clean,  # type: ignore
        min_region_size=min_region_size,
        alignment=alignment_info,
        stats=stats,
        regions=regions,
        interpretation=interpretation,
        limitations=limitations
    )

    json_report = generate_json_report(
        analysis_id=analysis_id,
        timestamp=timestamp_iso,
        before_meta=before_loaded.metadata,
        after_meta=after_loaded.metadata,
        comparison_dims=comparison_dimensions,
        sensitivity=sens_clean,  # type: ignore
        min_region_size=min_region_size,
        alignment=alignment_info,
        stats=stats,
        regions=regions,
        interpretation=interpretation,
        limitations=limitations
    )

    # 8. Encode Visual Outputs as Base64 Data URLs
    # For difference mask, render as high-contrast cartographic mask (black with crisp white/coral signals)
    mask_visual = cv2.cvtColor(mask, cv2.COLOR_GRAY2BGR)
    # Give the mask a dark-slate/near-black background and bright coral for the signal
    color_mask = np.zeros_like(mask_visual)
    color_mask[mask == 0] = [20, 24, 33]      # Dark slate
    color_mask[mask > 0] = [94, 63, 244]     # Coral red

    mask_data_url = cv2_to_data_url(color_mask, fmt="png")
    overlay_data_url = cv2_to_data_url(overlay_bgr, fmt="png")
    aligned_after_data_url = cv2_to_data_url(aligned_after_bgr, fmt="png")

    return AnalysisResponse(
        analysis_id=analysis_id,
        timestamp=timestamp_iso,
        before_image=before_loaded.metadata,
        after_image=after_loaded.metadata,
        comparison_dimensions=comparison_dimensions,
        sensitivity=sens_clean,  # type: ignore
        min_region_size=min_region_size,
        alignment=alignment_info,
        statistics=stats,
        regions=regions,
        difference_mask_data_url=mask_data_url,
        change_overlay_data_url=overlay_data_url,
        aligned_after_data_url=aligned_after_data_url,
        interpretation=interpretation,
        limitations=limitations,
        markdown_report=markdown_report,
        json_report=json_report
    )


@router.get("/samples", response_model=SampleListResponse)
def list_samples() -> SampleListResponse:
    """Returns the bundled sample satellite image pairs."""
    return SampleListResponse(
        samples=[
            SampleItem(
                id="reservoir_flood",
                title="Hydrological Surge & Agricultural Inundation",
                description="River basin pre- and post-flood event illustrating submerged cropland and broadened water body boundaries.",
                before_filename="flood_reference.png",
                after_filename="flood_comparison.png",
                expected_change_type="Hydrological Expansion",
                recommended_sensitivity="medium",
                recommended_min_region_size=60
            ),
            SampleItem(
                id="urban_expansion",
                title="Industrial Clearing & Site Development",
                description="Woodland plot cleared for logistic facility foundations and new access roadways.",
                before_filename="urban_reference.png",
                after_filename="urban_comparison.png",
                expected_change_type="Land Clearing / Infrastructure",
                recommended_sensitivity="medium",
                recommended_min_region_size=40
            )
        ]
    )


@router.get("/samples/{sample_id}/data")
def get_sample_images_data(sample_id: str):
    """
    Returns base64 data URLs for the requested sample pair so the frontend can load them directly.
    """
    sample_files = {
        "reservoir_flood": ("flood_reference.png", "flood_comparison.png"),
        "urban_expansion": ("urban_reference.png", "urban_comparison.png"),
    }

    if sample_id not in sample_files:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sample '{sample_id}' not found."
        )

    ref_name, comp_name = sample_files[sample_id]
    ref_path = SAMPLES_DIR / ref_name
    comp_path = SAMPLES_DIR / comp_name

    if not ref_path.exists() or not comp_path.exists():
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Sample files have not been generated yet on disk."
        )

    ref_img = cv2.imread(str(ref_path))
    comp_img = cv2.imread(str(comp_path))

    return {
        "sample_id": sample_id,
        "before_filename": ref_name,
        "after_filename": comp_name,
        "before_data_url": cv2_to_data_url(ref_img, "png"),
        "after_data_url": cv2_to_data_url(comp_img, "png"),
        "before_bytes": ref_path.stat().st_size,
        "after_bytes": comp_path.stat().st_size,
        "dimensions": {"width": ref_img.shape[1], "height": ref_img.shape[0]}
    }
