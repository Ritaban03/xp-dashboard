import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Save } from "lucide-react";

export default function UserIdSetup() {
  const [userId, setUserId] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      setUserId(savedUserId);
    } else {
      setIsEditing(true);
    }
  }, []);

  const handleSave = () => {
    if (userId.trim()) {
      localStorage.setItem('userId', userId.trim());
      setIsEditing(false);
    }
  };

  const handleChange = () => {
    setIsEditing(true);
  };

  if (!isEditing) {
    return (
      <div className="bg-card-dark rounded-xl p-4 border border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-slate-300">User ID:</span>
            <span className="font-mono text-blue-400">{userId}</span>
          </div>
          <Button onClick={handleChange} size="sm" variant="outline">
            Change
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card-dark rounded-xl p-4 border border-slate-700">
      <div className="flex items-center gap-2 mb-2">
        <User className="w-4 h-4 text-blue-400" />
        <span className="text-sm text-slate-300">Set User ID for data persistence:</span>
      </div>
      <div className="flex gap-2">
        <Input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter user ID (e.g., your name)"
          className="flex-1"
        />
        <Button onClick={handleSave} size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>
      </div>
      <p className="text-xs text-slate-400 mt-2">
        This ID ensures your data persists across sessions and device changes.
      </p>
    </div>
  );
}
