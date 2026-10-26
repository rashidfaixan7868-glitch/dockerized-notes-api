# Dockerized Node.js + MySQL REST API with Auth 🐳
 
A small Express.js REST API with user signup/login (bcrypt + JWT), protected routes and per-user notes and todos. The app, the MySQL database and phpMyAdmin all run in Docker containers, started together with one Docker Compose command.
 
## Why I built this
 
I am learning DevOps and backend development. This project started as a Docker practice app (containerization, a multi-container setup with Docker Compose, connecting an app to a database) and grew into a small REST API with authentication, protected routes and per-user data.
 
## Tech Stack
 
- Node.js + Express
- MySQL 8 (`mysql2` driver)
- bcryptjs (password hashing) and jsonwebtoken (JWT auth)
- phpMyAdmin (web UI for the database)
- Docker and Docker Compose
- GitHub Actions (Docker image build)
## Project Structure
 
```
.
├── server.js            # app setup, mounts the routers
├── db.js                # MySQL connection pool and table creation
├── middleware/
│   └── auth.js          # JWT check for protected routes
├── routes/
│   ├── auth.js          # /auth/signup, /auth/login
│   ├── notes.js         # /notes CRUD (per user)
│   └── todos.js         # /todos (per user)
├── Dockerfile
└── docker-compose.yaml
```
 
## Services
 
| Service | URL | Description |
| ------- | --- | ----------- |
| `app` | http://localhost:3000 | Node.js REST API |
| `mysql` | internal only | MySQL 8 database, reachable by the other containers as `mysql` |
| `phpmyadmin` | http://localhost:8080 | Database UI. Log in as `root` with the `MYSQL_PASSWORD` from your `.env` file |
 
## API Endpoints
 
| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| POST | `/auth/signup` | No | Create an account. Body: `{ "email", "password" }` |
| POST | `/auth/login` | No | Returns a JWT token (valid for 1 hour) |
| GET | `/notes` | Yes | List your notes (newest first) |
| POST | `/notes` | Yes | Add a note. Body: `{ "message" }` |
| PUT | `/notes/:id` | Yes | Update your note. Body: `{ "message" }` |
| DELETE | `/notes/:id` | Yes | Delete your note |
| GET | `/todos` | Yes | List your todos |
| POST | `/todos` | Yes | Add a todo. Body: `{ "message" }` |
 
Protected routes need the header `Authorization: Bearer <token>`. Each user can only see and change their own notes and todos.
 
The tables (`notes`, `todos`, `users`) are created automatically on startup. The app retries the database connection every 3 seconds, so it is fine if MySQL takes a few seconds to be ready.
 
## Prerequisites
 
- [Docker](https://docs.docker.com/get-docker/) with Docker Compose
- Git
## How to Run
 
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```
 
Create a `.env` file in the project root:
 
```
JWT_SECRET=any-long-random-text
MYSQL_PASSWORD=choose-a-password
```
 
Then start everything:
 
```bash
docker compose up --build
```
 
The API runs at `http://localhost:3000`. Use the examples below to test it.
 
> Note: MySQL stores its password the first time the database volume is created. If you change `MYSQL_PASSWORD` later, run `docker compose down -v` first (this deletes all database data).
 
## Try the API
 
**Windows PowerShell:**
 
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/auth/signup -ContentType "application/json" -Body '{"email":"a@x.com","password":"pass1234"}'
 
$res = Invoke-RestMethod -Method Post -Uri http://localhost:3000/auth/login -ContentType "application/json" -Body '{"email":"a@x.com","password":"pass1234"}'
$token = $res.token
 
Invoke-RestMethod -Method Post -Uri http://localhost:3000/notes -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" } -Body '{"message":"hello from docker"}'
 
Invoke-RestMethod -Uri http://localhost:3000/notes -Headers @{ Authorization = "Bearer $token" }
```
 
**Linux / macOS / Git Bash:**
 
```bash
curl -X POST http://localhost:3000/auth/signup -H "Content-Type: application/json" \
  -d '{"email":"a@x.com","password":"pass1234"}'
 
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" \
  -d '{"email":"a@x.com","password":"pass1234"}' | sed 's/.*"token":"\([^"]*\)".*/\1/')
 
curl -X POST http://localhost:3000/notes -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" -d '{"message":"hello from docker"}'
 
curl http://localhost:3000/notes -H "Authorization: Bearer $TOKEN"
```
 
## Useful Commands
 
```bash
docker compose ps              # see running containers
docker compose logs app        # app logs
docker compose up --build -d   # rebuild after changing code and run in background
docker compose down            # stop everything
docker compose down -v         # stop everything and delete ALL database data
```
 
## Configuration
 
The app reads its settings from environment variables, set through your `.env` file and `docker-compose.yaml`:
 
| Variable | Purpose |
| -------- | ------- |
| `MYSQL_HOST` | Database host (the MySQL service name in Compose, `mysql`) |
| `MYSQL_USER` | Database user |
| `MYSQL_PASSWORD` | Database password (from `.env`) |
| `MYSQL_DB` | Database name |
| `MYSQL_PORT` | Database port (default `3306`) |
| `PORT` | Port the app listens on (default `3000`) |
| `JWT_SECRET` | Secret used to sign login tokens (required, from `.env`) |
 
Secrets live in your local `.env` file, which is git-ignored. Never commit real passwords or keys.
 
## Screenshots
 
**Containers running**
 
![docker compose ps](screenshots/containers.png)
 
**API response**
 
![notes API](screenshots/api-notes.png)
 
**Data in phpMyAdmin**
 
![phpMyAdmin](screenshots/phpmyadmin.png)
 
## CI/CD
 
A GitHub Actions workflow builds the Docker image (run manually from the Actions tab). An earlier version deployed to AWS EC2 over SSH; that instance has been removed, so the deploy step is currently disabled.
 
## What I Learned
 
- Writing a `Dockerfile` for a Node.js app
- Difference between a Docker image and a container
- Running a multi-container app (app + database + phpMyAdmin) with Docker Compose
- Port mapping and container networking
- Configuring an app with environment variables and a `.env` file instead of hardcoding values
- Keeping database data in a Docker volume
- Writing GitHub Actions workflows
- Deploying to a remote server (AWS EC2) via SSH
- Building REST APIs with Express: routes, Router, request and response, status codes
- Password hashing with bcrypt and JWT-based authentication
- Middleware, and per-user authorization (users only access their own data)
- Reading logs to debug errors
## Author
 
**Rashid**, learning DevOps and backend development.