# WhatsAssist: WhatsApp AI Customer Resolution Agent for Local Businesses
## Mid-Term Evaluation Presentation Slide Deck (FYP-I)

**Institution:** Punjab Tianjin University of Technology (PTUT), Lahore  
**Department:** Department of Software Engineering Technology  
**Commercial Brand / Domain:** ZepTech Smart Electronics & E-Mobility Store  
**Student Name:** Muhammad Ahmad Khan  
**Roll Number:** 24-ST-027  
**Section:** SET-A  
**Project ID:** PTUT-PRJ-002  
**Supervisor:** Dr. Zaigham Mushtaq  
**Evaluation Gate:** Week 7 (Midterm Milestone Gate)  

---

### Slide 1: Project Identity & Title
* **Project Name:** WhatsAssist
* **Full Title:** WhatsApp AI Customer Resolution Agent for Local Businesses
* **Domain:** Generative AI, Retrieval-Augmented Generation (RAG), Full-Stack Systems, E-Commerce & IoT Mobility
* **Presenter:** Muhammad Ahmad Khan (24-ST-027, SET-A)
* **Supervisor:** Dr. Zaigham Mushtaq (PTUT Lahore)

---

### Slide 2: Problem Statement & Local Friction
* **The Problem:** Local electronics & e-mobility retailers rely heavily on WhatsApp but lose prospective buyers of high-value items (Inverter ACs, E-Bikes, Ovens) due to delayed off-hour responses.
* **Economic Infeasibility:** Small businesses cannot hire 24/7 dedicated support staff.
* **Limitations of Legacy Bots:** Rigid automated menus ("Press 1 for Sales") fail to parse conversational Roman Urdu or answer technical specifications.
* **Lack of Integration:** Inquiries on WhatsApp rarely sync with store inventory or workshop repair benches.

---

### Slide 3: Proposed Solution
* **WhatsAssist Solution:** An AI-powered WhatsApp Customer Support & E-Commerce Agent backed by store product catalogs and diagnostic manuals.
* **24/7 Contextual Answering:** Uses Google Gemini 3.5 Flash and RAG to explain battery specs, energy savings, inverter tech, and prices accurately.
* **1-Click Direct Ordering:** Instant checkout modal and conversational WhatsApp ordering that decrements live stock and syncs with the owner dashboard.
* **4-Stage Hardware Repair Tracking:** Real-time lookup of repair tokens (`REP-101`) with technician notes and repair estimates.
* **Intelligent Human Escalation:** Automatically transfers sensitive complaints to the store owner via a 1-click takeover switch.

---

### Slide 4: System Architecture
* **3-Tier Cloud-Native Architecture:**
  * **Presentation Tier:** Dual-role React 18 Single-Page Application (Customer Storefront + Store Owner Workstation, Vite, Tailwind CSS, Dark/Light modes).
  * **Application Tier:** Node.js Express REST API server with JWT RBAC, input sanitization, and category-first product matching.
  * **Database & Vector Tier:** Persistent JSON Document Store / PostgreSQL relational store with atomic operations and zero-cost cloud footprint.

---

### Slide 5: Database Modeling & Multi-Tenancy
* **Core Normalized Entities:**
  * `merchants`, `customers`, `products`, `orders`, `repairs`, `conversation_sessions`, `messages`, `leads`.
* **Multi-Tenant Protection:** Enforced at database query level using `merchant_id` foreign keys and JWT payload claims.
* **Dual-Role RBAC:** Strict segregation between Customer accounts (`role: 'customer'`) and Store Owner accounts (`role: 'merchant'`).

---

### Slide 6: Core Domain Calculation Engines
* **Category-First Disambiguation Engine:** Distinguishes between similarly branded items across categories (e.g. Haier 1.5T AC vs Haier Microwave Oven) before fuzzy matching.
* **Confidence Fallback Engine:** Cosine similarity calculation evaluated against sensitivity threshold ($\tau = 0.65$).
* **Sentiment & Lexical Escalation Engine:** Multi-lingual lexical analysis in English, Urdu, and Roman Urdu scoring messages between $-1.0$ and $+1.0$.
* **Keyword Escalation Trigger:** Immediate detection of dispute words like *"manager"*, *"owner"*, *"kharab"*, *"shikayat"*.
* **Live Google Gemini 3.5 Flash Engine:** Sub-5-second conversational response generation in natural Roman Urdu and English.

---

### Slide 7: Live Prototype Demonstration (Evaluation Gate)
* **Demo Scenario 1 (Product Inquiry):** Customer asks: *"Falcon Pro e-bike ki battery timing aur speed kya hy?"* $\to$ Gemini responds with 72V 30Ah Lithium specs, 80 km/h speed, and 95 km range in Roman Urdu.
* **Demo Scenario 2 (1-Click Order Sync):** Customer places order for Haier 1.5 Ton AC $\to$ Stock automatically decrements, order `ZP-ORD-1004` appears instantly on Store Owner workstation.
* **Demo Scenario 3 (Repair Token Stepper):** Customer checks `REP-101` $\to$ System displays 4-stage stepper showing `READY_FOR_PICKUP` and technician notes.
* **Demo Scenario 4 (Grievance & Takeover):** Customer reports a damaged unit $\to$ Session automatically switches to `NEEDS_HUMAN`, alerting store manager with instant manual takeover toggle.

---

### Slide 8: Verification, Test Metrics & Conclusion
* **Automated Unit & Domain Tests:** 11 / 11 test assertions passing (100% success rate).
* **Response Latency:** Gemini 3.5 Flash delivers contextual replies in ~4.48s.
* **Synchronization Speed:** Storefront orders reflect on the owner dashboard within 120 ms.
* **Conclusion:** WhatsAssist successfully demonstrates that local businesses can operate an intelligent, multi-channel customer resolution agent and e-commerce hub at zero operational infrastructure cost.

---
**24-ST-027 | Muhammad Ahmad Khan | SET-A | PTUT Lahore**  
**Supervisor: Dr. Zaigham Mushtaq | PTUT-PRJ-002**
