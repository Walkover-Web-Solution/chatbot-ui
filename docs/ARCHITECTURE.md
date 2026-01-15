## Architecture Overview
This project uses an embedded setup with a client website and a chatbot running inside an iframe.

## Key Features
- Screen sharing
- Push Notifications

## Tech Stack

Frontend: Next.js 15, TypeScript
State Management: Redux Toolkit
Styling: TailwindCSS, DaisyUI
Real-time: Socket.io

## High level flow of the project

1. Client website loads the script which creates the iframe and loads the chat widget.
2. Chat widget initializes and becomes ready for use.
3. Messages are sent via API and responses are received in real time.
4. UI-related data is stored temporarily in state and local storage.

## Project Structure
- /components → React UI components
- /store → Redux state management
- /public/chat-widget.js → Entry file
- /hooks → Custom React hooks

## Major features 

- docs/FEATURE_VOICE_CALLING.md — voice calling feature overview
- docs/FEATURE_SWIPE_REPLY.md — swipe reply feature overview

