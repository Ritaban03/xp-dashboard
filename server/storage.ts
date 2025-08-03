import { 
  type GameState, 
  type InsertGameState, 
  type Action, 
  type InsertAction,
  type Todo,
  type InsertTodo,
  type Challenge,
  type InsertChallenge,
  type Achievement,
  type InsertAchievement,
  LEVEL_REQUIREMENTS,
  ACTION_XP_VALUES,
  type ActionType
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Game State
  getGameState(userId?: string): Promise<GameState>;
  updateGameState(gameState: Partial<GameState>, userId?: string): Promise<GameState>;
  
  // Actions
  createAction(action: InsertAction): Promise<Action>;
  getActions(userId?: string, date?: string): Promise<Action[]>;
  getActionStats(userId?: string, days?: number): Promise<Record<string, number>>;
  
  // Todos
  createTodo(todo: InsertTodo): Promise<Todo>;
  getTodos(userId?: string): Promise<Todo[]>;
  updateTodo(id: string, updates: Partial<Todo>): Promise<Todo>;
  deleteTodo(id: string): Promise<void>;
  
  // Challenges
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  getActiveChallenge(userId?: string): Promise<Challenge | undefined>;
  updateChallenge(id: string, updates: Partial<Challenge>): Promise<Challenge>;
  
  // Achievements
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getAchievements(userId?: string): Promise<Achievement[]>;
}

export class MemStorage implements IStorage {
  private gameStates: Map<string, GameState>;
  private actions: Map<string, Action>;
  private todos: Map<string, Todo>;
  private challenges: Map<string, Challenge>;
  private achievements: Map<string, Achievement>;

  constructor() {
    this.gameStates = new Map();
    this.actions = new Map();
    this.todos = new Map();
    this.challenges = new Map();
    this.achievements = new Map();
    
    // Initialize default game state
    this.initializeDefaultGameState();
  }

  private initializeDefaultGameState() {
    const defaultGameState: GameState = {
      id: randomUUID(),
      userId: "default",
      currentXP: 0,
      currentLevel: 1,
      todayXP: 0,
      lastResetDate: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
    };
    this.gameStates.set("default", defaultGameState);
  }

  private getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private calculateLevel(xp: number): number {
    let level = 1;
    for (const [levelNum, requiredXP] of Object.entries(LEVEL_REQUIREMENTS)) {
      if (xp >= requiredXP) {
        level = parseInt(levelNum);
      } else {
        break;
      }
    }
    return level;
  }

  async getGameState(userId = "default"): Promise<GameState> {
    let gameState = this.gameStates.get(userId);
    
    if (!gameState) {
      gameState = {
        id: randomUUID(),
        userId,
        currentXP: 0,
        currentLevel: 1,
        todayXP: 0,
        lastResetDate: this.getCurrentDate(),
        createdAt: new Date(),
      };
      this.gameStates.set(userId, gameState);
    }

    // Reset todayXP if it's a new day
    const currentDate = this.getCurrentDate();
    if (gameState.lastResetDate !== currentDate) {
      gameState.todayXP = 0;
      gameState.lastResetDate = currentDate;
      this.gameStates.set(userId, gameState);
    }

    return gameState;
  }

  async updateGameState(updates: Partial<GameState>, userId = "default"): Promise<GameState> {
    const currentState = await this.getGameState(userId);
    const updatedState = { ...currentState, ...updates };
    
    // Recalculate level based on XP
    if (updates.currentXP !== undefined) {
      updatedState.currentLevel = this.calculateLevel(updates.currentXP);
    }
    
    this.gameStates.set(userId, updatedState);
    return updatedState;
  }

  async createAction(insertAction: InsertAction): Promise<Action> {
    const action: Action = {
      id: randomUUID(),
      ...insertAction,
      timestamp: new Date(),
      date: this.getCurrentDate(),
    };
    
    this.actions.set(action.id, action);
    
    // Update game state
    const gameState = await this.getGameState(insertAction.userId);
    await this.updateGameState({
      currentXP: gameState.currentXP + insertAction.xpValue,
      todayXP: gameState.todayXP + insertAction.xpValue,
    }, insertAction.userId);
    
    // Update active challenge if applicable
    const activeChallenge = await this.getActiveChallenge(insertAction.userId);
    if (activeChallenge && activeChallenge.type === `${insertAction.type}_sprint`) {
      await this.updateChallenge(activeChallenge.id, {
        current: activeChallenge.current + 1,
      });
    }
    
    return action;
  }

  async getActions(userId = "default", date?: string): Promise<Action[]> {
    const targetDate = date || this.getCurrentDate();
    return Array.from(this.actions.values()).filter(
      action => action.userId === userId && action.date === targetDate
    );
  }

  async getActionStats(userId = "default", days = 7): Promise<Record<string, number>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    const actions = Array.from(this.actions.values()).filter(
      action => action.userId === userId && 
      new Date(action.timestamp!) >= startDate &&
      new Date(action.timestamp!) <= endDate
    );
    
    const stats: Record<string, number> = {};
    actions.forEach(action => {
      stats[action.type] = (stats[action.type] || 0) + 1;
    });
    
    return stats;
  }

  async createTodo(insertTodo: InsertTodo): Promise<Todo> {
    const todo: Todo = {
      id: randomUUID(),
      ...insertTodo,
      completed: false,
      completedAt: null,
      createdAt: new Date(),
    };
    
    this.todos.set(todo.id, todo);
    return todo;
  }

  async getTodos(userId = "default"): Promise<Todo[]> {
    return Array.from(this.todos.values()).filter(
      todo => todo.userId === userId
    );
  }

  async updateTodo(id: string, updates: Partial<Todo>): Promise<Todo> {
    const todo = this.todos.get(id);
    if (!todo) {
      throw new Error("Todo not found");
    }
    
    const updatedTodo = { ...todo, ...updates };
    
    // If completing todo, add XP and set completion time
    if (updates.completed && !todo.completed) {
      updatedTodo.completedAt = new Date();
      
      // Update game state with XP
      const gameState = await this.getGameState(todo.userId);
      await this.updateGameState({
        currentXP: gameState.currentXP + todo.xpValue,
        todayXP: gameState.todayXP + todo.xpValue,
      }, todo.userId);
    }
    
    this.todos.set(id, updatedTodo);
    return updatedTodo;
  }

  async deleteTodo(id: string): Promise<void> {
    this.todos.delete(id);
  }

  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const challenge: Challenge = {
      id: randomUUID(),
      ...insertChallenge,
      active: false,
      completed: false,
      startedAt: null,
      completedAt: null,
      createdAt: new Date(),
    };
    
    this.challenges.set(challenge.id, challenge);
    return challenge;
  }

  async getActiveChallenge(userId = "default"): Promise<Challenge | undefined> {
    return Array.from(this.challenges.values()).find(
      challenge => challenge.userId === userId && challenge.active
    );
  }

  async updateChallenge(id: string, updates: Partial<Challenge>): Promise<Challenge> {
    const challenge = this.challenges.get(id);
    if (!challenge) {
      throw new Error("Challenge not found");
    }
    
    const updatedChallenge = { ...challenge, ...updates };
    
    // Check if challenge is completed
    if (updatedChallenge.current >= updatedChallenge.target && !updatedChallenge.completed) {
      updatedChallenge.completed = true;
      updatedChallenge.active = false;
      updatedChallenge.completedAt = new Date();
    }
    
    this.challenges.set(id, updatedChallenge);
    return updatedChallenge;
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const achievement: Achievement = {
      id: randomUUID(),
      ...insertAchievement,
      unlockedAt: new Date(),
    };
    
    this.achievements.set(achievement.id, achievement);
    return achievement;
  }

  async getAchievements(userId = "default"): Promise<Achievement[]> {
    return Array.from(this.achievements.values()).filter(
      achievement => achievement.userId === userId
    );
  }
}

export const storage = new MemStorage();
