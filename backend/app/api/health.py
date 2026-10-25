from fastapi import APIRouter
import cv2
import numpy as np

from app.config import APP_NAME, APP_VERSION
from app.schemas import HealthResponse

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", response_model=HealthResponse)
def get_health() -> HealthResponse:
    """Returns the operational status and computer vision runtime versions."""
    return HealthResponse(
        status="healthy",
        service=APP_NAME,
        version=APP_VERSION,
        cv2_version=cv2.__version__,
        numpy_version=np.__version__
    )
