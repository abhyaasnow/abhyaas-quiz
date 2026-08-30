'use client';

import React, { useState } from 'react';
import MegaOlympiadBanner from './components/MegaOlympiadBanner';
import LiveArenas from './components/LiveArenas';
import SubjectMastery from './components/SubjectMastery';
import Leaderboard from './components/Leaderboard';

export default function Home() {
  const [currentLang] = useState<'hi' | 'en'>('hi');

  return (
    <div className="w-full flex flex-col">
      {/* 1. Mega Olympiad Feature Hero Banner */}
      <section className="w-full">
        <MegaOlympiadBanner />
      </section>

      {/* 2. Live Assessment & Speed Drill Arenas */}
      <section className="w-full py-6">
        <LiveArenas currentLang={currentLang} />
      </section>

      {/* 3. Subject-wise Precision Mastery */}
      <section className="w-full py-6 bg-white border-y border-slate-200">
        <SubjectMastery />
      </section>

      {/* 4. All-India Live Merit Leaderboard */}
      <section className="w-full py-8">
        <Leaderboard />
      </section>
    </div>
  );
}