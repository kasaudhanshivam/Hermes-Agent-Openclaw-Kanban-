# Architecture

## Agent Topology

| Role | Agent | Responsibility |
|------|-------|----------------|
| Brain / manager | Hermes | Interprets human tasks, plans, delegates, inspects results, writes reports |
| Hands / worker | OpenClaw coder agent | Writes files, runs migrations, performs Vite builds, executes shell commands |

Hermes never hand-codes the repository alone when a coding subagent is available. It delegates with explicit checklists and verifies the outputs (file reads, `phpstan`, `vite build`, `route:list`) before reporting.

## Slack Channel Scheme

| Channel | Purpose |
|---------|---------|
| `<#C0BCFKS84Q2>` | Main task/status channel with the human |
| `<#C0BCG399VK4>` | Delegated coder agent output channel |

## Model Routing Logic

- **Manager routes:** Hermes runs on `kilo-auto/free` (KiloCode provider).
- **Worker routes:** Delegated coder agent inherits the same free model unless pinned.
- **Veto rule:** If a tool call fails because of model/command incompatibility (e.g., PHPStan init on v2), the manager patches instructions and retries rather than blocking.
