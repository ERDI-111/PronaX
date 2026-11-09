'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MessageSquare, Send, User, Building2, Clock, CheckCheck } from 'lucide-react';

interface Message {
  id: string;
  sender: 'buyer' | 'seller';
  text: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  userName: string;
  propertyTitle: string;
  propertyPrice: string;
  lastMessage: string;
  unread: boolean;
  messages: Message[];
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv-1',
      userName: 'Flamur Krasniqi',
      propertyTitle: 'Lokal afarist modern në qendër të Pejës',
      propertyPrice: '750 €/muaj',
      lastMessage: 'A mund ta vizitoj lokalin nesër rreth orës 14:00?',
      unread: true,
      messages: [
        { id: 'm1', sender: 'buyer', text: 'Përshëndetje! Jam i interesuar për lokalin tuaj afarist.', timestamp: '10:15' },
        { id: 'm2', sender: 'seller', text: 'Përshëndetje Flamur! Po, lokali është i lirë për shfrytëzim.', timestamp: '10:20' },
        { id: 'm3', sender: 'buyer', text: 'A mund ta vizitoj lokalin nesër rreth orës 14:00?', timestamp: '10:32' },
      ],
    },
    {
      id: 'conv-2',
      userName: 'Arben Gashi',
      propertyTitle: 'Vilë luksoze me pamje malore në Brezovicë',
      propertyPrice: '240,000 €',
      lastMessage: 'Faleminderit për informacionin mbi lejen e ndërtimit.',
      unread: false,
      messages: [
        { id: 'm4', sender: 'buyer', text: 'Përshëndetje, a ka vila fletë poseduese të rregullt?', timestamp: 'Dje' },
        { id: 'm5', sender: 'seller', text: 'Po, çdo dokumentacion kadastral është 1/1 në emër timin.', timestamp: 'Dje' },
        { id: 'm6', sender: 'buyer', text: 'Faleminderit për informacionin mbi lejen e ndërtimit.', timestamp: 'Dje' },
      ],
    },
  ]);

  const [activeConvId, setActiveConvId] = useState<string>('conv-1');
  const [inputText, setInputText] = useState('');

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

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

        {/* Messaging Box */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[540px]">
          {/* Left: Conversations list */}
          <div className="md:col-span-5 border-r border-slate-100 flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-700">
              Bisedat Aktive ({conversations.length})
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
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {c.userName.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 truncate">{c.userName}</span>
                      {c.unread && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 block truncate">{c.propertyTitle}</span>
                    <span className="text-[11px] text-slate-500 block truncate mt-0.5">{c.lastMessage}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Message history & composer */}
          <div className="md:col-span-7 flex flex-col justify-between">
            {/* Conversation header */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 block">{activeConv.userName}</span>
                <span className="text-[11px] text-slate-500">{activeConv.propertyTitle} • {activeConv.propertyPrice}</span>
              </div>
            </div>

            {/* Messages body */}
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              {activeConv.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'seller' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                      m.sender === 'seller'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-slate-100 text-slate-900 rounded-bl-none'
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

            {/* Input Composer */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Shkruani përgjigjen tuaj këtu..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                title="Dërgo"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
