# CampusCash — Full Project Implementation Plan

CampusCash is an AI-powered, student-first personal finance platform designed to provide forward-looking decision support (such as **Safe-to-Spend** and **"Can I Afford It?"** purchase simulation) alongside core tracking (transactions, budgets, savings goals, recurring bills, and group splits).

This plan details the end-to-end development roadmap across the Spring Boot backend, the React + Tailwind frontend, the financial calculation engine, and the AI integration layer.

---

## User Review Required

> [!IMPORTANT]
> **Docker & Database Availability:**
> - Docker is currently not installed or in the system `PATH`.
> - Java 21 LTS and Node.js v24 are installed and ready.
> - **Proposed approach:** We will configure Spring Boot with an embedded **H2 database (file-backed for persistence across runs)** for local development with zero external setup friction, while simultaneously providing a standard `application-postgres.yml` and `docker-compose.yml` for production deployments.

> [!NOTE]
> **AI Provider & Fallback:**
> - The AI Assistant and Natural Language Expense Parser will support standard LLM API integration (e.g. Gemini / OpenAI via environment variables).
> - If no API key is configured in the environment, the app will seamlessly fall back to an intelligent local heuristic parser and rule-based financial advice generator so all features remain testable and functional offline.

---

## Open Questions

> [!IMPORTANT]
> 1. **AI Service Preference:** Do you prefer Google Gemini (`GEMINI_API_KEY`) or OpenAI (`OPENAI_API_KEY`) for the cloud AI integration?
> 2. **Authentication Flow:** Should initial onboarding include sample seed data (e.g., student dummy transactions and typical college budgets for mess, chai, books) to make demoing immediate after registration?

---

## Proposed Changes

```
CampusCash/
├── backend/                  # Java 21 + Spring Boot Modular Monolith
│   ├── mvnw / mvnw.cmd       # Maven Wrapper
│   ├── pom.xml               # Dependencies: Web, Security, JWT, JPA, H2, PostgreSQL, Validation
│   └── src/main/java/com/campuscash/
│       ├── config/           # Security, JWT, CORS, OpenApi configs
│       ├── auth/             # User registration, JWT login, token refresh
│       ├── user/             # Profile, onboarding preferences
│       ├── account/          # Wallets (Cash, UPI/Bank, Savings)
│       ├── transaction/      # Income/Expense CRUD, search, filter, pagination
│       ├── category/         # Pre-seeded student categories + custom categories
│       ├── budget/           # Monthly category budgets, alert thresholds
│       ├── goal/             # Savings goals, milestone tracking
│       ├── recurring/        # Subscriptions, bills, next due reminders
│       ├── calculation/      # Pure deterministic math: Safe-to-Spend & Affordability
│       ├── analytics/        # Category distribution, monthly income vs expense
│       ├── affordability/    # "Can I Afford It?" simulator
│       ├── ai/               # NLP transaction parsing, contextual AI assistant
│       └── group/            # Shared roommate/hostel expense splits
├── frontend/                 # React + Vite + Tailwind CSS + Framer Motion
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── api/              # Axios / Fetch client with JWT interceptor
│       ├── components/       # Reusable UI library (Cards, Buttons, Modals, Badges)
│       ├── context/          # AuthContext, ThemeContext (Light/Dark)
│       ├── layouts/          # Responsive AppLayout (Sidebar desktop / BottomNav mobile)
│       ├── pages/
│       │   ├── Dashboard/    # Hero Safe-to-Spend, Quick metrics, visual widgets
│       │   ├── Transactions/ # Search, filter, add/edit/delete, receipt upload
│       │   ├── Budgets/      # Visual budget meters & threshold warnings
│       │   ├── Goals/        # Savings targets & progress visualizers
│       │   ├── Recurring/    # Subscriptions & recurring bill tracker
│       │   ├── Affordability/# Interactive "Can I Afford It?" simulator
│       │   ├── AIAssistant/  # Chat assistant & NLP expense parser preview
│       │   ├── Groups/       # Roommate/hostel split & balance settlement
│       │   └── Auth/         # Login, Register, Onboarding
│       └── utils/            # Currency formatters (₹), date helpers
├── docker-compose.yml        # Multi-container orchestration (Postgres, Redis, App)
└── README.md                 # Complete setup, architecture, and running guide
```

---

### Phase 1: Backend Scaffolding & Core Architecture

Scaffold the Spring Boot 3 modular monolith using Maven Wrapper and Java 21.

#### [NEW] `backend/pom.xml`
- `spring-boot-starter-web`
- `spring-boot-starter-security`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-validation`
- `jjwt-api`, `jjwt-impl`, `jjwt-jackson` (JWT 0.12.x)
- `com.h2database:h2` (dev profile)
- `org.postgresql:postgresql` (prod profile)
- `lombok` for clean model representations

#### [NEW] `backend/src/main/resources/application.yml`
- Dual profile setup: `dev` (H2 persistent file db `jdbc:h2:file:./data/campuscashdb`) and `prod` (PostgreSQL).
- JWT secret configuration, token expiration intervals, CORS origin rules.

#### [NEW] Core Security & Auth Module
- `User`, `Role` entities.
- `JwtAuthenticationFilter`, `JwtTokenProvider`, `SecurityConfig` with BCrypt password encoder.
- Endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `GET /api/auth/me`.

---

### Phase 2: Core Domain Entities & Financial Calculation Engine

Implement core personal finance entities and pure mathematical calculation service.

#### [NEW] Domain Entities
- `Account`: Wallets (Cash, Bank, UPI, Savings).
- `Category`: Pre-seeded default student categories (Food & Canteen, Books & Academics, Hostel/Rent, Commute, Hangouts, Subscriptions, Health, Miscellaneous).
- `Transaction`: Amount, type (`INCOME`, `EXPENSE`), date, category, payment method, merchant, receipt image link.
- `Budget`: Category limit, period (start/end date).
- `Goal`: Target amount, current saved amount, deadline.
- `RecurringTransaction`: Amount, frequency (`DAILY`, `WEEKLY`, `MONTHLY`), next payment date, category.

#### [NEW] `calculation/FinancialCalculationService.java`
- Pure, deterministic, heavily tested methods:
  - **Safe-to-Spend**: `(Total Balance - Upcoming Committed Subscriptions - Remaining Monthly Goal Targets) / Remaining Days in Month`.
  - **Budget Utilization**: Percentages, remaining limits, warning levels (`NORMAL`, `WARNING` >80%, `EXCEEDED` >100%).
  - **Affordability Engine**: Computes post-purchase balance, reduction in daily safe-to-spend, and goal timeline delay.

---

### Phase 3: REST API Endpoints & Business Services

Implement modular controllers, service layers, and DTO validations:

#### [NEW] API Controllers
- `DashboardController`: Returns aggregated hero data (Balance, Safe-to-Spend, Budget Summaries, Recent Activity, Goal Milestones).
- `TransactionController`: CRUD with pagination, category filter, date ranges, and search.
- `CategoryController`: Default listing + user custom categories.
- `BudgetController`: Set/update category budgets and query utilization.
- `GoalController`: Track progress, contribute funds to a goal.
- `RecurringController`: Manage subscriptions and view upcoming calendar items.
- `AffordabilityController`: `POST /api/affordability/check` running purchase simulation.
- `GroupController`: Roommate shared expenses and balance settlements.

---

### Phase 4: AI Layer & Natural Language Workflows

Implement the AI assistant module with strict guardrails:

#### [NEW] `ai/` Module
- `AiExpenseParserService`: Parses freeform text (e.g. *"Spent 150 on printouts and snacks via GPay"*) into structured DTO `{ amount: 150, category: "Academics", paymentMethod: "UPI", merchant: "Campus Print Shop" }`.
- `AiAssistantService`: Grounded Q&A with authenticated user's financial context (never exposes database secrets or raw SQL; provides educational, actionable tips).
- Fallback Heuristic Engine: Ensures 100% offline functionality if external LLM API is unavailable.

---

### Phase 5: Frontend Web Application (React + Vite + Tailwind CSS)

Build an engaging, responsive, student-centric single page application.

#### [NEW] `frontend/` Core Setup
- Vite + React + Tailwind CSS + Lucide Icons + Recharts.
- Theme system supporting light and dark mode with persistent user preference.
- Design tokens based on an 8px grid, modern sans-serif typography, clean cards, and semantic color accents.

#### [NEW] Frontend Pages & Features
- **Authentication & Onboarding**: Fast sign up, login, and initial income/budget setup wizard.
- **Dashboard (`/`)**:
  - **Hero Safe-to-Spend widget** displaying the daily allowance, calculation breakdown, and health status.
  - Income, Expense, and Savings summary cards.
  - Quick action buttons (Add Expense, Add Income, "Can I Afford It?", AI Chat).
  - Spending Trends line chart and Category breakdown pie chart (Recharts).
  - Active Budgets progress meters with color-coded warnings.
  - Savings Goals cards with progress bars.
  - Upcoming recurring bills alert card.
  - Recent transactions list.
- **Transactions Page (`/transactions`)**:
  - Filterable by type, category, date, and keyword search.
  - "Add Transaction" modal with instant category suggestion.
- **Budgets Page (`/budgets`)**:
  - Visual monthly budget meters and threshold alerts.
- **Goals Page (`/goals`)**:
  - Goal target calculator, savings simulator, and deposit tracker.
- **Affordability Simulator (`/affordability`)**:
  - Interactive calculator: enter item name and price, receive an immediate visual verdict and AI explanation.
- **AI Assistant Drawer / Page (`/ai`)**:
  - Conversational assistant with pre-configured prompt chips ("How can I save ₹1,000 this month?", "Where did most of my money go?").
  - Natural Language quick-add bar.
- **Shared Expenses / Groups (`/groups`)**:
  - Group bill splits and balance settlements.

---

### Phase 6: End-to-End Testing, Docker & Documentation

#### [NEW] Automated Tests
- Backend calculation unit tests (`SafeToSpendTest`, `AffordabilityTest`, `BudgetUtilizationTest`).
- Backend integration tests for auth and transactions.
#### [NEW] Containerization & Docs
- `Dockerfile` for Backend (multi-stage Java build).
- `Dockerfile` for Frontend (Nginx static hosting).
- `docker-compose.yml` orchestrating Postgres, Redis, backend, and frontend.
- `README.md` with step-by-step local execution instructions.

---

## Verification Plan

### Automated Tests
1. **Financial Calculation Unit Tests:**
   - Run `mvn test` in the backend to verify safe-to-spend edge cases (zero remaining days, negative balance, irregular income, zero budgets).
2. **Backend API Integration Tests:**
   - User registration $\rightarrow$ login $\rightarrow$ JWT authorization checks $\rightarrow$ transaction CRUD.
3. **Frontend Build Validation:**
   - Run `npm run build` in `frontend/` to confirm clean compilation and zero TypeScript/lint issues.

### Manual Verification
1. **Onboarding Flow:** Register a test student account $\rightarrow$ input monthly pocket money (₹8,000) $\rightarrow$ verify initial budget setup.
2. **Safe-to-Spend Verification:** Add expenses and recurring subscriptions $\rightarrow$ confirm the hero card recalculates daily safe-to-spend accurately.
3. **"Can I Afford It?" Simulator:** Simulate buying a ₹2,500 gadget $\rightarrow$ verify post-purchase safe-to-spend and goal delay updates.
4. **Natural Language Expense Parsing:** Submit a query like *"Spent 200 on chai and samosa with friends via UPI"* $\rightarrow$ verify accurate extraction and confirmation modal.
5. **Responsive Layout Testing:** Verify usability on both desktop resolution and mobile viewport.
