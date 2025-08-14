import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertActionSchema, 
  insertTodoSchema, 
  insertChallengeSchema,
  insertPomodoroSessionSchema,
  ACTION_XP_VALUES,
  type ActionType 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get game state
  app.get("/api/game-state", async (req, res) => {
    try {
      const userId = req.query.userId as string || "default";
      const gameState = await storage.getGameState(userId);
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ message: "Failed to get game state" });
    }
  });

  // Create action
  app.post("/api/actions", async (req, res) => {
    try {
      const validated = insertActionSchema.parse(req.body);
      
      // Set XP value based on action type
      validated.xpValue = ACTION_XP_VALUES[validated.type as ActionType] || 0;
      
      const action = await storage.createAction(validated);
      res.json(action);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid action data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create action" });
      }
    }
  });

  // Get today's actions
  app.get("/api/actions/today", async (req, res) => {
    try {
      const userId = req.query.userId as string || "default";
      const actions = await storage.getActions(userId);
      res.json(actions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get actions" });
    }
  });

  // Get action statistics
  app.get("/api/actions/stats", async (req, res) => {
    try {
      const userId = req.query.userId as string || "default";
      const days = parseInt(req.query.days as string) || 7;
      const stats = await storage.getActionStats(userId, days);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get action stats" });
    }
  });

  // Create todo
  app.post("/api/todos", async (req, res) => {
    try {
      const validated = insertTodoSchema.parse(req.body);
      const todo = await storage.createTodo(validated);
      res.json(todo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid todo data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create todo" });
      }
    }
  });

  // Get todos
  app.get("/api/todos", async (req, res) => {
    try {
      const userId = req.query.userId as string || "default";
      const todos = await storage.getTodos(userId);
      res.json(todos);
    } catch (error) {
      res.status(500).json({ message: "Failed to get todos" });
    }
  });

  // Update todo
  app.patch("/api/todos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const todo = await storage.updateTodo(id, updates);
      res.json(todo);
    } catch (error) {
      res.status(500).json({ message: "Failed to update todo" });
    }
  });

  // Delete todo
  app.delete("/api/todos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTodo(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete todo" });
    }
  });

  // Create challenge
  app.post("/api/challenges", async (req, res) => {
    try {
      const validated = insertChallengeSchema.parse(req.body);
      const challenge = await storage.createChallenge(validated);
      res.json(challenge);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid challenge data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create challenge" });
      }
    }
  });

  // Get active challenge
  app.get("/api/challenges/active", async (req, res) => {
    try {
      const userId = req.query.userId as string || "default";
      const challenge = await storage.getActiveChallenge(userId);
      res.json(challenge || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to get active challenge" });
    }
  });

  // Update challenge
  app.patch("/api/challenges/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const challenge = await storage.updateChallenge(id, updates);
      res.json(challenge);
    } catch (error) {
      res.status(500).json({ message: "Failed to update challenge" });
    }
  });

  // Start challenge
  app.post("/api/challenges/:id/start", async (req, res) => {
    try {
      const { id } = req.params;
      const challenge = await storage.updateChallenge(id, {
        active: true,
        startedAt: new Date(),
      });
      res.json(challenge);
    } catch (error) {
      res.status(500).json({ message: "Failed to start challenge" });
    }
  });

  // Stop challenge
  app.post("/api/challenges/:id/stop", async (req, res) => {
    try {
      const { id } = req.params;
      const challenge = await storage.updateChallenge(id, {
        active: false,
      });
      res.json(challenge);
    } catch (error) {
      res.status(500).json({ message: "Failed to stop challenge" });
    }
  });

  // Get achievements
  app.get("/api/achievements", async (req, res) => {
    try {
      const userId = req.query.userId as string || "default";
      const achievements = await storage.getAchievements(userId);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to get achievements" });
    }
  });

  // Start Pomodoro session
  app.post("/api/pomodoro/start", async (req, res) => {
    try {
      const validated = insertPomodoroSessionSchema.parse(req.body);
      const session = await storage.createPomodoroSession(validated);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid session data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to start pomodoro session" });
      }
    }
  });

  // End Pomodoro session
  app.post("/api/pomodoro/:id/end", async (req, res) => {
    try {
      const { id } = req.params;
      const { actionsCompleted, completed } = req.body;
      const session = await storage.endPomodoroSession(id, actionsCompleted, completed);
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to end pomodoro session" });
    }
  });

  // Get Pomodoro records
  app.get("/api/pomodoro/records", async (req, res) => {
    try {
      const userId = req.query.userId as string || "default";
      const records = await storage.getPomodoroRecords(userId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to get pomodoro records" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
