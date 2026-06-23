# Agent Log — Kanban Build

This file preserves key human ↔ agent exchanges as an audit trail.

---

## Exchange 1 — API Layer Scaffold

**Human:** "Great job on setting up the Laravel project and SQLite migrations. Now, we need the API layer. Please generate the API Controllers and Routes for all our Kanban entities (Board, List, Card, Tag, Member) to handle full CRUD operations..."

**Plan:** Read migrations and existing stubs, then delegate file creation to a coder agent; verify with PHPStan and `route:list`.

**Code:** Controllers + Resources written under `kanban-api/app/Http/Controllers/Api` and `kanban-api/app/Http/Resources`. Route verification shows 34 API routes.

**Report:** Status in SKILL format (What I Did / What's Left / What Needs Your Call). Noticed a runtime mismatch in `CardController::assignMember` / `::unassignMember` and proposed Option 1 (pivot) vs Option 2 (remove endpoints).

---

## Exchange 2 — Card ↔ Member Pivot Fix

**Human:** "Since 'Assign a member to a card' is a required core feature for our Kanban board, we MUST go with Option 1."

**Plan:** Delegate migration + model updates + endpoint verification to a coder agent. Confirm PHPStan passes after changes.

**Code:** Created `database/migrations/..._create_card_member_table.php`. Added `members()` to `Card` and `cards()` to `Member`. Ran migration successfully. Endpoints now use the pivot.

**Report:** Status in SKILL format confirming completion and migration success.

---

## Exchange 3 — Route Sanity Check + React Scaffold

**Human:** "Please go ahead and run the quick `php artisan route:list` sanity check... Right after that, let's start Task 3: The React Frontend."

**Plan:** Run `php artisan route:list` to confirm endpoint surface. Then delegate React + Vite + Tailwind scaffold to a coder agent. Verify no leftover dev processes.

**Code:** 34 routes confirmed clean. React scaffold created under `/home/azureuser/frontend` with Vite, Tailwind, Axios, and baseline components (`BoardList`, `BoardView`, `ListColumn`, `CardItem`). Vite proxy `/api → http://localhost:8000` avoids CORS. Dev server smoke-tested with curl, then stopped.

**Report:** Status in SKILL format.

---

## Exchange 4 — Core Frontend Features

**Human:** "Let's now implement the core frontend features. Please delegate to the coder agent to update our React components with fully working logic..."

**Plan:** Update React components to wire CRUD, move cards, assign/unassign members, attach/detach tags, overdue flags. Verify with `vite build`.

**Code:** All components updated. Production build succeeds (`✓ built in 447ms`).

**Report:** Status in SKILL format.

---

## Exchange 5 — Documentation Finalization

**Human:** "Per Section 08 of our qualifier guidelines, we need to finalize our repository documentation before pushing. Please generate or update the following files in the root of our repository: `README.md`, `ARCHITECTURE.md`, `agent-log.md`, `.env.example`."

**Plan:** Write/update all four docs using facts from prior exchanges, model choices, agent topology, and channel scheme.

**Code:** This file + README.md, ARCHITECTURE.md, .env.example.

**Report:** This status block.
