# ==============================================================================
# Layer: Backend API Layer
# File: schemas.py
# Responsibility: Defines Pydantic data models for request payload validation
#                 and API response serialization.
# ==============================================================================

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator

class NoteBase(BaseModel):
    """
    Base schema shared across note creation, updating, and responses.
    Provides standard validation constraints.
    """
    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="The title of the note (cannot be empty)."
    )
    content: Optional[str] = Field(
        default="",
        description="The markdown or plain text body of the note."
    )
    color: Optional[str] = Field(
        default="#ffffff",
        description="Hex color code tag for the note visual card."
    )
    is_pinned: Optional[bool] = Field(
        default=False,
        description="Whether the note should be pinned to the top of the list."
    )

    @field_validator("title")
    @classmethod
    def validate_title_not_empty(cls, value: str) -> str:
        """
        Validates that the title is not merely blank whitespace.
        Raises ValueError if invalid, resulting in HTTP 400/422 status.
        """
        stripped = value.strip()
        if not stripped:
            raise ValueError("Title must not be empty or blank whitespace.")
        return stripped


class NoteCreate(NoteBase):
    """
    Schema for creating a new note via POST /api/notes.
    Inherits all required fields and validations from NoteBase.
    """
    pass


class NoteUpdate(BaseModel):
    """
    Schema for updating an existing note via PUT /api/notes/{id}.
    Allows partial updates; any provided fields are validated.
    """
    title: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=200,
        description="Updated note title."
    )
    content: Optional[str] = Field(
        default=None,
        description="Updated note content."
    )
    color: Optional[str] = Field(
        default=None,
        description="Updated color tag."
    )
    is_pinned: Optional[bool] = Field(
        default=None,
        description="Updated pinned status."
    )

    @field_validator("title")
    @classmethod
    def validate_optional_title(cls, value: Optional[str]) -> Optional[str]:
        """
        If title is provided in update, ensure it is not empty whitespace.
        """
        if value is not None:
            stripped = value.strip()
            if not stripped:
                raise ValueError("Title must not be empty or blank whitespace.")
            return stripped
        return value


class NoteResponse(NoteBase):
    """
    Schema for returning note data in API responses.
    Includes database-generated fields like id and timestamps.
    """
    id: int
    created_at: datetime
    updated_at: datetime

    # Pydantic V2 configuration to serialize from SQLAlchemy ORM objects
    model_config = ConfigDict(from_attributes=True)


class MessageResponse(BaseModel):
    """
    Standard schema for deletion or informational API responses.
    """
    message: str
    id: Optional[int] = None
