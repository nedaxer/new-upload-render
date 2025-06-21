import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

// Create connection pool for better performance
const pool = mysql.createPool({
  host: 'sql7.freesqldatabase.com',
  port: 3306,
  user: 'sql7785049',
  password: 'k2kSfD5TYV',
  database: 'sql7785049',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const db = drizzle(pool, { schema, mode: 'default' });
