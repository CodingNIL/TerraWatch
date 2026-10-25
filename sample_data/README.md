# TerraWatch Sample Datasets

This directory contains multi-temporal satellite imagery test pairs designed for testing and demonstrating the TerraWatch Change Intelligence engine.

## Included Datasets

### 1. Hydrological Surge & Agricultural Inundation
- **Reference Image:** `flood_reference.png` (900 × 650 px)
- **Comparison Image:** `flood_comparison.png` (900 × 650 px)
- **Scenario:** River basin pre- and post-heavy precipitation event. Illustrates swollen river channel and substantial floodwater inundation covering low-lying agricultural field sectors.
- **Recommended Settings:** Medium sensitivity, min region size: 60 px.

### 2. Industrial Clearing & Logistics Site Development
- **Reference Image:** `urban_reference.png` (900 × 650 px)
- **Comparison Image:** `urban_comparison.png` (900 × 650 px)
- **Scenario:** Temperate woodland canopy transformed into cleared graded land, a large logistics warehouse facility with rooftop mechanical structures, a paved apron with parked trailers, and an access highway connector.
- **Recommended Settings:** Medium sensitivity, min region size: 40 px.

## Regenerating Datasets
To regenerate or modify the test pairs:
```bash
python generate_samples.py
```
