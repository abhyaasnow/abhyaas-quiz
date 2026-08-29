'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronDown, 
  BookOpen, 
  Award, 
  Trophy, 
  Sparkles,
  ArrowRight,
  Menu,
  X,
  GraduationCap,
  Landmark,
  Compass,
  User as UserIcon,
  LogOut,
  Wallet
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const { user, signInWithGoogle, logout } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (menu: string) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  return (
    <header ref={navRef} className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="flex flex-col items-center justify-center w-6 h-6">
              <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[8px] border-b-amber-500 mb-[1px]" />
              <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[8px] border-t-blue-600" />
            </div>
            <span className="font-black text-xl tracking-wider text-slate-900 leading-none">
              ABHYAAS<span className="text-blue-600">.</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-semibold">
            
            {/* Target Exams Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('exams')}
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeDropdown === 'exams' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <Compass className="w-4 h-4 text-blue-600" />
                <span>Target Exams</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'exams' ? 'rotate-180 text-blue-600' : ''}`} />
              </button>

              {activeDropdown === 'exams' && (
                <div className="absolute left-0 top-full mt-2 w-[680px] bg-white border border-slate-200 rounded-2xl shadow-xl p-5 grid grid-cols-3 gap-5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wide">
                      <Landmark className="w-3.5 h-3.5 text-blue-600" />
                      Civil Services
                    </div>
                    <ul className="space-y-2 text-slate-600 font-medium">
                      <li><Link href="/practice" onClick={() => setActiveDropdown(null)} className="hover:text-blue-600 block">UPSC CSE (IAS/IPS)</Link></li>
                      <li><Link href="/practice" onClick={() => setActiveDropdown(null)} className="hover:text-blue-600 block">State PCS (UPPSC, BPSC)</Link></li>
                      <li><Link href="/practice" onClick={() => setActiveDropdown(null)} className="hover:text-blue-600 block">Daily Current Affairs</Link></li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wide">
                      <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                      Govt &amp; Graduate
                    </div>
                    <ul className="space-y-2 text-slate-600 font-medium">
                      <li><Link href="/practice" onClick={() => setActiveDropdown(null)} className="hover:text-blue-600 block">SSC CGL Tier 1 &amp; 2</Link></li>
                      <li><Link href="/practice" onClick={() => setActiveDropdown(null)} className="hover:text-blue-600 block">Banking (SBI / IBPS PO)</Link></li>
                      <li><Link href="/practice" onClick={() => setActiveDropdown(null)} className="hover:text-blue-600 block">Quantitative &amp; CSAT</Link></li>
                    </ul>
                  </div>

                  <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-900 font-bold text-xs uppercase tracking-wide">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      National Olympiads
                    </div>
                    <ul className="space-y-2 text-slate-600 font-medium text-xs">
                      <li><Link href="/olympiad" onClick={() => setActiveDropdown(null)} className="hover:text-blue-600 block">Weekly Sprint (₹49)</Link></li>
                      <li><Link href="/olympiad" onClick={() => setActiveDropdown(null)} className="hover:text-blue-600 block">Monthly Mega (₹199)</Link></li>
                      <li><Link href="/olympiad" onClick={() => setActiveDropdown(null)} className="hover:text-blue-600 block text-blue-600 font-bold">View Merit Grants →</Link></li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <Link href="/practice" className="px-3 py-2 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Practice Bank</span>
            </Link>

            <Link href="/olympiad" className="px-3 py-2 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Olympiads</span>
              <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] rounded font-bold">Live</span>
            </Link>

            <Link href="/leaderboard" className="px-3 py-2 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Rankings</span>
            </Link>
          </nav>

          {/* Right Action: Daily Speed Drill + Candidate Sign In Button */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/quiz"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition shadow-sm flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daily Speed Drill</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.displayName?.charAt(0) || 'A'}
                  </div>
                  <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate">
                    {user.displayName?.split(' ')[0] || 'Candidate'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 space-y-1 animate-in fade-in duration-150">
                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4 text-blue-600" />
                      <span>My Profile &amp; Stats</span>
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Wallet className="w-4 h-4 text-amber-500" />
                      <span>Scholarship Wallet</span>
                    </Link>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Candidate Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden flex items-center gap-2">
            {user ? (
              <Link href="/profile" className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                {user.displayName?.charAt(0) || 'A'}
              </Link>
            ) : (
              <button onClick={signInWithGoogle} className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg">
                Sign In
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}