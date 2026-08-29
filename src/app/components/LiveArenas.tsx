'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, HelpCircle, Zap, ArrowRight } from 'lucide-react';

interface LiveArenasProps {
  currentLang: 'hi' | 'en';
}

const liveArenasData = [
  {
    id: 'polity-101',
    topicHi: 'भारतीय राजव्यवस्था: संवैधानिक ढांचा एवं प्रस्तावना',
    topicEn: 'Indian Polity: Constitutional Framework & Preamble',
    questions: 10,
    duration: 5,
    xpReward: '+100 XP',
    badgeHi: 'दैनिक स्पीड टेस्ट',
    badgeEn: 'DAILY SPEED DRILL',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'history-101',
    topicHi: 'आधुनिक भारत का इतिहास: 1857 की क्रांति व प्रमुख नेता',
    topicEn: 'Modern Indian History: 1857 Revolt & Leaders',
    questions: 15,
    duration: 8,
    xpReward: '+80 XP',
    badgeHi: 'PYQ पुनरावृत्ति',
    badgeEn: 'PYQ REVISION',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'economy-101',
    topicHi: 'भारतीय अर्थव्यवस्था: मौद्रिक नीति एवं मुद्रास्फीति',
    topicEn: 'RBI Monetary Policy & Inflation Control Drill',
    questions: 10,
    duration: 5,
    xpReward: '+80 XP',
    badgeHi: 'टॉपिक अभ्यास',
    badgeEn: 'TOPIC DRILL',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
];

export default function LiveArenas({ currentLang }: LiveArenasProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-6 sm:mt-8">
      
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <div>
            <h3 className="text-base sm:text-lg font-black tracking-wide text-slate-900 uppercase">
              {currentLang === 'hi' ? 'निःशुल्क दैनिक अभ्यास (Free Daily Drills)' : 'Free Daily Speed Drills'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {currentLang === 'hi' ? '24x7 कभी भी अभ्यास करें और अपनी तैयारी मजबूत करें' : 'Practice 24x7 & build your daily streak'}
            </p>
          </div>
        </div>
        <button className="text-xs sm:text-sm font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1">
          {currentLang === 'hi' ? 'सभी देखें' : 'All Drills'} <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {liveArenasData.map((arena) => (
          <div
            key={arena.id}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${arena.badgeColor}`}>
                  {currentLang === 'hi' ? arena.badgeHi : arena.badgeEn}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                  {arena.xpReward}
                </span>
              </div>

              {/* Title (Bilingual Friendly) */}
              <h4 className="font-bold text-sm sm:text-base text-slate-900 leading-snug mb-1 line-clamp-2">
                {currentLang === 'hi' ? arena.topicHi : arena.topicEn}
              </h4>
              <span className="text-[11px] text-slate-400 font-medium block mb-3 line-clamp-1">
                {currentLang === 'hi' ? arena.topicEn : arena.topicHi}
              </span>

              {/* Meta Stats */}
              <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium mb-4">
                <span className="flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                  {arena.questions} {currentLang === 'hi' ? 'प्रश्न' : 'MCQs'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  {arena.duration} {currentLang === 'hi' ? 'मिनट' : 'Mins'}
                </span>
                <span>•</span>
                <span className="text-emerald-600 font-bold">{currentLang === 'hi' ? 'निःशुल्क' : 'Free'}</span>
              </div>
            </div>

            {/* Action Link */}
            <Link
              href={`/quiz?id=${arena.id}`}
              className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>{currentLang === 'hi' ? 'अभ्यास शुरू करें (Start Drill)' : 'Start Free Drill'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>

    </section>
  );
}