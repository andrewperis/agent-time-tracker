import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'codex',
  waitForConnections: true,
  connectionLimit: 10,
});

export async function recordCodexTime({ repository, seconds }) {
  const [result] = await pool.execute(
    'INSERT INTO codex_time_entries (repository, seconds) VALUES (?, ?)',
    [repository, seconds],
  );

  return result.insertId;
}
