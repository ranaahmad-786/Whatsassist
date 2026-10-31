WhatsAssist 💬
WhatsApp AI Customer Resolution Agent & Merchant Workstation
PTUT Final Year Project (FYP-I) | Department of Software Engineering Technology  
Punjab Tianjin University of Technology (PTUT), Lahore  

Author: Muhammad Ahmad Khan (Roll No: 24-ST-027 | Section: SET-A)  
Supervisor: Dr. Zaigham Mushtaq  
Domain Brand: ZepTech Smart Electronics & E-Mobility Store (Shop #14, Main Market, Gulberg III, Lahore)  

---

🌟 Overview

WhatsAssist is a full-stack, enterprise-grade conversational AI platform and merchant workstation engineered specifically for consumer electronics and lifestyle appliance retailers. It allows local businesses to connect their real WhatsApp account via a simple QR code scan (or Meta WhatsApp Cloud API) to deliver 24/7 autonomous customer resolution, technical diagnostics, instant product inquiries, repair token tracking, and conversational Cash on Delivery (COD) order placement.

The platform is powered by a dual-layer artificial intelligence architecture:
1. Live Google Gemini Flash Engine (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`) with dynamic Retrieval-Augmented Generation (RAG).
2. Autonomous Offline Intelligent Natural Language Engine with deep bilingual comprehension (Roman Urdu, Urdu, and English), ensuring zero downtime and 100% conversational availability even during API rate limits or offline testing.

---

🚀 Key Features

1. 📱 Real WhatsApp Multi-Device Connectivity (Baileys Web Protocol)
- Zero Meta Business Verification Friction: Merchants can link any smartphone WhatsApp account within 5 seconds by scanning the dynamic QR code in the workstation or entering an 8-digit Pairing Code.
- Bi-Directional Messaging: Real-time event handling (`messages.upsert`) ingests customer inquiries and automatically dispatches AI-grounded responses to the customer's WhatsApp.
- Hybrid Redundancy: Seamlessly supports both the Baileys multi-device socket and Meta's official WhatsApp Cloud API.

2. 🧠 Full AI Chatbot Orchestration Engine (`geminiService.js`)
- Native Bilingual Fluency: Automatically detects customer language and responds in natural, respectful Roman Urdu / Urdu or English.
- Guided Technical Troubleshooting: Step-by-step diagnostic workflows for:
  - DC Inverter ACs: Indoor filter cleaning, 24°C COOL mode verification, capacitor/compressor tripping, and refrigerant gas leaks.
  - Convection & Microwave Ovens: High-voltage diode/magnetron diagnosis, high-voltage fuse failure, and mica waveguide spark prevention.
  - Smart E-Bikes: 60V Lithium battery performance, range optimization (70–80 km), 220V fast charging, and petrol cost-saving analysis (saves Rs. 18,000+/month).
  - Refrigerators & Freezers: Temperature control, evaporator fan airflow, and frost drain issues.

3. 🛍️ Conversational WhatsApp Checkout & Instant Invoicing
- Customers can place orders simply by texting (e.g., "Order Gree 1.5 Ton AC, my name is Hamza, deliver to House 12, Phase 5 DHA Lahore").
- The AI extracts customer name, contact phone, and delivery address, writes to the `orders` table, decrements inventory stock, and delivers a digital Cash on Delivery (COD) confirmation with Order Code `ZP-ORD-xxxx`.

4. 🔧 4-Stage Hardware Repair & Warranty Stepper
- Customers can track ongoing repair jobs using token numbers (e.g., `REP-101`).
- The bot displays the active progress stepper:
  `1/4 Received at Center` ➔ `2/4 Under Bench Diagnosis` ➔ `3/4 Component Replacement in Progress` ➔ `4/4 Ready for Pickup / Delivery`
- Includes technician labor notes, estimated bill, and official 30-day service warranty status.

5. 🛡️ Merchant Live Workstation & Human Takeover
- Dual-Role Architecture: Clean storefront shopping experience for customers vs. full administration workstation for store owners.
- Instant Human Takeover: The merchant can pause AI automation for any customer thread with one click to respond manually from the desktop dashboard.
- Interactive Simulator: Built-in in-browser WhatsApp simulator to test customer interactions, product cards, order badges, and repair steppers.

---

🏗️ System Architecture

```
+───────────────────────────────────────────────────────────────────────────────────────────+
|                             WHATSASSIST DUAL-ENGINE ARCHITECTURE                          |
|                                                                                           |
|  [WhatsApp Mobile Consumer]                     [Merchant Admin / Workstation Browser]    |
|             │                                                      │                      |
|             ├───────────────┬──────────────────────┐               │ (React 18 / Tailwind)|
|             ▼ (Web Protocol)▼ (Cloud Webhook)      ▼ (Interactive) ▼                      |
|      +──────────────+ +──────────────+     +──────────────────────────────+               |
|      |Baileys Multi-| | Meta Cloud   |     | In-Browser WhatsApp Simulator|               |
|      |Device Socket | | API Gateway  |     | & Live Takeover Workstation  |               |
|      +──────┬───────+ +──────┬───────+     +──────────────┬───────────────+               |
|             └────────────────┼────────────────────────────┘                               |
|                              ▼                                                            |
|  +─────────────────────────────────────────────────────────────────────────────────────+  |
|  |                             APPLICATION LOGIC TIER                                  |  |
|  |                                                                                     |  |
|  |   [Express Server & Route Dispatcher]                                               |  |
|  |     ├── Baileys Service (QR Link, Pairing Code, Multi-Device Auto-Responder)        |  |
|  |     ├── Webhook Controller (Meta Cloud API Challenge Handshake & Verification)      |  |
|  |     ├── Chat Controller (Session State Transitions, Human Takeover & Live Chat)     |  |
|  |     ├── Product & Catalog Controller (CRUD, Stock Depletion & Categorization)       |  |
|  |     ├── Order Controller (ZP-ORD-xxxx Generation, Invoicing & CRM Leads)            |  |
|  |     ├── Repair Controller (REP-xxx 4-Stage Workbench Diagnostic Stepper)            |  |
|  |     ├── Knowledge Controller (Document Ingestion, Semantic Chunking & Retrieval)     |  |
|  |     └── Auth Controller (Dual-Role: Customer vs Store Owner with bcrypt + JWT)     |  |
|  |                                                                                     |  |
|  |   [Intelligent AI Orchestrator Core - geminiService.js]                             |  |
|  |     ├── Google Gemini Flash LLM Service (gemini-2.5-flash / gemini-2.0 / gemini-1.5) |  |
|  |     ├── Autonomous Offline NLP Intelligence Engine (Urdu / Roman Urdu / English)   |  |
|  |     ├── Guided Electronics Technical Diagnostics (AC / Microwave / E-Bike / Fridge) |  |
|  |     ├── Dynamic Conversational Order & Cash on Delivery (COD) Checkout Manager      |  |
|  |     ├── RAG Retrieval Engine (Semantic Token Similarity & Inverted Scoring)         |  |
|  |     └── Automated Repair Token State Stepper & Hardware Warranty Verification       |  |
|  +─────────────────────────────────────────────────────────────────────────────────────+  |
|             │                                                                             |
|             ▼ (Synchronous ACID Relational File Store - SQLite / JSON Relational Engine)  |
|  +─────────────────────────────────────────────────────────────────────────────────────+  |
|  |                             PERSISTENT DATA TIER                                    |  |
|  |   Tables: merchants | whatsapp_configs | customers | conversation_sessions          |  |
|  |           messages | products | orders | repairs | knowledge_documents                |  |
|  |           document_chunks | leads                                                   |  |
|  +─────────────────────────────────────────────────────────────────────────────────────+  |
+───────────────────────────────────────────────────────────────────────────────────────────+
```

---

⚡ Quick Start (1-Click Run)

Method 1: Instant 1-Click Launch (Recommended)
Simply double-click:
```bash
START_PROJECT.bat
```
(Or `Launch WhatsAssist.bat`)

This script automatically clears ports 5000 and 5173, starts the Express backend server, compiles the Vite/React frontend, and opens the workstation at `http://localhost:5173` in your browser.

---

Method 2: Manual Terminal Startup

1. Backend Server
```bash
cd backend
npm install
npm start
Backend running at http://localhost:5000
```

2. Frontend Workstation
```bash
cd frontend
npm install
npm run dev
Frontend running at http://localhost:5173
```

---

🧪 Automated Verification & Testing

WhatsAssist includes an automated test harness covering all domain entities, encryption, RAG similarity, and state transitions:

```bash
cd backend
npm test
```

Test Harness Output:
```
🧪 [TEST SUITE] Starting WhatsAssist Automated Unit & Integration Tests...
  ✅ [PASS] DB Store initialized and contains 11 core entity tables
  ✅ [PASS] Bcrypt password hashing computes valid salt-stretched hash
  ✅ [PASS] Store Owner model persists multi-tenant record
  ✅ [PASS] Owner auto-provisions WhatsApp config row
  ✅ [PASS] Customer account creates record with role="customer"
  ✅ [PASS] RAG service splits text into indexed chunks
  ✅ [PASS] RAG search retrieves context with non-zero similarity score
  ✅ [PASS] RAG score is 0 on unrelated query
  ✅ [PASS] Product model persists E-Bike / Household inventory item
  ✅ [PASS] Order model creates order record with ZP-ORD identifier
  ✅ [PASS] Repair model provisions token REP-xxxx with 4-stage tracking

📊 [TEST SUMMARY] Total: 11 | Passed: 11 | Failed: 0 (100% SUCCESS)
```

---

📁 Repository Structure

```
WhatsAssist/
├── backend/
│   ├── data/
│   │   ├── whatsassist_db.json      # ACID Relational Store
│   │   └── baileys_auth/            # Stored WhatsApp Web Session Credentials
│   ├── src/
│   │   ├── config/database.js       # Relational Schema & Seeder
│   │   ├── controllers/             # Express Route Handlers (Auth, Chat, Orders, Repairs, RAG)
│   │   ├── services/
│   │   │   ├── baileysService.js    # Baileys WhatsApp Multi-Device Socket Manager
│   │   │   ├── geminiService.js     # Full AI Conversational Orchestrator Engine
│   │   │   ├── ragService.js        # RAG Semantic Retrieval Engine
│   │   │   └── whatsappService.js   # Unified Dispatch Router
│   │   └── server.js                # Express Application Entry
│   ├── tests/run-tests.js           # 11 Automated Integration Tests
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/              # Sidebar, PageLayout, WhatsAppConnectModal
│   │   ├── pages/                   # Dashboard, LiveChats, Products, Orders, Leads, Settings
│   │   ├── services/api.js          # Enterprise Axios Client
│   │   └── App.jsx
│   └── package.json
│
├── WEEK_1_SUBMISSION.md ... WEEK_13_SUBMISSION.md  # Comprehensive FYP Weekly Reports
├── MIDTERM_PRESENTATION_SLIDES.md                  # Midterm Viva Defense Deck
├── START_PROJECT.bat                               # 1-Click Launch Script
└── README.md
```

---

🎓 Academic Credentials

- Institution: Punjab Tianjin University of Technology (PTUT), Lahore  
- Department: Department of Software Engineering Technology  
- Degree: Bachelor of Science in Software Engineering Technology (BS-SET)  
- Project Title: WhatsAssist – WhatsApp AI Customer Resolution Agent for Local Businesses  
- Student Name: Muhammad Ahmad Khan  
- Roll Number: 24-ST-027 (SET-A)  
- Supervisor: Dr. Zaigham Mushtaq  
- Academic Year: 2026–2027  
