/**
 * WhatsAssist - Electronics Catalog, Orders, and Repairs Seeder
 * Populates ZepTech inventory with laptops, ACs, refrigerators, TVs, and repairs.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

const { db } = require('./database');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

function seedElectronicsData() {
  let merchant = db.findOne('merchants', m => m.email === 'ranaahmadkhan.112211@gmail.com');
  if (!merchant) {
    merchant = db.insert('merchants', {
      id: '1c8b9736-ad03-4251-bacf-1e1bff38fd00',
      business_name: 'ZepTech',
      name: 'Muhammad Ahmad Khan',
      email: 'ranaahmadkhan.112211@gmail.com',
      password_hash: bcrypt.hashSync('admin123', 12),
      phone_number: '+923314228724',
      business_category: 'Electronics, E-Bikes & Household Appliances',
      role: 'owner',
      is_active: 1
    });
  }

  let customer = db.findOne('merchants', m => m.email === 'customer@zeptech.pk');
  if (!customer) {
    db.insert('merchants', {
      id: 'cust-demo-1001-uuid-zeptech',
      business_name: 'Hamza Malik (Customer)',
      name: 'Hamza Malik',
      email: 'customer@zeptech.pk',
      password_hash: bcrypt.hashSync('customer123', 12),
      phone_number: '+92 300 9876543',
      business_category: 'Customer',
      role: 'customer',
      is_active: 1
    });
  }

  const merchantId = merchant.id;

  // 1. Seed Products if empty or sparse
  const existingProducts = db.findAll('products', p => p.merchant_id === merchantId);
  if (existingProducts.length < 5) {
    const productsToSeed = [
      {
        id: uuidv4(),
        merchant_id: merchantId,
        title: 'HP EliteBook 840 G6 (Core i5 8th Gen, 16GB, 256GB SSD)',
        category: 'Laptops',
        price: 68000,
        stock_quantity: 6,
        specs: ['Core i5 8th Gen', '16GB DDR4 RAM', '256GB NVMe SSD', '14" FHD IPS', 'Backlit Keyboard'],
        description: 'Pristine condition enterprise laptop. Ideal for computer science students, coding, programming, and office productivity. Includes 1-month warranty.',
        image_icon: '💻',
        inquiry_count: 54,
        is_featured: true
      },
      {
        id: uuidv4(),
        merchant_id: merchantId,
        title: 'Dell Latitude 7490 (Core i5 8th Gen, 8GB, 256GB SSD)',
        category: 'Laptops',
        price: 58000,
        stock_quantity: 4,
        specs: ['Core i5 8th Gen', '8GB DDR4 RAM', '256GB SSD', '14" FHD Anti-Glare', 'Type-C Thunderbolt'],
        description: 'Durable lightweight carbon-fiber laptop with long battery life. Perfect for programming on budget.',
        image_icon: '💻',
        inquiry_count: 38,
        is_featured: false
      },
      {
        id: uuidv4(),
        merchant_id: merchantId,
        title: 'Lenovo Legion 5 (Ryzen 7 4800H, 16GB, 512GB SSD, GTX 1650Ti)',
        category: 'Laptops',
        price: 135000,
        stock_quantity: 2, // Low stock
        specs: ['AMD Ryzen 7 4800H', '16GB RAM', '512GB NVMe SSD', '4GB GTX 1650Ti', '120Hz IPS Display'],
        description: 'High-performance gaming, 3D rendering, video editing, and machine learning workstation.',
        image_icon: '🎮',
        inquiry_count: 72,
        is_featured: true
      },
      {
        id: uuidv4(),
        merchant_id: merchantId,
        title: 'Haier 1.5 Ton DC Inverter AC (HSU-18HFT / Heating & Cooling)',
        category: 'Air Conditioners',
        price: 142000,
        stock_quantity: 5,
        specs: ['1.5 Ton T-3 Tropicalized', 'Self-Cleaning', 'Heating & Cooling', '66% Energy Saving', '10-Yr Warranty'],
        description: 'Brand new Haier Pakistan official inverter AC. Extreme cooling up to 55°C ambient temperature.',
        image_icon: '❄️',
        inquiry_count: 89,
        is_featured: true
      },
      {
        id: uuidv4(),
        merchant_id: merchantId,
        title: 'Gree 1.5 Ton Fairy Inverter AC (GWH-18QD / Ultra Silent)',
        category: 'Air Conditioners',
        price: 154000,
        stock_quantity: 3,
        specs: ['1.5 Ton Inverter', 'Curved Minimalist Design', 'Eco R410A', 'Fire-Proof Electric Box', 'WiFi Control'],
        description: 'Top-tier Gree inverter with ultra-quiet 18dB sleep mode and rapid turbo cooling.',
        image_icon: '❄️',
        inquiry_count: 64,
        is_featured: false
      },
      {
        id: uuidv4(),
        merchant_id: merchantId,
        title: 'Dawlance 9170 WB Chrome Inverter Refrigerator (14 Cu. Ft)',
        category: 'Refrigerators',
        price: 88000,
        stock_quantity: 1, // Low stock alert!
        specs: ['14 Cu. Ft', 'Inverter Technology', '5-Way Fast Cooling', 'Anti-Fungal Removable Gasket', 'Low Voltage 135V'],
        description: 'Ultra energy-efficient refrigerator, cuts electricity bills by 55%. 12-year compressor warranty.',
        image_icon: '🧊',
        inquiry_count: 41,
        is_featured: true
      },
      {
        id: uuidv4(),
        merchant_id: merchantId,
        title: 'Samsung 55" Crystal UHD 4K Smart TV (CU7000)',
        category: 'LED TVs',
        price: 118000,
        stock_quantity: 4,
        specs: ['55 Inch 4K UHD', 'HDR10+', 'Crystal Processor 4K', 'Tizen OS', 'Wireless DeX / AirPlay'],
        description: 'Cinema-grade 4K resolution with vibrant colors, voice remote, and built-in Netflix/YouTube.',
        image_icon: '📺',
        inquiry_count: 51,
        is_featured: true
      },
      {
        id: uuidv4(),
        merchant_id: merchantId,
        title: 'EcoStar 43" Smart Android LED TV (Frameless)',
        category: 'LED TVs',
        price: 52000,
        stock_quantity: 7,
        specs: ['43 Inch Full HD', 'Official Android TV 11', 'Dolby Digital Sound', 'Chromecast Built-in'],
        description: 'Budget-friendly family entertainment with certified Google Play Store access.',
        image_icon: '📺',
        inquiry_count: 33,
        is_featured: false
      },
      {
        id: uuidv4(),
        merchant_id: merchantId,
        title: 'Logitech MX Master 3S Wireless Performance Mouse',
        category: 'Accessories',
        price: 24500,
        stock_quantity: 8,
        specs: ['8K DPI Glass Tracking', 'Quiet Clicks', 'USB-C Fast Recharge', 'MagSpeed Electromagnetic Scroll'],
        description: 'The industry-standard productivity mouse for programmers, designers, and power users.',
        image_icon: '🖱️',
        inquiry_count: 22,
        is_featured: false
      },
      {
        id: uuidv4(),
        merchant_id: merchantId,
        title: 'Apple 20W USB-C Fast Power Adapter (Original Retail Pack)',
        category: 'Accessories',
        price: 4800,
        stock_quantity: 15,
        specs: ['20W Power Delivery', 'Fast Charging 0-50% in 30 mins', 'Over-Voltage Protection'],
        description: '100% genuine Apple original retail box pack with 6 months replacement warranty.',
        image_icon: '🔌',
        inquiry_count: 19,
        is_featured: false
      }
    ];

    productsToSeed.forEach(p => db.insert('products', p));
    console.log(`✅ [Seed] Seeded ${productsToSeed.length} electronics products into ZepTech catalog.`);
  }

  // 2. Seed Orders if empty
  const existingOrders = db.findAll('orders', o => o.merchant_id === merchantId);
  if (existingOrders.length === 0) {
    const ordersToSeed = [
      {
        id: uuidv4(),
        order_code: 'ZP-ORD-1001',
        merchant_id: merchantId,
        customer_name: 'Dr. Hamza Sheikh',
        customer_phone: '+923335551234',
        delivery_address: 'House 14-B, Sector G, DHA Phase 5, Lahore',
        items: [
          {
            title: 'Haier 1.5 Ton DC Inverter AC (HSU-18HFT)',
            price: 142000,
            quantity: 1
          }
        ],
        total_amount: 142000,
        order_status: 'DELIVERED',
        payment_method: 'Cash on Delivery (COD)',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        id: uuidv4(),
        order_code: 'ZP-ORD-1002',
        merchant_id: merchantId,
        customer_name: 'Usman Tariq',
        customer_phone: '+923214567890',
        delivery_address: 'Plaza #4, Main Boulevard, Gulberg III, Lahore',
        items: [
          {
            title: 'HP EliteBook 840 G6 (Core i5 8th Gen, 16GB, 256GB SSD)',
            price: 68000,
            quantity: 1
          }
        ],
        total_amount: 68000,
        order_status: 'DISPATCHED',
        payment_method: 'Cash on Delivery (COD)',
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: uuidv4(),
        order_code: 'ZP-ORD-1003',
        merchant_id: merchantId,
        customer_name: 'Ayesha Khan',
        customer_phone: '+923009876543',
        delivery_address: 'Street 9, Model Town C-Block, Lahore',
        items: [
          {
            title: 'Apple 20W USB-C Fast Power Adapter (Original)',
            price: 4800,
            quantity: 2
          }
        ],
        total_amount: 9600,
        order_status: 'CONFIRMED',
        payment_method: 'Cash on Delivery (COD)',
        created_at: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ];

    ordersToSeed.forEach(o => db.insert('orders', o));
    console.log(`✅ [Seed] Seeded ${ordersToSeed.length} sample WhatsApp orders.`);
  }

  // 3. Seed Repairs & Warranty Tokens if empty
  const existingRepairs = db.findAll('repairs', r => r.merchant_id === merchantId);
  if (existingRepairs.length === 0) {
    const repairsToSeed = [
      {
        id: uuidv4(),
        token_number: 'REP-101',
        merchant_id: merchantId,
        customer_name: 'Usman Tariq',
        customer_phone: '+923214567890',
        item_name: 'Gree 1.5 Ton Split AC Inverter PCB Board',
        issue_reported: 'Compressor tripping error E7 / no power on outdoor card',
        status: 'READY_FOR_PICKUP',
        estimated_cost: 3500,
        warranty_days: 30,
        technician_notes: 'Replaced primary filtering capacitor and relay switch. Burn-in tested for 2 hours under full 12A load. Ready for collection!',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 3).toISOString()
      },
      {
        id: uuidv4(),
        token_number: 'REP-102',
        merchant_id: merchantId,
        customer_name: 'Dr. Hamza Sheikh',
        customer_phone: '+923335551234',
        item_name: 'Dell Latitude 5490 Laptop',
        issue_reported: 'Charging port loose / intermittent boot / thermal shutdown',
        status: 'IN_PROGRESS',
        estimated_cost: 4500,
        warranty_days: 30,
        technician_notes: 'Replaced internal DC jack harness. Thermal paste refreshed with Arctic MX-4. Currently undergoing motherboard diagnostics.',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        token_number: 'REP-103',
        merchant_id: merchantId,
        customer_name: 'Ayesha Khan',
        customer_phone: '+923009876543',
        item_name: 'Dawlance Chrome Inverter Refrigerator',
        issue_reported: 'Upper freezer compartment cooling fine, lower food section warm',
        status: 'DIAGNOSING',
        estimated_cost: 2500,
        warranty_days: 30,
        technician_notes: 'Inspecting evaporator fan motor and automated bi-metal defrost sensor.',
        created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    repairsToSeed.forEach(r => db.insert('repairs', r));
    console.log(`✅ [Seed] Seeded ${repairsToSeed.length} electronic repair tracking tokens.`);
  }
}

module.exports = { seedElectronicsData };
