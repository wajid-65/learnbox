# Department Knowledge Hub — Full Stack Project Report

---

## 1. Title Page

| Field | Details |
|---|---|
| **Project Title** | Department Knowledge Hub (LearnBox) |
| **Your Name(s)** | *(Enter your name here)* |
| **Register Number(s)** | *(Enter your register number here)* |
| **Course / Department** | B.E. / B.Tech — Computer Science & Engineering |

---

## 2. Table of Contents

| # | Section |
|---|---|
| 1 | Title Page |
| 2 | Table of Contents |
| 3 | Abstract |
| 4 | Introduction |
| 5 | Literature Survey |
| 6 | Why This Project Is Needed |
| 7 | System Design |
| 8 | Database Design |
| 9 | Technology Stack |
| 10 | Implementation |
| 11 | Module Descriptions |
| 12 | Results & Screenshots |
| 13 | Testing |
| 14 | Advantages & Limitations |
| 15 | Future Enhancements |
| 16 | Conclusion |

---

## 3. Abstract

The **Department Knowledge Hub (LearnBox)** is a full-stack web application that provides a centralized platform for academic resource sharing. Students can view and download study materials and previous-year question papers, while admins manage content through a separate portal. Built with Angular (student portal), React (admin portal), Node.js/Express (backend), and MongoDB (database).

---

## 4. Introduction

Academic resources in most colleges are shared informally through messaging apps or physical copies, leading to inconsistency and unequal access. LearnBox solves this by providing a structured, role-based digital repository accessible to all students and faculty.

**Objectives:**
1. Centralize study materials and question papers in one online platform.
2. Implement secure, role-based access for students and admins.
3. Allow admins to upload and manage files; students to search and download.
4. Deploy the system on cloud platforms for 24/7 availability.

---

## 5. Literature Survey

### 5.1 Existing Systems

| System | Description |
|---|---|
| **Google Classroom** | A learning management system for assignment distribution and communication between teachers and students. |
| **Moodle** | An open-source LMS widely used in universities for course management, quizzes, and file sharing. |
| **College ERP Portals** | Institution-specific portals (e.g., EduSmart, iCampus) that manage attendance, marks, and sometimes material uploads. |
| **WhatsApp/Telegram Groups** | Informal but widely used by students to share notes and question papers among peers. |
| **Google Drive / OneDrive** | General-purpose cloud storage used by faculty to share PDFs and presentations via shared links. |

### 5.2 Limitations of Current Solutions

| System | Limitation |
|---|---|
| Google Classroom | Requires a Google Workspace account managed by the institution; not always available to all colleges. |
| Moodle | Complex to set up and maintain; requires dedicated server infrastructure and IT support. |
| College ERP Portals | Usually built for administrative tasks (fees, attendance), not academic content management; materials section is often poorly designed. |
| WhatsApp / Telegram | No structure or categorization; files expire or get lost; quality is unverified; no search capability. |
| Google Drive | No role-based access; anyone with a link can share further; no department-specific organization. |

---

## 6. Why This Project Is Needed

| Problem | LearnBox Solution |
|---|---|
| Resources scattered across multiple platforms | Single centralized repository |
| Students miss question papers before exams | Dedicated, searchable question paper archive |
| Anyone can upload incorrect content | Admin-only upload; students are read-only |
| No easy way to filter by subject or semester | Built-in search and filter |
| Physical handouts are lost or damaged | Permanent digital storage with download links |
| Existing tools are too complex for small departments | Lightweight, purpose-built for one department |

---

## 7. System Design

### 7.1 Architecture

```
┌─────────────────────┐       ┌─────────────────────┐
│   Student Portal     │       │   Admin Portal       │
│   (Angular 17)       │       │   (React 19 + Vite)  │
│   Port: 4200         │       │   Port: 5173         │
└──────────┬──────────┘       └──────────┬──────────┘
           │        HTTP REST API         │
           └──────────────┬──────────────┘
                          │
             ┌────────────▼───────────┐
             │  Node.js / Express     │
             │  Backend (Port 5000)   │
             │  Session Auth          │
             └────────────┬───────────┘
                          │ Mongoose
             ┌────────────▼───────────┐
             │      MongoDB Atlas      │
             │  department_knowledge   │
             │         _hub           │
             └────────────────────────┘
```

### 7.2 Sequence Diagram — Login Flow

```
Student/Admin        Angular/React         Express Backend        MongoDB
     │                    │                      │                   │
     │──── Enter ─────────▶                      │                   │
     │     Credentials     │                      │                   │
     │                    │──── POST /api/login ─▶│                   │
     │                    │                      │──── Find user ────▶│
     │                    │                      │◀─── User doc ──────│
     │                    │                      │                   │
     │                    │                      │── bcrypt.compare() │
     │                    │                      │   (verify pwd)    │
     │                    │                      │                   │
     │                    │◀─── 200 OK + session ─│                   │
     │                    │     cookie            │──── Save session ─▶│
     │◀─── Redirect to ───│                      │                   │
     │     Dashboard       │                      │                   │
```

### 7.3 Sequence Diagram — File Upload (Admin)

```
Admin           React Portal        Express Backend      MongoDB        Disk Storage
  │                  │                    │                 │               │
  │─ Select file ───▶│                    │                 │               │
  │  + metadata      │                    │                 │               │
  │                  │── POST /api/ ──────▶                 │               │
  │                  │   materials        │                 │               │
  │                  │   (multipart)      │── Multer ───────────────────────▶│
  │                  │                    │   validates &   │    File saved  │
  │                  │                    │   saves file    │               │
  │                  │                    │── Save record ─▶│               │
  │                  │                    │   to MongoDB    │               │
  │                  │◀── 201 Created ────│                 │               │
  │◀─ List updated ──│                    │                 │               │
```

---

## 8. Database Design

**Database:** MongoDB | **ODM:** Mongoose

### Collection: `users`

| Field | Type | Description |
|---|---|---|
| `user_id` | String (unique) | Roll number or admin ID |
| [name](file:///d:/learnbox/server/routes/materials.js#9-13) | String | Full name |
| `password` | String | bcrypt-hashed |
| `role` | Enum: student / admin | Access level |
| `department` | String | Department name |

### Collection: `materials`

| Field | Type | Description |
|---|---|---|
| `title` | String | Material title |
| `subject` | String | Subject name |
| `semester` | String | e.g., "3rd Semester" |
| `file_url` | String | Path to uploaded file |
| `uploaded_by` | String | Uploader's user_id |
| `upload_date` | Date | Auto-set to now |

### Collection: `questionpapers`

| Field | Type | Description |
|---|---|---|
| `subject` | String | Subject name |
| `year` | String | Exam year |
| `semester` | String | Semester |
| `file_url` | String | Path to uploaded file |
| `uploaded_by` | String | Uploader's user_id |

> Sessions are stored automatically in a `sessions` collection by `connect-mongo`.

---

## 9. Technology Stack

### Frontend

| Portal | Technology |
|---|---|
| Student Portal | Angular 17 (TypeScript), Bootstrap 5 |
| Admin Portal | React 19 (JSX), Vite, Bootstrap 5 |

### Backend

| Technology | Purpose |
|---|---|
| Node.js + Express 4 | REST API server |
| express-session + connect-mongo | Session-based authentication |
| bcryptjs | Password hashing |
| multer | File upload handling |
| cors | Cross-origin request handling |

### Database & Tools

| Technology | Purpose |
|---|---|
| MongoDB Atlas | Cloud-hosted NoSQL database |
| Mongoose | Database ODM |
| Git + VS Code | Version control and development |
| Railway | Backend deployment |
| Netlify | Frontend deployment |

---

## 10. Implementation

### 10.1 Student Portal Pages (Angular 17)

| Page | Route | Purpose |
|---|---|---|
| Login | `/login` | Student authentication |
| Register | `/register` | New account creation |
| Dashboard | `/dashboard` | Overview and navigation |
| Materials | `/materials` | Browse and download study materials |
| Question Papers | `/question-papers` | Browse and download past papers |
| Search | `/search` | Search across all resources |

### 10.2 Admin Portal Pages (React 19)

| Page | Purpose |
|---|---|
| Login | Admin authentication |
| Register | Create student/admin accounts |
| Dashboard | Overview with resource counts |
| Materials | Upload, view, delete study materials |
| Question Papers | Upload, view, delete question papers |

### 10.3 API Endpoints

#### Auth (`/api`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/login` | Login |
| POST | `/api/register` | Register user |
| POST | `/api/logout` | Logout |
| GET | `/api/me` | Get current user |

#### Materials (`/api/materials`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/materials` | Get all materials |
| GET | `/api/materials/search?q=` | Search materials |
| POST | `/api/materials` | Upload material (admin) |
| DELETE | `/api/materials/:id` | Delete material (admin) |

#### Question Papers (`/api/questionpapers`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/questionpapers` | Get all papers |
| GET | `/api/questionpapers/search?q=` | Search papers |
| POST | `/api/questionpapers` | Upload paper (admin) |
| DELETE | `/api/questionpapers/:id` | Delete paper (admin) |

---

## 11. Module Descriptions

### 11.1 Student Module

Students can log in, browse study materials and question papers, search by keyword, and download files. They cannot upload or delete any content. Route guards enforce access control on the Angular side.

### 11.2 Admin Module

Admins log in to a separate React portal with full content management rights. They can upload materials (PDF, DOCX, PPTX) and question papers (PDF, DOCX), delete existing entries, and register new student or admin accounts. All sessions expire after 24 hours.

---

## 12. Results & Screenshots

> *(Insert screenshots of the running application here)*

| Screen | Description |
|---|---|
| Student Login | Login form with user ID and password |
| Student Dashboard | Navigation sidebar and welcome message |
| Materials Page | List with subject, semester, and download button |
| Question Papers Page | List with subject, year, semester, and download |
| Search Page | Keyword search with live results |
| Admin Dashboard | Resource counts and navigation |
| Admin Materials | Upload form and table with delete button |
| Admin Question Papers | Upload form and table with delete button |

---

## 13. Testing

### Test Cases Used

| Test Case | Description |
|---|---|
| TC-01 | Valid student login |
| TC-02 | Invalid credentials login |
| TC-03 | Admin login |
| TC-04 | Upload a valid material file (admin) |
| TC-05 | Upload an invalid file type |
| TC-06 | Delete a material (admin) |
| TC-07 | Student blocked from uploading |
| TC-08 | Search materials by keyword |
| TC-09 | Search question papers |
| TC-10 | Logout |
| TC-11 | Register new student |
| TC-12 | Duplicate user registration |
| TC-13 | Access protected route without login |
| TC-14 | Session persistence after tab reopen |
| TC-15 | Download a material file |

---

## 14. Advantages & Limitations

### Advantages
- Dual-portal architecture for clear separation of roles
- Single shared backend reduces infrastructure complexity
- Session-based auth — no token management on the frontend
- File type validation prevents invalid uploads
- Deployed on cloud (MongoDB Atlas, Railway, Netlify)
- Keyword search with case-insensitive filtering

### Limitations
- Files stored on server disk — not persistent on cloud without a volume
- No email verification during registration
- No pagination for large content lists
- Supports only a single department currently

---

## 15. Future Enhancements

1. **Cloud File Storage (AWS S3)** — Replace disk storage for scalable file hosting.
2. **Email/OTP Verification** — Validate users during registration.
3. **Pagination** — Handle large datasets efficiently.
4. **Notifications** — Alert students when new materials are added.
5. **Ratings & Comments** — Let students rate and review materials.
6. **Multi-Department Support** — Scale to multiple departments.
7. **Mobile App** — React Native companion app for students.
8. **Admin Analytics** — Show download counts and popular resources.

---

## 16. Conclusion

The Department Knowledge Hub (LearnBox) successfully delivers a centralized, role-based academic resource platform for a Computer Science department. The dual-portal design with Angular and React, backed by a shared Node.js/Express server and MongoDB, demonstrates a practical full-stack application. All core objectives — authentication, file management, search, and cloud deployment — were achieved and tested. LearnBox lays a strong foundation for future enhancements that can scale it to larger institutions.

---

*End of Report*
