# 📚 LearnBox – Department Knowledge Hub

A full-stack web application for a Computer Science Department featuring two portals:
- **Student Portal** (Angular) — Browse & download study materials and question papers
- **Admin Portal** (React) — Upload, manage, and delete materials and question papers

Both portals share a single **Node.js + Express** backend with **MongoDB** as the database.

---

## 🗂️ Project Structure

```
learnbox/
├── server/                  # Node.js + Express backend (REST API)
│   ├── config/              # Database connection
│   ├── controllers/         # Route logic
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── uploads/             # Uploaded files storage
│   ├── .env.example         # Environment variable template
│   └── server.js            # App entry point
│
├── student-portal/          # Angular 17 frontend (Student view)
│   └── src/
│
├── admin-portal/            # React + Vite frontend (Admin view)
│   ├── src/
│   └── .env.example         # Environment variable template
│
└── README.md
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js v18+
- MongoDB running locally (`mongodb://localhost:27017`)
- Angular CLI (`npm install -g @angular/cli`)

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/learnbox.git
cd learnbox
```

### 2. Set up the Backend
```bash
cd server
npm install
cp .env.example .env     # Fill in your values
npm start
```
Backend runs on **http://localhost:5000**

### 3. Set up the Admin Portal (React)
```bash
cd admin-portal
npm install
cp .env.example .env     # Set VITE_API_URL=http://localhost:5000/api
npm run dev
```
Admin portal runs on **http://localhost:5173**

### 4. Set up the Student Portal (Angular)
```bash
cd student-portal
npm install
ng serve
```
Student portal runs on **http://localhost:4200**

### 5. Seed the Database (optional)
```bash
cd server
node seed.js
```
Creates sample users:

| User ID | Name | Password | Role |
|---------|------|----------|------|
| STU001 | Alice Johnson | student123 | student |
| STU002 | Bob Williams | student123 | student |
| ADM001 | Dr. Robert Smith | admin123 | admin |
| ADM002 | Prof. Sarah Lee | admin123 | admin |

---

## 🌐 Deployment

| Service | Purpose |
|---------|---------|
| [Railway](https://railway.app) | Backend (Node.js) |
| [MongoDB Atlas](https://cloud.mongodb.com) | Database |
| [Netlify](https://netlify.com) | Admin Portal (React) |
| [Netlify](https://netlify.com) | Student Portal (Angular) |

See `.env.example` in each sub-folder for required environment variables.

---

## 🔑 API Endpoints

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/api/register` | Create account | No |
| POST | `/api/login` | Login | No |
| POST | `/api/logout` | Logout | Yes |
| GET | `/api/me` | Current user info | Yes |
| GET | `/api/materials` | List all materials | No |
| GET | `/api/materials/search?query=` | Search materials | No |
| POST | `/api/materials` | Upload material | Admin |
| DELETE | `/api/materials/:id` | Delete material | Admin |
| GET | `/api/questionpapers` | List all papers | No |
| GET | `/api/questionpapers/search?query=` | Search papers | No |
| POST | `/api/questionpapers` | Upload paper | Admin |
| DELETE | `/api/questionpapers/:id` | Delete paper | Admin |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | Session-based (express-session + connect-mongo) |
| File Upload | Multer |
| Student Frontend | Angular 17 |
| Admin Frontend | React 19 + Vite |
| Styling | Bootstrap 5 |

---

## 📄 License

MIT
