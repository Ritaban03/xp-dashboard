import { useQuery } from "@tanstack/react-query";
import { type GameState } from "@shared/schema";

export function useGameState() {
  const { data: gameState, isLoading, error } = useQuery({
    queryKey: ["/api/game-state"],
    queryFn: async (): Promise<GameState> => {
      const response = await fetch("/api/game-state?userId=default");
      if (!response.ok) {
        throw new Error("Failed to fetch game state");
      }
      return response.json();
    },
    refetchInterval: 5000, // Refetch every 5 seconds to keep state updated
  });

  return {
    gameState,
    isLoading,
    error,
  };
}
