"""
Submissions Router — Creator work submissions (upload files to Cloudinary).
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from database import get_db
from models.submission import Submission
from models.application import Application
from models.project import Project
from models.user import User
from schemas.submission import SubmissionResponse
from auth import get_current_user
from services.cloudinary_service import upload_file

router = APIRouter(prefix="/api/submissions", tags=["Submissions"])


@router.post("/", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
async def create_submission(
    application_id: int = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit work for an accepted application (upload file to Cloudinary)."""
    # Verify application exists and belongs to current user
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.creator_id == current_user.id,
    ).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    if application.status != "accepted":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only submit work for accepted applications",
        )

    # Determine media type
    content_type = file.content_type or ""
    if content_type.startswith("video"):
        media_type = "video"
        resource_type = "video"
    else:
        media_type = "image"
        resource_type = "image"

    # Upload to Cloudinary
    media_url = await upload_file(file, folder="adcraft/submissions", resource_type=resource_type)

    submission = Submission(
        application_id=application_id,
        media_url=media_url,
        media_type=media_type,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return SubmissionResponse.model_validate(submission)


@router.get("/application/{application_id}", response_model=list[SubmissionResponse])
def get_submissions(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all submissions for an application."""
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    # Allow the creator or the project owner to view submissions
    project = db.query(Project).filter(Project.id == application.project_id).first()
    if current_user.id != application.creator_id and current_user.id != project.owner_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    submissions = db.query(Submission).filter(
        Submission.application_id == application_id
    ).order_by(Submission.created_at.desc()).all()
    return [SubmissionResponse.model_validate(s) for s in submissions]
