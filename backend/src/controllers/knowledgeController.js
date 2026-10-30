/**
 * WhatsAssist - Knowledge Base Controller
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

const { db } = require('../config/database');
const ragService = require('../services/ragService');

const knowledgeController = {
  // GET /api/knowledge/documents
  getDocuments(req, res) {
    const merchantId = req.merchant.id;
    const docs = db.findAll('knowledge_documents', d => d.merchant_id === merchantId);
    res.json({ success: true, documents: docs });
  },

  // POST /api/knowledge/upload (Text/FAQ/Menu Ingestion)
  uploadDocument(req, res) {
    const merchantId = req.merchant.id;
    const { file_name, content } = req.body;

    if (!file_name || !content) {
      return res.status(400).json({ success: false, message: 'file_name and content are required' });
    }

    const result = ragService.indexDocument(merchantId, file_name, content);
    res.json({
      success: true,
      message: `Document indexed into ${result.totalChunks} chunks successfully`,
      data: result
    });
  },

  // POST /api/knowledge/simulate
  simulateSearch(req, res) {
    const merchantId = req.merchant.id;
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    const result = ragService.retrieveContext(merchantId, query);
    res.json({ success: true, ...result });
  },

  // DELETE /api/knowledge/documents/:id
  deleteDocument(req, res) {
    const { id } = req.params;
    const merchantId = req.merchant.id;

    const doc = db.findOne('knowledge_documents', d => d.id === id && d.merchant_id === merchantId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Remove document chunks
    const chunks = db.findAll('document_chunks', c => c.document_id === id);
    chunks.forEach(c => db.delete('document_chunks', c.id));

    // Remove document record
    db.delete('knowledge_documents', id);

    res.json({ success: true, message: 'Document and associated vector chunks removed' });
  }
};

module.exports = knowledgeController;
