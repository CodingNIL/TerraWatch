# TERRAWATCH — AI-Powered Satellite Change Intelligence

> **Tagline:** *See the change. Measure the impact. Understand the signal.*

TerraWatch is a local, high-precision geospatial change intelligence workstation engineered for environmental monitoring, disaster assessment, and infrastructure verification. It enables analysts to ingest multi-temporal satellite imagery pairs, execute subpixel geometric feature alignment, isolate radiometric and textural shifts using deterministic computer vision, quantify surface disruption, and generate automated intelligence briefs in Markdown and JSON formats.

Designed for complete transparency and air-gapped local execution, TerraWatch requires **no paid APIs, API keys, GPUs, or cloud dependencies**.

---

## 🛰️ Core Capabilities

1. **Multi-Temporal Imagery Ingestion**
   - Ingests reference (earlier) and comparison (subsequent) acquisitions.
   - Supports JPEG, PNG, and WebP formats.
   - Enforces a strict 10 MB per-image limit and dimension bounds (up to 16 MP) to eliminate memory exhaustion.
   - In-memory decoding with Pillow and OpenCV — zero unnecessary temporary disk clutter.
   - Normalizes EXIF camera orientations automatically.

2. **Subpixel Feature Registration (ORB + RANSAC)**
   - Extracts invariant Oriented FAST and Rotated BRIEF (ORB) keypoints.
   - Employs Brute-Force Hamming descriptor matching with Lowe's ratio test ($0.75$).
   - Estimates a robust 2D partial affine transformation (scale, rotation, translation) using RANSAC.
   - Verifies transformation plausibility and inlier count before warping to avoid geometric distortions.
   - Transparent fallback geometry if registration is bypassed or features are insufficient.

3. **Deterministic Computer Vision Pipeline**
   - Multi-channel differencing combining CIELAB chrominance shifts and grayscale luminance deltas.
   - Sensitivity profiles: **Low** (threshold ~55), **Medium** (threshold ~38), **High** (threshold ~24).
   - Dual-stage morphological operations (Open/Close) suppress sensor noise, speckles, and transient illumination artifacts.
   - Connected component analysis clusters contiguous changed regions and filters micro-noise below the user-configured minimum area.

4. **Cartographic Visualizations**
   - **Interactive Split Slider:** Seamlessly wipe between reference and comparison acquisitions.
   - **Side-by-Side Viewer:** Synchronized inspection of baseline vs. subsequent scenes.
   - **Coral Change Overlay:** Translucent coral-red highlight (`#f43f5e`) blended over the aligned satellite scene with interactive opacity control ($0–100\%$) and toggleable bounding boxes.
   - **Binary Difference Mask:** High-contrast cartographic raster isolating verified change clusters with noise-rejection statistics.
   - **Interactive Region Locator:** Click any detected region from the table to focus and highlight its spatial bounding box with real-time coordinate readouts.

5. **Automated Intelligence Reports**
   - Authoritative metrics: altered surface percentage, pixel counts, retained region count, largest cluster area, and intensity categorization (*Negligible*, *Low*, *Moderate*, *Significant*, *Extensive*).
   - Cautious analytical assessment strictly adhering to scientific integrity: visual differencing identifies radiometric/textural shifts in sensor space and does not assert causal or jurisdictional attribution.
   - One-click downloads for structured **JSON** (`.json`) dossiers and publication-ready **Markdown** (`.md`) briefs.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React icons.
- **Backend:** Python 3.11+, FastAPI, Uvicorn, OpenCV (`opencv-python-headless`), NumPy, Pillow, Pydantic, `python-multipart`.
- **Test Suite:** pytest, FastAPI TestClient (`httpx`).

---

## 📁 Repository Structure

```
terrawatch/
├── README.md                   # Complete system documentation
├── .gitignore                  # Git ignore rules for Python & Node
├── .env.example                # Environment variable template
├── backend/
│   ├── requirements.txt        # Backend dependencies
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI entry point & CORS
│   │   ├── config.py           # Configuration, bounds & thresholds
│   │   ├── schemas.py          # Pydantic request/response models
│   │   ├── api/
│   │   │   ├── health.py       # Health check & CV runtime versions
│   │   │   └── analysis.py     # Change detection & sample endpoints
│   │   ├── services/
│   │   │   ├── image_loader.py       # Validation, decoding & EXIF handling
│   │   │   ├── image_registration.py # ORB + RANSAC affine alignment
│   │   │   ├── change_detector.py    # OpenCV/NumPy differencing engine
│   │   │   ├── statistics.py         # Quantitative metrics & classification
│   │   │   └── report_generator.py   # Markdown & JSON intelligence reports
│   │   └── utils/
│   │       └── image_encoding.py     # Base64 data URL utilities
│   └── tests/
│       ├── test_health.py      # Health & root endpoint tests
│       ├── test_validation.py  # Image validation & security tests
│       └── test_analysis.py    # Detection, alignment & sample tests
├── frontend/
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.ts          # Vite build & API proxy configuration
│   ├── tsconfig.json           # TypeScript configuration
│   ├── index.html              # HTML shell with Inter & JetBrains Mono
│   └── src/
│       ├── main.tsx            # React application mount
│       ├── App.tsx             # Main workstation state & layout
│       ├── index.css           # Tailwind & cartographic animations
│       ├── types/analysis.ts   # Shared TypeScript domain types
│       ├── services/api.ts     # REST client services
│       ├── hooks/useAnalysis.ts# Analysis lifecycle hook
│       ├── components/
│       │   ├── layout/         # AppShell, Sidebar, TopBar, Views
│       │   ├── upload/         # Dropzones, Previews, Controls
│       │   ├── analysis/       # Split Slider, Overlay, Mask, Metrics, Regions
│       │   └── reports/        # Intelligence Report Panel
│       └── utils/
│           ├── formatters.ts   # Units, numbers & intensity badges
│           └── downloadReport.ts # File export download triggers
└── sample_data/
    ├── README.md               # Dataset descriptions
    ├── generate_samples.py     # Procedural satellite test generator
    ├── flood_reference.png     # Flood before image
    ├── flood_comparison.png    # Flood after image
    ├── urban_reference.png     # Urban development before image
    └── urban_comparison.png    # Urban development after image
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 2. Backend Setup
From the `terrawatch/backend` directory:

```bash
# 1. Install dependencies
python -m pip install -r requirements.txt

# 2. Run automated test suite
python -m pytest tests/ -v -p no:cacheprovider

# 3. Launch FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Interactive API documentation will be available at:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`
- Health status: `http://127.0.0.1:8000/api/health`

### 3. Frontend Setup
From the `terrawatch/frontend` directory:

```bash
# 1. Install dependencies
npm install

# 2. Verify TypeScript build
npm run build

# 3. Launch Vite dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Automated Testing

TerraWatch includes a comprehensive test suite covering API contracts, image corruption handling, dimension limits, identical-image baselines, and multi-temporal sample dataset processing:

```bash
cd backend
python -m pytest tests/ -v -p no:cacheprovider
```

**Results:**
- `test_root_endpoint`: PASSED
- `test_health_endpoint`: PASSED
- `test_reject_empty_file`: PASSED
- `test_reject_corrupt_file`: PASSED
- `test_reject_invalid_sensitivity`: PASSED
- `test_accept_valid_jpeg_png_webp`: PASSED
- `test_analysis_identical_images`: PASSED (0% change baseline)
- `test_analysis_flood_sample_pair`: PASSED (verified ORB alignment & region clustering)
- `test_samples_endpoints`: PASSED

---

## 📊 Bundled Sample Datasets

TerraWatch ships with procedural high-fidelity synthetic satellite test pairs generated via OpenCV:
1. **Hydrological Surge & Agricultural Inundation:** River basin pre- and post-flood event illustrating submerged cropland and broadened water body boundaries.
2. **Industrial Clearing & Logistics Site Development:** Woodland plot cleared for logistics warehouse foundations, parking bays, and new asphalt highway connector.

Both sample pairs can be loaded instantly within the UI via the **Load Demo Data** action in the top bar or overview screen.

---

## ⚖️ Scientific Integrity & Disclaimer

> [!IMPORTANT]
> **Attribution Policy:** Visual change detection identifies pixel-level reflectance and textural divergence between multi-temporal acquisitions. It does not establish whether surface changes stem from natural disasters, anthropogenic construction, or environmental factors. All findings represent uncalibrated sensor-space observations and should not replace ground truth verification.
