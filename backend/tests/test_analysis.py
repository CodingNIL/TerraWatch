import io
from pathlib import Path
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app
from app.config import SAMPLES_DIR

client = TestClient(app)


def test_analysis_identical_images():
    buf = io.BytesIO()
    img = Image.new("RGB", (200, 200), color=(100, 150, 200))
    img.save(buf, format="PNG")
    img_bytes = buf.getvalue()

    response = client.post(
        "/api/analysis/detect",
        files={
            "before_image": ("identical_1.png", img_bytes, "image/png"),
            "after_image": ("identical_2.png", img_bytes, "image/png"),
        },
        data={"sensitivity": "medium", "min_region_size": 20}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["statistics"]["changed_pixels"] == 0
    assert data["statistics"]["changed_percentage"] == 0.0
    assert data["statistics"]["intensity_category"] == "Negligible"
    assert len(data["regions"]) == 0
    assert "difference_mask_data_url" in data
    assert "change_overlay_data_url" in data
    assert "markdown_report" in data
    assert "json_report" in data


def test_analysis_flood_sample_pair():
    flood_ref = SAMPLES_DIR / "flood_reference.png"
    flood_comp = SAMPLES_DIR / "flood_comparison.png"
    assert flood_ref.exists() and flood_comp.exists(), "Flood sample files must exist"

    with open(flood_ref, "rb") as f_ref, open(flood_comp, "rb") as f_comp:
        response = client.post(
            "/api/analysis/detect",
            files={
                "before_image": ("flood_reference.png", f_ref.read(), "image/png"),
                "after_image": ("flood_comparison.png", f_comp.read(), "image/png"),
            },
            data={"sensitivity": "medium", "min_region_size": 50, "align_images": True}
        )

    assert response.status_code == 200
    data = response.json()
    assert data["analysis_id"].startswith("TW-")
    assert data["statistics"]["changed_pixels"] > 0
    assert data["statistics"]["changed_percentage"] > 1.0
    assert data["statistics"]["retained_regions_count"] >= 1
    assert data["alignment"]["status"] in {"aligned", "fallback_identity"}
    assert "data:image/png;base64," in data["difference_mask_data_url"]
    assert "data:image/png;base64," in data["change_overlay_data_url"]

    # Verify first region
    first_reg = data["regions"][0]
    assert first_reg["id"] == 1
    assert first_reg["area_pixels"] > 0
    assert first_reg["area_percentage"] > 0

    # Verify Markdown report content
    assert "# TERRAWATCH CHANGE INTELLIGENCE REPORT" in data["markdown_report"]
    assert "Executive Summary" in data["markdown_report"]
    assert "Methodological Limitations" in data["markdown_report"]


def test_samples_endpoints():
    response = client.get("/api/analysis/samples")
    assert response.status_code == 200
    samples = response.json()["samples"]
    assert len(samples) >= 2
    sample_ids = [s["id"] for s in samples]
    assert "reservoir_flood" in sample_ids
    assert "urban_expansion" in sample_ids

    # Test sample data retrieval
    data_resp = client.get("/api/analysis/samples/reservoir_flood/data")
    assert data_resp.status_code == 200
    body = data_resp.json()
    assert "before_data_url" in body
    assert "after_data_url" in body
    assert body["dimensions"]["width"] == 900
    assert body["dimensions"]["height"] == 650
