'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Image as ImageIcon,
  CreditCard,
  MessageSquare,
  Upload,
  ShieldCheck,
  Eye,
  CheckCircle,
  Save,
  Layers,
  Award,
  Plus,
  Trash2,
  Sparkles,
  Search,
  Loader2,
  Lock,
  LogOut,
  UserCheck,
  KeyRound,
  Smartphone,
  Mail,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Crown
} from 'lucide-react';
import { 
  createQuestion, 
  getAllQuestions, 
  updateQuestionStatus, 
  deleteQuestion,
  getSiteSettings,
  updateSiteSettings,
  getAllPayments,
  approvePaymentToken,
  getAllSupportTickets,
  resolveSupportTicket,
  QuestionData,
  ApprovalStatus,
  PaymentRecord,
  SupportTicket
} from '@/lib/db';

const MASTER_ADMIN_EMAIL = 'admin.abhyaas@gmail.com';
const MASTER_RECOVERY_PHONES = ['+91 93100 38825', '+91 80049 39012'];

type AuthMode = 'LOGIN' | 'FIRST_TIME_SETUP' | 'PHONE_RECOVERY' | 'CHANGE_MASTER_EMAIL';

export default function AdminMasterGatewayPage() {
  // ================= 1. AUTH & SECURITY STATE =================
  const [currentUser, setCurrentUser] = useState<{ email: string; isMaster: boolean } | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');
  const [authLoading, setAuthLoading] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // First time setup form
  const [setupEmail, setSetupEmail] = useState(MASTER_ADMIN_EMAIL);
  const [setupCode, setSetupCode] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');
  const [setupCodeSent, setSetupCodeSent] = useState(false);

  // Phone Recovery Form
  const [selectedRecoveryPhone, setSelectedRecoveryPhone] = useState(MASTER_RECOVERY_PHONES[0]);
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [recoveryOtpSent, setRecoveryOtpSent] = useState(false);
  const [newResetPassword, setNewResetPassword] = useState('');

  // Change Master Email Form
  const [newMasterEmailInput, setNewMasterEmailInput] = useState('');
  const [changeEmailOtp, setChangeEmailOtp] = useState('');
  const [changeEmailOtpSent, setChangeEmailOtpSent] = useState(false);

  // ================= 2. DASHBOARD DATA STATE =================
  const [activeTab, setActiveTab] = useState<'media' | 'questions' | 'payments' | 'support'>('media');
  const [mediaSubTab, setMediaSubTab] = useState<'brand' | 'banners'>('brand');
  const [loading, setLoading] = useState(false);

  // Brand & Banners
  const [headerLogoUrl, setHeaderLogoUrl] = useState<string | null>(null);
  const [footerEmblemUrl, setFooterEmblemUrl] = useState<string | null>(null);
  const [bannerTitleHi, setBannerTitleHi] = useState('राष्ट्रीय राज्यव्यवस्था ओलंपियाड : संवैधानिक ढांचा');
  const [bannerTitleEn, setBannerTitleEn] = useState('National Polity Olympiad : Constitutional Framework & Preamble');
  const [bannerScholarship, setBannerScholarship] = useState('₹50,000');
  const [bannerFee, setBannerFee] = useState('₹49');
  const [bannerGraphicUrl, setBannerGraphicUrl] = useState<string | null>(null);
  const [bannerSavedSuccess, setBannerSavedSuccess] = useState(false);

  // Questions
  const [questionsList, setQuestionsList] = useState<QuestionData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // New Question form
  const [selectedSubject, setSelectedSubject] = useState('polity');
  const [topicName, setTopicName] = useState('');
  const [questionEn, setQuestionEn] = useState('');
  const [questionHi, setQuestionHi] = useState('');
  const [optEn, setOptEn] = useState(['', '', '', '']);
  const [optHi, setOptHi] = useState(['', '', '', '']);
  const [correctOpt, setCorrectOpt] = useState<number>(0);
  const [formApprovalStatus, setFormApprovalStatus] = useState<ApprovalStatus>('APPROVED_OLYMPIAD');

  // Payments & Support
  const [paymentsList, setPaymentsList] = useState<PaymentRecord[]>([]);
  const [ticketsList, setTicketsList] = useState<SupportTicket[]>([]);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const headerLogoRef = useRef<HTMLInputElement | null>(null);
  const footerLogoRef = useRef<HTMLInputElement | null>(null);
  const bannerGraphicRef = useRef<HTMLInputElement | null>(null);

  // Check Local Session on mount
  useEffect(() => {
    const savedAdminSession = localStorage.getItem('abhyaas_admin_session');
    if (savedAdminSession) {
      try {
        const parsed = JSON.parse(savedAdminSession);
        setCurrentUser(parsed);
      } catch (e) {
        localStorage.removeItem('abhyaas_admin_session');
      }
    }
  }, []);

  // Fetch Cloud Data when Admin is Authenticated
  useEffect(() => {
    if (!currentUser) return;

    async function loadInitialData() {
      setLoading(true);
      try {
        const [settings, questions, payments, tickets] = await Promise.all([
          getSiteSettings(),
          getAllQuestions(),
          getAllPayments(),
          getAllSupportTickets(),
        ]);

        if (settings) {
          if (settings.headerLogoUrl) setHeaderLogoUrl(settings.headerLogoUrl);
          if (settings.footerLogoUrl) setFooterEmblemUrl(settings.footerLogoUrl);
          if (settings.bannerTitleHi) setBannerTitleHi(settings.bannerTitleHi);
          if (settings.bannerTitleEn) setBannerTitleEn(settings.bannerTitleEn);
          if (settings.scholarshipPool) setBannerScholarship(settings.scholarshipPool);
          if (settings.assessmentFee) setBannerFee(settings.assessmentFee);
          if (settings.bannerGraphicUrl) setBannerGraphicUrl(settings.bannerGraphicUrl);
        }

        if (questions && questions.length > 0) setQuestionsList(questions);
        if (payments && payments.length > 0) setPaymentsList(payments);
        if (tickets && tickets.length > 0) setTicketsList(tickets);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [currentUser]);

  // ================= AUTH HANDLERS =================

  // 1. Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    const savedMasterPass = localStorage.getItem('abhyaas_master_pass') || 'Abhyaas@2026';
    const emailClean = loginEmail.trim().toLowerCase();

    setTimeout(() => {
      setAuthLoading(false);
      if (emailClean === MASTER_ADMIN_EMAIL.toLowerCase() && loginPassword === savedMasterPass) {
        const userObj = { email: MASTER_ADMIN_EMAIL, isMaster: true };
        setCurrentUser(userObj);
        localStorage.setItem('abhyaas_admin_session', JSON.stringify(userObj));
      } else if (loginPassword === 'Team@123' && emailClean.includes('@')) {
        // Team member login
        const userObj = { email: emailClean, isMaster: false };
        setCurrentUser(userObj);
        localStorage.setItem('abhyaas_admin_session', JSON.stringify(userObj));
      } else {
        alert('Galat Email ya Password! Kripya dobara check karein.');
      }
    }, 600);
  };

  // 2. Handle Master Registration & Password Setup
  const handleSendSetupCode = () => {
    setSetupCodeSent(true);
    alert(`Verification Code sent to ${setupEmail}! (Dev Mode Code: 8921)`);
  };

  const handleCompleteSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (setupCode !== '8921') {
      alert('Galat Verification Code! Kripya sahi code dalein.');
      return;
    }
    if (setupPassword.length < 6) {
      alert('Password kam se kam 6 characters ka hona chahiye.');
      return;
    }
    if (setupPassword !== setupConfirmPassword) {
      alert('Password match nahi hua.');
      return;
    }

    localStorage.setItem('abhyaas_master_pass', setupPassword);
    alert('Master Admin registration aur Password successfully create ho gaya!');
    setAuthMode('LOGIN');
    setLoginEmail(setupEmail);
  };

  // 3. Handle 2FA Phone Recovery
  const handleSendPhoneOtp = () => {
    setRecoveryOtpSent(true);
    alert(`Recovery OTP sent to ${selectedRecoveryPhone}! (Dev Mode OTP: 4402)`);
  };

  const handleResetPasswordViaPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (recoveryOtp !== '4402') {
      alert('Galat OTP! Kripya mobile par aaya code check karein.');
      return;
    }
    if (newResetPassword.length < 6) {
      alert('Password kam se kam 6 characters ka hona chahiye.');
      return;
    }

    localStorage.setItem('abhyaas_master_pass', newResetPassword);
    alert('Master Password successfully reset ho gaya! Ab naye password se login karein.');
    setAuthMode('LOGIN');
    setLoginEmail(MASTER_ADMIN_EMAIL);
  };

  // 4. Handle Master Email Change via Phone OTP
  const handleSendChangeEmailOtp = () => {
    setChangeEmailOtpSent(true);
    alert(`Authorization OTP sent to ${selectedRecoveryPhone}! (Dev Mode OTP: 7719)`);
  };

  const handleConfirmChangeEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (changeEmailOtp !== '7719') {
      alert('Galat OTP! Authentication fail ho gaya.');
      return;
    }
    if (!newMasterEmailInput.includes('@')) {
      alert('Kripya valid email address dalein.');
      return;
    }

    alert(`Master Admin Email successfully change ho gaya: ${newMasterEmailInput}`);
    setAuthMode('LOGIN');
    setLoginEmail(newMasterEmailInput);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('abhyaas_admin_session');
    setAuthMode('LOGIN');
  };

  // ================= DASHBOARD ACTIONS =================
  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateSiteSettings({ headerLogoUrl, footerLogoUrl: footerEmblemUrl });
    setLoading(false);
    setBannerSavedSuccess(true);
    setTimeout(() => setBannerSavedSuccess(false), 3000);
    alert('Brand assets saved to Cloud!');
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateSiteSettings({
      bannerTitleHi,
      bannerTitleEn,
      scholarshipPool: bannerScholarship,
      assessmentFee: bannerFee,
      bannerGraphicUrl,
    });
    setLoading(false);
    setBannerSavedSuccess(true);
    setTimeout(() => setBannerSavedSuccess(false), 3000);
    alert('Homepage Banner updated on Cloud!');
  };

  const handleHeaderLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setHeaderLogoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFooterLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFooterEmblemUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionEn.trim() || !questionHi.trim()) {
      alert('Kripya English aur Hindi statements bharein.');
      return;
    }

    // Security Gate: Sub-admins can ONLY create PENDING questions
    const finalApprovalStatus: ApprovalStatus = currentUser?.isMaster 
      ? formApprovalStatus 
      : 'PENDING';

    setLoading(true);
    const newQuestionData: Omit<QuestionData, 'id'> = {
      subject: selectedSubject,
      topic: topicName || 'General Topic',
      questionEn,
      questionHi,
      optionsEn: [...optEn],
      optionsHi: [...optHi],
      correctOption: correctOpt,
      approvalStatus: finalApprovalStatus,
      timesUsedInOlympiad: 0,
      diagramUrl: null,
    };

    const res = await createQuestion(newQuestionData);
    setLoading(false);

    if (res.success) {
      setQuestionsList([{ id: res.id, ...newQuestionData }, ...questionsList]);
      setShowAddForm(false);
      setTopicName('');
      setQuestionEn('');
      setQuestionHi('');
      setOptEn(['', '', '', '']);
      setOptHi(['', '', '', '']);
      setCorrectOpt(0);
      alert(currentUser?.isMaster 
        ? 'Question successfully published to Cloud Vault!' 
        : 'Draft saved as PENDING for Master Admin approval.');
    } else {
      alert('Error saving question.');
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: ApprovalStatus) => {
    if (!currentUser?.isMaster && newStatus === 'APPROVED_OLYMPIAD') {
      alert('Security Alert: Only Master Admin (admin.abhyaas@gmail.com) can approve questions for Live Olympiad!');
      return;
    }

    await updateQuestionStatus(id, newStatus);
    setQuestionsList(prev => prev.map(q => q.id === id ? { ...q, approvalStatus: newStatus } : q));
  };

  const handleDeleteQ = async (id: string) => {
    if (!currentUser?.isMaster) {
      alert('Security Alert: Only Master Admin can delete questions.');
      return;
    }
    if (confirm('Kya aap is question ko Cloud Vault se delete karna chahte hain?')) {
      await deleteQuestion(id);
      setQuestionsList(prev => prev.filter(q => q.id !== id));
    }
  };

  const handleApprovePay = async (id: string) => {
    await approvePaymentToken(id);
    setPaymentsList(prev => prev.map(p => p.id === id ? { ...p, status: 'SUCCESS', tokenGenerated: true } : p));
    alert('Candidate registration slot token released!');
  };

  const handleResolveTicket = async (ticketId: string) => {
    const reply = replyDrafts[ticketId];
    if (!reply || !reply.trim()) {
      alert('Kripya reply likhein.');
      return;
    }

    await resolveSupportTicket(ticketId, reply);
    setTicketsList(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'RESOLVED', replyText: reply } : t));
    setReplyDrafts(prev => ({ ...prev, [ticketId]: '' }));
    alert('Response sent and saved to Cloud!');
  };

  const filteredQuestions = questionsList.filter(q => 
    q.questionEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.questionHi.includes(searchQuery) ||
    q.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // =========================================================================
  // AUTH VIEW 1: NOT LOGGED IN - MASTER ACCESS GATEWAY
  // =========================================================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          
          {/* Top Brand & Gateway Icon */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto">
              <KeyRound className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-white">Abhyaas Master Command Gateway</h2>
            <p className="text-xs text-slate-400">
              Centralized Authentication for Master Admin &amp; Staff Editors
            </p>
          </div>

          {/* MODE 1: STANDARD LOGIN */}
          {authMode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Admin / Staff Email ID</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="e.g. admin.abhyaas@gmail.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setAuthMode('PHONE_RECOVERY')}
                    className="text-[11px] text-amber-400 hover:underline font-semibold"
                  >
                    Forgot Password? (Phone 2FA)
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black text-xs rounded-2xl transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{authLoading ? 'Verifying...' : 'Sign In to Command Center'}</span>
              </button>

              <div className="pt-3 border-t border-slate-800 text-center space-y-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('FIRST_TIME_SETUP')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-bold block mx-auto"
                >
                  First-time Master Setup? (admin.abhyaas@gmail.com)
                </button>
              </div>
            </form>
          )}

          {/* MODE 2: FIRST TIME MASTER REGISTRATION & SETUP */}
          {authMode === 'FIRST_TIME_SETUP' && (
            <form onSubmit={handleCompleteSetup} className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 bg-blue-950/60 border border-blue-800/80 rounded-2xl text-[11px] text-blue-300 leading-relaxed">
                <strong>Master Admin Registration:</strong> Central email <code className="text-white font-bold">{MASTER_ADMIN_EMAIL}</code> par ek verification code bhej kar initial password setup karein.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Master Email Address</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={setupEmail}
                    readOnly
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleSendSetupCode}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl whitespace-nowrap cursor-pointer"
                  >
                    {setupCodeSent ? 'Resend Code' : 'Send Code'}
                  </button>
                </div>
              </div>

              {setupCodeSent && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Enter Email Verification Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 8921"
                      value={setupCode}
                      onChange={(e) => setSetupCode(e.target.value)}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Create Password</label>
                      <input
                        type="password"
                        placeholder="••••••"
                        value={setupPassword}
                        onChange={(e) => setSetupPassword(e.target.value)}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Confirm Password</label>
                      <input
                        type="password"
                        placeholder="••••••"
                        value={setupConfirmPassword}
                        onChange={(e) => setSetupConfirmPassword(e.target.value)}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl transition shadow-lg cursor-pointer"
                  >
                    Complete Master Setup &amp; Lock Password
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setAuthMode('LOGIN')}
                className="text-xs text-slate-400 hover:text-slate-200 block mx-auto pt-2"
              >
                ← Back to Standard Sign In
              </button>
            </form>
          )}

          {/* MODE 3: 2FA PHONE PASSWORD RESET */}
          {authMode === 'PHONE_RECOVERY' && (
            <form onSubmit={handleResetPasswordViaPhone} className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 bg-amber-950/60 border border-amber-800/80 rounded-2xl text-[11px] text-amber-300 leading-relaxed flex items-start gap-2">
                <Smartphone className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Dual-Phone 2FA Reset:</strong> Password reset ke liye registered recovery mobile number par SMS OTP bheja jayega.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Select Verified Recovery Phone</label>
                <div className="space-y-2">
                  {MASTER_RECOVERY_PHONES.map((phone) => (
                    <label
                      key={phone}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer text-xs ${
                        selectedRecoveryPhone === phone
                          ? 'border-amber-500 bg-amber-500/10 text-white'
                          : 'border-slate-800 bg-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="font-mono font-bold">{phone}</span>
                      <input
                        type="radio"
                        name="recPhone"
                        checked={selectedRecoveryPhone === phone}
                        onChange={() => setSelectedRecoveryPhone(phone)}
                        className="text-amber-500"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSendPhoneOtp}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                {recoveryOtpSent ? 'Resend SMS OTP' : 'Send SMS OTP to Selected Phone'}
              </button>

              {recoveryOtpSent && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Enter 4-Digit SMS OTP</label>
                    <input
                      type="text"
                      placeholder="e.g. 4402"
                      value={recoveryOtp}
                      onChange={(e) => setRecoveryOtp(e.target.value)}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Enter New Master Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={newResetPassword}
                      onChange={(e) => setNewResetPassword(e.target.value)}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl transition shadow-lg cursor-pointer"
                  >
                    Reset &amp; Set New Master Password
                  </button>
                </>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('LOGIN')}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  ← Back to Login
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('CHANGE_MASTER_EMAIL')}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Change Master Email?
                </button>
              </div>
            </form>
          )}

          {/* MODE 4: CHANGE MASTER EMAIL VIA PHONE OTP */}
          {authMode === 'CHANGE_MASTER_EMAIL' && (
            <form onSubmit={handleConfirmChangeEmail} className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-[11px] text-rose-300 leading-relaxed">
                <strong>Critical Security Action:</strong> Master Email change karne ke liye recovery mobile number <code className="text-white font-bold">{selectedRecoveryPhone}</code> par authorization OTP verify karna anivarya hai.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">New Master Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. newadmin.abhyaas@gmail.com"
                  value={newMasterEmailInput}
                  onChange={(e) => setNewMasterEmailInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs"
                  required
                />
              </div>

              <button
                type="button"
                onClick={handleSendChangeEmailOtp}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                {changeEmailOtpSent ? 'Resend Security OTP' : `Send Security OTP to ${selectedRecoveryPhone}`}
              </button>

              {changeEmailOtpSent && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Enter Security Authorization OTP</label>
                  <input
                    type="text"
                    placeholder="e.g. 7719"
                    value={changeEmailOtp}
                    onChange={(e) => setChangeEmailOtp(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs font-mono"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full mt-3 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-2xl transition shadow-lg cursor-pointer"
                  >
                    Confirm &amp; Update Master Email ID
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setAuthMode('LOGIN')}
                className="text-xs text-slate-400 hover:text-slate-200 block mx-auto pt-2"
              >
                ← Cancel &amp; Return to Login
              </button>
            </form>
          )}

          <Link href="/" className="text-xs text-slate-500 hover:text-slate-400 transition block text-center">
            ← Return to Public Homepage
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // AUTH VIEW 2: LOGGED-IN MASTER DASHBOARD WORKSPACE
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Top Admin Header Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-sm">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base leading-none text-white">
                  Abhyaas Master Control Center
                </h1>
                {currentUser.isMaster ? (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400" /> Super Admin
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase">
                    Team Editor
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Logged in as: {currentUser.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {loading && <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />}
            
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Site</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-rose-400 transition cursor-pointer"
              title="Sign Out Gateway"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        
        {/* Permission Notification Banner */}
        {!currentUser.isMaster && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between text-amber-900 text-xs">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Team Editor Mode:</strong> You can add drafts and manage media. Question approval for the live Olympiad is restricted to Master Admin (<code className="font-bold">{MASTER_ADMIN_EMAIL}</code>).
              </span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('media')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'media'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Media &amp; Banner Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Question Vault ({questionsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payments &amp; Registrations ({paymentsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'support'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Support Inbox ({ticketsList.filter(t => t.status === 'OPEN').length} Open)</span>
          </button>
        </div>

        {/* ================= TAB 1: MEDIA & BANNER HUB ================= */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setMediaSubTab('brand')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  mediaSubTab === 'brand' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>1. Brand Logos &amp; Core Icons</span>
              </button>

              <button
                onClick={() => setMediaSubTab('banners')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  mediaSubTab === 'banners' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>2. Live Homepage Hero &amp; Fee Controls</span>
              </button>
            </div>

            {mediaSubTab === 'brand' && (
              <form onSubmit={handleSaveBrand} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-black text-base text-slate-900">Brand Identity &amp; Target Slots</h3>
                  {bannerSavedSuccess && <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Cloud Updated!</span>}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-900 block uppercase">Header Navbar Logo Slot</span>
                    <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      {headerLogoUrl ? (
                        <img src={headerLogoUrl} alt="Header Logo" className="h-8 max-w-[140px] object-contain" />
                      ) : (
                        <span className="font-black text-slate-900 text-base">ABHYAAS.</span>
                      )}
                      <button type="button" onClick={() => headerLogoRef.current?.click()} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">Change</button>
                      <input type="file" accept="image/*" ref={headerLogoRef} onChange={handleHeaderLogoChange} className="hidden" />
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-900 block uppercase">Dark Footer Emblem Slot</span>
                    <div className="p-4 bg-[#080e1a] rounded-xl border border-slate-800 flex items-center justify-between">
                      {footerEmblemUrl ? (
                        <img src={footerEmblemUrl} alt="Footer Logo" className="h-8 max-w-[140px] object-contain" />
                      ) : (
                        <span className="font-black text-white text-base">ABHYAAS</span>
                      )}
                      <button type="button" onClick={() => footerLogoRef.current?.click()} className="px-3 py-1.5 bg-slate-800 text-slate-200 text-xs font-bold rounded-xl cursor-pointer">Change</button>
                      <input type="file" accept="image/*" ref={footerLogoRef} onChange={handleFooterLogoChange} className="hidden" />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md cursor-pointer">
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save Brand Assets to Cloud'}</span>
                </button>
              </form>
            )}

            {mediaSubTab === 'banners' && (
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                <form onSubmit={handleSaveBanner} className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-black text-base text-slate-900">Live Homepage Banner Settings</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Olympiad Hindi Headline</label>
                      <input type="text" value={bannerTitleHi} onChange={(e) => setBannerTitleHi(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Olympiad English Title</label>
                      <input type="text" value={bannerTitleEn} onChange={(e) => setBannerTitleEn(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Scholarship Pool Amount</label>
                        <input type="text" value={bannerScholarship} onChange={(e) => setBannerScholarship(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Assessment Fee (₹)</label>
                        <input type="text" value={bannerFee} onChange={(e) => setBannerFee(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600" required />
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer">
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Updating Cloud...' : 'Update Live Homepage on Cloud'}</span>
                  </button>
                </form>

                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-3">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md">LIVE PREVIEW</span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-blue-600/30 text-blue-300 block">Scholarship: {bannerScholarship}</span>
                  <h4 className="text-base font-black text-amber-400 leading-tight">{bannerTitleHi}</h4>
                  <p className="text-xs font-bold text-slate-300">{bannerTitleEn}</p>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Fee: {bannerFee}</span>
                    <span className="px-3 py-1.5 bg-amber-500 text-slate-950 font-black rounded-xl text-[11px]">REGISTER • {bannerFee}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: QUESTIONS VAULT ================= */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Search questions in cloud vault..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600" />
              </div>
              <button onClick={() => setShowAddForm(!showAddForm)} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer">
                <Plus className="w-4 h-4" />
                <span>{showAddForm ? 'Close Form' : 'Add New Question'}</span>
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleCreateQuestion} className="bg-white border-2 border-blue-600 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    New Question Studio
                  </h3>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                    <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600">
                      <option value="polity">Indian Polity &amp; Constitution</option>
                      <option value="history">Modern Indian History</option>
                      <option value="economy">Indian Economy &amp; Banking</option>
                      <option value="geography">Geography &amp; Environment</option>
                      <option value="csat">CSAT &amp; Quantitative</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Topic / Sub-Chapter</label>
                    <input type="text" placeholder="e.g. Fundamental Rights" value={topicName} onChange={(e) => setTopicName(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Approval Destination</label>
                    <select 
                      value={formApprovalStatus} 
                      onChange={(e) => setFormApprovalStatus(e.target.value as ApprovalStatus)} 
                      disabled={!currentUser.isMaster}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-emerald-700 bg-emerald-50/40 focus:outline-none focus:border-emerald-600"
                    >
                      <option value="APPROVED_OLYMPIAD">🛡️ Approve for Olympiad Vault (Master Only)</option>
                      <option value="APPROVED_PRACTICE">📘 Approve for Practice Bank</option>
                      <option value="PENDING">⏳ Keep as Draft (Pending)</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Question Statement in English</label>
                    <textarea rows={3} placeholder="Type statement in English..." value={questionEn} onChange={(e) => setQuestionEn(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Question Statement in Hindi (हिन्दी)</label>
                    <textarea rows={3} placeholder="यहाँ प्रश्न हिन्दी में लिखें..." value={questionHi} onChange={(e) => setQuestionHi(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600" required />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-slate-900 uppercase">Options &amp; Correct Answer Selection</label>
                  {[0, 1, 2, 3].map((idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl grid sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-1 flex items-center justify-center">
                        <input type="radio" name="optRadio" checked={correctOpt === idx} onChange={() => setCorrectOpt(idx)} className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="sm:col-span-1 text-xs font-black text-slate-500">Option {String.fromCharCode(65 + idx)}</div>
                      <div className="sm:col-span-5">
                        <input type="text" placeholder={`Option ${String.fromCharCode(65 + idx)} in English`} value={optEn[idx]} onChange={(e) => { const copy = [...optEn]; copy[idx] = e.target.value; setOptEn(copy); }} className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs" required />
                      </div>
                      <div className="sm:col-span-5">
                        <input type="text" placeholder={`विकल्प ${String.fromCharCode(65 + idx)} हिन्दी में`} value={optHi[idx]} onChange={(e) => { const copy = [...optHi]; copy[idx] = e.target.value; setOptHi(copy); }} className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs" required />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">Cancel</button>
                  <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer">
                    {loading ? 'Publishing to Cloud...' : 'Publish Question to Cloud Vault'}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {filteredQuestions.map((q, idx) => (
                <div key={q.id || idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black px-2.5 py-0.5 bg-slate-900 text-white rounded-md uppercase">{q.subject}</span>
                      <span className="text-xs font-bold text-slate-500">{q.topic}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <select 
                        value={q.approvalStatus} 
                        onChange={(e) => q.id && handleStatusUpdate(q.id, e.target.value as ApprovalStatus)} 
                        disabled={!currentUser.isMaster}
                        className="text-xs font-bold px-2.5 py-1 rounded-xl border bg-slate-50 cursor-pointer"
                      >
                        <option value="APPROVED_OLYMPIAD">🛡️ Olympiad Vault</option>
                        <option value="APPROVED_PRACTICE">📘 Practice Bank</option>
                        <option value="PENDING">⏳ Pending Review</option>
                      </select>
                      {currentUser.isMaster && (
                        <button onClick={() => q.id && handleDeleteQ(q.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  </div>
                  <p className="font-bold text-xs sm:text-sm text-slate-900">#{idx + 1}. {q.questionEn}</p>
                  <p className="text-xs text-slate-500">{q.questionHi}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: PAYMENTS ================= */}
        {activeTab === 'payments' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-black text-base text-slate-900">Live Razorpay Registrations</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Candidate &amp; Roll No</th>
                    <th className="p-3">Tier</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Admit Card</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paymentsList.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{p.candidateName}</p>
                        <p className="text-[11px] text-blue-600 font-mono">{p.rollNo}</p>
                      </td>
                      <td className="p-3 font-semibold">{p.olympiadTier}</td>
                      <td className="p-3 font-black">₹{p.amount}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{p.status}</span>
                      </td>
                      <td className="p-3 text-right">
                        {p.tokenGenerated ? <span className="text-emerald-600 font-bold text-xs">Issued</span> : <button onClick={() => p.id && handleApprovePay(p.id)} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer">Approve</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 4: SUPPORT INBOX ================= */}
        {activeTab === 'support' && (
          <div className="space-y-4">
            {ticketsList.map((t) => (
              <div key={t.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-sm text-slate-900">{t.candidateName} ({t.email})</h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${t.status === 'OPEN' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{t.status}</span>
                </div>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl">&quot;{t.message}&quot;</p>
                {t.status === 'OPEN' && (
                  <div className="space-y-2">
                    <textarea rows={2} placeholder="Reply to aspirant..." value={replyDrafts[t.id || ''] || ''} onChange={(e) => setReplyDrafts({ ...replyDrafts, [t.id || '']: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600" />
                    <button onClick={() => t.id && handleResolveTicket(t.id)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer">Send Response</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}