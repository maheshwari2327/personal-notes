# 📝 Personal Notes App

A clean, modern, single-user Personal Notes application built with **React (Vite)**, **FastAPI**, and **SQLAlchemy 2.0 ORM** with **SQLite**.

---

## 🏗️ Architecture & Layer Separation

This application is strictly structured into three distinct layers to ensure clean separation of concerns:

1. **Frontend UI Layer (`notes_app/frontend/`)**: Built with React (Vite) using functional components and hooks. Features a responsive split-pane layout (left: notes list & search, right: note viewer & editor).
2. **Backend API Layer (`notes_app/backend/main.py`, `notes_app/backend/schemas.py`)**: Powered by FastAPI and Pydantic models. Handles RESTful routing, input validation, HTTP status codes, and CORS.
3. **Database Layer (`notes_app/backend/database.py`, `notes_app/backend/models.py`)**: Uses SQLAlchemy 2.0 Declarative Base with a local SQLite database file (`notes.db`). Automatically seeds 4 sample records on first run.

```
notes_app/
├── backend/
│   ├── database.py       # [Database Layer] SQLite connection and session factory
│   ├── models.py         # [Database Layer] SQLAlchemy ORM Note table model
│   ├── schemas.py        # [Backend Layer] Pydantic schemas for validation & responses
│   ├── main.py           # [Backend Layer] FastAPI routes, CORS, search, and seeding
│   └── requirements.txt  # Pinned Python package dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── NoteList.jsx    # [Frontend Layer] Notes list, pin status, search box
│   │   │   └── NoteEditor.jsx  # [Frontend Layer] Note editor, color picker, delete dialog
│   │   ├── api.js              # [Frontend Layer] HTTP client communicating with backend
│   │   ├── App.jsx             # [Frontend Layer] State container and coordinator
│   │   ├── index.css           # [Frontend Layer] Design system and glassmorphic styles
│   │   └── main.jsx            # [Frontend Layer] React application entry mount point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md             # Documentation and setup instructions
```

---

## 🚀 Features

- **Split-Pane Workspace**: Left sidebar displays note titles and preview snippets; right side features the active note editor.
- **Create Note**: Quick "+ New Note" action with title and markdown/plain text content.
- **Edit & Save**: Real-time word and character counts, autosave indicators, and instant database updates.
- **Delete with Confirm Dialog**: Confirmation modal with danger safeguards to prevent accidental deletions.
- **Search Filtering**: Live search box filtering notes by title or content.
- **Stretch Goals Included**:
  - 📌 **Pin to Top**: Toggle pinned status to keep priority notes at the top of the list.
  - 🎨 **Color Tags**: Visual color swatches (Warm Amber, Sage Green, Indigo Blue, Rose Pink, Lilac, Sky Cyan) with accent border indicators.
  - ⚡ **Auto-Seeding**: Seeds 4 sample records on initial startup so the app is immediately populated.

---

## 📋 Data Model

The `Note` model represents entries in SQLite:

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `Integer` | Primary key (Auto-incrementing) |
| `title` | `String(200)` | Note title (Non-empty, validated) |
| `content` | `Text` | Note body or markdown notes |
| `color` | `String(20)` | Color tag hex code (Stretch goal, defaults to `#ffffff`) |
| `is_pinned` | `Boolean` | Pinned flag (Stretch goal, pinned notes sort first) |
| `created_at` | `DateTime` | Creation timestamp (UTC) |
| `updated_at` | `DateTime` | Last modified timestamp (UTC) |

---

## 🌐 API Endpoints & Status Codes

All API endpoints reside under `/api/notes`:

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/notes?search=` | Lists notes (pinned first, then latest updated). Supports search by title/content. | `200 OK` |
| **POST** | `/api/notes` | Creates a new note. Validates non-empty title. | `201 Created`, `400 Bad Request` |
| **GET** | `/api/notes/{id}` | Fetches a single note by ID. | `200 OK`, `404 Not Found` |
| **PUT** | `/api/notes/{id}` | Updates note title, content, color, or pin flag. | `200 OK`, `400 Bad Request`, `404 Not Found` |
| **DELETE** | `/api/notes/{id}` | Deletes a note by ID. | `200 OK`, `404 Not Found` |

### 📖 Auto-Generated Interactive API Documentation
FastAPI automatically generates interactive Swagger documentation and testing sandboxes:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc UI**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🛠️ Prerequisites

- **Python**: Version 3.10+ installed
- **Node.js**: Version 18+ and `npm` installed

---

## 💻 Installation & Running Locally

### Step 1: Start the Backend (FastAPI)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd notes_app/backend
   ```

2. (Optional but recommended) Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install the pinned dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI development server with hot reload:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

Backend will be live at: **`http://localhost:8000`**  
Interactive API docs: **`http://localhost:8000/docs`**

---

### Step 2: Start the Frontend (React + Vite)

1. Open a second terminal window and navigate to the frontend directory:
   ```bash
   cd notes_app/frontend
   ```

2. Install the pinned npm dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

The frontend will run at: **`http://localhost:5173`**

---

## 🖥️ Opening the Application

Open your browser and navigate to:
👉 **[http://localhost:5173](http://localhost:5173)**

CORS is configured on the FastAPI server to permit requests from `http://localhost:5173`.
