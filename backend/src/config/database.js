/**
 * WhatsAssist - Enterprise Data Store & Relational Engine
 * Pure JavaScript persistent multi-tenant relational store.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.resolve(__dirname, '../../data/whatsassist_db.json');

const defaultState = {
  merchants: [],
  whatsapp_configs: [],
  customers: [],
  conversation_sessions: [],
  messages: [],
  knowledge_documents: [],
  document_chunks: [],
  leads: [],
  products: [],
  orders: [],
  repairs: []
};

let store = null;

function loadStore() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    try {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      store = { ...defaultState, ...JSON.parse(data) };
    } catch (e) {
      console.warn('⚠️ [DB] Corrupt file encountered, recreating fresh database.');
      store = { ...defaultState };
      persistStore();
    }
  } else {
    store = { ...defaultState };
    persistStore();
  }
}

function persistStore() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('❌ [DB] Failed to persist data to disk:', err.message);
  }
}

function initializeDatabase() {
  loadStore();
  console.log('✅ [DB] Multi-tenant relational store online at:', DB_PATH);
  return true;
}

function verifyDatabaseConnection() {
  if (!store) loadStore();
  const tables = Object.keys(store);
  return { success: true, tables };
}

const db = {
  findAll(table, predicate = () => true) {
    loadStore(); // Always ensure latest state
    if (!store[table]) store[table] = [];
    return store[table].filter(predicate);
  },

  findOne(table, predicate) {
    loadStore();
    if (!store[table]) store[table] = [];
    return store[table].find(predicate) || null;
  },

  insert(table, record) {
    loadStore();
    if (!store[table]) store[table] = [];
    const timestamp = new Date().toISOString();
    const entry = {
      ...record,
      created_at: record.created_at || timestamp,
      updated_at: timestamp
    };
    store[table].push(entry);
    persistStore();
    return entry;
  },

  update(table, id, updates) {
    loadStore();
    if (!store[table]) return null;
    const index = store[table].findIndex(item => item.id === id);
    if (index === -1) return null;
    store[table][index] = {
      ...store[table][index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    persistStore();
    return store[table][index];
  },

  delete(table, id) {
    loadStore();
    if (!store[table]) return false;
    const initialLen = store[table].length;
    store[table] = store[table].filter(item => item.id !== id);
    persistStore();
    return store[table].length < initialLen;
  },

  deleteWhere(table, predicate) {
    loadStore();
    if (!store[table]) return 0;
    const initialLen = store[table].length;
    store[table] = store[table].filter(item => !predicate(item));
    persistStore();
    return initialLen - store[table].length;
  },

  getRawStore() {
    loadStore();
    return store;
  }
};

module.exports = { db, initializeDatabase, verifyDatabaseConnection };
