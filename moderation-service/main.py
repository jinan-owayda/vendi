import os
import torch
import logging
from contextlib import asynccontextmanager
from PIL import Image
from transformers import ShieldGemma2Processor, ShieldGemma2ForImageClassification
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Model globals ─────────────────────────────────────────────────────────────
MODEL_ID = "google/shieldgemma-2-4b-it"
model: ShieldGemma2ForImageClassification | None = None
processor: ShieldGemma2Processor | None = None

# Threshold above which a category is considered violated
VIOLATION_THRESHOLD = 0.5

# ── Policies checked against the image ───────────────────────────────────────
IMAGE_POLICIES = {
    "sexually_explicit": (
        "The image shall not contain content that depicts explicit or graphic sexual acts "
        "(e.g., pornography, erotic nudity, depictions of rape or sexual assault)."
    ),
    "dangerous_content": (
        "The image shall not contain content that facilitates or encourages activities that "
        "could cause real-world harm (e.g., building firearms and explosive devices, promotion "
        "of terrorism, instructions for suicide)."
    ),
    "violence_gore": (
        "The image shall not contain content that depicts shocking, sensational, or gratuitous "
        "violence (e.g., excessive blood and gore, gratuitous violence against animals, extreme "
        "injury or moment of death)."
    ),
}

# Text-only safety keywords (lightweight guard when no vision model is needed)
TEXT_BLACKLIST_KEYWORDS = [
    "weapon", "explosive", "drug", "cocaine", "heroin", "bomb", "firearm",
    "pornography", "xxx", "adult content", "suicide", "terrorism",
]


# ── Lifespan: load model once at startup ─────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, processor

    logger.warning("ShieldGemma model loading is disabled on this laptop.")
    model = None
    processor = None

    yield



app = FastAPI(title="Product Moderation Service", lifespan=lifespan)


# ── Request / Response schemas ────────────────────────────────────────────────
class ProductModerationRequest(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    image_path: Optional[str] = None   # absolute path on disk sent by Laravel


class ProductModerationResponse(BaseModel):
    moderation_status: str   # "approved" | "rejected" | "pending"
    moderation_reason: Optional[str] = None


# ── Helpers ───────────────────────────────────────────────────────────────────
def check_text_safety(name: str, description: str, category: str) -> tuple[bool, str]:
    """
    Lightweight keyword scan on product text fields.
    Returns (is_safe, reason).
    """
    combined = " ".join(filter(None, [name, description, category])).lower()
    for kw in TEXT_BLACKLIST_KEYWORDS:
        if kw in combined:
            return False, f"Text contains prohibited keyword: '{kw}'"
    return True, ""


def check_image_safety(image: Image.Image) -> tuple[bool, str]:
    """
    Run ShieldGemma 2 against all three policies.
    Returns (is_safe, reason).
    """
    violations = []

    inputs = processor(images=[image], return_tensors="pt")

    if torch.cuda.is_available():
        inputs = {k: v.to(model.device) for k, v in inputs.items()}

    with torch.inference_mode():
        scores = model(**inputs)

    # Log the raw tensor shape to understand the output structure
    probs = scores.probabilities
    logger.info(f"Probabilities tensor shape: {probs.shape}, values: {probs}")

    # probs shape is [num_policies, 2] — index 0=Yes, 1=No per policy
    policy_names = list(IMAGE_POLICIES.keys())
    for i, policy_name in enumerate(policy_names):
        try:
            if probs.dim() == 3:
                # shape: [batch, num_policies, 2]
                yes_prob = probs[0][i][0].item()
            elif probs.dim() == 2:
                # shape: [num_policies, 2]
                yes_prob = probs[i][0].item()
            else:
                # scalar or 1-dim fallback
                yes_prob = probs.flatten()[0].item()
        except Exception as e:
            logger.error(f"Error reading prob for policy '{policy_name}': {e}")
            continue

        logger.info(f"Policy '{policy_name}': yes_prob={yes_prob:.4f}")

        if yes_prob >= VIOLATION_THRESHOLD:
            violations.append(policy_name.replace("_", " "))

    if violations:
        return False, "Image violates policies: " + ", ".join(violations)
    return True, ""



# ── Endpoint ──────────────────────────────────────────────────────────────────
@app.post("/moderate/product", response_model=ProductModerationResponse)
async def moderate_product(request: ProductModerationRequest):
    logger.info(f"Moderating product: '{request.name}'")

    # 1. Text safety check
    text_safe, text_reason = check_text_safety(
        request.name,
        request.description or "",
        request.category or "",
    )
    if not text_safe:
        return ProductModerationResponse(
            moderation_status="rejected",
            moderation_reason=text_reason,
        )

    # 2. Image safety check (only if a path was provided)
    if request.image_path:
        if not os.path.isfile(request.image_path):
            logger.warning(f"Image path not found: {request.image_path}")
            return ProductModerationResponse(
                moderation_status="pending",
                moderation_reason="Image file not found on server",
            )

        try:
            image = Image.open(request.image_path).convert("RGB")
        except Exception as e:
            logger.error(f"Failed to open image: {e}")
            return ProductModerationResponse(
                moderation_status="pending",
                moderation_reason="Could not read image file",
            )

        if model is None or processor is None:
            return ProductModerationResponse(
                moderation_status="pending",
                moderation_reason="Moderation model not loaded",
            )

        image_safe, image_reason = check_image_safety(image)
        if not image_safe:
            return ProductModerationResponse(
                moderation_status="rejected",
                moderation_reason=image_reason,
            )

    # 3. All checks passed
    return ProductModerationResponse(
        moderation_status="approved",
        moderation_reason=None,
    )


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": model is not None}