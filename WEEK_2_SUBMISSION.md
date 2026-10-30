# PTUT Final Year Project (FYP-I) Deliverable
## Week 2: Software Requirements Specification (SRS)

**Standard:** IEEE Std 830-1998 Aligned  
**Project Title:** WhatsAssist – WhatsApp AI Customer Resolution Agent for Local Businesses  
**Commercial Brand / Domain:** ZepTech Smart Electronics & E-Mobility Store  
**Project ID:** PTUT-PRJ-002  
**Student Name:** Muhammad Ahmad Khan  
**Roll Number:** 24-ST-027  
**Degree & Section:** BS Software Engineering Technology (SET-A)  
**Department:** Department of Software Engineering Technology  
**Institution:** Punjab Tianjin University of Technology (PTUT), Lahore  
**Supervisor:** Dr. Zaigham Mushtaq  
**Submission Week:** Week 2  

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for **WhatsAssist**, an AI-powered WhatsApp customer resolution platform tailored for local consumer electronics and e-mobility enterprises. It establishes the baseline for system architecture, development, testing, and graduation defense.

### 1.2 Scope
WhatsAssist automates customer inquiries via WhatsApp Cloud API using Retrieval-Augmented Generation (RAG) and Google Gemini 3.5 Flash. The system delivers automated product inquiries, 1-click order placement, 4-stage repair tracking, human handoff, and a dual-role web workstation.

### 1.3 Definitions, Acronyms, and Abbreviations
* **RAG:** Retrieval-Augmented Generation.
* **LLM:** Large Language Model (Google Gemini 3.5 Flash).
* **RBAC:** Role-Based Access Control (Customer vs Merchant).
* **SRS:** Software Requirements Specification.
* **NFR:** Non-Functional Requirement.

---

## 2. Overall Description

### 2.1 Product Perspective
WhatsAssist acts as an intelligent intermediary between customers on WhatsApp/Web Storefront, Meta's Cloud API, Google Gemini AI, and the Store Owner Admin Workstation.

```
+------------------+         +--------------------------+         +--------------------+
|  WhatsApp / Web  | <-----> | Meta API / Web Simulator | <-----> | WhatsAssist Backend|
+------------------+         +--------------------------+         +--------------------+
                                                                            |
                                                                            v
                                                                  +--------------------+
                                                                  | Gemini 3.5 + DB    |
                                                                  +--------------------+
```

### 2.2 User Classes & Roles
1. **Customer (`role: 'customer'`):** Browses electronics and e-bikes, submits 1-click orders, queries repair status (`REP-xxx`), and receives instant AI support in Roman Urdu / English.
2. **Store Owner / Manager (`role: 'merchant'`):** Manages inventory stock, oversees incoming orders, updates repair diagnostic notes, and manually overrides active WhatsApp chats.

---

## 3. Functional Requirements Matrix

| Req ID | Module | Description | Role |
| :---: | :--- | :--- | :---: |
| **FR-1** | AI Resolution | Autonomous response generation via Gemini 3.5 Flash based on ZepTech catalog. | Customer |
| **FR-2** | 1-Click Orders | Direct modal order checkout with customer name, phone, and delivery address. | Customer |
| **FR-3** | Stock Depletion | Immediate atomic decrement of product stock upon order confirmation. | System |
| **FR-4** | Order Sync | Real-time visibility of customer orders on the Store Owner dashboard. | Merchant |
| **FR-5** | Repair Tracking| Lookup of 4-stage repair status (`REP-101`) and technician diagnostic notes. | Customer |
| **FR-6** | Inventory CRUD | Add, edit, price-adjust, and delete electronics and e-bike inventory items. | Merchant |
| **FR-7** | Human Takeover | Pause AI auto-replies and allow store manager manual chat takeover. | Merchant |
| **FR-8** | Dual-Role RBAC | Token-based segregation between Customer and Store Owner access permissions. | System |

---

## 4. Quantifiable Non-Functional Requirements (NFRs)

### 4.1 Latency & Performance
* **NFR-1 (End-to-End Response Latency):** 95% of automated AI replies MUST be delivered within **$\le 5.0$ seconds** using Google Gemini 3.5 Flash.
* **NFR-2 (Order Synchronization Latency):** Orders submitted via storefront MUST reflect on the Store Owner workstation within **$\le 200\text{ ms}$**.
* **NFR-3 (Repair Token Lookup):** Status retrieval for repair tokens MUST execute within **$\le 100\text{ ms}$**.

### 4.2 Security & Data Privacy
* **NFR-4 (Password Protection):** All customer and merchant passwords MUST be salted and hashed via **Bcrypt** with at least 10 rounds.
* **NFR-5 (RBAC Authorization):** API routes modifying prices, stock, or order states MUST enforce `requireRole('merchant')` middleware.
* **NFR-6 (Input Sanitization):** All phone numbers MUST be validated against E.164 standard; text inputs sanitized against script injection.

---
**24-ST-027 | Muhammad Ahmad Khan | SET-A | PTUT Lahore**  
**Supervisor: Dr. Zaigham Mushtaq | PTUT-PRJ-002**
