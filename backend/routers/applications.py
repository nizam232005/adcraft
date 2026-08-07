"""
Applications Router — Creator applications and status management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.application import Application
from models.project import Project
from models.user import User
from schemas.application import ApplicationCreate, ApplicationStatusUpdate, ApplicationResponse
from auth import get_current_user, require_role

router = APIRouter(prefix="/api/applications", tags=["Applications"])


def _enrich_application(app: Application, db: Session) -> ApplicationResponse:
    """Add creator and project info to application response."""
    creator = db.query(User).filter(User.id == app.creator_id).first()
    project = db.query(Project).filter(Project.id == app.project_id).first()
    resp = ApplicationResponse.model_validate(app)
    if creator:
        resp.creator_name = creator.name
        resp.creator_image = creator.profile_image
    if project:
        resp.project_title = project.title
        resp.project_budget = project.budget
        resp.project_platform = project.platform
    return resp


@router.post("/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    data: ApplicationCreate,
    current_user: User = Depends(require_role("creator")),
    db: Session = Depends(get_db),
):
    """Apply to a project (Creator only)."""
    # Check project exists and is open
    project = db.query(Project).filter(Project.id == data.project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if project.status != "open":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project is not accepting applications")

    # Check if already applied
    existing = db.query(Application).filter(
        Application.project_id == data.project_id,
        Application.creator_id == current_user.id,
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You have already applied to this project")

    application = Application(
        project_id=data.project_id,
        creator_id=current_user.id,
        proposal=data.proposal,
        delivery_days=data.delivery_days,
        status="pending",
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return _enrich_application(application, db)


@router.get("/my", response_model=list[ApplicationResponse])
def get_my_applications(
    current_user: User = Depends(require_role("creator")),
    db: Session = Depends(get_db),
):
    """Get all applications by the current creator."""
    apps = db.query(Application).filter(
        Application.creator_id == current_user.id
    ).order_by(Application.created_at.desc()).all()
    return [_enrich_application(a, db) for a in apps]


@router.get("/project/{project_id}", response_model=list[ApplicationResponse])
def get_project_applications(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all applications for a project (project owner or the applying creator)."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    # Allow project owner or creators who applied
    if current_user.role == "brand_owner" and project.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your project")

    if current_user.role == "creator":
        # Creators can only see their own applications
        apps = db.query(Application).filter(
            Application.project_id == project_id,
            Application.creator_id == current_user.id,
        ).order_by(Application.created_at.desc()).all()
    else:
        apps = db.query(Application).filter(
            Application.project_id == project_id
        ).order_by(Application.created_at.desc()).all()

    return [_enrich_application(a, db) for a in apps]


@router.put("/{application_id}/status", response_model=ApplicationResponse)
def update_application_status(
    application_id: int,
    data: ApplicationStatusUpdate,
    current_user: User = Depends(require_role("brand_owner")),
    db: Session = Depends(get_db),
):
    """Accept or reject an application (Brand Owner only)."""
    if data.status not in ("accepted", "rejected"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be 'accepted' or 'rejected'",
        )

    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    # Verify the current user owns the project
    project = db.query(Project).filter(
        Project.id == application.project_id,
        Project.owner_id == current_user.id,
    ).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your project")

    application.status = data.status
    db.commit()

    # If accepted, update project status to "in_progress"
    if data.status == "accepted":
        project.status = "in_progress"
        db.commit()

    db.refresh(application)
    return _enrich_application(application, db)
