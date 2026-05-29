const fs = require('fs');
const path = require('path');
const db = require('./index');

async function runMigrations() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      executado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const { rows } = await db.query(
      'SELECT 1 FROM schema_migrations WHERE filename = $1',
      [file]
    );
    if (rows.length > 0) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    try {
      await db.query(sql);
      await db.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      console.log(`✅ Migration aplicada: ${file}`);
    } catch (e) {
      console.error(`❌ Erro na migration ${file}:`, e.message);
      throw e;
    }
  }
}

module.exports = { runMigrations };
