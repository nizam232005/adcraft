"""Creator Discovery — Add new user fields, direct_messages and saved_creators tables

Revision ID: 002
Revises: 001
Create Date: 2026-08-09
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    existing_tables = inspector.get_table_names()
    existing_columns = [col['name'] for col in inspector.get_columns('users')] if 'users' in existing_tables else []

    # ── Extend users table with creator discovery columns safely ──────────────
    new_user_columns = [
        ("cover_image", sa.String(500), None),
        ("location", sa.String(150), None),
        ("languages", sa.Text(), None),
        ("niche", sa.String(100), None),
        ("is_available_for_work", sa.Boolean(), sa.true()),
        ("social_instagram", sa.String(255), None),
        ("social_tiktok", sa.String(255), None),
        ("social_youtube", sa.String(255), None),
        ("pricing_info", sa.Text(), None),
        ("rating", sa.Float(), None),
        ("experience_years", sa.Integer(), None),
    ]

    with op.batch_alter_table("users") as batch_op:
        for name, col_type, default in new_user_columns:
            if name not in existing_columns:
                batch_op.add_column(sa.Column(name, col_type, nullable=True, server_default=default))

    # ── Direct messages table ──────────────────────────────────────────────
    if "direct_messages" not in existing_tables:
        op.create_table(
            "direct_messages",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("sender_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("receiver_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("content", sa.Text(), nullable=False),
            sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )
        op.create_index("ix_dm_id", "direct_messages", ["id"])
        op.create_index("ix_dm_sender_id", "direct_messages", ["sender_id"])
        op.create_index("ix_dm_receiver_id", "direct_messages", ["receiver_id"])

    # ── Saved creators table ───────────────────────────────────────────────
    if "saved_creators" not in existing_tables:
        op.create_table(
            "saved_creators",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("brand_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("creator_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.UniqueConstraint("brand_id", "creator_id", name="uq_saved_creator"),
        )
        op.create_index("ix_saved_creators_id", "saved_creators", ["id"])
        op.create_index("ix_saved_creators_brand_id", "saved_creators", ["brand_id"])
        op.create_index("ix_saved_creators_creator_id", "saved_creators", ["creator_id"])


def downgrade() -> None:
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    existing_tables = inspector.get_table_names()

    if "saved_creators" in existing_tables:
        op.drop_table("saved_creators")
    if "direct_messages" in existing_tables:
        op.drop_table("direct_messages")

    if "users" in existing_tables:
        existing_columns = [col['name'] for col in inspector.get_columns('users')]
        with op.batch_alter_table("users") as batch_op:
            for col in [
                "cover_image", "location", "languages", "niche", "is_available_for_work",
                "social_instagram", "social_tiktok", "social_youtube", "pricing_info",
                "rating", "experience_years",
            ]:
                if col in existing_columns:
                    batch_op.drop_column(col)

