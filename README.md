# DeployLab

A deliberately small MEAN-stack app (Angular 20 + Express/TypeScript + MongoDB Atlas) built to practise
real-world deployment on AWS EC2 with Nginx, PM2, HTTPS and GitHub Actions.
The app is a minimal project dashboard: list, add, change status, and delete projects.

```
DeployLab/
├── frontend/   Angular 20 app (calls the API at the relative URL /api)
├── backend/    Express + TypeScript + Mongoose API
├── .gitignore
└── README.md
```

## API

| Method | Endpoint            | Purpose                                   |
|--------|---------------------|-------------------------------------------|
| GET    | /api/health         | Health check (reports database status)    |
| GET    | /api/projects       | List projects (newest first)              |
| GET    | /api/projects/:id   | Get one project                           |
| POST   | /api/projects       | Create (`name` required)                  |
| PUT    | /api/projects/:id   | Update `name`, `description` and/or `status` |
| DELETE | /api/projects/:id   | Delete (returns 204)                      |

Project: `{ id, name, description, status: "Active" | "Completed" | "Archived", createdAt }`

## Run locally (Windows PowerShell)

Requirements: Node.js 20.19+ or 22, npm, and a MongoDB Atlas cluster (free tier is fine).

### 1. Backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
# Edit .env and set MONGODB_URI to your Atlas connection string
npm run dev          # http://localhost:5000
```

Check it: open http://localhost:5000/api/health, which should show `"database":"connected"`.

Atlas checklist: create a database user, and under *Network Access* allow your current IP.

### 2. Frontend

In a second terminal:

```powershell
cd frontend
npm install
npm start            # http://localhost:4200
```

`ng serve` forwards `/api/*` to `http://localhost:5000` using `frontend/proxy.conf.json`,
so the frontend code never needs to know the backend's address.

## Environment variables (backend/.env)

| Variable      | Purpose                                                            |
|---------------|--------------------------------------------------------------------|
| PORT          | Port the API listens on (default 5000)                             |
| HOST          | Interface to bind (default `127.0.0.1`, so only Nginx can reach it) |
| MONGODB_URI   | Atlas connection string (**secret**)                               |
| CORS_ORIGIN   | Comma-separated allowed browser origins                            |
| NODE_ENV      | `development` or `production`                                      |

`.env` is git-ignored. Only `.env.example` (no real values) is committed.

## Production build facts (needed for deployment)

- **Frontend:** `cd frontend; npm ci; npm run build`. The static files to serve are in
  `frontend/dist/frontend/browser/`. Nginx serves them and must fall back to `index.html`.
- **Backend:** `cd backend; npm ci; npm run build`. Start it with `node dist/server.js`
  (PM2 will run this). In production install only runtime dependencies with `npm ci --omit=dev`.
- The frontend calls `/api/...` on whatever domain it is served from, so Nginx must forward
  `/api/` to `http://127.0.0.1:5000`. Because everything is on one domain, the browser makes
  same-origin requests and CORS is not triggered (it is still configured as a safeguard).
- On the server, create `backend/.env` by hand (or via CI secrets). It is never in Git.

## Deployment roadmap

1. Local development (this repo)
2. Angular production build served by Nginx
3. Backend on EC2 managed by PM2
4. Nginx reverse proxy for `/api/`
5. Production config: Atlas access, `.env`, CORS, HTTPS with Certbot
6. GitHub Actions CI/CD
7. Final verification

Keep DeployLab in its own directory and its own Nginx server block, separate from the existing portfolio site.
