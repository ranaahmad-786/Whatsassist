/**
 * WhatsAssist - RAG Retrieval Engine & Context Matcher
 * Performs document chunking, semantic similarity scoring, and context injection.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

const { db } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const ragService = {
  /**
   * Split plain text into overlapping chunks
   */
  chunkText(text, chunkSize = 500, overlap = 50) {
    if (!text || text.trim().length === 0) return [];
    const chunks = [];
    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      chunks.push(text.slice(start, end).trim());
      start += chunkSize - overlap;
    }
    return chunks;
  },

  /**
   * Ingest a document and generate chunks for a merchant
   */
  indexDocument(merchantId, fileName, text) {
    const docId = uuidv4();
    const chunks = this.chunkText(text);

    db.insert('knowledge_documents', {
      id: docId,
      merchant_id: merchantId,
      file_name: fileName,
      total_chunks: chunks.length,
      status: 'INDEXED',
      raw_text: text
    });

    chunks.forEach((chunkText, index) => {
      db.insert('document_chunks', {
        id: uuidv4(),
        document_id: docId,
        merchant_id: merchantId,
        chunk_text: chunkText,
        chunk_index: index
      });
    });

    return { docId, totalChunks: chunks.length };
  },

  /**
   * Calculate semantic token similarity between query and chunk with stopword exclusion
   */
  computeScore(query, text) {
    const STOPWORDS = new Set([
      'what', 'is', 'the', 'a', 'an', 'of', 'in', 'at', 'to', 'for', 'do', 'you', 'are',
      'and', 'or', 'we', 'our', 'it', 'its', 'my', 'your', 'me', 'us', 'can', 'please',
      'tell', 'about', 'how', 'much', 'i', 'he', 'she', 'they', 'this', 'that', 'there', 'here'
    ]);

    const allTokens = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
    const meaningfulTokens = allTokens.filter(t => !STOPWORDS.has(t) && t.length > 1);
    const tokensToUse = meaningfulTokens.length > 0 ? meaningfulTokens : allTokens;

    if (!tokensToUse.length) return 0;
    const textLower = text.toLowerCase();
    
    let matched = 0;
    for (const token of tokensToUse) {
      if (textLower.includes(token)) {
        // Exact word match gets higher weight
        const regex = new RegExp(`\\b${token}\\b`, 'i');
        matched += regex.test(textLower) ? 1.5 : 1.0;
      }
    }
    return matched / (tokensToUse.length * 1.5);
  },

  /**
   * Retrieve top K chunks matching user query
   */
  retrieveContext(merchantId, query, topK = 3) {
    const chunks = db.findAll('document_chunks', c => c.merchant_id === merchantId);
    if (!chunks.length) return { context: '', confidence: 0, matches: [] };

    const scored = chunks.map(chunk => ({
      ...chunk,
      score: this.computeScore(query, chunk.chunk_text)
    })).sort((a, b) => b.score - a.score);

    const topMatches = scored.slice(0, topK);
    const topScore = topMatches.length ? topMatches[0].score : 0;
    const combinedContext = topMatches.filter(m => m.score > 0).map(m => m.chunk_text).join('\n---\n');

    return {
      context: combinedContext,
      confidence: topScore,
      matches: topMatches
    };
  }
};

module.exports = ragService;
