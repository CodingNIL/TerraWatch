import cv2
import numpy as np
from typing import Tuple
from app.schemas import AlignmentInfo, AlignmentStatusType


def align_images_orb_ransac(
    ref_bgr: np.ndarray,
    target_bgr: np.ndarray,
    enabled: bool = True
) -> Tuple[np.ndarray, AlignmentInfo]:
    """
    Align target_bgr to ref_bgr using ORB feature detection and robust RANSAC affine/homography estimation.
    If disabled or if alignment fails plausibility checks, fall back to safe geometry matching.
    """
    ref_h, ref_w = ref_bgr.shape[:2]
    tgt_h, tgt_w = target_bgr.shape[:2]

    # If alignment is disabled by user:
    if not enabled:
        if (ref_h, ref_w) == (tgt_h, tgt_w):
            return target_bgr, AlignmentInfo(
                status="disabled",
                method="USER_DISABLED",
                inliers=0,
                matches_found=0,
                message="Image registration was bypassed by user setting. Using original comparison geometry."
            )
        else:
            # Resize target to match reference dimensions cleanly
            resized_target = cv2.resize(target_bgr, (ref_w, ref_h), interpolation=cv2.INTER_LINEAR)
            return resized_target, AlignmentInfo(
                status="fallback_resized",
                method="DIRECT_RESIZE",
                inliers=0,
                matches_found=0,
                message="Registration disabled. Image dimensions differed, resized to reference dimensions."
            )

    # Convert to grayscale for feature extraction
    gray_ref = cv2.cvtColor(ref_bgr, cv2.COLOR_BGR2GRAY)
    gray_tgt = cv2.cvtColor(target_bgr, cv2.COLOR_BGR2GRAY)

    # Initialize ORB detector
    orb = cv2.ORB_create(
        nfeatures=1500,
        scaleFactor=1.2,
        nlevels=8,
        edgeThreshold=15,
        firstLevel=0,
        WTA_K=2,
        scoreType=cv2.ORB_HARRIS_SCORE,
        patchSize=31
    )

    kp_ref, des_ref = orb.detectAndCompute(gray_ref, None)
    kp_tgt, des_tgt = orb.detectAndCompute(gray_tgt, None)

    # Check if descriptors were detected
    if des_ref is None or des_tgt is None or len(kp_ref) < 8 or len(kp_tgt) < 8:
        fallback_target, status_type, msg = _fallback_resize_or_identity(ref_bgr, target_bgr)
        return fallback_target, AlignmentInfo(
            status=status_type,
            method="INSUFFICIENT_FEATURES_FALLBACK",
            inliers=0,
            matches_found=0,
            message=f"Insufficient distinct features detected (ref: {len(kp_ref) if kp_ref else 0}, target: {len(kp_tgt) if kp_tgt else 0}). {msg}"
        )

    # Match descriptors using Brute-Force Matcher with Hamming distance & k-NN ratio test
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
    raw_matches = bf.knnMatch(des_tgt, des_ref, k=2)

    good_matches = []
    for m_n in raw_matches:
        if len(m_n) == 2:
            m, n = m_n
            # Lowe's ratio test (0.75)
            if m.distance < 0.75 * n.distance:
                good_matches.append(m)

    total_good = len(good_matches)

    # We require at least 10 robust matches for reliable RANSAC transformation
    if total_good < 10:
        fallback_target, status_type, msg = _fallback_resize_or_identity(ref_bgr, target_bgr)
        return fallback_target, AlignmentInfo(
            status=status_type,
            method="INSUFFICIENT_MATCHES_FALLBACK",
            inliers=0,
            matches_found=total_good,
            message=f"Only {total_good} reliable feature matches found (minimum 10 required for RANSAC). {msg}"
        )

    pts_tgt = np.float32([kp_tgt[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
    pts_ref = np.float32([kp_ref[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)

    # Estimate Affine Partial 2D (Translation, Rotation, Uniform Scale) with RANSAC
    # This prevents extreme perspective shearing often caused by unconstrained homography on satellite patches
    transform_matrix, inliers_mask = cv2.estimateAffinePartial2D(
        pts_tgt,
        pts_ref,
        method=cv2.RANSAC,
        ransacReprojThreshold=4.0,
        maxIters=2000
    )

    if transform_matrix is None or inliers_mask is None:
        fallback_target, status_type, msg = _fallback_resize_or_identity(ref_bgr, target_bgr)
        return fallback_target, AlignmentInfo(
            status=status_type,
            method="RANSAC_ESTIMATION_FAILED",
            inliers=0,
            matches_found=total_good,
            message=f"Geometric transformation matrix could not be converged by RANSAC. {msg}"
        )

    inliers_count = int(np.sum(inliers_mask))
    if inliers_count < 8:
        fallback_target, status_type, msg = _fallback_resize_or_identity(ref_bgr, target_bgr)
        return fallback_target, AlignmentInfo(
            status=status_type,
            method="LOW_INLIER_CONFIDENCE_FALLBACK",
            inliers=inliers_count,
            matches_found=total_good,
            message=f"Only {inliers_count} inliers verified by RANSAC (minimum 8 required). {msg}"
        )

    # Validate transformation plausibility:
    # An affine partial matrix has form:
    # [ [ s*cos(th), -s*sin(th), tx ],
    #   [ s*sin(th),  s*cos(th), ty ] ]
    a = transform_matrix[0, 0]
    b = transform_matrix[0, 1]
    scale_sq = a * a + b * b
    scale = np.sqrt(scale_sq)
    tx = transform_matrix[0, 2]
    ty = transform_matrix[1, 2]

    # Plausibility constraints:
    # 1. Scale should be reasonable for same-sensor or similar satellite images (0.5 to 2.0)
    # 2. Translation should not shift the entire image outside the frame
    if scale < 0.5 or scale > 2.0 or abs(tx) > ref_w * 0.8 or abs(ty) > ref_h * 0.8:
        fallback_target, status_type, msg = _fallback_resize_or_identity(ref_bgr, target_bgr)
        return fallback_target, AlignmentInfo(
            status=status_type,
            method="IMPLAUSIBLE_TRANSFORMATION_FALLBACK",
            inliers=inliers_count,
            matches_found=total_good,
            message=f"Computed transformation was physically implausible (scale={scale:.2f}, tx={tx:.1f}, ty={ty:.1f}). {msg}"
        )

    # Warp comparison image into reference geometry
    aligned_bgr = cv2.warpAffine(
        target_bgr,
        transform_matrix,
        (ref_w, ref_h),
        flags=cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_REFLECT101
    )

    return aligned_bgr, AlignmentInfo(
        status="aligned",
        method="ORB_RANSAC_AFFINE_2D",
        inliers=inliers_count,
        matches_found=total_good,
        message=f"Successfully registered images using ORB feature matching with RANSAC affine alignment ({inliers_count} verified inliers, scale={scale:.2f})."
    )


def _fallback_resize_or_identity(
    ref_bgr: np.ndarray,
    target_bgr: np.ndarray
) -> Tuple[np.ndarray, AlignmentStatusType, str]:
    """Helper for safe fallback geometry when registration fails or is bypassed."""
    ref_h, ref_w = ref_bgr.shape[:2]
    tgt_h, tgt_w = target_bgr.shape[:2]

    if (ref_h, ref_w) == (tgt_h, tgt_w):
        return target_bgr, "fallback_identity", "Fallback applied: images share identical dimensions, proceeding with original geometry."
    else:
        resized = cv2.resize(target_bgr, (ref_w, ref_h), interpolation=cv2.INTER_LINEAR)
        return resized, "fallback_resized", f"Fallback applied: comparison image resized from {tgt_w}x{tgt_h} to reference dimensions {ref_w}x{ref_h}."
