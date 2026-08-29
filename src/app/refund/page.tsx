import React from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, AlertTriangle, CheckCircle2, HelpCircle, Clock } from 'lucide-react';

export default function RefundPage() {
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
            Payment & Cancellation
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 pt-10">
        {/* Header */}
        <div className="border-b border-slate-800 pb-8 mb-8">
          <div className="inline-flex items-center gap-2 text-indigo-400 mb-3 text-sm font-semibold tracking-wide uppercase">
            <RefreshCw className="w-4 h-4" />
            Fee Policy & Cancellation Guidelines
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Refund & Cancellation Policy
          </h1>
          <p className="mt-3 text-slate-400 text-sm leading-relaxed">
            Effective Date: August 2026. This policy outlines fee structures, slot cancellations, and refund eligibility criteria for assessments conducted on Abhyaas (abhyaasnow.in).
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 text-slate-300 text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-indigo-400" />
              1. General Examination Fee Policy
            </h2>
            <p className="mb-3">
              Registration fees paid for timed All-India Olympiads, Speed Drills, and Subject Sprints represent operational examination processing charges. These funds are allocated in advance towards cloud server capacity, automated proctoring engines, and question-paper provisioning.
            </p>
            <p>
              Once a candidate initiates or attempts an examination slot, the fee is deemed fully utilized and non-refundable.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              2. Eligible Refund Scenarios
            </h2>
            <p className="mb-3">Full (100%) refunds or automated test re-slotting are granted under the following exceptional circumstances:</p>
            <div className="space-y-3">
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                <h3 className="font-semibold text-white mb-1 text-sm">Platform Server Outages</h3>
                <p className="text-xs text-slate-400">If our cloud infrastructure experiences unexpected downtime during a live synchronized mega exam that prevents test completion.</p>
              </div>
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                <h3 className="font-semibold text-white mb-1 text-sm">Duplicate Transactions</h3>
                <p className="text-xs text-slate-400">If a candidate is debited twice for a single test slot due to a network or payment gateway glitch, the excess amount is auto-refunded.</p>
              </div>
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                <h3 className="font-semibold text-white mb-1 text-sm">Exam Cancellation by Abhyaas</h3>
                <p className="text-xs text-slate-400">If an Olympiad tier or event is officially cancelled or rescheduled by our academic board without a viable backup slot.</p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              3. Non-Refundable Scenarios
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Candidate absenteeism or failure to log in at the scheduled synchronized examination window.</li>
              <li>Local internet failures, device crashes, browser crashes, or power outages at the candidate&apos;s end.</li>
              <li>Disqualification resulting from malpractice, unauthorized tab-switching, or anti-cheat triggers.</li>
              <li>Dissatisfaction with test score, rank percentile, or academic evaluation.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-3">
              4. Refund Processing Timelines
            </h2>
            <p className="mb-3">
              Once an eligible refund request or duplicate debit is validated by our accounts desk:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Refund approvals are processed within <strong>24 to 48 working hours</strong>.</li>
              <li>Funds are credited back strictly to the <strong>original source account</strong> (UPI, Net Banking, or Card) within <strong>5 to 7 business banking days</strong> via the payment aggregator.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
              <HelpCircle className="w-5 h-5 text-indigo-400" />
              5. How to Raise a Billing Grievance
            </h2>
            <p className="mb-3">
              To claim a refund for a duplicate transaction or server disruption, email us at <strong>billing@abhyaasnow.in</strong> within <strong>48 hours</strong> of the transaction with:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
              <li>Registered candidate email and phone number</li>
              <li>Payment Transaction ID / Order ID</li>
              <li>Screenshot or description of the error encountered</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}