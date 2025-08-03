import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import XPPopup from "./xp-popup";
import { useState } from "react";
import { Send, Video, Phone, Handshake, PenTool, Settings } from "lucide-react";
import { ACTION_XP_VALUES, type ActionType } from "@shared/schema";

const ACTION_CONFIGS = {
  dm: {
    icon: Send,
    label: "Send Cold DM",
    description: "Build connections",
    gradient: "from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600",
    hoverBg: "from-blue-400 to-blue-500",
    badgeBg: "bg-blue-800",
    xp: ACTION_XP_VALUES.dm,
  },
  loom: {
    icon: Video,
    label: "Send Loom",
    description: "Personal touch",
    gradient: "from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600",
    hoverBg: "from-purple-400 to-purple-500",
    badgeBg: "bg-purple-800",
    xp: ACTION_XP_VALUES.loom,
  },
  call: {
    icon: Phone,
    label: "Book a Call",
    description: "Direct engagement",
    gradient: "from-green-600 to-green-700 hover:from-green-500 hover:to-green-600",
    hoverBg: "from-green-400 to-green-500",
    badgeBg: "bg-green-800",
    xp: ACTION_XP_VALUES.call,
  },
  client: {
    icon: Handshake,
    label: "Close a Client",
    description: "Big win!",
    gradient: "from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500",
    hoverBg: "from-yellow-400 to-orange-400",
    badgeBg: "bg-orange-800",
    xp: ACTION_XP_VALUES.client,
  },
  content: {
    icon: PenTool,
    label: "Write Content",
    description: "Share knowledge",
    gradient: "from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600",
    hoverBg: "from-indigo-400 to-indigo-500",
    badgeBg: "bg-indigo-800",
    xp: ACTION_XP_VALUES.content,
  },
  system: {
    icon: Settings,
    label: "Create System",
    description: "Build efficiency",
    gradient: "from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500",
    hoverBg: "from-red-400 to-pink-400",
    badgeBg: "bg-pink-800",
    xp: ACTION_XP_VALUES.system,
  },
};

export default function ActionButtons() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [xpPopups, setXpPopups] = useState<Record<string, { show: boolean; xp: number }>>({});

  const createActionMutation = useMutation({
    mutationFn: async (type: ActionType) => {
      const response = await apiRequest("POST", "/api/actions", {
        type,
        userId: "default",
        xpValue: ACTION_XP_VALUES[type],
      });
      return response.json();
    },
    onSuccess: (_, type) => {
      queryClient.invalidateQueries({ queryKey: ["/api/game-state"] });
      queryClient.invalidateQueries({ queryKey: ["/api/actions", "today"] });
      
      const config = ACTION_CONFIGS[type];
      showXPPopup(type, config.xp);
      
      toast({
        title: "Action Complete! 🎉",
        description: `You earned ${config.xp} XP for ${config.label.toLowerCase()}!`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record action. Please try again.",
        variant: "destructive",
      });
    },
  });

  const showXPPopup = (type: ActionType, xp: number) => {
    setXpPopups(prev => ({ ...prev, [type]: { show: true, xp } }));
    setTimeout(() => {
      setXpPopups(prev => ({ ...prev, [type]: { show: false, xp: 0 } }));
    }, 1000);
  };

  const handleActionClick = (type: ActionType) => {
    createActionMutation.mutate(type);
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {Object.entries(ACTION_CONFIGS).map(([type, config]) => {
        const Icon = config.icon;
        const isLoading = createActionMutation.isPending;
        const popup = xpPopups[type];
        
        return (
          <div key={type} className="relative">
            <Button
              className={`action-button bg-gradient-to-r ${config.gradient} p-6 h-auto relative overflow-hidden group w-full transition-all duration-200 hover:scale-105 active:scale-95`}
              onClick={() => handleActionClick(type as ActionType)}
              disabled={isLoading}
            >
              <div className="flex flex-col items-center text-center relative z-10">
                <Icon className="w-8 h-8 mb-3" />
                <h3 className="font-bold text-lg">{config.label}</h3>
                <p className="text-sm opacity-90 mb-2">{config.description}</p>
                <span className={`${config.badgeBg} px-3 py-1 rounded-full text-xs font-bold`}>
                  +{config.xp} XP
                </span>
              </div>
              <div className={`absolute inset-0 bg-gradient-to-r ${config.hoverBg} opacity-0 group-hover:opacity-20 transition-opacity`}></div>
            </Button>
            
            {popup?.show && <XPPopup xp={popup.xp} />}
          </div>
        );
      })}
    </div>
  );
}
