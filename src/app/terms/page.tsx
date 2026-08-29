import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Scale, Award, BookOpen, AlertCircle } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white pb-20">
      {/* Top Navigation */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
            Legal & Compliance
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 pt-10">
        {/* Header */}
        <div className="border-b border-slate-800 pb-8 mb-8">
          <div className="inline-flex items-center gap-2 text-indigo-400 mb-3 text-sm font-semibold tracking-wide uppercase">
            <Scale className="w-4 h-4" />
            Examination & Assessment Framework
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Terms of Examination & Service
          </h1>
          <p className="mt-3 text-slate-400 text-sm leading-relaxed">
            Last Updated: August 2026. Please read these terms carefully before enrolling in any speed drills, national assessments, or scholarship olympiads hosted on Abhyaas.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 text-slate-300 text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              1. Platform Nature & Pure Academic Skill
            </h2>
            <p className="mb-3">
              <strong>Abhyaas (abhyaasnow.in)</strong> is an independent academic assessment, practice, and scholarship platform. All tests, sectional speed drills, and Olympiads conducted on this portal are strictly <strong>Games of Pure Skill and Knowledge</strong> based on competitive examination syllabi (including SSC, Banking, Railways, State PCS, and UPSC formats).
            </p>
            <p>
              The platform does not conduct wagering, betting, or chance-based contests. Outcomes are determined solely by candidate subject knowledge, memory retrieval, problem-solving accuracy, and recorded time efficiency.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-indigo-400" />
              2. Examination Processing Fee & Scholarship Grants
            </h2>
            <p className="mb-3">
              Nominal fees collected for specific Olympiad tiers represent <strong>Registration and Assessment Processing Fees</strong> utilized towards question-bank curation, cloud server infrastructure, anti-cheat proctoring systems, and operational overhead.
            </p>
            <p>
              Disbursements to top-ranking candidates represent <strong>Merit Scholarships and Educational Research Grants</strong> designed to support aspirant education. All grant claims require identity and account validation.
            </p>
          </section>

          {/* Section 3 */}
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              3. Code of Conduct & Anti-Cheating Policy
            </h2>
            <p className="mb-3">
              Candidates must maintain absolute academic integrity during live examinations. The following activities are strictly prohibited:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Using external AI tools, screen-reading software, or search engines during active sessions.</li>
              <li>Multiple account creations or proxy test-taking.</li>
              <li>Repeated window tab-switching beyond permitted threshold warnings.</li>
              <li>Attempting to extract or reverse-engineer question payloads from network traffic.</li>
            </ul>
            <p className="mt-3 text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Violation of fair-play rules results in immediate disqualification, rank nullification, and permanent platform ban.
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-3">
              4. Evaluation, Ranking & Tie-Breaker Mechanism
            </h2>
            <p className="mb-3">
              Test scores are computed through automated algorithmic evaluation based on predefined marking schemes (+Correct, -Incorrect, 0 Unanswered).
            </p>
            <p>
              In cases where two or more candidates secure identical overall marks, the tie-breaker criteria apply in this order:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-slate-400 mt-2">
              <li>Higher accuracy ratio (fewer negative answers).</li>
              <li>Lesser total time consumed across the completed session.</li>
              <li>Sectional performance in the higher-weighted difficulty module.</li>
            </ol>
          </section>

          {/* Section 5 */}
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-3">
              5. Intellectual Property Rights
            </h2>
            <p>
              All mock questions, explanations, graphics, scoring engines, and editorial compilations on <strong>Abhyaas</strong> are the proprietary intellectual property of the platform. Unauthorized copying, commercial distribution, or scraping is strictly prohibited under Indian Copyright laws.
            </p>
          </section>

          {/* Section 6 */}
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-3">
              6. Grievance & Support
            </h2>
            <p>
              For any queries regarding evaluation, registration errors, or dispute redressal, candidates may contact the examination cell at <strong>support@abhyaasnow.in</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}