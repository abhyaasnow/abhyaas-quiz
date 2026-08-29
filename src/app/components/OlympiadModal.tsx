'use client';

import React, { useState } from 'react';
import { 
  X, Trophy, Award, Calendar, Clock, ShieldCheck, 
  CheckCircle2, Globe, Sparkles, ArrowRight, CreditCard 
} from 'lucide-react';

interface OlympiadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OlympiadModal({ isOpen, onClose }: OlympiadModalProps) {
  const [selectedMedium, setSelectedMedium] = useState<'hi' | 'en'>('hi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  if (!isOpen) return null;

  const handleRegister = () => {
    setIsProcessing(true);
    // Mock Payment Gateway Trigger (Razorpay / UPI)
    setTimeout(() => {
      setIsProcessing(false);
      setIsRegistered(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      
      <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden relative my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {!isRegistered ? (
          <div>
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-6 relative">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wider mb-2">
                <Trophy className="w-3 h-3 text-slate-950" />
                All-India Weekly Olympiad
              </span>
              <h3 className="text-lg sm:text-xl font-black leading-snug">
                National Polity Olympiad : Constitutional Framework
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                अखिल भारतीय राजव्यवस्था ओलंपियाड • National Merit Assessment
              </p>
            </div>

            <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              
              {/* Exam Specs Row */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Questions</span>
                  <span className="text-sm font-black text-slate-900">50 MCQs</span>
                </div>
                <div className="border-x border-slate-200">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Duration</span>
                  <span className="text-sm font-black text-slate-900">45 Mins</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Marking</span>
                  <span className="text-sm font-black text-emerald-600">+2 / -0.66</span>
                </div>
              </div>

              {/* Merit Scholarship Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  Merit Scholarship Matrix (छात्रवृत्ति विवरण)
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/80 border border-amber-200">
                    <span className="font-bold text-amber-950">🥇 All India Rank 1</span>
                    <strong className="text-amber-800 font-black">₹5,000 Grant + Gold Medal</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-700">🥈 AIR 2 - 3</span>
                    <strong className="text-slate-900 font-bold">₹3,000 Academic Grant</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-700">🥉 AIR 4 - 10</span>
                    <strong className="text-slate-900 font-bold">₹1,000 Academic Grant</strong>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg text-[11px] text-slate-500">
                    <span>🎖️ Top 100 Scholars</span>
                    <span>Verified National Certificate</span>
                  </div>
                </div>
              </div>

              {/* Medium of Test Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Select Exam Medium (परीक्षा का माध्यम):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMedium('hi')}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition-all border flex items-center justify-center gap-1.5 ${
                      selectedMedium === 'hi'
                        ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    हिन्दी (Hindi)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMedium('en')}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition-all border flex items-center justify-center gap-1.5 ${
                      selectedMedium === 'en'
                        ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Exam Date & Schedule */}
              <div className="flex items-center gap-2 p-3 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-900 font-medium">
                <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Live Test Slot: <strong>Upcoming Sunday • 11:00 AM IST</strong></span>
              </div>

            </div>

            {/* Bottom Checkout CTA */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <div>
                <span className="block text-[10px] font-bold uppercase text-slate-500">Assessment Fee</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg sm:text-xl font-black text-slate-900">₹49</span>
                  <span className="text-[10px] text-slate-400 line-through">₹199</span>
                </div>
              </div>

              <button
                onClick={handleRegister}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Processing Gateway...</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>PAY ₹49 & CONFIRM SLOT</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Registration Success Screen */
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">Slot Confirmed! (पंजीकरण सफल)</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your registration for National Polity Olympiad is confirmed.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5 text-left max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Registration ID:</span>
                <strong className="font-mono text-slate-800">ABH-OLY-8924</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Medium:</span>
                <strong className="text-slate-800">{selectedMedium === 'hi' ? 'हिन्दी (Hindi)' : 'English'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Test Time:</span>
                <strong className="text-blue-700">Sunday 11:00 AM IST</strong>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs"
            >
              Done & Return to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
}