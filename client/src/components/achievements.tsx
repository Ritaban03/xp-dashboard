import { useQuery } from "@tanstack/react-query";
import { Trophy, Target, TrendingUp, Award, BarChart3 } from "lucide-react";

interface PomodoroSession {
  id: string;
  challengeType: string;
  startTime: string;
  duration: number;
  actionsCompleted: number;
  xpEarned: number;
  bonusXp: number;
  completed: boolean;
  createdAt: string;
}

interface GameState {
  currentXP: number;
  currentLevel: number;
  todayXP: number;
}

const ACHIEVEMENTS = [
  { id: 'first_session', title: 'First Focus Session', description: 'Complete your first Pomodoro session', xp: 50 },
  { id: 'dm_master', title: 'DM Master', description: 'Send 10+ DMs in a single session', xp: 100 },
  { id: 'loom_expert', title: 'Loom Expert', description: 'Record 5+ Loom videos in a session', xp: 150 },
  { id: 'speed_demon', title: 'Speed Demon', description: 'Complete a session in under 10 minutes', xp: 200 },
  { id: 'consistency_king', title: 'Consistency King', description: 'Complete 5 sessions in a week', xp: 300 },
];

export default function Achievements() {
  // Get user ID from localStorage or use default
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || 'default' : 'default';

  const { data: gameState } = useQuery({
    queryKey: ["/api/game-state", userId],
    queryFn: async () => {
      const response = await fetch(`/api/game-state?userId=${userId}`);
      return response.json();
    },
  });

  const { data: pomodoroRecords = [] } = useQuery({
    queryKey: ["/api/pomodoro/records", userId],
    queryFn: async () => {
      const response = await fetch(`/api/pomodoro/records?userId=${userId}`);
      return response.json();
    },
  });

  const { data: actionStats = {} } = useQuery({
    queryKey: ["/api/actions/stats", userId],
    queryFn: async () => {
      const response = await fetch(`/api/actions/stats?userId=${userId}&days=7`);
      return response.json();
    },
  });

  // Calculate achievements
  const calculateAchievements = () => {
    if (!pomodoroRecords.length) return [];
    
    const completedSessions = pomodoroRecords.filter((session: PomodoroSession) => session.completed);
    const totalSessions = completedSessions.length;
    const totalActions = completedSessions.reduce((sum: number, session: PomodoroSession) => sum + session.actionsCompleted, 0);
    const avgActions = totalSessions > 0 ? totalActions / totalSessions : 0;
    
    const achievements = [];
    
    if (totalSessions >= 1) achievements.push(ACHIEVEMENTS[0]);
    if (avgActions >= 10) achievements.push(ACHIEVEMENTS[1]);
    if (avgActions >= 5) achievements.push(ACHIEVEMENTS[2]);
    
    // Check for speed demon (sessions under 10 minutes)
    const fastSessions = completedSessions.filter((session: PomodoroSession) => session.duration < 600);
    if (fastSessions.length > 0) achievements.push(ACHIEVEMENTS[3]);
    
    // Check for consistency (5+ sessions in a week)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentSessions = completedSessions.filter((session: PomodoroSession) => 
      new Date(session.createdAt) > weekAgo
    );
    if (recentSessions.length >= 5) achievements.push(ACHIEVEMENTS[4]);
    
    return achievements;
  };

  const achievements = calculateAchievements();

  // Get session performance data for charts
  const getSessionPerformance = () => {
    const completedSessions = pomodoroRecords.filter((session: PomodoroSession) => session.completed);
    
    // Group by challenge type
    const dmSessions = completedSessions.filter((s: PomodoroSession) => s.challengeType === 'dm_sprint');
    const loomSessions = completedSessions.filter((s: PomodoroSession) => s.challengeType === 'loom_marathon');
    
    return {
      dm: dmSessions.map((s: PomodoroSession) => s.actionsCompleted),
      loom: loomSessions.map((s: PomodoroSession) => s.actionsCompleted),
    };
  };

  const performance = getSessionPerformance();

  return (
    <div className="bg-card-dark rounded-xl p-6 border border-slate-700">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Trophy className="text-yellow-500" />
        Achievements & Performance
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* XP & Level Stats */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="text-green-500" />
            Progress Overview
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{gameState?.currentLevel || 1}</div>
              <div className="text-sm text-slate-400">Current Level</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{gameState?.currentXP || 0}</div>
              <div className="text-sm text-slate-400">Total XP</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{gameState?.todayXP || 0}</div>
              <div className="text-sm text-slate-400">Today's XP</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">{pomodoroRecords.filter((s: PomodoroSession) => s.completed).length}</div>
              <div className="text-sm text-slate-400">Sessions Completed</div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Award className="text-yellow-500" />
            Unlocked Achievements
          </h3>
          
          <div className="space-y-3">
            {achievements.length > 0 ? (
              achievements.map((achievement) => (
                <div key={achievement.id} className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-yellow-400">{achievement.title}</div>
                      <div className="text-sm text-yellow-300">{achievement.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-yellow-500">+{achievement.xp} XP</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 py-8">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p>Complete your first session to unlock achievements!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="text-blue-500" />
          Session Performance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DM Sprint Performance */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-3">DM Sprint Performance</h4>
            {performance.dm.length > 0 ? (
              <div className="space-y-2">
                {performance.dm.slice(-5).map((actions, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 text-sm text-slate-400">#{performance.dm.length - index}</div>
                    <div className="flex-1 bg-slate-700 rounded-full h-3">
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((actions / 20) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-right font-semibold text-blue-400">{actions}</div>
                  </div>
                ))}
                <div className="text-sm text-slate-400 mt-2">
                  Average: {Math.round(performance.dm.reduce((a, b) => a + b, 0) / performance.dm.length)} DMs/session
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-4">
                No DM Sprint sessions yet
              </div>
            )}
          </div>

          {/* Loom Marathon Performance */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h4 className="font-semibold text-purple-400 mb-3">Loom Marathon Performance</h4>
            {performance.loom.length > 0 ? (
              <div className="space-y-2">
                {performance.loom.slice(-5).map((actions, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 text-sm text-slate-400">#{performance.loom.length - index}</div>
                    <div className="flex-1 bg-slate-700 rounded-full h-3">
                      <div 
                        className="bg-purple-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((actions / 10) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-right font-semibold text-purple-400">{actions}</div>
                  </div>
                ))}
                <div className="text-sm text-slate-400 mt-2">
                  Average: {Math.round(performance.loom.reduce((a, b) => a + b, 0) / performance.loom.length)} Looms/session
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-4">
                No Loom Marathon sessions yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Action Stats */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="text-green-500" />
          Weekly Action Summary
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(actionStats).map(([actionType, count]) => (
            <div key={actionType} className="bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{count as number}</div>
              <div className="text-sm text-slate-400 capitalize">{actionType}s</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
