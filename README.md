# 🎓 CampusCash — AI-Powered Student Personal Finance Platform

> **Student-first financial decision support platform** engineered to solve the college pocket money dilemma: answering *"What can I safely spend today?"* and *"Can I afford this purchase?"* in seconds.

---

## 🚀 Key Highlights & Hero Features

- 🌟 **Daily Safe-to-Spend (The Hero Metric):** Calculates your true disposable daily allowance using the deterministic formula:
  $$\text{Daily Safe-to-Spend} = \frac{\text{Current Balance} - \text{Committed Bills} - \text{Remaining Savings Goals}}{\text{Remaining Days in Month}}$$
  Gracefully surfaces deficits with non-judgmental guidance rather than panic or shame.
- ⚖️ **"Can I Afford It?" Purchase Simulator:** Enter an item name and price (e.g. ₹2,499 sneakers) to immediately see the post-purchase state, daily allowance shrinkage, bill security, and decision verdict (`AFFORDABLE`, `TIGHT`, or `NOT_RECOMMENDED`). Confirming converts it into a recorded transaction with one click.
- 🤖 **AI Natural Language Expense Parsing:** Type freeform expense notes (e.g. *"Spent 180 on biryani lunch at canteen via UPI"*) and let the NLP engine extract amount, category, payment method, place, and date automatically.
- 💬 **Grounded AI Financial Coach:** Context-aware Q&A grounded strictly in the authenticated student's real wallet balance, recurring commitments, and category budgets.
- 📊 **Smart Category Budgets:** Visual progress bars with alert thresholds (`ON_TRACK`, `WARNING` at >80%, `EXCEEDED` at >100%) tailored for campus life (Food & Canteen, Academics & Books, Commute, Hangouts).
- 🎯 **Savings Goals:** Set milestones (Trips, Gadgets, Emergencies) with target dates, required monthly contribution calculators, and one-tap pocket money deposits.
- 🔄 **Recurring Subscriptions & Bills:** Keeps Spotify, mobile recharges, room rent, and mess advances on track so your Safe-to-Spend never leaves you stranded on bill day.
- 👥 **Roommate & Hostel Split Pools:** Track shared room bills and calculate exactly how much money your flatmates owe you without awkward group chats.

---

## 🛡️ Production Readiness & The 5 Hardening Steps

CampusCash is built with enterprise production standards:

### 1. Secrets Externalization (`.env`)
- **Zero hardcoded credentials**: All database passwords, cryptographically strong HMAC-SHA256 JWT keys (256-bit), CORS domains, and AI keys are driven by `.env` (configured via `.env.example`).
- **Dynamic Profile Switching**: Configured to seamlessly switch between zero-config local development (`dev` profile with embedded H2) and hardened production (`prod` profile with PostgreSQL + connection pooling).

### 2. Production Nginx & HTTPS/SSL Hardening
- **Reverse Proxy**: High-performance Nginx with keepalive upstream connections to Spring Boot (`backend:8080`).
- **Gzip Compression**: Compresses HTML, JS, CSS, JSON, and SVG assets for high-speed page loads.
- **Security Headers**: Includes `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection`, `Referrer-Policy`, and modern `Permissions-Policy`.
- **Dual Nginx Configurations**:
  - `frontend/nginx.conf`: Production HTTP reverse proxy + caching + SPA routing + Certbot ACME webroot challenge support.
  - `frontend/nginx.ssl.conf`: Full TLS/SSL configuration supporting HTTP/2, TLSv1.2 & TLSv1.3, strong cipher suites, HTTP-to-HTTPS permanent redirect, and HSTS.
- **Certbot & SSL Automation**: Automated Let's Encrypt renewal container configured in `docker-compose.prod.yml` and self-signed certificate generators (`scripts/generate-self-signed-ssl.bat` / `.sh`).

### 3. Database Schema Migrations via Flyway
- **Flyway Integration**: Automated versioned migrations via `V1__init_schema.sql` handling table structures, foreign key constraints, default sequences, and high-performance indexes (`idx_transactions_user_date`, `idx_transactions_user_cat`, `idx_budgets_user_month`, `idx_accounts_user_id`).
- **Production Validation**: In the `prod` profile, Hibernate's `ddl-auto` is locked to `validate` (`ddl-auto: validate`), preventing arbitrary DDL schema alterations and guaranteeing migration integrity.

### 4. Health Monitoring & Observability via Spring Boot Actuator
- **Actuator Endpoints**: Configured `/actuator/health` and `/actuator/info` reporting component statuses (PostgreSQL connectivity, disk space, and application liveness).
- **Public Probes with Route Protection**: Health probes are permitted without authentication in `SecurityConfig.java` to support container orchestrators (Docker, Kubernetes, AWS ECS, GCP Cloud Run), while Nginx selectively exposes `/actuator/health` and blocks internal management endpoints from public internet traffic.
- **Docker Compose Healthchecks**: Backend container declares healthcheck probes checking `/actuator/health`, preventing frontend and dependent containers from routing traffic until the application is fully operational.

### 5. Cloud AI & Heuristic Resilience (Gemini & OpenAI)
- **Multi-Provider LLM Integration**: Direct support for Google Gemini (`gemini-1.5-flash`) and OpenAI (`gpt-4o-mini`) via non-blocking REST calls.
- **Context-Grounded Financial Coaching**: AI prompts are dynamically grounded in the authenticated student's real financial context (wallet balance, daily safe rate, committed bills, and budget utilization).
- **Graceful Heuristic Fallback**: If external API keys are not supplied or network connectivity drops, the system seamlessly falls back to the deterministic local NLP parsing engine and grounded rules-based financial coach.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | Java 21 LTS + Spring Boot 3.4.3 | Modular monolith REST API |
| **Security** | Spring Security + JJWT 0.12.6 | Stateless JWT authentication, BCrypt password hashing |
| **Database** | Embedded H2 (Dev) / PostgreSQL (Prod) | File-backed zero-dependency local storage & containerized Postgres |
| **ORM & Migrations** | Hibernate 6.6 + Flyway Core | Domain models, indexes, versioned SQL migrations |
| **Observability** | Spring Boot Actuator | Production health, info, and metrics monitoring |
| **Calculation Engine** | Deterministic Financial Core | Pure mathematical service for Safe-to-Spend & Affordability simulations |
| **Frontend** | React 19 + Vite 6 | Lightning-fast Single Page Application (SPA) |
| **Styling & Theme** | Tailwind CSS + Dark Mode | Glassmorphism, tailored brand palette, mobile-responsive |
| **Icons & Visuals** | Lucide React + Recharts | Responsive data visualization |
| **Reverse Proxy & Web**| Nginx Alpine + Let's Encrypt | Gzip, TLSv1.2/1.3, security headers, Certbot |
| **Containerization** | Docker & Docker Compose | Multi-container setup for staging/production |

---

## 🏃 Quick Start Guide

### Prerequisites
- **Java 21 LTS**
- **Node.js (v18+) & npm**

### 1. Start the Backend (Spring Boot)
The backend runs with an embedded file-backed H2 database by default, requiring **zero external database installations**:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
* Backend API will be live at: `http://localhost:8080`
* Actuator Health Check: `http://localhost:8080/actuator/health`
* H2 Database Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:file:./data/campuscashdb`, User: `sa`, Password: `password`)

> **Note on Initial Data:** The backend automatically seeds student categories and a rich demo student profile on first launch.

---

### 2. Start the Frontend (React + Vite)
In a separate terminal:

```powershell
cd frontend
npm install
npm run dev
```
* Open your browser at: `http://localhost:5173`

---

## 🔑 Demo Student Credentials (Instant 1-Click Login)

The application includes a pre-seeded student account with realistic college expenses, active budgets, savings goals, and subscriptions:

| Field | Value |
| :--- | :--- |
| **Email** | `student@campus.edu` |
| **Password** | `password123` |
| **Student Name** | Aarav Sharma |
| **Monthly Allowance** | ₹8,000 |

> *Tip: You can simply click the green **"1-Click Demo Student Sign In"** button on the login screen to jump straight into the populated dashboard!*

---

## 🐳 Docker Deployment Options

### Standard Production Stack (HTTP)
Run PostgreSQL, Redis, Spring Boot Backend with Actuator healthchecks, and Nginx:

```bash
docker compose up --build -d
```
* Frontend Web App: `http://localhost`
* Backend API: `http://localhost:8080`
* Backend Health Probe: `http://localhost/actuator/health`

### Hardened Production Stack with HTTPS / SSL & Certbot
To run with HTTPS on port 443 with automated Let's Encrypt certificate renewal:

1. Copy `.env.example` to `.env` and fill in your domain name:
   ```bash
   cp .env.example .env
   ```
2. (For testing locally) Generate self-signed certificates:
   ```bash
   # On Windows:
   .\scripts\generate-self-signed-ssl.bat
   # On Linux/macOS:
   ./scripts/generate-self-signed-ssl.sh
   ```
3. Start the production stack:
   ```bash
   docker compose -f docker-compose.prod.yml up --build -d
   ```
* HTTPS Web App: `https://localhost` (or `https://yourdomain.com`)

---

## 🧪 Running Automated Tests

Run the deterministic financial calculation unit tests and Spring Boot integration tests:

```powershell
cd backend
.\mvnw.cmd test
```

To validate the frontend build:
```powershell
cd frontend
npm run build
```

---

## 📚 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new student account with monthly allowance |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token |
| `POST` | `/api/auth/refresh` | Refresh expired access token |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `GET` | `/api/dashboard` | Aggregated dashboard data & hero Safe-to-Spend |
| `GET` | `/api/transactions` | Search, filter, and paginate transactions |
| `POST` | `/api/transactions` | Create income or expense record |
| `DELETE`| `/api/transactions/{id}` | Delete transaction (auto-adjusts balance & safe rate) |
| `GET` | `/api/categories` | Retrieve global student & custom categories |
| `GET` | `/api/budgets` | Fetch monthly category budgets |
| `POST` | `/api/budgets` | Set or update monthly category limit |
| `GET` | `/api/budgets/utilization` | Fetch budget utilization and threshold alerts |
| `GET` | `/api/goals` | List active savings goals and suggested monthly rate |
| `POST` | `/api/goals` | Create a new savings goal |
| `POST` | `/api/goals/{id}/contribute` | Deposit pocket money into a goal |
| `GET` | `/api/recurring` | List subscriptions and upcoming due dates |
| `POST` | `/api/recurring` | Create recurring commitment |
| `POST` | `/api/affordability/check` | Simulate purchase affordability & safe-to-spend impact |
| `POST` | `/api/ai/parse-expense` | Natural language expense text extraction |
| `POST` | `/api/ai/chat` | Grounded conversational AI financial coach |
| `GET` | `/api/groups` | List shared roommate expense groups |
| `POST` | `/api/groups/{id}/expenses` | Record split group bill and calculate shares |
| `GET` | `/actuator/health` | Application health and database liveness status |
| `GET` | `/actuator/info` | Application metadata and build info |
