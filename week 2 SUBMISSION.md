Software Requirements Specification (SRS)
WhatsAssist: WhatsApp AI Customer Resolution Agent for Local Businesses
Standard: IEEE Std 830-1998 Aligned  
Document Version: 1.0  

---

1. Introduction

1.1 Purpose
This document specifies the software requirements for WhatsAssist, an AI-powered WhatsApp customer resolution platform tailored for local businesses. It serves as the baseline for system architecture, development, testing, and project validation.

1.2 Scope
WhatsAssist automates customer service via WhatsApp Cloud API using Retrieval-Augmented Generation (RAG). The system provides automated query handling, lead capture, appointment booking, human handoff, and a web admin dashboard for business managers.

1.3 Definitions, Acronyms, and Abbreviations
- RAG: Retrieval-Augmented Generation.
- LLM: Large Language Model.
- SRS: Software Requirements Specification.
- NFR: Non-Functional Requirement.
- API: Application Programming Interface.

---

2. Overall Description

2.1 Product Perspective
WhatsAssist functions as an intermediary layer between end-user customers on WhatsApp, Meta's Cloud API, an AI LLM processing engine, and a web-based Merchant Dashboard.

```
+------------------+         +--------------------------+         +--------------------+
|  WhatsApp User   | <-----> | Meta WhatsApp Cloud API  | <-----> | WhatsAssist Backend|
+------------------+         +--------------------------+         +--------------------+
                                                                            |
                                                                            v
                                                                  +--------------------+
                                                                  |  LLM + Vector DB   |
                                                                  +--------------------+
```

2.2 User Classes and Characteristics
1. End-User / Customer: Interacts purely through WhatsApp messages. Requires simple, natural conversational interactions.
2. Business Owner / Support Agent (Admin): Manages knowledge base documents, views real-time conversations, takes over escalated chats, and monitors analytics via web UI.

---

3. System Use Case Diagram & Specifications

3.1 System Use Case Diagram (PlantUML / Mermaid Code)

```mermaid
graph TD
    %% Actors
    Customer((Customer / End User))
    Admin((Business Owner / Agent))
    System((WhatsAssist System / AI))

    %% Use Cases
    usecase UC1 as "UC-1: Ask Query / Receive AI Response"
    usecase UC2 as "UC-2: Capture Lead & Book Appointment"
    usecase UC3 as "UC-3: Trigger Human Escalation"
    usecase UC4 as "UC-4: Upload / Update Knowledge Base"
    usecase UC5 as "UC-5: Live Agent Chat Takeover"
    usecase UC6 as "UC-6: View Analytics & System Logs"

    %% Customer Interactions
    Customer --> UC1
    Customer --> UC2
    Customer --> UC3

    %% System Internal Logic
    UC1 -.->|Includes RAG Retrieval| System
    UC3 -.->|Sends Alert| Admin

    %% Admin Interactions
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
```

---

3.2 Formal Use Case Specifications

Use Case 1: Query Resolution via RAG
- Use Case ID: UC-1
- Use Case Name: Contextual AI Query Resolution
- Actors: Customer (Primary), WhatsAssist System (Secondary)
- Preconditions: WhatsApp Cloud API Webhook is configured and operational. Knowledge base vector embeddings exist.
- Postconditions: Customer receives an accurate, natural language reply based on business data.
- Main Success Scenario: 
  1. Customer sends a WhatsApp message to the business account.
  2. System receives webhook payload and generates semantic vector embeddings for the prompt.
  3. System retrieves top-k relevant context matches from the Vector Database.
  4. System prompts the LLM with user query + retrieved context.
  5. LLM generates a response within business constraints.
  6. System sends the reply back to the user via WhatsApp API.
- Alternative Flows: 
  - A1: Low Confidence / Out of Context Query: If similarity score is below threshold $\tau = 0.65$, system responds with a fallback message ("I'm not sure about that. Let me connect you with a team member.") and triggers UC-3.

---

Use Case 2: Human Handoff Escalation
- Use Case ID: UC-3
- Use Case Name: Trigger Human Escalation & Agent Takeover
- Actors: Customer, Business Owner / Agent, System
- Preconditions: Customer is in an active chat session; low AI confidence score or negative sentiment detected.
- Postconditions: AI automated responses are paused for the session; alert sent to Admin Dashboard.
- Main Success Scenario: 
  1. System detects user explicitly asking for a human OR sentiment score drops below threshold OR AI confidence $< 0.65$.
  2. System flags session status as `NEEDS_HUMAN`.
  3. System sends an immediate alert notification to the Merchant Admin Dashboard.
  4. System notifies customer on WhatsApp: "Connecting you with a live agent..."
  5. Human agent opens dashboard, reviews chat history, and takes over manually.

---

4. Quantifiable Non-Functional Requirements (NFRs)

4.1 Latency & Performance
- NFR-1 (End-to-End Latency): 95% of WhatsApp AI automated responses MUST be delivered back to the user within $\le 3.0$ seconds from message receipt.
- NFR-2 (RAG Vector Search Latency): Vector Similarity Search retrieval from Pinecone / ChromaDB MUST complete within $\le 250\text{ ms}$.
- NFR-3 (Dashboard Webhook Notification): Human handoff alert notifications MUST reflect on the Admin Dashboard within $\le 1.0$ second via WebSockets.

4.2 Availability & Reliability
- NFR-4 (System Uptime): The system backend and webhook listener MUST maintain 99.5% operational uptime excluding scheduled monthly maintenance windows.
- NFR-5 (Message Delivery Guarantee): Unhandled webhook exceptions MUST automatically retry with exponential backoff for up to 3 attempts to prevent dropped messages.

4.3 Security & Data Privacy
- NFR-6 (Encryption in Transit & Rest): All web communications MUST use TLS 1.3 HTTPS. Database customer details and phone numbers MUST be encrypted using AES-256.
- NFR-7 (API Key Confidentiality): OpenAI, Meta, and database API keys MUST be stored securely using environment variables and secret managers, never exposed on client apps.

4.4 Scalability
- NFR-8 (Concurrent Sessions): System backend architecture MUST support at least 100 concurrent incoming messaging sessions per business tenant without latency degrading beyond 5 seconds.

24-ST-027
   M.Ahmad Khan
   SET-A
   PTUT
   PTUT-PRJ-002