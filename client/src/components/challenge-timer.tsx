import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Timer, Play, Pause, BarChart3, Shuffle, Zap, Target, Clock } from "lucide-react";

interface PomodoroSession {
  id: string;
  challengeType: string;
  startTime: string;
  duration: number;
  actionsCompleted: number;
  xpEarned: number;
  bonusXp: number;
  completed: boolean;
}

const CHALLENGE_CONFIGS = {
  dm_sprint: {
    label: "DM Sprint",
    description: "Send as many DMs as possible in the time limit",
    durations: [5, 15, 25, 45],
    actionType: "dm",
    color: "bg-blue-600 hover:bg-blue-700"
  },
  loom_marathon: {
    label: "Loom Marathon", 
    description: "Record as many Loom videos as possible",
    durations: [5, 15, 25, 45],
    actionType: "loom",
    color: "bg-purple-600 hover:bg-purple-700"
  }
};

export default function ChallengeTimer() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSession, setActiveSession] = useState<PomodoroSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionActions, setSessionActions] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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

  // Start a new Pomodoro session
  const startSessionMutation = useMutation({
    mutationFn: async ({ challengeType, duration }: { challengeType: string; duration: number }) => {
      const response = await apiRequest("POST", "/api/pomodoro/start", {
        userId,
        challengeType,
        duration: duration * 60, // Convert minutes to seconds
        actionsCompleted: 0
      });
      return response.json();
    },
    onSuccess: (session: PomodoroSession) => {
      setActiveSession(session);
      setTimeRemaining(session.duration);
      setSessionActions(0);
      setIsPaused(false);
      queryClient.invalidateQueries({ queryKey: ["/api/pomodoro/records", userId] });
      toast({
        title: "Session Started! ⏰",
        description: `Your ${CHALLENGE_CONFIGS[session.challengeType as keyof typeof CHALLENGE_CONFIGS]?.label} session has begun!`,
      });
    },
  });

  // End the current session
  const endSessionMutation = useMutation({
    mutationFn: async ({ sessionId, actionsCompleted, completed }: { sessionId: string; actionsCompleted: number; completed: boolean }) => {
      const response = await apiRequest("POST", `/api/pomodoro/${sessionId}/end`, {
        actionsCompleted,
        completed
      });
      return response.json();
    },
    onSuccess: (session: PomodoroSession) => {
      setActiveSession(null);
      setTimeRemaining(0);
      setSessionActions(0);
      setIsPaused(false);
      queryClient.invalidateQueries({ queryKey: ["/api/game-state", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/pomodoro/records", userId] });
      
      const totalXP = session.xpEarned + session.bonusXp;
      toast({
        title: "Session Complete! 🎉",
        description: `You earned ${totalXP} XP! (${session.xpEarned} base + ${session.bonusXp} bonus)`,
      });
    },
  });

  // Timer countdown effect
  useEffect(() => {
    if (activeSession && timeRemaining > 0 && !isPaused) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Auto-complete session when time runs out
            if (activeSession) {
              endSessionMutation.mutate({
                sessionId: activeSession.id,
                actionsCompleted: sessionActions,
                completed: true
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeSession, timeRemaining, isPaused, sessionActions, endSessionMutation]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle action button clicks during session
  const handleActionClick = (actionType: string) => {
    if (activeSession && !isPaused) {
      setSessionActions(prev => prev + 1);
      
      // Create the action in the database (this will increment XP)
      apiRequest("POST", "/api/actions", {
        userId,
        type: actionType,
        xpValue: 10 // Base XP for each action
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/game-state", userId] });
      });
    }
  };

  // Get recent session stats for the chart
  const getRecentSessions = (challengeType: string) => {
    return pomodoroRecords
      .filter((record: PomodoroSession) => record.challengeType === challengeType && record.completed)
      .slice(0, 5)
      .reverse();
  };

  if (activeSession) {
    const challengeConfig = CHALLENGE_CONFIGS[activeSession.challengeType as keyof typeof CHALLENGE_CONFIGS];
    
    return (
      <div className="bg-card-dark rounded-xl p-6 border border-slate-700 animate-pulse-glow">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Timer className="text-orange-500" />
          Active Session: {challengeConfig?.label}
        </h2>
        
        <div className="text-center">
          <p className="text-sm text-slate-400 mb-4">{challengeConfig?.description}</p>
          
          {/* Timer Display */}
          <div className="bg-slate-800 rounded-lg p-4 mb-4">
            <div className="text-4xl font-bold text-orange-500">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-sm text-slate-400">Time Remaining</div>
          </div>
          
          {/* Session Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Actions Completed</span>
              <span className="text-green-400 font-bold">{sessionActions}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min((sessionActions / 10) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mb-4">
            <p className="text-sm text-slate-400 mb-2">Click to record actions:</p>
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={() => handleActionClick(challengeConfig?.actionType || 'dm')}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                +1 {challengeConfig?.actionType?.toUpperCase()}
              </Button>
            </div>
          </div>
          
          {/* Session Controls */}
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsPaused(!isPaused)}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700"
            >
              {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
              {isPaused ? "Resume" : "Pause"}
            </Button>
            <Button 
              onClick={() => endSessionMutation.mutate({
                sessionId: activeSession.id,
                actionsCompleted: sessionActions,
                completed: true
              })}
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={endSessionMutation.isPending}
            >
              {endSessionMutation.isPending ? "Ending..." : "End Session"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card-dark rounded-xl p-6 border border-slate-700">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Timer className="text-orange-500" />
        Focus Sessions
      </h2>
      
      <div className="text-center">
        <p className="text-slate-400 mb-6">Choose your challenge and duration to start a focused work session</p>
        
        {/* Challenge Types */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {Object.entries(CHALLENGE_CONFIGS).map(([key, config]) => (
            <div key={key} className="space-y-3">
              <h3 className="font-semibold text-lg">{config.label}</h3>
              <p className="text-sm text-slate-400">{config.description}</p>
              
              {/* Duration Options */}
              <div className="grid grid-cols-2 gap-2">
                {config.durations.map((duration) => (
                  <Button
                    key={duration}
                    onClick={() => startSessionMutation.mutate({ challengeType: key, duration })}
                    disabled={startSessionMutation.isPending}
                    className={`${config.color} text-sm`}
                    size="sm"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {duration}m
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Performance Chart */}
        <div className="mt-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Recent Performance
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(CHALLENGE_CONFIGS).map(([key, config]) => {
              const recentSessions = getRecentSessions(key);
              const avgActions = recentSessions.length > 0 
                ? Math.round(recentSessions.reduce((sum: number, session: PomodoroSession) => sum + session.actionsCompleted, 0) / recentSessions.length)
                : 0;
              
              return (
                <div key={key} className="bg-slate-800 rounded-lg p-3">
                  <div className="text-sm font-medium text-slate-300">{config.label}</div>
                  <div className="text-lg font-bold text-green-400">{avgActions}</div>
                  <div className="text-xs text-slate-400">avg actions/session</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
