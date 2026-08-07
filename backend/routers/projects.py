"""
Projects Router — CRUD operations for advertisement projects.

Includes search, filtering, sorting, and pagination.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from database import get_db
from models.project import Project
from models.application import Application
from models.user import User
from schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListResponse
from auth import get_current_user, require_role
from typing import Optional
import math

router = APIRouter(prefix="/api/projects", tags=["Projects"])


def _enrich_project(project: Project, db: Session) -> ProjectResponse:
    """Add computed fields to a project response."""
    app_count = db.query(func.count(Application.id)).filter(
        Application.project_id == project.id
    ).scalar()
    owner = db.query(User).filter(User.id == project.owner_id).first()
    resp = ProjectResponse.model_validate(project)
    resp.application_count = app_count
    resp.owner_name = owner.name if owner else None
    return resp


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    data: ProjectCreate,
    current_user: User = Depends(require_role("brand_owner")),
    db: Session = Depends(get_db),
):
    """Create a new advertisement project (Brand Owner only)."""
    project = Project(
        owner_id=current_user.id,
        title=data.title,
        product_name=data.product_name,
        description=data.description,
        target_audience=data.target_audience,
        platform=data.platform,
        budget=data.budget,
        deadline=data.deadline,
        reference_image_url=data.reference_image_url,
        status="open",
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return _enrich_project(project, db)


@router.get("/", response_model=ProjectListResponse)
def list_projects(
    keyword: Optional[str] = Query(None, description="Search keyword"),
    platform: Optional[str] = Query(None, description="Filter by platform"),
    min_budget: Optional[float] = Query(None, description="Minimum budget"),
    max_budget: Optional[float] = Query(None, description="Maximum budget"),
    sort: Optional[str] = Query("newest", description="Sort: newest, highest_budget, lowest_budget"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """List and search projects with filtering, sorting, and pagination."""
    query = db.query(Project)

    # Keyword search across title, description, product_name
    if keyword:
        search = f"%{keyword}%"
        query = query.filter(
            or_(
                Project.title.ilike(search),
                Project.description.ilike(search),
                Project.product_name.ilike(search),
            )
        )

    # Platform filter
    if platform:
        query = query.filter(Project.platform == platform.lower())

    # Budget range filter
    if min_budget is not None:
        query = query.filter(Project.budget >= min_budget)
    if max_budget is not None:
        query = query.filter(Project.budget <= max_budget)

    # Total count for pagination
    total = query.count()
    pages = math.ceil(total / limit) if total > 0 else 1

    # Sorting
    if sort == "highest_budget":
        query = query.order_by(Project.budget.desc())
    elif sort == "lowest_budget":
        query = query.order_by(Project.budget.asc())
    else:  # newest (default)
        query = query.order_by(Project.created_at.desc())

    # Pagination
    projects = query.offset((page - 1) * limit).limit(limit).all()

    return ProjectListResponse(
        projects=[_enrich_project(p, db) for p in projects],
        total=total,
        page=page,
        pages=pages,
    )


@router.get("/my", response_model=list[ProjectResponse])
def get_my_projects(
    current_user: User = Depends(require_role("brand_owner")),
    db: Session = Depends(get_db),
):
    """Get all projects owned by the current brand owner."""
    projects = db.query(Project).filter(
        Project.owner_id == current_user.id
    ).order_by(Project.created_at.desc()).all()
    return [_enrich_project(p, db) for p in projects]


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get a single project by ID."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return _enrich_project(project, db)


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    data: ProjectUpdate,
    current_user: User = Depends(require_role("brand_owner")),
    db: Session = Depends(get_db),
):
    """Update a project (owner only)."""
    project = db.query(Project).filter(
        Project.id == project_id, Project.owner_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project, key, value)

    db.commit()
    db.refresh(project)
    return _enrich_project(project, db)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    current_user: User = Depends(require_role("brand_owner")),
    db: Session = Depends(get_db),
):
    """Delete a project (owner only)."""
    project = db.query(Project).filter(
        Project.id == project_id, Project.owner_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    db.delete(project)
    db.commit()
