"""
Direct Messages Router — User-to-user DMs with WebSocket real-time support.
Completely separate from the existing project-based messaging system.
"""

import json
from typing import Dict, List
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from database import get_db
from models.direct_message import DirectMessage
from models.user import User
from schemas.direct_message import DirectMessageCreate, DirectMessageResponse, ConversationSummary
from auth import get_current_user, create_access_token
from jose import JWTError, jwt
from config import settings

router = APIRouter(prefix="/api/dm", tags=["Direct Messages"])

# ─── WebSocket Connection Manager ─────────────────────────────────────────────

class ConnectionManager:
    """Manages active WebSocket connections keyed by user_id."""
    def __init__(self):
        self.active: Dict[int, List[WebSocket]] = {}

    async def connect(self, user_id: int, ws: WebSocket):
        await ws.accept()
        self.active.setdefault(user_id, []).append(ws)

    def disconnect(self, user_id: int, ws: WebSocket):
        if user_id in self.active:
            self.active[user_id] = [c for c in self.active[user_id] if c != ws]

    async def send_to_user(self, user_id: int, data: dict):
        """Send a JSON payload to all active connections for a user."""
        for ws in self.active.get(user_id, []):
            try:
                await ws.send_text(json.dumps(data))
            except Exception:
                pass


manager = ConnectionManager()


# ─── REST Endpoints ────────────────────────────────────────────────────────────

@router.get("/conversations", response_model=list[ConversationSummary])
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all DM conversations for the current user (inbox view)."""
    # Find all users this person has exchanged messages with
    sent = db.query(DirectMessage.receiver_id).filter(DirectMessage.sender_id == current_user.id)
    received = db.query(DirectMessage.sender_id).filter(DirectMessage.receiver_id == current_user.id)
    other_ids = {row[0] for row in sent.all()} | {row[0] for row in received.all()}

    result = []
    for other_id in other_ids:
        other_user = db.query(User).filter(User.id == other_id).first()
        if not other_user:
            continue

        # Last message in this thread
        last_msg = (
            db.query(DirectMessage)
            .filter(
                or_(
                    and_(DirectMessage.sender_id == current_user.id, DirectMessage.receiver_id == other_id),
                    and_(DirectMessage.sender_id == other_id, DirectMessage.receiver_id == current_user.id),
                )
            )
            .order_by(DirectMessage.created_at.desc())
            .first()
        )
        if not last_msg:
            continue

        unread_count = (
            db.query(func.count(DirectMessage.id))
            .filter(
                DirectMessage.sender_id == other_id,
                DirectMessage.receiver_id == current_user.id,
                DirectMessage.is_read == False,
            )
            .scalar()
        )

        result.append(
            ConversationSummary(
                other_user_id=other_id,
                other_user_name=other_user.name,
                other_user_image=other_user.profile_image,
                other_user_role=other_user.role,
                last_message=last_msg.content[:80],
                last_message_at=last_msg.created_at,
                unread_count=unread_count or 0,
            )
        )

    # Sort by last message date
    result.sort(key=lambda x: x.last_message_at, reverse=True)
    return result


@router.get("/thread/{other_user_id}", response_model=list[DirectMessageResponse])
def get_thread(
    other_user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all messages in a DM thread with another user. Marks received messages as read."""
    other = db.query(User).filter(User.id == other_user_id).first()
    if not other:
        raise HTTPException(status_code=404, detail="User not found")

    # Mark incoming messages as read
    db.query(DirectMessage).filter(
        DirectMessage.sender_id == other_user_id,
        DirectMessage.receiver_id == current_user.id,
        DirectMessage.is_read == False,
    ).update({"is_read": True})
    db.commit()

    messages = (
        db.query(DirectMessage)
        .filter(
            or_(
                and_(DirectMessage.sender_id == current_user.id, DirectMessage.receiver_id == other_user_id),
                and_(DirectMessage.sender_id == other_user_id, DirectMessage.receiver_id == current_user.id),
            )
        )
        .order_by(DirectMessage.created_at.asc())
        .all()
    )

    result = []
    for msg in messages:
        sender = db.query(User).filter(User.id == msg.sender_id).first()
        receiver = db.query(User).filter(User.id == msg.receiver_id).first()
        resp = DirectMessageResponse.model_validate(msg)
        if sender:
            resp.sender_name = sender.name
            resp.sender_image = sender.profile_image
        if receiver:
            resp.receiver_name = receiver.name
            resp.receiver_image = receiver.profile_image
        result.append(resp)
    return result


@router.post("/send", response_model=DirectMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    data: DirectMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send a DM to another user. Pushes real-time notification via WebSocket."""
    receiver = db.query(User).filter(User.id == data.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Recipient not found")
    if data.receiver_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot message yourself")

    msg = DirectMessage(
        sender_id=current_user.id,
        receiver_id=data.receiver_id,
        content=data.content,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    resp = DirectMessageResponse.model_validate(msg)
    resp.sender_name = current_user.name
    resp.sender_image = current_user.profile_image
    resp.receiver_name = receiver.name
    resp.receiver_image = receiver.profile_image

    # Push to receiver's WebSocket if online
    await manager.send_to_user(
        data.receiver_id,
        {
            "type": "new_message",
            "message": {
                "id": msg.id,
                "sender_id": current_user.id,
                "sender_name": current_user.name,
                "sender_image": current_user.profile_image,
                "content": msg.content,
                "created_at": msg.created_at.isoformat(),
            },
        },
    )
    return resp


@router.get("/unread-count")
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Total unread DM count for the notification badge."""
    count = (
        db.query(func.count(DirectMessage.id))
        .filter(
            DirectMessage.receiver_id == current_user.id,
            DirectMessage.is_read == False,
        )
        .scalar()
    )
    return {"unread_count": count or 0}


# ─── WebSocket Endpoint ────────────────────────────────────────────────────────

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    """
    WebSocket endpoint for real-time DMs.
    Client connects with: ws://host/api/dm/ws?token=<jwt>
    Receives JSON: { type: 'new_message', message: {...} }
    Sends JSON:    { type: 'typing', to_user_id: int }
    """
    # Validate JWT
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = int(payload.get("sub"))
    except (JWTError, TypeError, ValueError):
        await websocket.close(code=4001)
        return

    await manager.connect(user_id, websocket)
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
                if data.get("type") == "typing":
                    to_id = data.get("to_user_id")
                    if to_id:
                        user = db.query(User).filter(User.id == user_id).first()
                        await manager.send_to_user(
                            to_id,
                            {"type": "typing", "from_user_id": user_id, "from_user_name": user.name if user else ""},
                        )
            except (json.JSONDecodeError, Exception):
                pass
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
