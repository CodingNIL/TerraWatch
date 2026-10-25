import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple
from app.schemas import (
    ImageMetadata,
    AlignmentInfo,
    StatisticsInfo,
    RegionDetail,
    SensitivityLevel
)


def generate_interpretation_and_limitations(
    stats: StatisticsInfo,
    alignment: AlignmentInfo,
    sensitivity: SensitivityLevel
) -> Tuple[str, List[str]]:
    """
    Produce responsible, cautious interpretation and methodological limitations.
    Adheres strictly to the principle that visual change detection identifies
    radiometric/textural difference without asserting causal attribution.
    """
    pct = stats.changed_percentage
    category = stats.intensity_category
    reg_count = stats.retained_regions_count

    if stats.changed_pixels == 0:
        interpretation = (
            "No significant radiometric or structural divergence was detected between the reference "
            "and comparison acquisitions at the chosen sensitivity profile. Surfaces within the field "
            "of view appear stable within sensor noise tolerances."
        )
    elif category == "Negligible" or category == "Low":
        interpretation = (
            f"Detected {category.lower()}-intensity visual variation ({pct:.2f}% of pixels across {reg_count} discrete regions). "
            "Such localized divergences frequently correspond to minor surface disturbances, transient shadows, "
            "seasonal moisture fluctuations, or modest vegetation phenology rather than major structural disruptions."
        )
    elif category == "Moderate":
        interpretation = (
            f"Detected moderate-intensity visual divergence ({pct:.2f}% of pixels across {reg_count} discrete regions). "
            "Distinct surface changes are evident. Potential explanations include agricultural harvesting/tilling, "
            "clearing, waterbody boundary shifts, or construction earthworks. Further contextual ground validation "
            "is recommended to establish specific drivers."
        )
    else:  # Significant or Extensive
        interpretation = (
            f"Detected {category.lower()}-intensity visual transformation ({pct:.2f}% of pixels across {reg_count} discrete regions). "
            "Extensive spectral and textural modifications indicate substantial surface alteration. "
            "Possible causes encompass major land-use conversion, significant hydrological events (inundation/recession), "
            "wildfire scarring, or large-scale physical infrastructure development. Causal attribution requires "
            "independent domain-specific validation."
        )

    limitations = [
        "Radiometric Variation: Differences in solar zenith angle, atmospheric haze, or cloud shadows can induce apparent pixel divergence unrelated to true surface alteration.",
        "Phenological Effects: Natural seasonal transitions in deciduous vegetation canopy or soil moisture will register as surface changes.",
        "Geometric Registration: Subpixel misalignments or parallax distortions between oblique acquisition angles can generate boundary edge artifacts.",
        "Uncalibrated Area: Measurements represent sensor pixel counts in image space. True ground area (e.g., hectares or square kilometers) requires full georeferencing and map projection data."
    ]

    if alignment.status != "aligned":
        limitations.append(
            f"Alignment Caveat: Automated feature registration operated in fallback mode ({alignment.status}). Geometric variance may contribute to difference signals."
        )

    return interpretation, limitations


def generate_markdown_report(
    analysis_id: str,
    timestamp: str,
    before_meta: ImageMetadata,
    after_meta: ImageMetadata,
    comparison_dims: Dict[str, int],
    sensitivity: SensitivityLevel,
    min_region_size: int,
    alignment: AlignmentInfo,
    stats: StatisticsInfo,
    regions: List[RegionDetail],
    interpretation: str,
    limitations: List[str]
) -> str:
    """
    Format a complete, professional intelligence report in Markdown.
    """
    lines = [
        f"# TERRAWATCH CHANGE INTELLIGENCE REPORT",
        f"**Report Reference:** `{analysis_id}`  ",
        f"**Generated UTC:** {timestamp}  ",
        f"**Engine:** TerraWatch CV Change Detection v1.0 (OpenCV / NumPy)  ",
        "",
        "---",
        "",
        "## 1. Executive Summary",
        f"- **Change Intensity Category:** **{stats.intensity_category}**",
        f"- **Total Affected Surface:** **{stats.changed_percentage:.4f}%** ({stats.changed_pixels:,} of {stats.total_pixels:,} pixels)",
        f"- **Retained Change Regions:** **{stats.retained_regions_count}** (filtered noise components: {stats.filtered_noise_count})",
        f"- **Largest Single Region:** **{stats.largest_region_percentage:.4f}%** ({stats.largest_region_pixels:,} pixels)",
        "",
        "## 2. Sensor & Acquisition Parameters",
        "| Parameter | Reference (Before) | Comparison (After) |",
        "| :--- | :--- | :--- |",
        f"| **Filename** | `{before_meta.filename}` | `{after_meta.filename}` |",
        f"| **Format** | {before_meta.format} | {after_meta.format} |",
        f"| **Dimensions** | {before_meta.width} × {before_meta.height} px | {after_meta.width} × {after_meta.height} px |",
        f"| **File Size** | {before_meta.size_bytes / 1024:.1f} KB | {after_meta.size_bytes / 1024:.1f} KB |",
        f"| **Acquisition Date** | {before_meta.capture_date or 'Not specified (user-entered)'} | {after_meta.capture_date or 'Not specified (user-entered)'} |",
        "",
        f"- **Active Comparison Frame:** {comparison_dims['width']} × {comparison_dims['height']} px",
        f"- **Registration Status:** `{alignment.status.upper()}` ({alignment.method})",
        f"- **Registration Details:** {alignment.message}",
        f"- **Sensitivity Setting:** `{sensitivity.upper()}` | **Min Region Size:** `{min_region_size}` pixels",
        "",
        "## 3. Surface Divergence Analysis",
        f"**Analytical Assessment:**  \n{interpretation}",
        "",
        "## 4. Top Detected Change Regions",
    ]

    if not regions:
        lines.append("*(No change regions met the configured size threshold.)*")
    else:
        lines.append("| Rank | Region ID | Bounding Box [x, y, w, h] | Centroid (x, y) | Pixel Area | Image Coverage (%) | Mean Intensity |")
        lines.append("| :--- | :--- | :--- | :--- | :--- | :--- | :--- |")
        # Display top 15 regions in markdown table
        for r in regions[:15]:
            bbox_str = f"[{r.bbox.x}, {r.bbox.y}, {r.bbox.width}, {r.bbox.height}]"
            lines.append(f"| #{r.id} | REG-{r.id:03d} | `{bbox_str}` | ({r.centroid_x}, {r.centroid_y}) | {r.area_pixels:,} | {r.area_percentage:.4f}% | {r.mean_intensity} |")
        if len(regions) > 15:
            lines.append(f"\n*(Truncated: {len(regions) - 15} additional smaller regions listed in full JSON export.)*")

    lines.extend([
        "",
        "## 5. Methodological Limitations & Compliance Disclaimers",
        "> [!IMPORTANT]",
        "> **Attribution Disclaimer:** Visual change detection identifies pixel reflectance and textural differences between image pairs. It does not establish whether surface changes stem from natural disasters, anthropogenic construction, or environmental factors. All findings represent uncalibrated sensor-space observations and should not replace ground truth verification.",
        ""
    ])

    for lim in limitations:
        lines.append(f"- **{lim.split(':')[0]}:** {lim.split(':', 1)[1].strip() if ':' in lim else lim}")

    lines.extend([
        "",
        "---",
        "*TerraWatch Intelligence Engine — Deterministic Computer Vision Hackathon MVP.*"
    ])

    return "\n".join(lines)


def generate_json_report(
    analysis_id: str,
    timestamp: str,
    before_meta: ImageMetadata,
    after_meta: ImageMetadata,
    comparison_dims: Dict[str, int],
    sensitivity: SensitivityLevel,
    min_region_size: int,
    alignment: AlignmentInfo,
    stats: StatisticsInfo,
    regions: List[RegionDetail],
    interpretation: str,
    limitations: List[str]
) -> Dict[str, Any]:
    """
    Format a complete, structured JSON report payload.
    """
    return {
        "analysis_id": analysis_id,
        "product": "TerraWatch Earth Observation Intelligence",
        "version": "1.0.0",
        "timestamp_utc": timestamp,
        "inputs": {
            "reference_image": before_meta.model_dump(),
            "comparison_image": after_meta.model_dump(),
            "comparison_dimensions": comparison_dims,
        },
        "configuration": {
            "sensitivity": sensitivity,
            "min_region_size_pixels": min_region_size,
            "alignment": alignment.model_dump(),
        },
        "statistics": stats.model_dump(),
        "interpretation": interpretation,
        "limitations": limitations,
        "regions_count": len(regions),
        "regions": [r.model_dump() for r in regions],
        "attribution_policy": "Pixel-space visual change detection only. No causal or jurisdictional attribution asserted."
    }
