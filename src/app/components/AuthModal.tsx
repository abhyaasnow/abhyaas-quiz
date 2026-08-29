'use client';

import React, { useState } from 'react';
import { 
  X, ShieldCheck, ArrowRight, 
  CheckCircle2, Lock, Sparkles 
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 10) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
    }, 800);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val[0];
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto-focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header with Official Brand Logo */}
        <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white p-6 pb-7 text-center relative">
          
          {/* Official Abhyaas Logo */}
          <div className="w-14 h-14 rounded-2xl bg-white p-2.5 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-black/20 ring-4 ring-white/10">
            <svg viewBox="0 0 1000 1000" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Gold / Amber Arch */}
              <path 
                d="M196 520L342 550L500 295L658 550L804 520L585 140C545 70 455 70 415 140L196 520Z" 
                fill="#EE9D1A" 
              />
              {/* Deep Royal Blue Base Wing / Book */}
              <path 
                d="M65 540C200 600 350 640 500 706C650 640 800 600 935 540V696C800 760 650 800 500 870C350 800 200 760 65 696V540Z" 
                fill="#1D4ED8" 
              />
            </svg>
          </div>

          <h3 className="text-xl font-black text-white">
            {step === 'phone' ? 'Join Abhyaas' : 'Verify Mobile OTP'}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            {step === 'phone'
              ? 'Access Daily Free Drills & National Olympiads'
              : `6-digit security code sent to +91 ${phoneNumber}`}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Mobile Number (मोबाइल नंबर)
                </label>
                <div className="flex items-center gap-2 border border-slate-200 rounded-2xl p-2.5 bg-slate-50 focus-within:bg-white focus-within:border-blue-600 transition-all">
                  <span className="text-xs font-black text-slate-500 pl-1 border-r border-slate-200 pr-2">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-xs font-bold text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={phoneNumber.length < 10 || isLoading}
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-blue-700/20 flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
              >
                {isLoading ? (
                  <span>Sending OTP...</span>
                ) : (
                  <>
                    <span>Get OTP • ओटीपी प्राप्त करें</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2 text-center">
                <label className="text-xs font-bold text-slate-700 block">
                  Enter 4-Digit Security Code
                </label>
                <div className="flex items-center justify-center gap-2.5">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      className="w-12 h-12 text-center font-black text-lg text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={otp.join('').length < 4 || isLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
              >
                {isLoading ? (
                  <span>Verifying Code...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 pt-1 cursor-pointer"
              >
                Change Mobile Number
              </button>
            </form>
          )}

          {/* Social Login Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
              Or continue with
            </span>
          </div>

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={() => {
              if (onSuccess) onSuccess();
              onClose();
            }}
            className="w-full py-2.5 px-4 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google Account</span>
          </button>

          {/* Security Guarantee */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Encrypted & Academic Privacy Protection</span>
          </div>

        </div>

      </div>
    </div>
  );
}