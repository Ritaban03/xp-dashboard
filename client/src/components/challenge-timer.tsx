import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Timer, Play, Pause, BarChart3, Shuffle, Zap } from "lucide-react";
import { type Challenge, CHALLENGE_TYPES } from "@shared/schema";

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
    mutationFn: async (challengeType: keyof typeof CHALLENGE_TYPES) => {
      const challengeConfig = CHALLENGE_TYPES[challengeType];
      const targets = { dm_sprint: 25, loom_marathon: 10, call_blitz: 8, content_storm: 5, system_builder: 3, sales_domination: 2, productivity_beast: 30 };
      const timeLimits = { dm_sprint: 3600, loom_marathon: 7200, call_blitz: 5400, content_storm: 10800, system_builder: 14400, sales_domination: 21600, productivity_beast: 1800 };
      
      const response = await apiRequest("POST", "/api/challenges", {
        userId: "default",
        type: challengeType,
        target: targets[challengeType],
        current: 0,
        timeLimit: timeLimits[challengeType],
        timeRemaining: timeLimits[challengeType],
      });
      return response.json();
    },
    onSuccess: (_, challengeType) => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges", "active"] });
      const challengeConfig = CHALLENGE_TYPES[challengeType];
      toast({
        title: "Challenge Created! 🚀",
        description: `${challengeConfig.label} is ready to start!`,
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
    const challengeConfig = CHALLENGE_TYPES[challenge.type as keyof typeof CHALLENGE_TYPES];
    if (!challengeConfig) return 0;
    
    if (challenge.type === 'productivity_beast') {
      return todayActions.length; // Count all actions for productivity beast
    }
    
    const relevantActions = todayActions.filter((action: any) => action.type === challengeConfig.actionType);
    return relevantActions.length;
  };

  const currentProgress = getCurrentProgress();
  const progressPercent = challenge ? (currentProgress / challenge.target) * 100 : 0;

  const getRandomChallenge = (): keyof typeof CHALLENGE_TYPES => {
    const challengeTypes = Object.keys(CHALLENGE_TYPES) as (keyof typeof CHALLENGE_TYPES)[];
    return challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
  };

  if (!challenge) {
    return (
      <div className="bg-card-dark rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Timer className="text-orange-500" />
          Challenge Center
        </h2>
        
        <div className="text-center">
          <p className="text-slate-400 mb-4">No active challenge. Ready to push your limits?</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              onClick={() => createChallengeMutation.mutate('dm_sprint')}
              disabled={createChallengeMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              DM Sprint
            </Button>
            <Button 
              onClick={() => createChallengeMutation.mutate('loom_marathon')}
              disabled={createChallengeMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Loom Marathon
            </Button>
            <Button 
              onClick={() => createChallengeMutation.mutate('productivity_beast')}
              disabled={createChallengeMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              <Zap className="w-4 h-4 mr-1" />
              Beast Mode
            </Button>
            <Button 
              onClick={() => createChallengeMutation.mutate(getRandomChallenge())}
              disabled={createChallengeMutation.isPending}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500"
            >
              <Shuffle className="w-4 h-4 mr-1" />
              Random
            </Button>
          </div>
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
        <h3 className="font-bold text-lg mb-2">{CHALLENGE_TYPES[challenge.type as keyof typeof CHALLENGE_TYPES]?.label || challenge.type}</h3>
        <p className="text-sm text-slate-400 mb-4">{CHALLENGE_TYPES[challenge.type as keyof typeof CHALLENGE_TYPES]?.description || "Complete the challenge!"}</p>
        
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
