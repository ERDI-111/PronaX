'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Minimize2,
  Maximize2,
  Bot,
  User,
  ShieldCheck,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
  escalated?: boolean;
}

const QUICK_QUESTIONS = [
  'Cilat janë 3 planet e publikimit?',
  'Si të publikoj një pronë falas?',
  'A ka abonim ose debitim automatik?',
  'Si bëhet rinovimi manual?',
  'Sa kushton publikimi mujor?',
];

export function AICustomerChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<'sq' | 'en'>('sq');
  const [conversationId, setConversationId] = useState<string>('');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Përshëndetje! Jam **Asistenti Zyrtar i PronaX**. ' +
        'Mund t\'ju ndihmoj me informacion mbi shpalljet në Kosovë, ' +
        '3 planet tona (Falas 0 €, Javor 2.99 €, Mujor 9.99 €) dhe rinovimin e pronave. ' +
        'Si mund t\'ju ndihmoj sot?',
      timestamp: 'Tani',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'customer_support',
          message: text,
          conversationId: conversationId || undefined,
          language,
        }),
      });

      const data = await res.json();

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      const botMessage: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.content || (language === 'sq' ? 'Më falni, nuk arrita të përgjigjem. Provoni përsëri.' : 'Sorry, could not process request.'),
        timestamp: new Date().toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' }),
        escalated: data.escalated,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Ndodhi një gabim lidhjeje. Ju lutem provoni përsëri ose na kontaktoni në pronaxestate@outlook.com.',
          timestamp: new Date().toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans print:hidden">
      {/* Floating Trigger Button kur paneli është i mbyllur */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Hap bisedën me AI Asistentin"
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-[#0B192C] hover:bg-[#11243E] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-emerald-500/30 hover:border-emerald-500"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-emerald-400 transition-transform group-hover:rotate-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
          </div>
          <span className="text-sm font-semibold pr-1">PronaX AI</span>
          <span className="hidden sm:inline-block text-xs bg-emerald-600/80 text-white font-medium px-2 py-0.5 rounded-full">
            Ndihmë 24/7
          </span>
        </button>
      )}

      {/* Dritarja e Chatbot-it */}
      {isOpen && (
        <div
          className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 overflow-hidden ${
            isMinimized
              ? 'w-80 h-14'
              : 'w-[92vw] sm:w-[400px] h-[550px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-[#0B192C] text-white px-4 py-3 flex items-center justify-between select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">PronaX AI Asistenti</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" title="Online" />
                </div>
                <p className="text-[11px] text-slate-300">Mbështetje Inteligjente Kosovë</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setLanguage(language === 'sq' ? 'en' : 'sq')}
                className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors mr-1"
                title="Ndërro gjuhën (SQ/EN)"
              >
                {language.toUpperCase()}
              </button>

              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                aria-label={isMinimized ? 'Zgjero' : 'Minimizo'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Mbyll"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Trupi i bisedës (shfaqet kur nuk është i minimizuar) */}
          {!isMinimized && (
            <>
              {/* Zona e mesazheve */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/40 text-sm">
                {messages.map((msg) => {
                  const isBot = msg.role === 'assistant';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isBot ? 'items-start' : 'items-end justify-end'}`}
                    >
                      {isBot && (
                        <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        </div>
                      )}

                      <div
                        className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl ${
                          isBot
                            ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/60 shadow-sm rounded-tl-sm'
                            : 'bg-emerald-600 text-white rounded-br-sm shadow'
                        }`}
                      >
                        <div className="whitespace-pre-line leading-relaxed text-[13px]">
                          {msg.content}
                        </div>

                        {msg.escalated && (
                          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Eskaluar tek administrata (pronaxestate@outlook.com)</span>
                          </div>
                        )}

                        <div
                          className={`text-[10px] mt-1 text-right ${
                            isBot ? 'text-slate-400' : 'text-emerald-100'
                          }`}
                        >
                          {msg.timestamp}
                        </div>
                      </div>

                      {!isBot && (
                        <div className="w-7 h-7 rounded-full bg-[#0B192C] flex items-center justify-center shrink-0 mb-0.5 text-white">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-emerald-500 animate-spin" />
                    </div>
                    <span>PronaX AI po përgjigjet...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Sugjerime pyetjesh të shpejta */}
              {messages.length <= 2 && (
                <div className="px-3 py-2 bg-slate-100/70 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex gap-1.5 overflow-x-auto scrollbar-none">
                  {QUICK_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="whitespace-nowrap text-[11px] bg-white dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-600 px-2.5 py-1 rounded-full transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input fusha */}
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={language === 'sq' ? 'Shkruani pyetjen tuaj këtu...' : 'Type your question here...'}
                    maxLength={1000}
                    disabled={isLoading}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-colors"
                  />

                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl transition-all active:scale-95 shrink-0"
                    aria-label="Dërgo"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    PronaX AI i Mbrojtur
                  </span>
                  <span>Planet: Falas (0€) | Javor (2.99€) | Mujor (9.99€)</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
