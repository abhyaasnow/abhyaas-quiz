'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Mail, 
  Lock, 
  Phone, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw, 
  KeyRound, 
  Smartphone, 
  GraduationCap, 
  School,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type AuthMode = 'login' | 'register' | 'otp' | 'forgot';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/profile';
  
  const { user, signInWithGoogle } = useAuth();

  // If already logged in, redirect to intended page
  useEffect(() => {
    if (user) {
      router.push(redirectUrl);
    }
  }, [user, router, redirectUrl]);

  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [targetCategory, setTargetCategory] = useState('UPSC Civil Services (IAS / IPS)');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);

  // Timer Countdown for OTP
  useEffect(() => {
    let interval: any;
    if (otpSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, resendTimer]);

  // Handle Email & Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      // Mock successful login - redirects to candidate profile
      router.push(redirectUrl);
    }, 1200);
  };

  // Handle New Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords match nahi kar rahe hain. Kripya check karein.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Kripya Academic Terms & Integrity Code accept karein.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage('Aapka Abhyaas account create ho gaya hai! Redirecting...');
      setTimeout(() => {
        router.push(redirectUrl);
      }, 1000);
    }, 1200);
  };

  // Handle Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.trim().length < 10) {
      setErrorMessage('Kripya valid 10-digit mobile number darj karein.');
      return;
    }
    setErrorMessage('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setResendTimer(30);
    }, 1000);
  };

  // Handle OTP Digit Input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-box-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle OTP Verify
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otpValues.join('');
    if (enteredOtp.length < 6) {
      setErrorMessage('Kripya pura 6-digit OTP code darj karein.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push(redirectUrl);
    }, 1200);
  };

  // Handle Forgot Password
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccessMessage(`Password reset link aapke email (${email}) par bhej diya gaya hai.`);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-600 selection:text-white py-10 px-4 sm:px-6 lg:px-8 pb-20 flex flex-col justify-center items-center">
      
      {/* Back to Home Navigation */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4 text-blue-600" />
          <span>Back to Home</span>
        </Link>
        <span className="text-[10px] font-bold px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
          Secure Academic Portal
        </span>
      </div>

      {/* Main Authentication Card */}
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-1">
            <div className="flex flex-col items-center justify-center w-6 h-6">
              <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[8px] border-b-amber-500 mb-[1px]" />
              <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[8px] border-t-blue-600" />
            </div>
            <span className="font-black text-xl tracking-wider text-slate-900 leading-none">
              ABHYAAS<span className="text-blue-600">.</span>
            </span>
          </Link>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            {mode === 'login' && 'Candidate Sign In'}
            {mode === 'register' && 'New Candidate Registration'}
            {mode === 'otp' && 'Mobile OTP Verification'}
            {mode === 'forgot' && 'Reset Your Password'}
          </h1>
          <p className="text-xs text-slate-500">
            {mode === 'login' && 'Enter your credentials to access test arena & fellowship wallet.'}
            {mode === 'register' && 'Create your verified aspirant account for All-India Olympiads.'}
            {mode === 'otp' && 'Instant login with your 10-digit registered mobile number.'}
            {mode === 'forgot' && 'Enter your registered email to receive the password recovery link.'}
          </p>
        </div>

        {/* Mode Switcher Tabs (Login vs Register vs OTP) */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-2xl text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`py-2 rounded-xl transition cursor-pointer ${
                mode === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`py-2 rounded-xl transition cursor-pointer ${
                mode === 'register' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => { setMode('otp'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
                mode === 'otp' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>OTP Login</span>
            </button>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert Box */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ================= MODE 1: EMAIL & PASSWORD LOGIN ================= */}
        {mode === 'login' && (
          <form onSubmit={handleEmailLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address / User ID</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setErrorMessage(''); setSuccessMessage(''); }}
                  className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            </button>
          </form>
        )}

        {/* ================= MODE 2: NEW REGISTRATION ================= */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Candidate Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Asuttosh Singh"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mobile Number (WhatsApp Enabled)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Exam / Class Category</label>
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              >
                <option>UPSC Civil Services (IAS / IPS)</option>
                <option>State PSC (UPPSC / BPSC / MPPCS)</option>
                <option>SSC CGL / Banking PO</option>
                <option>School Foundation (Class 1 - 5)</option>
                <option>Middle School (Class 6 - 8)</option>
                <option>Secondary Board (Class 9 - 10)</option>
                <option>Senior Secondary (Class 11 - 12)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            <label className="flex items-start gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 text-blue-600 rounded cursor-pointer"
              />
              <span className="text-[11px] text-slate-600 leading-tight">
                I agree to the <Link href="/terms" className="text-blue-600 font-bold underline">Terms of Examination</Link> and <Link href="/privacy" className="text-blue-600 font-bold underline">Privacy Policy</Link>.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-400" />
              )}
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            </button>
          </form>
        )}

        {/* ================= MODE 3: MOBILE OTP LOGIN ================= */}
        {mode === 'otp' && (
          <div className="space-y-4 text-xs">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Enter 10-Digit Mobile Number</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500">+91</span>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      className="w-full pl-14 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold tracking-wider focus:outline-none focus:border-blue-600 focus:bg-white transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || phoneNumber.length < 10}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
                  <span>{loading ? 'Sending OTP...' : 'Send 6-Digit Verification OTP'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center space-y-1">
                  <span className="text-[11px] text-slate-500">OTP code sent to:</span>
                  <p className="font-mono font-bold text-slate-900 text-sm">+91 {phoneNumber}</p>
                </div>

                {/* 6-box OTP Grid */}
                <div className="grid grid-cols-6 gap-2">
                  {otpValues.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-box-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      className="h-12 text-center text-lg font-mono font-black bg-slate-50 border-2 border-slate-200 focus:border-blue-600 rounded-xl focus:outline-none transition"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtpValues(['', '', '', '', '', '']); }}
                    className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                  >
                    Change Number
                  </button>

                  {resendTimer > 0 ? (
                    <span className="text-slate-400 font-mono">Resend in {resendTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setResendTimer(30)}
                      className="text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Resend OTP</span>
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{loading ? 'Verifying...' : 'Verify OTP & Enter Portal'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* ================= MODE 4: FORGOT PASSWORD ================= */}
        {mode === 'forgot' && (
          <div className="space-y-4 text-xs">
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Registered Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                <span>{loading ? 'Sending Recovery Link...' : 'Send Password Reset Link'}</span>
              </button>
            </form>

            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(''); setSuccessMessage(''); }}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        )}

        {/* ================= SOCIAL / GOOGLE 1-CLICK AUTH ================= */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="relative text-center">
            <span className="bg-white px-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider relative z-10">
              Or Fast Access Via
            </span>
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-slate-100" />
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Security / Fair Play Note */}
        <div className="pt-2 text-center">
          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>256-Bit TLS Encrypted • 100% Anti-Cheat Standard</span>
          </p>
        </div>

      </div>
    </div>
  );
}