from typing import List
from app.schemas import StatisticsInfo, RegionDetail, ChangeIntensityCategory


def compute_statistics(
    total_pixels: int,
    changed_pixels: int,
    regions: List[RegionDetail],
    filtered_noise_count: int
) -> StatisticsInfo:
    """
    Computes rigorous mathematical metrics and qualitative intensity classification.
    """
    if total_pixels <= 0:
        raise ValueError("Total pixels must be greater than zero.")

    changed_percentage = round((changed_pixels / total_pixels) * 100.0, 4)

    # Classify intensity category strictly based on defined thresholds
    if changed_percentage < 0.1:
        intensity_category: ChangeIntensityCategory = "Negligible"
    elif changed_percentage < 1.0:
        intensity_category = "Low"
    elif changed_percentage < 5.0:
        intensity_category = "Moderate"
    elif changed_percentage < 15.0:
        intensity_category = "Significant"
    else:
        intensity_category = "Extensive"

    largest_region_pixels = regions[0].area_pixels if regions else 0
    largest_region_percentage = regions[0].area_percentage if regions else 0.0

    return StatisticsInfo(
        total_pixels=total_pixels,
        changed_pixels=changed_pixels,
        changed_percentage=changed_percentage,
        retained_regions_count=len(regions),
        filtered_noise_count=filtered_noise_count,
        intensity_category=intensity_category,
        largest_region_pixels=largest_region_pixels,
        largest_region_percentage=largest_region_percentage
    )
