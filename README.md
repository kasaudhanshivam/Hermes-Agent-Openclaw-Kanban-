# Kanban Board - Forge 2 Qualifier

**Builder:** Shivam Kasaudhan

A full-stack Kanban board application built entirely through a dual-agent workflow (Hermes + OpenClaw) interacting over Slack. Built with **Laravel 11 (SQLite)** on the backend and **React + Vite + Tailwind CSS** on the frontend.

## Important Links

* **Live Frontend URL:** https://forge.shivamkasaudhan.dev/ (Vercel)
* **Live Backend URL:** https://hermes-agent-openclaw-kanban.onrender.com/ (Render)
* **Video Walkthrough (60-90s):** []

## Features Built via Agents

* Full CRUD for Boards, Lists, Cards, Tags, and Members
* Eager-loaded Eloquent relationships
* Card ↔ Member pivot assignments
* Card ↔ Tag attachments
* Overdue card flags in the UI
* React Vite proxy to avoid CORS issues

## Free Models Used & Routing Strategy

| Layer | Agent | Model Used | Why This Model? |
|---|---|---|---|
| **Brain / Planning** | Hermes Agent | Groq `openai/gpt-oss-120b` (or Gemini) | High reasoning capability for planning tasks, managing the Slack loop, and writing final reports. |
| **Hands / Coding** | OpenClaw | Ollama `qwen2.5-coder` (or Groq) | Fast, free code execution for writing files, scaffolding Laravel, and running terminal commands. |

*Note: All models used comply with the free-stack requirement of the qualifier.*

## Local Run Instructions

### Prerequisites
* Node.js >= 18
* PHP >= 8.2 with SQLite extension
* Composer

### 1. Start the Laravel API
```bash
cd /home/azureuser/kanban-api
php artisan migrate --force
php artisan serve --host=0.0.0.0 --port=8000
```

### 2. Start the React Frontend
```bash
cd /home/azureuser/frontend
npm install
npm run dev
```

* Laravel API runs at: http://localhost:8000/api/v1
* Vite UI runs at: http://localhost:5173 (proxies /api to Laravel)
