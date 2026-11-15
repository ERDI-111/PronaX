'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  Map as MapIcon, 
  Heart, 
  MessageSquare, 
  PlusCircle, 
  Activity, 
  Menu,
  X,
  Users,
  LogIn,
  LogOut,
  ChevronDown,
  User,
  UserPlus,
  Home,
  ShoppingBag,
  Key,
  Sun,
  Moon,
  Scale,
  Calculator
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useCompare } from '@/lib/compare/CompareContext';

function HeaderContent() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();
  const { items: compareItems } = useCompare();

  const [currentUser, setCurrentUser] = useState<{ email: string; fullName?: string; role?: string; avatarUrl?: string } | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const raw = localStorage.getItem('pronax_user');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.email) {
            setCurrentUser(parsed);
            return;
          }
        }
        if (typeof document !== 'undefined') {
          const match = document.cookie.match(/pronax_verified_login=([^;]+)/);
          if (match && match[1]) {
            const email = decodeURIComponent(match[1]);
            setCurrentUser({ email, fullName: email.split('@')[0] });
            return;
          }
        }
        setCurrentUser(null);
      } catch {
        setCurrentUser(null);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('pronax_auth_change', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('pronax_auth_change', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('pronax_user');
      document.cookie = 'pronax_verified_login=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    } catch {}
    setCurrentUser(null);
    setUserDropdownOpen(false);
    window.dispatchEvent(new Event('pronax_auth_change'));
    window.location.href = '/';
  };

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/');

  const navLinks = [
    { href: '/', label: 'Ballina', icon: Home },
    { href: '/prona?tipi=shitje', label: 'Blej Pronë', icon: ShoppingBag, matchPath: '/prona' },
    { href: '/prona?tipi=qira', label: 'Me Qira', icon: Key },
    { href: '/harta', label: 'Harta', icon: MapIcon },
    { href: '/krahaso', label: 'Krahaso', icon: Scale },
    { href: '/kalkulatori', label: 'Kalkulatori', icon: Calculator },
    { href: '/agjencite', label: 'Agjencitë', icon: Users },
    { href: '/dashboard/favoritet', label: 'Favoritet', icon: Heart },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#0B192C] text-white shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4 py-3">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0" onClick={() => setMobileOpen(false)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              P
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white">Prona</span>
                <span className="text-xl font-black text-emerald-400">X</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold uppercase tracking-wider ml-1 hidden sm:inline">
                  Kosovë
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide hidden lg:block">
                Prona që kërkon. Shtëpia që meriton.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-300">
            {navLinks.map(link => {
              const Icon = link.icon;
              const active = isActive(link.matchPath || link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
                    active
                      ? 'bg-emerald-600/20 text-emerald-400'
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Compare Link */}
            <Link
              href="/krahaso"
              className="relative p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all flex items-center justify-center"
              title="Krahaso Pronat"
              aria-label="Krahaso Pronat"
            >
              <Scale className="w-4 h-4" />
              {compareItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-[#0B192C] text-[10px] font-black rounded-full flex items-center justify-center shadow-sm">
                  {compareItems.length}
                </span>
              )}
            </Link>

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
              aria-label={isDark ? 'Mënyra e ditës' : 'Mënyra e natës'}
              title={isDark ? 'Mënyra e ditës' : 'Mënyra e natës'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <NotificationBell />

            {/* Auth Buttons / User Profile - Desktop */}
            {currentUser ? (
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white transition-all shadow-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs uppercase border border-emerald-500/30 overflow-hidden">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      currentUser.email.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <span className="max-w-[120px] truncate text-slate-200">
                    {currentUser.fullName || currentUser.email.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0B192C] border border-slate-700/80 shadow-2xl p-2 z-40 text-xs space-y-1">
                      <div className="px-3 py-2 border-b border-slate-800">
                        <p className="font-bold text-white truncate">
                          {currentUser.fullName || 'Përdorues PronaX'}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                      </div>

                      <Link
                        href="/dashboard/pronat"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 hover:text-white transition-all font-medium"
                      >
                        <Building2 className="w-4 h-4 text-emerald-400" />
                        <span>Pronat e Mia</span>
                      </Link>

                      <Link
                        href="/dashboard/favoritet"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 hover:text-white transition-all font-medium"
                      >
                        <Heart className="w-4 h-4 text-rose-400" />
                        <span>Favoritet</span>
                      </Link>

                      <Link
                        href="/dashboard/mesazhet"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 hover:text-white transition-all font-medium"
                      >
                        <MessageSquare className="w-4 h-4 text-sky-400" />
                        <span>Mesazhet</span>
                      </Link>

                      {(currentUser.role === 'admin' || currentUser.email === 'pronaxestate@outlook.com') && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-300 hover:bg-amber-950/40 hover:text-amber-200 transition-all font-medium"
                        >
                          <Activity className="w-4 h-4 text-amber-400" />
                          <span>Paneli Administrator</span>
                        </Link>
                      )}

                      <div className="border-t border-slate-800 pt-1 mt-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-all font-medium text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Çkyçu (Dil)</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/kycu"
                  className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-800 transition-all flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Kyçu</span>
                </Link>

                <Link
                  href="/admin/dashboard"
                  className="text-xs font-semibold text-amber-300 hover:text-amber-200 px-2.5 py-2 rounded-xl hover:bg-amber-900/30 transition-all flex items-center gap-1"
                  title="Paneli Admin"
                >
                  <Activity className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* CTA Button */}
            <Link
              href="/publiko"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2.5 rounded-xl shadow-md shadow-emerald-900/30 transition-all text-xs whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Publiko Pronën</span>
              <span className="sm:hidden">+</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
              aria-label="Hap menunë"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <div className="relative ml-auto w-72 bg-[#0B192C] h-full shadow-2xl flex flex-col border-l border-slate-800 overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <span className="text-sm font-black text-white">Navigimi</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-5 space-y-1 text-sm">
              {navLinks.map(link => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-200 hover:bg-slate-800 hover:text-white transition-all font-medium"
                  >
                    <Icon className="w-5 h-5 text-emerald-400" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              <div className="border-t border-slate-800 pt-3 mt-3 space-y-1">
                <Link
                  href="/dashboard/pronat"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-200 hover:bg-slate-800 hover:text-white transition-all font-medium"
                >
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <span>Pronat e Mia</span>
                </Link>
                <Link
                  href="/dashboard/mesazhet"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-200 hover:bg-slate-800 hover:text-white transition-all font-medium"
                >
                  <MessageSquare className="w-5 h-5 text-sky-400" />
                  <span>Mesazhet</span>
                </Link>
              </div>

              <div className="border-t border-slate-800 pt-3 mt-3 space-y-2">
                {currentUser ? (
                  <>
                    <div className="px-4 py-2.5 bg-slate-850 rounded-xl border border-slate-700/80">
                      <p className="text-xs font-bold text-white truncate">
                        {currentUser.fullName || currentUser.email}
                      </p>
                      <p className="text-[10px] text-emerald-400 font-semibold tracking-wide">● I Kyçur</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-950/30 transition-all font-medium text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Çkyçu (Dil)</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/kycu"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-200 hover:bg-slate-800 hover:text-white transition-all font-medium"
                    >
                      <LogIn className="w-5 h-5 text-slate-400" />
                      <span>Kyçu</span>
                    </Link>
                    <Link
                      href="/regjistrohu"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-700/30 text-emerald-300 hover:bg-emerald-700/50 transition-all font-semibold"
                    >
                      <UserPlus className="w-5 h-5" />
                      <span>Regjistrohu Falas</span>
                    </Link>
                  </>
                )}
                {/* Dark mode toggle in mobile */}
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-200 hover:bg-slate-800 hover:text-white transition-all font-medium"
                >
                  {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-400" />}
                  <span>{isDark ? 'Mënyra e Ditës' : 'Mënyra e Natës'}</span>
                </button>
              </div>

              <div className="border-t border-slate-800 pt-3 mt-3">
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-amber-300 hover:bg-amber-900/30 transition-all font-medium"
                >
                  <Activity className="w-5 h-5" />
                  <span>Paneli Admin</span>
                </Link>
              </div>
            </nav>

            <div className="px-4 pb-6">
              <Link
                href="/publiko"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all text-sm"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Publiko Pronën Tënde</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Header() {
  return (
    <Suspense fallback={
      <header className="sticky top-0 z-50 bg-[#0B192C] text-white shadow-md border-b border-slate-800 h-16" />
    }>
      <HeaderContent />
    </Suspense>
  );
}
