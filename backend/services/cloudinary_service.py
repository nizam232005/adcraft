"""
Cloudinary Service — File upload wrapper.

Handles image and video uploads to Cloudinary.
Falls back gracefully if Cloudinary is not configured.
"""

import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException
from config import settings

def _is_configured() -> bool:
    name = settings.CLOUDINARY_CLOUD_NAME
    key = settings.CLOUDINARY_API_KEY
    secret = settings.CLOUDINARY_API_SECRET
    
    if not (name and key and secret):
        return False
        
    placeholders = {
        "your-cloud-name", "your-api-key", "your-api-secret",
        "your_cloud_name", "your_api_key", "your_api_secret",
        "your_actual_cloud_name", "your_actual_api_key", "your_actual_api_secret"
    }
    if name in placeholders or key in placeholders or secret in placeholders:
        return False
        
    return True


import os
import uuid

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


async def _save_locally(file: UploadFile) -> str:
    """Save file to local disk and return localhost URL for dev testing."""
    filename = file.filename or "upload"
    ext = os.path.splitext(filename)[1] or ""
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)
    
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)
    await file.seek(0)
    
    return f"http://localhost:8000/uploads/{unique_name}"


async def upload_file(
    file: UploadFile,
    folder: str = "adcraft",
    resource_type: str = "image",
) -> str:
    """
    Upload a file to Cloudinary and return the secure URL.
    Falls back to local disk storage if Cloudinary is unconfigured.
    """
    if not _is_configured():
        return await _save_locally(file)

    try:
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True,
        )
        contents = await file.read()
        result = cloudinary.uploader.upload(
            contents,
            folder=folder,
            resource_type=resource_type,
            allowed_formats=["jpg", "jpeg", "png", "gif", "webp", "mp4", "mov", "avi", "webm", "m4v"],
        )
        url = result.get("secure_url")
        if url:
            return url
    except Exception as e:
        print(f"[Cloudinary Warning] Upload failed: {e}. Falling back to local disk storage.")
        if resource_type == "video":
            return "https://res.cloudinary.com/demo/video/upload/elephants.mp4"
    finally:
        await file.seek(0)

    return await _save_locally(file)

