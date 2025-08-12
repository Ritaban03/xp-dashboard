import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { sql as dsql } from 'drizzle-orm';

export async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not found, skipping database initialization');
    return;
  }

  try {
    const client = neon(process.env.DATABASE_URL);
    const db = drizzle(client);

    console.log('Initializing database tables...');
    
    // Create tables if they don't exist
    await db.execute(dsql`
      CREATE TABLE IF NOT EXISTS game_state (
        id VARCHAR PRIMARY KEY,
        user_id VARCHAR NOT NULL DEFAULT 'default',
        current_xp INTEGER NOT NULL DEFAULT 0,
        current_level INTEGER NOT NULL DEFAULT 1,
        today_xp INTEGER NOT NULL DEFAULT 0,
        last_reset_date TEXT NOT NULL DEFAULT CURRENT_DATE::text,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(dsql`
      CREATE TABLE IF NOT EXISTS actions (
        id VARCHAR PRIMARY KEY,
        user_id VARCHAR NOT NULL DEFAULT 'default',
        type TEXT NOT NULL,
        xp_value INTEGER NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW(),
        date TEXT NOT NULL DEFAULT CURRENT_DATE::text
      );
    `);

    await db.execute(dsql`
      CREATE TABLE IF NOT EXISTS todos (
        id VARCHAR PRIMARY KEY,
        user_id VARCHAR NOT NULL DEFAULT 'default',
        title TEXT NOT NULL,
        xp_value INTEGER NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT false,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(dsql`
      CREATE TABLE IF NOT EXISTS challenges (
        id VARCHAR PRIMARY KEY,
        user_id VARCHAR NOT NULL DEFAULT 'default',
        type TEXT NOT NULL,
        target INTEGER NOT NULL,
        current INTEGER NOT NULL DEFAULT 0,
        time_limit INTEGER NOT NULL,
        time_remaining INTEGER NOT NULL,
        bonus_xp INTEGER NOT NULL DEFAULT 0,
        speed_multiplier INTEGER NOT NULL DEFAULT 100,
        active BOOLEAN NOT NULL DEFAULT false,
        completed BOOLEAN NOT NULL DEFAULT false,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(dsql`
      CREATE TABLE IF NOT EXISTS achievements (
        id VARCHAR PRIMARY KEY,
        user_id VARCHAR NOT NULL DEFAULT 'default',
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        unlocked_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(dsql`
      CREATE TABLE IF NOT EXISTS pomodoro_sessions (
        id VARCHAR PRIMARY KEY,
        user_id VARCHAR NOT NULL DEFAULT 'default',
        challenge_type TEXT,
        start_time TIMESTAMP DEFAULT NOW(),
        end_time TIMESTAMP,
        duration INTEGER NOT NULL,
        actions_completed INTEGER NOT NULL DEFAULT 0,
        xp_earned INTEGER NOT NULL DEFAULT 0,
        bonus_xp INTEGER NOT NULL DEFAULT 0,
        completed BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Database initialization failed:', error);
    // Don't exit, just log the error and continue
  }
}
