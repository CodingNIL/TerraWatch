"""
TerraWatch — Sample Satellite Imagery Generator
Generates realistic multi-temporal synthetic satellite imagery pairs for testing and demo:
1. Hydrological Surge & Agricultural Inundation (River flood event)
2. Industrial Clearing & Logistics Site Development (Deforestation & construction)
"""

import os
from pathlib import Path
import numpy as np
import cv2

OUTPUT_DIR = Path(__file__).resolve().parent


def add_satellite_texture(img: np.ndarray, noise_std: float = 6.0) -> np.ndarray:
    """Adds sensor grain and atmospheric haze variation typical in optical satellite imagery."""
    h, w, c = img.shape
    noise = np.random.normal(0, noise_std, (h, w, c)).astype(np.float32)
    textured = np.clip(img.astype(np.float32) + noise, 0, 255).astype(np.uint8)
    # Slight bilateral blur to mimic sensor PSF (point spread function)
    return cv2.bilateralFilter(textured, d=5, sigmaColor=15, sigmaSpace=15)


def generate_flood_pair(width: int = 900, height: int = 650):
    np.random.seed(42)

    # 1. Base terrain canvas: mosaic of agricultural fields (greens, olives, ochres)
    canvas = np.zeros((height, width, 3), dtype=np.uint8)
    
    # Generate rectangular and polygonal field parcels
    field_colors = [
        [38, 92, 54],    # Forest green (BGR)
        [45, 120, 68],   # Lush crop green
        [50, 105, 80],   # Olive field
        [40, 140, 160],  # Golden wheat / dry soil (BGR: B=40, G=140, R=160)
        [55, 125, 140],  # Harvested parcel
        [30, 75, 45],    # Dense shrub
        [60, 95, 70],    # Pasture
    ]

    # Draw grid of agricultural plots
    cell_w = 90
    cell_h = 70
    for y in range(0, height, cell_h):
        for x in range(0, width, cell_w):
            color = field_colors[np.random.randint(0, len(field_colors))].copy()
            # Random slight shade jitter
            color = [max(0, min(255, c + np.random.randint(-12, 12))) for c in color]
            cv2.rectangle(canvas, (x, y), (x + cell_w, y + cell_h), color, -1)
            # Field boundary hedgerows / irrigation canals
            cv2.rectangle(canvas, (x, y), (x + cell_w, y + cell_h), (25, 45, 30), 1)

    # Add rural road network
    road_color = (130, 140, 145)  # Light asphalt/gravel
    cv2.line(canvas, (0, int(height * 0.35)), (width, int(height * 0.40)), road_color, 4)
    cv2.line(canvas, (int(width * 0.45), 0), (int(width * 0.50), height), road_color, 3)
    cv2.line(canvas, (int(width * 0.75), 0), (int(width * 0.70), height), road_color, 2)

    # Draw natural meandering river across the canvas
    # Points along a bezier curve
    pts = []
    num_pts = 20
    for i in range(num_pts):
        t = i / (num_pts - 1)
        px = int(width * 0.15 + t * (width * 0.7) + 60 * np.sin(t * 5.0))
        py = int(t * height)
        pts.append((px, py))

    river_bgr = (140, 85, 35)   # Deep river teal/blue (BGR: B=140, G=85, R=35)
    river_edge = (90, 60, 25)

    ref_img = canvas.copy()
    # Draw reference river
    for i in range(len(pts) - 1):
        cv2.line(ref_img, pts[i], pts[i+1], river_edge, 28)
        cv2.line(ref_img, pts[i], pts[i+1], river_bgr, 22)

    # Add small farmstead rooftops
    roof_colors = [(180, 180, 190), (120, 120, 170), (140, 150, 160)]
    for _ in range(25):
        rx = np.random.randint(50, width - 50)
        ry = np.random.randint(50, height - 50)
        # Avoid river
        closest_river = min([np.hypot(rx - px, ry - py) for px, py in pts])
        if closest_river > 45:
            rw = np.random.randint(8, 16)
            rh = np.random.randint(8, 14)
            cv2.rectangle(ref_img, (rx, ry), (rx + rw, ry + rh), roof_colors[np.random.randint(0, len(roof_colors))], -1)

    ref_final = add_satellite_texture(ref_img, noise_std=5.0)

    # 2. Comparison Image (Post-flood):
    # Same base terrain and road network, but the river has breached banks and flooded low-lying fields!
    comp_img = canvas.copy()
    # Swollen main river
    for i in range(len(pts) - 1):
        cv2.line(comp_img, pts[i], pts[i+1], river_edge, 44)
        cv2.line(comp_img, pts[i], pts[i+1], river_bgr, 38)

    # Large flood inundation zones in low-lying crop sectors
    flood_water_bgr = (120, 75, 30)
    flood_water_shallow = (100, 70, 45)

    # Inundation zone A (large polygon basin)
    flood_poly1 = np.array([
        [220, 180], [380, 160], [420, 270], [360, 340], [240, 310], [190, 240]
    ], np.int32)
    cv2.fillPoly(comp_img, [flood_poly1], flood_water_shallow)
    cv2.fillPoly(comp_img, [flood_poly1 + [15, 10]], flood_water_bgr)

    # Inundation zone B (downstream overflow)
    flood_poly2 = np.array([
        [460, 380], [610, 360], [660, 490], [530, 520], [440, 450]
    ], np.int32)
    cv2.fillPoly(comp_img, [flood_poly2], flood_water_shallow)
    cv2.fillPoly(comp_img, [flood_poly2 + [-10, 10]], flood_water_bgr)

    # Small puddle / secondary ponding
    cv2.circle(comp_img, (720, 220), 35, flood_water_shallow, -1)
    cv2.circle(comp_img, (715, 225), 25, flood_water_bgr, -1)

    # Add the same rooftops to comp_img (some partially inundated)
    np.random.seed(42)
    for _ in range(25):
        rx = np.random.randint(50, width - 50)
        ry = np.random.randint(50, height - 50)
        closest_river = min([np.hypot(rx - px, ry - py) for px, py in pts])
        if closest_river > 45:
            rw = np.random.randint(8, 16)
            rh = np.random.randint(8, 14)
            # If inside flooded zone, tone down roof
            cv2.rectangle(comp_img, (rx, ry), (rx + rw, ry + rh), roof_colors[np.random.randint(0, len(roof_colors))], -1)

    # Add slight realistic affine jitter (e.g. 1 pixel shift or tiny rotation) to verify ORB registration works!
    M = cv2.getRotationMatrix2D((width / 2, height / 2), 0.25, 1.0)
    M[0, 2] += 2.0
    M[1, 2] -= 1.5
    comp_warped = cv2.warpAffine(comp_img, M, (width, height), borderMode=cv2.BORDER_REFLECT101)

    comp_final = add_satellite_texture(comp_warped, noise_std=5.5)

    return ref_final, comp_final


def generate_urban_pair(width: int = 900, height: int = 650):
    np.random.seed(101)

    # 1. Base terrain: dense temperate woodland with varying green canopy textures
    canvas = np.zeros((height, width, 3), dtype=np.uint8)
    for y in range(0, height, 40):
        for x in range(0, width, 40):
            # Woodland shades (BGR)
            green_val = np.random.randint(65, 115)
            red_val = np.random.randint(25, 55)
            blue_val = np.random.randint(20, 45)
            cv2.rectangle(canvas, (x, y), (x + 40, y + 40), (blue_val, green_val, red_val), -1)

    # Add main arterial highway
    hwy_color = (60, 65, 70)  # Dark asphalt
    hwy_shoulder = (120, 130, 135)
    cv2.line(canvas, (0, int(height * 0.75)), (width, int(height * 0.72)), hwy_shoulder, 14)
    cv2.line(canvas, (0, int(height * 0.75)), (width, int(height * 0.72)), hwy_color, 10)
    # Road markings
    for sx in range(20, width, 50):
        cv2.line(canvas, (sx, int(height * 0.75)), (sx + 20, int(height * 0.75)), (210, 210, 210), 1)

    ref_img = canvas.copy()
    ref_final = add_satellite_texture(ref_img, noise_std=5.0)

    # 2. Comparison Image: Forest cleared for warehouse logistics facility & staging apron
    comp_img = canvas.copy()

    # Cleared bare earth zone (brown/ochre soil: B=50, G=110, R=145)
    clear_zone_poly = np.array([
        [280, 150], [620, 150], [620, 440], [280, 440]
    ], np.int32)
    cv2.fillPoly(comp_img, [clear_zone_poly], (50, 110, 145))

    # New paved access road connecting clearing to highway
    cv2.line(comp_img, (450, 440), (450, int(height * 0.74)), hwy_shoulder, 10)
    cv2.line(comp_img, (450, 440), (450, int(height * 0.74)), hwy_color, 8)

    # Large logistics warehouse building (bright concrete roof with rooftop HVAC units)
    # BGR: light gray/white (215, 220, 225)
    building_box = ((330, 190), (560, 330))
    cv2.rectangle(comp_img, building_box[0], building_box[1], (210, 218, 222), -1)
    # Building drop shadow (dark gray)
    cv2.line(comp_img, (560, 190), (560, 330), (35, 40, 45), 4)
    cv2.line(comp_img, (330, 330), (560, 330), (35, 40, 45), 4)

    # HVAC rooftop rectangular modules
    for hx in range(360, 530, 40):
        cv2.rectangle(comp_img, (hx, 220), (hx + 18, 240), (140, 145, 150), -1)
        cv2.rectangle(comp_img, (hx, 270), (hx + 18, 290), (140, 145, 150), -1)

    # Loading docks / truck parking bays (asphalt apron)
    cv2.rectangle(comp_img, (330, 345), (560, 415), (75, 80, 85), -1)
    # Parked tractor trailers (small white rectangles)
    for tx in range(350, 540, 35):
        cv2.rectangle(comp_img, (tx, 355), (tx + 12, 395), (230, 230, 235), -1)

    # Slight realistic subpixel sensor rotation
    M = cv2.getRotationMatrix2D((width / 2, height / 2), -0.2, 1.0)
    M[0, 2] -= 1.5
    M[1, 2] += 2.0
    comp_warped = cv2.warpAffine(comp_img, M, (width, height), borderMode=cv2.BORDER_REFLECT101)

    comp_final = add_satellite_texture(comp_warped, noise_std=5.2)

    return ref_final, comp_final


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Generating synthetic satellite test datasets in {OUTPUT_DIR}...")

    # Pair 1: Flood Inundation
    flood_ref, flood_comp = generate_flood_pair()
    cv2.imwrite(str(OUTPUT_DIR / "flood_reference.png"), flood_ref)
    cv2.imwrite(str(OUTPUT_DIR / "flood_comparison.png"), flood_comp)
    print("  [OK] Created flood_reference.png and flood_comparison.png")

    # Pair 2: Urban Expansion
    urban_ref, urban_comp = generate_urban_pair()
    cv2.imwrite(str(OUTPUT_DIR / "urban_reference.png"), urban_ref)
    cv2.imwrite(str(OUTPUT_DIR / "urban_comparison.png"), urban_comp)
    print("  [OK] Created urban_reference.png and urban_comparison.png")

    print("Sample generation complete!")


if __name__ == "__main__":
    main()
