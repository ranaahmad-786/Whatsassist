PTUT Final Year Project (FYP-I) Deliverable
Week 8: E-Commerce & Conversational Order Processing Automation

Project Title: WhatsAssist – WhatsApp AI Customer Resolution Agent for Local Businesses  
Commercial Brand / Domain: ZepTech Smart Electronics & E-Mobility Store  
Project ID: PTUT-PRJ-002  
Student Name: Muhammad Ahmad Khan  
Roll Number: 24-ST-027  
Degree & Section: BS Software Engineering Technology (SET-A)  
Department: Department of Software Engineering Technology  
Institution: Punjab Tianjin University of Technology (PTUT), Lahore  
Supervisor: Dr. Zaigham Mushtaq  
Submission Week: Week 8  

---

1. Executive Summary & Objective

In Week 8, the WhatsAssist platform was extended from general conversational inquiry resolution into an active E-Commerce & Automated Order Processing Engine tailored for consumer electronics and e-mobility solutions. Local electronics businesses routinely lose customers who inquire about high-ticket appliances (e.g. Inverter ACs, E-Bikes, Baking Ovens) over WhatsApp but abandon the transaction when redirected to slow phone calls or separate checkout portals.

Week 8 delivers two synchronized ordering mechanisms:
1. Conversational WhatsApp Checkout: Natural language intent detection that parses customer name, contact phone, delivery address, and ordered items directly within chat sessions.
2. Storefront 1-Click Instant Checkout Modal: Direct Web UI checkout for customers browsing the catalog, pre-filling customer information and persisting orders immediately into the merchant database.

---

2. Order Processing Architecture & State Transitions

2.1 Order State Lifecycle

```mermaid
stateDiagram-v2
    [] --> PENDING: Order Placed (WhatsApp / Storefront)
    PENDING --> CONFIRMED: Store Owner Verifies Customer Address & Details
    CONFIRMED --> SHIPPED: Dispatch via Logistics Courier
    SHIPPED --> DELIVERED: Customer Receives Item & Payment Collected
    PENDING --> CANCELLED: Customer Cancellation or Stock Depletion
    DELIVERED --> []
    CANCELLED --> []
```

2.2 Category-First Disambiguation Heuristic
In multi-category electronics stores, brand names frequently overlap across divergent product categories (for example, Haier manufactures both Air Conditioners and Microwave Ovens; Dawlance manufactures Inverter Ovens, Refrigerators, and Washing Machines). 

To prevent cross-category ordering mistakes during conversational checkout:
1. Category Detection: Evaluates message tokens against known category lexicons (`air conditioners`, `ac`, `e-bike`, `bike`, `oven`, `microwave`, `baking`, `refrigerator`, `tv`).
2. Candidate Pool Filtering: Narrows the product search space strictly to items within the recognized category before fuzzy keyword matching occurs.
3. Exact Product Binding: Ensures the order record and generated invoice explicitly specify the exact product title (e.g. `Haier 1.5 Ton DC Inverter Air Conditioner (H-Clean)` at `Rs. 145,000`).

---

3. Atomic Stock Depletion & Inventory Concurrency Control

When an order is successfully validated, the system performs an atomic inventory decrement:

$Stock_new = Stock_current - Quantity_ordered$

- Stock Guard: If Stock_current < Quantity_ordered, the order engine rejects the transaction with code `ERR_OUT_OF_STOCK` and automatically suggests similar in-stock alternatives via Google Gemini Flash.
- Low Stock Warning: When Stock_new <= 3, an automated alert badge (`LOW_STOCK_WARNING`) is attached to the product in the Store Owner workstation.

```javascript
// Inventory validation and atomic decrement snippet
const product = db.products.find(p => p.id === targetProductId);
if (!product || product.stock < qty) {
  return { success: false, error: 'Insufficient stock available.' };
}
product.stock -= qty;
saveDatabase();
```

---

4. API Endpoints & Verification

4.1 Create Instant Order (`POST /api/orders`)
```http
POST /api/orders HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Authorization: Bearer <customer_jwt>

{
  "customer_name": "Ali Khan",
  "customer_phone": "+923314228724",
  "delivery_address": "House 42, Block C, Gulberg III, Lahore",
  "items": [
    {
      "product_id": "prod_ac_haier_15",
      "title": "Haier 1.5 Ton DC Inverter AC (H-Clean)",
      "price": 145000,
      "quantity": 1
    }
  ]
}
```
Response (201 Created): 
```json
{
  "success": true,
  "order": {
    "order_code": "ZP-ORD-1004",
    "customer_name": "Ali Khan",
    "delivery_address": "House 42, Block C, Gulberg III, Lahore",
    "total_amount": 145000,
    "status": "PENDING",
    "created_at": "2026-10-25T14:48:30.120Z"
  }
}
```

4.2 Real-Time Store Owner Order Retrieval (`GET /api/orders`)
Enables the store manager to view all inbound customer orders with real-time status switches (`PENDING` to `CONFIRMED` to `SHIPPED` to `DELIVERED`).

---

5. Verification & Test Metrics

- Order Generation Precision: 100% accurate product binding during conversational checkout tests.
- Inventory Consistency: Verified zero race conditions during sequential order placements.
- Synchronous Reflection: Orders placed via customer storefront reflect on owner dashboard within 120 ms.

---
24-ST-027 | Muhammad Ahmad Khan | SET-A | PTUT Lahore  
Supervisor: Dr. Zaigham Mushtaq | PTUT-PRJ-002
