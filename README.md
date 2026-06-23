# Kanban Board App

A full-stack Kanban board application built with **Laravel 11 (SQLite)** on the backend and **React + Vite + Tailwind CSS** on the frontend.

## Features

- Full CRUD for Boards, Lists, Cards, Tags, and Members
- Eager-loaded Eloquent relationships
- Card ↔ Member pivot assignments
- Card ↔ Tag attachments
- Overdue card flags in the UI
- React Vite proxy to avoid CORS issues

## Free Models Used

| Layer | Model | Why |
|-------|-------|-----|
| LLM brain / manager | Hermes Agent (kilo-auto/free via KiloCode) | Free orchestration layer: delegates work, parses results, and writes final reports |
| Code worker | OpenClaw coder agent | Free worker that writes files and runs shell commands for tasks delegated by Hermes |
| Backend framework | Laravel 11 (free / open source) | Rapid API scaffolding, Eloquent ORM, Sanctum auth, SQLite for zero-config dev |
| Frontend framework | React + Vite (free / open source) | Fast dev server, HMR, tiny config |
| Styling | Tailwind CSS v3 (free) | Utility-first styling without design debt |

Using free/open-source models and tooling lets us iterate quickly without paying per-token or per-seat for coding work during the prototype phase.

## Local Run Instructions

### Prerequisites
- Node.js >= 18
- PHP >= 8.2 with SQLite extension
- Composer

### Start the Laravel API
```bash
cd /home/azureuser/kanban-api
php artisan migrate --force
php artisan serve --host=0.0.0.0 --port=8000
```

### Start the React Frontend
```bash
cd /home/azureuser/frontend
npm install
npm run dev
```

- Laravel API: **http://localhost:8000/api/v1**
- Vite UI: **http://localhost:5173** (proxies `/api` to Laravel)
