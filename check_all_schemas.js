const { Client } = require('pg');

async function checkSchemas() {
  const client = new Client({
    user: 'postgres',
    password: 'Nguyenh@minh@n150221',
    host: 'db.spoqkzsrcphgzvmxwadd.supabase.co',
    port: 5432,
    database: 'postgres',
  });

  try {
    await client.connect();
    const tables = [
      'articles', 'activity_logs', 'donation_programs', 'questions', 
      'word_of_gods', 'mass_schedules', 'settings', 'footer_config', 'events', 'courses', 'albums'
    ];

    for (const table of tables) {
      const { rows } = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name=$1;
      `, [table]);
      
      console.log(`\n--- TABLE: ${table} ---`);
      if (rows.length === 0) {
        console.log('TABLE DOES NOT EXIST OR IS EMPTY!');
      } else {
        rows.forEach(r => console.log(`${r.column_name} (${r.data_type})`));
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
checkSchemas();
