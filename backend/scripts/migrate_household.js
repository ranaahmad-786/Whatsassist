const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, '../data/whatsassist_db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 1. Ensure merchant has role 'owner'
const zepTechMerchant = db.merchants.find(m => m.email === 'ranaahmadkhan.112211@gmail.com');
if (zepTechMerchant) {
  zepTechMerchant.role = 'owner';
  zepTechMerchant.name = 'Muhammad Ahmad Khan';
  zepTechMerchant.business_category = 'Electronics, E-Bikes & Household Appliances';
}

// 2. Add or ensure demo customer account
let demoCustomer = db.merchants.find(m => m.email === 'customer@zeptech.pk');
const customerHash = bcrypt.hashSync('customer123', 12);
if (!demoCustomer) {
  demoCustomer = {
    id: 'cust-demo-1001-uuid-zeptech',
    business_name: 'Hamza Malik (Customer)',
    name: 'Hamza Malik',
    email: 'customer@zeptech.pk',
    password_hash: customerHash,
    phone_number: '+92 300 9876543',
    business_category: 'Customer',
    role: 'customer',
    is_active: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.merchants.push(demoCustomer);
} else {
  demoCustomer.password_hash = customerHash;
  demoCustomer.role = 'customer';
  demoCustomer.name = 'Hamza Malik';
}

// 3. Replace all Laptop products with E-Bikes, Ovens & Household Electronics
const merchantId = zepTechMerchant ? zepTechMerchant.id : '1c8b9736-ad03-4251-bacf-1e1bff38fd00';

db.products = [
  {
    id: 'prod-ebike-thunder-01',
    merchant_id: merchantId,
    title: 'ZepTech Thunder E-Bike 70cc (Lithium 48V, 80km Range, Fast Charge)',
    category: 'E-Bikes',
    price: 145000,
    stock_quantity: 6,
    specs: [
      '48V 24Ah Lithium-Ion Battery',
      '80km Range Per Single Charge',
      '1000W BLDC Waterproof Motor',
      'Digital LCD Instrument Cluster',
      'Front Disc Brake & Alloy Wheels'
    ],
    description: 'High-efficiency smart electric bike. Zero petrol cost, 3-year motor warranty, silent commute for students and daily office workers.',
    image_icon: '🛵',
    inquiry_count: 88,
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-ebike-eco-02',
    merchant_id: merchantId,
    title: 'ZepTech Commuter E-Bike Eco (40km Range, Removable Battery)',
    category: 'E-Bikes',
    price: 98000,
    stock_quantity: 8,
    specs: [
      '36V 15Ah Removable Battery',
      '40km Range Per Charge',
      '500W Hub Motor',
      'Regenerative Braking',
      'Lightweight Alloy Frame'
    ],
    description: 'Affordable urban electric bike for city commuting. Fully charges in 3.5 hours on standard household 220V socket.',
    image_icon: '⚡',
    inquiry_count: 54,
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-oven-dawlance-03',
    merchant_id: merchantId,
    title: 'Dawlance DW-MD10 Convection & Baking Microwave Oven (30 Liters)',
    category: 'Ovens & Kitchen',
    price: 38500,
    stock_quantity: 10,
    specs: [
      '30L Large Capacity Cavity',
      'Convection Baking + Grill + Microwave',
      'Digital LED Touch Panel',
      'Auto Cook Pakistani Recipes',
      'Child Safety Lock'
    ],
    description: 'Multi-function digital microwave oven with convection baking. Perfect for pizza, cakes, baking, defrosting, and quick cooking.',
    image_icon: '🍲',
    inquiry_count: 67,
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-oven-haier-04',
    merchant_id: merchantId,
    title: 'Haier Smart Inverter Microwave & Air Fryer (25L Digital)',
    category: 'Ovens & Kitchen',
    price: 32000,
    stock_quantity: 7,
    specs: [
      '25L Cavity Size',
      'Built-in Air Fryer Function',
      'Inverter Even Heating Technology',
      'Non-stick Easy Clean Cavity',
      'Defrost By Weight & Time'
    ],
    description: 'Healthy oil-free air frying, grilling, and rapid microwave heating in one compact appliance.',
    image_icon: '🍳',
    inquiry_count: 45,
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-ac-gree-05',
    merchant_id: merchantId,
    title: 'Gree 1.5 Ton Fairy Inverter AC (Heat & Cool / 18FITH)',
    category: 'Air Conditioners',
    price: 142000,
    stock_quantity: 8,
    specs: [
      '1.5 Ton T3 Inverter Compressor',
      'Energy Saving Inverter (Up to 60% Saving)',
      'Dual Heating & Cooling',
      'WiFi Smart App Control',
      'Golden Fin Anti-Corrosion Condenser'
    ],
    description: 'Flagship inverter split air conditioner with dual heating and cooling. Operates efficiently even at 52°C ambient temperature.',
    image_icon: '❄️',
    inquiry_count: 95,
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-ac-haier-06',
    merchant_id: merchantId,
    title: 'Haier 1.5 Ton Puri Inverter AC (Self Cleaning T3 / HSU-18HFT)',
    category: 'Air Conditioners',
    price: 154000,
    stock_quantity: 5,
    specs: [
      '1.5 Ton DC Inverter',
      'Cold Expansion One-Touch Self-Cleaning',
      'UPS Enabled (Runs on Generator / Solar)',
      'R32 Eco-Friendly Refrigerant',
      '10-Year Compressor Warranty'
    ],
    description: 'Smart inverter AC featuring automated self-cleaning and UPS low-voltage operation for reliable comfort.',
    image_icon: '❄️',
    inquiry_count: 102,
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-fridge-dawlance-07',
    merchant_id: merchantId,
    title: 'Dawlance 91996 Chrome Inverter Refrigerator (Glass Door)',
    category: 'Refrigerators',
    price: 88000,
    stock_quantity: 4,
    specs: [
      'Inverter Technology (A+ Energy Rating)',
      '5-Way Cooling System',
      'Tempered Glass Mirror Finish',
      'Low Voltage Start (135V Without Stabilizer)',
      '12-Year Compressor Warranty'
    ],
    description: 'Modern luxury inverter refrigerator. Keeps food fresh for up to 6 days during load shedding.',
    image_icon: '🧊',
    inquiry_count: 73,
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-tv-samsung-08',
    merchant_id: merchantId,
    title: 'Samsung 55" Crystal 4K UHD Smart LED TV (CU7000)',
    category: 'LED TVs',
    price: 118000,
    stock_quantity: 4,
    specs: [
      '55-Inch 4K UHD (3840 x 2160)',
      'HDR 10+ & Dynamic Crystal Color',
      'Tizen OS with Netflix, YouTube, Prime',
      'Voice Remote Control & Bluetooth 5.2'
    ],
    description: 'Cinematic 4K home entertainment with crystal clear colors and Dolby Digital audio.',
    image_icon: '📺',
    inquiry_count: 60,
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-tv-tcl-09',
    merchant_id: merchantId,
    title: 'TCL 43" Smart Android LED TV (Frameless / 43P635)',
    category: 'LED TVs',
    price: 52000,
    stock_quantity: 9,
    specs: [
      '43-Inch Full HD HDR Display',
      'Official Google TV / Android 11',
      'Google Assistant Built-in',
      'Dolby Audio Stereo Speakers'
    ],
    description: 'Budget-friendly bezel-less Android smart TV with vibrant colors and stereo surround sound.',
    image_icon: '📺',
    inquiry_count: 44,
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-wm-haier-10',
    merchant_id: merchantId,
    title: 'Haier Fully Automatic Inverter Washing Machine (12kg)',
    category: 'Household Electronics',
    price: 92000,
    stock_quantity: 5,
    specs: [
      '12kg Wash Capacity',
      'Direct Drive Inverter Motor',
      'Pillow Drum Fabric Care',
      'Auto Water Level & Imbalance Sensor'
    ],
    description: 'Quiet, power-saving automatic top load washing machine with gentle fabric care.',
    image_icon: '🧺',
    inquiry_count: 49,
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-acc-surge-11',
    merchant_id: merchantId,
    title: 'ZepTech Smart Voltage Protector & Surge Suppressor',
    category: 'Accessories',
    price: 4800,
    stock_quantity: 25,
    specs: [
      'Digital Real-time Voltage Display',
      'Auto Cut-off Under 160V / Over 260V',
      '3-Minute Compressor Delay Timer',
      'Heavy Duty 30A Relay'
    ],
    description: 'Heavy duty household digital surge protector for ACs, Refrigerators, and Ovens.',
    image_icon: '🔌',
    inquiry_count: 115,
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// 4. Update orders referencing laptops
db.orders.forEach(o => {
  o.items.forEach(item => {
    if (item.title.toLowerCase().includes('laptop') || item.title.toLowerCase().includes('elitebook')) {
      item.title = 'Dawlance DW-MD10 Convection & Baking Microwave Oven (30 Liters)';
      item.price = 38500;
      o.total_amount = 38500;
    }
  });
  if (o.delivery_address && o.delivery_address.toLowerCase().includes('elitebook')) {
    o.delivery_address = o.delivery_address.replace(/HP EliteBook[^\,]+/i, 'Dawlance Convection Oven (30L)');
  }
});

// 5. Update repairs referencing laptops
db.repairs.forEach(r => {
  if (r.item_name.toLowerCase().includes('laptop') || r.item_name.toLowerCase().includes('dell')) {
    r.item_name = 'Dawlance Convection Microwave Oven (30L)';
    r.issue_reported = 'Turntable rotating but food not heating / high-voltage diode inspection';
    r.estimated_cost = 3200;
    r.technician_notes = 'Replaced high-voltage diode and capacitor. Verified heating cycle on 800W setting.';
  }
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('✅ Database successfully updated with household electronics and user roles!');
