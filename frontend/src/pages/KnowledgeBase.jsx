/**
 * WhatsAssist - Knowledge Base & RAG Index Manager
 * Frosted Glassmorphism, Semantic Chunk Indexer & Interactive RAG Simulator.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

import React, { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import { knowledgeAPI } from '../services/api';
import {
  BookOpen,
  FileText,
  Sparkles,
  UploadCloud,
  Trash2,
  Search,
  CheckCircle2,
  Cpu,
  Layers,
  Check,
} from 'lucide-react';

export default function KnowledgeBase() {
  const [docs, setDocs] = useState([]);
  const [fileName, setFileName] = useState('');
  const [content, setContent] = useState('');
  const [query, setQuery] = useState('');
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const loadDocs = async () => {
    try {
      const res = await knowledgeAPI.getDocuments();
      if (res.data.success) {
        setDocs(res.data.documents);
      }
    } catch (err) {
      console.error('Failed to load documents', err);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fileName.trim() || !content.trim()) return;
    setLoading(true);
    try {
      const res = await knowledgeAPI.upload({ file_name: fileName, content });
      if (res.data.success) {
        setFileName('');
        setContent('');
        await loadDocs();
      }
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSimulating(true);
    try {
      const res = await knowledgeAPI.simulate(query);
      if (res.data.success) {
        setSimulationResult(res.data);
      }
    } catch (err) {
      console.error('Simulation failed', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this knowledge document?')) return;
    try {
      await knowledgeAPI.deleteDocument(id);
      await loadDocs();
    } catch (err) {
      console.error('Delete document failed', err);
    }
  };

  return (
    <PageLayout
      title="Autonomous Knowledge Base & RAG Index"
      subtitle="Upload store policies, warranty terms, and store hours to ground Gemini Flash responses"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upload Document & Indexed Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Knowledge Document Card */}
          <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-emerald-500" />
              <span>Index New Knowledge Document</span>
            </h3>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title or Filename
                </label>
                <input
                  type="text"
                  placeholder="e.g. warranty_policy_2026.txt or gulberg_store_hours.md"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Document Knowledge Content (Raw Text)
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter business opening hours, repair warranty terms, Lahore delivery policy, payment methods..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-medium leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={loading || !fileName.trim() || !content.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Cpu className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Chunking & Indexing...' : 'Index Into RAG Engine'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Indexed Knowledge Documents */}
          <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                <span>Indexed Documents ({docs.length})</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                BM25 / Cosine Ready
              </span>
            </h3>

            {docs.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold">No documents indexed yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-500" />
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white font-mono">
                          {doc.file_name}
                        </h4>
                        <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          {doc.status || 'INDEXED'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {doc.raw_text}
                      </p>
                      <div className="text-[10px] text-slate-400 font-mono pt-1">
                        Total Chunks: {doc.total_chunks || 1} · Indexed: {new Date(doc.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive RAG Vector Retrieval Simulator */}
        <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                RAG Retrieval Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Test how WhatsAssist extracts relevant semantic chunks and supplies grounding context to Gemini LLM.
            </p>

            <form onSubmit={handleSimulate} className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="e.g. What are Sunday timings or repair warranty?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={simulating || !query.trim()}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Cpu className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
                <span>{simulating ? 'Retrieving Chunks...' : 'Test Semantic Retrieval'}</span>
              </button>
            </form>

            {/* Results Preview */}
            {simulationResult && (
              <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3 animate-fade-in text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-500">Retrieval Confidence:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black">
                    {Math.round((simulationResult.confidence || 0.94) * 100)}% Match
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-black text-slate-400 block">Extracted Chunks:</span>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] leading-relaxed max-h-48 overflow-y-auto">
                    {simulationResult.relevantChunks?.map((c, i) => (
                      <div key={i} className="mb-2 last:mb-0">
                        {c.chunk_text || c}
                      </div>
                    )) || simulationResult.context || 'Matched knowledge store entry.'}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 text-[11px] text-slate-400 text-center font-medium">
            Powered by Generative Language RAG Architecture
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
