# Smart Query Routing System

One centralized FastAPI backend serving 4 role portals (Student, Instructor, HOD, Admin) and 2 no-UI ingestion channels (Gmail and WhatsApp via n8n).

Based on the SRS (FR-01 to FR-15, UC-01 to UC-19) and SDD v1.1 described in [Smart Query Routing — Developer Document.md](docs/Smart%20Query%20Routing%20%E2%80%94%20Developer%20Document.md).

---

## 📁 Repository Layout

```text
fyp-project/
├── backend/              FastAPI app + SQLAlchemy + Alembic + SQLite/Postgres
│   ├── app/
│   │   ├── main.py       FastAPI app, CORS, error handlers, /health
│   │   ├── core/         config, security, deps, custom errors
│   │   ├── db/           session, declarative base, seed, alembic migrations
│   │   ├── models/       14 SQLAlchemy models for all SRS tables
│   │   ├── schemas/      Pydantic request & response models
│   │   ├── services/     single-entry ingestion, routing, reply
│   │   └── api/v1/       all 46 REST endpoints & internal webhooks
│   ├── alembic.ini       Alembic database migrations configuration
│   └── requirements.txt  Backend Python dependencies
├── frontend/             Vite + React 19 app with 4 role-based portals
│   ├── src/
│   │   ├── portals/      Student, Instructor, HOD, Admin portals
│   │   ├── components/   query thread, AI draft panel, reply editor, layout
│   │   ├── api/          thin Axios API clients per backend router
│   │   └── features/auth Login with 1-click dev role switching
├── whatsapp-gateway/     Node + Baileys gateway HTTP service
├── n8n-workflows/        Exported workflow definitions (WF-1 to WF-4)
└── docs/                 SRS, SDD, and Developer Document
```

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# Run migrations & seed initial database (all 4 roles, depts, courses, rules)
python -m app.db.seed

# Start FastAPI server on port 8000
uvicorn app.main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
- App URL: `http://localhost:5173`
- Pre-seeded Test Accounts (1-click login available on Login page):
  - **Student**: `student1@university.edu.pk`
  - **Instructor**: `instructor.cs@university.edu.pk`
  - **HOD**: `hod.cs@university.edu.pk`
  - **Admin**: `admin@university.edu.pk`

---

## 🛡️ Enforced Roles & Architecture

| Surface | Role | Key Capabilities |
|---|---|---|
| **Student Portal** | `student` | Submit query (web form), track live status, query thread, student appeal, close query, announcements |
| **Instructor Portal** | `instructor` | Assigned query queue, AI draft suggestion panel, draft/send response, availability & auto-reply |
| **HOD Portal** | `hod` | Department overview KPIs, department queries, courses & faculty assignment, SLA escalations & overrides, report export |
| **Admin Portal** | `admin` | Full analytics with Recharts, all queries, departments & courses CRUD, users & roles, keyword routing rules editor, broadcast announcements, audit logs |
