import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { CheckSquare, Plus, Trash2 } from "lucide-react";
import { type Todo } from "@shared/schema";

export default function TodoList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTodo, setNewTodo] = useState({ title: "", xpValue: 10 });

  const { data: todos = [], isLoading } = useQuery({
    queryKey: ["/api/todos"],
    queryFn: async () => {
      const response = await fetch("/api/todos?userId=default");
      return response.json();
    },
  });

  const createTodoMutation = useMutation({
    mutationFn: async (todo: { title: string; xpValue: number }) => {
      const response = await apiRequest("POST", "/api/todos", {
        ...todo,
        userId: "default",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      setNewTodo({ title: "", xpValue: 10 });
      setIsDialogOpen(false);
      toast({
        title: "Task Added! 📝",
        description: "Your new task has been added to your list.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const response = await apiRequest("PATCH", `/api/todos/${id}`, { completed });
      return response.json();
    },
    onSuccess: (updatedTodo: Todo) => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/game-state"] });
      
      if (updatedTodo.completed) {
        toast({
          title: "Task Complete! 🎉",
          description: `You earned ${updatedTodo.xpValue} XP!`,
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/todos/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      toast({
        title: "Task Deleted",
        description: "Task has been removed from your list.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddTodo = () => {
    if (!newTodo.title.trim()) return;
    createTodoMutation.mutate(newTodo);
  };

  const handleToggleComplete = (id: string, completed: boolean) => {
    updateTodoMutation.mutate({ id, completed: !completed });
  };

  const handleDeleteTodo = (id: string) => {
    deleteTodoMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="bg-card-dark rounded-xl p-6 border border-slate-700">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card-dark rounded-xl p-6 border border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CheckSquare className="text-green-500" />
          Custom Tasks
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card-dark border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white">Task Title</Label>
                <Input
                  id="title"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task description..."
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="xp" className="text-white">XP Reward</Label>
                <Input
                  id="xp"
                  type="number"
                  value={newTodo.xpValue}
                  onChange={(e) => setNewTodo(prev => ({ ...prev, xpValue: parseInt(e.target.value) || 10 }))}
                  min="1"
                  max="100"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <Button 
                onClick={handleAddTodo} 
                disabled={createTodoMutation.isPending || !newTodo.title.trim()}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {createTodoMutation.isPending ? "Adding..." : "Add Task"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {todos.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tasks yet. Add your first task to get started!</p>
          </div>
        ) : (
          todos.map((todo: Todo) => (
            <div 
              key={todo.id} 
              className={`flex items-center gap-3 p-3 bg-slate-800 rounded-lg group hover:bg-slate-750 transition-colors ${
                todo.completed ? 'opacity-75' : ''
              }`}
            >
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => handleToggleComplete(todo.id, todo.completed)}
                className="w-5 h-5 text-green-500 bg-slate-700 border-slate-600 rounded focus:ring-green-500 focus:ring-2"
              />
              <span className={`flex-1 ${todo.completed ? 'line-through text-slate-500' : ''}`}>
                {todo.title}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                todo.completed 
                  ? 'bg-green-800 text-green-300' 
                  : 'bg-slate-700 text-xp-gold'
              }`}>
                {todo.completed ? '✓' : '+'}{todo.xpValue} XP
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
