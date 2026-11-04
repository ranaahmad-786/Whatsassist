/**
 * WhatsAssist - Enterprise WhatsApp AI RAG Chatbot Widget
 * Wireframe-aligned Floating Action Button (FAB) & interactive WhatsApp Web window
 * powered by Google Gemini Flash RAG with Roman Urdu & English natural intelligence.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  CheckCheck,
  ShoppingBag,
  Wrench,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { whatsappAPI } from '../services/api';

const QUICK_PROMPTS = [
  '⚡ ZepTech E-Bikes ki prices aur range kya hai?',
  '🔍 Track my repair token REP-101',
  '❄️ Gree 1.5 Ton Inverter AC discount rate',
  '🍳 Dawlance Inverter Oven DW-115 specs',
  '⏰ Shop timing, location aur helpline number?',
];

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

export default function FloatingWhatsAppChat({
  defaultOpen = false,
  onOpenOrder,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'bot',
      text: 'Assalam-o-Alaikum! 👋 Welcome to ZepTech Smart Electronics & E-Mobility Store.\n\nMain ZepTech ka official AI Shop Assistant hoon. Aap mujh se kisi bhi item (E-Bikes, Inverter ACs, Microwave Ovens, Refrigerators), prices, store timings, ya Repair Token (REP-101) ke baray mein English ya Roman Urdu mein puch saktay hain!',
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await whatsappAPI.simulate({
        name: 'Shopper (Storefront)',
        phone: '+923314228724',
        message: query,
      });

      // Correctly extract the AI reply from backend payload:
      const rawAnswer =
        res.data?.aiMessage?.message_text ||
        res.data?.reply ||
        res.data?.response ||
        res.data?.message;

      const { cleanText, products, order, repair } = parseRichContent(rawAnswer);

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: cleanText || rawAnswer || 'ZepTech store assistant is ready to help you with any electronic item or repair!',
        products,
        order,
        repair,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.warn('Simulate fallback:', err);
      // Fallback local smart response if backend is offline
      let fallbackText = 'Assalam-o-Alaikum! ZepTech Electronics par aapka khushamdeed! Hamaray pas E-Bikes, Inverter ACs, Microwave Ovens, aur Smart TVs stock mein mojood hain. Cash on Delivery Lahore mein 24 ghantay mein free dispatch hoti hai. Mazeed helpline: 03314228724.';
      let richProducts = null;

      const q = query.toLowerCase();
      if (q.includes('rep-101') || q.includes('repair')) {
        fallbackText = '🔧 REPAIR TICKET REPORT: REP-101\n• Item: Gree 1.5 Ton Split AC Inverter PCB Board\n• Customer: Usman Tariq\n• Status: READY FOR PICKUP\n• Technician Notes: Replaced primary filtering capacitor and relay switch. Burn-in tested for 2 hours under full 12A load.\n• Estimated Cost: Rs. 3,500 (30-day warranty included)';
      } else if (q.includes('ebike') || q.includes('bike') || q.includes('scooter')) {
        fallbackText = '⚡ ZEPTECH SMART E-BIKES AVAILABLE:\n1. ZepTech Thunder 70cc (Lithium 70km Range) — Rs. 145,000\n2. ZepTech Eco Commuter Electric Bike — Rs. 128,000\n\nDonon models par 3-Year Motor Warranty aur 1-Year Lithium Battery Warranty shamil hai. Free delivery in Lahore!';
      } else if (q.includes('timing') || q.includes('address') || q.includes('location')) {
        fallbackText = '📍 ZepTech Location & Store Timings:\n• Address: Shop #14, Main Market, Gulberg III, Lahore\n• Hours: Monday to Saturday: 10:00 AM - 10:00 PM | Sunday: 2:00 PM - 10:00 PM\n• Owner / Helpline: 0331-4228724';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: fallbackText,
          products: richProducts,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Action Button (FAB) matching Wireframe */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 px-4 py-3 rounded-full bg-slate-900 hover:bg-black dark:bg-[#25D366] dark:hover:bg-[#20ba59] text-white shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 transform hover:scale-105 cursor-pointer border border-slate-700 dark:border-emerald-400"
          aria-label="Open WhatsApp AI Assistant"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500 dark:bg-white text-white dark:text-[#25D366] flex items-center justify-center font-bold shadow-xs">
            <MessageCircle className="w-5 h-5 fill-current" />
          </div>
          <span className="text-xs sm:text-sm font-bold tracking-tight pr-1">
            FAB: WhatsApp AI Assistant
          </span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
        </button>
      )}

      {/* Floating WhatsApp Chat Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp transition-all duration-300">
          {/* Authentic WhatsApp Green Header */}
          <div className="px-4 py-3.5 bg-[#075E54] dark:bg-[#1f2c34] text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/20 font-bold overflow-hidden shadow-xs">
                  <Bot className="w-6 h-6 text-emerald-300" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#075E54] dark:border-[#1f2c34]" />
              </div>
              <div>
                <h4 className="text-sm font-bold leading-tight flex items-center gap-1.5">
                  ZepTech AI Assistant
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                </h4>
                <p className="text-[11px] text-emerald-200 font-medium leading-tight">
                  Online • Google Gemini Flash RAG
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subheader info bar */}
          <div className="px-3.5 py-1.5 bg-emerald-50 dark:bg-slate-800/90 border-b border-emerald-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
            <span>Dual-Mode AI (English & Roman Urdu)</span>
            <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">Owner: 03314228724</span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#efeae2]/40 dark:bg-[#0b141a]/90">
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs whitespace-pre-wrap leading-relaxed ${
                      isBot
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200/70 dark:border-slate-700/60'
                        : 'bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-900 dark:text-white rounded-tr-none'
                    }`}
                  >
                    {msg.text}

                    {/* Rich Products recommendation cards if returned by AI */}
                    {msg.products && Array.isArray(msg.products) && (
                      <div className="mt-3 space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                        {msg.products.map((p, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <h5 className="font-bold text-[11px] text-slate-900 dark:text-white truncate">
                                {p.title}
                              </h5>
                              <p className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                Rs. {Number(p.price).toLocaleString()}
                              </p>
                            </div>
                            {onOpenOrder && (
                              <button
                                onClick={() => onOpenOrder(p)}
                                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-black dark:bg-emerald-600 text-white font-bold text-[10px] shrink-0"
                              >
                                Order Now
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div
                      className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                        isBot ? 'text-slate-400' : 'text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      <span>{msg.time}</span>
                      {!isBot && <CheckCheck className="w-3.5 h-3.5 text-blue-500 inline" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 w-fit shadow-xs border border-slate-200/60 dark:border-slate-700/60">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] font-medium ml-1">AI analyzing shop inventory...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(q.replace(/^[^\s]+\s/, ''))}
                className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0 shadow-2xs cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything in Roman Urdu or English..."
              className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-transparent placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white disabled:opacity-40 transition-all shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
