"""Initial migration — Create all tables

Revision ID: 001
Revises: None
Create Date: 2026-08-05
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    existing_tables = inspector.get_table_names()

    # Users table
    if "users" not in existing_tables:
        op.create_table(
            "users",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("name", sa.String(100), nullable=False),
            sa.Column("email", sa.String(255), unique=True, nullable=False),
            sa.Column("password_hash", sa.String(255), nullable=False),
            sa.Column("role", sa.String(20), nullable=False),
            sa.Column("profile_image", sa.String(500), nullable=True),
            sa.Column("bio", sa.Text(), nullable=True),
            sa.Column("skills", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )
        op.create_index("ix_users_id", "users", ["id"])
        op.create_index("ix_users_email", "users", ["email"])

    # Projects table
    if "projects" not in existing_tables:
        op.create_table(
            "projects",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("owner_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("title", sa.String(255), nullable=False),
            sa.Column("product_name", sa.String(255), nullable=False),
            sa.Column("description", sa.Text(), nullable=False),
            sa.Column("target_audience", sa.String(255), nullable=True),
            sa.Column("platform", sa.String(50), nullable=False),
            sa.Column("budget", sa.Float(), nullable=False),
            sa.Column("deadline", sa.DateTime(timezone=True), nullable=True),
            sa.Column("reference_image_url", sa.String(500), nullable=True),
            sa.Column("status", sa.String(30), nullable=False, server_default="open"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )
        op.create_index("ix_projects_id", "projects", ["id"])
        op.create_index("ix_projects_owner_id", "projects", ["owner_id"])

    # Applications table
    if "applications" not in existing_tables:
        op.create_table(
            "applications",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("project_id", sa.Integer(), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
            sa.Column("creator_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("proposal", sa.Text(), nullable=False),
            sa.Column("delivery_days", sa.Integer(), nullable=False),
            sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )
        op.create_index("ix_applications_id", "applications", ["id"])
        op.create_index("ix_applications_project_id", "applications", ["project_id"])
        op.create_index("ix_applications_creator_id", "applications", ["creator_id"])

    # Messages table
    if "messages" not in existing_tables:
        op.create_table(
            "messages",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("project_id", sa.Integer(), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
            sa.Column("sender_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("message", sa.Text(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )
        op.create_index("ix_messages_id", "messages", ["id"])
        op.create_index("ix_messages_project_id", "messages", ["project_id"])

    # Portfolios table
    if "portfolios" not in existing_tables:
        op.create_table(
            "portfolios",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("creator_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("title", sa.String(255), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("media_url", sa.String(500), nullable=False),
            sa.Column("media_type", sa.String(20), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )
        op.create_index("ix_portfolios_id", "portfolios", ["id"])
        op.create_index("ix_portfolios_creator_id", "portfolios", ["creator_id"])

    # Submissions table
    if "submissions" not in existing_tables:
        op.create_table(
            "submissions",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("application_id", sa.Integer(), sa.ForeignKey("applications.id", ondelete="CASCADE"), nullable=False),
            sa.Column("media_url", sa.String(500), nullable=False),
            sa.Column("media_type", sa.String(20), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )
        op.create_index("ix_submissions_id", "submissions", ["id"])
        op.create_index("ix_submissions_application_id", "submissions", ["application_id"])


def downgrade() -> None:
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    existing_tables = inspector.get_table_names()

    for table in ["submissions", "portfolios", "messages", "applications", "projects", "users"]:
        if table in existing_tables:
            op.drop_table(table)

