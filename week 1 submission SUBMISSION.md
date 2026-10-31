# WhatsAssist: WhatsApp AI Customer Resolution Agent for Local Businesses

## FYP Documentation - Week 1: Problem Discovery & User Personas

### 1. Problem Discovery & Operational Friction Identification

Local small and medium-sized businesses (SMBs) in sectors such as retail, clinics, salons, and home services heavily rely on messaging platforms like WhatsApp to communicate with their customers. However, managing manual customer support at scale leads to significant operational friction:

- Delayed Responses & Lost Leads: Business owners and support staff cannot handle incoming messages 24/7. Delayed responses, especially during off-hours or peak operational times, lead to high customer drop-off rates and lost revenue opportunities.
- Repetitive Query Fatigue: Up to 70% of customer inquiries involve repetitive questions regarding business hours, location, pricing, menu/catalog, or basic booking instructions, diverting human staff from high-value tasks.
- High Operational Costs: Hiring dedicated full-time support agents is financially infeasible for small local businesses.
- Lack of Context & Tracking: Without a centralized system, customer interactions remain fragmented across different employee phones, leading to missed follow-ups and inconsistent service quality.

---

### 2. User Personas

### Persona 1: Local Business Owner / Support Manager

- Name: Tariq Mahmood
- Role: Owner, "ZepTech Smart Electronics & E-Mobility Store" (Smart Household Appliances & E-Mobility Retail Hub)
- Demographics: Age 42 | Tech-savvy enough to use WhatsApp & basic web apps
- Goals: 
  - Provide instant 24/7 responses to customer inquiries on WhatsApp.
  - Reduce operational burden and salary expenses for support staff.
  - Capture prospective leads automatically, even after operating hours.
- Pain Points: 
  - Loses potential customers at night or during busy shop hours due to delayed WhatsApp replies.
  - Manually answers the same basic questions (e.g., "What are your shop hours-", "Do you have this part in stock-") dozens of times daily.
  - No structured system to view analytics or track unresolved customer complaints.

### Persona 2: Local Consumer / Customer

- Name: Ayesha Khan
- Role: End Consumer
- Demographics: Age 28 | Daily WhatsApp User | Values convenience
- Goals: 
  - Get quick, accurate information and support via WhatsApp without downloading extra apps or making phone calls.
  - Easily check product availability, pricing, or schedule an appointment on demand.
- Pain Points: 
  - Waiting hours for a simple reply from a local shop's WhatsApp business number.
  - Dealing with rigid automated menu bots (e.g., "Press 1 for Sales, Press 2 for Support") that fail to understand specific questions.
  - Having to repeat details when routed to different human agents.

---

### 3. Problem Statement

Local small businesses face severe revenue loss and operational inefficiency due to their inability to provide immediate, 24/7 customer support on WhatsApp—the primary communication channel for their customers. Human staff are overwhelmed by repetitive queries, while rigid, rule-based chatbots fail to provide natural, contextual answers, leading to customer frustration and abandoned inquiries. WhatsAssist solves this by delivering an affordable, AI-driven WhatsApp customer resolution agent that uses custom business knowledge to automatically handle routine inquiries, collect leads, and schedule appointments, seamlessly escalating complex issues to human agents when needed.

---

### 4. Core MVP Features (Top 5)

1. Context-Aware RAG Chatbot (Knowledge Base Ingestion): 
   - Integrates Retrieval-Augmented Generation (RAG) to allow businesses to upload their custom knowledge base (PDFs, FAQs, product list, operating hours). The AI agent provides natural, contextually accurate answers to customer questions on WhatsApp.

2. Automated Lead Capture & Appointment/Order Processing: 
   - Interactive conversational flows to capture customer contact details, preferences, and service/product requests directly through WhatsApp messaging.

3. Human Handoff & Escalate System: 
   - Intelligent sentiment and complexity detection that automatically transfers complex, sensitive, or unresolved queries to a human support agent on an emergency admin alert dashboard.

4. Meta WhatsApp Business API Integration: 
   - Seamless multi-tenant messaging infrastructure using Meta's official WhatsApp Cloud API for reliable delivery, media support, and interactive button messages.

5. Merchant Admin Analytics & Chat Management Dashboard: 
   - A web-based portal for business owners to view live chat histories, manage knowledge base documents, review captured leads, and monitor AI resolution success rates.

   24-ST-027
   M.Ahmad Khan
   SET-A
   PTUT
   PTUT-PRJ-002