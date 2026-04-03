# DECISIONS.md — Live Agent Run Panel

## 1. Parallel Layout Strategy

**Decision**: Tasks sharing the same `startTime` are grouped into a "Parallel Group" and rendered side-by-side in a flex row.

**Why**: Financial AI pipelines frequently run independent data-fetching tasks concurrently (e.g., market data + SEC filings). A horizontal layout makes the concurrency _visually obvious_ — users immediately see that these tasks are not sequential.

**Implementation**:
- The `useAgentStream` hook pre-scans all events and assigns a `parallelGroup` ID to tasks with matching `startTime` on `TASK_STARTED` events.
- `AgentRunPanel` groups consecutive tasks by their `parallelGroup` before rendering.
- `ParallelGroup` renders children in a `flex-row` on medium+ screens (≥768px) and falls back to a vertical stack on mobile, with a dashed left-border accent to visually bind the group.

**Trade-off**: If more than 3 tasks run in parallel, the horizontal layout may compress cards too much. For production, we'd add a max-width threshold and overflow-scroll.

---

## 2. Information Density

**Decision**: Default to minimal chrome — collapsed thought boxes, compact tool badges, tiny dependency chips.

**Why**: Financial users are scanning for _status_ first, _details_ second. The card surface shows: name, status, and tool at a glance. Thought reasoning is one click away in a collapsible terminal box.

**Hierarchy** (top to bottom of each card):
1. **Status icon + Task name + Status label** — scannable in <1 second
2. **Dependency chip** — tiny, only if relevant
3. **Tool badge + I/O** — visible but compact
4. **Thought box** — collapsed by default, expandable

---

## 3. Cancellation as "Optimized"

**Decision**: When a task is cancelled with reason `sufficient_data`, display it as "Optimized" with an amber accent instead of error-red.

**Why**: In agent systems, `sufficient_data` cancellations are _positive_ — the agent decided it already has enough information. Showing "Cancelled" in red would create false alarm. "Optimized" communicates that the agent made an intelligent resource-saving decision.

**Visual cues**: Amber Zap icon, amber border accent, "Optimized" label. Distinct from error cancellations which would use a neutral/gray treatment.

---

## 4. Color System (Black & White)

**Decision**: Monochrome palette with white as the primary accent, amber as the only color exception (for "Optimized" cancellations).

**Why**: The user requested a strict black-and-white theme. We use varying opacities of white (`white/30`, `white/60`, `white/80`) to create depth hierarchy without introducing hue. Amber is the single exception for the "Optimized" state since it needs to be immediately distinguishable.

---

## 5. Streaming UX

**Decision**: Auto-start on mount, auto-scroll to bottom, "Restart" button after completion.

**Why**: Simulates a real agent run experience where events appear progressively. Auto-scroll keeps the latest activity visible. The restart button uses `reset()` to clear state and replay, useful for demos and testing.
