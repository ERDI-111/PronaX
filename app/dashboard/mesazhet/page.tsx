'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { MessageSquare, Send, User, Building2, Clock, CheckCheck, Mail, ArrowRight } from 'lucide-react';

interface Message {
  id: string;
  sender: 'buyer' | 'seller';
  text: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  propertyTitle: string;
  propertyPrice?: string;
  lastMessage: string;
  unread: boolean;
  messages: Message[];
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    fetch('/api/messages')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.messages && Array.isArray(data.messages)) {
          const convs: Conversation[] = data.messages.map((m: any) => ({
            id: m.id,
            userName: m.name,
            userEmail: m.email,
            userPhone: m.phone,
            propertyTitle: m.property_title || m.subject || 'Pyetje e përgjithshme',
            lastMessage: m.message,
            unread: !m.is_read,
            messages: [
              {
                id: `m-${m.id}`,
                sender: 'buyer',
                text: m.message,
                timestamp: new Date(m.created_at).toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' }),
              },
            ],
          }));
          setConversations(convs);
          if (convs.length > 0) {
            setActiveConvId(convs[0].id);
          }
        }
      })
      .catch(() => {
        // Empty state on error
        setConversations([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      sender: 'seller',
      text: inputText,
      timestamp: new Date().toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations(prev => prev.map(c => {
      if (c.id === activeConvId) {
        return {
          ...c,
          lastMessage: inputText,
          messages: [...c.messages, newMsg],
        };
      }
      return c;
    }));

    setInputText('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
            <span>Paneli i Përdoruesit</span>
            <span>/</span>
            <span>Komunikimi</span>
          </div>
          <h1 className="text-3xl font-black text-[#0B192C] tracking-tight">
            Mesazhet e Blerësve & Pyetjet
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Komuniko drejtpërdrejt me blerësit dhe qiramarrësit e interesuar për pronat e tua.
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-16 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-xs text-slate-500">Duke ngarkuar mesazhet...</span>
          </div>
        ) : conversations.length === 0 ? (
          /* Clean Empty State (Production Ready) */
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-black text-[#0B192C] mb-2">Ende nuk keni mesazhe të reja</h3>
            <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
              Kur blerësit ose qiramarrësit e interesuar ju shkruajnë përmes formularit të kontaktit të pronave tuaja, bisedat e tyre do të shfaqen këtu menjëherë.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/dashboard/pronat"
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Menaxho Pronat e Mia
              </Link>
              <Link
                href="/publiko"
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Publiko Pronë të Re</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          /* Active Messaging Box */
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[540px]">
            {/* Left: Conversations list */}
            <div className="md:col-span-5 border-r border-slate-100 flex flex-col">
              <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-700 flex justify-between items-center">
                <span>Bisedat Aktive ({conversations.length})</span>
              </div>

              <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
                {conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveConvId(c.id)}
                    className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-start gap-3 ${
                      activeConvId === c.id ? 'bg-emerald-50/40 border-l-4 border-emerald-600' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {c.userName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="font-bold text-xs text-slate-900 truncate">{c.userName}</span>
                        {c.unread && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-700 truncate mb-1">
                        {c.propertyTitle}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{c.lastMessage}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Active Chat View */}
            <div className="md:col-span-7 flex flex-col">
              {activeConv ? (
                <>
                  {/* Chat header */}
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                        {activeConv.userName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{activeConv.userName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          {activeConv.userEmail && <span>{activeConv.userEmail}</span>}
                          {activeConv.userPhone && <span>• {activeConv.userPhone}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] font-bold text-emerald-600">{activeConv.propertyTitle}</div>
                    </div>
                  </div>

                  {/* Messages scroll */}
                  <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50/50">
                    {activeConv.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex flex-col ${m.sender === 'seller' ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${
                            m.sender === 'seller'
                              ? 'bg-emerald-600 text-white rounded-br-xs'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-xs'
                          }`}
                        >
                          {m.text}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {m.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Chat input */}
                  <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-white flex gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Shkruaj përgjigjen tuaj..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dërgo</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-xs">
                  Zgjidhni një bisedë nga kolona majtas
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
