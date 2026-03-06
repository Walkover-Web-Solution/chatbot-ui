# Calling Feature

## Overview

The Calling feature enables end-users to initiate **voice calls** directly from the Chat Widget UI.

This document describes the **frontend behavior, state handling, and integration flow** for voice calling.  
Backend logic, routing, and call handling are intentionally out of scope.


## Feature Availability

- Calling UI is rendered **only when calling is enabled in widget data** received by the frontend.
- If calling is disabled:
  - No call buttons are shown
  - No voice-related initialization occurs


## UI Components & Visibility

- Call buttons are conditionally rendered in Chat input area
- Call-related UI is shown **only when a call is active or ringing**.
- Call buttons are disabled when:
  - A call is already in progress
  - Call state is not `idle`
  - Call setting is disabled


## Voice Communication (Frontend Perspective)

- Voice calling is implemented using **WebRTC** on the frontend.
- A dedicated voice service is responsible for:
  - Initializing WebRTC
  - Managing the call lifecycle
  - Emitting call state updates

The frontend does **not** implement call routing or decision logic.


## Call Lifecycle (Frontend View)

1. Calling is enabled in widget configuration.
2. Frontend initializes voice capability when required.
3. User clicks a call button.
4. Frontend requests a **call token** and passes it to the voice service.
5. WebRTC call is initiated using the token.
6. Call state updates are emitted and reflected in the UI.
7. On call end, frontend clears call-related state.


## Parameters Passed by the Frontend

During call initiation, the frontend is responsible for passing:
- Secure **call token**
- user identifier ie; uuid

No additional call logic is derived or inferred on the frontend.


## State Management

- Call state is managed centrally and accessed via a custom hook.
- Supported states include:
  - `idle`
  - `ringing`
  - `connected`
  - `ended`
  - `rejoined`
- Call state drives:
  - Button availability
  - Call UI visibility
  - Rejoin behavior on reload


## Persistence & Rejoin Behavior

- Call tokens are temporarily stored to support **call rejoin**.
- If the page reloads during an active call:
  - The frontend attempts to rejoin using the existing call token.
- Call-related state is cleared when the call ends.


## User Experience

- Only one call can be active at a time.
- Calling UI updates in real time based on call state.
- No calling UI is shown when call state is `idle`.


## Constraints

- Frontend must not:
  - Implement call routing logic
  - Infer call ownership or assignment
  - Manage call authorization rules
- Frontend must rely on:
  - Provided tokens
  - Emitted call state changes


## AI Guidance

- Do NOT modify WebRTC initialization patterns.
- Do NOT introduce new call state sources.
- Do NOT bypass the existing voice service or hooks.
- Keep all call-related changes localized to calling-specific components and services.


## Testing Checklist

- [ ] Call buttons appear only when calling is enabled
- [ ] Call buttons are hidden when calling is disabled
- [ ] Call initiation works from both entry points
- [ ] Call UI reflects state changes correctly
- [ ] Call cannot be started when another call is active
- [ ] Call rejoin works after page reload
- [ ] Call state clears correctly on call end


## Conclusion

The Calling feature adds real-time voice communication to the Chat Widget while maintaining strict frontend boundaries.  
All calling behavior is driven by frontend state, tokens, and WebRTC lifecycle management without introducing backend logic into the UI layer.
