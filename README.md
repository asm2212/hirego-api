# 🚀 HireGo - Job Portal API

**HireGo** is a scalable and secure backend API for a modern job portal system. Built with **Node.js**, **Express**, **TypeScript**, and **PostgreSQL**, it streamlines interactions between **Candidates**, **Hiring Managers**, and **Admins** in a role-based workflow.

---

## 🔧 Tech Stack

- **Backend:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Zod
- **File Uploads:** Multer (PDF resume handling)
- **Testing:** Jest & Supertest
- **Docs:** Swagger/OpenAPI
- **DevOps:** Docker, GitHub Actions

---

## 🧑‍💼 User Roles & Capabilities

| Role           | Capabilities                                                           |
|----------------|-----------------------------------------------------------------------|
| Candidate      | Register/login, view/filter jobs, apply with resume (PDF)             |
| Hiring Manager | Post/edit/delete own jobs, view applicants                            |
| Admin          | Manage all users, promote/demote roles, see all jobs & applications   |

---

## ✅ Key Features

- 🔐 Secure JWT-based authentication
- 🛡️ Role-Based Access Control (RBAC)
- 📄 Resume uploads with PDF validation
- 🔍 Filtering, sorting & pagination on jobs
- 📂 Modular MVC structure
- 🧪 Automated testing (Jest + Supertest)
- 📦 Dockerized for easy deployment
- 📜 Swagger API documentation

---

## 📂 Project Structure

```
src/
├── controllers/
├── routes/
├── services/
├── middlewares/
├── validators/
├── lib/          # Prisma client
├── app.ts        # Express config
└── server.ts     # Entrypoint
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js ≥ 18
- PostgreSQL installed & running
- `.env` file configured (see below)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/hirego-api.git
cd hirego-api
npm install
```

### 2. Configure Environment

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/hirego"
JWT_SECRET="your_secret_here"
```

### 3. Initialize Database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run Dev Server

```bash
npm run dev
# Server starts at: http://localhost:5000
```

---

## 🔌 API Endpoints

### Auth Routes (`/user`)

- `POST   /signup` — Register
- `POST   /login` — Login
- `GET    /me` — View profile

### Candidate Routes

- `GET    /jobs` — List all jobs
- `GET    /jobs/:id` — View job details
- `POST   /jobs/:id/apply` — Apply with resume

### Hiring Manager Routes

- `POST   /jobs` — Create job
- `GET    /manager/jobs` — View own jobs
- `PATCH  /jobs/:id` — Update own job

### Admin Routes

- `GET    /admin/users` — List all users
- `PATCH  /admin/users/:id/role` — Promote/demote user
- `GET    /admin/jobs` — View all jobs
- `GET    /admin/applications` — View all applications

---

## 🧪 Testing

```bash
npm run test
```
Runs unit & integration tests using Jest & Supertest.

---

## 📦 Deployment

### Docker

```bash
docker build -t hirego-api .
docker run -p 5000:5000 --env-file .env hirego-api
```

### CI/CD (GitHub Actions)

- Linting
- Automated testing
- Auto-deploy to Render/Heroku (add your config)

---

## 📜 License

MIT

---

## 🙌 Contributors

- Your Name – Developer

---

## 🌐 Live Demo

_Coming soon..._  
Or see [Swagger API docs](#) if deployed.

---

> **Tip:** PRs and contributions are welcome!
