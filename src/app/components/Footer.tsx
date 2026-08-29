import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, HelpCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#080e1a] text-slate-400 text-xs border-t border-slate-800/80 selection:bg-blue-600 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top 4 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-slate-800/70">
          
          {/* Column 1: Brand & Bio (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              {/* Dual Triangle Logo Icon from SS1 */}
              <div className="flex flex-col items-center justify-center w-6 h-6">
                <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[8px] border-b-amber-500 mb-[1px]" />
                <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[8px] border-t-blue-500" />
              </div>
              <span className="text-white font-black text-xl tracking-wider">ABHYAAS</span>
            </Link>
            
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              India&apos;s premier academic assessment and scholarship examination platform for UPSC Civil Services, State PSC, and Competitive Aspirants.
            </p>

            <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-semibold pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>100% Verified Academic Evaluations</span>
            </div>
          </div>

          {/* Column 2: Programs & Practice (Span 3) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase">
              PROGRAMS &amp; PRACTICE
            </h4>
            <ul className="space-y-2.5 text-slate-400 text-xs">
              <li>
                <Link href="/olympiad" className="hover:text-white transition-colors">
                  National Scholarship Olympiad
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="hover:text-white transition-colors">
                  Daily Free Speed Drills (24x7)
                </Link>
              </li>
              <li>
                <Link href="/practice" className="hover:text-white transition-colors">
                  UPSC CSE Prelims PYQ Bank
                </Link>
              </li>
              <li>
                <Link href="/practice" className="hover:text-white transition-colors">
                  State PSC Topic Mastery
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-white transition-colors">
                  All-India Merit Scholarship List
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Compliance (Span 3) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase">
              LEGAL &amp; COMPLIANCE
            </h4>
            <ul className="space-y-2.5 text-slate-400 text-xs">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Examination &amp; Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-white transition-colors">
                  Refund &amp; Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/scholarship-rules" className="hover:text-white transition-colors">
                  Merit Scholarship &amp; Grant Criteria
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Anti-Cheating &amp; Integrity Code
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Aspirant Support (Span 2) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase">
              ASPIRANT SUPPORT
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Have queries regarding Olympiad registration or scholarship disbursement?
            </p>
            <div className="space-y-2 pt-1 text-xs">
              <Link
                href="/contact"
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span>support@abhyaasnow.in</span>
              </Link>
              <div className="flex items-center gap-2 text-slate-400">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Mon - Sat : 10:00 AM - 6:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Notice Bar from SS1 */}
        <div className="py-6 border-b border-slate-800/70 text-[11px] text-slate-400 leading-relaxed">
          <p>
            <strong className="text-slate-200 font-semibold">Academic Assessment Notice:</strong>{' '}
            Abhyaas is an educational testing portal conducting competitive mock assessments. The registration fees collected for Olympiad examinations are solely utilized for assessment conduction, ranking infrastructure, and merit scholarships. No wagering, betting, or games of chance are hosted on this platform.
          </p>
        </div>

        {/* Bottom Bar from SS1 */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 Abhyaas. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span>Empowering Aspirants Across India</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">Bilingual Learning Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}