export interface Todo {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    createdAt: string;
}

export interface TodoCreateDto {
    title: string;
    description?: string;
}

export interface TodoUpdateDto {
    title?: string;
    description?: string;
    completed?: boolean;
}

export type TodoEventType = 'init' | 'create' | 'update' | 'delete';

export interface TodoEvent {
    type: TodoEventType;
    todos?: Todo[];
    todo?: Todo;
    id?: string;
}