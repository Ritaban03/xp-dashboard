import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Activity } from "lucide-react";

export default function AnalyticsDashboard() {
  const { data: todayActions = [] } = useQuery({
    queryKey: ["/api/actions", "today"],
    queryFn: async () => {
      const response = await fetch("/api/actions/today?userId=default");
      return response.json();
    },
  });

  const { data: actionStats = {} } = useQuery({
    queryKey: ["/api/actions", "stats"],
    queryFn: async () => {
      const response = await fetch("/api/actions/stats?userId=default&days=7");
      return response.json();
    },
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ["/api/achievements"],
    queryFn: async () => {
      const response = await fetch("/api/achievements?userId=default");
      return response.json();
    },
  });

  // Calculate today's stats by action type
  const todayStats = todayActions.reduce((acc: Record<string, { count: number; xp: number }>, action: any) => {
    if (!acc[action.type]) {
      acc[action.type] = { count: 0, xp: 0 };
    }
    acc[action.type].count++;
    acc[action.type].xp += action.xpValue;
    return acc;
  }, {});

  const actionConfig = {
    dm: { label: "Cold DMs", color: "text-blue-500", bgColor: "bg-blue-500" },
    loom: { label: "Looms Sent", color: "text-purple-500", bgColor: "bg-purple-500" },
    call: { label: "Calls Booked", color: "text-green-500", bgColor: "bg-green-500" },
    client: { label: "Clients Closed", color: "text-yellow-500", bgColor: "bg-yellow-500" },
    content: { label: "Content Written", color: "text-indigo-500", bgColor: "bg-indigo-500" },
    system: { label: "Systems Created", color: "text-red-500", bgColor: "bg-red-500" },
  };

  // Calculate activity breakdown percentages
  const totalActions = Object.values(actionStats).reduce((sum: number, count: any) => sum + count, 0);
  const activityBreakdown = Object.entries(actionStats).map(([type, count]) => ({
    type,
    count: count as number,
    percentage: totalActions > 0 ? Math.round(((count as number) / totalActions) * 100) : 0,
    config: actionConfig[type as keyof typeof actionConfig] || { label: type, color: "text-gray-500", bgColor: "bg-gray-500" }
  })).sort((a, b) => b.count - a.count);

  return (
    <>
      {/* Quick Stats */}
      <div className="bg-card-dark rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="text-blue-500" />
          Today's Stats
        </h2>
        
        <div className="space-y-4">
          {Object.entries(todayStats).map(([type, stats]) => {
            const config = actionConfig[type as keyof typeof actionConfig];
            if (!config) return null;
            
            return (
              <div key={type} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Activity className={`w-4 h-4 ${config.color}`} />
                  <span className="text-sm">{config.label}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{stats.count}</div>
                  <div className="text-xs text-green-500">+{stats.xp} XP</div>
                </div>
              </div>
            );
          })}
          
          {Object.keys(todayStats).length === 0 && (
            <div className="text-center py-4 text-slate-400">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No actions recorded today</p>
              <p className="text-xs">Start taking actions to see your stats!</p>
            </div>
          )}
        </div>
      </div>

      {/* Activity Breakdown */}
      <div className="bg-card-dark rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="text-electric" />
          This Week
        </h2>
        
        <div className="space-y-3">
          {activityBreakdown.length > 0 ? (
            activityBreakdown.map(({ type, count, percentage, config }) => (
              <div key={type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-2 text-sm">
                    <div className={`w-3 h-3 ${config.bgColor} rounded`}></div>
                    {config.label}
                  </span>
                  <span className="font-semibold text-sm">{percentage}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className={`${config.bgColor} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-slate-400">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No activity this week</p>
              <p className="text-xs">Complete some actions to see your breakdown!</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-card-dark rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-yellow-500">🏆</span>
          Achievements
        </h2>
        
        <div className="space-y-3">
          {achievements.length > 0 ? (
            achievements.slice(0, 3).map((achievement: any) => (
              <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg border border-yellow-700/50">
                <span className="text-yellow-500 text-xl">🏅</span>
                <div>
                  <div className="font-semibold text-sm">{achievement.title}</div>
                  <div className="text-xs text-slate-400">{achievement.description}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-slate-400">
              <span className="text-4xl mb-2 block opacity-50">🏆</span>
              <p className="text-sm">No achievements yet</p>
              <p className="text-xs">Keep grinding to unlock your first achievement!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
