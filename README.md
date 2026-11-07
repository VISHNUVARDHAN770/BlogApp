# BlogApp — RESTful Blog Application

A full-stack blogging platform built with the **MERN stack**: MongoDB, Express.js, React.js, and Node.js.

> **Internship Project** · Innobyte Services · Full Stack Developer Intern

![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)
![Database](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![Authentication](https://img.shields.io/badge/Auth-JWT-orange)

## Features

- **Authentication:** User registration and login with JWT authentication.
- **Blog posts:** Create, read, update, and delete posts.
- **Comments:** Create, read, update, and delete comments on posts.
- **Authorization:** Only the owner can edit or delete their posts/comments.
- **API documentation:** Swagger UI (if configured in the backend).
- **Input validation:** Request validation with `express-validator`.
- **Database:** MongoDB Atlas with Mongoose.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router 7 |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JSON Web Token (JWT), bcryptjs |
| HTTP client | Axios |
| Validation | express-validator |
| API documentation | Swagger UI |
| Testing | Jest, Supertest  |
| Deployment | Vercel (frontend), Render (backend) |

## Project Structure

```text
BlogApp/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   └── Comment.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── posts.js
│   │   └── comments.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── tests/
│   ├── server.js
│   ├── swagger.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository

```bash
git clone https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY>.git
cd BlogApp
```

### 2. Configure and run the backend

```bash
cd backend
npm install
```

Create a `backend/.env` file:

```env
MONGO_URI=mongodb+srv://<username>:<url_encoded_password>@<cluster-host>/blogdb?retryWrites=true&w=majority
JWT_SECRET=<your_long_random_secret>
PORT=5000
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

Backend URL: `http://localhost:5000`

If Swagger is configured, API docs may be available at: `http://localhost:5000/api/docs`

### 3. Configure and run the frontend

Open a **second terminal** from the project root:

```bash
cd frontend
npm install
```

Create a `frontend/.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend URL: `http://localhost:5173`

## API Endpoints

### Authentication

| Method | Endpoint | Purpose | Authentication |
|---|---|---|---|
| POST | `/api/auth/register` | Register a user | No |
| POST | `/api/auth/login` | Login and receive a JWT | No |
| GET | `/api/auth/me` | Get the current user | Yes |

### Posts

| Method | Endpoint | Purpose | Authentication |
|---|---|---|---|
| GET | `/api/posts` | Get posts | No |
| GET | `/api/posts/:id` | Get one post | No |
| POST | `/api/posts` | Create a post | Yes |
| PUT | `/api/posts/:id` | Update own post | Yes |
| DELETE | `/api/posts/:id` | Delete own post | Yes |

### Comments

| Method | Endpoint | Purpose | Authentication |
|---|---|---|---|
| GET | `/api/comments?post_id=<postId>` | Get comments for a post | No |
| GET | `/api/comments/:id` | Get one comment | No |
| POST | `/api/comments` | Create a comment | Yes |
| PUT | `/api/comments/:id` | Update own comment | Yes |
| DELETE | `/api/comments/:id` | Delete own comment | Yes |

Protected endpoints use this request header:

```http
Authorization: Bearer <JWT_TOKEN>
```

> Confirm endpoint paths and response formats against your backend routes before publishing this section.

## Testing

If Jest and Supertest are configured in the backend:

```bash
cd backend
npm test
```

## Environment Variables & Security

- Never commit `.env` files, database passwords, or JWT secrets.
- Commit safe example files such as `.env.example` with placeholder values only.
- Add `backend/.env` and `frontend/.env` to `.gitignore`.
- If a credential was exposed, rotate it before pushing.

## Deployment

- **Frontend:** Deploy the `frontend` directory to Vercel.
- **Backend:** Deploy the `backend` service to Render.
- Set production environment variables in the deployment provider dashboard.
- Update `VITE_API_URL` to your deployed backend API URL.
- Add your final live URLs here after deployment.

## Author

**Ganjikunta Vishnu Vardhan**  
Full Stack Developer Intern · Innobyte Services
