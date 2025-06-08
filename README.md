# 🚀 HireGo - Job Portal API

**HireGo** is a scalable, production-ready REST API for a modern job portal. Built with **Node.js**, **Express**, **TypeScript**, and **PostgreSQL**, it supports robust role-based workflows for **Candidates**, **Hiring Managers**, and **Admins**.

---

## 🔧 Tech Stack

- **Backend:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Zod
- **File Uploads:** Multer (PDF resume handling)
- **Testing:** Jest & Supertest
- **Docs:** Swagger/OpenAPI
- **DevOps:** Docker, Docker Compose, GitHub Actions (with DockerHub integration)

---

## 🧑‍💼 User Roles & Capabilities

| Role           | Capabilities                                                                 |
|----------------|------------------------------------------------------------------------------|
| Candidate      | Register/login, view/filter jobs, apply with resume (PDF), manage favorites   |
| Hiring Manager | Post/edit/delete own jobs, view applicants, update job status                 |
| Admin          | Manage all users (block, soft-delete, promote/demote roles), view all data    |

---

## ✅ Key Features

- 🔐 Secure JWT-based authentication
- 🛡️ Role-Based Access Control (RBAC)
- 📄 Resume uploads with PDF validation
- ⭐ Favorite jobs support
- 🔍 Filtering, sorting & pagination on jobs
- 🗂️ Modular MVC structure
- 🧪 Automated testing (Jest + Supertest)
- 📦 Dockerized for easy deployment
- 🚀 GitHub Actions CI/CD with DockerHub integration
- 📜 Swagger API documentation

---

## 📂 Project Structure

```
src/
├── controllers/         # Business logic
├── routes/              # Express routes
├── services/            # Service layer
├── middlewares/         # Auth, error handling, etc.
├── validators/          # Zod schemas
├── lib/                 # Prisma client
├── app.ts               # Express config
└── server.ts            # Entrypoint
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js ≥ 18
- PostgreSQL
- [Docker & Docker Compose](https://docs.docker.com/get-docker/) (optional, for easy setup)
- `.env` file configured (see below)

---

### 1. Clone & Install

```bash
git clone https://github.com/your-username/hirego-api.git
cd hirego-api
npm install
```

---

### 2. Configure Environment

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/hirego"
JWT_SECRET="your_secret_here"
```
For Docker Compose, use:

```env
DATABASE_URL="postgresql://<user>:<password>@db:5432/hirego"
JWT_SECRET="your_secret_here"
```
*(Replace `<user>` and `<password>` with your actual DB credentials.)*

---

### 3. Initialize Database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

### 4. Run Dev Server

```bash
npm run dev
# Server starts at: http://localhost:5000
```

---

### 5. Run with Docker

```bash
docker compose up --build
# Or to remove old volumes/data:
docker compose down -v && docker compose up --build
```

---

## 🔌 API Reference

All endpoints return JSON.  
For full interactive docs, see `/api-docs` (Swagger UI) when the server is running.

---

### **Authentication & User**

| Method | Endpoint           | Description                          | Auth         | Roles           |
|--------|--------------------|--------------------------------------|--------------|-----------------|
| POST   | `/signup`          | Register a new user                  | ❌           | —               |
| POST   | `/login`           | Login and get a JWT                  | ❌           | —               |
| GET    | `/me`              | Get current user profile             | ✅           | All             |

---

### **Admin**

| Method | Endpoint                      | Description                                 |
|--------|-------------------------------|---------------------------------------------|
| GET    | `/admin/users`                | Get all users                               |
| PATCH  | `/admin/users/:id/role`       | Promote/demote user role                    |
| PATCH  | `/admin/users/:id/block`      | Block/unblock a user                        |
| DELETE | `/admin/users/:id`            | Soft delete a user                          |
| GET    | `/admin/jobs`                 | Get all jobs                                |
| GET    | `/admin/applications`         | Get all job applications                    |
| PATCH  | `/admin/applications/:id/status` | Update application status (also manager) |

---

### **Hiring Manager**

| Method | Endpoint                   | Description                         |
|--------|----------------------------|-------------------------------------|
| POST   | `/create`                  | Create a new job                    |
| GET    | `/manager/myjobs`          | View own jobs                       |
| PATCH  | `/updatejob/:id`           | Update a job you created            |
| DELETE | `/deletejob/:id`           | Delete a job you created            |
| PATCH  | `/admin/applications/:id/status` | Update application status       |

---

### **Candidate**

| Method | Endpoint                  | Description                                   |
|--------|---------------------------|-----------------------------------------------|
| GET    | `/getalls`                | List all jobs (with filtering, sorting, paging)|
| GET    | `/jobs/:id`               | View job details                              |
| POST   | `/jobs/:id/apply`         | Apply to a job (attach resume PDF)            |
| GET    | `/user/applications`      | Get your applications                         |
| DELETE | `/user/applications/:id`  | Delete your application                       |
| GET    | `/user/applications/:id/resume` | Download your submitted resume           |
| POST   | `/jobs/:id/favorite`      | Add job to favorites                          |
| DELETE | `/jobs/:id/favorite`      | Remove job from favorites                     |
| GET    | `/user/favorites`         | List your favorited jobs                      |

---

### **Filtering, Sorting, Pagination Example**

`GET /getalls?page=1&limit=10&sortBy=createdAt&order=desc&jobType=Full-Time&location=NYC&companyName=Acme`

---

## 🧪 Testing

```bash
npm run test
```
Runs unit & integration tests using Jest & Supertest.

---

## 🐳 Docker & Production

### Build & Run with Docker

```bash
docker build -t hirego-api .
docker run -p 5000:5000 --env-file .env hirego-api
```

### Using Docker Compose

```bash
docker compose up --build
```

---

## 🚀 CI/CD (GitHub Actions & DockerHub)

- **Lint, test, and build Docker image** on every push to `main`
- **Automatic Docker image push** to DockerHub (`DOCKERHUB_USERNAME` / `DOCKERHUB_TOKEN` secrets required)
- See `.github/workflows/ci-cd.yml` for the full pipeline

To set up DockerHub deployment:
1. [Create an access token on DockerHub](https://hub.docker.com/settings/security)
2. Add `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` as GitHub repository secrets
3. Push to `main` and your image will be built & published!

---

## 📜 License

MIT

---

## 🙌 Contributors

- Asmare – Developer

---

## 🌐 Live Demo

_Coming soon..._  
Or see [Swagger API docs](#) if deployed.

---

> **Tip:** PRs and contributions are welcome!