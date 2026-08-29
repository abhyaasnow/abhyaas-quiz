import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, HelpCircle, FileText, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 pt-12 pb-24 sm:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          
          {/* Column 1: Brand & Academic Mission */}
          <div className="space-y-3.5 md:col-span-1">
            <div className="flex items-center gap-2">
              <svg className="w-7 h-7 flex-shrink-0" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M250 80L380 250H300L250 185L200 250H120L250 80Z" fill="#F59E0B" />
                <path d="M80 275C160 300 220 345 250 375C280 345 340 300 420 275C390 350 320 400 250 430C180 400 110 350 80 275Z" fill="#3B82F6" />
              </svg>
              <span className="text-xl font-black tracking-wider text-white">ABHYAAS</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's premier academic assessment and scholarship examination platform for UPSC Civil Services, State PSC, and Competitive Aspirants.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Verified Academic Evaluations</span>
            </div>
          </div>

          {/* Column 2: Academic Programs */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-widest">
              Programs & Practice
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  National Scholarship Olympiad
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Daily Free Speed Drills (24x7)
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  UPSC CSE Prelims PYQ Bank
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  State PSC Topic Mastery
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  All-India Merit Scholarship List
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Policies (Payment Gateway & Compliance) */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-widest">
              Legal & Compliance
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/terms" className="hover:text-amber-400 transition-colors">
                  Terms of Examination & Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-amber-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-amber-400 transition-colors">
                  Refund & Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/scholarship-rules" className="hover:text-amber-400 transition-colors">
                  Merit Scholarship & Grant Criteria
                </Link>
              </li>
              <li>
                <Link href="/fair-play" className="hover:text-amber-400 transition-colors">
                  Anti-Cheating & Integrity Code
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Candidate Helpdesk & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-widest">
              Aspirant Support
            </h4>
            <p className="text-xs text-slate-400">
              Have queries regarding Olympiad registration or scholarship disbursement?
            </p>
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>support@abhyaasnow.in</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Mon - Sat : 10:00 AM - 6:00 PM</span>
              </div>
            </div>
          </div>

        </div>

        {/* Legal Disclaimer Box (Strict Academic Protection) */}
        <div className="pt-6 pb-4 text-[11px] text-slate-500 leading-relaxed text-center sm:text-left space-y-1">
          <p>
            <strong className="text-slate-400 font-bold">Academic Assessment Notice:</strong> Abhyaas is an educational testing portal conducting competitive mock assessments. The registration fees collected for Olympiad examinations are solely utilized for assessment conduction, ranking infrastructure, and merit scholarships. No wagering, betting, or games of chance are hosted on this platform.
          </p>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Abhyaas. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Empowering Aspirants Across India</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">Bilingual Learning Platform</span>
          </div>
        </div>

      </div>
    </footer>
  );
}