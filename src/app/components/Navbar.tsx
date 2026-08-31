'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ChevronDown, 
  BookOpen, 
  Award, 
  Trophy, 
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Menu,
  X,
  GraduationCap,
  Landmark,
  Compass,
  User as UserIcon,
  LogOut,
  Wallet,
  Home as HomeIcon,
  School,
  BookMarked
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customLogo, setCustomLogo] = useState<string | null>(null);

  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const isHomePage = pathname === '/';

  // Load custom logo from Admin storage on load & on storage updates
  useEffect(() => {
    const savedLogo = localStorage.getItem('abhyaas_header_logo');
    if (savedLogo) {
      setCustomLogo(savedLogo);
    }

    const handleStorageChange = () => {
      const updated = localStorage.getItem('abhyaas_header_logo');
      setCustomLogo(updated);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Route change par drawer close
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setUserDropdownOpen(false);
  }, [pathname]);

  // Admin & Quiz portal par navbar hide rahega
  if (pathname === '/quiz' || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Clean Arrow Icon (Subpages only) + Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!isHomePage && (
              <button
                type="button"
                onClick={() => router.back()}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 text-slate-800" />
              </button>
            )}

            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              {customLogo ? (
                <img src={customLogo} alt="Abhyaas" className="h-8 max-w-[140px] object-contain" />
              ) : (
                <>
                  <div className="flex flex-col items-center justify-center w-6 h-6">
                    <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[8px] border-b-amber-500 mb-[1px]" />
                    <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[8px] border-t-blue-600" />
                  </div>
                  <span className="font-black text-xl tracking-wider text-slate-900 leading-none">
                    ABHYAAS<span className="text-blue-600">.</span>
                  </span>
                </>
              )}
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-semibold">
            
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                isHomePage ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              <HomeIcon className="w-4 h-4" />
              <span>Home</span>
            </Link>

            {/* 1. Target Exams Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'exams' ? null : 'exams')}
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeDropdown === 'exams' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <Compass className="w-4 h-4 text-blue-600" />
                <span>Target Exams</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'exams' ? 'rotate-180 text-blue-600' : ''}`} />
              </button>

              {activeDropdown === 'exams' && (
                <div className="absolute left-0 top-full mt-2 w-[680px] bg-white border border-slate-200 rounded-2xl shadow-xl p-5 grid grid-cols-3 gap-5 animate-in fade-in duration-150 z-50">
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
                      <li><Link href="/practice" onClick={() => setActiveDropdown(null)} className="hover:text-blue-600 block">Banking (SBI / IBPS)</Link></li>
                      <li><Link href="/practice" onClick={() => setActiveDropdown(null)} className="hover:text-blue-600 block">CSAT &amp; Quantitative</Link></li>
                    </ul>
                  </div>

                  <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-900 font-bold text-xs uppercase tracking-wide">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      National Olympiad
                    </div>
                    <ul className="space-y-2 text-slate-600 font-medium text-xs">
                      <li><Link href="/olympiad" onClick={() => setActiveDropdown(null)} className="hover:text-blue-600 block">Weekly Sprint (₹49)</Link></li>
                      <li><Link href="/olympiad" onClick={() => setActiveDropdown(null)} className="hover:text-blue-600 block">Monthly Mega (₹199)</Link></li>
                      <li><Link href="/olympiad" onClick={() => setActiveDropdown(null)} className="hover:text-blue-600 block text-blue-600 font-bold">Merit Grants Info →</Link></li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Classes (1st - 12th) Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'classes' ? null : 'classes')}
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeDropdown === 'classes' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <School className="w-4 h-4 text-emerald-600" />
                <span>Classes (1st - 12th)</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'classes' ? 'rotate-180 text-blue-600' : ''}`} />
              </button>

              {activeDropdown === 'classes' && (
                <div className="absolute left-0 top-full mt-2 w-[720px] bg-white border border-slate-200 rounded-2xl shadow-xl p-5 grid grid-cols-4 gap-4 animate-in fade-in duration-150 z-50">
                  
                  {/* Primary Wing */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 text-slate-900 font-bold text-xs uppercase">
                      <BookMarked className="w-3.5 h-3.5 text-emerald-600" />
                      Class 1 - 5
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">Primary Wing</p>
                    <ul className="space-y-2 text-slate-600 text-xs">
                      <li><Link href="/practice" onClick={() => setActiveDropdown(null)} className="hover:text-blue-600 block">Basic Mathematics</Link></li>
                      <li><Link href="/practice" onClick={() => setActiveDropdown(null)} className="hover:text-blue-600 block">EVS &amp; General Science</Link></li>
                      <li><Link href="/practice" onClick={() => setActiveDropdown(null)} className="hover:text-blue-600 block">Junior Mental Ability</Link></li>
                    </ul>
                  </div>

                  {/* Middle School */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 text-slate-900 font-bold text-xs uppercase">
                      <BookMarked className="w-3.5 h-3.5 text-blue-600" />
                      Class 6 - 8
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">Middle School</p>
                    <ul className="space-y-2 text-slate-600 text-xs">
                      <li><Link href="/practice" onClick={() => setActiveDropdown(null)} className="hover:text-blue-600 block">NCERT Science</Link></li>
                      <li><Link href="/practice" onClick={() => setActiveDropdown(null)} className="hover:text-blue-600 block">Mathematics Foundation</Link></li>
                      <li><Link href="/practice" onClick={() => setActiveDropdown(null)} className="hover:text-blue-600 block">Social Studies (SST)</Link></li>
                    </ul>
                  </div>

                  {/* Secondary */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 text-slate-900 font-bold text-xs uppercase">
                      <BookMarked className="w-3.5 h-3.5 text-amber-600" />
                      Class 9 - 10
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">Secondary Board</p>
                    <ul className="space-y-2 text-slate-600 text-xs">
                      <li><Link href="/practice" onClick={() => setActiveDropdown(null)} className="hover:text-blue-600 block">Physics &amp; Chemistry</Link></li>
                      <li><Link href="/practice" onClick={() => setActiveDropdown(null)} className="hover:text-blue-600 block">Biology &amp; Ecology</Link></li>
                      <li><Link href="/practice" onClick={() => setActiveDropdown(null)} className="hover:text-blue-600 block">Class 10 Board Mock</Link></li>
                    </ul>
                  </div>

                  {/* Senior Secondary */}
                  <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200 text-slate-900 font-bold text-xs uppercase">
                      <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                      Class 11 - 12
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">Sr. Secondary</p>
                    <ul className="space-y-2 text-slate-600 text-xs">
                      <li><Link href="/practice" onClick={() => setActiveDropdown(null)} className="hover:text-blue-600 block">Science (PCM/PCB)</Link></li>
                      <li><Link href="/practice" onClick={() => setActiveDropdown(null)} className="hover:text-blue-600 block">Commerce &amp; Accounts</Link></li>
                      <li><Link href="/practice" onClick={() => setActiveDropdown(null)} className="hover:text-blue-600 block">Arts &amp; Humanities</Link></li>
                    </ul>
                  </div>

                </div>
              )}
            </div>

            <Link 
              href="/practice" 
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                pathname === '/practice' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Practice Bank</span>
            </Link>

            <Link 
              href="/olympiad" 
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                pathname === '/olympiad' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Olympiads</span>
              <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] rounded font-bold">Live</span>
            </Link>

            <Link 
              href="/leaderboard" 
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                pathname === '/leaderboard' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Rankings</span>
            </Link>
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/quiz"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daily Speed Drill</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {user ? (
              <div className="relative">
                <button
                  type="button"
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
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 space-y-1 animate-in fade-in duration-150 z-50">
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
                      type="button"
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
              <Link
                href="/login"
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Candidate Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="lg:hidden flex items-center gap-2">
            {user ? (
              <Link
                href="/profile"
                className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm"
              >
                {user.displayName?.charAt(0) || 'A'}
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl"
              >
                Sign In
              </Link>
            )}
            
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-800 active:bg-slate-200 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-rose-600" /> : <Menu className="w-5 h-5 text-slate-800" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Down Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bg-white border-b-2 border-blue-600 shadow-2xl z-50 p-4 space-y-2 animate-in slide-in-from-top-2 duration-150 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 text-slate-900 font-bold text-sm"
          >
            <HomeIcon className="w-4 h-4 text-blue-600" />
            <span>Home</span>
          </Link>

          <Link
            href="/practice"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 text-slate-900 font-bold text-sm"
          >
            <Compass className="w-4 h-4 text-blue-600" />
            <span>Target Exams (UPSC / State PSC)</span>
          </Link>

          <Link
            href="/practice"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 text-slate-900 font-bold text-sm"
          >
            <School className="w-4 h-4 text-emerald-600" />
            <span>Classes (Class 1st to 12th)</span>
          </Link>

          <Link
            href="/practice"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 text-slate-900 font-bold text-sm"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Practice Bank</span>
          </Link>

          <Link
            href="/olympiad"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-slate-900 font-bold text-sm"
          >
            <div className="flex items-center gap-3">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>National Olympiads</span>
            </div>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs rounded-full font-black">Live</span>
          </Link>

          <Link
            href="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 text-slate-900 font-bold text-sm"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Rankings &amp; Merit Board</span>
          </Link>

          <Link
            href="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 text-slate-900 font-bold text-sm"
          >
            <Wallet className="w-4 h-4 text-amber-600" />
            <span>Candidate Profile &amp; Wallet</span>
          </Link>

          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm"
          >
            <UserIcon className="w-4 h-4 text-blue-600" />
            <span>Candidate Sign In / Register</span>
          </Link>

          <div className="pt-2">
            <Link
              href="/quiz"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 bg-blue-600 active:bg-blue-700 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Speed Drill</span>
            </Link>
          </div>

          {user && (
            <button
              type="button"
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="w-full p-3 rounded-xl border border-rose-200 text-rose-600 font-bold text-xs flex items-center justify-center gap-2 active:bg-rose-50 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Account</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}