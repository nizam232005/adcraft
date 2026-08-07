"""
Messages Router — Simple CRUD messaging per project.
No WebSockets — messages refresh on page reload.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.message import Message
from models.project import Project
from models.user import User
from schemas.message import MessageCreate, MessageResponse
from auth import get_current_user

router = APIRouter(prefix="/api/messages", tags=["Messages"])


@router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def send_message(
    data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send a message in a project chat."""
    # Verify project exists
    project = db.query(Project).filter(Project.id == data.project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    message = Message(
        project_id=data.project_id,
        sender_id=current_user.id,
        message=data.message,
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    resp = MessageResponse.model_validate(message)
    resp.sender_name = current_user.name
    resp.sender_image = current_user.profile_image
    return resp


@router.get("/project/{project_id}", response_model=list[MessageResponse])
def get_project_messages(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all messages for a project chat."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    messages = db.query(Message).filter(
        Message.project_id == project_id
    ).order_by(Message.created_at.asc()).all()

    result = []
    for msg in messages:
        sender = db.query(User).filter(User.id == msg.sender_id).first()
        resp = MessageResponse.model_validate(msg)
        if sender:
            resp.sender_name = sender.name
            resp.sender_image = sender.profile_image
        result.append(resp)
    return result
