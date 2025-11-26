import express from 'express';
import { getTotalSeconds, recordAgentTime } from './db.js';

const app = express();
const apiKey = process.env.API_KEY;

app.use(express.json());

app.use((req, res, next) => {
  if (req.path === '/badge/status') {
    return next();
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const providedKey = req.header('x-api-key') || req.header('authorization');

  if (providedKey !== apiKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return next();
});

const buildBadgePayload = async (agent, repository, branch) => {
  const totalSeconds = await getTotalSeconds(agent, repository, branch);
  const minutes = Math.round(totalSeconds / 60);

  if (minutes > 60) {
    const hours = minutes / 60;
    minutes = (hours * 60) - minutes;
    const message = `${hours}h ${minutes}m`;
  }
  else {
    const message = `${minutes}m`;
  }

  return {
    schemaVersion: 1,
    label: `${agent} time`,
    message: message,
    color: 'blue',
  };
};

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/agent-time', async (req, res) => {
  const { agent, repository, branch, seconds } = req.body || {};

  if (typeof agent !== 'string' || repository.trim() === '') {
    return res.status(400).json({ error: 'agent is required' });
  }

  if (typeof repository !== 'string' || repository.trim() === '') {
    return res.status(400).json({ error: 'repository is required' });
  }

  if (typeof branch !== 'string') {
    return res.status(400).json({ error: 'branch is optional, but must be a string' });
  }

  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds < 0) {
    return res.status(400).json({ error: 'seconds must be a non-negative number' });
  }

  try {
    const insertedId = await recordAgentTime({ agent: agent.trim(), repository: repository.trim(), branch: branch.trim(), seconds });

    return res.status(201).json({ id: insertedId, agent: agent.trim(), repository: repository.trim(), branch: branch.trim(), seconds });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to record agent time', error);
    return res.status(500).json({ error: 'Failed to record agent time' });
  }
});

app.get('/agent-time', async (req, res) => {
  const agent = (req.query.agent || '').trim();
  const repository = (req.query.repository || '').trim();
  const branch = (req.query.branch || '').trim();

  if (!agent) {
    return res.status(400).json({ error: 'agent is required' });
  }
  if (!repository) {
    return res.status(400).json({ error: 'repository is required' });
  }

  try {
    const payload = await buildBadgePayload(agent, repository, branch);

    return res.status(200).json(payload);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch agent time', error);
    return res.status(500).json({ error: 'Failed to fetch agent time' });
  }
});

app.get('/badge/status', async (req, res) => {
  const agent = (req.query.agent || '').trim();
  const repository = (req.query.repository || '').trim();
  const branch = (req.query.branch || '').trim();

  if (!agent) {
    return res.status(400).json({ error: 'agent is required' });
  }
  if (!repository) {
    return res.status(400).json({ error: 'repository is required' });
  }

  try {
    const payload = await buildBadgePayload(agent, repository, branch);

    return res.status(200).json(payload);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch badge', error);
    return res.status(500).json({ error: 'Failed to fetch badge' });
  }
});

export default app;
