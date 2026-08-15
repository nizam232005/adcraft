"""Creator Discovery — Add new user fields, direct_messages and saved_creators tables

Revision ID: 002
Revises: 001
Create Date: 2026-08-09
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Extend users table with creator discovery columns ──────────────────
    with op.batch_alter_table("users") as batch_op:
        batch_op.add_column(sa.Column("cover_image", sa.String(500), nullable=True))
        batch_op.add_column(sa.Column("location", sa.String(150), nullable=True))
        batch_op.add_column(sa.Column("languages", sa.Text(), nullable=True))
        batch_op.add_column(sa.Column("niche", sa.String(100), nullable=True))
        batch_op.add_column(sa.Column("is_available_for_work", sa.Boolean(), nullable=True, server_default="1"))
        batch_op.add_column(sa.Column("social_instagram", sa.String(255), nullable=True))
        batch_op.add_column(sa.Column("social_tiktok", sa.String(255), nullable=True))
        batch_op.add_column(sa.Column("social_youtube", sa.String(255), nullable=True))
        batch_op.add_column(sa.Column("pricing_info", sa.Text(), nullable=True))
        batch_op.add_column(sa.Column("rating", sa.Float(), nullable=True))
        batch_op.add_column(sa.Column("experience_years", sa.Integer(), nullable=True))

    # ── Direct messages table ──────────────────────────────────────────────
    op.create_table(
        "direct_messages",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("sender_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("receiver_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_dm_id", "direct_messages", ["id"])
    op.create_index("ix_dm_sender_id", "direct_messages", ["sender_id"])
    op.create_index("ix_dm_receiver_id", "direct_messages", ["receiver_id"])

    # ── Saved creators table ───────────────────────────────────────────────
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
    op.drop_table("saved_creators")
    op.drop_table("direct_messages")
    with op.batch_alter_table("users") as batch_op:
        for col in [
            "cover_image", "location", "languages", "niche", "is_available_for_work",
            "social_instagram", "social_tiktok", "social_youtube", "pricing_info",
            "rating", "experience_years",
        ]:
            batch_op.drop_column(col)
