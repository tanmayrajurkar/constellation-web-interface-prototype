# Constellation Web Interface Prototype

A frontend-only prototype for a web-native control and monitoring interface inspired by Constellation’s MissionControl and Observatory tools.  
The goal is not to replicate the original Qt layout, but to redesign it for clarity, determinism, and operator efficiency while preserving lifecycle semantics.

---

## Project Overview

### Why this layout

The original Qt layout combines control, state, and logs into dense grids and tabs.  
This version rethinks that structure for a browser environment:

- **Separation of concerns**: Control (commanding the system) and Monitoring (inspecting logs) are split into two main views: **Control Center** and **Observatory**.
- **Reduced cognitive load**: Control Center uses a two-column layout — satellite list on the left, focused workspace (details, lifecycle, configuration) on the right.
- **Persistent global status**: A top bar shows constellation name, derived global state, satellite count, run ID, run duration, and connection status across both views.
- **Improved log workflow**: Observatory provides structured filtering (level, sender, topic, search), a scrollable log stream with level-based coloring, and compact metrics (totals, errors, warnings, messages/min).
- **Professional tone**: Neutral background, white panels, subtle borders, system fonts, and restrained state colors (green = running, red = error). No decorative dashboard styling.

This layout prioritizes operator workflow and state visibility over visual novelty.

---

## Design Process

The interface layout was first sketched and iterated in Figma to clarify information hierarchy and operator workflows before coding.  
These wireframes helped inform the two-pane control/monitoring separation and the placement of lifecycle controls and filters.

Figma prototype (design reference):

https://www.figma.com/design/DtIlbWUWi7IiJCR0uGzd5c/Constellation-Prototype?node-id=0-1&t=1h93EjyhXkUWCI6t-1

---

## Control Model and Lifecycle

Each satellite follows a deterministic finite state machine defined in:

```
lib/stateMachine.ts
```

All lifecycle actions in the UI defer strictly to:

- `canTransition(currentState, targetState)`
- `isActionEnabled(currentState, action)`

Invalid transitions are impossible from the interface.

### Global State

Global state is not stored independently.  
It is derived from satellite states using a pure function:

```
lib/globalState.ts
```

Rules:

- Any satellite in `error` → global `error`
- All satellites in the same state → global reflects that state
- Mixed satellite states → global `mixed`
- No satellites → global `idle`

This ensures a single source of truth: satellites drive the system.

### Run Timer Ownership

The run timer is owned by `GlobalContext`.

- When derived global state becomes `running`, the timer starts.
- When global state leaves `running`, the timer stops.
- Timer lifecycle is fully contained in `GlobalContext`.
- UI components (e.g., `GlobalHeader`) are read-only and contain no side effects.

This avoids UI-driven lifecycle bugs and keeps orchestration deterministic.

### Recovery Semantics

- Heartbeat timeouts decrement a `lives` counter.
- When `lives` reaches zero, the satellite transitions to `error`.
- From `error` or `shutdown`, satellites can re-enter `initialized`.
- Recovery resets operational metadata (heartbeat timestamps, last response, etc.).

The lifecycle model is explicit, recoverable, and state-driven.

---

## Architecture

### Component Structure

**Control Domain**
- `SatelliteList`
- `SatelliteCard`
- `ControlWorkspace`
- `LifecycleControls`
- `ConfigPanel`
- Modals for metadata and command responses

**Observatory Domain**
- `FilterPanel`
- `LogStream`
- `MetricsPanel`
- Log detail modal

**Shared**
- `GlobalHeader`
- `StatusBadge`
- `Modal`

Components are grouped by feature domain (control, observatory, shared).

---

## State Management

### Context Layers

- **SatelliteContext**
  - Holds satellite list, selection, lifecycle transitions
  - Simulates heartbeat and timeout behavior
- **GlobalContext**
  - Holds derived global state, run ID, run duration
  - Owns run timer lifecycle
- **LogContext**
  - Manages log entries, filters, auto-scroll, pause state
  - Applies filtering client-side

Business logic (FSM, derivation, simulation engines) lives in `lib/` and does not depend on React.

---

## Replacing the Simulation

The system is structured so that simulation can be replaced without UI changes:

- Replace log generator interval with WebSocket subscription.
- Replace satellite state updates with backend-driven events.
- Keep state machine and component tree unchanged.
- Context layer becomes an adapter between transport (WebSocket/REST) and UI.

The UI does not depend on transport details.

---

## How to Run

```bash
npm install
npm run dev
```

Open:

```
http://localhost:3000
```

The app redirects to `/control`.  
Use the header navigation to switch between **Control Center** and **Observatory**.

---

## Usage Notes

Some interactions are available via double-click or context menu:

- **Double-click a Satellite Card** to open detailed connection and metadata information.
- **Right-click a Satellite Card** to send context commands (e.g., get_state, get_status).
- **Double-click a log entry** in the Observatory to view full log details and tags.
- Lifecycle buttons are enabled or disabled automatically based on the finite state machine.

These interactions demonstrate how operator workflows would function in a real Constellation setup.

---

## Future Work

- WebSocket bridge for real Constellation communication
- Mapping lifecycle actions to actual Constellation APIs
- Multi-client session support
- Unit tests for FSM and global derivation logic
- Performance tuning for larger satellite counts and high-volume log streams
