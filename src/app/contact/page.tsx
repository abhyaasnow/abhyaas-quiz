'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Clock,
  Send,
  MessageSquare,
  CheckCircle2,
  Building,
  ShieldAlert,
  PhoneCall
} from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'General Inquiry',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
            Help &amp; Grievance Desk
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        {/* Header */}
        <div className="border-b border-slate-200 pb-8 mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-blue-600 mb-2.5 text-xs font-bold tracking-wider uppercase">
            <MessageSquare className="w-4 h-4" />
            Aspirant Support Ecosystem
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Contact Us &amp; Support Center
          </h1>
          <p className="mt-2.5 text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Have a question about an Olympiad tier, technical issue during an active drill, merit scholarship disbursement, or billing? Our support desk is here to assist you.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column: Direct Contact Info & SLA */}
          <div className="lg:col-span-5 space-y-6">
            {/* Primary Email Desk */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2 mb-4">
                <Mail className="w-4 h-4 text-blue-600" />
                Departmental Email Support
              </h3>
              <div className="space-y-3.5 text-xs">
                <div>
                  <p className="text-slate-500 font-medium">General Support &amp; Student Help:</p>
                  <a href="mailto:support@abhyaasnow.in" className="text-blue-600 font-semibold hover:underline text-xs sm:text-sm">
                    support@abhyaasnow.in
                  </a>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Merit Grants &amp; Scholarship Desk:</p>
                  <a href="mailto:scholarships@abhyaasnow.in" className="text-blue-600 font-semibold hover:underline text-xs sm:text-sm">
                    scholarships@abhyaasnow.in
                  </a>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Billing &amp; Payment Verification:</p>
                  <a href="mailto:billing@abhyaasnow.in" className="text-blue-600 font-semibold hover:underline text-xs sm:text-sm">
                    billing@abhyaasnow.in
                  </a>
                </div>
              </div>
            </div>

            {/* Operational Details */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-start gap-3">
                <Building className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-xs sm:text-sm">Registered Operations</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Abhyaas Platform (abhyaasnow.in)<br />
                    Delhi-NCR, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-xs sm:text-sm">Support Hours &amp; SLA</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Monday to Saturday: 09:30 AM – 06:30 PM IST<br />
                    Response Turnaround: Within 24 Hours
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-xs sm:text-sm">Grievance Redressal Officer</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    In compliance with the Information Technology Act, 2000, reach out to <strong className="text-slate-800">grievance@abhyaasnow.in</strong> for formal escalations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Support Ticket Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-1 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" />
                Raise a Support Ticket
              </h3>
              <p className="text-xs text-slate-600 mb-6">
                Fill in the details below and our academic support team will reach out via email.
              </p>

              {submitted ? (
                <div className="py-10 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold text-slate-900">Ticket Submitted Successfully!</h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    Your query has been assigned reference token <strong className="text-slate-900">#ABH-{Math.floor(100000 + Math.random() * 900000)}</strong>. Our support team will respond within 24 business hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-semibold rounded-lg text-white transition"
                  >
                    Submit Another Query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">Candidate Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Asuttosh Singh"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">Registered Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="candidate@example.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">Query Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                      >
                        <option value="General Inquiry">General Examination Inquiry</option>
                        <option value="Olympiad Slot">Olympiad Slot / Schedule Issue</option>
                        <option value="Scholarship Disbursement">Scholarship &amp; Merit Payout</option>
                        <option value="Technical Glitch">Test Screen / Timer Issue</option>
                        <option value="Payment Issue">Duplicate Transaction / Refund</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Describe your issue in detail *</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please include exam date, transaction reference, or question details..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 font-semibold text-white rounded-xl text-xs sm:text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    Submit Support Ticket
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}