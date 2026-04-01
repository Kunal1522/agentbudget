# AgentBudget SDKs

This directory contains first-party AgentBudget SDKs for languages beyond Python.

The Python SDK lives in `/agentbudget/` at the repo root and is published to PyPI.

---

## SDK Directory

| Language | Location | Install | Status |
|---|---|---|---|
| **Python** | `/agentbudget/` | `pip install agentbudget` | stable — v0.3.0 |
| **Go** | `/sdks/go/` | `go get github.com/AgentBudget/agentbudget/sdks/go` | stable — v0.3.0 |
| **TypeScript** | `/sdks/typescript/` | `npm install @agentbudget/agentbudget` | stable — v0.3.1 |

---

## Feature Parity

| Feature | Python | Go | TypeScript |
|---|---|---|---|
| Budget session creation | ✅ | ✅ | ✅ |
| Hard budget limit (raises/throws on exceed) | ✅ | ✅ | ✅ |
| Soft limit callback (fires once) | ✅ | ✅ | ✅ |
| Loop detection | ✅ | ✅ | ✅ |
| OpenAI support | ✅ | ✅ | ✅ |
| Anthropic support | ✅ | ✅ | ✅ |
| 35+ built-in model prices | ✅ | ✅ | ✅ |
| Custom model pricing | ✅ | ✅ | ✅ |
| Tool/API cost tracking | ✅ | ✅ | ✅ |
| Child sessions (nested budgets) | ✅ | ✅ | ✅ |
| Finalization reserve | ✅ | ✅ | ✅ |
| WouldExceed pre-flight check | ✅ | ✅ | ✅ |
| Per-client instance patching | ✅ | —  | ✅ |
| Global drop-in patching | ✅ | —  | — |
| Async support | ✅ | ✅ (goroutines) | ✅ |
| Streaming support | ✅ | — | — |
| Webhooks | ✅ | — | — |
| LangChain integration | ✅ | — | — |
| CrewAI integration | ✅ | — | — |

> Go and TypeScript integrations for LangChain, CrewAI, streaming, and webhooks are planned for v0.4.0.

---

## Architecture

All SDKs share the same core pattern:

```
AgentBudget (factory)
  └── Session (per agent run)
        ├── Ledger (thread-safe cost accumulator)
        ├── CircuitBreaker (soft limit + loop detection)
        └── Pricing table (35+ models, fuzzy matching)
```

Each SDK is independently published with zero cross-language dependencies:

- **Python** → PyPI: `agentbudget`
- **Go** → GitHub (no registry needed): `github.com/AgentBudget/agentbudget/sdks/go`
- **TypeScript** → npm: `agentbudget`

---

## Contributing a New SDK

If you'd like to add a Ruby, Rust, or Java SDK, the reference implementation is in `/agentbudget/` (Python). The core logic to replicate:

1. `Ledger` — running total with hard-limit enforcement
2. `CircuitBreaker` — soft limit + windowed loop detection
3. `Pricing` — model lookup with date-suffix and OpenRouter prefix fuzzy matching
4. `Session` — `wrapUsage()`, `track()`, `wouldExceed()`, `childSession()`, `report()`
5. `Budget` — factory that configures a session

See `/sdks/go/` or `/sdks/typescript/` for idiomatic implementations.
