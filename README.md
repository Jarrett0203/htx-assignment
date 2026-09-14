# Task Assignment Application

A full-stack task assignment system with skill-based developer matching, nested subtasks, and automatic LLM-based skill identification.

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React + TypeScript + Vite | Fast dev server, native TS support, no config ceremony compared to CRA |
| Styling | Tailwind CSS v4 | Utility classes let styling be added directly onto existing markup without rewriting components into a library's own primitives (considered vs. Material UI) |
| Routing | react-router-dom | Standard client-side routing for the two-page SPA |
| HTTP client | axios | Slightly nicer error/response shape than raw `fetch` |
| Notifications | react-hot-toast | Lightweight toast library, no boilerplate state management for transient errors |
| Loading indicators | react-spinners | Small, well-maintained spinner component set |
| Backend | Node.js + Express + TypeScript | Required by spec; Express is minimal and well understood |
| Dev runtime | tsx | Fast TS execution + watch mode without a separate compile step during development |
| ORM | Prisma (pinned to v7) | Type-safe schema, migrations, and query builder. **Note:** Prisma 8 was the `latest` npm tag at time of writing but is a release-candidate with a substantially different architecture (`contract.prisma`, separate `@prisma/orm-postgres` package); v7 was pinned deliberately for stability and because it matches the vast majority of available documentation |
| Database driver | `@prisma/adapter-pg` + `pg` | Prisma 7 requires an explicit driver adapter rather than an implicit connection string |
| Database | PostgreSQL 17.4 | Required by spec |
| LLM | Google Gemini (`gemini-3.6-flash`) via `@google/genai` | Free tier available; structured JSON output (`responseSchema`) used for reliable skill classification instead of parsing free-text responses. **Note:** The latest version `gemini-3.8-flash` was considered but consistently ran into `ApiError` due to high demand. |
| Containerization | Docker + Docker Compose, multi-stage builds | Required by spec (Part 6) |

## Architecture Notes

- **Skills are seed-only.** The spec defines no create/update/delete operations for Developers or Skills, so both are treated as fixed reference data, loaded once via the seed script and cached in memory on backend startup. (`src/lib/skillCache.ts`) This is safe because nothing in the running application can ever change them.
- **Subtasks are a self-relation on `Task`** (`parentId` / `parent` / `subtasks`), not a separate model. A subtask has exactly the same shape as a top-level task, per the spec.
- **The "Done requires all subtasks Done" rule is enforced in both directions**: a task can't be marked Done while any direct subtask isn't Done, and a subtask can't be moved away from Done while its own parent is currently Done (the parent must be un-Done first). This prevents the two statuses from silently drifting out of sync.
- **Skill validation for task creation happens recursively** across the whole subtask tree in a single pass (one DB query, not one per node), and the shape-validation (`isValidCreateTaskInput`) is likewise recursive.
- **CORS** is configured via an explicit allow-list (`ALLOWED_ORIGINS` env var) rather than allowing all origins.

## Getting Started

### Prerequisites
- Docker + Docker Compose
- Zip file attached in submission email

### Setup

1. Clone the repository.

2. Paste and extract the zip file attached in the submission email into the project root.

3. From the project root:

   ```
   docker compose up -d --build
   ```

   This builds and starts three containers: `postgres`, `backend`, `frontend`. On first startup, the backend automatically runs migrations and seeds the database. (Alice/Bob/Carol/Dave and the Frontend/Backend skills) The seed is idempotent, so it is safe on every restart.

4. Open **http://localhost:5173**, the application should load with the seeded data already present.

   The API is directly reachable at **http://localhost:5000** if needed.

### Running Locally Without Docker (development)

Backend:
```
cd backend
yarn install
npx prisma migrate dev
npx prisma db seed
yarn dev          # runs on :5000
```

Frontend:
```
cd frontend
yarn install
yarn dev           # runs on :5173
```

Requires a locally running Postgres instance and a `backend/.env` with `DATABASE_URL`, `PORT`, `ALLOWED_ORIGINS`, and `GEMINI_API_KEY` set, plus a `frontend/.env` with `VITE_API_URL`.

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/developers` | List all developers with their skills |
| GET | `/developers/:id` | Get a single developer |
| GET | `/skills` | List all skills |
| GET | `/skills/:id` | Get a single skill |
| GET | `/tasks` | List all top-level tasks (with nested subtasks, skills, assignee) |
| GET | `/tasks/:id` | Get a single task with full detail |
| POST | `/tasks` | Create a task, optionally with nested subtasks. If `skillIds` is omitted/empty for any task/subtask, required skills are auto-identified via Gemini based on the title |
| PATCH | `/tasks/:id/status` | Change a task's status (`TODO` \| `DONE`) |
| PATCH | `/tasks/:id/assign` | Assign a task to a developer; rejected if the developer lacks any required skill |

**`POST /tasks` request body:**
```json
{
  "title": "string",
  "skillIds": [1, 2],
  "subtasks": [
    { "title": "string", "skillIds": [], "subtasks": [] }
  ]
}
```

## What I Would Improve With More Time

- **Subtask nesting depth is hardcoded to 3 levels** in three separate places (the backend's Prisma `include` shape, the backend's validation function and the frontend's create-form's recursion guard) rather than derived from one shared, configurable source of truth.
- **No automated test suite.** All endpoints and UI flows were tested manually given time constraints. Unit/integration tests (particularly around the skill-matching and status-transition business logic) would be the next priority.
- **The parent/subtask status invariant is enforced by blocking the reverse transition**, not by cascading. If a user wants to un-Done a subtask whose parent is Done, they must manually change the parent's status first. A cascading approach (auto-un-Done ancestors) would be more forgiving but requires the frontend to refetch more state per change.
- **No delete or update endpoints exist for any entity except Task status/assignment**, this means bad seed data or a bad task can't currently be removed through the API.
- **`SubtaskForm` and `SubtaskList` are separate components** with similar recursive shapes but no shared logic between them (one is an editable form, one is a read-only display). With more time these could share a common tree-walking abstraction, reducing duplication between the create and view flows.
- **The Docker image ships both compiled (`dist/`) and source (`src/`) files** for the backend, since the seed script runs via `tsx` directly from TypeScript source at container startup. A cleaner separation would compile the seed script too, or move seeding to a one-off job outside the main container's lifecycle.
