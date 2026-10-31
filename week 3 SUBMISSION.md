High-Level Architecture & Cloud Topology Documentation

WhatsAssist: WhatsApp AI Customer Resolution Agent for Local Businesses

Document Version: 1.0  
Phase: Week 3 Architecture & Design Deliverable

---

1. 3-Tier Architecture & Cloud Topology

WhatsAssist follows a decoupled, cloud-native 3-Tier Architecture optimized for low-latency messaging, web dashboard interaction, and vector-based AI retrieval.

```
+-----------------------------------------------------------------------------------+
|                                 1. CLIENT TIER                                    |
|                                                                                   |
|   +-----------------------+                         +-------------------------+   |
|   | WhatsApp Mobile App   |                         | Business Admin Portal   |   |
|   | (End Consumer)        |                         | (React / Next.js Web)   |   |
|   +-----------+-----------+                         +------------+------------+   |
+---------------+--------------------------------------------------+----------------+
                | (WhatsApp Cloud API Webhook)                     | (HTTPS / REST / WS)
                v                                                  v
+-----------------------------------------------------------------------------------+
|                              2. API / LOGIC TIER                                  |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   | API Gateway / Ingress Controller (Nginx / Cloudflare)                     |   |
|   +------------------------------------+--------------------------------------+   |
|                                        |                                          |
|                                        v                                          |
|   +---------------------------------------------------------------------------+   |
|   | Application Backend Services (Node.js Express / Python FastAPI)           |   |
|   |                                                                           |   |
|   |   +---------------------+   +---------------------+   +---------------+   |   |
|   |   | Webhook Handler     |   | RAG Orchestration   |   | Auth & Admin  |   |   |   |
|   |   | (Meta Verification) |   | (LangChain/Llama)   |   | Service       |   |   |
|   |   +---------------------+   +---------------------+   +---------------+   |   |
|   +------------------------------------+--------------------------------------+   |
+----------------------------------------|------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                                3. DATABASE TIER                                   |
|                                                                                   |
|   +--------------------------+  +--------------------------+  +-----------------+ |
|   | Relational DB            |  | Vector Database          |  | In-Memory Cache | |
|   | (PostgreSQL / Supabase)  |  | (Pinecone / Qdrant)      |  | (Redis)         | |
|   | User data, chat logs,    |  | Knowledge Base Embeddings|  | Session state,  | |
|   | lead records, business ID|  | for RAG search           |  | rate limiting   | |
|   +--------------------------+  +--------------------------+  +-----------------+ |
+-----------------------------------------------------------------------------------+
```

Infrastructure Layer Breakdown

1. Client Tier: 
   - WhatsApp UI: Consumer interface for incoming/outgoing messages processed through Meta Cloud API.
   - Merchant Portal: Modern web interface built with React.js/Next.js for business managers to configure knowledge bases, monitor live chats, and handle escalations.

2. API / Application Server Tier: 
   - API Gateway: Manages incoming webhooks, TLS termination, CORS, and API rate limiting.
   - Node.js / Express or Python FastAPI Backend: Stateless service handling authentication, webhook payloads, prompt construction, LLM calls, and real-time dashboard events via WebSockets.
   - RAG Orchestrator: Processes PDF/Text knowledge base uploads, generates vector embeddings, and executes semantic retrieval pipeline.

3. Database Tier: 
   - PostgreSQL: Stores transactional data (users, business accounts, chat logs, lead details, appointments).
   - Vector DB (Pinecone / Qdrant / Pgvector): Stores document chunks and high-dimensional embeddings for similarity search.
   - Redis Cache: Handles active chat session states, human agent handoff locks, and API rate limiting.

---

2. System Boundaries

Defining explicit boundaries ensures system security, operational clarity, and clear integration points.

```
                           +----------------------------------+
                           |    OUTSIDE SYSTEM BOUNDARY       |
                           |  - Meta Cloud API Platform       |
                           |  - OpenAI / LLM Provider API     |
                           |  - End-User Phone Device         |
                           +----------------+-----------------+
                                            | (HTTPS External APIs)
============================================|============================================
                                            v
                           +----------------------------------+
                           |     INSIDE SYSTEM BOUNDARY       |
                           |  - WhatsAssist API Server        |
                           |  - RAG Retrieval Pipeline        |
                           |  - PostgreSQL Database           |
                           |  - Vector DB Instance            |
                           |  - Merchant Dashboard Web App    |
                           +----------------------------------+
```

- Inside System Boundary (Managed by WhatsAssist): 
  - Core API server logic, Webhook ingestion, and RAG execution pipeline.
  - Merchant database schemas (PostgreSQL) and Vector embeddings database.
  - Merchant Admin React Dashboard application.
  - Escalation state machine and human handoff routing logic.

- Outside System Boundary (External Dependencies): 
  - Meta WhatsApp Cloud API Infrastructure: Delivery and delivery receipts of WhatsApp messages.
  - Third-Party LLM Infrastructure (OpenAI / Anthropic): Execution of text generation prompts based on provided context.
  - Customer Mobile Devices: Local storage and display of WhatsApp messages.

---

3. Data Flow Diagrams (DFD)

3.1 DFD Level 0 (Context Diagram)

The Level 0 DFD illustrates external entities interacting with the WhatsAssist system boundary.

```
+--------------------+                     +--------------------------+
|                    | --(1) Sends Msg---> |                          |
| Customer (WhatsApp)|                     |                          |
|                    | <--(6) AI Reply---- |                          |
+--------------------+                     |                          |
                                           |                          |
+--------------------+ --(2) Manage KB---> |       WhatsAssist        |
| Business Owner /   | <--(5) Live Chat--- |          System          |
| Support Agent      | --(4) Manual Reply->|                          |
+--------------------+                     |                          |
                                           |                          |
+--------------------+                     |                          |
| External LLM API   | <--(3a) Prompt Context|                        |
| (OpenAI / Meta)    | --(3b) Response---> |                          |
+--------------------+                     +--------------------------+
```

3.2 DFD Level 1 (Detailed Data Flow Diagram)

The Level 1 DFD decomposes the system into core sub-processes, databases, and message flows.

```
+----------+      1. Incoming Msg      +-----------------------+
| Customer | ------------------------> | 1.0 Webhook Receiver  |
+----------+                           +-----------+-----------+
                                                   |
                                                   v 2. Raw Payload
                                       +-----------------------+
                                       | 2.0 Message & Session | <=====> [ D1: Chat History & Sessions ]
                                       |     Manager           |
                                       +-----------+-----------+
                                                   |
                                                   v 3. Query Text
                                       +-----------------------+
                                       | 3.0 RAG Retrieval     | <=====> [ D2: Vector Database ]
                                       |     Engine            |
                                       +-----------+-----------+
                                                   |
                                                   v 4. Context + Query
                                       +-----------------------+
                                       | 4.0 Response          | <-----> [ External LLM API ]
                                       |     Generator         |
                                       +-----------+-----------+
                                                   |
                                  +----------------+----------------+
                                  | 5a. Normal Reply                | 5b. Escalation Triggered
                                  v                                 v
                      +-----------------------+         +-----------------------+
                      | 5.0 WhatsApp Delivery |         | 6.0 Human Handoff     | <=====> [ D3: Merchant Leads & ]
                      |     Service           |         |     Notification      |         [     Escalation Logs  ]
                      +-----------+-----------+         +-----------+-----------+
                                  |                                 |
                                  v Message                         v Push Alert
                             +----------+                    +--------------+
                             | Customer |                    | Admin Portal |
                             +----------+                    +--------------+
```

---

4. Cloud Infrastructure Stack Justification

| Layer / Subsystem | Chosen Technology Stack | Alternative Evaluated | Justification for Selection |
| :--- | :--- | :--- | :--- |
| Backend API Server | Node.js (Express) / Python (FastAPI) | Java Spring Boot | Excellent asynchronous I/O capabilities for high-throughput messaging webhooks; native JSON handling and vast ecosystem for API integrations. |
| Relational Database | PostgreSQL (Supabase / Managed RDS) | MongoDB | Structured relationships between merchants, customers, appointments, and leads require strict transactional integrity (ACID compliance) and relational constraints. |
| Vector Database | Pinecone / Pgvector | ChromaDB (Local File) | Managed Pinecone or Pgvector provides production-grade vector search scalability, low query latency ($\le 250\text{ ms}$), and simplified multi-tenant index isolation. |
| Frontend Framework | React.js / Next.js | Angular / Vue | Server-side rendering support, rich UI component libraries (Tailwind UI / Shadcn), fast client navigation, and efficient WebSocket handling for real-time chat dashboard update. |
| Hosting & Cloud Platform | Render / Vercel / AWS EC2 | On-Premise Server | Managed cloud deployment offers zero-downtime automated deployments, auto-scaling capabilities, $99.5\%+$ SLA guarantees, and minimal infrastructure maintenance overhead for an SMB product. |

24-ST-027
   M.Ahmad Khan
   SET-A
   PTUT
   PTUT-PRJ-002