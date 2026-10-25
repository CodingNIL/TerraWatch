from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import APP_NAME, APP_VERSION, CORS_ORIGINS
from app.api.health import router as health_router
from app.api.analysis import router as analysis_router

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="TerraWatch — AI-Powered Satellite Change Intelligence MVP API. Deterministic OpenCV/NumPy change detection.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(health_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")


@app.get("/")
def root():
    return {
        "service": APP_NAME,
        "version": APP_VERSION,
        "tagline": "See the change. Measure the impact. Understand the signal.",
        "documentation": "/docs",
        "health": "/api/health",
        "endpoints": {
            "detect": "POST /api/analysis/detect",
            "samples": "GET /api/analysis/samples",
            "sample_data": "GET /api/analysis/samples/{sample_id}/data"
        }
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": str(exc),
            "detail": "An unexpected error occurred during image processing."
        }
    )
