import io
from typing import Tuple
from fastapi import UploadFile, HTTPException, status
from PIL import Image, ImageOps, UnidentifiedImageError
import numpy as np
import cv2

from app.config import (
    MAX_UPLOAD_SIZE_BYTES,
    MAX_IMAGE_DIMENSION,
    MAX_IMAGE_PIXELS,
    ALLOWED_MIME_TYPES
)
from app.schemas import ImageMetadata


class LoadedImage:
    def __init__(
        self,
        bgr_array: np.ndarray,
        rgb_array: np.ndarray,
        metadata: ImageMetadata,
        raw_bytes: bytes
    ):
        self.bgr = bgr_array
        self.rgb = rgb_array
        self.metadata = metadata
        self.raw_bytes = raw_bytes


async def validate_and_load_image(
    file: UploadFile,
    label: str = "Image",
    capture_date: str = None
) -> LoadedImage:
    """
    Validate uploaded image bytes against size, mime, corrupt structure,
    and dimension constraints. Returns a LoadedImage container with OpenCV BGR & RGB arrays.
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{label}: No file provided or filename is missing."
        )

    # Read uploaded bytes into memory (avoiding permanent disk writes)
    content = await file.read()
    size_bytes = len(content)

    if size_bytes == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{label} ('{file.filename}') is empty (0 bytes)."
        )

    if size_bytes > MAX_UPLOAD_SIZE_BYTES:
        max_mb = MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)
        actual_mb = size_bytes / (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"{label} exceeds maximum allowed size of {max_mb}MB (received {actual_mb:.2f}MB)."
        )

    # Validate image decoding using Pillow
    try:
        pil_img = Image.open(io.BytesIO(content))
        # Force loading image data to detect corrupt or truncated streams
        pil_img.load()
    except (UnidentifiedImageError, OSError, ValueError) as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{label} ('{file.filename}') could not be decoded. Ensure it is a valid, uncorrupted image."
        )

    # Verify format
    detected_format = (pil_img.format or "").upper()
    valid_formats = {"JPEG", "JPG", "PNG", "WEBP"}
    if detected_format not in valid_formats:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"{label} format '{detected_format}' is not supported. Please upload JPEG, PNG, or WebP."
        )

    # Correct EXIF orientation if present
    try:
        pil_img = ImageOps.exif_transpose(pil_img)
    except Exception:
        # If EXIF reading fails, continue with original
        pass

    width, height = pil_img.size

    # Dimension and total pixels safety check
    if width > MAX_IMAGE_DIMENSION or height > MAX_IMAGE_DIMENSION:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{label} dimensions ({width}x{height}) exceed maximum allowed dimension ({MAX_IMAGE_DIMENSION}px)."
        )

    total_pixels = width * height
    if total_pixels > MAX_IMAGE_PIXELS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{label} total pixels ({total_pixels:,}) exceed safety threshold ({MAX_IMAGE_PIXELS:,})."
        )

    # Convert to standard RGB
    if pil_img.mode != "RGB":
        pil_img = pil_img.convert("RGB")

    rgb_array = np.array(pil_img, dtype=np.uint8)
    bgr_array = cv2.cvtColor(rgb_array, cv2.COLOR_RGB2BGR)

    metadata = ImageMetadata(
        filename=file.filename,
        format=detected_format,
        width=width,
        height=height,
        size_bytes=size_bytes,
        capture_date=capture_date
    )

    return LoadedImage(
        bgr_array=bgr_array,
        rgb_array=rgb_array,
        metadata=metadata,
        raw_bytes=content
    )
