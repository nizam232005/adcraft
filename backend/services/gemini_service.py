"""
Gemini AI Service — Advertisement description generation.

Uses Google's Gemini API to generate ad copy based on
product name, target audience, and platform.
"""

import httpx
import json
from config import settings
from schemas.ai import AIDescriptionResponse


def _is_gemini_configured() -> bool:
    key = settings.GEMINI_API_KEY
    if not key or key in {"your-gemini-api-key", "your_gemini_api_key", "your_actual_gemini_api_key"}:
        return False
    return True


async def generate_ad_description(
    product_name: str,
    target_audience: str,
    platform: str,
) -> AIDescriptionResponse:
    """
    Call Gemini API to generate an advertisement description.

    Returns structured response with description, marketing_tone, and call_to_action.
    Falls back to a template if API key is not configured or request fails.
    """
    fallback_response = AIDescriptionResponse(
        description=(
            f"Introducing {product_name} — the perfect solution for {target_audience}. "
            f"Designed specifically for {platform}, this product delivers exceptional value "
            f"and outstanding results. Join thousands of satisfied customers today!"
        ),
        marketing_tone="Professional and engaging",
        call_to_action=f"Try {product_name} now and see the difference!",
    )

    if not _is_gemini_configured():
        return fallback_response


    prompt = f"""You are an expert marketing copywriter. Generate an advertisement description for the following:

Product Name: {product_name}
Target Audience: {target_audience}
Platform: {platform}

Respond ONLY with a valid JSON object (no markdown, no code blocks) with exactly these three keys:
- "description": A compelling advertisement description (2-3 paragraphs, optimized for {platform})
- "marketing_tone": The marketing tone used (e.g., "Professional", "Casual", "Urgent", etc.)
- "call_to_action": A strong call-to-action phrase

Example format:
{{"description": "...", "marketing_tone": "...", "call_to_action": "..."}}
"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.GEMINI_API_KEY}"

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            url,
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 1024,
                },
            },
        )

    if response.status_code != 200:
        raise Exception(f"Gemini API error: {response.status_code} - {response.text}")

    data = response.json()

    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        # Clean up potential markdown code blocks
        text = text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

        result = json.loads(text)
        return AIDescriptionResponse(
            description=result.get("description", ""),
            marketing_tone=result.get("marketing_tone", "Professional"),
            call_to_action=result.get("call_to_action", ""),
        )
    except (KeyError, json.JSONDecodeError) as e:
        # If parsing fails, return the raw text as description
        raw_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        return AIDescriptionResponse(
            description=raw_text or "Failed to generate description. Please try again.",
            marketing_tone="Professional",
            call_to_action=f"Discover {product_name} today!",
        )
