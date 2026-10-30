/**
 * WhatsAssist - Intelligent AI Orchestrator & Live Gemini LLM Engine
 * Connects directly to Google Gemini Flash API via Generative Language API.
 * Combines Live Generative AI with Relational Context (RAG), Order Placement,
 * Guided Technical Diagnostics, and Repair Token Resolution for ZepTech Smart Electronics & E-Mobility.
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
  // Official active Google Gemini models
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

  // Skip if key is not configured
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
            temperature: 0.6,
            maxOutputTokens: 750,
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
      // Suppress network isolation errors gracefully
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

const geminiService = {
  async generateAnswer(businessName, context, query, customerPhone = '+923001234567', customerName = 'Valued Customer', merchantId = null) {
    const qLower = query.toLowerCase().trim();
    const allProducts = db.findAll('products') || [];
    const allRepairs = db.findAll('repairs') || [];
    const activeMerchantId = merchantId || (allProducts.length > 0 ? allProducts[0].merchant_id : '1c8b9736-ad03-4251-bacf-1e1bff38fd00');

    // Auto-fetch RAG context if empty
    let activeContext = context;
    if (!activeContext || activeContext.trim().length === 0) {
      activeContext = getRagContext(activeMerchantId, query);
    }

    // Language detection: Check for Roman Urdu / Urdu markers
    const urduKeywords = [
      'kya', 'hai', 'hy', 'hain', 'kaise', 'kese', 'theek', 'mera', 'meri', 'mere', 'chahiye',
      'kharidna', 'btao', 'batao', 'kitne', 'kitna', 'kitni', 'kahan', 'kab', 'khulta', 'band',
      'hota', 'hoti', 'hoga', 'hogi', 'ap', 'aap', 'mujhe', 'mujhy', 'hmary', 'humary', 'salam',
      'walaikum', 'bhai', 'shukriya', 'meharbani', 'bhejo', 'mangwana', 'discount', 'sasta',
      'chal', 'nahi', 'ni', 'kr', 'rha', 'rhi', 'dost', 'tum', 'kis', 'chez', 'cheez', 'kaam',
      'kam', 'wala', 'wali', 'walay', 'pe', 'py', 'se', 'sy', 'bhi', 'kro', 'karo', 'dekho',
      'bhaiya', 'janab', 'sir', 'konsa', 'konsi', 'achha', 'acha', 'bura', 'mil', 'sakta', 'sakti'
    ];
    const isUrdu = urduKeywords.some(w => new RegExp(`\\b${w}\\b`, 'i').test(qLower));

    // =========================================================================
    // 1. REPAIR & WARRANTY STATUS TRACKING (Token lookup e.g. REP-101, REP-102)
    // =========================================================================
    const tokenMatch = query.match(/REP-\d+/i) || query.match(/#?(\d{3,5})/);
    const isRepairIntent = qLower.includes('repair') || qLower.includes('token') || qLower.includes('receipt') ||
                           qLower.includes('mera ac') || qLower.includes('mera oven') || qLower.includes('meri bike') ||
                           qLower.includes('theek hua') || qLower.includes('ready hua') || qLower.includes('fault');

    if (tokenMatch && isRepairIntent) {
      const rawToken = tokenMatch[0].toUpperCase();
      const searchToken = rawToken.startsWith('REP-') ? rawToken : `REP-${rawToken}`;
      const repair = allRepairs.find(r => r.token_number && r.token_number.toUpperCase() === searchToken) ||
                     (customerPhone ? allRepairs.find(r => r.customer_phone && r.customer_phone.replace(/\D/g, '').includes(customerPhone.replace(/\D/g, '').slice(-7))) : null);

      if (repair) {
        const stageMap = {
          'RECEIVED': isUrdu ? '1/4 دکان پر موصول ہو چکا ہے (Received)' : '1/4 Received at Center',
          'DIAGNOSING': isUrdu ? '2/4 انجینئر ٹیسٹ کر رہا ہے (Under Bench Diagnosis)' : '2/4 Under Bench Diagnosis',
          'IN_PROGRESS': isUrdu ? '3/4 پرزہ جات کی تبدیلی جاری ہے (Component Replacement in Progress)' : '3/4 Component Replacement in Progress',
          'READY_FOR_PICKUP': isUrdu ? '4/4 مکمل تیار ہے! آکر لے جائیں (Ready for Pickup / Delivery)' : '4/4 Ready for Pickup / Delivery'
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
          return `🔍 *${businessName} رپیر ٹریکنگ رپورٹ:*
📋 ٹوکن نمبر: *${repair.token_number}*
🛠️ ڈیوائس / آئٹم: *${repair.item_name}*
⚠️ رپورٹ کردہ خرابی: ${repair.issue_reported}
📊 موجودہ سٹیٹس: *${stageMap[repair.status] || repair.status}*
💰 تخمینہ خرچہ: *Rs. ${repair.estimated_cost.toLocaleString()}* (${repair.warranty_days} دن کی سروس وارنٹی شامل)
👨‍🔧 ٹیکنیشن ریمارکس: "${repair.technician_notes}"

${repair.status === 'READY_FOR_PICKUP' ? '✅ *آپ کی ڈیوائس مکمل ٹیسٹ ہو کر تیار ہے!* برائے مہربانی رسید لے کر دکان تشریف لائیں یا ہوم ڈلیوری کیلئے بتائیں۔' : '⏳ ہمارے چیف انجینئر آپ کی ڈیوائس پر کام کر رہے ہیں۔ جیسے ہی ٹیسٹنگ مکمل ہوگی آپ کو اطلاع مل جائے گی۔'}<!-- REPAIR_DATA: ${repairCard} -->`;
        }

        return `🔍 *${businessName} Official Repair Tracking:*
📋 Token Number: *${repair.token_number}*
🛠️ Item: *${repair.item_name}*
⚠️ Reported Fault: ${repair.issue_reported}
📊 Current Status: *${stageMap[repair.status] || repair.status}*
💰 Estimated Bill: *Rs. ${repair.estimated_cost.toLocaleString()}* (${repair.warranty_days}-Day Service Warranty Included)
👨‍🔧 Technician Notes: "${repair.technician_notes}"

${repair.status === 'READY_FOR_PICKUP' ? '✅ *Your device is fully repaired, bench-tested, and ready for pickup!* Please bring your receipt to the shop or reply here for courier dispatch.' : '⏳ Our engineers are currently working on your device. We will update you as soon as testing is complete.'}<!-- REPAIR_DATA: ${repairCard} -->`;
      }
    }

    // =========================================================================
    // 2. CONVERSATIONAL ORDER PLACEMENT (Strict Category & Brand Resolution)
    // =========================================================================
    const isOrderIntent = qLower.includes('order') || qLower.includes('buy') || qLower.includes('purchase') ||
                          qLower.includes('kharidna') || qLower.includes('mangwana') || qLower.includes('checkout') ||
                          qLower.includes('bhejo') || qLower.includes('deliver kro') || qLower.includes('chahiye lena');

    if (isOrderIntent && (qLower.includes('now') || qLower.includes('please') || qLower.includes('this') ||
                          qLower.includes('deliver') || qLower.includes('ac') || qLower.includes('bike') ||
                          qLower.includes('ebike') || qLower.includes('oven') || qLower.includes('fridge') ||
                          qLower.includes('tv') || qLower.includes('washing') || qLower.includes('protector') ||
                          qLower.includes('lahore') || qLower.includes('house') || qLower.includes('street'))) {

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
      } else if (qLower.includes('washing') || qLower.includes('machine')) {
        candidatePool = allProducts.filter(p => p.category === 'Household Electronics');
      } else if (qLower.includes('protector') || qLower.includes('surge')) {
        candidatePool = allProducts.filter(p => p.category === 'Accessories');
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
      const nameMatch = query.match(/(?:my name is|name is|i am|name:|mera naam)\s+([a-zA-Z\s.]+?)(?:,|\band\b|deliver|\.|$)/i);
      if (nameMatch && nameMatch[1].trim().length > 2) {
        finalCustomerName = nameMatch[1].trim();
      }

      const addressKeywords = ['house', 'street', 'sector', 'block', 'phase', 'dha', 'lahore', 'gulberg', 'model town', 'johar town', 'road', 'flat', 'plaza', 'wapda', 'cantt'];
      const hasAddress = addressKeywords.some(k => qLower.includes(k));
      let finalAddress = 'Gulberg III, Main Market, Lahore';

      if (hasAddress || qLower.includes('deliver') || qLower.includes('order')) {
        const addrMatch = query.match(/(?:deliver to|deliver at|address is|address:|at|mera address)\s+(.+?)(?:\.|$)/i);
        if (addrMatch && addrMatch[1].trim().length > 5) {
          finalAddress = addrMatch[1].trim();
        }

        const orderCode = `ZP-ORD-${Math.floor(1000 + Math.random() * 9000)}`;

        if (targetProduct.stock_quantity > 0) {
          db.update('products', targetProduct.id, { stock_quantity: targetProduct.stock_quantity - 1 });
        }

        db.insert('orders', {
          id: uuidv4(),
          order_code: orderCode,
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
          extracted_details: JSON.stringify({ order_code: orderCode, item: targetProduct.title, amount: targetProduct.price, phone: customerPhone })
        });

        const orderCard = JSON.stringify({
          type: 'order',
          order_code: orderCode,
          product_title: targetProduct.title,
          amount: targetProduct.price,
          payment: 'Cash on Delivery (COD)',
          status: 'CONFIRMED',
          address: finalAddress
        });

        if (isUrdu) {
          return `🎉 *مبارک ہو! آپ کا آرڈر کامیابی سے بک ہو گیا ہے!*
📦 آرڈر کوڈ: *${orderCode}*
👤 کسٹمر کا نام: *${finalCustomerName}*
🛒 پروڈکٹ: *${targetProduct.title}*
💰 کل رقم: *Rs. ${targetProduct.price.toLocaleString()}* (کیش آن ڈلیوری / COD)
📍 ڈلیوری ایڈریس: *${finalAddress}*
🚚 ترسیل کا وقت: *24 سے 48 گھنٹے* (لاہور میں فری ڈلیوری + آفیشل کمپنی وارنٹی کارڈ)

ہماری ڈسپیچ ٹیم روانگی سے قبل آپ کے نمبر ${customerPhone} پر کال کرے گی۔ ${businessName} کا انتخاب کرنے کا شکریہ!<!-- ORDER_DATA: ${orderCard} -->`;
        }

        return `🎉 *CONGRATULATIONS! YOUR ORDER IS CONFIRMED!*
📦 Order ID: *${orderCode}*
👤 Customer Name: *${finalCustomerName}*
🛒 Item: *${targetProduct.title}*
💰 Total Amount: *Rs. ${targetProduct.price.toLocaleString()}* (Cash on Delivery)
📍 Delivery Address: *${finalAddress}*
🚚 Estimated Delivery: *24 to 48 Hours* across Lahore with official brand warranty & testing seal!

Our dispatch team will confirm by phone at ${customerPhone} before delivery. Thank you for choosing ${businessName}!<!-- ORDER_DATA: ${orderCard} -->`;
      }
    }

    // =========================================================================
    // 3. PRODUCT CARDS APPENDAGE (Recommendations & Inquiries)
    // =========================================================================
    let cardsJson = null;
    const isRecommendationIntent = qLower.includes('recommend') || qLower.includes('suggest') || qLower.includes('best') ||
                                  qLower.includes('under') || qLower.includes('below') || qLower.includes('budget') ||
                                  qLower.includes('chahiye') || qLower.includes('price') || qLower.includes('stock') ||
                                  qLower.includes('rate') || qLower.includes('kitne ka') || qLower.includes('bikna') ||
                                  qLower.includes('sasta') || qLower.includes('available');

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
    } else if (qLower.includes('wash') || qLower.includes('machine')) {
      matchingCategoryProducts = allProducts.filter(p => p.category === 'Household Electronics');
    } else if (qLower.includes('protector') || qLower.includes('surge') || qLower.includes('voltage')) {
      matchingCategoryProducts = allProducts.filter(p => p.category === 'Accessories');
    }

    if (isRecommendationIntent && matchingCategoryProducts.length > 0) {
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
    // 4. LIVE GOOGLE GEMINI FLASH INTELLIGENCE ENGINE (If connected & online)
    // =========================================================================
    const catalogSummary = allProducts.map(p =>
      `- [${p.category}] ${p.title} | Price: Rs. ${p.price.toLocaleString()} | Stock: ${p.stock_quantity} units | Specs: ${Array.isArray(p.specs) ? p.specs.join(', ') : p.specs}`
    ).join('\n');

    const systemPrompt = `You are WhatsAssist AI, the official, intelligent, friendly, and expert Customer Resolution Agent for "${businessName}" (ZepTech Smart Electronics & E-Mobility Store) located at Shop #14, Main Market, Gulberg III, Lahore, Pakistan.
Founder & Lead Engineer: Muhammad Ahmad Khan (24-ST-027), BS Software Engineering Technology, PTUT Lahore.
Store Timings: Monday to Saturday 10:00 AM - 10:00 PM, Sunday 2:00 PM - 10:00 PM.
Contact Phone: +92 300 1234567. Delivery: Free Cash on Delivery (COD) within 24-48 hours in Lahore. Nationwide courier delivery available.
Warranties:
- 3-Year motor & 1-Year lithium battery on E-Bikes
- 10-Year compressor warranty on Inverter ACs & Refrigerators
- 2-Year magnetron on Microwave & Convection Ovens
- 30-Day satisfaction warranty on all repair & maintenance services.

LIVE STORE INVENTORY:
${catalogSummary}

RAG KNOWLEDGE ASSETS:
${activeContext || 'All standard ZepTech verified operating procedures and manuals apply.'}

CORE BEHAVIOR INSTRUCTIONS:
1. Always answer the specific question asked directly, accurately, and politely.
2. If the user asks in Urdu or Roman Urdu (e.g. "kya haal hai", "ac cooling nahi kar raha", "e-bike kitne ki hai"), reply in natural, fluent, friendly Roman Urdu.
3. If they ask in English, reply in polished, professional English.
4. For technical diagnostics (e.g. AC compressor tripping, microwave not heating, e-bike battery cut-off, fridge warm), give 2-3 step-by-step practical troubleshooting instructions.
5. For pricing and stock, quote the EXACT prices from the live inventory above.
6. To place an order, invite them to reply: "Order [Product Name], [Name], [Delivery Address in Lahore]" for instant Cash on Delivery confirmation.`;

    const liveAIResponse = await callLiveGemini(systemPrompt, query);

    if (liveAIResponse) {
      if (cardsJson) {
        return `${liveAIResponse}<!-- PRODUCT_CARDS: ${cardsJson} -->`;
      }
      return liveAIResponse;
    }

    // =========================================================================
    // 5. AUTONOMOUS INTELLIGENT EXPERT ENGINE (Offline / Local NLP Engine)
    // Runs when live Gemini API is offline, key is invalid, or without internet.
    // Answers every domain question in fluent Roman Urdu or English!
    // =========================================================================

    // A. Greetings & Conversational Politeness
    if (/^(salam|assalam|aoa|hello|hi|hey|kya haal|kaise ho|kese ho|good morning|good evening|adab)\b/i.test(qLower)) {
      if (isUrdu) {
        return `و علیکم السلام! *${businessName}* (اسمارٹ الیکٹرانکس اینڈ ای-موبیلٹی) میں خوش آمدید! 👋
میں آپ کا AI کسٹمر اسسٹنٹ ہوں۔

ہم آپ کی درج ذیل معاملات میں مدد کر سکتے ہیں:
1. 🛵 *اسمارٹ الیکٹرک بائیکس* (Lithium Battery, 80km Range, زیرو پٹرول خرچہ)
2. ❄️ *ڈی سی انورٹر اے سی* (Gree Fairy اور Haier Puri - 60% بجلی بچت)
3. 🍲 *بیکنگ اینڈ مائیکرو ویو اوون* (Dawlance & Haier Convection)
4. 🧊 *ریفریجریٹر اور ایل ای ڈی ٹی وی* (4K UHD Smart Android)
5. 🔧 *ہارڈویئر ریپیر اور وارنٹی ٹریکنگ* (ٹوکن جیسے REP-101)
6. 🚚 *لاہور میں مفت کیش آن ڈلیوری (COD)*

آج ہم آپ کی کیا مدد کر سکتے ہیں؟`;
      }
      return `Hello and welcome to *${businessName} Smart Electronics & E-Mobility*! 👋
I am your WhatsAssist AI Assistant.

How can I help you today?
- 🛵 Explore **Smart E-Bikes** (70cc Lithium, 80km range, zero petrol cost)
- ❄️ Inquire about **DC Inverter ACs** (Gree Fairy & Haier Puri Inverter)
- 🍲 **Baking & Microwave Ovens** (Dawlance Convection & Grill)
- 🧊 **Refrigerators & 4K Smart Android TVs**
- 🛠️ Track an ongoing hardware repair (e.g. *REP-101*)
- 🚚 Order with free **Cash on Delivery (COD)** in Lahore!

What would you like to know?`;
    }

    // B. Identity, Owner & Project Background
    if (qLower.includes('who are you') || qLower.includes('kon ho') || qLower.includes('owner') ||
        qLower.includes('ahmad khan') || qLower.includes('fyp') || qLower.includes('ptut') || qLower.includes('bot ho')) {
      if (isUrdu) {
        return `میں *WhatsAssist AI* ہوں — *${businessName} اسمارٹ الیکٹرانکس* کا باضابطہ خودکار اسسٹنٹ۔
یہ جدید پراجیکٹ **محمد احمد خان (24-ST-027)** نے شعبہ سافٹ ویئر انجینئرنگ ٹیکنالوجی، **پنجاب تیانجن یونیورسٹی آف ٹیکنالوجی (PTUT) لاہور** میں تیار کیا ہے۔

ہمارا نظام ریئل واٹس ایپ، مصنوعی ذہانت (Google Gemini AI + RAG)، اور خودکار آرڈر و ریپیر ٹریکنگ کے ساتھ کام کرتا ہے۔ دکان مین مارکیٹ، گلبرگ III لاہور میں واقع ہے۔`;
      }
      return `I am *WhatsAssist AI*, the intelligent customer agent for *${businessName} Smart Electronics & E-Mobility*.
This enterprise solution was engineered by **Muhammad Ahmad Khan (24-ST-027)**, BS Software Engineering Technology at **Punjab Tianjin University of Technology (PTUT), Lahore**.

Our platform features live WhatsApp integration, Google Gemini Generative AI, Retrieval-Augmented Generation (RAG), and autonomous order/repair tracking.`;
    }

    // C. Store Location, Address, Directions & Timings
    if (qLower.includes('location') || qLower.includes('address') || qLower.includes('kahan') ||
        qLower.includes('where') || qLower.includes('shop') || qLower.includes('timing') ||
        qLower.includes('time') || qLower.includes('hours') || qLower.includes('khulta') || qLower.includes('band')) {
      if (isUrdu) {
        return `📍 *${businessName} دکان کا پتہ اور اوقات کار:*
🏢 پتہ: **شاپ نمبر 14، مین مارکیٹ، گلبرگ III، لاہور، پاکستان**
⏰ اوقات:
• پیر تا ہفتہ: **صبح 10:00 بجے سے رات 10:00 بجے تک**
• اتوار: **دوپہر 2:00 بجے سے رات 10:00 بجے تک**
📞 رابطہ نمبر: **+92 300 1234567**
🚚 ڈلیوری: پورے لاہور میں 24 سے 48 گھنٹے کے اندر فری کیش آن ڈلیوری (COD) دستیاب ہے۔ آپ تشریف بھی لا سکتے ہیں!`;
      }
      return `📍 *${businessName} Store Location & Operating Hours:*
🏢 Address: **Shop #14, Main Market, Gulberg III, Lahore, Pakistan**
⏰ Operating Hours:
• Monday – Saturday: **10:00 AM to 10:00 PM**
• Sunday: **2:00 PM to 10:00 PM**
📞 Contact: **+92 300 1234567**
🚚 Delivery: Free 24-48 hour Cash on Delivery across Lahore. You are always welcome to visit our experience center!`;
    }

    // D. Delivery, Shipping, COD & Payment Methods
    if (qLower.includes('delivery') || qLower.includes('charges') || qLower.includes('cod') ||
        qLower.includes('payment') || qLower.includes('jazzcash') || qLower.includes('easypaisa') ||
        qLower.includes('bank') || qLower.includes('installment') || qLower.includes('qist')) {
      if (isUrdu) {
        return `🚚 *ڈلیوری اور پیمنٹ کی معلومات:*
1. **لاہور میں ترسیل:** تمام پروڈکٹس پر **فری کیش آن ڈلیوری (Free COD)** 24 سے 48 گھنٹے کے اندر کی جاتی ہے۔
2. **دیگر شہر:** ٹی سی ایس (TCS) اور لیپرڈ کوریئر کے ذریعے 3-4 کاروباری دنوں میں بحفاظت ترسیل۔
3. **ادائیگی کے طریقے:**
   • کیش آن ڈلیوری (COD - سامان چیک کر کے پیسے دیں)
   • آن لائن بینک ٹرانسفر (Meezan / HBL / Bank Alfalah)
   • جاز کیش (JazzCash) اور ایزی پیسہ (EasyPaisa)
4. **آسان اقساط (Installments):** منتخب کریڈٹ کارڈز پر 0% مارک اپ کے ساتھ 3 سے 6 ماہ کی آسان اقساط دستیاب ہیں۔`;
      }
      return `🚚 *Delivery & Payment Options at ${businessName}:*
1. **Free Cash on Delivery (COD):** Available across Lahore within 24-48 hours. Inspect before you pay!
2. **Nationwide Shipping:** Dispatched via insured TCS/Leopard courier across Pakistan (3-4 working days).
3. **Payment Methods:**
   • Cash on Delivery (COD)
   • Direct Bank Transfer (Meezan / HBL / Bank Alfalah)
   • JazzCash & EasyPaisa
4. **Easy Installment Plans (EMI):** 3 to 6-month installment plans available on major credit cards with 0% markup at our store.`;
    }

    // E. Warranty, Guarantee & Returns
    if (qLower.includes('warranty') || qLower.includes('guarantee') || qLower.includes('return') ||
        qLower.includes('claim') || qLower.includes('policy')) {
      if (isUrdu) {
        return `🛡️ *${businessName} وارنٹی اور ریٹرن پالیسی:*
1. 🛵 **ای-بائیکس:** 3 سال موٹر وارنٹی اور 1 سال لتھیم بیٹری کی آفیشل وارنٹی۔
2. ❄️ **انورٹر اے سی اور فریج:** 10 سال کمپریسر اور 1 سال کٹ وارنٹی۔
3. 🍲 **مائیکروویو اور اوون:** 2 سال میگنیٹران (Magnetron) وارنٹی۔
4. 🔧 **تمام ریپیر سروسز:** 30 دن کی اطمینان بخش منی بیک سروس وارنٹی۔
5. 🔄 **7 دن کی ریپلیسمنٹ:** اگر پروڈکٹ میں کوئی مینوفیکچرنگ خرابی ہو تو 7 دن میں بل اور باکس کے ساتھ تبدیل کی جا سکتی ہے۔`;
      }
      return `🛡️ *${businessName} Official Warranty & Guarantee Policies:*
1. 🛵 **Smart E-Bikes:** 3-Year motor warranty & 1-Year lithium battery warranty.
2. ❄️ **Inverter ACs & Refrigerators:** 10-Year compressor warranty & 1-Year PCB circuit warranty.
3. 🍲 **Microwave & Convection Ovens:** 2-Year magnetron heating warranty.
4. 🔧 **All Repair Services:** 30-Day unconditional service guarantee.
5. 🔄 **7-Day Return/Exchange:** Defective items with original packaging can be replaced within 7 days.`;
    }

    // F. Technical Support: AC Troubleshooting (Not cooling, tripping, gas, filters)
    const isAcFault = (qLower.includes('ac') || qLower.includes('cooling') || qLower.includes('split') || qLower.includes('air conditioner')) &&
                      (qLower.includes('not cooling') || qLower.includes('cooling nahi') || qLower.includes('cooling ni') ||
                       qLower.includes('thanda nahi') || qLower.includes('thanda ni') || qLower.includes('thandi nahi') || qLower.includes('thandi ni') ||
                       qLower.includes('trip') || qLower.includes('leak') || qLower.includes('error') || qLower.includes('fault') ||
                       qLower.includes('cooling kam') || qLower.includes('gas') || qLower.includes('chalta nahi') || qLower.includes('chalta ni'));

    if (isAcFault) {
      if (isUrdu) {
        return `❄️ *انورٹر اے سی کولنگ نہ کرنے پر رہنمائی (Technical Diagnostics):*
اگر آپ کا اے سی چل رہا ہے لیکن ٹھنڈی ہوا نہیں دے رہا تو یہ 4 بنیادی اقدامات کریں:
1. **فلٹر چیک کریں:** انڈور یونٹ کا فرنٹ پینل کھول کر دونوں ایئر فلٹرز نیم گرم پانی سے دھوئیں (گرد سے ہوا بلاک ہو جاتی ہے)۔
2. **ریموٹ سیٹنگ:** یقینی بنائیں کہ ریموٹ **COOL موڈ** پر ہے اور ٹمپریچر 24°C یا 22°C سیٹ ہے (FAN یا DRY موڈ پر نہ ہو)۔
3. **آؤٹ ڈور کمپریسر چیک کریں:** 3 منٹ بعد چیک کریں کہ باہر والا فین اور کمپریسر چل رہا ہے۔ اگر کمپریسر ٹرپ کر رہا ہے تو کیپیسیٹر یا وولٹیج کا مسئلہ ہے۔
4. **گیس کا معائنہ:** اگر پائپوں پر برف (Frost) جم رہی ہو تو ریفریجرینٹ گیس لیک ہو سکتی ہے۔

🔧 اگر مسئلہ حل نہ ہو تو ہمارا مستند ٹیکنیشن آپ کے گھر آ کر مکمل تسلی کے ساتھ چیک کر سکتا ہے۔ ریپیر بک کرنے کیلئے رابطہ کریں۔`;
      }
      return `❄️ *Inverter AC Diagnostic & Troubleshooting Guide:*
If your AC runs but is not cooling effectively, follow these 4 engineering troubleshooting steps:
1. **Clean Air Filters:** Open the indoor panel and wash both filters. Blocked filters reduce airflow by over 60%.
2. **Verify Remote Mode:** Ensure your remote is set to **COOL mode** (snowflake icon) at 24°C or 22°C, not FAN or DRY mode.
3. **Inspect Outdoor Unit:** Check if the outdoor compressor hums and fan spins. If it hums and clicks off, the run capacitor or PCB board requires bench testing.
4. **Check for Frost/Ice:** Frost on the thin copper pipe indicates refrigerant gas leakage or an expansion valve blockage.

🔧 ZepTech offers certified home technician visits across Lahore with a 30-day service warranty. Reply here to schedule an inspection!`;
    }

    // G. Technical Support: Microwave Oven Troubleshooting (Not heating, sparking)
    const isOvenFault = (qLower.includes('oven') || qLower.includes('microwave') || qLower.includes('micro wave')) &&
                        (qLower.includes('garam') || qLower.includes('heat') || qLower.includes('spark') ||
                         qLower.includes('blast') || qLower.includes('awaz') || qLower.includes('plate') ||
                         qLower.includes('kharab') || qLower.includes('shola'));

    if (isOvenFault) {
      if (isUrdu) {
        return `🍲 *مائیکروویو اوون گرم نہ کرنے کی وجوہات اور حل:*
1. **میگنیٹران (Magnetron) کی کمزوری:** اگر اوون روشن ہے اور گھوم رہا ہے مگر کھانا ٹھنڈا رہتا ہے تو ہائی وولٹیج ڈائیوڈ (Diode) یا میگنیٹران جل چکا ہے۔
2. **ہائی وولٹیج فیوز:** اندرونی پروٹیکشن فیوز اڑ جانے سے ہیٹنگ مکمل بند ہو جاتی ہے۔
3. **اندر چنگاریاں (Sparking):** اندر والی میکا شیٹ (Mica Waveguide Cover) پر چکنائی لگنے سے اسپارک پیدا ہوتا ہے۔ اسے صاف کریں یا 300 روپے میں تبدیل کرائیں۔

⚠️ *اہم احتیاط:* مائیکروویو کو خود نہ کھولیں کیونکہ کپیسیٹر میں 2000 وولٹ سے زیادہ کرنٹ محفوظ ہوتا ہے۔ ہماری ورکشاپ لائیں، 30 منٹ میں ڈائیگنوس ہو جائے گا!`;
      }
      return `🍲 *Microwave Oven Not Heating - Troubleshooting Steps:*
1. **Failed Magnetron or Diode:** If the timer runs and turntable rotates but food stays cold, the high-voltage diode or magnetron tube has failed.
2. **Blown High-Voltage Fuse:** Power surges frequently trip the internal 5kV protection fuse.
3. **Internal Sparking:** Arcing occurs when food residue accumulates on the Mica waveguide cover sheet on the right inner wall. Replace the mica sheet immediately.

⚠️ *Safety Warning:* Never disassemble a microwave oven yourself. The high-voltage capacitor stores over 2,000V even when unplugged. Bring it to ZepTech for safe 30-minute diagnosis!`;
    }

    // H. Technical Support: E-Bike Battery & Mileage (Range, charging, battery drain)
    if ((qLower.includes('bike') || qLower.includes('ebike') || qLower.includes('battery')) &&
        (qLower.includes('range') || qLower.includes('km') || qLower.includes('charge') ||
         qLower.includes('drain') || qLower.includes('speed') || qLower.includes('chalti'))) {
      if (isUrdu) {
        return `🛵 *زیپ ٹیک تھنڈر ای-بائیک (ZepTech Thunder E-Bike) کی خصوصیات:*
• **ایک چارج پر مائلیج:** **70 سے 80 کلومیٹر** حقیقی رینج (لاہور کے روڈز پر تصدیق شدہ)
• **بیٹری ٹیکنالوجی:** **60V / 24Ah Grade-A Lithium-ion** (3 سال لائف سائیکل)
• **چارجنگ کا وقت:** عام 220V ساکٹ پر **3.5 سے 4 گھنٹے** میں فل چارج
• **ٹاپ اسپیڈ:** **60 کلومیٹر فی گھنٹہ** (3 اسپیڈ موڈز: Eco, Normal, Sports)
• **خرچہ بچت:** صرف **0.70 روپے فی کلومیٹر**، جبکہ 70cc پٹرول بائیک کا خرچہ 7-8 روپے فی کلومیٹر ہے۔ آپ ماہانہ **15,000 سے 20,000 روپے** پٹرول بچا سکتے ہیں!
• **قیمت:** **Rs. 145,000** (کیش آن ڈلیوری اور ٹیسٹ رائیڈ دستیاب)`;
      }
      return `🛵 *ZepTech Thunder 70cc E-Bike Technical Performance:*
• **Range per Full Charge:** **70 to 80 km** real-world range across urban driving conditions.
• **Battery Specification:** **60V / 24Ah Grade-A Lithium-ion** with intelligent BMS protection.
• **Charging Time:** **3.5 to 4 hours** on a standard household 220V wall socket.
• **Top Speed:** **60 km/h** with 3 digital speed governors (Eco, Normal, Sport).
• **Cost Comparison:** Running cost is only **Rs. 0.70/km** vs **Rs. 7.50/km** for petrol 70cc bikes — saving over **Rs. 18,000 every month**!
• **Price:** **Rs. 145,000** with a 3-Year motor & 1-Year battery replacement warranty.`;
    }

    // I. Product Pricing & Specific Model Inquiries
    if (matchingCategoryProducts.length > 0) {
      const topP = matchingCategoryProducts[0];
      if (isUrdu) {
        const specsText = Array.isArray(topP.specs) ? topP.specs.join(', ') : topP.specs;
        const reply = `🛒 *${businessName} پروڈکٹ کی تفصیل:*
🏷️ آئٹم: *${topP.title}*
📂 کیٹیگری: ${topP.category}
💰 قیمت: *Rs. ${topP.price.toLocaleString()}*
📦 اسٹاک: *${topP.stock_quantity > 0 ? `${topP.stock_quantity} یونٹس دستیاب ہیں` : 'اسٹاک ختم (اگلے 2 دن میں آرڈر پر دستیاب)'}*
⚡ خصوصیات: ${specsText}

آرڈر کرنے کیلئے اپنا نام اور پتہ لکھ کر بھیجیں، کیش آن ڈلیوری کے ساتھ بھیج دیا جائے گا!`;
        return cardsJson ? `${reply}<!-- PRODUCT_CARDS: ${cardsJson} -->` : reply;
      }

      const specsText = Array.isArray(topP.specs) ? topP.specs.join(', ') : topP.specs;
      const reply = `🛒 *${businessName} Product Information:*
🏷️ Model: *${topP.title}*
📂 Category: ${topP.category}
💰 Price: *Rs. ${topP.price.toLocaleString()}*
📦 In-Stock Status: *${topP.stock_quantity > 0 ? `${topP.stock_quantity} units available` : 'Restocking in 48 hours'}*
⚡ Specifications: ${specsText}

Reply with *"Order ${topP.title}, [Your Name], [Delivery Address in Lahore]"* for instant Cash on Delivery confirmation!`;
      return cardsJson ? `${reply}<!-- PRODUCT_CARDS: ${cardsJson} -->` : reply;
    }

    // J. RAG Document Ingestion Fallback
    if (activeContext && activeContext.length > 20) {
      if (isUrdu) {
        return `ہمارے ریکارڈز کے مطابق:\n\n${activeContext}\n\nمزید کسی تفصیل، آرڈر یا رہنمائی کیلئے ہمیں ضرور بتائیں۔ ہم آپ کی خدمت کیلئے حاضر ہیں!`;
      }
      return `According to our store knowledge base:\n\n${activeContext}\n\nLet us know if you need additional details, technical advice, or order placement assistance!`;
    }

    // K. Intelligent General Conversational Response
    if (isUrdu) {
      return `آپ کے سوال کا شکریہ! *${businessName} اسمارٹ الیکٹرانکس* پر ہمارے پاس درج ذیل کیٹیگریز دستیاب ہیں:
1. 🛵 **الیکٹرک بائیکس (E-Bikes):** زیرو پٹرول، 80km رینج (Rs. 98,000 سے 145,000)
2. ❄️ **انورٹر اے سی (Inverter ACs):** Gree & Haier 1.5 ٹن اور 1 ٹن T3 ٹروپیکل (Rs. 138,000 سے 154,000)
3. 🍲 **بیکنگ اینڈ مائیکرو ویو اوون:** Dawlance & Haier Convection (Rs. 32,000 سے 38,500)
4. 🧊 **ریفریجریٹرز اور 4K اسمارٹ ایل ای ڈیز:** Samsung & TCL Smart Android
5. 🔧 **ریپیر سروسز اور ہوم وزٹ:** کسی بھی ڈیوائس کی مرمت اور وارنٹی چیکنگ

آپ کسی بھی پروڈکٹ کا نام لکھ کر اس کی قیمت یا تفصیل معلوم کر سکتے ہیں، یا ریپیر ٹوکن (جیسے REP-101) چیک کر سکتے ہیں۔`;
    }

    return `Thank you for reaching out to *${businessName} Smart Electronics & E-Mobility*!
We specialize in:
1. 🛵 **Smart E-Bikes:** 70-80 km lithium range, zero fuel expense (Rs. 98,000 – 145,000)
2. ❄️ **DC Inverter ACs:** Gree Fairy & Haier Puri T3 Inverters (Rs. 138,000 – 154,000)
3. 🍲 **Convection & Baking Microwave Ovens:** Dawlance & Haier (Rs. 32,000 – 38,500)
4. 🧊 **Inverter Refrigerators & 4K Smart Android TVs:** Dawlance, Samsung & TCL
5. 🔧 **Hardware Repair Diagnostics:** Check token status (e.g. *REP-101*) or schedule technician home visits
6. 🚚 **Free Cash on Delivery (COD) across Lahore!**

Please let us know which product model or service you would like details on!`;
  }
};

module.exports = geminiService;
