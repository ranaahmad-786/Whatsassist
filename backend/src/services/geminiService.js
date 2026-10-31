/**
 * WhatsAssist - Intelligent AI Brain & Live Gemini LLM Engine
 * Dual-Mode Shop Assistant: General Small Talk + Dynamic Inventory & Context Injected RAG
 * Strict Anti-Hallucination Guardrails, Interactive Order Options, and Official Invoice Slips
 * for ZepTech Smart Electronics & E-Mobility Store.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 * @institution Punjab Tianjin University of Technology (PTUT), Lahore
 */

const { db } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

/**
 * Call live Google Gemini Generative AI API with fallback across official production flash models.
 */
async function callLiveGemini(systemPrompt, userQuery, timeoutMs = 7000) {
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('your_') || GEMINI_API_KEY.trim().length === 0) {
    return null;
  }

  for (const model of models) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userQuery }] }],
          generationConfig: {
            temperature: 0.65,
            maxOutputTokens: 900,
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      }
    } catch (err) {
      clearTimeout(timer);
    }
  }

  return null;
}

/**
 * Extract RAG knowledge from database for a merchant if not already supplied
 */
function getRagContext(merchantId, query) {
  try {
    const ragService = require('./ragService');
    const result = ragService.retrieveContext(merchantId, query);
    return result && result.context ? result.context : '';
  } catch (e) {
    return '';
  }
}

/**
 * Shop Core Metadata
 */
const SHOP_METADATA = {
  name: 'ZepTech Smart Electronics & E-Mobility Store',
  founder: 'Muhammad Ahmad Khan (24-ST-027), BS Software Engineering Technology, PTUT Lahore',
  location: 'Shop #14, Main Market, Gulberg III, Lahore, Pakistan',
  timings: 'Monday to Saturday: 10:00 AM - 10:00 PM | Sunday: 2:00 PM - 10:00 PM',
  contactPhone: '+92 300 1234567',
  deliveryPolicy: 'Free Cash on Delivery (COD) within 24-48 hours across Lahore. Safe courier shipping across Pakistan.',
  paymentMethods: 'Cash on Delivery (COD), JazzCash, EasyPaisa, Direct Bank Transfer (Meezan/HBL)',
  warranties: {
    ebike: '3-Year motor warranty & 1-Year lithium battery warranty',
    acAndFridge: '10-Year compressor warranty & 1-Year PCB circuit warranty',
    microwave: '2-Year magnetron heating warranty',
    repairs: '30-Day unconditional money-back service warranty'
  }
};

/**
 * Detect language: Roman Urdu / Urdu vs English
 */
function detectIsUrdu(query) {
  const urduKeywords = [
    'kya', 'hai', 'hy', 'hain', 'kaise', 'kese', 'theek', 'mera', 'meri', 'mere', 'chahiye',
    'kharidna', 'btao', 'batao', 'kitne', 'kitna', 'kitni', 'kahan', 'kab', 'khulta', 'band',
    'hota', 'hoti', 'hoga', 'hogi', 'ap', 'aap', 'mujhe', 'mujhy', 'hmary', 'humary', 'salam',
    'walaikum', 'bhai', 'shukriya', 'meharbani', 'bhejo', 'mangwana', 'discount', 'sasta',
    'chal', 'nahi', 'ni', 'kr', 'rha', 'rhi', 'dost', 'tum', 'kis', 'chez', 'cheez', 'kaam',
    'kam', 'wala', 'wali', 'walay', 'pe', 'py', 'se', 'sy', 'bhi', 'kro', 'karo', 'dekho',
    'bhaiya', 'janab', 'sir', 'konsa', 'konsi', 'achha', 'acha', 'bura', 'mil', 'sakta', 'sakti',
    'sunao', 'sunayein', 'haal', 'or', 'aur', 'jazakallah', 'jazakallahu', 'tarika', 'tareeqa',
    'bhejna', 'lena', 'daam', 'bhejo'
  ];
  const qLower = query.toLowerCase();
  return urduKeywords.some(w => new RegExp(`\\b${w}\\b`, 'i').test(qLower));
}

/**
 * Classify user intent into Dual Modes & Specialized Handlers:
 */
function classifyIntent(qLower) {
  // 1. Guardrail for non-inventory items
  const nonStoreItems = ['iphone', 'mobile phone', 'smartphone', 'laptop', 'macbook', 'clothing', 'kapre', 'shoes', 'solar panel', 'car ', 'jewelry'];
  if (nonStoreItems.some(item => qLower.includes(item))) {
    return 'MODE_GUARDRAIL_UNAVAILABLE';
  }

  // 2. Order Tracking
  if ((qLower.includes('track') || qLower.includes('status') || qLower.includes('kahan pohncha') || qLower.includes('mera parcel')) &&
      (qLower.match(/zp-ord-\d+/i) || qLower.includes('order'))) {
    return 'MODE_ORDER_TRACKING';
  }

  // 3. Repair Tracking
  if ((qLower.includes('repair') || qLower.includes('token') || qLower.includes('receipt') || qLower.includes('theek hua')) &&
      (qLower.match(/rep-\d+/i) || qLower.match(/\b\d{3,5}\b/))) {
    return 'MODE_REPAIR_TRACKING';
  }

  // 4. "How to Order" / Options inquiry
  const isHowToOrder = qLower.includes('order kaise') || qLower.includes('order kasy') ||
                       qLower.includes('order krny') || qLower.includes('order karne') ||
                       qLower.includes('how to order') || qLower.includes('order ka tarika') ||
                       qLower.includes('order option') || qLower.includes('order krna hy') ||
                       qLower.includes('order karna hai') || qLower.includes('order place kaise') ||
                       qLower.includes('mujhe kharidna hai') || qLower.includes('buy kaise');

  if (isHowToOrder && !qLower.includes('deliver to') && !qLower.includes('house') && !qLower.includes('street')) {
    return 'MODE_HOW_TO_ORDER';
  }

  // 5. Numbered Selection (e.g. user replies "1", "2", "Order 1", etc.)
  if (/^(?:order\s+|select\s+|option\s+)?([1-5])$/i.test(qLower.trim())) {
    return 'MODE_ORDER_SELECTION';
  }

  // 6. Conversational Order Placement (with product / address intent)
  if (qLower.includes('order') || qLower.includes('buy') || qLower.includes('purchase') ||
      qLower.includes('kharidna') || qLower.includes('mangwana') || qLower.includes('checkout') ||
      qLower.includes('bhejo') || qLower.includes('deliver kro')) {
    return 'MODE_ORDER_BOOKING';
  }

  // 7. General Small Talk & Casual Greetings
  const isSmallTalk = /^(salam|assalam|aoa|hello|hi|hey|kya haal|kaise ho|kese ho|kaisay ho|good morning|good evening|adab|thanks|thank you|shukriya|jazakallah|ok|theek hai|theek hy|acha|done)\b/i.test(qLower) ||
                      qLower.includes('kaise ho') || qLower.includes('kaisay ho') || qLower.includes('kese ho') ||
                      qLower.includes('kya haal') || qLower.includes('kya hal') || qLower.includes('how are you') ||
                      qLower.includes('sunao') || qLower.includes('sunayein') ||
                      qLower.includes('thank') || qLower.includes('shukriya') || qLower.includes('jazakallah') ||
                      qLower.includes('who are you') || qLower.includes('kon ho') || qLower.includes('bot ho') ||
                      qLower.includes('shop timing') || qLower.includes('shop kahan') || qLower.includes('location') ||
                      qLower.includes('address') || (qLower.length <= 15 && (qLower.includes('hi') || qLower.includes('hello')));

  const isProductRelated = qLower.includes('ac') || qLower.includes('bike') || qLower.includes('oven') ||
                           qLower.includes('fridge') || qLower.includes('tv') || qLower.includes('price') ||
                           qLower.includes('rate') || qLower.includes('kitne') || qLower.includes('stock') ||
                           qLower.includes('cooling') || qLower.includes('heat') || qLower.includes('battery');

  if (isSmallTalk && !isProductRelated) {
    return 'MODE_GENERAL_CHAT';
  }

  return 'MODE_SHOP_PRODUCT_QUERY';
}

const geminiService = {
  /**
   * Main entry point for generating intelligent, context-aware answers
   */
  async generateAnswer(businessName, context, query, customerPhone = '+923001234567', customerName = 'Valued Customer', merchantId = null) {
    const qLower = query.toLowerCase().trim();
    const allProducts = db.findAll('products') || [];
    const allRepairs = db.findAll('repairs') || [];
    const allOrders = db.findAll('orders') || [];
    const activeMerchantId = merchantId || (allProducts.length > 0 ? allProducts[0].merchant_id : '1c8b9736-ad03-4251-bacf-1e1bff38fd00');

    // Context & Live Inventory Extraction
    let activeContext = context;
    if (!activeContext || activeContext.trim().length === 0) {
      activeContext = getRagContext(activeMerchantId, query);
    }

    const isUrdu = detectIsUrdu(query);
    const intentMode = classifyIntent(qLower);

    // =========================================================================
    // A. STRICT GUARDRAIL: Proactively block hallucinations on non-catalog items
    // =========================================================================
    if (intentMode === 'MODE_GUARDRAIL_UNAVAILABLE') {
      if (isUrdu) {
        return `Maazrat janab! Hamare paas yeh item available nahi hai.

ZepTech Smart Electronics & E-Mobility par hum strictly in products aur services mein deal karte hain:
1. Inverter ACs (Gree, Haier - 1 Ton & 1.5 Ton)
2. Smart E-Bikes (ZepTech Thunder 70cc & Eco Commuter)
3. Convection & Microwave Ovens (Dawlance & Haier)
4. Inverter Refrigerators & 4K Smart Android TVs
5. Complete Hardware Repair & Maintenance Services (30-day warranty)

Agar aap ko in mein se kisi product ke rates, specs ya booking ki zaroorat ho to zaroor batayein!`;
      }
      return `We apologize, but that item is not available in our store inventory.

At ${SHOP_METADATA.name}, we strictly specialize in:
1. DC Inverter Air Conditioners (Gree, Haier)
2. Smart Electric Bikes (ZepTech Thunder 70cc & Eco Commuter)
3. Convection Microwave & Baking Ovens (Dawlance, Haier)
4. Inverter Refrigerators & 4K Smart Android TVs
5. Hardware Diagnostics & Maintenance (with 30-day warranty)

Please let us know if you would like pricing or details for any of our available appliances or e-bikes!`;
    }

    // =========================================================================
    // B. ORDER TRACKING: Status of Existing Orders (e.g. ZP-ORD-xxxx)
    // =========================================================================
    if (intentMode === 'MODE_ORDER_TRACKING') {
      const ordMatch = query.match(/ZP-ORD-\d+/i);
      const searchCode = ordMatch ? ordMatch[0].toUpperCase() : null;
      const order = (searchCode && allOrders.find(o => o.order_code && o.order_code.toUpperCase() === searchCode)) ||
                    (customerPhone && allOrders.find(o => o.customer_phone && o.customer_phone.includes(customerPhone.slice(-7)))) ||
                    (allOrders.length > 0 ? allOrders[allOrders.length - 1] : null);

      if (order) {
        if (isUrdu) {
          return `📦 ZEPTECH OFFICIAL ORDER TRACKING REPORT:
────────────────────────────────────────
• Order Code: ${order.order_code}
• Customer: ${order.customer_name}
• Item: ${order.items?.[0]?.title || 'Household Electronics Appliance'}
• Total Bill: Rs. ${Number(order.total_amount).toLocaleString()} PKR (Cash on Delivery)
• Delivery Address: ${order.delivery_address}
• Live Status: 🚚 ${order.order_status === 'CONFIRMED' ? 'Confirmed & Packaging for Dispatch' : order.order_status}

Hamari delivery team 24 se 48 ghante ke andar parcel deliver kar degi. Rider rawangi se pehle call karega!
Helpline: +92 300 1234567`;
        }

        return `📦 ZEPTECH OFFICIAL ORDER TRACKING REPORT:
────────────────────────────────────────
• Order ID: ${order.order_code}
• Customer: ${order.customer_name}
• Item: ${order.items?.[0]?.title || 'Electronics Item'}
• Amount: Rs. ${Number(order.total_amount).toLocaleString()} PKR (Cash on Delivery)
• Delivery Address: ${order.delivery_address}
• Current Status: 🚚 ${order.order_status === 'CONFIRMED' ? 'Confirmed & Packaging for Dispatch' : order.order_status}

Your order is scheduled for delivery within 24 to 48 hours across Lahore.
Helpline: +92 300 1234567`;
      }
    }

    // =========================================================================
    // C. HOW TO ORDER / OPTIONS & ICONS INQUIRY
    // =========================================================================
    if (intentMode === 'MODE_HOW_TO_ORDER') {
      if (isUrdu) {
        return `🛒 ZEPTECH EASY ORDERING OPTIONS & ICONS:
Hum se order karna nihayat aasan hai! Aap 2 tareeqon se order book karwa saktay hain:

👉 OPTION 1: 1-Click WhatsApp Direct Order (Recommended)
Bas is format mein reply karein:
"Order [Product Ka Naam], [Aap Ka Naam], [Lahore Delivery Address]"
(Maslan: "Order Gree 1.5 Ton AC, Ali Khan, House #14 Street 2 Gulberg Lahore")

👉 OPTION 2: Number Select Karein
Aap sirf product ka number likh kar bhej dein:
1️⃣ Gree 1.5 Ton Fairy Inverter AC (Rs. 142,000)
2️⃣ Haier 1.5 Ton Puri Inverter AC (Rs. 138,000)
3️⃣ ZepTech Thunder 70cc Smart E-Bike (Rs. 145,000)
4️⃣ Dawlance 30L Microwave Baking Oven (Rs. 38,500)
5️⃣ Haier 338L Inverter Refrigerator (Rs. 92,000)

🚚 PAYMENT & WARRANTY TERMS:
• 💰 Cash on Delivery (COD): Parcel check karke rider ko cash ada karein.
• 🚀 Free Delivery: Pure Lahore mein 24 se 48 ghante ke andar FREE home delivery.
• 🛡️ Official Warranty: Original company warranty card parcel ke sath milega.

Order karne ke liye product ka naam ya number bhej dein!`;
      }

      return `🛒 ZEPTECH EASY ORDERING OPTIONS:
Ordering from ZepTech is fast, secure, and hassle-free! You have 2 convenient options:

👉 OPTION 1: 1-Click WhatsApp Quick Order (Fastest)
Simply reply in this format:
"Order [Product Name], [Your Name], [Lahore Delivery Address]"
(Example: "Order Gree 1.5 Ton AC, Ali Khan, House 14 Gulberg Lahore")

👉 OPTION 2: Quick Number Selection
Reply with the number of your desired product:
1️⃣ Gree 1.5 Ton Fairy Inverter AC (Rs. 142,000)
2️⃣ Haier 1.5 Ton Puri Inverter AC (Rs. 138,000)
3️⃣ ZepTech Thunder 70cc Smart E-Bike (Rs. 145,000)
4️⃣ Dawlance 30L Microwave Baking Oven (Rs. 38,500)
5️⃣ Haier 338L Inverter Refrigerator (Rs. 92,000)

🚚 DELIVERY & PAYMENT:
• Free Cash on Delivery (COD) across Lahore within 24-48 Hours.
• Inspect your product before making payment to the courier rider.
• Official brand warranty card and test seal included with every order!`;
    }

    // =========================================================================
    // D. QUICK NUMBER SELECTION (User replies "1", "2", "3", "Order 1", etc.)
    // =========================================================================
    if (intentMode === 'MODE_ORDER_SELECTION') {
      const match = qLower.match(/([1-5])/);
      const num = match ? match[1] : '1';
      const map = {
        '1': allProducts.find(p => p.title.toLowerCase().includes('gree')) || allProducts[0],
        '2': allProducts.find(p => p.title.toLowerCase().includes('haier') && p.category === 'Air Conditioners') || allProducts[1],
        '3': allProducts.find(p => p.category === 'E-Bikes') || allProducts[2],
        '4': allProducts.find(p => p.category === 'Ovens & Kitchen') || allProducts[3],
        '5': allProducts.find(p => p.category === 'Refrigerators') || allProducts[4]
      };
      const selected = map[num] || allProducts[0];

      if (isUrdu) {
        return `🎉 Behtareen Choice! Aap ne select kiya hai:
📦 Item: *${selected.title}*
💰 Price: *Rs. ${selected.price.toLocaleString()} PKR* (Free Cash on Delivery in Lahore)
🛡️ Warranty: Official Company Warranty Card shamil hai.

Aap ki official order confirmation slip generate karne ke liye, baraye meharbani apna Name aur Lahore Delivery Address is tarah reply karein:
👉 "Mera naam [Aap Ka Naam] hai, Delivery address: [House, Street, Area Lahore]"`;
      }

      return `🎉 Excellent choice! You selected:
📦 Item: *${selected.title}*
💰 Price: *Rs. ${selected.price.toLocaleString()} PKR* (Free COD in Lahore)
🛡️ Warranty: Official Brand Warranty Included.

To generate your official order confirmation slip and dispatch the parcel, please reply with your Name & Lahore Address:
👉 "My name is [Name], Delivery address: [House, Street, Area Lahore]"`;
    }

    // =========================================================================
    // E. REPAIR & WARRANTY STATUS TRACKING (Token lookup e.g. REP-101)
    // =========================================================================
    const tokenMatch = query.match(/REP-\d+/i) || query.match(/#?(\d{3,5})/);
    const isRepairIntent = intentMode === 'MODE_REPAIR_TRACKING' ||
                           qLower.includes('repair') || qLower.includes('token') ||
                           qLower.includes('mera ac') || qLower.includes('mera oven') || qLower.includes('meri bike');

    if (tokenMatch && isRepairIntent) {
      const rawToken = tokenMatch[0].toUpperCase();
      const searchToken = rawToken.startsWith('REP-') ? rawToken : `REP-${rawToken}`;
      const repair = allRepairs.find(r => r.token_number && r.token_number.toUpperCase() === searchToken) ||
                     (customerPhone ? allRepairs.find(r => r.customer_phone && r.customer_phone.replace(/\D/g, '').includes(customerPhone.replace(/\D/g, '').slice(-7))) : null);

      if (repair) {
        const stageMap = {
          'RECEIVED': isUrdu ? '1/4 Received at Counter (Workshop mein jama ho chuka hai)' : '1/4 Received at Center',
          'DIAGNOSING': isUrdu ? '2/4 Under Bench Diagnosis (Engineer check kar raha hai)' : '2/4 Under Bench Diagnosis',
          'IN_PROGRESS': isUrdu ? '3/4 Component Replacement in Progress (Repairing jaari hai)' : '3/4 Component Replacement in Progress',
          'READY_FOR_PICKUP': isUrdu ? '4/4 Ready for Pickup (Mukammal tayyar hai, le jayen!)' : '4/4 Ready for Pickup / Delivery'
        };

        const repairCard = JSON.stringify({
          type: 'repair',
          token: repair.token_number,
          item: repair.item_name,
          issue: repair.issue_reported,
          status: repair.status,
          cost: repair.estimated_cost,
          notes: repair.technician_notes,
          warranty: `${repair.warranty_days} Days`
        });

        if (isUrdu) {
          return `🔧 ZEPTECH REPAIR TRACKING REPORT:
Token Number: ${repair.token_number}
Device / Item: ${repair.item_name}
Reported Issue: ${repair.issue_reported}
Current Status: ${stageMap[repair.status] || repair.status}
Estimated Bill: Rs. ${repair.estimated_cost.toLocaleString()} (${repair.warranty_days} din ki service warranty shamil)
Technician Notes: "${repair.technician_notes}"

${repair.status === 'READY_FOR_PICKUP' ? '✅ Aap ki device mukammal test ho kar tayyar hai! Baraye meharbani receipt le kar shop tashreef layen ya home delivery ke liye batayein.' : 'Hamare chief engineer aap ki device par kaam kar rahe hain. Jese hi bench testing complete hogi aap ko notify kar diya jaye ga.'}<!-- REPAIR_DATA: ${repairCard} -->`;
        }

        return `🔧 ${businessName} OFFICIAL REPAIR TRACKING:
Token Number: ${repair.token_number}
Item: ${repair.item_name}
Reported Fault: ${repair.issue_reported}
Current Status: ${stageMap[repair.status] || repair.status}
Estimated Bill: Rs. ${repair.estimated_cost.toLocaleString()} (${repair.warranty_days}-Day Service Warranty Included)
Technician Notes: "${repair.technician_notes}"

${repair.status === 'READY_FOR_PICKUP' ? '✅ Your device is fully repaired, bench-tested, and ready for pickup! Please bring your receipt to the shop or reply here for courier dispatch.' : 'Our engineers are currently working on your device. We will update you as soon as testing is complete.'}<!-- REPAIR_DATA: ${repairCard} -->`;
      }
    }

    // =========================================================================
    // F. CONVERSATIONAL ORDER PLACEMENT -> OFFICIAL CONFIRMATION INVOICE SLIP
    // =========================================================================
    if (intentMode === 'MODE_ORDER_BOOKING' && (
      qLower.includes('now') || qLower.includes('please') || qLower.includes('this') ||
      qLower.includes('deliver') || qLower.includes('ac') || qLower.includes('bike') ||
      qLower.includes('ebike') || qLower.includes('oven') || qLower.includes('fridge') ||
      qLower.includes('tv') || qLower.includes('lahore') || qLower.includes('house') ||
      qLower.includes('street') || qLower.includes('gree') || qLower.includes('haier') ||
      qLower.includes('dawlance') || qLower.includes('order') || qLower.includes('chahiye')
    )) {

      let candidatePool = [...allProducts];
      if (qLower.includes('ac') || qLower.includes('air conditioner') || qLower.includes('split') || qLower.includes('inverter ac')) {
        candidatePool = allProducts.filter(p => p.category === 'Air Conditioners');
      } else if (qLower.includes('ebike') || qLower.includes('e-bike') || qLower.includes('bike') || qLower.includes('thunder') || qLower.includes('scooter') || qLower.includes('eco')) {
        candidatePool = allProducts.filter(p => p.category === 'E-Bikes');
      } else if (qLower.includes('oven') || qLower.includes('microwave') || qLower.includes('baking') || qLower.includes('fryer')) {
        candidatePool = allProducts.filter(p => p.category === 'Ovens & Kitchen');
      } else if (qLower.includes('fridge') || qLower.includes('refrigerator') || qLower.includes('freezer')) {
        candidatePool = allProducts.filter(p => p.category === 'Refrigerators');
      } else if (qLower.includes('tv') || qLower.includes('led')) {
        candidatePool = allProducts.filter(p => p.category === 'LED TVs');
      }

      let targetProduct = null;
      if (qLower.includes('gree')) targetProduct = candidatePool.find(p => p.title.toLowerCase().includes('gree'));
      else if (qLower.includes('haier') && candidatePool.some(p => p.title.toLowerCase().includes('haier'))) targetProduct = candidatePool.find(p => p.title.toLowerCase().includes('haier'));
      else if (qLower.includes('dawlance')) targetProduct = candidatePool.find(p => p.title.toLowerCase().includes('dawlance'));
      else if (qLower.includes('samsung')) targetProduct = candidatePool.find(p => p.title.toLowerCase().includes('samsung'));
      else if (qLower.includes('tcl')) targetProduct = candidatePool.find(p => p.title.toLowerCase().includes('tcl'));
      else if (qLower.includes('thunder')) targetProduct = candidatePool.find(p => p.title.toLowerCase().includes('thunder'));
      else if (qLower.includes('eco')) targetProduct = candidatePool.find(p => p.title.toLowerCase().includes('eco'));

      if (!targetProduct) {
        targetProduct = candidatePool[0] || allProducts[0];
      }

      let finalCustomerName = customerName !== 'Valued Customer' && customerName !== 'Simulated Customer' ? customerName : 'WhatsApp Customer';
      const nameMatch = query.match(/(?:my name is|name is|i am|name:|mera naam|naam)\s+([a-zA-Z\s.]+?)(?:,|\band\b|deliver|\.|$)/i);
      if (nameMatch && nameMatch[1].trim().length > 2) {
        finalCustomerName = nameMatch[1].trim();
      }

      const addressKeywords = ['house', 'street', 'sector', 'block', 'phase', 'dha', 'lahore', 'gulberg', 'model town', 'johar town', 'road', 'flat', 'plaza', 'wapda', 'cantt'];
      const hasAddress = addressKeywords.some(k => qLower.includes(k));
      let finalAddress = 'Gulberg III, Main Market, Lahore';

      if (hasAddress || qLower.includes('deliver') || qLower.includes('order')) {
        const addrMatch = query.match(/(?:deliver to|deliver at|address is|address:|at|mera address|mera addres)\s+(.+?)(?:\.|$)/i);
        if (addrMatch && addrMatch[1].trim().length > 5) {
          finalAddress = addrMatch[1].trim();
        }

        const randNum = Math.floor(1000 + Math.random() * 9000);
        const orderCode = `ZP-ORD-${randNum}`;
        const invoiceNum = `ZP-INV-${randNum}`;
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const fullDateTime = `${dateStr}, ${timeStr}`;

        if (targetProduct.stock_quantity > 0) {
          db.update('products', targetProduct.id, { stock_quantity: targetProduct.stock_quantity - 1 });
        }

        db.insert('orders', {
          id: uuidv4(),
          order_code: orderCode,
          invoice_no: invoiceNum,
          merchant_id: activeMerchantId,
          customer_name: finalCustomerName,
          customer_phone: customerPhone,
          delivery_address: finalAddress,
          items: [{
            title: targetProduct.title,
            price: targetProduct.price,
            quantity: 1
          }],
          total_amount: targetProduct.price,
          order_status: 'CONFIRMED',
          payment_method: 'Cash on Delivery (COD)'
        });

        db.insert('leads', {
          id: uuidv4(),
          merchant_id: activeMerchantId,
          customer_id: 'cust_order',
          session_id: 'sess_order',
          lead_type: 'ORDER_PLACED',
          status: 'QUALIFIED',
          extracted_details: JSON.stringify({ order_code: orderCode, invoice_no: invoiceNum, item: targetProduct.title, amount: targetProduct.price, phone: customerPhone })
        });

        const targetWarranty = targetProduct.category === 'E-Bikes' ? SHOP_METADATA.warranties.ebike :
                               targetProduct.category === 'Air Conditioners' || targetProduct.category === 'Refrigerators' ? SHOP_METADATA.warranties.acAndFridge :
                               targetProduct.category === 'Ovens & Kitchen' ? SHOP_METADATA.warranties.microwave : '1-Year Official Warranty';

        const orderCard = JSON.stringify({
          type: 'order',
          invoice_no: invoiceNum,
          order_code: orderCode,
          product_title: targetProduct.title,
          amount: targetProduct.price,
          payment: 'Cash on Delivery (COD)',
          status: 'CONFIRMED',
          customer_name: finalCustomerName,
          customer_phone: customerPhone,
          address: finalAddress,
          warranty: targetWarranty,
          date_time: fullDateTime
        });

        if (isUrdu) {
          return `====================================================
        ZEPTECH SMART ELECTRONICS & E-MOBILITY
      OFFICIAL ORDER CONFIRMATION SLIP / INVOICE
====================================================
🧾 Invoice No:       #${invoiceNum}
📦 Order Code:       ${orderCode}
📅 Booking Date:     ${fullDateTime}
📊 Order Status:     CONFIRMED (Processing for Dispatch)
────────────────────────────────────────────────────
👤 CUSTOMER DETAILS:
• Customer Name:     ${finalCustomerName}
• WhatsApp Phone:    ${customerPhone}
• Delivery Address:  ${finalAddress}
────────────────────────────────────────────────────
🛒 ITEM PURCHASED:
• Product:           ${targetProduct.title}
• Category:          ${targetProduct.category}
• Quantity:          1 Unit
• Unit Price:        Rs. ${targetProduct.price.toLocaleString()} PKR
• Delivery Charges:  FREE (Rs. 0 - Lahore 24-48 Hours)
────────────────────────────────────────────────────
💰 TOTAL AMOUNT DUE: Rs. ${targetProduct.price.toLocaleString()} PKR
💳 Payment Method:   Cash on Delivery (COD) - Pay upon delivery
🛡️ Official Warranty:${targetWarranty}
────────────────────────────────────────────────────
🚚 DISPATCH & DELIVERY NOTICE:
Hamari dispatch team courier rawana karne se pehle aap ke phone number par call karegi. Parcel check karke rider ko cash ada karein.

🔍 Order Track karne ke liye kisi bhi waqt "Track ${orderCode}" likh kar bhejein.
📞 HelpLine / Support: +92 300 1234567
ZepTech Smart Electronics ka intikhab karne ka shukriya!
====================================================<!-- ORDER_DATA: ${orderCard} -->`;
        }

        return `====================================================
        ZEPTECH SMART ELECTRONICS & E-MOBILITY
      OFFICIAL ORDER CONFIRMATION SLIP / INVOICE
====================================================
🧾 Invoice No:       #${invoiceNum}
📦 Order Code:       ${orderCode}
📅 Booking Date:     ${fullDateTime}
📊 Order Status:     CONFIRMED (Processing for Dispatch)
────────────────────────────────────────────────────
👤 CUSTOMER DETAILS:
• Customer Name:     ${finalCustomerName}
• WhatsApp Phone:    ${customerPhone}
• Delivery Address:  ${finalAddress}
────────────────────────────────────────────────────
🛒 ITEM PURCHASED:
• Product:           ${targetProduct.title}
• Category:          ${targetProduct.category}
• Quantity:          1 Unit
• Unit Price:        Rs. ${targetProduct.price.toLocaleString()} PKR
• Delivery Charges:  FREE (Rs. 0 - Lahore 24-48 Hours)
────────────────────────────────────────────────────
💰 TOTAL AMOUNT DUE: Rs. ${targetProduct.price.toLocaleString()} PKR
💳 Payment Terms:    Cash on Delivery (COD) - Pay upon delivery
🛡️ Official Warranty:${targetWarranty}
────────────────────────────────────────────────────
🚚 DISPATCH & DELIVERY NOTICE:
Our dispatch team will confirm by phone at ${customerPhone} before courier departure. Please inspect your item and pay the courier rider.

🔍 To track your package anytime, simply reply: "Track ${orderCode}".
📞 HelpLine / Support: +92 300 1234567
Thank you for shopping with ZepTech Smart Electronics!
====================================================<!-- ORDER_DATA: ${orderCard} -->`;
      }
    }

    // =========================================================================
    // G. PRODUCT CARDS APPENDAGE (Recommendations & Inquiries)
    // =========================================================================
    let cardsJson = null;
    let matchingCategoryProducts = [];
    if (qLower.includes('ebike') || qLower.includes('e-bike') || qLower.includes('bike') || qLower.includes('motorcycle') || qLower.includes('scooter')) {
      matchingCategoryProducts = allProducts.filter(p => p.category === 'E-Bikes');
    } else if (qLower.includes('oven') || qLower.includes('microwave') || qLower.includes('baking') || qLower.includes('micro')) {
      matchingCategoryProducts = allProducts.filter(p => p.category === 'Ovens & Kitchen');
    } else if (qLower.includes('ac') || qLower.includes('air conditioner') || qLower.includes('inverter') || qLower.includes('split') || qLower.includes('ton')) {
      matchingCategoryProducts = allProducts.filter(p => p.category === 'Air Conditioners');
    } else if (qLower.includes('fridge') || qLower.includes('refrigerator') || qLower.includes('freezer')) {
      matchingCategoryProducts = allProducts.filter(p => p.category === 'Refrigerators');
    } else if (qLower.includes('tv') || qLower.includes('led') || qLower.includes('screen')) {
      matchingCategoryProducts = allProducts.filter(p => p.category === 'LED TVs');
    }

    if (matchingCategoryProducts.length > 0 && intentMode === 'MODE_SHOP_PRODUCT_QUERY') {
      const topP = matchingCategoryProducts.slice(0, 3);
      cardsJson = JSON.stringify({
        type: 'products',
        items: topP.map(p => ({
          id: p.id,
          title: p.title,
          category: p.category,
          price: p.price,
          stock: p.stock_quantity,
          specs: p.specs,
          image_icon: p.image_icon
        }))
      });
    }

    // =========================================================================
    // H. LIVE GOOGLE GEMINI FLASH INTELLIGENCE ENGINE (With Injected Context)
    // =========================================================================
    const inventorySummary = allProducts.map(p =>
      `- [${p.category}] ${p.title} | Price: Rs. ${p.price.toLocaleString()} PKR | Stock: ${p.stock_quantity} units | Key Specs: ${Array.isArray(p.specs) ? p.specs.join(', ') : p.specs}`
    ).join('\n');

    const systemPrompt = `You are WhatsAssist AI, the official, intelligent, friendly, and context-aware customer resolution assistant for "${SHOP_METADATA.name}".
Founder & Lead Engineer: ${SHOP_METADATA.founder}.

=== SHOP CORE PROFILE ===
- Store Name: ${SHOP_METADATA.name}
- Location: ${SHOP_METADATA.location}
- Operating Timings: ${SHOP_METADATA.timings}
- Contact / WhatsApp: ${SHOP_METADATA.contactPhone}
- Delivery Policy: ${SHOP_METADATA.deliveryPolicy}
- Payment Methods: ${SHOP_METADATA.paymentMethods}
- Warranties:
  * E-Bikes: ${SHOP_METADATA.warranties.ebike}
  * Inverter ACs & Refrigerators: ${SHOP_METADATA.warranties.acAndFridge}
  * Microwave & Ovens: ${SHOP_METADATA.warranties.microwave}
  * Repair Services: ${SHOP_METADATA.warranties.repairs}

=== LIVE DATABASE INVENTORY (STRICT SOURCE OF TRUTH) ===
${inventorySummary}

=== RAG KNOWLEDGE ASSETS ===
${activeContext || 'All official ZepTech verified diagnostic steps, technical manuals, and warranties apply.'}

=== DUAL-MODE OPERATIONAL GUIDELINES ===
1. GENERAL / SMALL TALK MODE:
   - If the user sends greetings (e.g. "Salam", "Hello", "Hi"), asks how you are ("Kaisay ho?", "Kya haal hai?"), inquires about shop timings or location, or expresses thanks ("Shukriya", "Thank you", "Ok"):
   - Respond naturally, warmly, and like a polite human shop representative.
   - DO NOT dump the full product catalog or unprompted price lists when the customer is merely saying hello or asking casual questions.

2. SHOP & PRODUCT QUERY MODE:
   - When the user asks about products, prices, stock availability, repairs, or technical problems:
   - Answer directly using the exact details from the LIVE DATABASE INVENTORY above.
   - For technical diagnostics (AC cooling issues, microwave heating failures, e-bike range/battery), provide 2-3 step practical troubleshooting advice.
   - ALWAYS include clear ordering options: Invite them to order by typing "Order [Product Name], [Name], [Lahore Address]".

3. STRICT ANTI-HALLUCINATION GUARDRAILS:
   - NEVER make up or invent products, models, or prices that are NOT listed in the LIVE DATABASE INVENTORY table above.
   - If a customer asks for a product that is not in our inventory (e.g. mobile phones, laptops, solar panels, clothing, or out-of-stock items), politely explain that we do not carry that item, and invite them to explore our available inventory (Inverter ACs, E-Bikes, Microwave Ovens, Refrigerators, and Smart TVs).
   - NEVER quote false prices or unauthorized discounts. Always quote exact prices from the inventory.

4. LANGUAGE FLUENCY & TONE:
   - If the customer writes in Roman Urdu or Urdu, respond in warm, natural, friendly, and respectful Roman Urdu.
   - If the customer writes in English, respond in polished, professional, and friendly English.
   - Keep answers clean, conversational, and direct.`;

    const liveAIResponse = await callLiveGemini(systemPrompt, query);

    if (liveAIResponse) {
      if (cardsJson) {
        return `${liveAIResponse}<!-- PRODUCT_CARDS: ${cardsJson} -->`;
      }
      return liveAIResponse;
    }

    // =========================================================================
    // I. AUTONOMOUS INTELLIGENT EXPERT ENGINE (Offline / Sandbox NLP Engine)
    // Runs when live Gemini API key is unconfigured or without external internet.
    // =========================================================================

    // 1. Mode: General Small Talk & Casual Human Greetings
    if (intentMode === 'MODE_GENERAL_CHAT') {
      if (qLower.includes('kaise ho') || qLower.includes('kese ho') || qLower.includes('kaisay ho') || qLower.includes('kya haal') || qLower.includes('kya hal') || qLower.includes('how are you') || qLower.includes('sunao') || qLower.includes('sunayein')) {
        if (isUrdu) {
          return `Walaikum Assalam! Main bilkul theek hoon, Allah ka shukr hai. Aap sunayein, aap kaisay hain?

ZepTech Smart Electronics & E-Mobility mein aap ka khair-maqdam hai! Aaj main aap ki kis cheez mein madad kar sakta hoon?`;
        }
        return `Hello! I am doing great, thank you for asking! How are you doing today?

Welcome to ${SHOP_METADATA.name}! How may I assist you today with our electronics, e-bikes, or repair services?`;
      }

      if (/^(salam|assalam|aoa|hello|hi|hey|good morning|good evening|adab)\b/i.test(qLower)) {
        if (isUrdu) {
          return `Walaikum Assalam! ZepTech Smart Electronics & E-Mobility Store mein khush-amdeed! 👋

Main aap ka AI shop assistant hoon. Hum aap ko Inverter ACs, Smart E-Bikes, Microwave Ovens, Refrigerators, LED TVs aur hardware repairs ke baray mein mukammal rehnumai aur best rates faraham karte hain.

Aap kis product ya service ke baray mein janna chahtay hain?`;
        }
        return `Hello and welcome to ${SHOP_METADATA.name}! 👋

I am your WhatsAssist AI shop assistant. We specialize in Inverter ACs, Smart E-Bikes, Baking Ovens, Refrigerators, 4K Smart TVs, and certified repair services.

How can I help you today?`;
      }

      if (qLower.includes('thank') || qLower.includes('shukriya') || qLower.includes('jazakallah') || qLower.includes('meharbani')) {
        if (isUrdu) {
          return `Bohat bohat shukriya! Yeh hamara farz hai. Agar aap ko kisi bhi appliance ya e-bike ke baray mein mazeed koi maloomat chahiye ho ya order karna ho to zaroor batayein. Apna bohat khayal rakhein! 😊`;
        }
        return `You are very welcome! It is our pleasure to assist you. If you ever need any details on our products, warranties, or orders, feel free to message anytime. Have a wonderful day! 😊`;
      }

      if (qLower === 'ok' || qLower === 'theek hai' || qLower === 'theek hy' || qLower === 'acha' || qLower === 'sahi' || qLower === 'done') {
        if (isUrdu) {
          return `Zabardast! Jab bhi aap ko kisi electronics item, e-bike ya repair service ki zaroorat ho, bas yahan message kar dein. ZepTech hamesha aap ki khidmat ke liye hazir hai!`;
        }
        return `Understood! Whenever you need any information, orders, or repair updates, just drop a message here. ZepTech is always ready to assist you!`;
      }

      if (qLower.includes('timing') || qLower.includes('time') || qLower.includes('hours') || qLower.includes('khulta') || qLower.includes('band')) {
        if (isUrdu) {
          return `ZepTech Store Timings & Operating Hours:
- Monday se Saturday: Subah 10:00 AM se Raat 10:00 PM tak
- Sunday: Dopehar 2:00 PM se Raat 10:00 PM tak

Aap hamari shop Shop #14, Main Market, Gulberg III Lahore par visit kar saktay hain ya WhatsApp par 24/7 order book karwa saktay hain!`;
        }
        return `${SHOP_METADATA.name} Store Timings:
- Monday – Saturday: 10:00 AM to 10:00 PM
- Sunday: 2:00 PM to 10:00 PM

You are warmly welcome to visit our experience center at Shop #14, Main Market, Gulberg III, Lahore, or order directly here via WhatsApp!`;
      }

      if (qLower.includes('location') || qLower.includes('address') || qLower.includes('kahan') || qLower.includes('where') || qLower.includes('shop')) {
        if (isUrdu) {
          return `ZepTech Store Location:
Address: Shop #14, Main Market, Gulberg III, Lahore, Pakistan.
Contact: +92 300 1234567

Tamam products par pure Lahore mein 24 se 48 ghante ke andar Free Cash on Delivery (COD) bhi dastiyab hai!`;
        }
        return `${SHOP_METADATA.name} Location & Address:
Address: Shop #14, Main Market, Gulberg III, Lahore, Pakistan.
Phone: +92 300 1234567

Free Cash on Delivery (COD) within 24-48 hours is also available across all areas of Lahore!`;
      }

      if (qLower.includes('who are you') || qLower.includes('kon ho') || qLower.includes('owner') || qLower.includes('ahmad khan') || qLower.includes('bot')) {
        if (isUrdu) {
          return `Main WhatsAssist AI hoon — ZepTech Smart Electronics & E-Mobility Store ka official intelligent customer assistant.

Yeh platform Muhammad Ahmad Khan (24-ST-027), BS Software Engineering Technology, PTUT Lahore ne design aur develop kiya hai. Main real WhatsApp, live inventory aur Google Gemini AI ke sath kaam karta hoon.`;
        }
        return `I am WhatsAssist AI, the official customer representative for ${SHOP_METADATA.name}.
Engineered by Muhammad Ahmad Khan (24-ST-027), BS Software Engineering Technology at Punjab Tianjin University of Technology (PTUT), Lahore.`;
      }
    }

    // 2. Technical Diagnostics: Inverter AC Troubleshooting
    const isAcFault = (qLower.includes('ac') || qLower.includes('cooling') || qLower.includes('split') || qLower.includes('air conditioner')) &&
                      (qLower.includes('not cooling') || qLower.includes('cooling nahi') || qLower.includes('cooling ni') ||
                       qLower.includes('thanda nahi') || qLower.includes('thanda ni') || qLower.includes('trip') ||
                       qLower.includes('leak') || qLower.includes('gas') || qLower.includes('fault'));

    if (isAcFault) {
      if (isUrdu) {
        return `❄️ Inverter AC Cooling Issue Diagnostics (Engineering Guide):
Agar aap ka AC chal raha hai magar cooling nahi kar raha to yeh 4 cheezein check karein:
1. Air Filters: Indoor unit ka front cover khol kar dono filters saaf karein. Blocked filters se 60% cooling drop ho jati hai.
2. Remote Setting: Remote par check karein ke 'COOL' mode (snowflake icon) set ho aur temperature 22°C ya 24°C ho (FAN ya DRY mode par na ho).
3. Outdoor Unit & Compressor: Check karein ke outdoor fan aur compressor chal rahe hain. Agar compressor awaz de kar trip kar jata hai to run-capacitor ya PCB circuit board ka issue ho sakta hai.
4. Gas Leakage: Agar indoor ke copper pipes par baraf (frost) jam rahi hai to gas leak hone ka imkaan hai.

🔧 Technician Visit: Agar issue solve na ho to hamare certified technician ki home service visit book karwane ke liye humein yahan batayein (30-day service warranty shamil hai).`;
      }
      return `❄️ Inverter AC Technical Diagnostic Guide:
If your AC is running but failing to cool properly, check these 4 points:
1. Clean Air Filters: Dirty filters choke airflow by over 60%. Rinse them with lukewarm water.
2. Verify Remote Mode: Ensure the remote is strictly on COOL mode (snowflake icon) at 24°C, not FAN or DRY mode.
3. Check Outdoor Compressor: Inspect if the outdoor compressor hums and fan rotates. Frequent tripping indicates a failed capacitor or PCB voltage fault.
4. Check for Frost/Ice: Frost on copper pipe flares indicates low refrigerant gas pressure.

🔧 ZepTech provides certified technician home visits across Lahore backed by a 30-day service warranty!`;
    }

    // 3. Technical Diagnostics: Microwave Oven Troubleshooting
    const isOvenFault = (qLower.includes('oven') || qLower.includes('microwave')) &&
                        (qLower.includes('garam') || qLower.includes('heat') || qLower.includes('spark') || qLower.includes('kharab'));

    if (isOvenFault) {
      if (isUrdu) {
        return `🍲 Microwave Oven Not Heating Diagnostics:
1. Magnetron / High Voltage Diode: Agar oven chalta hai aur plate ghoomti hai magar khana garam nahi hota to magnetron tube ya diode kamzor ho chuka hai.
2. High Voltage Fuse: Bijli ke jhatkay (power surges) se internal 5kV protection fuse urr jata hai.
3. Sparking / Sholay: Agar andar sparking ho rahi hai to right-side wali Mica Waveguide sheet par oil laga hota hai, usay saaf karein ya replace karwayen.

⚠️ Safety Warning: Microwave oven ko kabhi khud mat kholein kyunke iska capacitor band halat mein bhi 2000 Volts se zyada current store rakhta hai. Hamari workshop Shop #14 Main Market Gulberg III layen, 30 minutes mein bench test ho jaye ga!`;
      }
      return `🍲 Microwave Oven Not Heating - Technical Troubleshooting:
1. Magnetron / Diode Failure: If the turntable spins and light operates but food remains cold, the high-voltage diode or magnetron has failed.
2. Internal High-Voltage Fuse: Power spikes often blow the 5kV safety fuse.
3. Internal Sparking / Arcing: Residue on the Mica waveguide cover creates sparks. Clean or replace the mica sheet immediately.

⚠️ Safety Caution: Never open a microwave yourself; high-voltage capacitors retain dangerous charge. Bring it to ZepTech for safe 30-minute diagnosis!`;
    }

    // 4. Technical Diagnostics: E-Bike Battery & Mileage
    if ((qLower.includes('bike') || qLower.includes('ebike') || qLower.includes('battery')) &&
        (qLower.includes('range') || qLower.includes('km') || qLower.includes('charge') || qLower.includes('speed') || qLower.includes('chalti'))) {
      if (isUrdu) {
        return `🛵 ZepTech Thunder 70cc Smart E-Bike Technical Performance:
- Range: 70 se 80 km per full charge (Verified urban driving range)
- Battery: 60V / 24Ah Grade-A Lithium-ion (Intelligent BMS protection ke sath, 3 saal life cycle)
- Charging Time: 3.5 se 4 ghante aam 220V household socket par
- Top Speed: 60 km/h (3 digital speed modes: Eco, Normal, Sport)
- Petrol Savings: Running cost sirf Rs. 0.70 per km hai (jabke petrol bike Rs. 7.50/km leti hai). Mahana Rs. 18,000+ ki bachat!
- Price: Rs. 145,000 (3-Year motor & 1-Year battery replacement warranty shamil)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛒 ORDER OPTIONS:
👉 1-Click Order: Reply "Order ZepTech Thunder E-Bike, [Aap Ka Naam], [Lahore Address]"
🚚 Free Cash on Delivery (COD) across Lahore.`;
      }
      return `🛵 ZepTech Thunder 70cc Smart E-Bike Performance Specs:
- Range: 70 to 80 km real-world range per full charge
- Battery: 60V / 24Ah Grade-A Lithium-ion with smart BMS protection
- Charging Time: 3.5 to 4 hours on standard 220V home outlet
- Top Speed: 60 km/h with 3 digital speed modes
- Cost Savings: Rs. 0.70/km vs Rs. 7.50/km on petrol 70cc bikes (saves over Rs. 18,000 monthly)
- Price: Rs. 145,000 with 3-Year motor and 1-Year battery warranty!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛒 ORDER OPTIONS:
👉 1-Click Order: Reply "Order ZepTech Thunder E-Bike, [Your Name], [Lahore Address]"
🚚 Free Cash on Delivery (COD) across Lahore.`;
    }

    // 5. Product Pricing & Catalog Inquiry from Live Database
    if (matchingCategoryProducts.length > 0) {
      const topP = matchingCategoryProducts[0];
      const specsText = Array.isArray(topP.specs) ? topP.specs.join(', ') : topP.specs;
      if (isUrdu) {
        const reply = `🛒 ZEPTECH PRODUCT DETAILS:
🏷️ Item: ${topP.title}
📂 Category: ${topP.category}
💰 Price: Rs. ${topP.price.toLocaleString()} PKR
📦 Stock Status: ${topP.stock_quantity > 0 ? `✅ ${topP.stock_quantity} units available in Lahore store` : 'Out of stock (Restocking in 48 hours)'}
⚡ Key Specifications: ${specsText}
🚚 Delivery: Free Cash on Delivery (COD) within 24-48 hours across Lahore.
🛡️ Warranty: Official Brand Warranty Included.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛒 HOW TO ORDER THIS ITEM:
👉 Option 1: Reply "Order ${topP.title}, [Aap Ka Naam], [Delivery Address in Lahore]"
👉 Option 2: Reply "How to order" for full ordering instructions
📞 Call/WhatsApp: +92 300 1234567
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        return cardsJson ? `${reply}<!-- PRODUCT_CARDS: ${cardsJson} -->` : reply;
      }

      const reply = `🛒 ${businessName} PRODUCT DETAILS:
🏷️ Model: ${topP.title}
📂 Category: ${topP.category}
💰 Price: Rs. ${topP.price.toLocaleString()} PKR
📦 In-Stock: ${topP.stock_quantity > 0 ? `✅ ${topP.stock_quantity} units available` : 'Currently Restocking'}
⚡ Specifications: ${specsText}
🚚 Delivery: Free 24-48 hour Cash on Delivery across Lahore.
🛡️ Warranty: Official Brand Warranty Included.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛒 HOW TO ORDER THIS ITEM:
👉 Option 1: Reply "Order ${topP.title}, [Your Name], [Lahore Delivery Address]"
👉 Option 2: Reply "How to order" for payment and delivery details
📞 Call/WhatsApp: +92 300 1234567
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
      return cardsJson ? `${reply}<!-- PRODUCT_CARDS: ${cardsJson} -->` : reply;
    }

    // 6. RAG Context Fallback if available
    if (activeContext && activeContext.length > 20) {
      if (isUrdu) {
        return `Hamare store records ke mutabiq:

${activeContext}

Kisi bhi mazeed maloomat, technical advice ya order booking ke liye humein zaroor batayein!`;
      }
      return `According to our store knowledge base:

${activeContext}

Please let us know if you would like more details, troubleshooting assistance, or to place an order!`;
    }

    // 7. General Shop Assistant Overview with Quick Ordering Options
    if (isUrdu) {
      return `Aap ke rabte ka shukriya! ZepTech Smart Electronics & E-Mobility par hamare paas yeh items dastiyab hain:
1️⃣ Smart E-Bikes (70-80 km lithium range, Rs. 98,000 se 145,000)
2️⃣ DC Inverter ACs (Gree & Haier 1.5 Ton & 1 Ton T3 Inverter, Rs. 138,000 se 154,000)
3️⃣ Baking & Microwave Ovens (Dawlance & Haier Convection, Rs. 32,000 se 38,500)
4️⃣ Refrigerators & 4K Smart Android TVs (Rs. 89,000 se 115,000)
5️⃣ Hardware Repair Diagnostics (REP-xxx token tracking)

🚚 Free Cash on Delivery (COD) across Lahore!
👉 Order karne ke liye kisi bhi product ka naam likh kar bhejein ya reply karein: "How to order"`;
    }

    return `Thank you for reaching out to ${SHOP_METADATA.name}!
We specialize in:
1️⃣ Smart E-Bikes (70-80 km lithium range, zero fuel expense, Rs. 98,000 - 145,000)
2️⃣ DC Inverter ACs (Gree & Haier T3 Inverters, Rs. 138,000 - 154,000)
3️⃣ Convection & Microwave Ovens (Dawlance & Haier, Rs. 32,000 - 38,500)
4️⃣ Inverter Refrigerators & 4K Smart Android TVs (Rs. 89,000 - 115,000)
5️⃣ Hardware Repair Diagnostics & Token Tracking (e.g. REP-101)

🚚 Free Cash on Delivery (COD) within 24-48 hours across Lahore!
👉 To place an order, reply with your desired product name or type "How to order"!`;
  }
};

module.exports = geminiService;
