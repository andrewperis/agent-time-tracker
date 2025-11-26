import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'codex',
  waitForConnections: true,
  connectionLimit: 10,
});

export async function recordAgentTime({ agent, repository, branch, seconds }) {
  const [result] = await pool.execute(
    'INSERT INTO agent_time_entries (agent, repository, branch, seconds) VALUES (?, ?, ?, ?)',
    [agent, repository, branch, seconds],
  );

  return result.insertId;
}

export async function getTotalSeconds(agent, repository, branch) {
  let rows = [];

  if (branch === null || branch.trim() === '') {
    const [result] = await pool.execute(
      'SELECT COALESCE(SUM(seconds), 0) AS totalSeconds FROM agent_time_entries WHERE agent = ? AND repository = ?',
      [agent, repository],
    );

    rows = result;
  }
  else {
    const [result] = await pool.execute(
      'SELECT COALESCE(SUM(seconds), 0) AS totalSeconds FROM agent_time_entries WHERE agent = ? AND repository = ? AND branch = ?',
      [agent, repository, branch],
    );

    rows = result;
  }

  return rows[0]?.totalSeconds || 0;
}
