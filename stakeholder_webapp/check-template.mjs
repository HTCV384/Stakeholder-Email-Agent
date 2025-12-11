import { getDb } from './server/db.js';
import { emailTemplates } from './drizzle/schema.js';
import { eq } from 'drizzle-orm';

const db = await getDb();
const templates = await db.select().from(emailTemplates).where(eq(emailTemplates.name, 'Casual Insider Approach'));
console.log('Found templates:', templates.length);
if (templates.length > 0) {
  console.log('Template ID:', templates[0].id);
  console.log('User ID:', templates[0].userId);
  console.log('Is Default:', templates[0].isDefault);
  console.log('Prompt length:', templates[0].promptTemplate?.length || 0);
  console.log('First 500 chars:', templates[0].promptTemplate?.substring(0, 500));
}
process.exit(0);
