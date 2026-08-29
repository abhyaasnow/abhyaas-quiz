import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Award, ShieldCheck, CheckCircle2, FileText, AlertCircle, TrendingUp, Users } from 'lucide-react';

export default function ScholarshipRulesPage() {
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
          <span className="text-[11px] font-bold px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full uppercase tracking-wide">
            Academic Merit Framework
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        {/* Header */}
        <div className="border-b border-slate-200 pb-8 mb-8">
          <div className="inline-flex items-center gap-2 text-amber-600 mb-2.5 text-xs font-bold tracking-wider uppercase">
            <Award className="w-4 h-4" />
            National Talent Search &amp; Fellowship Guidelines
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Merit Assessment &amp; Scholarship Policy
          </h1>
          <p className="mt-2.5 text-slate-600 text-xs sm:text-sm leading-relaxed">
            Effective Date: August 2026. This charter establishes the rules of merit calculation, transparent tie-breaking algorithms, verification protocols, and educational grant disbursements for all Abhyaas Olympiads.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5 mb-3">
              <FileText className="w-4 h-4 text-blue-600" />
              1. Institutional Nature of Grants
            </h2>
            <p className="mb-3 text-slate-600">
              All financial and institutional rewards announced under the <strong className="text-slate-900">Abhyaas Olympiad Series</strong> are designated solely as <strong className="text-slate-900">Academic Merit Scholarships, Research Fellowships, and Educational Book Grants</strong>.
            </p>
            <p className="text-slate-600">
              These grants exist to encourage competitive excellence, sponsor exam preparation resources, and support aspirants hailing from all socioeconomic backgrounds across India.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5 mb-3">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              2. Algorithmic Tie-Breaking Mechanism
            </h2>
            <p className="mb-4 text-slate-600">
              In high-density competitive tests, multiple aspirants may secure identical raw scores. To maintain absolute fairness and eliminate any subjective bias, ranks are computed in strict chronological order of the following automated criteria:
            </p>
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <div>
                  <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">Negative Marking Ratio (Accuracy Index)</h3>
                  <p className="text-xs text-slate-600 mt-1">The candidate with the fewer number of incorrect attempts will be placed at a higher rank.</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <div>
                  <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">Total Test Time Consumed</h3>
                  <p className="text-xs text-slate-600 mt-1">If accuracy is identical, the candidate who completed the test in lesser total time will receive preference.</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <div>
                  <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">Core Section Performance</h3>
                  <p className="text-xs text-slate-600 mt-1">Scores in the predefined high-difficulty core subject module (e.g., General Studies or Quantitative Aptitude) will be compared.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5 mb-3">
              <Users className="w-4 h-4 text-blue-600" />
              3. Verification &amp; Identity Audit (KYC)
            </h2>
            <p className="mb-3 text-slate-600">
              Before disbursing high-tier scholarships (Quarterly, Mega Olympiad, or Fellowship Tiers), our integrity cell conducts standard verification:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-xs sm:text-sm">
              <li><strong className="text-slate-900">Valid Identity Proof:</strong> Aadhaar Card, Voter ID, or College/Institutional ID matching the candidate&apos;s registered profile name.</li>
              <li><strong className="text-slate-900">Direct Bank Account / UPI:</strong> Bank account or UPI VPA registered under the candidate&apos;s or legal guardian&apos;s verified name.</li>
              <li><strong className="text-slate-900">Anti-Cheat Log Review:</strong> Audit of test-session logs to confirm zero unauthorized tab switches, devtools inspection, or automated solver usage.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              4. Tax Compliance &amp; Statutory Deductions
            </h2>
            <p className="mb-3 text-slate-600">
              Abhyaas strictly complies with prevailing Indian financial regulations and Income Tax provisions:
            </p>
            <p className="text-slate-600 text-xs sm:text-sm">
              Where aggregate annual merit grants exceed the statutory thresholds specified under Indian taxation laws, Tax Deducted at Source (TDS) will be deposited with the government against the candidate&apos;s PAN, and an official Form 16A TDS Certificate will be issued.
            </p>
          </section>

          {/* Section 5 */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-3">
              5. Audit Period &amp; Disbursement Schedule
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h3 className="font-semibold text-slate-900 text-xs sm:text-sm mb-1">Weekly Speed Sprints</h3>
                <p className="text-xs text-slate-600">Verified and credited directly via UPI within <strong className="text-slate-900">24 to 48 hours</strong> of test closure.</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h3 className="font-semibold text-slate-900 text-xs sm:text-sm mb-1">Monthly / Mega Olympiads</h3>
                <p className="text-xs text-slate-600">Provisional merit list published in 24 hours; audit review completed and funds disbursed within <strong className="text-slate-900">3 to 5 working days</strong>.</p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-rose-600 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              6. Disqualification &amp; Forfeiture
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Any attempt to exploit platform vulnerabilities, use generative AI tools during timed tests, or register multiple dummy profiles from identical IP subnetworks will lead to immediate cancellation of rank, forfeiture of scholarship entitlement, and blacklisting of the aspirant from future Abhyaas assessments.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}