import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Scale, Award, BookOpen, AlertCircle } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-600 selection:text-white pb-20">
      {/* Top Navigation Bar */}
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            Back to Home
          </Link>
          <span className="text-[11px] font-bold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full uppercase tracking-wide">
            Legal &amp; Compliance
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        {/* Header */}
        <div className="border-b border-slate-200 pb-8 mb-8">
          <div className="inline-flex items-center gap-2 text-amber-600 mb-2.5 text-xs font-bold tracking-wider uppercase">
            <Scale className="w-4 h-4" />
            Examination &amp; Assessment Framework
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Terms of Examination &amp; Service
          </h1>
          <p className="mt-2.5 text-slate-600 text-xs sm:text-sm leading-relaxed">
            Last Updated: August 2026. Please read these terms carefully before enrolling in any speed drills, national assessments, or scholarship olympiads hosted on Abhyaas.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5 mb-3">
              <BookOpen className="w-4 h-4 text-blue-600" />
              1. Platform Nature &amp; Pure Academic Skill
            </h2>
            <p className="mb-3">
              <strong className="text-slate-900">Abhyaas (abhyaasnow.in)</strong> is an independent academic assessment, practice, and scholarship platform. All tests, sectional speed drills, and Olympiads conducted on this portal are strictly <strong>Games of Pure Skill and Knowledge</strong> based on competitive examination syllabi (including UPSC Civil Services, State PSC, SSC, and Banking formats).
            </p>
            <p className="text-slate-600">
              The platform does not conduct wagering, betting, or chance-based contests. Outcomes are determined solely by candidate subject knowledge, memory retrieval, problem-solving accuracy, and recorded time efficiency.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5 mb-3">
              <Award className="w-4 h-4 text-amber-600" />
              2. Examination Processing Fee &amp; Scholarship Grants
            </h2>
            <p className="mb-3">
              Nominal fees collected for specific Olympiad tiers represent <strong className="text-slate-900">Registration and Assessment Processing Fees</strong> utilized towards question-bank curation, cloud server infrastructure, anti-cheat proctoring systems, and operational overhead.
            </p>
            <p className="text-slate-600">
              Disbursements to top-ranking candidates represent <strong className="text-slate-900">Merit Scholarships and Educational Research Grants</strong> designed to support aspirant education. All grant claims require identity and account validation.
            </p>
          </section>

          {/* Section 3 */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              3. Code of Conduct &amp; Anti-Cheating Policy
            </h2>
            <p className="mb-3">
              Candidates must maintain absolute academic integrity during live examinations. The following activities are strictly prohibited:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-xs sm:text-sm">
              <li>Using external AI tools, screen-reading software, or search engines during active sessions.</li>
              <li>Multiple account creations or proxy test-taking.</li>
              <li>Repeated window tab-switching beyond permitted threshold warnings.</li>
              <li>Attempting to extract or reverse-engineer question payloads from network traffic.</li>
            </ul>
            <div className="mt-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>Violation of fair-play rules results in immediate disqualification, rank nullification, and permanent platform ban.</span>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-3">
              4. Evaluation, Ranking &amp; Tie-Breaker Mechanism
            </h2>
            <p className="mb-3">
              Test scores are computed through automated algorithmic evaluation based on predefined marking schemes (+Correct, -Incorrect, 0 Unanswered).
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-slate-600 text-xs sm:text-sm">
              <li>Higher accuracy ratio (fewer negative answers).</li>
              <li>Lesser total time consumed across the completed session.</li>
              <li>Sectional performance in the higher-weighted difficulty module.</li>
            </ol>
          </section>

          {/* Section 5 */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-3">
              5. Intellectual Property Rights
            </h2>
            <p className="text-slate-600">
              All mock questions, explanations, graphics, scoring engines, and editorial compilations on <strong className="text-slate-900">Abhyaas</strong> are the proprietary intellectual property of the platform. Unauthorized copying, commercial distribution, or scraping is strictly prohibited under Indian Copyright laws.
            </p>
          </section>

          {/* Section 6 */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-3">
              6. Grievance &amp; Support
            </h2>
            <p className="text-slate-600">
              For any queries regarding evaluation, registration errors, or dispute redressal, candidates may contact the examination cell at <strong className="text-blue-600">support@abhyaasnow.in</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}