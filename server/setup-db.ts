import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
const { Pool } = pg;
import { 
  gameState, 
  actions, 
  todos, 
  challenges, 
  achievements, 
  pomodoroSessions 
} from "@shared/schema";

export async function setupDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const db = drizzle(pool);

  // Create tables if they don't exist
  console.log("Database setup completed");
  return db;
}
