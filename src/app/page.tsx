'use client';

import React, { useState } from 'react';
import Navbar from './components/Navbar';
import TopNavigation from './components/TopNavigation';
import MegaOlympiadBanner from './components/MegaOlympiadBanner';
import LiveArenas from './components/LiveArenas';
import SubjectMastery from './components/SubjectMastery';
import Leaderboard from './components/Leaderboard';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';

export default function Home() {
  const [currentLang, setCurrentLang] = useState<'hi' | 'en'>('hi');
  const [activeExam, setActiveExam] = useState('UPSC CSE');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* 1. Header Navbar */}
      <Navbar />

      {/* 2. Top Tabs & Medium Switcher */}
      <TopNavigation 
        currentLang={currentLang} 
        onLangChange={setCurrentLang}
        activeExam={activeExam}
        onExamChange={setActiveExam}
      />

      {/* Main Content Area */}
      <div className="flex-1 space-y-2 pb-12">
        {/* 3. Mega Olympiad Scholarship Banner */}
        <MegaOlympiadBanner />

        {/* 4. Live Speed Drills */}
        <LiveArenas currentLang={currentLang} />

        {/* 5. Subject Mastery Drilldown */}
        <SubjectMastery />

        {/* 6. Today's Scholarship Scholars */}
        <Leaderboard />
      </div>

      {/* 7. Comprehensive Academic & Legal Footer */}
      <Footer />

      {/* 8. Mobile Bottom Bar */}
      <BottomNav />
    </div>
  );
}