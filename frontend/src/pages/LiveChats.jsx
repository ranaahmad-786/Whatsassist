/**
 * WhatsAssist - Authentic WhatsApp Web Live Conversations, AI Orchestration & Simulator
 * Fully Responsive (Mobile Master-Detail + Desktop Split), Authentic WhatsApp UI,
 * Glassmorphism, Rich Product/Repair Cards & Baileys Device Link.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import WhatsAppConnectModal from '../components/WhatsAppConnectModal';
import { chatsAPI, whatsappAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  MessageSquare,
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  MicOff,
  CheckCheck,
  Check,
  Bot,
  User,
  Trash2,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  QrCode,
  ShieldCheck,
  Wrench,
  Package,
  ShoppingBag,
  ExternalLink,
  Sliders,
  AlertCircle,
  Play,
} from 'lucide-react';
import axios from 'axios';

function parseRichContent(text) {
  if (!text) return { cleanText: '', products: null, order: null, repair: null };
  let cleanText = text;
  let products = null;
  let order = null;
  let repair = null;

  const productMatch = text.match(/<!-- PRODUCT_CARDS:\s*({[\s\S]*?})\s*-->/);
  if (productMatch) {
    try {
      products = JSON.parse(productMatch[1]).items;
      cleanText = cleanText.replace(productMatch[0], '').trim();
    } catch (e) {}
  }

  const orderMatch = text.match(/<!-- ORDER_DATA:\s*({[\s\S]*?})\s*-->/);
  if (orderMatch) {
    try {
      order = JSON.parse(orderMatch[1]);
      cleanText = cleanText.replace(orderMatch[0], '').trim();
    } catch (e) {}
  }

  const repairMatch = text.match(/<!-- REPAIR_DATA:\s*({[\s\S]*?})\s*-->/);
  if (repairMatch) {
    try {
      repair = JSON.parse(repairMatch[1]);
      cleanText = cleanText.replace(repairMatch[0], '').trim();
    } catch (e) {}
  }

  return { cleanText, products, order, repair };
}

export default function LiveChats() {
  const { merchant } = useAuth();
  const { isDark } = useTheme();
  const [sessions, setSessions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'AI' | 'TAKEOVER'
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Simulator Modal State
  const [showSimModal, setShowSimModal] = useState(false);
  const [simName, setSimName] = useState('Hamza Sheikh');
  const [simPhone, setSimPhone] = useState('+923009998877');
  const [simMessage, setSimMessage] = useState('What are your store hours and do you have a warranty?');
  const [simSending, setSimSending] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const selectedIdRef = useRef(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.prefillQuery) {
      setSimMessage(location.state.prefillQuery);
      setShowSimModal(true);
    }
  }, [location.state]);

  const selectedSession = sessions.find((s) => s.id === selectedId) || null;

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    setShowScrollToBottom(false);
  };

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const threshold = 100;
    const atBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    setShowScrollToBottom(!atBottom);
  };

  const loadSessions = async () => {
    try {
      const res = await chatsAPI.getSessions();
      if (res.data.success) {
        const fetched = res.data.sessions;
        setSessions(fetched);
        if (!selectedIdRef.current && fetched.length > 0) {
          setSelectedId(fetched[0].id);
          selectedIdRef.current = fetched[0].id;
        }
      }
    } catch (err) {
      console.error('Failed to load sessions', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (sessionId) => {
    if (!sessionId) return;
    try {
      const res = await chatsAPI.getMessages(sessionId);
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  useEffect(() => {
    loadSessions();
    const interval = setInterval(() => {
      loadSessions();
      if (selectedIdRef.current) {
        loadMessages(selectedIdRef.current);
      }
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadMessages(selectedId);
    }
  }, [selectedId]);

  const handleSelectSession = (id) => {
    setSelectedId(id);
    selectedIdRef.current = id;
    setMobileShowChat(true);
    loadMessages(id);
  };

  const handleTakeoverToggle = async () => {
    if (!selectedSession) return;
    try {
      const res = await chatsAPI.takeover(selectedSession.id);
      if (res.data.success) {
        await loadSessions();
        await loadMessages(selectedSession.id);
      }
    } catch (err) {
      console.error('Takeover toggle failed', err);
    }
  };

  const handleSendReply = async (e) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !selectedSession) return;
    const textToSend = replyText;
    setReplyText('');
    try {
      const res = await chatsAPI.sendReply(selectedSession.id, textToSend);
      if (res.data.success) {
        await loadMessages(selectedSession.id);
        await loadSessions();
      }
    } catch (err) {
      console.error('Send reply failed', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const handleSimulateInbound = async (e) => {
    e.preventDefault();
    if (!simMessage.trim()) return;
    setSimSending(true);
    try {
      await whatsappAPI.simulate({
        name: simName,
        phone: simPhone,
        message: simMessage,
      });

      setShowSimModal(false);
      setSimMessage('');

      const res = await chatsAPI.getSessions();
      if (res.data.success) {
        setSessions(res.data.sessions);
        const match = res.data.sessions.find((s) => s.whatsapp_phone === simPhone);
        if (match) {
          setSelectedId(match.id);
          selectedIdRef.current = match.id;
          setMobileShowChat(true);
          await loadMessages(match.id);
        } else if (selectedIdRef.current) {
          await loadMessages(selectedIdRef.current);
        }
      }
    } catch (err) {
      console.error('Simulate failed', err);
    } finally {
      setSimSending(false);
    }
  };

  const handleClearChat = async () => {
    if (!selectedSession) return;
    if (!window.confirm(`Clear all chat messages with "${selectedSession.customer_name}"?`)) return;
    try {
      await chatsAPI.clearMessages(selectedSession.id);
      setMessages([]);
      await loadSessions();
    } catch (err) {
      console.error('Clear chat failed', err);
    }
  };

  const handleDeleteChat = async () => {
    if (!selectedSession) return;
    if (!window.confirm('Delete this conversation thread?')) return;
    try {
      await chatsAPI.deleteSession(selectedSession.id);
      const res = await chatsAPI.getSessions();
      if (res.data.success) {
        setSessions(res.data.sessions);
        if (res.data.sessions.length > 0) {
          const next = res.data.sessions[0];
          setSelectedId(next.id);
          selectedIdRef.current = next.id;
          await loadMessages(next.id);
        } else {
          setSelectedId(null);
          selectedIdRef.current = null;
          setMessages([]);
          setMobileShowChat(false);
        }
      }
    } catch (err) {
      console.error('Delete chat failed', err);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const q = searchFilter.toLowerCase();
    const matchQuery =
      (s.customer_name && s.customer_name.toLowerCase().includes(q)) ||
      (s.whatsapp_phone && s.whatsapp_phone.includes(q)) ||
      (s.last_message && s.last_message.toLowerCase().includes(q));

    if (!matchQuery) return false;
    if (filterMode === 'AI') return s.session_status === 'AI_ACTIVE';
    if (filterMode === 'TAKEOVER') return s.session_status === 'HUMAN_TAKEOVER';
    return true;
  });

  const emojis = []; // Emojis removed per user request

  return (
    <PageLayout
      title="Live WhatsApp Hub"
      subtitle="Real-time multi-device conversations with AI autonomous resolution & live takeover"
      actions={
        <div className="flex items-center gap-2">
          {/* Simulate Customer Message Button */}
          <button
            onClick={() => setShowSimModal(true)}
            className="px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-neutral-800/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simulate Customer</span>
            <span className="sm:hidden">Simulate</span>
          </button>
        </div>
      }
    >
      {/* Outer Card Container */}
      <div className="h-[calc(100vh-140px)] min-h-[550px] flex rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-2xl bg-white dark:bg-[#111b21] transition-all">
        {/* =========================================================================
            LEFT COLUMN: Sessions & Conversation List (Visible on desktop or when mobileShowChat is false)
           ========================================================================= */}
        <div
          className={`w-full lg:w-96 flex flex-col border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#111b21] shrink-0 transition-all ${
            mobileShowChat ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Header & Search */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#111b21]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                <span>Conversations</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-neutral-500/10 text-neutral-700 dark:text-neutral-400 border border-neutral-500/20">
                  {sessions.length}
                </span>
              </h2>

              <button
                onClick={loadSessions}
                title="Refresh Conversations"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, phone, or query..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-[#202c33] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-transparent focus:border-neutral-500/50 outline-none transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 mt-2.5 pt-1 text-[11px] font-extrabold text-slate-500">
              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterMode === 'ALL'
                    ? 'bg-neutral-700 text-white shadow-sm'
                    : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                All ({sessions.length})
              </button>
              <button
                onClick={() => setFilterMode('AI')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  filterMode === 'AI'
                    ? 'bg-neutral-700 text-white shadow-sm'
                    : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Bot className="w-3 h-3" />
                <span>AI Active</span>
              </button>
              <button
                onClick={() => setFilterMode('TAKEOVER')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  filterMode === 'TAKEOVER'
                    ? 'bg-neutral-700 text-white shadow-sm'
                    : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Takeover</span>
              </button>
            </div>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
            {filteredSessions.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">No chats found</p>
                <button
                  onClick={() => setShowSimModal(true)}
                  className="mt-3 text-xs font-bold text-neutral-700 dark:text-neutral-400 hover:underline"
                >
                  + Simulate a test query
                </button>
              </div>
            ) : (
              filteredSessions.map((s) => {
                const isSelected = s.id === selectedId;
                const isTakeover = s.session_status === 'HUMAN_TAKEOVER';
                return (
                  <div
                    key={s.id}
                    onClick={() => handleSelectSession(s.id)}
                    className={`p-3.5 transition-all cursor-pointer flex items-start gap-3 relative group ${
                      isSelected
                        ? 'bg-neutral-500/10 dark:bg-[#202c33] border-l-4 border-neutral-500'
                        : 'hover:bg-slate-50 dark:hover:bg-[#202c33]/40'
                    }`}
                  >
                    {/* Customer Avatar */}
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-700 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md shadow-neutral-700/20 relative">
                      {s.customer_name ? s.customer_name.charAt(0).toUpperCase() : 'C'}
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[#111b21] ${
                          isTakeover ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />
                    </div>

                    {/* Customer Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                          {s.customer_name || 'WhatsApp Customer'}
                        </h3>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0 ml-1">
                          {s.last_message_time
                            ? new Date(s.last_message_time).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate mt-0.5">
                        {s.whatsapp_phone}
                      </p>

                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-[180px]">
                          {s.last_message || 'New conversation'}
                        </p>
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                            isTakeover
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-neutral-500/10 text-neutral-700 dark:text-neutral-400 border border-neutral-500/20'
                          }`}
                        >
                          {isTakeover ? 'Takeover' : 'AI'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: Authentic WhatsApp Web Chat Room
           ========================================================================= */}
        {selectedSession ? (
          <div
            className={`flex-1 flex flex-col h-full bg-slate-100 dark:bg-[#0b141a] transition-all ${
              !mobileShowChat ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* WhatsApp Header Bar */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#202c33] flex items-center justify-between shrink-0 shadow-sm z-10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setMobileShowChat(false)}
                  className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Back to conversations list"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Avatar */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-700 text-white flex items-center justify-center font-black text-sm shadow-md shadow-neutral-700/20">
                    {selectedSession.customer_name ? selectedSession.customer_name.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#202c33]" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">
                      {selectedSession.customer_name}
                    </h3>
                    <span className="text-[10px] text-neutral-700 dark:text-neutral-400 font-mono font-bold">
                      {selectedSession.whatsapp_phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>
                      {selectedSession.session_status === 'HUMAN_TAKEOVER'
                        ? 'Human Agent Takeover (Manual Mode)'
                        : 'AI Customer Resolution Agent Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-2">
                {/* Human Takeover Toggle Switch */}
                <button
                  onClick={handleTakeoverToggle}
                  type="button"
                  className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedSession.session_status === 'HUMAN_TAKEOVER'
                      ? 'bg-neutral-800 hover:bg-neutral-700 text-white shadow-neutral-800/20'
                      : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                  }`}
                  title="Toggle between AI Auto-Response and Live Human Takeover"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {selectedSession.session_status === 'HUMAN_TAKEOVER' ? 'Resume AI Agent' : 'Takeover Chat'}
                  </span>
                  <span className="sm:hidden">
                    {selectedSession.session_status === 'HUMAN_TAKEOVER' ? 'AI' : 'Takeover'}
                  </span>
                </button>

                {/* WhatsApp Link Modal Trigger */}
                <button
                  onClick={() => setWaModalOpen(true)}
                  title="Manage WhatsApp Baileys Connection"
                  className="hidden md:flex p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                </button>

                {/* Clear Chat Button */}
                <button
                  onClick={handleClearChat}
                  title="Clear Chat History"
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                {/* Delete Conversation Thread */}
                <button
                  onClick={handleDeleteChat}
                  title="Delete Conversation Thread"
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages Body with Authentic WhatsApp Doodle Wallpaper */}
            <div className="flex-1 relative overflow-hidden">
              <div
                ref={messagesContainerRef}
                onScroll={handleMessagesScroll}
                className={`absolute inset-0 p-4 sm:p-6 overflow-y-auto space-y-4 ${
                  isDark ? 'wa-chat-wallpaper-dark' : 'wa-chat-wallpaper-light'
                }`}
              >
              {/* WhatsApp Security Badge Pill */}
              <div className="flex justify-center my-2">
                <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-semibold flex items-center gap-1.5 shadow-sm max-w-md text-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>
                    Messages are protected with WhatsAssist AI Knowledge Grounding & WhatsApp encryption.
                  </span>
                </div>
              </div>

              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-3xl bg-neutral-500/10 border border-neutral-500/20 flex items-center justify-center text-neutral-700 dark:text-neutral-400 mb-3 shadow-md">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                    No Messages Yet in this Session
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Send a reply below or click "Simulate Customer" to trigger autonomous Gemini resolution.
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isCustomer = m.sender_type === 'CUSTOMER';
                  const isAI = m.sender_type === 'AI_AGENT';
                  const { cleanText, products, order, repair } = parseRichContent(m.message_text);

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'} animate-fade-in`}
                    >
                      {/* WhatsApp Speech Bubble */}
                      <div
                        className={`max-w-xl p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md space-y-3 relative ${
                          isCustomer
                            ? 'bg-white dark:bg-[#202c33] text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-white/5'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 rounded-tr-none border border-neutral-300/60 dark:border-neutral-600/40'
                        }`}
                      >
                        {/* Bubble Header (Sender Label) */}
                        <div className="flex items-center justify-between gap-3 text-[10px] font-black pb-0.5 border-b border-black/5 dark:border-white/5">
                          <span
                            className={
                              isCustomer
                                ? 'text-neutral-700 dark:text-neutral-400 font-extrabold'
                                : 'text-emerald-800 dark:text-emerald-200 font-extrabold flex items-center gap-1'
                            }
                          >
                            {isCustomer ? (
                              selectedSession.customer_name
                            ) : isAI ? (
                              <>
                                <Sparkles className="w-3 h-3 text-emerald-500" />
                                <span>WhatsAssist AI Bot</span>
                              </>
                            ) : (
                              <>
                                <User className="w-3 h-3" />
                                <span>Merchant Agent</span>
                              </>
                            )}
                          </span>

                          <span className="text-[10px] text-slate-400 dark:text-slate-300 font-mono">
                            {new Date(m.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {/* Message Clean Text */}
                        <div className="whitespace-pre-wrap font-medium">
                          {cleanText}
                        </div>

                        {/* RICH CARD 1: PRODUCT CATALOG CARD */}
                        {products && products.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/10">
                            <div className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              <span>Matched Products from ZepTech Catalog:</span>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              {products.map((prod, idx) => (
                                <div
                                  key={idx}
                                  className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-sm flex items-center justify-between gap-3"
                                >
                                  <div>
                                    <h5 className="font-black text-xs">{prod.title}</h5>
                                    <div className="text-[11px] font-extrabold text-neutral-700 dark:text-neutral-400 mt-0.5">
                                      Rs. {Number(prod.price).toLocaleString()}
                                    </div>
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                      {prod.category}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setReplyText(`Please book order for ${prod.title}`);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-extrabold text-[10px] shadow-sm transition-all"
                                  >
                                    Order Item
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* RICH CARD 2: REPAIR DIAGNOSTICS TRACKING CARD */}
                        {repair && (
                          <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-500/30 text-slate-900 dark:text-white shadow-sm space-y-2.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Wrench className="w-4 h-4 text-amber-500" />
                                <span className="font-black text-xs text-amber-600 dark:text-amber-400">
                                  Repair Token: {repair.token}
                                </span>
                              </div>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 uppercase">
                                {repair.status}
                              </span>
                            </div>

                            <div className="text-xs space-y-1">
                              <div><strong>Device:</strong> {repair.item}</div>
                              <div><strong>Reported Fault:</strong> {repair.issue}</div>
                              <div><strong>Estimated Bill:</strong> Rs. {Number(repair.cost).toLocaleString()}</div>
                              <div><strong>Technician Note:</strong> <em>"{repair.notes}"</em></div>
                              <div><strong>Warranty:</strong> {repair.warranty}</div>
                            </div>
                          </div>
                        )}

                        {/* RICH CARD 3: ORDER CONFIRMATION CARD */}
                        {order && (
                          <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-neutral-500/40 text-slate-900 dark:text-white shadow-sm space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-400 font-black text-xs">
                                <ShoppingBag className="w-4 h-4" />
                                <span>Order Confirmed ({order.order_code})</span>
                              </div>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-neutral-500/10 text-neutral-700 border border-neutral-500/20">
                                {order.status}
                              </span>
                            </div>
                            <div className="text-xs space-y-1">
                              <div><strong>Product:</strong> {order.product_title}</div>
                              <div><strong>Total Amount:</strong> Rs. {Number(order.amount).toLocaleString()}</div>
                              <div><strong>Payment:</strong> {order.payment}</div>
                              <div><strong>Delivery Address:</strong> {order.address}</div>
                            </div>
                          </div>
                        )}

                        {/* Bubble Timestamp & Double Ticks */}
                        <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 dark:text-slate-300 font-mono pt-1">
                          <span>
                            {new Date(m.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {!isCustomer && (
                            <CheckCheck className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400 inline" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
                <div ref={messagesEndRef} />
              </div>
              {showScrollToBottom && (
                <button
                  onClick={() => scrollToBottom()}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 rounded-full bg-neutral-800 text-white shadow-lg hover:bg-neutral-700 transition-all z-10"
                  aria-label="Scroll to bottom"
                >
                  <ArrowLeft className="w-4 h-4 rotate-[-90deg]" />
                </button>
              )}
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-4 py-2 border-t border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-[#111b21] flex items-center gap-2 overflow-x-auto text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <span className="text-[10px] uppercase font-black text-slate-400 shrink-0">Quick Queries:</span>
              <button
                onClick={() => setReplyText('What are your store hours and warranty policy?')}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#202c33] dark:hover:bg-[#2a3942] border border-slate-200 dark:border-white/5 shrink-0 transition-colors"
              >
                Store Hours & Warranty
              </button>
              <button
                onClick={() => setReplyText('Check repair status for token REP-101')}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#202c33] dark:hover:bg-[#2a3942] border border-slate-200 dark:border-white/5 shrink-0 transition-colors"
              >
                Check REP-101
              </button>
              <button
                onClick={() => setReplyText('I want to order Gree 1.5 Ton AC, my name is Ahmad Khan, deliver to Gulberg III Lahore')}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#202c33] dark:hover:bg-[#2a3942] border border-slate-200 dark:border-white/5 shrink-0 transition-colors"
              >
                Order Gree 1.5 Ton AC
              </button>
              <button
                onClick={() => setReplyText('What is the price of ZepTech Thunder E-Bike 70cc?')}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#202c33] dark:hover:bg-[#2a3942] border border-slate-200 dark:border-white/5 shrink-0 transition-colors"
              >
                E-Bike Price
              </button>
            </div>

            {/* Quick Emoji Picker Drawer - Removed per user request */}

            {/* WhatsApp Authentic Input Bar */}
            <form
              onSubmit={handleSendReply}
              className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#202c33] flex items-center gap-2"
            >

              {/* Attachment Button */}
              <button
                type="button"
                onClick={() => alert('Attachments (images/docs) supported via WhatsApp Cloud API.')}
                className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Auto-expanding Input Area */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={
                    selectedSession.session_status === 'HUMAN_TAKEOVER'
                      ? 'Type human merchant reply (WhatsApp will deliver instantly)...'
                      : 'Type a message to send directly to customer...'
                  }
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-slate-100 dark:bg-[#2a3942] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-transparent focus:border-neutral-500 outline-none transition-all"
                />
              </div>

              {/* Simulated Voice Note Microphone */}
              <button
                type="button"
                onClick={() => {
                  setIsRecording(!isRecording);
                  if (!isRecording) {
                    setReplyText('[Voice Note Recorded: 14 seconds]');
                  }
                }}
                className={`p-2.5 rounded-2xl transition-all ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                title="Voice Note"
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Green WhatsApp Send Button */}
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="w-10 h-10 rounded-2xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 transition-all cursor-pointer shrink-0"
                aria-label="Send WhatsApp message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-[#0b141a]">
            <div className="w-20 h-20 rounded-3xl bg-neutral-500/10 border border-neutral-500/20 flex items-center justify-center text-neutral-700 dark:text-neutral-400 mb-4 shadow-xl">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              WhatsApp Autonomous Resolution Engine
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
              Select an ongoing customer conversation on the left, or simulate an inbound WhatsApp customer query to see autonomous AI resolution in action.
            </p>
            <button
              onClick={() => setShowSimModal(true)}
              className="mt-5 px-5 py-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-extrabold text-xs shadow-md shadow-neutral-800/20 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simulate Customer Query</span>
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          SIMULATOR MODAL (Allows testing customer queries directly in the UI)
         ========================================================================= */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-neutral-700/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Simulate WhatsApp Inbound
                  </h3>
                  <p className="text-xs text-slate-500">
                    Test Gemini AI RAG, repair tracking & order placement
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSimModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSimulateInbound} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Customer WhatsApp Number
                </label>
                <input
                  type="text"
                  value={simPhone}
                  onChange={(e) => setSimPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Query (Urdu or English)
                </label>
                <textarea
                  rows={3}
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  placeholder="e.g. Check repair REP-101 or I want to buy Gree AC..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSimModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={simSending || !simMessage.trim()}
                  className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 flex items-center gap-2"
                >
                  <Send className={`w-3.5 h-3.5 ${simSending ? 'animate-spin' : ''}`} />
                  <span>{simSending ? 'Simulating...' : 'Dispatch Simulated WhatsApp'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Device Connection Modal */}
      <WhatsAppConnectModal
        isOpen={waModalOpen}
        onClose={() => setWaModalOpen(false)}
      />
    </PageLayout>
  );
}
