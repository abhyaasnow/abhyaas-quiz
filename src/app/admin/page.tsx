'use client';

import React, { useState, useRef } from 'react';
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
  Star,
  Video,
  Plus,
  Trash2,
  Sparkles
} from 'lucide-react';

interface WinnerCard {
  id: string;
  name: string;
  rank: string;
  exam: string;
  grantWon: string;
  quote: string;
  photoUrl: string | null;
  videoUrl?: string;
}

const INITIAL_WINNERS: WinnerCard[] = [
  {
    id: 'w-1',
    name: 'Anjali Sharma',
    rank: 'AIR 01',
    exam: 'Weekly Speed Sprint (Polity)',
    grantWon: '₹15,000 Fellowship',
    quote: 'Real-time proctored interface gave me exact UPSC Prelims pressure.',
    photoUrl: null,
    videoUrl: 'https://youtube.com/watch?v=sample'
  },
  {
    id: 'w-2',
    name: 'Vikas Kumar',
    rank: 'AIR 02',
    exam: 'Monthly Mega Assessment',
    grantWon: '₹10,000 Fellowship',
    quote: 'The bilingual explanations and instant scorecard analysis are top notch.',
    photoUrl: null,
  }
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'media' | 'questions' | 'payments' | 'support'>('media');

  // ================= MEDIA SUB-TABS =================
  const [mediaSubTab, setMediaSubTab] = useState<'brand' | 'banners' | 'winners'>('brand');

  // Section 1: Brand Slots
  const [headerLogoUrl, setHeaderLogoUrl] = useState<string | null>(null);
  const [footerEmblemUrl, setFooterEmblemUrl] = useState<string | null>(null);
  const [brandSaved, setBrandSaved] = useState(false);

  // Section 2: Banner Controls
  const [bannerTitleHi, setBannerTitleHi] = useState('राष्ट्रीय राज्यव्यवस्था ओलंपियाड : संवैधानिक ढांचा');
  const [bannerTitleEn, setBannerTitleEn] = useState('National Polity Olympiad : Constitutional Framework & Preamble');
  const [bannerScholarship, setBannerScholarship] = useState('₹50,000');
  const [bannerFee, setBannerFee] = useState('₹49');
  const [bannerSavedSuccess, setBannerSavedSuccess] = useState(false);
  const [uploadedBannerPreview, setUploadedBannerPreview] = useState<string | null>(null);

  // Section 3: Winner Cards
  const [winnersList, setWinnersList] = useState<WinnerCard[]>(INITIAL_WINNERS);
  const [winnerName, setWinnerName] = useState('');
  const [winnerRank, setWinnerRank] = useState('');
  const [winnerExam, setWinnerExam] = useState('');
  const [winnerGrant, setWinnerGrant] = useState('');
  const [winnerQuote, setWinnerQuote] = useState('');
  const [winnerPhoto, setWinnerPhoto] = useState<string | null>(null);
  const [showWinnerForm, setShowWinnerForm] = useState(false);

  // File Input Refs
  const headerLogoRef = useRef<HTMLInputElement | null>(null);
  const footerLogoRef = useRef<HTMLInputElement | null>(null);
  const bannerGraphicRef = useRef<HTMLInputElement | null>(null);
  const winnerPhotoRef = useRef<HTMLInputElement | null>(null);

  // Handlers for Brand Uploads
  const handleHeaderLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setHeaderLogoUrl(URL.createObjectURL(file));
  };

  const handleFooterLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFooterEmblemUrl(URL.createObjectURL(file));
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    setBrandSaved(true);
    setTimeout(() => setBrandSaved(false), 3000);
  };

  // Handlers for Banners
  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedBannerPreview(URL.createObjectURL(file));
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    setBannerSavedSuccess(true);
    setTimeout(() => setBannerSavedSuccess(false), 3000);
  };

  // Handlers for Winners
  const handleWinnerPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setWinnerPhoto(URL.createObjectURL(file));
  };

  const handleCreateWinner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!winnerName.trim() || !winnerRank.trim()) {
      alert('Kripya Candidate Name aur Rank bharein.');
      return;
    }

    const newW: WinnerCard = {
      id: `w-${Date.now()}`,
      name: winnerName,
      rank: winnerRank,
      exam: winnerExam || 'All-India Olympiad',
      grantWon: winnerGrant || '₹10,000 Grant',
      quote: winnerQuote,
      photoUrl: winnerPhoto,
    };

    setWinnersList([newW, ...winnersList]);
    setShowWinnerForm(false);
    setWinnerName('');
    setWinnerRank('');
    setWinnerExam('');
    setWinnerGrant('');
    setWinnerQuote('');
    setWinnerPhoto(null);
    alert('Winner card successfully add ho gaya!');
  };

  const handleDeleteWinner = (id: string) => {
    if (confirm('Kya aap is winner card ko delete karna chahte hain?')) {
      setWinnersList(winnersList.filter((w) => w.id !== id));
    }
  };

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
              <h1 className="font-extrabold text-sm sm:text-base leading-none text-white">
                Abhyaas Master Control Center
              </h1>
              <p className="text-[10px] text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Visual Media &amp; Asset Management Hub
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Live Website</span>
          </Link>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        
        {/* Main 4 Navigation Tabs */}
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
            <span>Media &amp; Asset Manager</span>
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
            <span>Payments &amp; Registrations</span>
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
            <span>Support &amp; Student Inbox</span>
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
            <span>Question Studio (Next Stage)</span>
          </button>
        </div>

        {/* ================= TAB: MEDIA & ASSET MANAGER ================= */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            
            {/* Sub-Tabs: Brand / Banners / Winners */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setMediaSubTab('brand')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  mediaSubTab === 'brand'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>1. Brand Logos &amp; Core Icons</span>
              </button>

              <button
                onClick={() => setMediaSubTab('banners')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  mediaSubTab === 'banners'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>2. Homepage Hero &amp; Banners</span>
              </button>

              <button
                onClick={() => setMediaSubTab('winners')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  mediaSubTab === 'winners'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Star className="w-4 h-4 text-amber-500" />
                <span>3. Winner Wall &amp; Video Reviews ({winnersList.length})</span>
              </button>
            </div>

            {/* SUB-TAB 1: BRAND LOGOS & CORE ICONS */}
            {mediaSubTab === 'brand' && (
              <form onSubmit={handleSaveBrand} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-black text-base text-slate-900">Brand Identity &amp; Target Slots</h3>
                    <p className="text-xs text-slate-500">Upload SVG/PNG brand logos for header navbar and dark footer</p>
                  </div>
                  {brandSaved && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Brand Assets Saved!
                    </span>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  
                  {/* Slot A: Header Brand Logo */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-900 block uppercase tracking-wider">
                      Slot A: Header Navbar Brand Logo
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Renders at top navigation on all pages. Recommended size: 240x60 transparent PNG or SVG.
                    </p>

                    <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {headerLogoUrl ? (
                          <img src={headerLogoUrl} alt="Header Logo" className="h-8 object-contain" />
                        ) : (
                          <div className="flex items-center gap-2 font-black text-slate-900 text-lg">
                            <div className="flex flex-col items-center justify-center w-5 h-5">
                              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[7px] border-b-amber-500 mb-[1px]" />
                              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] border-t-blue-600" />
                            </div>
                            <span>ABHYAAS.</span>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => headerLogoRef.current?.click()}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Change Logo
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={headerLogoRef}
                        onChange={handleHeaderLogoChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Slot B: Dark Footer Emblem */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-900 block uppercase tracking-wider">
                      Slot B: Dark Footer Brand Emblem
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Renders on #080e1a dark footer background across all screens.
                    </p>

                    <div className="p-4 bg-[#080e1a] rounded-xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {footerEmblemUrl ? (
                          <img src={footerEmblemUrl} alt="Footer Logo" className="h-8 object-contain" />
                        ) : (
                          <div className="flex items-center gap-2 font-black text-white text-lg">
                            <div className="flex flex-col items-center justify-center w-5 h-5">
                              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[7px] border-b-amber-500 mb-[1px]" />
                              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] border-t-blue-500" />
                            </div>
                            <span>ABHYAAS</span>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => footerLogoRef.current?.click()}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Change Emblem
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={footerLogoRef}
                        onChange={handleFooterLogoChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Core Brand Logos</span>
                  </button>
                </div>
              </form>
            )}

            {/* SUB-TAB 2: HOMEPAGE HERO & PROMO BANNERS */}
            {mediaSubTab === 'banners' && (
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Form (Span 7) */}
                <form onSubmit={handleSaveBanner} className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-blue-600" />
                      <h3 className="font-black text-base text-slate-900">Homepage Live Hero Banner</h3>
                    </div>
                    {bannerSavedSuccess && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Live Banner Updated!
                      </span>
                    )}
                  </div>

                  {/* Banner Image Slot */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Upload Olympiad Featured Graphic (PNG / JPEG / WebP)</label>
                    <div
                      onClick={() => bannerGraphicRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 transition-colors"
                    >
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">Click to upload custom graphic or map poster</p>
                      <p className="text-[11px] text-slate-400">Recommended dimension: 1200x500 px (Max 5MB)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      ref={bannerGraphicRef}
                      onChange={handleBannerImageChange}
                      className="hidden"
                    />
                  </div>

                  {/* Banner Titles */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Olympiad Hindi Headline</label>
                      <input
                        type="text"
                        value={bannerTitleHi}
                        onChange={(e) => setBannerTitleHi(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Olympiad English Title</label>
                      <input
                        type="text"
                        value={bannerTitleEn}
                        onChange={(e) => setBannerTitleEn(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Scholarship Pool (₹)</label>
                        <input
                          type="text"
                          value={bannerScholarship}
                          onChange={(e) => setBannerScholarship(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Assessment Processing Fee (₹)</label>
                        <input
                          type="text"
                          value={bannerFee}
                          onChange={(e) => setBannerFee(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Publish Changes to Live Homepage</span>
                    </button>
                  </div>
                </form>

                {/* Right Preview Card (Span 5) */}
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md">
                      LIVE HOMEPAGE PREVIEW
                    </span>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>

                  {uploadedBannerPreview && (
                    <div className="rounded-2xl overflow-hidden border border-slate-700">
                      <img src={uploadedBannerPreview} alt="Uploaded Graphic" className="w-full h-32 object-cover" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-blue-600/30 text-blue-300 border border-blue-500/30">
                      Scholarship: {bannerScholarship}
                    </span>
                    <h4 className="text-base font-black text-amber-400 leading-tight pt-1">
                      {bannerTitleHi}
                    </h4>
                    <p className="text-xs font-bold text-slate-300">
                      {bannerTitleEn}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">One-time Fee: {bannerFee}</span>
                    <span className="px-3 py-1.5 bg-amber-500 text-slate-950 font-black rounded-xl text-[11px]">
                      REGISTER • {bannerFee}
                    </span>
                  </div>
                </div>

              </div>
            )}

            {/* SUB-TAB 3: WINNER WALL & STUDENT REVIEWS */}
            {mediaSubTab === 'winners' && (
              <div className="space-y-6">
                
                {/* Action Bar */}
                <div className="flex items-center justify-between bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
                  <div>
                    <h3 className="font-black text-base text-slate-900">Merit Rankers &amp; Video Testimonials</h3>
                    <p className="text-xs text-slate-500">Manage student photos, rank achievements and video review embeds</p>
                  </div>

                  <button
                    onClick={() => setShowWinnerForm(!showWinnerForm)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{showWinnerForm ? 'Close Form' : 'Add New Winner Card'}</span>
                  </button>
                </div>

                {/* Add Winner Form */}
                {showWinnerForm && (
                  <form onSubmit={handleCreateWinner} className="bg-white border-2 border-blue-600 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h4 className="font-black text-base text-slate-900 flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        Create Merit Ranker Card
                      </h4>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Candidate Full Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Anjali Sharma"
                          value={winnerName}
                          onChange={(e) => setWinnerName(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Rank Secured</label>
                        <input
                          type="text"
                          placeholder="e.g. AIR 01 / All-India Rank 1"
                          value={winnerRank}
                          onChange={(e) => setWinnerRank(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Exam / Olympiad Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Weekly Speed Sprint (Polity)"
                          value={winnerExam}
                          onChange={(e) => setWinnerExam(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Grant / Scholarship Won</label>
                        <input
                          type="text"
                          placeholder="e.g. ₹15,000 Academic Fellowship"
                          value={winnerGrant}
                          onChange={(e) => setWinnerGrant(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
                          required
                        />
                      </div>
                    </div>

                    {/* Candidate Photo Upload */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">Ranker Photo / Cheque Ceremony Image (PNG/JPG)</label>
                      <div className="flex items-center gap-4">
                        {winnerPhoto && (
                          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-300">
                            <img src={winnerPhoto} alt="Winner" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => winnerPhotoRef.current?.click()}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          {winnerPhoto ? 'Replace Candidate Photo' : 'Upload Candidate Photo'}
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          ref={winnerPhotoRef}
                          onChange={handleWinnerPhotoChange}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Student Review / Feedback Quote</label>
                      <textarea
                        rows={2}
                        placeholder="Type student review statement..."
                        value={winnerQuote}
                        onChange={(e) => setWinnerQuote(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowWinnerForm(false)}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
                      >
                        Publish to Live Winner Wall
                      </button>
                    </div>
                  </form>
                )}

                {/* Winner Cards Stream */}
                <div className="grid md:grid-cols-2 gap-4">
                  {winnersList.map((w) => (
                    <div
                      key={w.id}
                      className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 font-black text-xs flex items-center justify-center overflow-hidden">
                            {w.photoUrl ? (
                              <img src={w.photoUrl} alt={w.name} className="w-full h-full object-cover" />
                            ) : (
                              w.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">{w.name}</h4>
                            <p className="text-xs text-blue-600 font-bold">{w.rank} • {w.exam}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteWinner(w.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete Card"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 italic">
                        &quot;{w.quote}&quot;
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="font-black text-emerald-600">{w.grantWon}</span>
                        {w.videoUrl && (
                          <span className="text-[11px] text-blue-600 font-bold flex items-center gap-1">
                            <Video className="w-3.5 h-3.5" /> Video Verified
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>
        )}

        {/* Tab 2: Payments (Clean Placeholder for next small turn) */}
        {activeTab === 'payments' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CreditCard className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Razorpay &amp; Registration Logs</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Media Manager test hone ke baad hum is slot table ko fully active karenge.
            </p>
          </div>
        )}

        {/* Tab 3: Support Desk */}
        {activeTab === 'support' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Aspirant Support &amp; Ticket CRM</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Student complaints aur email responses yahan manage honge.
            </p>
          </div>
        )}

        {/* Tab 4: Question Studio */}
        {activeTab === 'questions' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Question Bank &amp; Olympiad Vault</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Saare chhote modules ready hone ke baad isme diagram uploader aur approval engine connect hoga.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}