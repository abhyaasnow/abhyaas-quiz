import React from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, AlertTriangle, CheckCircle2, HelpCircle, Clock } from 'lucide-react';

export default function RefundPage() {
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
            Payment &amp; Cancellation
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        {/* Header */}
        <div className="border-b border-slate-200 pb-8 mb-8">
          <div className="inline-flex items-center gap-2 text-blue-600 mb-2.5 text-xs font-bold tracking-wider uppercase">
            <RefreshCw className="w-4 h-4" />
            Fee Policy &amp; Cancellation Guidelines
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="mt-2.5 text-slate-600 text-xs sm:text-sm leading-relaxed">
            Effective Date: August 2026. This policy outlines fee structures, slot cancellations, and refund eligibility criteria for assessments conducted on Abhyaas (abhyaasnow.in).
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5 mb-3">
              <Clock className="w-4 h-4 text-blue-600" />
              1. General Examination Fee Policy
            </h2>
            <p className="mb-3 text-slate-600">
              Registration fees paid for timed All-India Olympiads, Speed Drills, and Subject Sprints represent operational examination processing charges. These funds are allocated in advance towards cloud server capacity, automated proctoring engines, and question-paper provisioning.
            </p>
            <p className="text-slate-600">
              Once a candidate initiates or attempts an examination slot, the fee is deemed fully utilized and non-refundable.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              2. Eligible Refund Scenarios
            </h2>
            <p className="mb-3 text-slate-600">Full (100%) refunds or automated test re-slotting are granted under the following exceptional circumstances:</p>
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h3 className="font-semibold text-slate-900 mb-1 text-xs sm:text-sm">Platform Server Outages</h3>
                <p className="text-xs text-slate-600">If our cloud infrastructure experiences unexpected downtime during a live synchronized mega exam that prevents test completion.</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h3 className="font-semibold text-slate-900 mb-1 text-xs sm:text-sm">Duplicate Transactions</h3>
                <p className="text-xs text-slate-600">If a candidate is debited twice for a single test slot due to a network or payment gateway glitch, the excess amount is auto-refunded.</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h3 className="font-semibold text-slate-900 mb-1 text-xs sm:text-sm">Exam Cancellation by Abhyaas</h3>
                <p className="text-xs text-slate-600">If an Olympiad tier or event is officially cancelled or rescheduled by our academic board without a viable backup slot.</p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              3. Non-Refundable Scenarios
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-xs sm:text-sm">
              <li>Candidate absenteeism or failure to log in at the scheduled synchronized examination window.</li>
              <li>Local internet failures, device crashes, browser crashes, or power outages at the candidate&apos;s end.</li>
              <li>Disqualification resulting from malpractice, unauthorized tab-switching, or anti-cheat triggers.</li>
              <li>Dissatisfaction with test score, rank percentile, or academic evaluation.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-3">
              4. Refund Processing Timelines
            </h2>
            <p className="mb-3 text-slate-600">
              Once an eligible refund request or duplicate debit is validated by our accounts desk:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-xs sm:text-sm">
              <li>Refund approvals are processed within <strong className="text-slate-900">24 to 48 working hours</strong>.</li>
              <li>Funds are credited back strictly to the <strong className="text-slate-900">original source account</strong> (UPI, Net Banking, or Card) within <strong className="text-slate-900">5 to 7 business banking days</strong> via the payment aggregator.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5 mb-3">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              5. How to Raise a Billing Grievance
            </h2>
            <p className="mb-3 text-slate-600">
              To claim a refund for a duplicate transaction or server disruption, email us at <strong className="text-blue-600">billing@abhyaasnow.in</strong> within <strong className="text-slate-900">48 hours</strong> of the transaction with:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
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