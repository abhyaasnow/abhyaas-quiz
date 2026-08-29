'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LogIn, Menu, X, ShieldCheck 
} from 'lucide-react';
import AuthModal from './AuthModal';

export default function Navbar() {
  const pathname = usePathname();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: '/', labelHi: 'होम', labelEn: 'Home' },
    { href: '/practice', labelHi: 'अभ्यास केंद्र', labelEn: 'Practice' },
    { href: '/olympiad', labelHi: 'ओलंपियाड', labelEn: 'Olympiad', badge: '₹25L Pool' },
    { href: '/leaderboard', labelHi: 'मेधा सूची', labelEn: 'Leaderboard' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* 1. Left: Brand Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M250 80L380 250H300L250 185L200 250H120L250 80Z" fill="#F59E0B" />
                <path d="M80 275C160 300 220 345 250 375C280 345 340 300 420 275C390 350 320 400 250 430C180 400 110 350 80 275Z" fill="#1D4ED8" />
              </svg>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-black tracking-wider text-slate-900 leading-none">
                  ABHYAAS
                </span>
                <span className="text-[9px] font-bold text-amber-600 tracking-widest uppercase mt-0.5">
                  National Assessments
                </span>
              </div>
            </Link>

            {/* 2. Center: Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
              {navLinks.map((link) => {
                const isActive = mounted && pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs lg:text-sm transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span>{link.labelEn}</span>
                    <span className="text-[11px] text-slate-400 font-medium">({link.labelHi})</span>
                    {link.badge && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* 3. Right: Profile & Sign In CTA */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Profile Link */}
              <Link
                href="/profile"
                className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all border border-transparent hover:border-slate-200"
                title="Candidate Profile"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                  AS
                </div>
                <span className="hidden sm:inline">Profile</span>
              </Link>

              {/* Sign In Button */}
              <button
                onClick={() => setIsAuthOpen(true)}
                className="py-1.5 sm:py-2 px-3 sm:px-4 bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In <span className="hidden sm:inline font-normal">| लॉगिन</span></span>
              </button>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 md:hidden rounded-lg hover:bg-slate-100"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-150">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 px-3 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                <span>{link.labelEn} • {link.labelHi}</span>
                {link.badge && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Candidate OTP / Google Sign-In Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}