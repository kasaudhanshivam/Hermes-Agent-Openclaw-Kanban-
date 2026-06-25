# Agent Architecture: Forge 2 Qualifier

## 1. Agent Topology & Roles

| Role | Agent | Responsibility |
|------|-------|----------------|
| **Brain / Manager** | Hermes | Interprets human tasks, plans, decomposes workflows, delegates tasks to the worker, inspects results, and writes final reports. |
| **Hands / Worker** | OpenClaw | Acts as the coding subagent. Writes files, runs migrations, performs React/Vite builds, and executes shell commands. |

*Note: Hermes never hand-codes the repository alone. It delegates with explicit checklists and verifies the outputs before reporting back to the human.*

## 2. Slack Channel Scheme

| Channel | Purpose |
|---------|---------|
| `#sprint-main` | **Human-to-Hermes.** I post goals here. Hermes formulates plans, asks for decisions, and posts autonomous cron updates here. |
| `#agent-coder` | **Hermes-to-OpenClaw.** Hermes delegates tasks here. OpenClaw posts its execution status reports (What I Did / What's Left / What Needs Your Call) back to this channel. |
| `#agent-log` | Raw agent activity and system audit trails. |

## 3. Model Routing Logic

To comply with the 100% free stack requirement, we utilize the following routing strategy:

- **Manager (Hermes):** Routes to **Groq (`openai/gpt-oss-120b`)** or **Gemini (`gemini-2.5-flash`)**. These models are selected for the Brain because they offer large context windows and strong reasoning/planning capabilities necessary for orchestration.
- **Worker (OpenClaw):** Routes to **Ollama (`qwen2.5-coder`)** or **Groq (`llama-3.3-70b-versatile`)**. These are selected for the Hands because they provide fast, free, and accurate code generation and CLI command execution.
- **Veto Rule:** If a tool call fails, the manager patches instructions and retries rather than blocking.

## 4. The Dual-Agent Loop Execution (Terminal-Curl Protocol)
To ensure absolute visibility, we engineered a custom Slack orchestration loop:
1. Hermes announces the task delegation in `#agent-coder` via its native Slack tool.
2. OpenClaw executes the assigned terminal/coding tasks.
3. Because subagent native Slack tools can face scope restrictions, OpenClaw is instructed via our `slack-bot-orchestration` skill to use a **terminal-curl fallback**. It securely posts its final Status Report directly to `#agent-coder` using the Slack API, ensuring the human is always in the loop.
