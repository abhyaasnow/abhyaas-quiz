'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  HelpCircle,
  CheckCircle,
  Building,
  ShieldAlert
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
            Help & Grievance Desk
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 pt-10">
        {/* Header */}
        <div className="border-b border-slate-800 pb-8 mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-indigo-400 mb-3 text-sm font-semibold tracking-wide uppercase">
            <MessageSquare className="w-4 h-4" />
            Aspirant Support Ecosystem
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Contact Us & Support Center
          </h1>
          <p className="mt-3 text-slate-400 text-sm max-w-2xl leading-relaxed">
            Have a question about an Olympiad tier, technical issue during an active drill, merit scholarship disbursement, or billing? Our support desk is here to assist you.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column: Direct Contact Info & SLA */}
          <div className="lg:col-span-5 space-y-6">
            {/* Primary Email Desk */}
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <h3 className="font-bold text-white text-base flex items-center gap-2.5 mb-4">
                <Mail className="w-5 h-5 text-indigo-400" />
                Departmental Email Support
              </h3>
              <div className="space-y-3.5 text-xs">
                <div>
                  <p className="text-slate-400">General Support & Student Help:</p>
                  <a href="mailto:support@abhyaasnow.in" className="text-indigo-400 font-medium hover:underline text-sm">
                    support@abhyaasnow.in
                  </a>
                </div>
                <div>
                  <p className="text-slate-400">Merit Grants & Scholarship Desk:</p>
                  <a href="mailto:scholarships@abhyaasnow.in" className="text-indigo-400 font-medium hover:underline text-sm">
                    scholarships@abhyaasnow.in
                  </a>
                </div>
                <div>
                  <p className="text-slate-400">Billing & Payment Verification:</p>
                  <a href="mailto:billing@abhyaasnow.in" className="text-indigo-400 font-medium hover:underline text-sm">
                    billing@abhyaasnow.in
                  </a>
                </div>
              </div>
            </div>

            {/* Operational Details */}
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white text-sm">Registered Operations</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Abhyaas Platform (abhyaasnow.in)<br />
                    Delhi-NCR, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-slate-800/80">
                <Clock className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white text-sm">Support Hours & SLA</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Monday to Saturday: 09:30 AM – 06:30 PM IST<br />
                    Response Turnaround: Within 24 Hours
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-slate-800/80">
                <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white text-sm">Grievance Redressal Officer</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    In compliance with the Information Technology Act, 2000, reach out to <strong>grievance@abhyaasnow.in</strong> for formal escalations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Support Ticket Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <h3 className="font-bold text-white text-lg mb-1 flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-400" />
                Raise a Support Ticket
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Fill in the details below and our academic support team will reach out via email.
              </p>

              {submitted ? (
                <div className="py-12 text-center space-y-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="text-lg font-bold text-white">Ticket Submitted Successfully!</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Your grievance/query has been assigned reference token <strong>#ABH-{Math.floor(100000 + Math.random() * 900000)}</strong>. Our support team will respond within 24 business hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-white transition"
                  >
                    Submit Another Query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Candidate Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Asuttosh Singh"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Registered Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="candidate@example.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Query Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                      >
                        <option value="General Inquiry">General Examination Inquiry</option>
                        <option value="Olympiad Slot">Olympiad Slot / Schedule Issue</option>
                        <option value="Scholarship Disbursement">Scholarship & Merit Payout</option>
                        <option value="Technical Glitch">Test Screen / Timer Issue</option>
                        <option value="Payment Issue">Duplicate Transaction / Refund</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Describe your issue in detail *</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please include exam date, transaction reference, or question details..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-semibold text-white rounded-xl text-sm transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
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