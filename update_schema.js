const { Client } = require('pg');

async function updateSchema() {
  const client = new Client({
    user: 'postgres',
    password: 'Nguyenh@minh@n150221',
    host: 'db.spoqkzsrcphgzvmxwadd.supabase.co',
    port: 5432,
    database: 'postgres',
  });

  try {
    await client.connect();

    // 1. Create activity_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_email TEXT NOT NULL,
        action TEXT NOT NULL,
        target_type TEXT NOT NULL,
        details TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('Created activity_logs table.');

    // 2. Add metadata column to articles
    await client.query(`
      ALTER TABLE articles ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
    `);
    console.log('Added metadata column to articles.');

    // 3. Add status column to user_roles
    await client.query(`
      ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
    `);
    console.log('Added status column to user_roles.');

  } catch (err) {
    console.error('Error updating schema:', err);
  } finally {
    await client.end();
  }
}

updateSchema();
