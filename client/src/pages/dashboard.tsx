import { useGameState } from "@/hooks/use-game-state";
import ActionButtons from "@/components/action-buttons";
import LevelProgress from "@/components/level-progress";
import TodoList from "@/components/todo-list";
import ChallengeTimer from "@/components/challenge-timer";
import AnalyticsDashboard from "@/components/analytics-dashboard";
import UserProfile from "@/components/user-profile";
import { Star, Flame, Gamepad2 } from "lucide-react";

export default function Dashboard() {
  const { gameState, isLoading } = useGameState();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-electric"></div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-white text-xl">Failed to load game state</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-electric to-neon-purple bg-clip-text text-transparent">
            Level Up Dashboard
          </h1>
          
          {/* User Profile Section */}
          <UserProfile gameState={gameState} />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Actions & Progress */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Action Buttons Section */}
            <div className="bg-card-dark rounded-xl p-6 border border-slate-700">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Gamepad2 className="text-electric" />
                Action Center
              </h2>
              <ActionButtons />
            </div>

            {/* Level Progress */}
            <LevelProgress gameState={gameState} />

            {/* Custom Todo List */}
            <TodoList />
          </div>

          {/* Right Column: Challenges & Stats */}
          <div className="space-y-8">
            <ChallengeTimer />
            <AnalyticsDashboard />
          </div>
        </div>
      </div>
    </div>
  );
}
