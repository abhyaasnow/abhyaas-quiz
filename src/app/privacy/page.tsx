import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, Eye, Database, Bell, CheckCircle } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white pb-20">
      {/* Top Navigation */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
            Data Governance
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 pt-10">
        {/* Header */}
        <div className="border-b border-slate-800 pb-8 mb-8">
          <div className="inline-flex items-center gap-2 text-indigo-400 mb-3 text-sm font-semibold tracking-wide uppercase">
            <Lock className="w-4 h-4" />
            Privacy & Data Security Policy
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Candidate Privacy Policy
          </h1>
          <p className="mt-3 text-slate-400 text-sm leading-relaxed">
            Effective Date: August 2026. This policy outlines how Abhyaas (abhyaasnow.in) collects, utilizes, and protects aspirant information across our examination infrastructure.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 text-slate-300 text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
              <Database className="w-5 h-5 text-indigo-400" />
              1. Information We Collect
            </h2>
            <p className="mb-3">
              To administer authentic national-level mock tests, Olympiad rankings, and merit disbursements, we collect minimal and relevant information:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li><strong>Candidate Profile:</strong> Name, verified email address, contact number, and target exam category.</li>
              <li><strong>Academic Metrics:</strong> Test response data, accuracy timestamps, sectional time allocations, and All-India ranks.</li>
              <li><strong>Financial Verification Data:</strong> Bank account / UPI identifiers strictly required for disbursing verified merit scholarships.</li>
              <li><strong>Device & Integrity Logs:</strong> IP address, browser type, and test-screen event logs (tab switching, focus loss) to maintain anti-cheat standards.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
              <Eye className="w-5 h-5 text-indigo-400" />
              2. How Your Information Is Used
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 mt-3">
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                <h3 className="font-semibold text-white mb-1.5 flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Exam Administration
                </h3>
                <p className="text-xs text-slate-400">To calculate percentile rankings, generate scorecards, and provide performance analytics.</p>
              </div>
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                <h3 className="font-semibold text-white mb-1.5 flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Grant Disbursement
                </h3>
                <p className="text-xs text-slate-400">To securely transfer academic scholarship amounts directly to verified rank holders.</p>
              </div>
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                <h3 className="font-semibold text-white mb-1.5 flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Platform Security
                </h3>
                <p className="text-xs text-slate-400">To prevent bot attacks, automated scripts, and unauthorized examination malpractice.</p>
              </div>
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                <h3 className="font-semibold text-white mb-1.5 flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Important Updates
                </h3>
                <p className="text-xs text-slate-400">To deliver schedule alerts, admit cards, and critical Olympiad syllabus changes.</p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-indigo-400" />
              3. Data Protection & Zero Third-Party Selling
            </h2>
            <p className="mb-3">
              <strong>Abhyaas does not sell, rent, or trade candidate personal data</strong> to third-party marketing agencies or coaching institutes.
            </p>
            <p>
              All sensitive transaction details are handled through RBI-regulated Payment Gateways via 256-bit TLS encryption. We do not store credit card numbers, debit card PINs, or net banking passwords on our servers.
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-indigo-400" />
              4. Cookies & Local Storage
            </h2>
            <p>
              We utilize essential session tokens and browser local storage solely to retain active test progress, user preferences (such as Hindi/English mode), and authentication tokens during network interruptions.
            </p>
          </section>

          {/* Section 5 */}
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-3">
              5. Candidate Data Rights & Contact
            </h2>
            <p>
              Candidates maintain the right to review their profile details, request account deactivation, or query stored logs by reaching our Data Protection team at <strong>privacy@abhyaasnow.in</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}