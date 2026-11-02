# Smart Query Routing — Developer Document

Oct 18, 2026 · @Faria

One FastAPI backend serves all four role portals and both no-UI channels, so nothing is duplicated per frontend. The frontend is a single React app with four portals; email and WhatsApp reach the same ingestion service through n8n. This document is based on the SRS (FR-01 to FR-15, UC-01 to UC-19) and SDD v1.1, and lists where it adds to or corrects them (section 14).

## 1. Core decisions

| # | Decision | Why |
| --- | --- | --- |
| 1 | One FastAPI backend, one ingestion pipeline | Web, email and WhatsApp all end in `IngestionService.ingest()`. A new channel means a new adapter, not new routing or AI code. |
| 2 | One React app with four portals (Student, Instructor, HOD, Admin) | One login, shared components, one free Vercel deploy. Routes are guarded by role and lazy-loaded per portal. |
| 3 | Email and WhatsApp have no UI | n8n and a small Baileys gateway forward messages to the backend's `/internal` endpoints. |
| 4 | Roles are enforced in the backend | The frontend only hides menus. Every endpoint checks the JWT role plus ownership or department scope. |
| 5 | AI sits behind one interface | Gemini first, Claude as fallback, keyword rules as last resort. Low confidence goes to HOD review. |
| 6 | Escalation runs from a cron call | n8n calls `/internal/jobs/escalate` every 10 minutes. It also wakes a sleeping free-tier Render service. |

## 2. System map

&#91;embedded content: architecture · 4 portals, 2 channels, 1 backend\]

Portals call `/api/v1` with a JWT. Email and WhatsApp reach `/internal` through n8n with a service key. Both paths meet in `IngestionService`, so routing, AI and notifications exist only once.

## 3. Frontends inventory

There are four screen-based frontends and two channels without a UI: six entry points, one backend. The Student portal is also the "web form" channel from the SDD.

| Surface | Used by | What it does | Enters the backend via | SRS |
| --- | --- | --- | --- | --- |
| Student portal | Students | Google login, submit query (web form with attachments), My Queries with live status, query thread, notifications, announcements, profile | `/api/v1` + JWT | UC-01, 02, 05, 06; FR-01, 02, 03, 08, 09 |
| Instructor portal | Instructors | Assigned queries, query detail with AI draft editor, send or save reply, availability and auto-reply, notifications | `/api/v1` + JWT | UC-07 to 10; FR-02, 05, 06, 07, 08 |
| HOD portal | HODs | Department overview, department queries, courses and instructor assignment, escalations (reassign, override), follow-up on resolved queries, reports | `/api/v1` + JWT | UC-11 to 15; FR-09, 10, 11, 14 |
| Admin portal | Admins | Analytics, all queries, departments and courses, users and roles, routing rules, announcements, audit logs, reports | `/api/v1` + JWT | UC-16 to 19; FR-02, 04, 05, 12 to 15 |
| Email channel (no UI) | Students, staff | n8n polls Gmail and forwards each mail; replies go out through the Gmail API | `/internal/channels/email` + service key | UC-02; FR-03 |
| WhatsApp channel (no UI) | Students | Baileys gateway sends inbound messages to n8n, which forwards them; replies go out through the gateway | `/internal/channels/whatsapp` + service key | UC-02, 05; FR-03, 08 |

## 4. Backend architecture

The backend has four layers: routers (HTTP only), services (business rules), repositories (database access) and adapters (AI, Gmail, WhatsApp, storage). Routers never contain logic and services never import FastAPI, so each service can be unit-tested alone.

### 4.1 SDD classes mapped to modules

| SDD class | Module | Notes |
| --- | --- | --- |
| User, Admin, Instructor, HOD | `models/user.py` | One `users` table with a `role` enum. Role checks use `require_role()`, not Python subclasses. |
| QueryProcessor | `services/ingestion_service.py`, `classification_service.py` | `classifyQuery()` and `routeQuery()` live here. |
| AIEngine | `ai/engine.py`, `ai/providers/*` | `callAPI()` and `parseResponse()` split into provider and parser. |
| RoutingEngine | `services/routing_service.py` | Department, then course, then instructor, with availability fallback. |
| EmailGenerator | `services/reply_service.py`, `integrations/gmail_client.py` | Drafts, acknowledgements, sending. |
| NotificationService | `services/notification_service.py` | Dashboard, Gmail and WhatsApp, with one retry after 5 minutes. |
| Course.getInstructor | `repositories/course_repo.py` | Resolves the instructor from the database, never from the AI. |

### 4.2 Repository layout

```text
smart-query-routing/
├── backend/              FastAPI app (Render)
├── frontend/             React app (Vercel)
├── whatsapp-gateway/     Node + Baileys, small HTTP service
├── n8n-workflows/        exported workflow JSON files
└── docs/                 SRS, SDD, this document
```

```text
backend/
├── app/
│   ├── main.py                    app, CORS, router include, error handlers
│   ├── core/
│   │   ├── config.py              settings from .env (pydantic-settings)
│   │   ├── security.py            JWT create/verify, Google token verify
│   │   ├── deps.py                get_db, get_current_user, require_role(...)
│   │   └── errors.py              AppError types mapped to HTTP codes
│   ├── db/
│   │   ├── session.py             engine, SessionLocal
│   │   ├── base.py                declarative Base
│   │   └── migrations/            Alembic
│   ├── models/                    user, department, course, query, route, reply,
│   │                              ai_draft, email, attachment, notification,
│   │                              announcement, routing_rule, escalation, audit_log
│   ├── schemas/                   Pydantic request/response models
│   ├── repositories/              DB access only, one file per model
│   ├── services/
│   │   ├── ingestion_service.py   THE single entry for all channels
│   │   ├── query_service.py       status changes, tracking, history
│   │   ├── classification_service.py   calls AI, applies confidence threshold
│   │   ├── routing_service.py     dept > course > instructor, fallback
│   │   ├── reply_service.py       drafts, send reply, ack, auto-reply
│   │   ├── notification_service.py
│   │   ├── escalation_service.py  24-hour SLA
│   │   ├── announcement_service.py
│   │   ├── analytics_service.py
│   │   ├── report_service.py      PDF and Excel export
│   │   ├── auth_service.py
│   │   └── audit_service.py
│   ├── ai/
│   │   ├── engine.py              primary + fallback + retry/backoff
│   │   ├── providers/             base.py, gemini.py, claude.py
│   │   ├── prompts/               classify.py, draft_reply.py
│   │   ├── preprocess.py          clean text, detect language
│   │   └── parser.py              validate JSON against schema
│   ├── integrations/
│   │   ├── gmail_client.py        send mail
│   │   ├── whatsapp_client.py     HTTP calls to the Baileys gateway
│   │   └── storage.py             attachments (Supabase Storage)
│   └── api/v1/
│       ├── router.py              includes every router below
│       ├── auth.py  users.py  queries.py  replies.py
│       ├── departments.py  courses.py  notifications.py
│       ├── announcements.py  reports.py  admin.py
│       └── internal.py            channel inbound + job triggers (service key)
├── tests/                         unit/ and api/
├── alembic.ini
├── requirements.txt
├── .env.example
└── render.yaml
```

## 5. Single entry pipeline

Every query, from any channel, passes through `IngestionService.ingest(NormalizedQuery)`. The adapter in front of it differs per channel; everything behind it is identical.

```text
NormalizedQuery {
  channel        email | whatsapp | web_form
  sender         email address, phone number or user_id
  subject        optional
  text           cleaned body
  attachments[]  optional
  external_id    Gmail message id / WhatsApp message id (for duplicate check)
  received_at
}
```

1. Adapter builds the `NormalizedQuery`. The web form calls `POST /api/v1/query` with a JWT. n8n calls `/internal/channels/{email|whatsapp}` with the service key.
2. Identify the sender by email or phone. An unknown sender is rejected with an identification request (UC-02, alternate flow A1).
3. Drop duplicates using `(channel, external_id)`.
4. Save the query with status `pending` before any AI call, so nothing is lost if AI fails (NFR-05).
5. Send the acknowledgement with an estimated response time (FR-07).
6. Return `202 Accepted` to the caller. Steps 7 to 11 run as a background task.
7. Classify with AI: category, course code, priority, confidence (section 9).
8. Route. Confidence below the threshold flags the query for HOD review. Otherwise resolve department, then course, then the course's instructor. If the instructor is on leave, route to the HOD (UC-10, alternate flow A1).
9. Save the route, set status `assigned`.
10. Generate the AI draft reply. A failure here never blocks routing (UC-04, alternate flow A1).
11. Notify the assignee by dashboard and email.
12. Write an audit log row for each step above.

The reply path is also single: `ReplyService.send_reply()` serves Instructor and HOD alike. The reply goes back through the channel the student used (Gmail, WhatsApp, or the portal plus email), and the status moves to `resolved`.

## 6. Database

Keep the seven SDD tables (users, departments, courses, queries, routes, emails, audit\_logs) and add the fields and seven tables below; the SRS needs them and the SDD does not have them yet.

### 6.1 Changes to existing tables

| Table | Add or change | Reason |
| --- | --- | --- |
| users | `phone` (unique, nullable), `google_sub`, `is_active`, `availability` (available, away, on\_leave), `auto_reply_enabled`, `auto_reply_message` | Match WhatsApp senders, FR-02, FR-07, deactivate instead of delete (UC-18). |
| queries | `subject`, `external_id`, `confidence` (float), `needs_review` (bool), `language`; unique `(channel, external_id)`; status enum gains `assigned` | Duplicate check, low-confidence review, SDD UC-03 uses `Assigned`. |
| routes | `method` (ai, rule, manual, override) | Override rate gives AI accuracy for UC-16. |
| emails | `status` (queued, sent, failed) | Delivery tracking, retry. |

### 6.2 New tables

| Table | Columns | Serves |
| --- | --- | --- |
| replies | reply\_id, query\_id FK, author\_id FK, body, is\_draft, ai\_draft\_id FK nullable, created\_at | Reply thread, saved drafts, UC-06, 08, 13 |
| ai\_drafts | draft\_id, query\_id FK, body, model, status (pending, used, edited, discarded), created\_at | UC-04, 09 and usage analytics |
| attachments | attachment\_id, query\_id FK, reply\_id FK nullable, file\_name, mime\_type, size\_bytes, storage\_path | FR-03 |
| notifications | notification\_id, user\_id FK, query\_id FK nullable, type, channel (dashboard, email, whatsapp), message, status (queued, sent, failed), is\_read, attempts, created\_at | FR-08, UC-05 retry |
| announcements | announcement\_id, created\_by FK, title, body, audience (all, department, course), dept\_id FK nullable, course\_id FK nullable, created\_at | FR-13 |
| routing\_rules | rule\_id, keyword, dept\_id FK, course\_id FK nullable, priority, is\_active, created\_by FK | UC-19 |
| escalations | escalation\_id, query\_id FK, reason (sla\_24h, low\_confidence, manual, appeal), escalated\_to FK, escalated\_by FK nullable, created\_at, resolved\_at | FR-10 history |

Extra indexes: `notifications(user_id, is_read)`, `escalations(query_id)`, `routing_rules(is_active, priority)`, plus the SDD indexes on `queries.status`, `queries.timestamp`, `routes.dept_id` and `routes.course_id`.

## 7. API specification

The API has 46 endpoints: the 15 from the SDD (kept with the same paths, now under `/api/v1`) and 31 new ones that the portals need. All portals use the same endpoints; the role decides what comes back.

Conventions: JSON bodies, UTC ISO timestamps, `?page=&page_size=` on lists, errors as `{"detail": "...", "code": "..."}`. Status codes: 401 not logged in, 403 wrong role, 404 record outside your scope.

### 7.1 Auth and profile

| Method | Path | Who | Purpose | FR / UC | Origin |
| --- | --- | --- | --- | --- | --- |
| POST | `/auth/login` | Public | Verify Google ID token, upsert user, return JWT and role | FR-01, UC-01 | SDD |
| GET | `/auth/me` | Any | Current user, role, department | FR-01 | new |
| GET | `/users/me` | Any | Own profile | FR-02 | new |
| PATCH | `/users/me` | Any | Update name, phone, contact preferences | FR-02 | new |
| PATCH | `/users/me/availability` | Instructor, HOD | Availability and auto-reply message | FR-02, 07 | new |
| GET | `/users` | Admin, HOD (own dept) | List and filter users | FR-02 | new |
| POST | `/users` | Admin | Pre-register a user with role and department | UC-18 | new |
| PATCH | `/users/{id}` | Admin | Change role, department, active flag (not your own) | UC-18 | new |

### 7.2 Queries and replies

| Method | Path | Who | Purpose | FR / UC | Origin |
| --- | --- | --- | --- | --- | --- |
| POST | `/query` | Student | Submit a query (web form) | FR-03, UC-02 | SDD |
| POST | `/query/{id}/attachments` | Student (owner) | Upload a document or screenshot | FR-03 | new |
| GET | `/query/{id}` | Owner, assignee, HOD, Admin | Status, route, reply thread; AI draft for staff only | FR-09 | SDD |
| GET | `/queries/mine` | Student | Own queries with status | FR-09, UC-06 | SDD |
| GET | `/queries/assigned` | Instructor, HOD | Queries routed to me | UC-07 | SDD |
| GET | `/queries` | HOD (own dept), Admin | Filter by status, department, course, priority, date, text | UC-12, FR-15 | new |
| POST | `/query/{id}/reply` | Instructor, HOD | Send a reply, or save a draft with `send=false`; optional `ai_draft_id` | FR-06, UC-08, 09, 13 | SDD |
| POST | `/query/{id}/override` | HOD | Reassign, change priority or escalate, with a reason | FR-11, UC-11 | SDD |
| POST | `/query/{id}/appeal` | Student (owner) | Appeal a resolved query; creates an escalation | FR-10 | new |
| POST | `/query/{id}/close` | Student (owner), HOD, Admin | Set status `closed` | FR-09 | new |
| POST | `/email/send` | Staff, system | Generate and send an email through the Gmail API | FR-07 | SDD |

### 7.3 Departments and courses

| Method | Path | Who | Purpose | FR / UC | Origin |
| --- | --- | --- | --- | --- | --- |
| GET | `/departments` | Any | List, for dropdowns | FR-03 | new |
| POST | `/departments` | Admin | Create | FR-02 | new |
| PATCH | `/departments/{id}` | Admin | Edit name and contact email | FR-02 | new |
| GET | `/departments/{id}/courses` | HOD, Admin | Courses with assigned instructor | SDD 9.2 | SDD |
| GET | `/departments/{id}/instructors` | HOD, Admin | Instructors with open-query counts | HOD mockup | new |
| GET | `/courses` | Any | List, filter by `dept_id` | FR-03 | new |
| POST | `/courses` | Admin | Create | FR-02 | new |
| PATCH | `/courses/{id}` | Admin | Edit | FR-02 | new |
| POST | `/courses/{id}/assign-instructor` | HOD, Admin | Assign or change the course instructor | FR-05 | SDD |

### 7.4 Notifications and announcements

| Method | Path | Who | Purpose | FR / UC | Origin |
| --- | --- | --- | --- | --- | --- |
| GET | `/notifications` | Any | Own notifications, unread first | FR-08 | new |
| POST | `/notifications/{id}/read` | Any | Mark one read | FR-08 | new |
| POST | `/notifications/read-all` | Any | Mark all read | FR-08 | new |
| GET | `/announcements` | Any | Announcements for me | FR-13 | new |
| POST | `/announcements` | Admin | Broadcast to all students or a group | FR-13 | SDD |

### 7.5 Dashboards, rules, reports

| Method | Path | Who | Purpose | FR / UC | Origin |
| --- | --- | --- | --- | --- | --- |
| GET | `/hod/overview` | HOD | Open queries, courses covered, escalated to me, average response time | FR-11 | new |
| GET | `/admin/analytics` | Admin | Volume by department, response time, resolution rate, escalations, AI accuracy | FR-12, UC-16 | SDD |
| GET | `/admin/logs` | Admin | Audit log with filters | FR-15 | SDD |
| GET | `/admin/routing-rules` | Admin | List rules | UC-19 | new |
| POST | `/admin/routing-rules` | Admin | Create or update; rejects conflicting rules | UC-19 | SDD |
| PATCH | `/admin/routing-rules/{id}` | Admin | Edit or disable | UC-19 | new |
| DELETE | `/admin/routing-rules/{id}` | Admin | Remove | UC-19 | new |
| GET | `/reports/export` | Admin, HOD (own dept) | `format=pdf\|xlsx`, filter by department, date, status | FR-14, UC-14, 17 | SDD |

### 7.6 Internal and health

These require the `X-Service-Key` header, are never called from the browser, and are not shown in the frontend.

| Method | Path | Caller | Purpose |
| --- | --- | --- | --- |
| POST | `/internal/channels/email` | n8n | Inbound email as a `NormalizedQuery` |
| POST | `/internal/channels/whatsapp` | n8n | Inbound WhatsApp message |
| POST | `/internal/jobs/escalate` | n8n cron | Run the 24-hour escalation job |
| POST | `/internal/jobs/retry-notifications` | n8n cron | Retry failed notifications once |
| GET | `/health` | Anyone | Liveness check, used to wake the service |

## 8. Auth and role access

Login is Google OAuth2 only (UC-01); the backend issues its own JWT and checks it on every request.

1. The React login page gets a Google ID token (`@react-oauth/google`).
2. `POST /auth/login` sends the token; the backend verifies it with Google's `google-auth` library.
3. The backend finds the user by email. A new email from the university domain (`ALLOWED_EMAIL_DOMAIN`) is created as `student`. Staff roles are assigned only by an Admin; the first Admin is seeded from `ADMIN_EMAILS`.
4. The backend returns a JWT (HS256, 8 hours) with `sub`, `role`, `dept_id`, and the user object. The frontend redirects to `/student`, `/instructor`, `/hod` or `/admin`.

| Capability | Student | Instructor | HOD | Admin |
| --- | --- | --- | --- | --- |
| Submit query, attach files | Yes | No | No | No |
| View own queries and thread | Yes | No | No | No |
| View queries assigned to me | No | Yes | Yes | No |
| Reply, use or edit AI draft | No | Yes | Yes | No |
| Set availability and auto-reply | No | Yes | Yes | No |
| View all queries | No | No | Own department | All |
| Override, reassign, escalate | No | No | Yes | No |
| Assign course instructor | No | No | Yes | Yes |
| Manage users, departments, courses | No | No | No | Yes |
| Routing rules, announcements, audit logs | No | No | No | Yes |
| Analytics | No | No | Department KPIs | System-wide |
| Export reports | No | No | Own department | All |
| Profile, notifications, read announcements | Yes | Yes | Yes | Yes |

Scope is checked in the repository query, not only by role. A student sees rows where `queries.user_id` is theirs, an instructor rows where `routes.assigned_to` is theirs, an HOD rows where `routes.dept_id` is their department. A record outside scope returns 404, so ids cannot be probed.

## 9. AI module

All AI calls go through `AIEngine`, so no service knows which provider answered. Gemini is the default; Claude and keyword rules are fallbacks.

```python
class AIProvider(Protocol):
    name: str
    def complete(self, system: str, user: str, *, json_mode: bool = True) -> str: ...

class AIEngine:
    def classify(self, text: str, ctx: RoutingContext) -> Classification: ...
    def draft_reply(self, text: str, ctx: ReplyContext) -> str | None: ...
```

| Step | What happens | Result |
| --- | --- | --- |
| 1 | Gemini classifies. Retry up to 3 times with exponential backoff on 429 and 5xx. | Normal path |
| 2 | Gemini exhausted or JSON invalid twice: Claude classifies. | `routes.method = ai` |
| 3 | Both fail: match `routing_rules` keywords. | `routes.method = rule` |
| 4 | No rule matches, or confidence is below `AI_CONFIDENCE_THRESHOLD` (start at 0.6, tune on test queries): `needs_review = true`, HOD notified. | Manual review |

Classification JSON (validated by `ai/parser.py`):

```json
{"category": "Examination", "course_code": "CS619", "priority": "high", "confidence": 0.82, "language": "en"}
```

Draft reply JSON: `{"draft_reply": "..."}`. The draft call uses Gemini by default and Claude for multi-intent or escalation summaries (SDD 8.1).

Rules the code enforces:

- The model only returns a category from the department list and a `course_code` that exists in `courses`. Anything else becomes `null`.
- The model never picks a person. The instructor comes from `courses.instructor_id`.
- Query text is wrapped in delimiters and the system prompt says to treat it as data, never as instructions.
- Prompts carry no name, email or phone number (SDD section 10).
- Routing rules from the database are added to the prompt as hints, so Admin edits apply to the next query (UC-19).
- If every provider fails, routing still completes through step 3 or 4 and the draft is skipped.

The SDD lists the Claude API as free tier. As far as I know, Anthropic's API runs on prepaid credits rather than a permanent free tier, so check your account. If you have no credits, run Gemini plus keyword rules: the provider interface makes that a config change.

## 10. Background jobs and n8n workflows

n8n only moves messages in and triggers timed jobs. All logic stays in the backend, so a workflow can be rebuilt without touching routing or AI code. Outbound email and WhatsApp are sent by the backend directly.

| Workflow | Trigger | What it does | Calls |
| --- | --- | --- | --- |
| WF-1 Email in | Gmail trigger, poll every minute | Ignore own sent mail, strip HTML and signature, map to `NormalizedQuery` with the Gmail message id | `POST /internal/channels/email` |
| WF-2 WhatsApp in | Webhook from the Baileys gateway | Map the message to `NormalizedQuery` | `POST /internal/channels/whatsapp` |
| WF-3 Escalation | Cron every 10 minutes | Start the SLA check | `POST /internal/jobs/escalate` |
| WF-4 Notification retry | Cron every 5 minutes | Retry failed notifications once (UC-05, A1) | `POST /internal/jobs/retry-notifications` |

Each workflow retries three times, then an error workflow emails you.

The SDD shows the web form going through n8n as well. This design sends it straight to `POST /api/v1/query`, which removes one failure point. If your supervisor expects all three channels in n8n, add a thin web-form webhook workflow that forwards to the same endpoint; nothing else changes.

Escalation job (`escalation_service.py`):

1. Select queries with status `pending`, `assigned` or `in_progress` whose submission time is more than 24 hours ago and that have no open escalation.
2. Set status `escalated` and insert an `escalations` row with reason `sla_24h`.
3. Notify the HOD of the route's department by email and dashboard; if there is none, notify an Admin.
4. Write an audit log row. The job is idempotent, so a repeated call changes nothing.

Hosting notes:

- Render's free web service spins down when idle, so the first request after a pause is slow. The 10-minute cron call to `/health` keeps it mostly warm.
- The Baileys gateway must stay running and keep its session folder. Run it on a machine that stays awake, not on a sleeping free service.
- Baileys is an unofficial WhatsApp Web library, so a number can be blocked. Use a dedicated test SIM for the project and the demo.

## 11. Frontend structure

One Vite + React app with Tailwind CSS. The four portals are folders under `portals/`; they share the layout shell, query components and API layer, so a feature such as the reply editor is written once. Libraries: React Router, TanStack Query for server data, Axios, React Hook Form with Zod, Recharts, `@react-oauth/google`. Files are shown as `.jsx`; use `.tsx` if you want types.

```text
frontend/
├── index.html
├── vite.config.js  tailwind.config.js
├── .env.example                     VITE_API_URL, VITE_GOOGLE_CLIENT_ID
└── src/
    ├── main.jsx
    ├── app/
    │   ├── App.jsx
    │   ├── router.jsx                all routes, lazy-loaded per portal
    │   ├── providers.jsx             QueryClient, AuthProvider, toasts
    │   └── guards/                   RequireAuth.jsx, RequireRole.jsx
    ├── lib/
    │   ├── apiClient.js              axios, adds JWT, handles 401/403
    │   ├── constants.js              ROLES, STATUS, PRIORITY, CHANNELS
    │   ├── navConfig.js              sidebar items per role
    │   └── format.js                 dates, status labels
    ├── api/                          one file per backend router, thin functions
    │   ├── auth.api.js  users.api.js  queries.api.js  replies.api.js
    │   ├── departments.api.js  courses.api.js  notifications.api.js
    │   └── announcements.api.js  admin.api.js  reports.api.js
    ├── hooks/                        React Query hooks: useMyQueries, useQuery(id), ...
    ├── components/
    │   ├── ui/                       Button, Input, Modal, Table, Badge, Spinner, EmptyState
    │   ├── layout/                   AppShell, Sidebar, Topbar, NotificationBell
    │   ├── query/                    QueryTable, QueryFilters, StatusBadge, PriorityBadge,
    │   │                             QueryThread, ReplyEditor, AiDraftPanel, AttachmentList
    │   └── charts/                   Recharts wrappers
    ├── features/auth/                LoginPage.jsx, AuthContext.jsx
    ├── portals/
    │   ├── student/                  SubmitQuery, MyQueries, QueryDetail, Announcements
    │   ├── instructor/               AssignedQueries, QueryWorkspace, Availability
    │   ├── hod/                      Overview, DeptQueries, Courses, Instructors,
    │   │                             Escalations, Reports
    │   └── admin/                    Overview, Queries, Departments, Users, RoutingRules,
    │                                 Announcements, Analytics, Reports, AuditLogs
    └── pages/                        NotFound.jsx, Forbidden.jsx, Profile.jsx, Notifications.jsx
```

### 11.1 Routes per portal

Every portal also has `/<portal>/profile` and `/<portal>/notifications` (shared pages). After login the user lands on `/student`, `/instructor`, `/hod` or `/admin` by role.

| Portal | Route | Page | Main API calls | UC |
| --- | --- | --- | --- | --- |
| Public | `/login` | Login with Google | `POST /auth/login` | 01 |
| Student | `/student/submit` | Submit query form | `GET /departments`, `POST /query`, `POST /query/{id}/attachments` | 02 |
| Student | `/student/queries` | My Queries with status filter | `GET /queries/mine` | 06 |
| Student | `/student/queries/:id` | Status timeline, thread, appeal, close | `GET /query/{id}`, `POST /query/{id}/appeal`, `/close` | 06 |
| Student | `/student/announcements` | Announcements feed | `GET /announcements` | FR-13 |
| Instructor | `/instructor` | Assigned queries | `GET /queries/assigned` | 07 |
| Instructor | `/instructor/queries/:id` | Detail, AI draft, reply editor | `GET /query/{id}`, `POST /query/{id}/reply` | 08, 09 |
| Instructor | `/instructor/availability` | Availability and auto-reply | `PATCH /users/me/availability` | FR-07 |
| HOD | `/hod` | KPIs and escalations | `GET /hod/overview` | 12, 15 |
| HOD | `/hod/queries` | Department queries | `GET /queries` | 12 |
| HOD | `/hod/queries/:id` | Detail, override, follow-up reply | `GET /query/{id}`, `/override`, `/reply` | 11, 13 |
| HOD | `/hod/courses` | Courses and instructors | `GET /departments/{id}/courses`, `POST /courses/{id}/assign-instructor` | FR-05 |
| HOD | `/hod/instructors` | Instructor workload | `GET /departments/{id}/instructors` | 12 |
| HOD | `/hod/escalations` | Reassign, review, override | `GET /queries?status=escalated`, `POST /query/{id}/override` | 11, 15 |
| HOD | `/hod/reports` | Export department report | `GET /reports/export` | 14 |
| Admin | `/admin` | KPIs and charts | `GET /admin/analytics` | 16 |
| Admin | `/admin/queries` | All queries, filters | `GET /queries` | FR-15 |
| Admin | `/admin/departments` | Departments and courses | `/departments`, `/courses` | FR-02 |
| Admin | `/admin/users` | Users and roles | `/users` | 18 |
| Admin | `/admin/routing-rules` | Rules editor | `/admin/routing-rules` | 19 |
| Admin | `/admin/announcements` | Compose and list | `/announcements` | FR-13 |
| Admin | `/admin/analytics` | Full analytics | `GET /admin/analytics` | 16 |
| Admin | `/admin/reports` | Export system report | `GET /reports/export` | 17 |
| Admin | `/admin/audit-logs` | Audit log table | `GET /admin/logs` | FR-15 |

### 11.2 How the frontend behaves

- Auth: `AuthContext` holds the user and token (in `sessionStorage`). `apiClient` adds the Bearer header; a 401 logs out and redirects to `/login`; `RequireRole` sends a wrong-role user to `/403`.
- One `AppShell` renders the sidebar from `navConfig[role]`, so there is no separate layout per portal.
- `QueryThread`, `ReplyEditor` and `AiDraftPanel` are shared by the Instructor and HOD workspaces; the Student view reuses `QueryThread` read-only.
- Near-real-time tracking (FR-09, NFR-12): React Query refetches the query detail and the notification bell every 20 seconds. No websocket is needed and it costs nothing.
- Responsive (NFR-06): sidebar becomes a drawer on phones, tables become card lists. Test on Chrome, Edge and Firefox (NFR-08).

## 12. Environment and deployment

| Part | Host | Notes |
| --- | --- | --- |
| Frontend | Vercel | Set `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID`. HTTPS by default. |
| Backend | Render web service | Run `alembic upgrade head` on deploy. Restrict `CORS_ORIGINS` to the Vercel domain. |
| Database and file storage | Supabase | Use the connection string for `DATABASE_URL`. Attachments go to Supabase Storage. |
| n8n | Self-hosted | Needs to stay running for the crons. A sleeping free service stops them. |
| WhatsApp gateway | Node process | Keep the Baileys session folder on persistent disk. |

Backend `.env` (never commit; keep `.env.example` with empty values):

```text
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRE_MINUTES=480
GOOGLE_CLIENT_ID=
ALLOWED_EMAIL_DOMAIN=
ADMIN_EMAILS=
GEMINI_API_KEY=
ANTHROPIC_API_KEY=            # optional
AI_CONFIDENCE_THRESHOLD=0.6
ESCALATION_HOURS=24
SERVICE_API_KEY=              # n8n and gateway send this as X-Service-Key
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=
GMAIL_SENDER=
WHATSAPP_GATEWAY_URL=
WHATSAPP_GATEWAY_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
CORS_ORIGINS=
```

## 13. Build roadmap

Build the web path first, with keyword routing and no AI, so there is a working demo after phase 3. The email and WhatsApp channels come late because they depend on outside services that can fail.

1. **Setup.** Monorepo, Supabase project, Alembic migrations for every table, seed departments, courses and one user per role. Done when `/health` answers and the seed loads.
2. **Auth and users** (FR-01, 02; UC-01, 18). Google login, JWT, `require_role`, profile, user admin, role-based redirect in React.
3. **Core flow without AI** (FR-03 web, 05, 09; UC-02, 06, 07, 08). Web form, `IngestionService`, keyword-rule routing, assigned list, reply, status tracking.
4. **AI classification and drafts** (FR-04, 06; UC-03, 04, 09). `AIEngine`, fallback chain, confidence review, `AiDraftPanel`.
5. **Notifications and acknowledgements** (FR-07, 08; UC-05, 10). Notification service, Gmail sending, bell, retry job, auto-reply when on leave.
6. **Email and WhatsApp channels** (FR-03). n8n WF-1 and WF-2, Baileys gateway, sender identification, replies on the original channel.
7. **Escalation and HOD tools** (FR-10, 11; UC-11 to 15). WF-3, `escalations` table, HOD screens, override with audit log.
8. **Admin features** (FR-12 to 15; UC-16 to 19). Analytics charts, announcements, PDF and Excel reports, audit view, routing rules editor.
9. **Hardening.** Service unit tests, API role tests, about 20 sample queries to tune the confidence threshold, empty and error states, deploy, demo data, README.

## 14. Gaps found in the SRS and SDD

Twelve items to fix in the documents before submission or viva. The design above already follows the fix in the last column.

| # | Where | Gap | Fix used here |
| --- | --- | --- | --- |
| 1 | SRS use cases | "Related FR" is shifted in most tables: UC-02 cites FR-02 (should be FR-03), UC-04 cites FR-05 (FR-06), UC-11 cites FR-09 (FR-11), UC-16 cites FR-10 (FR-12), UC-18 cites FR-01 (FR-02) | This document uses the FR numbers from the FR list |
| 2 | SDD 8.3 | Cites FR-19, which does not exist (FR-01 to FR-15); UC-19 does | Referenced as UC-19 |
| 3 | SDD 5.2 | `queries.status` enum has no `assigned`, but UC-03 and Figure 7.1 set it | Added `assigned` |
| 4 | SDD 5.2 | No tables for replies, drafts, attachments, notifications, announcements, routing rules, escalation history | Seven tables in 6.2 |
| 5 | SDD 5.2 | `users` has no phone number, so WhatsApp senders cannot be identified (UC-02, A1); no availability for FR-02 and FR-07 | Added `phone`, `availability`, auto-reply fields |
| 6 | SDD 9.2 | No endpoints for department query list (UC-12), notifications, announcements, profile, user CRUD, rule list and edit, attachments | 31 new endpoints in section 7 |
| 7 | SDD 3.1 | Web form goes through n8n | Direct to the backend; n8n optional (section 10) |
| 8 | SDD 9.1 | Mockups exist for the web form, HOD and Admin only | Draw Login, My Queries and thread, Instructor workspace with AI draft, and Admin rules, users and announcements before building |
| 9 | SRS UC-12 | Title says "all departments" but the SDD says within their departments | HOD sees own department; Admin sees all |
| 10 | SDD 6.2 | Class diagram has Admin, Instructor and HOD as subclasses of User, but there is one `users` table | One table with a `role` enum |
| 11 | SDD 1.2, 3.2 | Assumes a free Claude API tier | Verify; Gemini plus keyword rules works at zero cost |
| 12 | SRS UC-16 | Asks for AI accuracy but nothing stores it | `queries.confidence`, `routes.method`, `ai_drafts.status` |
