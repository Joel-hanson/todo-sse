import { Todo, TodoCreateDto, TodoUpdateDto } from '@/types/todo';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const todoService = {
    async getTodos(): Promise<Todo[]> {
        const response = await fetch(`${API_URL}/todos`);
        if (!response.ok) {
            throw new Error('Failed to fetch todos');
        }
        return response.json();
    },

    async createTodo(todo: TodoCreateDto): Promise<Todo> {
        const response = await fetch(`${API_URL}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(todo),
        });

        if (!response.ok) {
            throw new Error('Failed to create todo');
        }
        return response.json();
    },

    async updateTodo(id: string, updates: TodoUpdateDto): Promise<Todo> {
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            throw new Error('Failed to update todo');
        }
        return response.json();
    },

    async deleteTodo(id: string): Promise<void> {
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete todo');
        }
    },

    subscribeToTodoUpdates(onMessage: (event: MessageEvent) => void): EventSource {
        const eventSource = new EventSource(`${API_URL}/events`);
        eventSource.onmessage = onMessage;
        return eventSource;
    },
};