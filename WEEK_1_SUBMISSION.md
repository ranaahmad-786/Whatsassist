# PTUT Final Year Project (FYP-I) Deliverable
## Week 1: Problem Discovery & User Personas Documentation

**Project Title:** WhatsAssist – WhatsApp AI Customer Resolution Agent for Local Businesses  
**Commercial Brand / Domain:** ZepTech Smart Electronics & E-Mobility Store  
**Project ID:** PTUT-PRJ-002  
**Student Name:** Muhammad Ahmad Khan  
**Roll Number:** 24-ST-027  
**Degree & Section:** BS Software Engineering Technology (SET-A)  
**Department:** Department of Software Engineering Technology  
**Institution:** Punjab Tianjin University of Technology (PTUT), Lahore  
**Supervisor:** Dr. Zaigham Mushtaq  
**Submission Week:** Week 1  

---

### 1. Problem Discovery & Operational Friction Identification

Local small and medium-sized enterprises (SMBs) in the retail consumer electronics and e-mobility sectors heavily rely on messaging platforms like WhatsApp to communicate with prospective buyers. However, managing manual customer support at scale leads to severe operational friction:

* **Delayed Responses & Lost High-Value Sales:** High-ticket appliance inquiries (e.g. Inverter ACs, E-Bikes, Baking Ovens) received after shop hours or during peak traffic are delayed, causing high customer drop-off to competitors.
* **Repetitive Technical & Stock Queries:** Up to 70% of inbound customer questions involve repetitive inquiries regarding product prices, battery charging times, energy-saving star ratings, and repair turnaround times.
* **High Operational Overhead:** Hiring dedicated 24/7 technical support representatives is financially infeasible for local electronics stores.
* **Fragmented Order & Repair Tracking:** Conversations fragmented across personal mobile devices result in lost delivery addresses, unrecorded orders, and disputed repair statuses.

---

### 2. User Personas

#### Persona 1: Local Electronics Store Owner / Manager
* **Name:** Muhammad Ahmad Khan
* **Role:** Store Owner, "ZepTech Smart Electronics & E-Mobility Store" (Retail, E-Bikes & Household Appliances Repair Hub, Gulberg III, Lahore)
* **Demographics:** Age 35 | Tech-savvy, manages store operations via smartphone and laptop
* **Goals:**
  * Provide instant 24/7 AI-guided responses to customer inquiries on WhatsApp.
  * Reduce operational burden and salary expenses for support staff.
  * Capture customer orders and repair tokens automatically, even after closing hours.
* **Pain Points:**
  * Loses potential customers at night due to delayed WhatsApp replies.
  * Manually answers repetitive questions regarding AC power consumption, oven capacities, and e-bike ranges.
  * Lacks a centralized workstation to monitor customer orders, inventory stock, and repair progress.

#### Persona 2: Local Consumer / End Shopper
* **Name:** Ayesha Khan / Ali Khan
* **Role:** End Consumer & Urban Commuter
* **Demographics:** Age 26–32 | Daily WhatsApp User | Values prompt digital service
* **Goals:**
  * Receive instant, accurate answers regarding appliance specs, energy ratings, and e-bike battery longevity in Roman Urdu / English.
  * Easily place 1-click orders and check hardware repair status without making phone calls.
* **Pain Points:**
  * Waiting hours for basic pricing or stock confirmation on WhatsApp.
  * Dealing with rigid automated phone menus that cannot understand natural questions.

---

### 3. Problem Statement

Local retail electronics and e-mobility merchants face severe revenue loss and customer dissatisfaction due to their inability to provide immediate, 24/7 conversational support on WhatsApp. **WhatsAssist** solves this by engineering an intelligent, multi-tenant AI resolution agent powered by Google Gemini 3.5 Flash and RAG architecture, enabling autonomous product recommendations, instant 1-click checkouts, and 4-stage hardware repair tracking, with seamless human takeover capabilities.

---

### 4. Core MVP Features (Top 5)

1. **Context-Aware RAG Chatbot (Google Gemini 3.5 Flash):**
   * Delivers natural, grounded answers in Roman Urdu and English based on merchant product catalogs and appliance troubleshooting guides.
2. **Instant 1-Click Order Placement & Real-Time Sync:**
   * Automatically captures customer name, phone, and delivery address, creates order codes (`ZP-ORD-xxxx`), decrements inventory stock, and syncs immediately to the Store Owner workstation.
3. **4-Stage Hardware Repair Tracking:**
   * Automated diagnostic advice and real-time status lookup using token receipts (`REP-101`, `REP-102`).
4. **Autonomous Human Handoff & Takeover Switch:**
   * Detects customer grievances and instantly alerts the store owner with a 1-click takeover switch to pause AI auto-replies.
5. **Dual-Role Web Application (Customer vs Store Owner):**
   * Segregated portals for customer shopping/tracking and store owner inventory management, live chat monitoring, and fulfillment.

---
**24-ST-027 | Muhammad Ahmad Khan | SET-A | PTUT Lahore**  
**Supervisor: Dr. Zaigham Mushtaq | PTUT-PRJ-002**
