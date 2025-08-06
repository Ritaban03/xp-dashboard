import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Timer, Play, Pause, Square, Award, Zap, Target } from "lucide-react";

interface PomodoroSession {
  id: string;
  userId: string;
  challengeType: string | null;
  startTime: Date;
  endTime: Date | null;
  duration: number;
  actionsCompleted: number;
  xpEarned: number;
  bonusXp: number;
  completed: boolean;
}

export default function StickyTimer() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25 minutes default
  const [isActive, setIsActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [initialActions, setInitialActions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  const { data: todayActions = [] } = useQuery({
    queryKey: ["/api/actions", "today"],
    queryFn: async () => {
      const response = await fetch("/api/actions/today?userId=default");
      return response.json();
    },
    refetchInterval: 2000,
  });

  const { data: challenge } = useQuery({
    queryKey: ["/api/challenges", "active"],
    queryFn: async () => {
      const response = await fetch("/api/challenges/active?userId=default");
      return response.json();
    },
    refetchInterval: 1000,
  });

  const { data: previousRecords = [] } = useQuery({
    queryKey: ["/api/pomodoro", "records"],
    queryFn: async () => {
      const response = await fetch("/api/pomodoro/records?userId=default");
      if (!response.ok) return [];
      return response.json();
    },
  });

  const startSessionMutation = useMutation({
    mutationFn: async (duration: number) => {
      const response = await apiRequest("POST", "/api/pomodoro/start", {
        userId: "default",
        challengeType: challenge?.type || null,
        duration: duration,
        initialActions: todayActions.length,
      });
      return response.json();
    },
    onSuccess: (session) => {
      setCurrentSession(session.id);
      setInitialActions(todayActions.length);
      setIsActive(true);
      toast({
        title: "Focus Session Started! 🍅",
        description: challenge ? `Working on ${challenge.type} challenge` : "Productivity mode activated",
      });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const actionsCompleted = Math.max(0, todayActions.length - initialActions);
      const response = await apiRequest("POST", `/api/pomodoro/${sessionId}/end`, {
        actionsCompleted,
        completed: timeRemaining <= 0,
      });
      return response.json();
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ["/api/pomodoro", "records"] });
      queryClient.invalidateQueries({ queryKey: ["/api/game-state"] });
      
      const actionsCompleted = Math.max(0, todayActions.length - initialActions);
      toast({
        title: "Session Complete! 🎉",
        description: `${actionsCompleted} actions completed • +${session.xpEarned + session.bonusXp} XP earned`,
      });
      
      setCurrentSession(null);
      setIsActive(false);
      setTimeRemaining(25 * 60);
    },
  });

  // Timer countdown effect
  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Auto-complete session when timer reaches 0
            if (currentSession) {
              endSessionMutation.mutate(currentSession);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeRemaining, currentSession, endSessionMutation]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startTimer = (duration: number) => {
    setTimeRemaining(duration);
    startSessionMutation.mutate(duration);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resumeTimer = () => {
    setIsActive(true);
  };

  const stopTimer = () => {
    if (currentSession) {
      endSessionMutation.mutate(currentSession);
    }
  };

  const getCurrentActions = () => {
    return Math.max(0, todayActions.length - initialActions);
  };

  const getBestRecord = () => {
    if (!challenge || previousRecords.length === 0) return null;
    return previousRecords
      .filter((record: any) => record.challengeType === challenge.type)
      .sort((a: any, b: any) => b.actionsCompleted - a.actionsCompleted)[0];
  };

  const isNewRecord = () => {
    const bestRecord = getBestRecord();
    const currentActions = getCurrentActions();
    return bestRecord ? currentActions > bestRecord.actionsCompleted : currentActions > 0;
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-card-dark border border-slate-700 rounded-xl p-4 shadow-2xl min-w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Timer className="w-5 h-5 text-orange-500" />
          Focus Timer
        </h3>
        {challenge && (
          <div className="text-xs bg-gradient-to-r from-purple-600 to-blue-600 px-2 py-1 rounded">
            {challenge.type}
          </div>
        )}
      </div>

      {/* Timer Display */}
      <div className="text-center mb-4">
        <div className={`text-4xl font-bold mb-2 ${isActive ? 'text-orange-500' : 'text-slate-400'}`}>
          {formatTime(timeRemaining)}
        </div>
        
        {currentSession && (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4 text-green-500" />
                <span>{getCurrentActions()} actions</span>
              </div>
              {isNewRecord() && (
                <div className="flex items-center gap-1 text-yellow-500">
                  <Award className="w-4 h-4" />
                  <span>New Record!</span>
                </div>
              )}
            </div>
            
            {/* Progress vs Best Record */}
            {challenge && getBestRecord() && (
              <div className="text-xs text-slate-400">
                Best: {getBestRecord().actionsCompleted} actions
              </div>
            )}
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="space-y-2">
        {!currentSession ? (
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => startTimer(25 * 60)}
              className="bg-orange-600 hover:bg-orange-700 text-sm"
              disabled={startSessionMutation.isPending}
            >
              <Play className="w-4 h-4 mr-1" />
              25min
            </Button>
            <Button
              onClick={() => startTimer(15 * 60)}
              className="bg-blue-600 hover:bg-blue-700 text-sm"
              disabled={startSessionMutation.isPending}
            >
              <Play className="w-4 h-4 mr-1" />
              15min
            </Button>
            <Button
              onClick={() => startTimer(45 * 60)}
              className="bg-purple-600 hover:bg-purple-700 text-sm"
              disabled={startSessionMutation.isPending}
            >
              <Play className="w-4 h-4 mr-1" />
              45min
            </Button>
            <Button
              onClick={() => startTimer(5 * 60)}
              className="bg-green-600 hover:bg-green-700 text-sm"
              disabled={startSessionMutation.isPending}
            >
              <Zap className="w-4 h-4 mr-1" />
              5min
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={isActive ? pauseTimer : resumeTimer}
              className={`${isActive ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-sm`}
            >
              {isActive ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
              {isActive ? 'Pause' : 'Resume'}
            </Button>
            <Button
              onClick={stopTimer}
              className="bg-red-600 hover:bg-red-700 text-sm"
              disabled={endSessionMutation.isPending}
            >
              <Square className="w-4 h-4 mr-1" />
              Stop
            </Button>
          </div>
        )}
      </div>

      {/* Bonus XP Indicator */}
      {challenge && currentSession && (
        <div className="mt-3 p-2 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-700/50 rounded text-xs">
          <div className="flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 text-yellow-500" />
            <span className="text-yellow-400">Bonus XP for challenge completion!</span>
          </div>
        </div>
      )}
    </div>
  );
}