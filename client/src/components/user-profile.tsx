import { type GameState, getLeague } from "@shared/schema";
import { User, Crown, TrendingUp } from "lucide-react";

interface UserProfileProps {
  gameState: GameState;
}

export default function UserProfile({ gameState }: UserProfileProps) {
  const league = getLeague(gameState.currentLevel);
  
  // Generate avatar based on level
  const getAvatarGradient = (level: number): string => {
    if (level <= 5) return "from-gray-400 to-gray-600";
    if (level <= 10) return "from-orange-400 to-orange-600";
    if (level <= 15) return "from-gray-300 to-gray-500";
    if (level <= 25) return "from-yellow-400 to-yellow-600";
    if (level <= 35) return "from-blue-400 to-blue-600";
    if (level <= 45) return "from-cyan-400 to-cyan-600";
    return "from-purple-400 to-purple-600";
  };

  const getAvatarInitials = (): string => {
    return `L${gameState.currentLevel}`;
  };

  return (
    <div className="bg-card-dark rounded-xl p-6 border border-slate-700 mb-8">
      <div className="flex items-center gap-6">
        {/* Avatar */}
        <div className="relative">
          <div className={`w-20 h-20 bg-gradient-to-br ${getAvatarGradient(gameState.currentLevel)} rounded-full flex items-center justify-center border-2 border-slate-600`}>
            <span className="text-2xl font-bold text-white">{getAvatarInitials()}</span>
          </div>
          {/* League Badge */}
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-r from-electric to-neon-purple rounded-full flex items-center justify-center text-lg">
            {league.badge}
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-white">Player</h2>
            <Crown className={`w-5 h-5 ${league.color}`} />
          </div>
          
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-semibold ${league.color}`}>{league.title}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-400">Level {gameState.currentLevel}</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-xp-gold" />
              <span>{gameState.currentXP.toLocaleString()} Total XP</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>{gameState.todayXP} XP Today</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-xl font-bold text-electric">{gameState.currentLevel}</div>
            <div className="text-xs text-slate-400">Current Level</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-xl font-bold text-neon-purple">{league.key.toUpperCase()}</div>
            <div className="text-xs text-slate-400">League</div>
          </div>
        </div>
      </div>
    </div>
  );
}