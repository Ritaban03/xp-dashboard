import { Trophy, Crown, Star } from "lucide-react";

const LEAGUE_REQUIREMENTS = [
  { name: "Rookie", badge: "🥉", color: "text-gray-400", minLevel: 1, minXP: 0 },
  { name: "Bronze", badge: "🥉", color: "text-orange-400", minLevel: 6, minXP: 500 },
  { name: "Silver", badge: "🥈", color: "text-gray-300", minLevel: 11, minXP: 1500 },
  { name: "Gold", badge: "🥇", color: "text-yellow-400", minLevel: 16, minXP: 3500 },
  { name: "Platinum", badge: "💎", color: "text-blue-400", minLevel: 26, minXP: 8000 },
  { name: "Diamond", badge: "💎", color: "text-cyan-400", minLevel: 36, minXP: 16000 },
  { name: "Master", badge: "👑", color: "text-purple-400", minLevel: 46, minXP: 30000 }
];

export default function LeagueRequirements() {
  return (
    <div className="bg-card-dark rounded-xl p-4 md:p-6 border border-slate-700">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2">
        <Trophy className="text-yellow-500" />
        League Requirements
      </h2>
      
      <div className="space-y-3">
        {LEAGUE_REQUIREMENTS.map((league, index) => (
          <div 
            key={league.name}
            className="flex items-center justify-between p-3 md:p-4 bg-slate-800 rounded-lg border border-slate-700"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-electric to-neon-purple rounded-full flex items-center justify-center text-lg md:text-xl">
                {league.badge}
              </div>
              <div>
                <div className={`font-bold text-sm md:text-base ${league.color}`}>
                  {league.name} League
                </div>
                <div className="text-xs md:text-sm text-slate-400">
                  Level {league.minLevel}+ • {league.minXP.toLocaleString()} XP
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {index === 0 && <Star className="w-4 h-4 text-yellow-500" />}
              {index === LEAGUE_REQUIREMENTS.length - 1 && <Crown className="w-4 h-4 text-purple-500" />}
              <div className="text-right">
                <div className="text-sm font-bold text-slate-300">
                  {league.minLevel === 1 ? "Starting" : `Level ${league.minLevel}`}
                </div>
                <div className="text-xs text-slate-500">
                  {league.minXP === 0 ? "0 XP" : `${league.minXP.toLocaleString()} XP`}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-600">
        <div className="text-xs md:text-sm text-slate-400">
          <strong className="text-electric">Pro Tip:</strong> Each league unlocks special titles and gives you bragging rights. Keep grinding to reach Master League! 👑
        </div>
      </div>
    </div>
  );
}