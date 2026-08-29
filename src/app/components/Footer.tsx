import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Scale, Award, Mail, BookOpen, Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-xs selection:bg-indigo-500 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Brand & Mission Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-white font-extrabold text-lg tracking-tight">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-base shadow-md shadow-indigo-500/20">
                A
              </span>
              <span>Abhyaas<span className="text-indigo-400">.</span></span>
            </Link>
            <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
              India&apos;s transparent academic talent assessment and practice ecosystem. Helping serious aspirants master competitive exams through speed drills, chapter tests, and national merit scholarship olympiads.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Game of Pure Academic Skill & Knowledge
            </div>
          </div>

          {/* Column 1: Examination Tracks */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Exam Practice</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/practice" className="hover:text-indigo-400 transition-colors">
                  Subject Practice Bank
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="hover:text-indigo-400 transition-colors">
                  Live Speed Drill
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-indigo-400 transition-colors">
                  All-India Merit Board
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-indigo-400 transition-colors">
                  Candidate Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Olympiad Tiers */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Olympiad Tiers</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/olympiad" className="hover:text-indigo-400 transition-colors">
                  Weekly Speed Sprint
                </Link>
              </li>
              <li>
                <Link href="/olympiad" className="hover:text-indigo-400 transition-colors">
                  Monthly Mega Assessment
                </Link>
              </li>
              <li>
                <Link href="/olympiad" className="hover:text-indigo-400 transition-colors">
                  Quarterly Talent Search
                </Link>
              </li>
              <li>
                <Link href="/olympiad" className="hover:text-indigo-400 transition-colors">
                  Fellowship Grants
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Governance & Legal */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Legal & Support</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/terms" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <Scale className="w-3 h-3 text-slate-500" />
                  Terms of Examination
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-slate-500" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <Award className="w-3 h-3 text-slate-500" />
                  Refund & Cancellation
                </Link>
              </li>
              <li>
                <Link href="/scholarship-rules" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 text-slate-500" />
                  Scholarship Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-slate-500" />
                  Help & Contact Desk
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Compliance Disclaimer */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 Abhyaas (abhyaasnow.in). All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for competitive aspirants across India
          </p>
        </div>
      </div>
    </footer>
  );
}