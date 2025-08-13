import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
const { Pool } = pg;
import { randomUUID } from 'crypto';
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
  type PomodoroSession,
  type InsertPomodoroSession,
  LEVEL_REQUIREMENTS,
  gameState,
  actions,
  todos,
  challenges,
  achievements,
  pomodoroSessions
} from "@shared/schema";
import { eq, and, gte, desc } from "drizzle-orm";

export class DatabaseStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL!,
      ssl: { rejectUnauthorized: false },
    });
    this.db = drizzle(pool);
  }

  // Game State
  async getGameState(userId = "default"): Promise<GameState> {
    const result = await this.db
      .select()
      .from(gameState)
      .where(eq(gameState.userId, userId))
      .limit(1);

    if (result.length === 0) {
      const row: GameState = {
        id: randomUUID(),
        userId,
        currentXP: 0,
        currentLevel: 1,
        todayXP: 0,
        lastResetDate: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
      };
      await this.db.insert(gameState).values(row);
      return row;
    }

    return result[0];
  }

  async updateGameState(gameStateUpdate: Partial<GameState>, userId = "default"): Promise<GameState> {
    const existingResult = await this.db
      .select()
      .from(gameState)
      .where(eq(gameState.userId, userId))
      .limit(1);

    const currentDate = new Date().toISOString().split('T')[0];

    const existing: GameState = existingResult[0] ?? {
      id: randomUUID(),
      userId,
      currentXP: 0,
      currentLevel: 1,
      todayXP: 0,
      lastResetDate: currentDate,
      createdAt: new Date(),
    };

    const currentXP = gameStateUpdate.currentXP ?? existing.currentXP;
    const newLevel = this.calculateLevel(currentXP);

    let todayXP = gameStateUpdate.todayXP ?? existing.todayXP;
    let lastResetDate = existing.lastResetDate;
    if (existing.lastResetDate !== currentDate) {
      todayXP = 0;
      lastResetDate = currentDate;
    }

    const updatedState: GameState = {
      ...existing,
      ...gameStateUpdate,
      currentXP,
      currentLevel: newLevel,
      todayXP,
      lastResetDate,
    };

    await this.db
      .insert(gameState)
      .values(updatedState)
      .onConflictDoUpdate({
        target: gameState.userId,
        set: updatedState,
      });

    return updatedState;
  }

  // Actions
  async createAction(action: InsertAction): Promise<Action> {
    const newAction: Action = {
      id: randomUUID(),
      userId: action.userId || "default",
      type: action.type,
      xpValue: action.xpValue,
      timestamp: new Date(),
      date: new Date().toISOString().split('T')[0],
    };

    await this.db.insert(actions).values(newAction);

    // Update game state XP totals
    const currentState = await this.getGameState(newAction.userId);
    await this.updateGameState({
      currentXP: currentState.currentXP + newAction.xpValue,
      todayXP: currentState.todayXP + newAction.xpValue,
    }, newAction.userId);

    // If there is an active sprint challenge for this action type, increment progress
    const activeChallenge = await this.getActiveChallenge(newAction.userId);
    if (activeChallenge && activeChallenge.type === `${newAction.type}_sprint`) {
      await this.updateChallenge(activeChallenge.id, {
        current: activeChallenge.current + 1,
      });
    }

    return newAction;
  }

  async getActions(userId = "default", date?: string): Promise<Action[]> {
    const query = date 
      ? and(eq(actions.userId, userId), eq(actions.date, date))
      : eq(actions.userId, userId);

    return this.db
      .select()
      .from(actions)
      .where(query)
      .orderBy(desc(actions.timestamp));
  }

  async getActionStats(userId = "default", days = 7): Promise<Record<string, number>> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    const results = await this.db
      .select({
        type: actions.type,
        xpValue: actions.xpValue,
      })
      .from(actions)
      .where(
        and(
          eq(actions.userId, userId),
          gte(actions.date, cutoffDateStr)
        )
      );

    const stats: Record<string, number> = {};
    results.forEach(action => {
      stats[action.type] = (stats[action.type] || 0) + action.xpValue;
    });

    return stats;
  }

  // Todos
  async createTodo(todo: InsertTodo): Promise<Todo> {
    const newTodo: Todo = {
      id: randomUUID(),
      userId: todo.userId || "default",
      title: todo.title,
      xpValue: todo.xpValue,
      completed: false,
      completedAt: null,
      createdAt: new Date(),
    };

    await this.db.insert(todos).values(newTodo);
    return newTodo;
  }

  async getTodos(userId = "default"): Promise<Todo[]> {
    return this.db
      .select()
      .from(todos)
      .where(eq(todos.userId, userId))
      .orderBy(desc(todos.createdAt));
  }

  async updateTodo(id: string, updates: Partial<Todo>): Promise<Todo> {
    const updatedTodo = {
      ...updates,
      completedAt: updates.completed ? new Date() : null,
    };

    await this.db
      .update(todos)
      .set(updatedTodo)
      .where(eq(todos.id, id));

    const result = await this.db
      .select()
      .from(todos)
      .where(eq(todos.id, id))
      .limit(1);

    return result[0];
  }

  async deleteTodo(id: string): Promise<void> {
    await this.db.delete(todos).where(eq(todos.id, id));
  }

  // Challenges
  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const newChallenge: Challenge = {
      id: randomUUID(),
      userId: challenge.userId || "default",
      type: challenge.type,
      target: challenge.target,
      current: 0,
      timeLimit: challenge.timeLimit,
      timeRemaining: challenge.timeLimit,
      bonusXP: 0,
      speedMultiplier: 100,
      active: false,
      completed: false,
      startedAt: null,
      completedAt: null,
      createdAt: new Date(),
    };

    await this.db.insert(challenges).values(newChallenge);
    return newChallenge;
  }

  async getActiveChallenge(userId = "default"): Promise<Challenge | undefined> {
    const result = await this.db
      .select()
      .from(challenges)
      .where(
        and(
          eq(challenges.userId, userId),
          eq(challenges.active, true)
        )
      )
      .limit(1);

    return result[0];
  }

  async updateChallenge(id: string, updates: Partial<Challenge>): Promise<Challenge> {
    await this.db
      .update(challenges)
      .set(updates)
      .where(eq(challenges.id, id));

    const result = await this.db
      .select()
      .from(challenges)
      .where(eq(challenges.id, id))
      .limit(1);

    return result[0];
  }

  // Achievements
  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const newAchievement: Achievement = {
      id: randomUUID(),
      userId: achievement.userId || "default",
      type: achievement.type,
      title: achievement.title,
      description: achievement.description,
      unlockedAt: new Date(),
    };

    await this.db.insert(achievements).values(newAchievement);
    return newAchievement;
  }

  async getAchievements(userId = "default"): Promise<Achievement[]> {
    return this.db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.unlockedAt));
  }

  // Pomodoro Sessions
  async createPomodoroSession(session: InsertPomodoroSession): Promise<PomodoroSession> {
    const newSession: PomodoroSession = {
      id: randomUUID(),
      userId: session.userId || "default",
      challengeType: session.challengeType || null,
      startTime: new Date(),
      endTime: null,
      duration: session.duration,
      actionsCompleted: session.actionsCompleted || 0,
      xpEarned: 0,
      bonusXp: 0,
      completed: false,
      createdAt: new Date(),
    };

    await this.db.insert(pomodoroSessions).values(newSession);
    return newSession;
  }

  async endPomodoroSession(id: string, actionsCompleted: number, completed: boolean): Promise<PomodoroSession> {
    const session = await this.db
      .select()
      .from(pomodoroSessions)
      .where(eq(pomodoroSessions.id, id))
      .limit(1);

    if (session.length === 0) {
      throw new Error("Pomodoro session not found");
    }

    const currentSession = session[0];

    // Calculate XP and bonus based on performance
    const baseXP = actionsCompleted * 5; // 5 XP per action during focus session
    let bonusXP = 0;

    // Get previous records for this challenge type to calculate bonus
    if (currentSession.challengeType) {
      const previousRecords = await this.db
        .select()
        .from(pomodoroSessions)
        .where(
          and(
            eq(pomodoroSessions.userId, currentSession.userId),
            eq(pomodoroSessions.challengeType, currentSession.challengeType),
            eq(pomodoroSessions.completed, true)
          )
        )
        .orderBy(desc(pomodoroSessions.actionsCompleted));

      if (previousRecords.length > 0) {
        const bestRecord = previousRecords[0];
        if (actionsCompleted > bestRecord.actionsCompleted) {
          bonusXP = 50 + (actionsCompleted - bestRecord.actionsCompleted) * 10; // New record bonus
        } else if (completed && actionsCompleted >= bestRecord.actionsCompleted * 0.8) {
          bonusXP = 25; // Good performance bonus
        }
      } else if (completed && actionsCompleted > 0) {
        bonusXP = 30; // First time completion bonus
      }
    }

    const updatedSession: PomodoroSession = {
      ...currentSession,
      endTime: new Date(),
      actionsCompleted,
      xpEarned: baseXP,
      bonusXp: bonusXP,
      completed,
    };

    await this.db
      .update(pomodoroSessions)
      .set(updatedSession)
      .where(eq(pomodoroSessions.id, id));

    // Add XP to game state
    if (baseXP + bonusXP > 0) {
      const gameState = await this.getGameState(currentSession.userId);
      await this.updateGameState({
        currentXP: gameState.currentXP + baseXP + bonusXP,
        todayXP: gameState.todayXP + baseXP + bonusXP,
      }, currentSession.userId);
    }

    return updatedSession;
  }

  async getPomodoroRecords(userId = "default"): Promise<PomodoroSession[]> {
    return this.db
      .select()
      .from(pomodoroSessions)
      .where(eq(pomodoroSessions.userId, userId))
      .orderBy(desc(pomodoroSessions.createdAt));
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
}
