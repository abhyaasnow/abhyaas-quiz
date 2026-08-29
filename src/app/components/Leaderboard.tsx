'use client';

import React from 'react';
import { Trophy, Award, ChevronRight } from 'lucide-react';

interface Scholar {
  rank: number;
  name: string;
  state: string;
  score: number;
  accuracy: string;
  avatar: string;
  grant: string;
}

const topScholars: Scholar[] = [
  {
    rank: 1,
    name: 'Priya Sharma',
    state: 'UP',
    score: 98,
    accuracy: '98%',
    avatar: 'PS',
    grant: '₹5,000 Grant',
  },
  {
    rank: 2,
    name: 'Rahul Verma',
    state: 'Delhi',
    score: 94,
    accuracy: '94%',
    avatar: 'RV',
    grant: '₹3,000 Grant',
  },
  {
    rank: 3,
    name: 'Ananya Roy',
    state: 'WB',
    score: 92,
    accuracy: '92%',
    avatar: 'AR',
    grant: '₹1,500 Grant',
  },
];

export default function Leaderboard() {
  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-8 sm:mt-10">
      
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3.5 sm:mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <h3 className="text-base sm:text-lg font-black tracking-wide text-slate-900 uppercase">
              National Scholarship Scholars
            </h3>
            <p className="text-xs text-slate-500 font-medium">Last Olympiad Top Rankers & Merit Awardees</p>
          </div>
        </div>
        <button className="text-xs sm:text-sm font-bold text-blue-700 hover:text-blue-800 flex items-center gap-0.5">
          All India Merit List <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Scholar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {topScholars.map((scholar) => {
          const isFirst = scholar.rank === 1;
          return (
            <div
              key={scholar.rank}
              className={`relative overflow-hidden rounded-2xl p-3.5 sm:p-4 border transition-all flex items-center justify-between gap-2.5 ${
                isFirst
                  ? 'bg-gradient-to-r from-amber-50/90 via-amber-50/40 to-white border-amber-300 shadow-xs'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              {/* Left Side: Rank + Avatar + Name Details */}
              <div className="flex items-center gap-2.5 min-w-0">
                
                {/* Rank Circle (Clean 1, 2, 3) */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-xs sm:text-sm flex-shrink-0 ${
                    isFirst
                      ? 'bg-amber-500 text-white shadow-xs'
                      : scholar.rank === 2
                      ? 'bg-slate-300 text-slate-800'
                      : 'bg-amber-700/80 text-white'
                  }`}
                >
                  {scholar.rank}
                </div>

                {/* Avatar */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                  {scholar.avatar}
                </div>

                {/* Details */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-900 truncate">
                      {scholar.name}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded flex-shrink-0">
                      {scholar.state}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium block">
                    Acc: <strong className="text-slate-800">{scholar.accuracy}</strong>
                  </span>
                </div>
              </div>

              {/* Right Side: Scholarship Grant & Score */}
              <div className="text-right flex-shrink-0">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full whitespace-nowrap">
                  <Award className="w-3 h-3 text-emerald-700 flex-shrink-0" />
                  {scholar.grant}
                </span>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">
                  Score: {scholar.score}/100
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
}