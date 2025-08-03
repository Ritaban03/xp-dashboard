import { type GameState, LEVEL_REQUIREMENTS } from "@shared/schema";
import { TrendingUp } from "lucide-react";

interface LevelProgressProps {
  gameState: GameState;
}

export default function LevelProgress({ gameState }: LevelProgressProps) {
  const currentLevel = gameState.currentLevel;
  const currentXP = gameState.currentXP;
  const nextLevel = currentLevel + 1;
  
  const currentLevelXP = LEVEL_REQUIREMENTS[currentLevel] || 0;
  const nextLevelXP = LEVEL_REQUIREMENTS[nextLevel] || currentXP + 1000;
  
  const progressXP = currentXP - currentLevelXP;
  const requiredXP = nextLevelXP - currentLevelXP;
  const progressPercent = Math.min((progressXP / requiredXP) * 100, 100);
  const remainingXP = nextLevelXP - currentXP;

  const getLevelTitle = (level: number): string => {
    if (level <= 2) return "Beginner";
    if (level <= 5) return "Hustler";
    if (level <= 8) return "Sales Pro";
    if (level <= 10) return "Elite Closer";
    if (level <= 15) return "Business Master";
    if (level <= 20) return "Industry Legend";
    return "Legendary Boss";
  };

  return (
    <div className="bg-card-dark rounded-xl p-6 border border-slate-700">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <TrendingUp className="text-neon-purple" />
        Level Progress
      </h2>
      
      {/* Current Level Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">Level {currentLevel} → Level {nextLevel}</span>
          <span className="text-sm text-slate-400">
            {progressXP} / {requiredXP} XP
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-electric to-neon-purple h-full transition-all duration-700 ease-out relative" 
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
          </div>
        </div>
        <p className="text-sm text-slate-400 mt-2">
          {remainingXP > 0 ? `${remainingXP} XP needed for next level` : "Max level reached!"}
        </p>
      </div>

      {/* Level Milestones */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-slate-800 rounded-lg">
          <div className="text-2xl font-bold text-green-500">{nextLevel}</div>
          <div className="text-sm text-slate-400">Next Level</div>
          <div className="text-xs text-slate-500">{getLevelTitle(nextLevel)}</div>
        </div>
        <div className="text-center p-4 bg-slate-800 rounded-lg">
          <div className="text-2xl font-bold text-blue-500">{Math.min(currentLevel + 3, 25)}</div>
          <div className="text-sm text-slate-400">Milestone</div>
          <div className="text-xs text-slate-500">{getLevelTitle(Math.min(currentLevel + 3, 25))}</div>
        </div>
        <div className="text-center p-4 bg-slate-800 rounded-lg">
          <div className="text-2xl font-bold text-purple-500">{Math.min(currentLevel + 8, 25)}</div>
          <div className="text-sm text-slate-400">Major Goal</div>
          <div className="text-xs text-slate-500">{getLevelTitle(Math.min(currentLevel + 8, 25))}</div>
        </div>
      </div>
    </div>
  );
}
