import { getDb } from './server/db.js';
import { emailTemplates } from './drizzle/schema.js';
import { eq } from 'drizzle-orm';

const db = await getDb();
const result = await db.delete(emailTemplates).where(eq(emailTemplates.name, 'Tech Bro Reality Check'));
console.log('Deleted old Tech Bro Reality Check template');
process.exit(0);
