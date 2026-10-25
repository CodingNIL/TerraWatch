import base64
import io
import cv2
import numpy as np
from PIL import Image


def cv2_to_data_url(image: np.ndarray, fmt: str = "png") -> str:
    """
    Encode an OpenCV BGR or Grayscale or BGRA image into a base64 Data URL.
    """
    ext = f".{fmt.lower()}"
    success, buffer = cv2.imencode(ext, image)
    if not success:
        raise ValueError(f"Failed to encode image to {fmt}")
    b64_str = base64.b64encode(buffer).decode("utf-8")
    mime = "image/png" if fmt.lower() == "png" else f"image/{fmt.lower()}"
    return f"data:{mime};base64,{b64_str}"


def pil_to_data_url(image: Image.Image, fmt: str = "PNG") -> str:
    """
    Encode a PIL Image into a base64 Data URL.
    """
    buffered = io.BytesIO()
    image.save(buffered, format=fmt)
    b64_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    mime = f"image/{fmt.lower()}"
    return f"data:{mime};base64,{b64_str}"
