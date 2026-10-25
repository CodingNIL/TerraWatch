import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def create_dummy_image_bytes(fmt="PNG", size=(100, 100), color=(128, 128, 128)):
    buf = io.BytesIO()
    img = Image.new("RGB", size, color=color)
    img.save(buf, format=fmt)
    buf.seek(0)
    return buf.getvalue()


def test_reject_empty_file():
    empty_bytes = b""
    valid_bytes = create_dummy_image_bytes()

    response = client.post(
        "/api/analysis/detect",
        files={
            "before_image": ("empty.png", empty_bytes, "image/png"),
            "after_image": ("valid.png", valid_bytes, "image/png"),
        }
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_reject_corrupt_file():
    corrupt_bytes = b"NOT_A_REAL_IMAGE_DATA_HEADER_CORRUPTED_STREAM"
    valid_bytes = create_dummy_image_bytes()

    response = client.post(
        "/api/analysis/detect",
        files={
            "before_image": ("corrupt.png", corrupt_bytes, "image/png"),
            "after_image": ("valid.png", valid_bytes, "image/png"),
        }
    )
    assert response.status_code == 422
    assert "could not be decoded" in response.json()["detail"].lower()


def test_reject_invalid_sensitivity():
    valid_bytes = create_dummy_image_bytes()

    response = client.post(
        "/api/analysis/detect",
        files={
            "before_image": ("before.png", valid_bytes, "image/png"),
            "after_image": ("after.png", valid_bytes, "image/png"),
        },
        data={"sensitivity": "ultra_extreme"}
    )
    assert response.status_code == 400
    assert "invalid sensitivity" in response.json()["detail"].lower()


def test_accept_valid_jpeg_png_webp():
    png_bytes = create_dummy_image_bytes(fmt="PNG")
    jpg_bytes = create_dummy_image_bytes(fmt="JPEG")

    response = client.post(
        "/api/analysis/detect",
        files={
            "before_image": ("before.png", png_bytes, "image/png"),
            "after_image": ("after.jpg", jpg_bytes, "image/jpeg"),
        },
        data={"sensitivity": "medium"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["before_image"]["format"] in {"PNG", "JPEG"}
    assert data["after_image"]["format"] in {"PNG", "JPEG"}
