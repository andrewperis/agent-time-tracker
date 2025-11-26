# Node API Skeleton

This folder contains a minimal Express-based web API skeleton.

## Setup

Ensure you are using Node.js 18.20+ with npm 10.8.2 or newer (as specified in `package.json`). With Corepack enabled, run:

```bash
corepack enable
corepack use npm@10.8.2
```

If you use `nvm`, the included `.nvmrc` pins the project to Node 18:

```bash
nvm use
```

1. Install dependencies:

   ```bash
   npm install
   ```

   If you rely on a proxy, prefer the standard environment variables `HTTP_PROXY`/`HTTPS_PROXY` or their npm equivalents `npm_config_proxy`/`npm_config_https_proxy`. The deprecated `npm_config_http_proxy` setting triggers warnings ("Unknown env config \"http-proxy\"") in newer npm versions; switching to the supported names prevents the warning while preserving proxy support. The bundled `.npmrc` leaves proxy values blank to avoid `ERR_INVALID_URL` errors when no proxy is configured; set the environment variables above (or create a local `.npmrc`) if you need to route traffic through a proxy.

2. Configure environment variables for the database and API key:

   - `API_KEY`: shared secret that must match the `x-api-key` (or `Authorization`) header on every request.
   - `DB_HOST`: MySQL host (default: `localhost`).
   - `DB_USER`: MySQL user (default: `root`).
   - `DB_PASSWORD`: MySQL password (default: empty string).
   - `DB_NAME`: MySQL database name (default: `codex`).

   Example:

   ```bash
   export API_KEY=super-secret-key
   export DB_HOST=localhost
   export DB_USER=myuser
   export DB_PASSWORD=mypassword
   export DB_NAME=codex
   ```

3. Ensure the database has a table for the agent time records:

   ```sql
   CREATE TABLE IF NOT EXISTS agent_time_entries (
     id INT AUTO_INCREMENT PRIMARY KEY,
     agent VARCHAR(255) NOT NULL,
     repository VARCHAR(255) NOT NULL,
     branch VARCHAR(255) NOT NULL,
     seconds INT NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

4. Start the server:

   ```bash
   npm start
   ```

5. During development, start with auto-reload:

   ```bash
   npm run dev
   ```

## Available Endpoints (unless noted, all require the API key header)

- `GET /health` – returns `{ "status": "ok" }` to verify the service is running.
- `POST /agent-time` – insert a record of repository time usage.
  - Request headers: `x-api-key: <API_KEY>` (or `Authorization: <API_KEY>`)
  - Request body:

    ```json
    { "agent": "codex", "repository": "repo_name", "branch": "main", "seconds": 123 }
    ```

  - Response: `201` with `{ "id": <new id>, "repository": "repo_name", "seconds": 123 }` on success.
- `GET /agent-time?agent=<agent>&repository=<repo_name>&branch=<branch_name>` – return the total minutes recorded for the repository as a badge-ready response.
  - Request headers: `x-api-key: <API_KEY>` (or `Authorization: <API_KEY>`)
  - Query string: `agent` (required), `repository` (required), `branch` (optional)
  - Response: `200` with the following payload on success:

    ```json
    {
      "schemaVersion": 1,
      "label": "<agent> time",
      "message": "<total minutes>",
      "color": "blue"
    }
    ```
- `GET /badge/status?agent=<agent>&repository=<repo_name>&branch=<branch_name>` – public endpoint (no API key required) returning the same badge payload for total minutes recorded for the repository.
  - Query string: `agent` (required), `repository` (required), `branch` (optional)
  - Response: `200` with the following payload on success:

    ```json
    {
      "schemaVersion": 1,
      "label": "<agent> time",
      "message": "<total minutes>",
      "color": "blue"
    }
    ```
