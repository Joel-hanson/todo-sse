# Real-Time TODO Application

This is a **real-time TODO application** built with **Next.js** for the frontend and **Node.js** for the backend. It uses **Server-Sent Events (SSE)** to provide real-time updates, allowing todos to sync seamlessly across connected clients. This repository serves as a demonstration of how SSE can be used to push updates to all clients in real time.

---

## Features

- **Real-Time Updates**: Automatically syncs todos across clients using Server-Sent Events (SSE).
- **CRUD Operations**: Create, read, update, and delete todos.
- **Responsive UI**: Built with modern UI components.
- **Event-Driven Backend**: Updates are pushed from the backend to the frontend in real time.

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js**: >= 14.x
- **npm**: >= 6.x

---

### Installation

```bash
npm install
```

---

### Scripts

- **Start development environment:**

  ```bash
  npm run dev
  ```

  This will run both the Next.js frontend and the Node.js backend concurrently.

- **Run the frontend (Next.js):**

  ```bash
  npm run next-dev
  ```

- **Run the backend (Node.js):**

  ```bash
  npm run node-dev
  ```

- **Build for production:**

  ```bash
  npm run build
  ```

- **Start production server:**

  ```bash
  npm start
  ```

- **Lint the code:**

  ```bash
  npm run lint
  ```

---

## How It Works

### Frontend

The frontend is built with **Next.js** and uses components from a UI library (e.g., `@/components/ui/button`, `@/components/ui/card`) to create a responsive and interactive UI.

### Backend

The backend is a **Node.js** application that:

- Serves the frontend application
- Exposes a REST API for todo management
- Broadcasts real-time updates to connected clients using **SSE**.

#### Core File: `server.js`

Handles:

- SSE event broadcasting
- REST API routes for CRUD operations

---

## Real-Time Flow

1. **Frontend**:
   - Establishes an SSE connection with the backend using `EventSource`.
   - Updates the UI in response to events (`create`, `update`, `delete`).

2. **Backend**:
   - On todo changes, broadcasts updates to all connected clients via SSE.
   - Ensures data consistency by maintaining a central todo store.

---

## API Endpoints

### Base URL

`http://localhost:3000`

### Endpoints

#### `GET /todos`

- Fetch all todos.

#### `POST /todos`

- Create a new todo.
- **Request Body:**

  ```json
  {
    "title": "string",
    "description": "string",
    "completed": "boolean"
  }
  ```

#### `PUT /todos/:id`

- Update an existing todo.
- **Request Body:**

  ```json
  {
    "title": "string",
    "description": "string",
    "completed": "boolean"
  }
  ```

#### `DELETE /todos/:id`

- Delete a todo by ID.

#### `GET /events`

- Subscribe to SSE events for real-time updates.

---

## Future Enhancements

- Add user authentication.
- Implement WebSockets for bidirectional communication.
- Persist todos in a database (e.g., MongoDB, PostgreSQL).
- Add support for notifications and reminders.
