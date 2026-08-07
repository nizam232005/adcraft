"""
AI Router — Gemini-powered advertisement description generation.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from schemas.ai import AIDescriptionRequest, AIDescriptionResponse
from services.gemini_service import generate_ad_description
from auth import get_current_user
from models.user import User

router = APIRouter(prefix="/api/ai", tags=["AI"])


@router.post("/generate-description", response_model=AIDescriptionResponse)
async def generate_description(
    data: AIDescriptionRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Generate an advertisement description using Gemini AI.
    Returns description, marketing tone, and suggested call-to-action.
    """
    try:
        result = await generate_ad_description(
            product_name=data.product_name,
            target_audience=data.target_audience,
            platform=data.platform,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI generation failed: {str(e)}",
        )
