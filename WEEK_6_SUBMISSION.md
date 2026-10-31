PTUT Final Year Project (FYP-I) Deliverable
Week 6: Core Business Logic & End-to-End Vertical Slice

Project Title: WhatsAssist – WhatsApp AI Customer Resolution Agent for Local Businesses  
Commercial Brand / Domain: ZepTech Smart Electronics & E-Mobility Store  
Project ID: PTUT-PRJ-002  
Student Name: Muhammad Ahmad Khan  
Roll Number: 24-ST-027  
Degree & Section: BS Software Engineering Technology (SET-A)  
Department: Department of Software Engineering Technology  
Institution: Punjab Tianjin University of Technology (PTUT), Lahore  
Supervisor: Dr. Zaigham Mushtaq  
Submission Week: Week 6  

---

1. Primary Business Calculation & Domain Logic Engines

The core domain engines in WhatsAssist are responsible for making autonomous routing decisions on every inbound message: determining whether a query can be safely resolved by AI, matching customer intent to exact electronics/e-mobility inventory, executing automated checkouts, or escalating to the store owner.

1.1 Category-First Product Disambiguation & RAG Engine
To prevent ambiguous matching between products of different categories bearing similar brand names (e.g. distinguishing a "Haier 1.5 Ton DC Inverter AC" from a "Haier Smart Inverter Microwave Oven"), a category-first routing heuristic is enforced:

```javascript
// Candidate filtering prioritization by product category
const matchedCat = detectCategory(userMessage); // 'Air Conditioners', 'E-Bikes', 'Ovens & Kitchen', etc.
let candidatePool = matchedCat 
  ? db.products.filter(p => p.category.toLowerCase().includes(matchedCat.toLowerCase()))
  : db.products;

// Fuzzy specification match within candidate pool
const targetProduct = candidatePool.find(p => matchesKeywords(p, userMessage)) || candidatePool[0];
```

When customer queries are matched against business knowledge base specifications, text chunks are scored via Cosine Similarity:

$$\text{Similarity}(\mathbf{q}, \mathbf{d}) = \frac{\mathbf{q} \cdot \mathbf{d}}{\|\mathbf{q}\| \|\mathbf{d}\|}$$

- $\text{Similarity} \ge 0.65$: Autonomous resolution via Google Google Gemini Flash.
- $\text{Similarity} < 0.65$: Fallback escalation to store owner with immediate dashboard alert.

---

1.2 Rule-Based Sentiment & Escalation Detection Engine (`src/services/escalationService.js`)
Customer messages undergo multi-lingual lexical analysis supporting English, Urdu, and Roman Urdu:

```javascript
export const calculateSentimentScore = (text) => {
  const lower = text.toLowerCase();
  let score = 0.0;
  const negativeWords = ['kharab', 'ghalat', 'bekar', 'bad', 'worst', 'angry', 'scam', 'fraud', 'shikayat'];
  const positiveWords = ['good', 'great', 'shukriya', 'thanks', 'behtareen', 'satisfied'];

  negativeWords.forEach(w => { if (lower.includes(w)) score -= 0.3; });
  positiveWords.forEach(w => { if (lower.includes(w)) score += 0.25; });

  return Math.max(-1.0, Math.min(1.0, parseFloat(score.toFixed(2))));
};
```

---

1.3 Conversational Order Placement & Stock Depletion Engine
When an intent to order is detected (e.g., "mujhe Haier AC order krna hy mera naam Ali Khan hy"):
1. Name & Address Parsing: Dynamically extracts the customer's specified name and clean delivery address, stripping out bot directives.
2. Atomic Stock Decrement: Decrements available quantity in `products` inventory. If stock is zero, returns an out-of-stock notification and suggests alternatives.
3. Order Code Generation: Generates tamper-proof identifier (`ZP-ORD-xxxx`), records in `orders` database with timestamp, and creates a CRM lead record.
4. Owner Notification: Emits a real-time event to the merchant dashboard so store management sees the order instantly.

---

1.4 Hardware Diagnostics & Repair Token Resolution Engine
When a customer inquires about appliance or e-bike maintenance (e.g., "REP-101 status" or "oven heat nahi kar raha"):
1. Diagnostic Triage: Provides technical steps (e.g. checking high-voltage diode and magnetron for ovens; BMS cutoff for e-bikes).
2. Token Resolution: Queries the `repairs` database by token (`REP-xxx`) and returns the device model, diagnosis, estimated cost, and current status (`RECEIVED`, `IN_DIAGNOSIS`, `REPAIRING`, `READY_FOR_PICKUP`).

---

1.5 Live Google Gemini AI LLM Engine (`src/services/geminiService.js`)
Directly integrates Google Gemini Generative Language API using foundational model `gemini-3.5-flash` (with automated fallbacks to `gemini-3.5-flash-lite` and `gemini-3.8-flash`). The service injects ZepTech inventory specifications, technical appliance data, store location (Gulberg III, Lahore), and pricing into system prompts, generating helpful Roman Urdu and English responses in ~4.5 seconds.

---

2. Server-Side Input Validation & Security

All inbound requests pass through `validationMiddleware.js`:
- E.164 Phone Regex Validation: `/^\+-[1-9]\d{9,14}$/` guards against malformed phone numbers.
- SQL & JSON Injection Protection: Input sanitization prevents query injection attacks.
- Bcrypt Salt Hashing: Customer and merchant passwords are hashed using Bcrypt (10 rounds).

---

3. End-to-End Vertical Slice Validation

A complete vertical slice from customer input to database persistence and dashboard synchronization was validated:
1. Customer requests E-Bike Falcon Pro via WhatsApp interface.
2. Bot retrieves real-time pricing (`Rs. 185,000`), battery specs (`72V 30Ah Lithium`), and top speed (`80 km/h`).
3. Customer confirms order with name and address.
4. Stock decrements by 1; `ZP-ORD-1004` persists in database.
5. Store Owner dashboard displays the new order immediately with exact item name and total price.

---
24-ST-027 | Muhammad Ahmad Khan | SET-A | PTUT Lahore  
Supervisor: Dr. Zaigham Mushtaq | PTUT-PRJ-002
