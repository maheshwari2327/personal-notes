# ==============================================================================
# Layer: Database Layer
# File: database.py
# Responsibility: Handles SQLite database connection, engine initialization,
#                 session management, and SQLAlchemy Declarative Base.
# ==============================================================================

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# SQLite database file path stored locally in the backend directory
SQLALCHEMY_DATABASE_URL = "sqlite:///./notes.db"

# Create the SQLAlchemy engine.
# 'check_same_thread: False' is required for SQLite when accessed by multi-threaded FastAPI workers.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# SessionLocal is the factory for creating database sessions for incoming requests
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for all ORM models to inherit from
Base = declarative_base()

# FastAPI dependency that provides a database session per request and ensures clean disposal
def get_db():
    """
    Yields a database session to an API route handler, and closes it
    reliably when the request finishes or if an error occurs.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
