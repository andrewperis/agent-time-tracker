![Agent Time](https://img.shields.io/endpoint?url=https%3A%2F%2Fapi.2summits.com%2Fbadge%2Fstatus%3Fagent%3Dcodex%26repository%3Dtest&style=flat&cacheSeconds=60)

# Agent Time Tracker — Commit-Time Logging + Badge API

This project is a small, self-contained toolkit for tracking how much time an “agent” (developer, bot, CI runner, etc.) spends working inside a repository. It includes:

- A **Git commit hook example** that automatically appends tracked time to commit messages  
- A **Node.js API** that collects, stores, and aggregates those time entries  
- A **MySQL schema** and simple DB setup  
- An **example Shields.io badge** that displays total tracked time for any repo + agent combo  

It’s intentionally lightweight so you can read it, learn from it, and adapt it to your own workflows.

---

## How It Works

1. Your commit hook records seconds spent before each commit and appends a token into the commit message.  
2. A background process or post-commit script sends that tracked time to the Node API.  
3. The Node API saves agent/repository/branch/seconds into MySQL.  
4. Shields.io calls your `/badge/status` API endpoint.  
5. The API returns the required badge schema → Shields renders a live badge.

Flow:

```
Developer → Commit → Hook → Node API → DB → Badge
```

---

## Repo Structure

```
/
├── agent-example/          # Example git hook to track and send time
├── node-api/               # Express app for storing & aggregating time
├── sql/                    # Example MySQL schema & grants
└── README.md               # You're here
```

---

## 1. Agent Example (Commit-Time Hook)

Inside `agent-example/` you’ll find:

- An AGENTS.md to guide the agent on how to append the correct tokens to all commits

All commits performed by the agent will now append something like:

```
[agent:codex] [seconds:120]
```

And send the agent name and 120 seconds to the API.

---

## 2. Node API

The Node service lives in `node-api/`.

### Install dependencies

```bash
npm install
```

### Start locally

```bash
node app.js
```

### Environment variables

```text
DB_HOST=localhost
DB_USER=youruser
DB_PASS=yourpass
DB_NAME=yourdbname
PORT=3001
```

### Endpoints

#### Record time (POST)

```http
POST /agent-time
Content-Type: application/json

{
  "agent": "codex",
  "repository": "test",
  "branch": "main",
  "seconds": 120
}
```

#### Get badge payload (GET)

```http
GET /badge/status?agent=codex&repository=test
```

Example response:

```json
{
  "schemaVersion": 1,
  "label": "agent time",
  "message": "1h 12m",
  "color": "brightgreen"
}
```

---

## 3. MySQL Schema

Inside `sql/` you’ll find:

- `agent_time_entries` table  
- Example grants for read/write API users  
- Minimal schema intended for learning and extension  

Create the table:

```sql
CREATE TABLE agent_time_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agent VARCHAR(100) NOT NULL,
  repository VARCHAR(255) NOT NULL,
  branch VARCHAR(255) DEFAULT NULL,
  seconds INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);
```

---

## 4. Shields.io Badge

Once your API is live over HTTPS, you can generate badges like this:

### Raw API endpoint URL

```text
https://<your_domain>/badge/status?agent=codex&repository=test
```

### Encoded URL (for Shields)

```text
https%3A%2F%2F%3Cyour_domain%3E%2Fbadge%2Fstatus%3Fagent%3Dcodex%26repository%3Dtest
```

### Shields badge Markdown

```text
![Agent Time](https://img.shields.io/endpoint?url=https%3A%2F%2F%3Cyour_domain%3E%2Fbadge%2Fstatus%3Fagent%3Dcodex%26repository%3Dtest)
```

Place that in any README to display a live badge.

---

## 5. Deploying in Production

This project runs easily on:

- Bare-metal Ubuntu  
- Docker / Docker Compose  
- Kubernetes  
- Nginx Proxy Manager  
- Caddy / Traefik / Reverse Proxies  

All you need:

- Node 18+  
- MySQL 5.7+ / MariaDB  
- HTTPS endpoint reachable by Shields.io  

---

## 6. License

This project is licensed under the **MIT License**.  
You’re free to learn from it, use it, modify it, and share it.

See the `LICENSE` file for full details.

---

## 7. Why This Exists

This repository is meant as a clear, educational example of:

- A simple git-hook workflow  
- A lightweight Node API pattern  
- A database-backed logging approach  
- A live-updating badge powered by Shields.io  

Use it, extend it, embed it into your workflows, or fork it and build something new.
