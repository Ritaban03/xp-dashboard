import { type GameState, LEVEL_REQUIREMENTS, getLeague } from "@shared/schema";
import { TrendingUp, Target } from "lucide-react";

interface LevelProgressProps {
  gameState: GameState;
}

export default function LevelProgress({ gameState }: LevelProgressProps) {
  const currentLevel = gameState.currentLevel;
  const currentXP = gameState.currentXP;
  const nextLevel = currentLevel + 1;
  
  const currentLevelXP = LEVEL_REQUIREMENTS[currentLevel as keyof typeof LEVEL_REQUIREMENTS] || 0;
  const nextLevelXP = LEVEL_REQUIREMENTS[nextLevel as keyof typeof LEVEL_REQUIREMENTS] || currentXP + 1000;
  
  const progressXP = currentXP - currentLevelXP;
  const requiredXP = nextLevelXP - currentLevelXP;
  const progressPercent = Math.min((progressXP / requiredXP) * 100, 100);
  const remainingXP = nextLevelXP - currentXP;

  // Get upcoming level milestones
  const getUpcomingMilestones = () => {
    const milestones = [];
    for (let i = 1; i <= 5; i++) {
      const level = currentLevel + i;
      if (LEVEL_REQUIREMENTS[level as keyof typeof LEVEL_REQUIREMENTS]) {
        const league = getLeague(level);
        milestones.push({
          level,
          xp: LEVEL_REQUIREMENTS[level as keyof typeof LEVEL_REQUIREMENTS],
          title: league.title,
          color: league.color,
          badge: league.badge
        });
      }
    }
    return milestones;
  };

  const milestones = getUpcomingMilestones();

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

      {/* Upcoming Level Milestones */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="text-orange-500" />
          Upcoming Milestones
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {milestones.map((milestone, index) => (
            <div key={milestone.level} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold">Level {milestone.level}</span>
                <span className="text-xl">{milestone.badge}</span>
              </div>
              <div className={`text-sm font-medium ${milestone.color} mb-1`}>
                {milestone.title}
              </div>
              <div className="text-xs text-slate-400">
                {milestone.xp.toLocaleString()} XP Required
              </div>
              {index === 0 && (
                <div className="mt-2 text-xs text-green-400">
                  {remainingXP.toLocaleString()} XP to go!
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
