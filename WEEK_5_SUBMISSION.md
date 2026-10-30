# PTUT Final Year Project (FYP-I) Deliverable
## Week 5: Project Scaffolding & Core Authentication Layer

**Project Title:** WhatsAssist – WhatsApp AI Customer Resolution Agent for Local Businesses  
**Commercial Brand / Domain:** ZepTech Smart Electronics & E-Mobility Store  
**Project ID:** PTUT-PRJ-002  
**Student Name:** Muhammad Ahmad Khan  
**Roll Number:** 24-ST-027  
**Degree & Section:** BS Software Engineering Technology (SET-A)  
**Department:** Department of Software Engineering Technology  
**Institution:** Punjab Tianjin University of Technology (PTUT), Lahore  
**Supervisor:** Dr. Zaigham Mushtaq  
**Submission Week:** Week 5  

---

## 1. Git Repository Initialization & Branch Protection Strategy

### 1.1 Branching Strategy (GitFlow Aligned)
To ensure code stability and maintain traceability across project milestones, a structured branching model is implemented:
* **`main` (Production Branch):** Contains only thoroughly tested, deployable code. Direct pushes and force-pushes are strictly prohibited.
* **`develop` (Integration Branch):** Central staging branch where completed features are integrated before release tagging.
* **`feature/<feature-name>` (Feature Branches):** Isolated branches branched off `develop` for specific functional modules (e.g., `feature/dual-role-auth`, `feature/gemini-llm`, `feature/order-sync`).

```
  [main]      ----------------------------* (v1.0 Release)
                     ^
                     | (Pull Request Merge + Review)
  [develop]   ---*---*----------*---------*
                  \            /
  [feature]        *---*------* (feature/dual-role-auth)
```

### 1.2 Repository Exclusion Rules (`.gitignore`)
```gitignore
node_modules/
.env
.env.local
npm-debug.log*
dist/
coverage/
.DS_Store
```

---

## 2. Backend Directory Scaffolding & Architecture

The backend project has been structured under a clean **Layered MVC Architecture** in Node.js (ES Modules).

```
backend/
├── .env                      # Real environment variables (PORT, JWT_SECRET, GEMINI_API_KEY)
├── .env.example              # Template for environment configuration
├── package.json              # Dependencies and execution scripts
├── data/
│   └── whatsassist_db.json   # Persistent JSON multi-tenant database store
├── src/
│   ├── config/
│   │   └── db.js             # Database persistence wrapper & health check
│   ├── controllers/
│   │   ├── authController.js # Dual-role signup (Customer vs Merchant), login, profile
│   │   ├── chatController.js # WhatsApp message intake, takeover & live chat
│   │   ├── productController.js # Electronics & E-Bike inventory CRUD & filtering
│   │   ├── orderController.js   # 1-Click checkout & owner order synchronization
│   │   └── repairController.js  # 4-stage hardware diagnostics & token lookup
│   ├── middleware/
│   │   ├── authMiddleware.js # JWT verification and role extraction (customer / merchant)
│   │   └── validationMiddleware.js # Input sanitization and phone/E.164 validation
│   ├── routes/
│   │   ├── authRoutes.js     # Public and protected authentication endpoints
│   │   ├── chatRoutes.js     # WhatsApp inbox and message processing routes
│   │   ├── productRoutes.js  # Product catalog endpoints
│   │   ├── orderRoutes.js    # Customer orders & owner fulfillment endpoints
│   │   └── repairRoutes.js   # Hardware repair tracking endpoints
│   ├── services/
│   │   ├── escalationService.js # Sentiment & confidence calculation engine
│   │   ├── leadExtractionService.js # Order & customer inquiry parser
│   │   └── geminiService.js  # Live Google Gemini 3.5 Flash AI LLM integration
│   └── server.js             # Express application initialization and startup
└── tests/
    └── run-tests.js          # Automated domain and integration test runner (11/11 passing)
```

---

## 3. Database Persistence & Storage Strategy

The database persistence layer provides immediate atomic reads and writes with zero external database server dependency, ensuring reliable multi-tenancy and zero deployment friction:
* Automatically loads and commits to `data/whatsassist_db.json`.
* Seeded with ZepTech merchant identity (`1c8b9736-ad03-4251-bacf-1e1bff38fd00`), complete product catalog (E-Bikes, Ovens, ACs, Refrigerators, Smart TVs), active customer orders, and repair diagnostic tokens.
* Health check verification route is exposed at `GET /api/health` returning operational status and timestamp.

---

## 4. Dual-Role Authentication & Access Control (RBAC)

### 4.1 Role Separation: Customer vs Store Owner
The authentication layer implements strict Role-Based Access Control (RBAC) to differentiate between regular online shoppers and store administrators:

1. **Customer Account (`role: 'customer'`):**
   * Registered via `/api/auth/register` (default role).
   * Grants access to customer storefront, 1-click orders, personal order history, and appliance repair tracking.
   * Restricts access to store inventory modification, financial analytics, and live agent chat takeovers.

2. **Store Owner / Manager Account (`role: 'merchant'`):**
   * Configured for store administrative staff.
   * Grants complete administrative authority: inventory CRUD, price adjustments, real-time order fulfillment, live chat overrides, and customer grievance resolution.

### 4.2 Password Hashing & JWT Structure
* Plaintext passwords are salted and hashed using **`bcryptjs`** with **10 salt rounds**.
* Issues a signed JSON Web Token (JWT) containing user identifier and role:

```json
{
  "userId": "usr_c9f28a11-5717-4562-b3fc",
  "email": "customer@zeptech.pk",
  "role": "customer",
  "storeId": "1c8b9736-ad03-4251-bacf-1e1bff38fd00",
  "iat": 1730000000,
  "exp": 1730604800
}
```

---

## 5. Verification & Test Execution Results

### Test Case 1: Customer Account Creation (`POST /api/auth/register`)
```http
POST /api/auth/register HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "name": "Hamza Tariq",
  "email": "hamza@example.com",
  "password": "Password123#",
  "phone": "+923001234567"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "name": "Hamza Tariq",
    "email": "hamza@example.com",
    "role": "customer",
    "phone": "+923001234567"
  }
}
```

### Test Case 2: Store Owner Login (`POST /api/auth/login`)
```http
POST /api/auth/login HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "email": "ranaahmadkhan.112211@gmail.com",
  "password": "owner_password"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "name": "Muhammad Ahmad Khan",
    "email": "ranaahmadkhan.112211@gmail.com",
    "role": "merchant",
    "businessName": "ZepTech Smart Electronics & E-Mobility Store"
  }
}
```

---
**24-ST-027 | Muhammad Ahmad Khan | SET-A | PTUT Lahore**  
**Supervisor: Dr. Zaigham Mushtaq | PTUT-PRJ-002**
