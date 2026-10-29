# ==============================================================================
# Layer: Database Layer
# File: models.py
# Responsibility: Defines the SQLAlchemy ORM models representing database tables.
# ==============================================================================

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from database import Base

class Note(Base):
    """
    SQLAlchemy ORM model for storing notes in the SQLite database.
    Represents the 'notes' table.
    """
    __tablename__ = "notes"

    # Primary key: Unique identifier for each note
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Note title (mandatory, indexed for efficient title lookups)
    title = Column(String(200), nullable=False, index=True)

    # Note content/body (can be long text or empty)
    content = Column(Text, default="", nullable=False)

    # Stretch Goal: Hex code for color coding notes (e.g. #fef3c7, #e0f2fe, #fce7f3)
    color = Column(String(20), default="#ffffff", nullable=False)

    # Stretch Goal: Pinned status to prioritize important notes at top of list
    is_pinned = Column(Boolean, default=False, nullable=False, index=True)

    # Timestamp when the note was initially created
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Timestamp when the note was last modified/saved
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    def __repr__(self):
        return f"<Note(id={self.id}, title='{self.title}', pinned={self.is_pinned})>"
