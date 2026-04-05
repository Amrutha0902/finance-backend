# Finance Data Processing and Access Control Backend

---

## 🚀 Live API & Documentation
The backend is currently **deployed and live on Render**! You can test all features through the interactive portal below:

- **Interactive API Documentation (Swagger):** [https://finance-backend-a5mq.onrender.com/api-docs]
- **Live Base URL:** `https://finance-backend-a5mq.onrender.com/api`
- **Health Check:** `https://finance-backend-a5mq.onrender.com/health`

---

## Section 1: Project Overview

### What is this project?
This project is a complete, production-ready backend API for a personal finance dashboard application. It acts as the "brain" and database manager for the finance system. When a user logs in, adds a transaction, or checks monthly spending trends, the frontend talks to this backend to get the job done.

### What problems does it solve?
Managing money requires precise math, secure data storage, and strict rules about who can see what. This backend solves these problems by securely hashing passwords, ensuring users can only access what they are allowed to via Role-Based Access Control (RBAC), and carefully storing all transaction history without ever permanently deleting financial records (using "soft deletes").

### Core Features
- JWT Authentication – Secure user registration and login with token-based sessions.
- Role-Based Access Control – VIEWER, ANALYST, and ADMIN roles with enforced permissions.
- Full Transaction CRUD – Create, Read, Update, Delete with filters, search, and pagination.
- Soft Delete – Transactions marked invisible — never truly deleted from the database.
- Dashboard Analytics – Summary, category breakdown, monthly trends, weekly summary, and recent activity.
- Input Validation – Strict schema checks (Zod) before data even touches the database.
- Standardized Error Handling – All API errors follow an identical, predictable JSON format.
- Swagger API Docs – Interactive Visual interface at [/api-docs](https://finance-backend-a5mq.onrender.com/api-docs) to test endpoints directly.
- Security Headers – Helmet.js protection against common web vulnerabilities.
- Rate Limiting – Stops bots from brute-forcing login routes or spamming the API.

### Tech Stack
- Node.js (Runtime)
- Express.js (Web Framework)
- SQLite (via better-sqlite3)
- JWT (Stateless Authentication)
- bcryptjs (Password Hashing)
- Zod (Data Validation)
- Jest + Supertest (Automated Testing)
- Swagger/OpenAPI (API Documentation)
- Helmet.js (Security Headers)
- express-rate-limit (API Rate Limiting)

---

## Section 2: What Is Inside This Project
- src/config/ — Database connection and schema initialization logic.
- src/middlewares/ — Security checkpoints (token verification, RBAC, etc).
- src/controllers/ — Request/response flow management.
- src/services/ — Core business logic and database queries.
- src/routes/ — Definition of all available URL endpoints.
- src/validators/ — Data rule enforcement via Zod schemas.
- src/utils/ — Reusable helpers for JWT, response formatting, and pagination.
- tests/ — Automated scripts for verifying all functionality.
- .env.example — Template for required environment variables.

---

## Section 3: How to Run This Project Locally

### Step 1: Install Node.js
Go to nodejs.org and download the LTS version. Verify it worked by running `node -v` in your terminal.

### Step 2: Install Dependencies
Run this command in the project folder to download the required tools:
```bash
npm install
```

### Step 3: Set Up the Environment File
Copy the .env.example file and rename it to .env:
- Windows: `copy .env.example .env`
- Mac/Linux: `cp .env.example .env`

Open the .env file and set a custom JWT_SECRET (any long random string).

### Step 4: Seed the Database (Important)
Add sample users and 20 transactions so the app is ready for testing:
```bash
npm run seed
```

This creates these 3 ready-to-use accounts:
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@finance.com | admin123 |
| Analyst | analyst@finance.com | analyst123 |
| Viewer | viewer@finance.com | viewer123 |

### Step 5: Start the Server
```bash
npm run dev
```
The server will start running on http://localhost:3000.

---

## Section 4: API Endpoints Reference

### Authentication
- POST /api/auth/register — Register a new user (Public)
- POST /api/auth/login — Login and receive JWT token (Public)
- GET /api/auth/me — Get current user profile (Private)

### User Management (Admin Only)
- GET /api/users — List all users (paginated, supports search/filter)
- GET /api/users/:id — Get single user by ID
- PUT /api/users/:id — Update user role or status
- DELETE /api/users/:id — Permanently delete a user

### Financial Records
- POST /api/records — Create new record (Admin Only)
- GET /api/records — List records (All roles, filters available)
- PUT /api/records/:id — Update record (Admin Only)
- DELETE /api/records/:id — Soft delete record (Admin Only)

---

## Section 5: Role and Permission Matrix

| Action | VIEWER | ANALYST | ADMIN |
|:-------|:------:|:-------:|:-----:|
| View transactions | ✅ | ✅ | ✅ |
| Create/Update/Delete transaction | ❌ | ❌ | ✅ |
| View dashboard summary | ✅ | ✅ | ✅ |
| View recent activity | ✅ | ✅ | ✅ |
| View category breakdown/trends | ❌ | ✅ | ✅ |
| Manage users (Admin Panel) | ❌ | ❌ | ✅ |

---

## Section 6: API Testing Gallery

This section provides visual proof of every major feature, including security enforcement, analytics, and documentation.

### Core Authentication & User Management
- **Successful Registration:**
  ![19_register](screenshots/19_register.png)
- **Successful Login:**
  ![20_login_success](screenshots/20_login_success.png)
- **Get My Profile:**
  ![03_get_profile](screenshots/03_get_profile.png)
- **Email Conflict (409 Error):**
  ![22_error_email_conflict](screenshots/22_error_email_conflict.png)
- **Health Check:**
  ![01_health_check](screenshots/01_health_check.png)

### RBAC and Validation Enforcement
- **Forbidden Action (Viewer cannot create):**
  ![23_rbac_forbidden_viewer](screenshots/23_rbac_forbidden_viewer.png)
- **Input Validation Error (Negative Amount):**
  ![21_validation_negative_amount](screenshots/21_validation_negative_amount.png)
- **Update User Role:**
  ![07_update_user](screenshots/07_update_user.png)
- **Delete User:**
  ![08_delete_user](screenshots/08_delete_user.png)

### Financial Data & Advanced Filtering
- **List Records (Default):**
  ![09_list_records](screenshots/09_list_records.png)
- **Advanced Filtering & Search:**
  ![24_list_records_filtered](screenshots/24_list_records_filtered.png)
- **Create Financial Record:**
  ![11_create_record](screenshots/11_create_record.png)
- **Update Financial Record:**
  ![12_update_record](screenshots/12_update_record.png)
- **Soft Delete Record:**
  ![13_delete_record](screenshots/13_delete_record.png)

### Dashboard Analytics & Trends
- **Total Summary:**
  ![14_dashboard_summary](screenshots/14_dashboard_summary.png)
- **Monthly Financial Trends:**
  ![25_dashboard_trends_monthly](screenshots/25_dashboard_trends_monthly.png)
- **Recent Activity:**
  ![15_recent_activity](screenshots/15_recent_activity.png)
- **Category Breakdown:**
  ![16_category_breakdown](screenshots/16_category_breakdown.png)

### Swagger UI Interactive Documentation
- **API Portal Overview:**
  ![26_swagger_ui_main](screenshots/26_swagger_ui_main.png)
- **Interactive Endpoint Test (Register):**
  ![27_swagger_register_test](screenshots/27_swagger_register_test.png)
- **Live Response Preview:**
  ![28_swagger_response_preview](screenshots/28_swagger_response_preview.png)

---

## Section 7: Assumptions and Design Decisions

1. Soft Deletes: Financial records are flagged with `deleted_at` instead of being removed, ensuring data integrity for future audits.
2. Denormalized User Names: When a record is created, the user's name is kept as part of the query results via SQL JOINs, ensuring fast performance.
3. Strict Validation: Every request body is checked twice—once by the validator middleware (Zod) and once by the database schema constraints.
4. JWT Re-validation: On every request, the backend re-checks the user's status in the database. If an account is deactivated, their token becomes invalid immediately.
5. Wallet Mode (WAL): SQLite is configured in WAL mode to allow concurrent reads and writes, which is critical for dashboard performance.

---
## Section 8: Deployment Status & Details

The app is deployed on **Render** (Free Tier). Here are the details of the active deployment:

- **Environment:** Node.js (v20+)
- **Build Command:** `npm install`
- **Start Command:** `npm run seed && npm start`
- **Auto-Deployment:** Enabled (updates on every GitHub `main` push)

---
1. Push your code to GitHub.
2. Connect your GitHub repo to Render.
3. Set the Build Command to `npm install`.
4. Set the Start Command to `npm start`.
5. Add your .env variables (PORT, JWT_SECRET, etc) in the Render dashboard.

---

## Section 9: Future Improvements
In the future, I plan to add:
- A CSV Export feature for financial records.
- A proper React-based Frontend to visualize the trends and data.
- Email notifications for large expense alerts.
- Multi-currency support.

---

**AUTHOR:** Amrutha Varshini Manam
