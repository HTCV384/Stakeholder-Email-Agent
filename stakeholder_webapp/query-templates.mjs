import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.ts';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

const templates = await db.select().from(schema.emailTemplates);
console.log(JSON.stringify(templates, null, 2));

await connection.end();
