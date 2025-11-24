import express from 'express';
import { getTotalSeconds, recordCodexTime } from './db.js';

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

const buildBadgePayload = async (repository) => {
  const totalSeconds = await getTotalSeconds(repository);
  const minutes = Math.round(totalSeconds / 60);

  return {
    schemaVersion: 1,
    label: 'codex time',
    message: `${minutes}`,
    color: 'blue',
  };
};

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/codex-time', async (req, res) => {
  const { repository, seconds } = req.body || {};

  if (typeof repository !== 'string' || repository.trim() === '') {
    return res.status(400).json({ error: 'repository is required' });
  }

  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds < 0) {
    return res.status(400).json({ error: 'seconds must be a non-negative number' });
  }

  try {
    const insertedId = await recordCodexTime({ repository: repository.trim(), seconds });

    return res.status(201).json({ id: insertedId, repository: repository.trim(), seconds });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to record codex time', error);
    return res.status(500).json({ error: 'Failed to record codex time' });
  }
});

app.get('/codex-time', async (req, res) => {
  const repository = (req.query.repository || '').trim();

  if (!repository) {
    return res.status(400).json({ error: 'repository is required' });
  }

  try {
    const payload = await buildBadgePayload(repository);

    return res.status(200).json(payload);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch codex time', error);
    return res.status(500).json({ error: 'Failed to fetch codex time' });
  }
});

app.get('/badge/status', async (req, res) => {
  const repository = (req.query.repository || '').trim();

  if (!repository) {
    return res.status(400).json({ error: 'repository is required' });
  }

  try {
    const payload = await buildBadgePayload(repository);

    return res.status(200).json(payload);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch badge', error);
    return res.status(500).json({ error: 'Failed to fetch badge' });
  }
});

export default app;
