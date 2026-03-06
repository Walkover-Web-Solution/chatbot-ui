# System Architecture

## Overview

This project is a frontend-only chat widget built using Next.js.  
It allows companies to embed a chatbot into their websites using a provided script tag.

The widget enables end-users to communicate with:
- an AI bot,
- an individual human agent,
- or a team of agents,

depending on how the backend assigns the conversation.

This repository contains **only the client-side implementation** of the chat widget.
All ticketing, assignment logic, AI responses, and persistence are handled by a separate backend system.

## High-Level Components

- **Embeddable Script**
  - Injected into client websites
  - Initializes and renders the chat widget UI

- **Chat Widget UI**
  - Handles user interactions
  - Displays messages, typing states, and status updates

- **Widget Token Configuration**
  - Unique token per company
  - Sent with every request to identify the tenant
  - Determines which backend workspace/tickets the chat belongs to

- **Backend APIs (External)**
  - Ticket creation
  - Message routing (bot / person / team)
  - Response delivery


## Data Flow

### Widget Initialization
1. A company embeds the chat widget using a script tag on their website.
2. The script is initialized with a **widget token**, which uniquely identifies the company.
3. The widget loads and prepares a new or existing conversation context associated with the widget token.

### User Message Flow
1. An end-user opens the chat widget and sends a message.
2. The chat widget sends the message, along with the widget token and conversation metadata, to the backend APIs.
3. The backend creates or updates a ticket associated with the widget token.
4. Based on backend assignment logic, the conversation is routed to:
   - an AI bot,
   - an individual human agent,
   - or a team.
5. The backend processes the message and returns a response.
6. The chat widget receives the response and renders it in the UI.

### Communication Mode

- The initial user message is sent via a standard HTTP API request to establish the conversation.
- After the initial message, all subsequent messages and responses are exchanged using WebSocket connections.
- WebSockets enable real-time message delivery between the backend and the chat widget UI.
- The frontend uses WebSockets to manage real-time communication and message delivery, while all business logic and routing decisions remain backend-driven.

### Ongoing Conversation
- All subsequent messages follow the same flow.
- The widget token ensures messages remain scoped to the correct company.
- The frontend does not own business state and relies on backend responses as the source of truth for conversation state.


## Frontend Architecture

- Built using Next.js with a component-based architecture.
- The application is responsible for rendering the chat widget UI and handling user interactions.
- Shared components, utilities, and state management are reused across the widget to ensure consistency.
- Real-time communication is handled via a centralized socket manager, abstracted away from UI components.
- Client-side state is used to manage UI state and message rendering, while all business decisions come from backend responses.


## Deployment Overview

- The frontend is deployed as a web application and served to client websites via an embeddable script.
- Backend API and WebSocket endpoints are configured via environment variables.
- Separate production and test environments exist, with environment-specific endpoints and minor code differences where required.

## Architectural Boundaries

- This repository contains **only frontend code**.
- Backend services, ticketing logic, agent assignment, AI behavior, and persistence are owned by a separate system.
- The frontend must not re-implement or infer backend business logic.
- All authoritative conversation state comes from backend responses.

## Non-Goals

- Implementing backend APIs or ticket logic
- Managing agent assignment rules
- Client-side state (e.g., Redux) is used only for temporary UI state and rendering, not as an authoritative data store.


