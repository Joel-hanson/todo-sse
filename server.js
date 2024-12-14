const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage (replace with a database in production)
let todos = [];
const clients = new Set();

app.use(cors());
app.use(bodyParser.json());

// SSE endpoint for real-time updates
app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-open');

    // Send initial state to the new client
    const initialEvent = {
        type: 'init',
        todos: todos
    };
    res.write(`data: ${JSON.stringify(initialEvent)}\n\n`);

    // Add client to the set of active clients
    clients.add(res);

    // Remove client when connection closes
    req.on('close', () => {
        clients.delete(res);
    });
});

// Broadcast updates to all connected clients
function broadcastUpdate(type, data) {
    const event = { type, ...data };
    clients.forEach(client => {
        client.write(`data: ${JSON.stringify(event)}\n\n`);
    });
}

// Create a new todo
app.post('/todos', (req, res) => {
    const { title, description } = req.body;
    const newTodo = {
        id: Date.now().toString(),
        title,
        description,
        completed: false,
        createdAt: new Date().toISOString()
    };

    todos.push(newTodo);
    broadcastUpdate('create', { todo: newTodo });

    res.status(201).json(newTodo);
});

// Update an existing todo
app.patch('/todos/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const todoIndex = todos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
        return res.status(404).json({ error: 'Todo not found' });
    }

    todos[todoIndex] = { ...todos[todoIndex], ...updates };
    broadcastUpdate('update', { todo: todos[todoIndex] });

    res.json(todos[todoIndex]);
});

// Delete a todo
app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;

    const todoIndex = todos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
        return res.status(404).json({ error: 'Todo not found' });
    }

    const deletedTodo = todos.splice(todoIndex, 1)[0];
    broadcastUpdate('delete', { id: deletedTodo.id });

    res.status(200).json({ message: 'Todo deleted successfully' });
});

// Get all todos
app.get('/todos', (req, res) => {
    res.json(todos);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;