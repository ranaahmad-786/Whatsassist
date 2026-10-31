PTUT Final Year Project (FYP-I) Deliverable
Week 3: High-Level Architecture & Cloud Topology Documentation

Project Title: WhatsAssist – WhatsApp AI Customer Resolution Agent for Local Businesses  
Commercial Brand / Domain: ZepTech Smart Electronics & E-Mobility Store  
Project ID: PTUT-PRJ-002  
Student Name: Muhammad Ahmad Khan  
Roll Number: 24-ST-027  
Degree & Section: BS Software Engineering Technology (SET-A)  
Department: Department of Software Engineering Technology  
Institution: Punjab Tianjin University of Technology (PTUT), Lahore  
Supervisor: Dr. Zaigham Mushtaq  
Submission Week: Week 3  

---

1. 3-Tier Decoupled Architecture & Topology

WhatsAssist is architected as a cloud-native, decoupled 3-Tier System engineered for low-latency messaging, real-time inventory synchronization, and generative AI conversational resolution:

```
+-----------------------------------------------------------------------------------+
|                                 1. CLIENT TIER                                    |
|                                                                                   |
|   +-----------------------+                         +-------------------------+   |
|   | Customer Storefront   |                         | Store Owner Workstation |   |
|   | (React 18 / Vite Web) |                         | (React 18 / Tailwind)   |   |
|   +-----------+-----------+                         +------------+------------+   |
+---------------+--------------------------------------------------+----------------+
                |                                                  | 
                | (HTTPS REST / WebSockets)                        | (JWT Authenticated)
                v                                                  v
+-----------------------------------------------------------------------------------+
|                              2. API / LOGIC TIER                                  |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   | Node.js Express REST Application Server                                   |   |
|   |                                                                           |   |
|   |   +-------------------+  +-------------------+  +---------------------+   |   |
|   |   | Auth & RBAC Guard |  | Order Sync Engine |  | Repair Subsystem    |   |   |
|   |   | (Bcrypt + JWT)    |  | (Stock Decrement) |  | (Token Stepper)     |   |   |
|   |   +-------------------+  +-------------------+  +---------------------+   |   |
|   |   +-------------------------------------------------------------------+   |   |
|   |   | Gemini 3.5 Flash LLM Service + Prompt Engineering Pipeline         |   |   |
|   |   +-------------------------------------------------------------------+   |   |
|   +------------------------------------+--------------------------------------+   |
+----------------------------------------|------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                                3. DATABASE TIER                                   |
|                                                                                   |
|   +-------------------------------------+  +----------------------------------+   |
|   | Multi-Tenant Persistent Data Store  |  | RAG Document & Vector Ingestion  |   |
|   | (whatsassist_db.json / PostgreSQL)  |  | (Overlapping Text Chunks)        |   |
|   | Products, Orders, Repairs, Sessions |  | Catalog specs & diagnostic rules |   |
|   +-------------------------------------+  +----------------------------------+   |
+-----------------------------------------------------------------------------------+
```

---

2. Component Breakdown & Data Flow

2.1 Client Tier
- Customer Storefront Portal: Renders categorized inventory (E-Bikes, Inverter ACs, Ovens, Refrigerators), direct 1-click modal checkout, personal order tracker, and floating WhatsApp AI chat widget.
- Store Owner Workstation: Displays real-time executive analytics, incoming customer orders with fulfillment status toggles, stock controls with low-stock warnings, and live chat emergency takeover toggles.

2.2 Application / Logic Tier
- Node.js Express Server: Modular MVC architecture providing REST endpoints for authentication, product management, order processing, and repair lookups.
- Google Gemini AI Engine (`geminiService.js`): Ingests customer prompts, matches intent against ZepTech product specifications, generates bilingual responses (Roman Urdu & English), and handles conversational checkouts.
- Takeover Controller: Manages session state machine (`AI_ACTIVE` $\leftrightarrow$ `NEEDS_HUMAN`), pausing Gemini responses when store owner intervenes.

2.3 Database Tier
- Persistent Multi-Tenant Store: Atomic transactional integrity storing merchant credentials, user accounts, products catalog, orders with unique tracking codes, and repair tickets.

---

3. Technology Stack Justification

| Layer | Selected Technology | Engineering Justification |
| :--- | :--- | :--- |
| Frontend | React 18 + Vite + Tailwind CSS | Instant Hot Module Replacement (HMR), lightweight bundle size, high rendering performance for real-time order tables. |
| Backend | Node.js + Express (ES Modules) | High-concurrency event-driven I/O ideal for simulated WhatsApp webhook streams and concurrent customer sessions. |
| AI LLM | Google Google Gemini Flash | Active Google foundational model offering superior contextual reasoning, low response latency (~4.5s), and natural Roman Urdu comprehension. |
| Security | Bcrypt (10 rounds) + JWT | Industry-standard password hashing and stateless cryptographic token validation. |

---
24-ST-027 | Muhammad Ahmad Khan | SET-A | PTUT Lahore  
Supervisor: Dr. Zaigham Mushtaq | PTUT-PRJ-002
