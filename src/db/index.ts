import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import * as schema from "./schema";

// Configure Neon for serverless/edge environments
neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create Drizzle instance with schema
export const db = drizzle(pool, { schema });

// Export types for use throughout the app
export type Database = typeof db;
export { schema };

