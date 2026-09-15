const { Client } = require('pg');

async function alterTable() {
  const client = new Client({
    user: 'postgres',
    password: 'Nguyenh@minh@n150221',
    host: 'db.spoqkzsrcphgzvmxwadd.supabase.co',
    port: 5432,
    database: 'postgres',
  });

  try {
    await client.connect();
    console.log('Connected to database successfully');

    // Check if columns exist first
    const { rows } = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='articles';
    `);
    
    const columns = rows.map(r => r.column_name);
    console.log('Current columns:', columns);

    if (!columns.includes('attachment_url')) {
      console.log('Adding attachment_url...');
      await client.query('ALTER TABLE articles ADD COLUMN attachment_url text;');
    } else {
      console.log('attachment_url already exists');
    }

    if (!columns.includes('attachment_name')) {
      console.log('Adding attachment_name...');
      await client.query('ALTER TABLE articles ADD COLUMN attachment_name text;');
    } else {
      console.log('attachment_name already exists');
    }

    console.log('Alter table completed successfully!');
  } catch (err) {
    console.error('Database connection/query error:', err);
  } finally {
    await client.end();
  }
}

alterTable();
