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
    <div className="bg-card-dark rounded-xl p-4 md:p-6 border border-slate-700 mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${getAvatarGradient(gameState.currentLevel)} rounded-full flex items-center justify-center border-2 border-slate-600`}>
            <span className="text-lg sm:text-2xl font-bold text-white">{getAvatarInitials()}</span>
          </div>
          {/* League Badge */}
          <div className="absolute -top-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-electric to-neon-purple rounded-full flex items-center justify-center text-sm sm:text-lg">
            {league.badge}
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Player</h2>
            <Crown className={`w-4 h-4 sm:w-5 sm:h-5 ${league.color}`} />
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`font-semibold text-sm sm:text-base ${league.color}`}>{league.title}</span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-400 text-sm sm:text-base">Level {gameState.currentLevel}</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-400">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-xp-gold" />
              <span>{gameState.currentXP.toLocaleString()} Total XP</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>{gameState.todayXP} XP Today</span>
            </div>
          </div>
        </div>

        {/* Quick Stats - Mobile optimized */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 text-center w-full sm:w-auto">
          <div className="bg-slate-800 rounded-lg p-2 sm:p-3">
            <div className="text-lg sm:text-xl font-bold text-electric">{gameState.currentLevel}</div>
            <div className="text-xs text-slate-400">Level</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-2 sm:p-3">
            <div className="text-lg sm:text-xl font-bold text-neon-purple">{league.key.toUpperCase()}</div>
            <div className="text-xs text-slate-400">League</div>
          </div>
        </div>
      </div>
    </div>
  );
}