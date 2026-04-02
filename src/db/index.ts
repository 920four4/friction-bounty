import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    const sql = neon(connectionString);
    db = drizzle(sql, { schema });
  }
  return db;
}

// Export for convenience, but this will throw if DATABASE_URL isn't set
export { getDb as db };
