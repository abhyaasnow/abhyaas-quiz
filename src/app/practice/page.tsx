'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  BookOpen,
  ArrowRight,
  Flame,
  SlidersHorizontal,
  Landmark,
  GraduationCap,
  Zap,
  Target
} from 'lucide-react';

interface MicroTopic {
  id: string;
  titleEn: string;
  titleHi: string;
  questionsCount: number;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  isPYQ: boolean;
}

interface Subject {
  id: string;
  nameEn: string;
  nameHi: string;
  iconTag: string;
  topicsCount: number;
  totalQuestions: number;
  topics: MicroTopic[];
}

interface Exam {
  id: string;
  nameEn: string;
  nameHi: string;
  tagline: string;
  subjects: Subject[];
}

interface Stream {
  id: string;
  nameEn: string;
  nameHi: string;
  icon: React.ComponentType<{ className?: string }>;
  exams: Exam[];
}

const STREAMS_DATA: Stream[] = [
  {
    id: 'civil-services',
    nameEn: 'Civil Services & State PSC',
    nameHi: 'सिविल सेवा एवं राज्य PCS',
    icon: Landmark,
    exams: [
      {
        id: 'upsc-cse',
        nameEn: 'UPSC CSE (IAS/IPS)',
        nameHi: 'संघ लोक सेवा आयोग',
        tagline: 'General Studies Paper-1 & CSAT Prelims Standard',
        subjects: [
          {
            id: 'polity',
            nameEn: 'Indian Polity & Governance',
            nameHi: 'भारतीय राजव्यवस्था एवं शासन',
            iconTag: '⚖️',
            topicsCount: 6,
            totalQuestions: 640,
            topics: [
              {
                id: 'pol-1',
                titleEn: 'Preamble, Historical Background & Salient Features',
                titleHi: 'संविधान की प्रस्तावना, ऐतिहासिक पृष्ठभूमि एवं विशेषताएं',
                questionsCount: 85,
                difficulty: 'Easy',
                isPYQ: true,
              },
              {
                id: 'pol-2',
                titleEn: 'Fundamental Rights, DPSP & Duties (Art 12-51A)',
                titleHi: 'मूल अधिकार, नीति निदेशक तत्व एवं मूल कर्तव्य',
                questionsCount: 140,
                difficulty: 'Advanced',
                isPYQ: true,
              },
              {
                id: 'pol-3',
                titleEn: 'Union Parliament, Law-Making & Committees',
                titleHi: 'संसद, कानून निर्माण प्रक्रिया एवं संसदीय समितियां',
                questionsCount: 125,
                difficulty: 'Advanced',
                isPYQ: true,
              },
              {
                id: 'pol-4',
                titleEn: 'Panchayati Raj & Local Bodies (73rd & 74th Amend.)',
                titleHi: 'पंचायती राज एवं स्थानीय निकाय (73वां व 74वां संशोधन)',
                questionsCount: 95,
                difficulty: 'Medium',
                isPYQ: true,
              },
              {
                id: 'pol-5',
                titleEn: 'Judiciary: Supreme Court & Judicial Review',
                titleHi: 'न्यायपालिका: सर्वोच्च न्यायालय एवं न्यायिक समीक्षा',
                questionsCount: 110,
                difficulty: 'Advanced',
                isPYQ: true,
              },
              {
                id: 'pol-6',
                titleEn: 'Constitutional & Statutory Bodies',
                titleHi: 'संवैधानिक एवं सांविधिक निकाय',
                questionsCount: 85,
                difficulty: 'Medium',
                isPYQ: false,
              },
            ],
          },
          {
            id: 'history',
            nameEn: 'Modern Indian History',
            nameHi: 'आधुनिक भारत का इतिहास',
            iconTag: '📜',
            topicsCount: 5,
            totalQuestions: 510,
            topics: [
              {
                id: 'his-1',
                titleEn: 'Revolt of 1857, Tribal & Peasant Uprisings',
                titleHi: '1857 की क्रांति, जनजातीय एवं किसान आंदोलन',
                questionsCount: 90,
                difficulty: 'Medium',
                isPYQ: true,
              },
              {
                id: 'his-2',
                titleEn: 'Socio-Religious Reform Movements (19th Century)',
                titleHi: '19वीं सदी के सामाजिक-धार्मिक सुधार आंदोलन',
                questionsCount: 80,
                difficulty: 'Easy',
                isPYQ: true,
              },
              {
                id: 'his-3',
                titleEn: 'INC Formation, Moderate & Extremist Phase',
                titleHi: 'कांग्रेस की स्थापना, उदारवादी व उग्रवादी चरण',
                questionsCount: 105,
                difficulty: 'Medium',
                isPYQ: true,
              },
              {
                id: 'his-4',
                titleEn: 'Gandhian Movements (NCM, CDM, Quit India)',
                titleHi: 'गांधीवादी जन आंदोलन (असहयोग, सविनय अवज्ञा, भारत छोड़ो)',
                questionsCount: 135,
                difficulty: 'Advanced',
                isPYQ: true,
              },
              {
                id: 'his-5',
                titleEn: 'Constitutional Developments (1773-1947)',
                titleHi: 'ब्रिटिश कालीन संवैधानिक विकास एवं अधिनियम',
                questionsCount: 100,
                difficulty: 'Advanced',
                isPYQ: true,
              },
            ],
          },
          {
            id: 'economy',
            nameEn: 'Indian Economy & Banking',
            nameHi: 'भारतीय अर्थव्यवस्था एवं बैंकिंग',
            iconTag: '📈',
            topicsCount: 4,
            totalQuestions: 420,
            topics: [
              {
                id: 'eco-1',
                titleEn: 'National Income, GDP & Inflation Indices',
                titleHi: 'राष्ट्रीय आय, जीडीपी एवं मुद्रास्फीति सूचकांक',
                questionsCount: 110,
                difficulty: 'Medium',
                isPYQ: true,
              },
              {
                id: 'eco-2',
                titleEn: 'Monetary Policy & RBI Quantitative Tools',
                titleHi: 'मौद्रिक नीति ढांचा एवं आरबीआई मौद्रिक उपकरण',
                questionsCount: 120,
                difficulty: 'Advanced',
                isPYQ: true,
              },
              {
                id: 'eco-3',
                titleEn: 'Fiscal Policy, Union Budget & Deficits',
                titleHi: 'राजकोषीय नीति, केंद्रीय बजट एवं घाटे के प्रकार',
                questionsCount: 95,
                difficulty: 'Advanced',
                isPYQ: true,
              },
              {
                id: 'eco-4',
                titleEn: 'Foreign Trade & Balance of Payments (BoP)',
                titleHi: 'विदेशी व्यापार, भुगतान संतुलन एवं विदेशी मुद्रा भंडार',
                questionsCount: 95,
                difficulty: 'Medium',
                isPYQ: false,
              },
            ],
          },
        ],
      },
      {
        id: 'state-psc',
        nameEn: 'State PSC (UPPSC, BPSC, RAS, MPPSC)',
        nameHi: 'राज्य लोक सेवा आयोग',
        tagline: 'State GK, GS & Prelims Pattern Mastery',
        subjects: [
          {
            id: 'state-gk',
            nameEn: 'State General Studies & Geography',
            nameHi: 'राज्य सामान्य ज्ञान एवं भूगोल',
            iconTag: '🏛️',
            topicsCount: 4,
            totalQuestions: 380,
            topics: [
              {
                id: 'st-1',
                titleEn: 'State Geography, Rivers & Minerals',
                titleHi: 'राज्य का भूगोल, नदियां, खनिज एवं कृषि क्षेत्र',
                questionsCount: 95,
                difficulty: 'Medium',
                isPYQ: true,
              },
              {
                id: 'st-2',
                titleEn: 'State History & Cultural Heritage',
                titleHi: 'राज्य का इतिहास, स्थापत्य कला एवं सांस्कृतिक विरासत',
                questionsCount: 85,
                difficulty: 'Easy',
                isPYQ: true,
              },
              {
                id: 'st-3',
                titleEn: 'State Administration & Panchayati Raj',
                titleHi: 'राज्य प्रशासनिक ढांचा एवं जिला प्रशासन',
                questionsCount: 90,
                difficulty: 'Medium',
                isPYQ: false,
              },
              {
                id: 'st-4',
                titleEn: 'Flagship State Welfare Schemes & Budget',
                titleHi: 'प्रमुख राज्य कल्याणकारी योजनाएं एवं बजट',
                questionsCount: 110,
                difficulty: 'Medium',
                isPYQ: true,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ssc-govt',
    nameEn: 'SSC, Banking & CSAT',
    nameHi: 'एसएससी, बैंकिंग एवं योग्यता',
    icon: GraduationCap,
    exams: [
      {
        id: 'ssc-cgl',
        nameEn: 'SSC CGL Tier 1 & 2',
        nameHi: 'कर्मचारी चयन आयोग',
        tagline: 'Combined Graduate Level Speed Drills',
        subjects: [
          {
            id: 'quant',
            nameEn: 'Quantitative Aptitude',
            nameHi: 'संख्यात्मक अभियोग्यता (गणित)',
            iconTag: '➗',
            topicsCount: 4,
            totalQuestions: 560,
            topics: [
              {
                id: 'q-1',
                titleEn: 'Percentages, Profit, Loss & Discount',
                titleHi: 'प्रतिशतता, लाभ-हानि एवं बट्टा',
                questionsCount: 150,
                difficulty: 'Medium',
                isPYQ: true,
              },
              {
                id: 'q-2',
                titleEn: 'Time & Work, Pipes & Cisterns',
                titleHi: 'कार्य एवं समय, नल एवं टंकी',
                questionsCount: 130,
                difficulty: 'Medium',
                isPYQ: true,
              },
              {
                id: 'q-3',
                titleEn: 'Time, Speed, Distance, Trains & Boats',
                titleHi: 'समय, चाल, दूरी, रेलगाड़ी एवं नाव-धारा',
                questionsCount: 140,
                difficulty: 'Advanced',
                isPYQ: true,
              },
              {
                id: 'q-4',
                titleEn: 'Geometry, Triangles & Coordinate',
                titleHi: 'ज्यामिति, त्रिभुज एवं निर्देशांक ज्यामिति',
                questionsCount: 140,
                difficulty: 'Advanced',
                isPYQ: true,
              },
            ],
          },
          {
            id: 'reasoning',
            nameEn: 'General Intelligence & Reasoning',
            nameHi: 'तार्किक क्षमता एवं अभियोग्यता',
            iconTag: '🧩',
            topicsCount: 4,
            totalQuestions: 480,
            topics: [
              {
                id: 'r-1',
                titleEn: 'Syllogism & Deductive Logic Statements',
                titleHi: 'न्याय निगमन एवं कथन-निष्कर्ष',
                questionsCount: 120,
                difficulty: 'Medium',
                isPYQ: true,
              },
              {
                id: 'r-2',
                titleEn: 'Blood Relations & Family Tree Codes',
                titleHi: 'रक्त संबंध एवं पारिवारिक संबंध',
                questionsCount: 110,
                difficulty: 'Easy',
                isPYQ: true,
              },
              {
                id: 'r-3',
                titleEn: 'Coding-Decoding & Alphanumeric Series',
                titleHi: 'कोडिंग-डिकोडिंग एवं वर्णमाला श्रृंखला',
                questionsCount: 130,
                difficulty: 'Easy',
                isPYQ: true,
              },
              {
                id: 'r-4',
                titleEn: 'Direction Sense & Seating Arrangement',
                titleHi: 'दिशा परीक्षण एवं बैठक व्यवस्था',
                questionsCount: 120,
                difficulty: 'Medium',
                isPYQ: true,
              },
            ],
          },
        ],
      },
    ],
  },
];

export default function PracticePage() {
  const [selectedStreamId, setSelectedStreamId] = useState('civil-services');
  const [selectedExamId, setSelectedExamId] = useState('upsc-cse');
  const [selectedSubjectId, setSelectedSubjectId] = useState('polity');
  const [searchQuery, setSearchQuery] = useState('');

  const activeStream = useMemo(
    () => STREAMS_DATA.find((s) => s.id === selectedStreamId) || STREAMS_DATA[0],
    [selectedStreamId]
  );

  const activeExam = useMemo(() => {
    return activeStream.exams.find((e) => e.id === selectedExamId) || activeStream.exams[0];
  }, [activeStream, selectedExamId]);

  const activeSubject = useMemo(() => {
    return activeExam.subjects.find((sub) => sub.id === selectedSubjectId) || activeExam.subjects[0];
  }, [activeExam, selectedSubjectId]);

  const filteredTopics = useMemo(() => {
    if (!activeSubject) return [];
    if (!searchQuery.trim()) return activeSubject.topics;
    const query = searchQuery.toLowerCase();
    return activeSubject.topics.filter(
      (topic) =>
        topic.titleEn.toLowerCase().includes(query) ||
        topic.titleHi.toLowerCase().includes(query)
    );
  }, [activeSubject, searchQuery]);

  const handleStreamChange = (streamId: string) => {
    setSelectedStreamId(streamId);
    const newStream = STREAMS_DATA.find((s) => s.id === streamId);
    if (newStream && newStream.exams.length > 0) {
      setSelectedExamId(newStream.exams[0].id);
      setSelectedSubjectId(newStream.exams[0].subjects[0]?.id || '');
    }
  };

  const handleExamChange = (examId: string) => {
    setSelectedExamId(examId);
    const newExam = activeStream.exams.find((e) => e.id === examId);
    if (newExam && newExam.subjects.length > 0) {
      setSelectedSubjectId(newExam.subjects[0].id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-600 selection:text-white pb-24">
      {/* Top Banner Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">
                <Target className="w-4 h-4" />
                <span>Syllabus-Mapped Question Bank • द्विभाषी अभ्यास</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Practice &amp; Topic Speed Drills
              </h1>
              <p className="mt-1.5 text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Select your competitive stream, target examination, and chapter to begin unlimited free timed speed drills with instant explanations.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-2xl flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Free Drills</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900">24x7 Live</p>
              </div>
            </div>
          </div>

          {/* Level 1: Stream Tabs */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
            {STREAMS_DATA.map((stream) => {
              const Icon = stream.icon;
              const isSelected = stream.id === selectedStreamId;
              return (
                <button
                  key={stream.id}
                  onClick={() => handleStreamChange(stream.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{stream.nameEn}</span>
                  <span className={`text-[11px] font-normal ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                    ({stream.nameHi})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Level 2: Target Exam Chips */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Exam:
            </span>
            {activeStream.exams.map((exam) => {
              const isSelected = exam.id === selectedExamId;
              return (
                <button
                  key={exam.id}
                  onClick={() => handleExamChange(exam.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span>{exam.nameEn}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Level 3: Left Sidebar - Subject Selector (Span 4) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Subjects &amp; Modules
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">
                {activeExam.subjects.length} Subjects
              </span>
            </div>

            <div className="space-y-2">
              {activeExam.subjects.map((sub) => {
                const isSelected = sub.id === (activeSubject?.id || '');
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-white border-blue-600 shadow-md ring-1 ring-blue-600'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-lg flex-shrink-0">
                        {sub.iconTag}
                      </div>
                      <div>
                        <h4 className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-blue-600' : 'text-slate-900'}`}>
                          {sub.nameEn}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {sub.nameHi}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {sub.topicsCount} Chapters • {sub.totalQuestions}+ MCQs
                        </p>
                      </div>
                    </div>
                    <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-blue-600 translate-x-1' : 'text-slate-300'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level 4: Right Section - Chapter & Micro-Topic Drill Cards (Span 8) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Subject Info & Live Search Filter */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md uppercase tracking-wide">
                  Active Subject Module
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-2">
                  {activeSubject?.nameEn || 'Select a Subject'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {activeSubject?.nameHi}
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64 flex-shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter chapters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Micro-Topic Cards List */}
            <div className="space-y-3">
              {filteredTopics.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs">
                  No chapters found matching &quot;{searchQuery}&quot;.
                </div>
              ) : (
                filteredTopics.map((topic, index) => (
                  <div
                    key={topic.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                          Chapter #{index + 1}
                        </span>

                        {topic.isPYQ && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded flex items-center gap-1">
                            <Flame className="w-3 h-3 text-amber-500" />
                            <span>High Yield PYQ</span>
                          </span>
                        )}

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            topic.difficulty === 'Advanced'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : topic.difficulty === 'Medium'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {topic.difficulty}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                        {topic.titleEn}
                      </h3>

                      <p className="text-xs text-slate-500 font-medium">
                        {topic.titleHi}
                      </p>

                      <p className="text-[11px] text-slate-400 pt-0.5">
                        Question Bank: <strong className="text-slate-700">{topic.questionsCount} MCQs</strong> • Exam Pattern: +2.00 / -0.66 Mark
                      </p>
                    </div>

                    {/* Start Button */}
                    <Link
                      href={`/quiz?topic=${encodeURIComponent(topic.titleEn)}`}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 flex-shrink-0 shadow-sm shadow-blue-500/20 cursor-pointer"
                    >
                      <span>Start Drill (10Q)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}