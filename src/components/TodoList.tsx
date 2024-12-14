"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { todoService } from '@/services/todo-service'
import { Todo, TodoEvent } from '@/types/todo'
import { Edit, ListTodo, Plus, Save, Trash2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'

export function TodoList() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [newTodoDescription, setNewTodoDescription] = useState('');
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

    // Fetch initial todos and setup event source
    useEffect(() => {
        todoService.getTodos()
            .then(setTodos)
            .catch(console.error);

        const eventSource = todoService.subscribeToTodoUpdates((event) => {
            const data: TodoEvent = JSON.parse(event.data);

            switch (data.type) {
                case 'init':
                    if (data.todos) setTodos(data.todos);
                    break;
                case 'create':
                    if (data.todo) setTodos(prev => [...prev, data.todo!]);
                    break;
                case 'update':
                    if (data.todo) {
                        setTodos(prev =>
                            prev.map(todo =>
                                todo.id === data.todo!.id ? data.todo! : todo
                            )
                        );
                    }
                    break;
                case 'delete':
                    if (data.id) {
                        setTodos(prev =>
                            prev.filter(todo => todo.id !== data.id)
                        );
                    }
                    break;
            }
        });

        return () => eventSource.close();
    }, []);

    const handleCreateTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodoTitle.trim()) return;

        try {
            await todoService.createTodo({
                title: newTodoTitle,
                description: newTodoDescription
            });

            setNewTodoTitle('');
            setNewTodoDescription('');
            setIsCreateDialogOpen(false);
        } catch (error) {
            console.error('Error creating todo:', error);
        }
    };

    const toggleTodoCompletion = async (todo: Todo) => {
        try {
            await todoService.updateTodo(todo.id, {
                completed: !todo.completed
            });
        } catch (error) {
            console.error('Error updating todo:', error);
        }
    };

    const confirmDeleteTodo = (todoId: string) => {
        setDeleteConfirmationId(todoId);
    };

    const deleteTodo = async () => {
        if (!deleteConfirmationId) return;

        try {
            await todoService.deleteTodo(deleteConfirmationId);
            setDeleteConfirmationId(null);
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    };

    const startEditing = (todo: Todo) => {
        setEditingTodo({ ...todo });
    };

    const updateEditingTodo = (field: keyof Todo, value: string) => {
        if (editingTodo) {
            setEditingTodo(prev => ({
                ...prev!,
                [field]: value
            }));
        }
    };

    const saveEditedTodo = async () => {
        if (!editingTodo) return;

        try {
            await todoService.updateTodo(editingTodo.id, {
                title: editingTodo.title,
                description: editingTodo.description
            });

            setEditingTodo(null);
        } catch (error) {
            console.error('Error saving todo:', error);
        }
    };

    return (
        <TooltipProvider>
            <div className="max-w-xl mx-auto p-6 space-y-6">
                {/* Page Title */}
                <h1 className="text-xl font-thin text-left mb-4">To-Do</h1>

                <Separator></Separator>
                {/* Create Todo Dialog Trigger */}
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full font-thin p-6">
                            <Plus className="h-4 w-4" /> Create New Todo
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center">
                                <ListTodo className="mr-2 h-5 w-5 text-primary" />
                                Create New Todo
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateTodo} className="space-y-4">
                            <Input
                                value={newTodoTitle}
                                onChange={(e) => setNewTodoTitle(e.target.value)}
                                placeholder="Todo title"
                                required
                            />
                            <Input
                                value={newTodoDescription}
                                onChange={(e) => setNewTodoDescription(e.target.value)}
                                placeholder="Description (optional)"
                                className="text-muted-foreground"
                            />
                            <DialogFooter>
                                <Button type="submit" className="w-full">
                                    <Plus className="mr-2 h-4 w-4" /> Add Todo
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Todo List */}
                <div className="space-y-4">
                    {todos.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            No todos yet. Create your first todo!
                        </div>
                    ) : (
                        todos.map(todo => (
                            <Card
                                key={todo.id}
                                className={cn(
                                    "shadow-sm transition-all duration-300 ease-in-out",
                                    todo.completed
                                        ? "opacity-60 hover:opacity-80 border-muted"
                                        : "hover:border-primary"
                                )}
                            >
                                {editingTodo && editingTodo.id === todo.id ? (
                                    <>
                                        <CardContent className="pt-6 space-y-4">
                                            <Input
                                                value={editingTodo.title}
                                                onChange={(e) => updateEditingTodo('title', e.target.value)}
                                                placeholder="Todo title"
                                                required
                                            />
                                            <Input
                                                value={editingTodo.description || ''}
                                                onChange={(e) => updateEditingTodo('description', e.target.value)}
                                                placeholder="Description (optional)"
                                                className="text-muted-foreground"
                                            />
                                        </CardContent>
                                        <Separator className="my-2" />
                                        <CardFooter className="flex justify-between">
                                            <Button
                                                variant="outline"
                                                onClick={() => setEditingTodo(null)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button onClick={saveEditedTodo}>
                                                <Save className="mr-2 h-4 w-4" /> Save
                                            </Button>
                                        </CardFooter>
                                    </>
                                ) : (
                                    <>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                            <div className="flex items-center space-x-3">
                                                <Checkbox
                                                    checked={todo.completed}
                                                    onCheckedChange={() => toggleTodoCompletion(todo)}
                                                />
                                                <h3 className={cn(
                                                    "text-sm font-medium capitalize",
                                                    todo.completed ? "line-through text-muted-foreground" : ""
                                                )}>
                                                    {todo.title}
                                                </h3>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => startEditing(todo)}
                                                        >
                                                            <Edit className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Edit todo</TooltipContent>
                                                </Tooltip>

                                                <Dialog>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => confirmDeleteTodo(todo.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
                                                                </Button>
                                                            </DialogTrigger>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Delete todo</TooltipContent>
                                                    </Tooltip>

                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Delete Todo</DialogTitle>
                                                            <DialogDescription>
                                                                Are you sure you want to delete this todo?
                                                                This action cannot be undone.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <DialogFooter>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => setDeleteConfirmationId(null)}
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                onClick={deleteTodo}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </CardHeader>

                                        {todo.description && (
                                            <CardContent>
                                                <p className={cn(
                                                    "text-xs text-muted-foreground capitalize ",
                                                    todo.completed ? "line-through" : ""
                                                )}>
                                                    {todo.description}
                                                </p>
                                            </CardContent>
                                        )}
                                    </>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </TooltipProvider>
    );
}