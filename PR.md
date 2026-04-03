# feat: AutoGen integration — budget enforcement for multi-agent conversations

## Linked Issue

Closes: feat: add AutoGen integration (same pattern as LangChain and CrewAI)

## What this PR does

AgentBudget already ships integrations for LangChain (`LangChainBudgetCallback`) and CrewAI (`CrewAIBudgetMiddleware`). This PR adds the equivalent for AutoGen, following the same patterns already established in the codebase.

### New file: `agentbudget/integrations/autogen.py`

Two integration styles:

**1. Subclass style** — drop-in replacements for AutoGen's built-in classes:
- `BudgetedAssistantAgent` — replaces `autogen.AssistantAgent`
- `BudgetedUserProxyAgent` — replaces `autogen.UserProxyAgent`

Pass `budget="$2.00"` to create a fresh session, or pass `budget_session=` to share an existing session across agents in the same conversation.

**2. Tracker style** — wraps existing agent instances without subclassing:
- `AutoGenBudgetTracker` — call `tracker.patch(agent_a, agent_b)` to attach the shared session to any already-constructed agents. Useful when you don't control agent instantiation.
- `tracker.child_tracker(budget, agent)` — allocates a sub-budget for a nested crew or sub-task, costs roll up to the parent.

### How cost attribution works

AutoGen accumulates token usage on `agent.client.total_usage_summary` across the lifetime of the client. To attribute cost to a single `generate_reply` call, we snapshot the cumulative usage before the call, let the call run, then diff the before/after snapshots. Only the delta is billed to the session. This avoids double-counting pre-existing usage.

### Circuit breaking

`BudgetExhausted` is raised immediately after the call that tips the session over the limit. Subsequent calls on any patched agent in the same session are blocked.

### Optional dependency

AutoGen is not a hard dependency. The module guards the import with a `try/except` and provides stubs so the file loads cleanly without `pyautogen` installed. An explicit `ImportError` with install instructions is raised only when the classes are actually instantiated.

## New file: `tests/test_autogen_integration.py`

Full test suite using `FakeAgent` / `FakeClient` mocks — no real AutoGen install needed. Covers:

- `_snapshot_usage` isolation (copy not reference)
- `_record_agent_llm_cost` delta billing, unknown model no-op, no-client no-op
- `_patch_generate_reply` — cost recording, reply passthrough, multi-call accumulation, budget exhaustion
- `AutoGenBudgetTracker` — creation, patch, multi-agent shared session, chained patch, report structure, budget enforcement, soft-limit callback, context manager, child tracker sub-budget, child tracker session independence

## Changed file: `agentbudget/integrations/__init__.py`

Updated the docstring to list the autogen integration alongside langchain and crewai.

## Testing

```
pytest tests/test_autogen_integration.py -v
```

All 20 tests pass without pyautogen installed.
