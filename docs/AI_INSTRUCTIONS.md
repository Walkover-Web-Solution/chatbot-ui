# AI / Contributor Instructions

## Purpose

This document defines **strict guidelines for AI tools and contributors** working on this codebase.

Its goal is to ensure that:
- All changes align with the intended frontend-only architecture.
- Existing patterns, utilities, and dependencies are reused correctly.
- Backend responsibilities are not reimplemented or inferred in the frontend.
- AI-generated or contributor code remains consistent, safe, and maintainable.

This document is **authoritative** and must be followed when generating, modifying, or refactoring code in this repository.


## Tech Stack & Scope

### Tech Stack (Authoritative)

This codebase follows a **frontend-only architecture** built with the following stack.  
AI and contributors **must align with this stack** and reuse existing dependencies.

- **Framework:** Next.js (React-based, App Router)
- **Language:** TypeScript
- **UI & Styling:**
  - React
  - Material UI (MUI)
  - Emotion
  - Tailwind CSS (utility styling where applicable)
- **State Management:**
  - Redux Toolkit
  - Redux Saga (side effects)
  - Redux Persist (session continuity)
- **Real-Time Communication:**
  - `socket.io-client` (via centralized socket manager)
- **HTTP Communication:**
  - Axios
- **Utilities & Helpers:**
  - dayjs (date/time handling)
  - lodash helpers (debounce, plain object checks)
  - uuid (identifier generation)
  - markdown/rendering utilities
- **Deployment Target:**
  - Cloudflare Pages (via `@cloudflare/next-on-pages`)


### Scope of This Codebase

- This repository contains **only the frontend implementation** of the chat widget.
- All backend responsibilities (ticket creation, agent assignment, AI behavior, persistence) are owned by a separate system.
- The frontend is responsible for:
  - Rendering the chat widget UI
  - Managing client-side UI state
  - Handling real-time communication with backend services
  - Passing required identifiers (e.g., widget token) with requests


### Dependency Usage Rules

- **Prefer existing dependencies from `package.json`.**
- Do **NOT** introduce new libraries if equivalent functionality already exists.
- Do **NOT** replace or bypass established libraries (Redux, socket.io, Axios) without explicit approval.
- Reuse existing utility functions, services, and helpers wherever possible.

AI and contributors must assume that the listed dependencies are **intentional and stable choices**.


## State Management Rules

- Client-side state is managed using **Redux Toolkit** with **Redux Saga** for side effects.
- Redux is used to manage **UI state and session-level data** such as:
  - conversation messages
  - channel history
  - widget configuration received from backend
- The frontend **must not** treat Redux as a source of truth for business logic.
- All authoritative conversation state, assignment decisions, and message ownership come from backend responses.

### Rules for AI and Contributors

- **Do NOT** introduce new state management libraries.
- **Do NOT** bypass Redux by introducing alternative global state mechanisms.
- **Do NOT** persist business logic or decision-making in Redux.
- **Do NOT** assume Redux state is durable or authoritative.

- **DO** reuse existing Redux slices, sagas, and patterns.
- **DO** extend existing state shape when required instead of creating parallel state stores.
- **DO** rely on backend responses to reconcile or update client-side state.


## Real-Time Communication Rules

- Real-time messaging is handled using **WebSockets** via `socket.io-client`.
- A **centralized socket manager** is responsible for:
  - establishing and maintaining connections
  - authentication and reconnection handling
  - channel subscriptions
  - emitting and receiving events
- UI components must interact with real-time messaging **only through the socket manager**.

### Rules for AI and Contributors

- **Do NOT** create additional WebSocket or socket.io connections outside the existing socket manager.
- **Do NOT** embed business logic, routing decisions, or message ownership rules in socket handlers.
- **Do NOT** hardcode socket endpoints or authentication logic.
- **Do NOT** change the communication model (HTTP vs WebSocket) without explicit direction.

- **DO** reuse the existing socket manager for all real-time interactions.
- **DO** treat messages received over the socket as backend-authoritative.
- **DO** keep socket usage focused on transport and event delivery, not decision-making.


## Environment & Configuration Rules

- Environment-specific behavior (API endpoints, WebSocket endpoints, notification services) is controlled via **environment variables**.
- The application supports **test** and **production** environments.
- Environment selection must not be hardcoded in application logic.

### Rules for AI and Contributors

- **Do NOT** hardcode API URLs, socket URLs, or environment-specific values in the code.
- **Do NOT** infer environment based on hostname or runtime heuristics.
- **Do NOT** introduce new environment variables unless absolutely necessary.

- **DO** rely on existing environment variables for configuration.
- **DO** follow existing patterns for accessing environment values.
- **DO** ensure changes remain compatible with both test and production environments.


## Code Reuse & Extension Guidelines

- This codebase contains established utilities, services, and helpers that must be reused.
- Existing patterns for API calls, socket communication, and state updates are intentional and should be followed.
- Shared logic should live in common utilities or services rather than being duplicated in UI components.

### Rules for AI and Contributors

- **Do NOT** re-implement functionality that already exists in utilities, services, or helpers.
- **Do NOT** duplicate logic across multiple components or files.
- **Do NOT** introduce alternative patterns when a standard pattern already exists.

- **DO** search the codebase for existing utilities or helpers before writing new logic.
- **DO** extend existing utilities or services when additional behavior is required.
- **DO** keep UI components focused on rendering and user interaction, not shared logic.


## Prohibited Changes

The following changes are explicitly **not allowed** in this codebase unless there is clear approval and intent.

- Implementing or simulating backend logic in the frontend.
- Making the frontend a source of truth for conversation state or business decisions.
- Introducing new state management solutions or bypassing Redux.
- Creating additional WebSocket connections outside the existing socket manager.
- Hardcoding environment-specific values (URLs, tokens, identifiers).
- Adding new third-party libraries when equivalent functionality already exists.
- Rewriting or replacing core infrastructure (socket manager, Redux setup) without necessity.


## Refactoring Discipline

- Changes should be **incremental and minimal**, focused only on the required scope.
- Existing code structure and patterns should be preserved wherever possible.
- Refactors must not change system behavior unless explicitly intended.

### Rules for AI and Contributors

- **Do NOT** perform large-scale refactors without clear justification.
- **Do NOT** rename files, folders, or public interfaces unnecessarily.
- **Do NOT** change working logic for stylistic or subjective reasons.

- **DO** prefer extending existing code over replacing it.
- **DO** keep refactors localized to the smallest possible surface area.
- **DO** ensure existing behavior remains intact after refactoring.

### Naming Discipline

- Any new files, folders, variables, functions, or components **must be named according to their responsibility and task**.
- Names should be **descriptive, explicit, and context-aware**, not generic.

### Rules for AI and Contributors

- **Do NOT** introduce vague or ambiguous names (e.g., `data`, `temp`, `handler`, `utils2`).
- **Do NOT** reuse existing names for unrelated functionality.
- **DO** ensure naming clearly reflects the feature, responsibility, or domain it belongs to.
- **DO** follow existing naming conventions used in the codebase.


## Documentation Discipline

- Documentation is considered part of the codebase and must remain accurate.
- Any change that alters behavior, responsibilities, or constraints must be reflected in the relevant documentation.

### Rules for AI and Contributors

- **DO** update documentation when making meaningful changes to architecture, behavior, or constraints.
- **DO NOT** update documentation speculatively or without corresponding code changes.
- **DO NOT** let documentation drift from actual system behavior.

