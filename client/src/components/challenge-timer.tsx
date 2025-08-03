import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Timer, Play, Pause, BarChart3 } from "lucide-react";
import { type Challenge } from "@shared/schema";

export default function ChallengeTimer() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [timeRemaining, setTimeRemaining] = useState(0);

  const { data: challenge } = useQuery({
    queryKey: ["/api/challenges", "active"],
    queryFn: async () => {
      const response = await fetch("/api/challenges/active?userId=default");
      const data = await response.json();
      return data;
    },
    refetchInterval: 1000, // Refetch every second to keep timer updated
  });

  const { data: todayActions = [] } = useQuery({
    queryKey: ["/api/actions", "today"],
    queryFn: async () => {
      const response = await fetch("/api/actions/today?userId=default");
      return response.json();
    },
  });

  const createChallengeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/challenges", {
        userId: "default",
        type: "dm_sprint",
        target: 20,
        current: 0,
        timeLimit: 3600, // 1 hour in seconds
        timeRemaining: 3600,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges", "active"] });
      toast({
        title: "Challenge Created! 🚀",
        description: "DM Sprint Challenge is ready to start!",
      });
    },
  });

  const startChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      const response = await apiRequest("POST", `/api/challenges/${challengeId}/start`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges", "active"] });
      toast({
        title: "Challenge Started! ⏰",
        description: "The timer is now running. Good luck!",
      });
    },
  });

  const stopChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      const response = await apiRequest("POST", `/api/challenges/${challengeId}/stop`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges", "active"] });
      toast({
        title: "Challenge Paused ⏸️",
        description: "Timer has been paused.",
      });
    },
  });

  // Update local timer state
  useEffect(() => {
    if (challenge?.active && challenge?.timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            toast({
              title: "Challenge Complete! 🎉",
              description: "Time's up! Check your results.",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [challenge?.active, toast]);

  // Sync with server data
  useEffect(() => {
    if (challenge?.timeRemaining) {
      setTimeRemaining(challenge.timeRemaining);
    }
  }, [challenge?.timeRemaining]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCurrentProgress = (): number => {
    if (!challenge) return 0;
    const dmActions = todayActions.filter((action: any) => action.type === 'dm');
    return dmActions.length;
  };

  const currentProgress = getCurrentProgress();
  const progressPercent = challenge ? (currentProgress / challenge.target) * 100 : 0;

  if (!challenge) {
    return (
      <div className="bg-card-dark rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Timer className="text-orange-500" />
          Challenge Center
        </h2>
        
        <div className="text-center">
          <p className="text-slate-400 mb-4">No active challenge. Ready to push your limits?</p>
          <Button 
            onClick={() => createChallengeMutation.mutate()}
            disabled={createChallengeMutation.isPending}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {createChallengeMutation.isPending ? "Creating..." : "Start DM Sprint"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card-dark rounded-xl p-6 border border-slate-700 animate-pulse-glow">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Timer className="text-orange-500" />
        Active Challenge
      </h2>
      
      <div className="text-center">
        <h3 className="font-bold text-lg mb-2">DM Sprint Challenge</h3>
        <p className="text-sm text-slate-400 mb-4">How many DMs can you send in 1 hour?</p>
        
        {/* Timer Display */}
        <div className="bg-slate-800 rounded-lg p-4 mb-4">
          <div className="text-3xl font-bold text-orange-500">
            {formatTime(timeRemaining)}
          </div>
          <div className="text-sm text-slate-400">Time Remaining</div>
        </div>
        
        {/* Challenge Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{currentProgress} / {challenge.target} DMs</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {!challenge.active ? (
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700 transition-colors"
              onClick={() => startChallengeMutation.mutate(challenge.id)}
              disabled={startChallengeMutation.isPending}
            >
              <Play className="w-4 h-4 mr-2" />
              {startChallengeMutation.isPending ? "Starting..." : "Start"}
            </Button>
          ) : (
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700 transition-colors"
              onClick={() => stopChallengeMutation.mutate(challenge.id)}
              disabled={stopChallengeMutation.isPending}
            >
              <Pause className="w-4 h-4 mr-2" />
              {stopChallengeMutation.isPending ? "Stopping..." : "Pause"}
            </Button>
          )}
        </div>

        {challenge.completed && (
          <div className="mt-4 p-3 bg-green-900/30 border border-green-700/50 rounded-lg">
            <p className="text-green-400 font-semibold">🎉 Challenge Complete!</p>
            <p className="text-sm text-green-300">You reached {currentProgress} DMs!</p>
          </div>
        )}
      </div>
    </div>
  );
}
