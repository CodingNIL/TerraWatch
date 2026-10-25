import cv2
import numpy as np
from typing import Tuple, List, Dict, Any
from app.schemas import (
    BoundingBox,
    RegionDetail,
    SensitivityLevel
)


# Sensitivity threshold profiles (Difference threshold, Blur kernel size, Morph kernel size)
SENSITIVITY_PROFILES = {
    "low": {
        "diff_threshold": 55,
        "blur_ksize": 5,
        "morph_open_ksize": 5,
        "morph_close_ksize": 7,
    },
    "medium": {
        "diff_threshold": 38,
        "blur_ksize": 5,
        "morph_open_ksize": 3,
        "morph_close_ksize": 5,
    },
    "high": {
        "diff_threshold": 24,
        "blur_ksize": 3,
        "morph_open_ksize": 3,
        "morph_close_ksize": 3,
    }
}


def detect_changes_cv(
    ref_bgr: np.ndarray,
    aligned_target_bgr: np.ndarray,
    sensitivity: SensitivityLevel = "medium",
    min_region_size: int = 50
) -> Tuple[np.ndarray, np.ndarray, List[RegionDetail], int, int]:
    """
    Deterministic Computer Vision change detection pipeline using OpenCV & NumPy.
    Returns:
        - final_binary_mask (uint8: 0 or 255)
        - red_overlay_bgr (uint8: BGR image with translucent coral highlight)
        - regions_list (List[RegionDetail] sorted by area descending)
        - total_changed_pixels (int)
        - filtered_noise_count (int)
    """
    h, w = ref_bgr.shape[:2]
    total_pixels = h * w

    profile = SENSITIVITY_PROFILES.get(sensitivity, SENSITIVITY_PROFILES["medium"])
    diff_thresh_val = profile["diff_threshold"]
    blur_k = profile["blur_ksize"]
    open_k = profile["morph_open_ksize"]
    close_k = profile["morph_close_ksize"]

    # 1. Color space conversion & noise pre-smoothing
    # Use slight Gaussian blur to suppress sensor salt-and-pepper noise and subpixel misalignments
    blur_ref = cv2.GaussianBlur(ref_bgr, (blur_k, blur_k), 0)
    blur_tgt = cv2.GaussianBlur(aligned_target_bgr, (blur_k, blur_k), 0)

    # 2. Multi-channel difference calculation:
    # Grayscale difference captures structural/luminance shifts
    gray_ref = cv2.cvtColor(blur_ref, cv2.COLOR_BGR2GRAY)
    gray_tgt = cv2.cvtColor(blur_tgt, cv2.COLOR_BGR2GRAY)
    gray_diff = cv2.absdiff(gray_tgt, gray_ref)

    # Lab color difference captures spectral/color shifts (e.g. vegetation browning, water pooling)
    lab_ref = cv2.cvtColor(blur_ref, cv2.COLOR_BGR2Lab)
    lab_tgt = cv2.cvtColor(blur_tgt, cv2.COLOR_BGR2Lab)
    # L channel (0), a channel (1), b channel (2)
    # Euclidean-like combined metric weighted towards chrominance + luminance
    diff_l = cv2.absdiff(lab_tgt[:, :, 0], lab_ref[:, :, 0])
    diff_a = cv2.absdiff(lab_tgt[:, :, 1], lab_ref[:, :, 1])
    diff_b = cv2.absdiff(lab_tgt[:, :, 2], lab_ref[:, :, 2])
    
    # Combined normalized difference map
    combined_diff = np.maximum(gray_diff, (0.5 * diff_l + 0.25 * diff_a + 0.25 * diff_b).astype(np.uint8))

    # 3. Apply threshold to obtain raw binary change mask
    _, raw_thresh = cv2.threshold(
        combined_diff,
        diff_thresh_val,
        255,
        cv2.THRESH_BINARY
    )

    # 4. Morphological filtering to eliminate isolated speckles and merge fragmented patches
    kernel_open = cv2.getStructuringElement(cv2.MORPH_RECT, (open_k, open_k))
    kernel_close = cv2.getStructuringElement(cv2.MORPH_RECT, (close_k, close_k))

    morphed = cv2.morphologyEx(raw_thresh, cv2.MORPH_OPEN, kernel_open)
    morphed = cv2.morphologyEx(morphed, cv2.MORPH_CLOSE, kernel_close)

    # 5. Connected components analysis with statistics
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(
        morphed,
        connectivity=8
    )

    final_mask = np.zeros((h, w), dtype=np.uint8)
    regions: List[RegionDetail] = []
    filtered_noise_count = 0
    region_id_counter = 1

    # Label 0 is background
    for label_idx in range(1, num_labels):
        area = int(stats[label_idx, cv2.CC_STAT_AREA])
        if area < min_region_size:
            filtered_noise_count += 1
            continue

        # Keep this component in final mask
        component_mask = (labels == label_idx)
        final_mask[component_mask] = 255

        x = int(stats[label_idx, cv2.CC_STAT_LEFT])
        y = int(stats[label_idx, cv2.CC_STAT_TOP])
        width = int(stats[label_idx, cv2.CC_STAT_WIDTH])
        height = int(stats[label_idx, cv2.CC_STAT_HEIGHT])
        cx, cy = centroids[label_idx]

        area_pct = round((area / total_pixels) * 100.0, 4)
        mean_intensity = float(np.mean(combined_diff[component_mask]))

        regions.append(
            RegionDetail(
                id=region_id_counter,
                bbox=BoundingBox(x=x, y=y, width=width, height=height),
                centroid_x=round(float(cx), 2),
                centroid_y=round(float(cy), 2),
                area_pixels=area,
                area_percentage=area_pct,
                mean_intensity=round(mean_intensity, 2)
            )
        )
        region_id_counter += 1

    # Sort regions descending by area
    regions.sort(key=lambda r: r.area_pixels, reverse=True)
    # Re-assign sequential rank IDs for clean presentation
    for idx, reg in enumerate(regions, start=1):
        reg.id = idx

    total_changed_pixels = int(np.count_nonzero(final_mask))

    # 6. Generate Coral-Red translucent overlay on aligned target image
    # Coral red in BGR: (B=94, G=63, R=244)
    coral_bgr = np.array([94, 63, 244], dtype=np.uint8)
    alpha = 0.45

    overlay = aligned_target_bgr.copy()
    change_pixels_idx = final_mask > 0

    if np.any(change_pixels_idx):
        blended = cv2.addWeighted(
            aligned_target_bgr[change_pixels_idx],
            1.0 - alpha,
            np.tile(coral_bgr, (np.count_nonzero(change_pixels_idx), 1)),
            alpha,
            0
        )
        overlay[change_pixels_idx] = blended

        # Draw subtle crisp contour boundaries around changed regions for precision
        contours, _ = cv2.findContours(final_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cv2.drawContours(overlay, contours, -1, (60, 40, 220), 1, lineType=cv2.LINE_AA)

    return final_mask, overlay, regions, total_changed_pixels, filtered_noise_count
