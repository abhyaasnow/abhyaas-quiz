import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, Eye, Database, Bell, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-600 selection:text-white pb-20">
      {/* Top Navigation Bar */}
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            Back to Home
          </Link>
          <span className="text-[11px] font-bold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full uppercase tracking-wide">
            Data Governance
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        {/* Header */}
        <div className="border-b border-slate-200 pb-8 mb-8">
          <div className="inline-flex items-center gap-2 text-blue-600 mb-2.5 text-xs font-bold tracking-wider uppercase">
            <Lock className="w-4 h-4" />
            Privacy &amp; Data Security Charter
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Candidate Privacy Policy
          </h1>
          <p className="mt-2.5 text-slate-600 text-xs sm:text-sm leading-relaxed">
            Effective Date: August 2026. This policy outlines how Abhyaas (abhyaasnow.in) collects, utilizes, and protects aspirant information across our examination infrastructure.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5 mb-3">
              <Database className="w-4 h-4 text-blue-600" />
              1. Information We Collect
            </h2>
            <p className="mb-3 text-slate-600">
              To administer authentic national-level mock tests, Olympiad rankings, and merit disbursements, we collect minimal and relevant information:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-xs sm:text-sm">
              <li><strong className="text-slate-900">Candidate Profile:</strong> Name, verified email address, contact number, and target exam category (UPSC, State PSC, SSC, Banking).</li>
              <li><strong className="text-slate-900">Academic Metrics:</strong> Test response data, accuracy timestamps, sectional time allocations, and All-India ranks.</li>
              <li><strong className="text-slate-900">Financial Verification Data:</strong> Bank account / UPI identifiers strictly required for disbursing verified merit scholarships.</li>
              <li><strong className="text-slate-900">Device &amp; Integrity Logs:</strong> IP address, browser type, and test-screen event logs (tab switching, focus loss) to maintain anti-cheat standards.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5 mb-4">
              <Eye className="w-4 h-4 text-blue-600" />
              2. How Your Information Is Used
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Exam Administration
                </h3>
                <p className="text-xs text-slate-600">To calculate percentile rankings, generate scorecards, and provide deep performance analytics.</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Grant Disbursement
                </h3>
                <p className="text-xs text-slate-600">To securely transfer academic scholarship amounts directly to verified rank holders.</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Platform Security
                </h3>
                <p className="text-xs text-slate-600">To prevent bot attacks, automated scripts, and unauthorized examination malpractice.</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Important Updates
                </h3>
                <p className="text-xs text-slate-600">To deliver schedule alerts, admit cards, and critical Olympiad syllabus notifications.</p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              3. Data Protection &amp; Zero Third-Party Selling
            </h2>
            <p className="mb-3 text-slate-600">
              <strong className="text-slate-900">Abhyaas does not sell, rent, or trade candidate personal data</strong> to third-party marketing agencies or coaching institutes.
            </p>
            <p className="text-slate-600">
              All sensitive transaction details are handled through RBI-regulated Payment Gateways via 256-bit TLS encryption. We do not store credit card numbers, debit card PINs, or net banking passwords on our servers.
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5 mb-3">
              <Bell className="w-4 h-4 text-amber-600" />
              4. Cookies &amp; Local Storage
            </h2>
            <p className="text-slate-600">
              We utilize essential session tokens and browser local storage solely to retain active test progress, user preferences (such as Hindi/English mode), and authentication tokens during network interruptions.
            </p>
          </section>

          {/* Section 5 */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-3">
              5. Candidate Data Rights &amp; Contact
            </h2>
            <p className="text-slate-600">
              Candidates maintain the right to review their profile details, request account deactivation, or query stored logs by reaching our Data Protection team at <strong className="text-blue-600">privacy@abhyaasnow.in</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}