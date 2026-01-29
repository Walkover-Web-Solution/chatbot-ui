## What is the feature?
Users can start a voice call directly from the chat widget using the call icon.

## Purpose of the feature
Helps users talk to support for issues that are easier to explain by voice.

## Dependencies & libraries
- msg91-webrtc-call – WebRTC voice calling

## Code-level flow
- `useHelloEffects.ts` checks widget configuration and shows call buttons only when voice calling is enabled.
- `CallButton.tsx` starts the call when clicked and prevents calling if a call is already active.
- `HelloVoiceService.ts` initializes WebRTC, starts the call, and manages call states (ringing, connected, ended) and emits events.
- `useCallUI.ts` listens to events and updates React state (callState, isMuted, mediaStream).
- `CallUI.tsx` renders the call interface based on the current call state and hides it when the call ends.
