# ==============================================================================
# Layer: Backend API Layer
# File: main.py
# Responsibility: FastAPI entry point, CORS configuration, API route definitions,
#                 error handling, and database seeding on initial startup.
# ==============================================================================

from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_

import models
import schemas
from database import engine, get_db, SessionLocal


# ------------------------------------------------------------------------------
# Database Initialization & Seeding Helper
# ------------------------------------------------------------------------------
def seed_sample_notes():
    """
    Seeds the SQLite database with 4 initial sample notes on first application run
    so the user immediately sees working data.
    """
    db: Session = SessionLocal()
    try:
        # Check if any notes already exist in the database
        existing_count = db.query(models.Note).count()
        if existing_count == 0:
            sample_notes = [
                models.Note(
                    title="Welcome to Your Personal Notes!",
                    content=(
                        "Welcome to your personal notes app! Here you can:\n\n"
                        "- Create, edit, and organize notes seamlessly.\n"
                        "- Pin important notes to keep them right at the top.\n"
                        "- Use color tags to visually categorize your thoughts.\n"
                        "- Search across both titles and content quickly.\n\n"
                        "Feel free to edit this note or create a new one!"
                    ),
                    color="#fef3c7",  # Soft warm amber
                    is_pinned=True
                ),
                models.Note(
                    title="Weekend Grocery Checklist",
                    content=(
                        "Items to pick up from the farmer's market:\n"
                        "- Fresh sourdough bread\n"
                        "- Organic avocados & cherry tomatoes\n"
                        "- Oat milk & cold brew coffee\n"
                        "- Basil & olive oil for pesto\n"
                        "- Dark chocolate (85%)"
                    ),
                    color="#dcfce7",  # Soft sage green
                    is_pinned=False
                ),
                models.Note(
                    title="Project Ideas & Backlog",
                    content=(
                        "Brainstorming future creative apps:\n"
                        "1. Offline Markdown journal with end-to-end encryption\n"
                        "2. Minimalist Pomodoro timer with ambient sounds\n"
                        "3. Code snippet bookmark manager with tagging\n"
                        "4. Habit tracker with weekly visual heatmaps"
                    ),
                    color="#e0e7ff",  # Soft indigo blue
                    is_pinned=False
                ),
                models.Note(
                    title="Books to Read This Season",
                    content=(
                        "Recommendations from friends and podcasts:\n"
                        "1. 'Designing Data-Intensive Applications' by Martin Kleppmann\n"
                        "2. 'Atomic Habits' by James Clear\n"
                        "3. 'The Pragmatic Programmer' by Andrew Hunt & David Thomas"
                    ),
                    color="#fce7f3",  # Soft rose pink
                    is_pinned=False
                ),
            ]
            # Add all sample notes to the session and commit
            db.add_all(sample_notes)
            db.commit()
            print("Successfully seeded 4 sample notes into the database.")
    finally:
        db.close()


# ------------------------------------------------------------------------------
# FastAPI Lifespan (Startup & Shutdown)
# ------------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager:
    - Runs upon startup: creates database tables and seeds initial notes.
    - Yields control to handle incoming HTTP requests.
    """
    # Create all tables defined in models.py if they don't already exist
    models.Base.metadata.create_all(bind=engine)
    # Seed sample notes on first run
    seed_sample_notes()
    yield


# Initialize FastAPI application with informative metadata for auto-generated /docs
app = FastAPI(
    title="Personal Notes API",
    description=(
        "FastAPI backend for the Personal Notes app. "
        "Provides full CRUD operations, full-text search, pinning, and color coding. "
        "Interactive API documentation is automatically generated by FastAPI at /docs."
    ),
    version="1.0.0",
    lifespan=lifespan
)


# ------------------------------------------------------------------------------
# CORS Middleware Configuration
# ------------------------------------------------------------------------------
# Required to allow frontend running at http://localhost:5173 to communicate with API
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------------------
# Custom Exception Handler for Validation Errors (Returns HTTP 400)
# ------------------------------------------------------------------------------
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    """
    Transforms Pydantic validation errors into standard HTTP 400 Bad Request responses
    with clean, beginner-friendly error messages.
    """
    error_details = []
    for err in exc.errors():
        field_name = " -> ".join(str(loc) for loc in err["loc"] if loc != "body")
        error_details.append(f"{field_name}: {err['msg']}")

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "detail": "Invalid input provided.",
            "errors": error_details
        }
    )


# ------------------------------------------------------------------------------
# API Endpoints
# ------------------------------------------------------------------------------

@app.get(
    "/api/notes",
    response_model=List[schemas.NoteResponse],
    status_code=status.HTTP_200_OK,
    summary="List or search notes",
    description="Retrieve all notes, ordered by pinned notes first then last updated. Optionally filter by search query."
)
def get_notes(
    search: Optional[str] = Query(None, description="Search keyword matching title or content"),
    db: Session = Depends(get_db)
):
    """
    Fetch all notes from SQLite.
    If 'search' parameter is supplied, filters notes where title OR content contains the query.
    Results are sorted with pinned notes first, then most recently updated notes.
    """
    query = db.query(models.Note)

    # Apply search filter if user entered search text
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                models.Note.title.ilike(term),
                models.Note.content.ilike(term)
            )
        )

    # Sort: pinned notes first (True before False), then most recently updated
    notes = query.order_by(
        models.Note.is_pinned.desc(),
        models.Note.updated_at.desc()
    ).all()

    return notes


@app.post(
    "/api/notes",
    response_model=schemas.NoteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new note",
    description="Validate input and create a new note record. Returns 201 Created with note details."
)
def create_note(
    note_in: schemas.NoteCreate,
    db: Session = Depends(get_db)
):
    """
    Creates a new note after validating the title and content.
    Returns HTTP 201 Created with the saved note.
    """
    # Double check title is not empty (also validated by Pydantic schema)
    if not note_in.title or not note_in.title.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Note title cannot be empty."
        )

    now = datetime.now(timezone.utc)
    new_note = models.Note(
        title=note_in.title.strip(),
        content=note_in.content or "",
        color=note_in.color or "#ffffff",
        is_pinned=bool(note_in.is_pinned),
        created_at=now,
        updated_at=now
    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note


@app.get(
    "/api/notes/{id}",
    response_model=schemas.NoteResponse,
    status_code=status.HTTP_200_OK,
    summary="Get single note by ID",
    description="Fetch a note by its primary key ID. Returns 404 if not found."
)
def get_note_by_id(
    id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieves a single note by ID.
    Returns HTTP 404 Not Found if the note does not exist.
    """
    note = db.query(models.Note).filter(models.Note.id == id).first()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with ID {id} was not found."
        )
    return note


@app.put(
    "/api/notes/{id}",
    response_model=schemas.NoteResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a note",
    description="Update an existing note's title, content, color, or pinned status. Returns 404 if not found."
)
def update_note(
    id: int,
    note_update: schemas.NoteUpdate,
    db: Session = Depends(get_db)
):
    """
    Updates an existing note record in SQLite.
    Validates updated fields and returns the updated note.
    """
    db_note = db.query(models.Note).filter(models.Note.id == id).first()
    if not db_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with ID {id} was not found."
        )

    # Validate title if provided
    if note_update.title is not None:
        trimmed_title = note_update.title.strip()
        if not trimmed_title:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Note title cannot be blank."
            )
        db_note.title = trimmed_title

    # Update content if provided
    if note_update.content is not None:
        db_note.content = note_update.content

    # Update color tag if provided
    if note_update.color is not None:
        db_note.color = note_update.color

    # Update pinned flag if provided
    if note_update.is_pinned is not None:
        db_note.is_pinned = note_update.is_pinned

    # Always bump the updated_at timestamp upon save
    db_note.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(db_note)

    return db_note


@app.delete(
    "/api/notes/{id}",
    response_model=schemas.MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete a note",
    description="Deletes a note by its ID. Returns 200 with confirmation message, or 404 if not found."
)
def delete_note(
    id: int,
    db: Session = Depends(get_db)
):
    """
    Deletes the note with the given ID from the SQLite database.
    Returns HTTP 200 with confirmation message or HTTP 404 if not found.
    """
    db_note = db.query(models.Note).filter(models.Note.id == id).first()
    if not db_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with ID {id} was not found."
        )

    db.delete(db_note)
    db.commit()

    return {
        "message": f"Note #{id} successfully deleted.",
        "id": id
    }
