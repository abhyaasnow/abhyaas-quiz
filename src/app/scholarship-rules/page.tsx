import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Award, ShieldCheck, CheckCircle2, FileText, AlertCircle, TrendingUp, Users } from 'lucide-react';

export default function ScholarshipRulesPage() {
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
            Academic Merit Framework
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 pt-10">
        {/* Header */}
        <div className="border-b border-slate-800 pb-8 mb-8">
          <div className="inline-flex items-center gap-2 text-indigo-400 mb-3 text-sm font-semibold tracking-wide uppercase">
            <Award className="w-4 h-4" />
            National Talent Search & Fellowship Guidelines
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Merit Assessment & Scholarship Policy
          </h1>
          <p className="mt-3 text-slate-400 text-sm leading-relaxed">
            Effective Date: August 2026. This charter establishes the rules of merit calculation, transparent tie-breaking algorithms, verification protocols, and educational grant disbursements for all Abhyaas Olympiads.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 text-slate-300 text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-indigo-400" />
              1. Institutional Nature of Grants
            </h2>
            <p className="mb-3">
              All financial and institutional rewards announced under the <strong>Abhyaas Olympiad Series</strong> are designated solely as <strong>Academic Merit Scholarships, Research Fellowships, and Educational Book Grants</strong>.
            </p>
            <p>
              These grants exist to encourage competitive excellence, sponsor exam preparation resources, and support aspirants hailing from all socioeconomic backgrounds across India.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              2. Algorithmic Tie-Breaking Mechanism
            </h2>
            <p className="mb-3">
              In high-density competitive tests, multiple aspirants may secure identical raw scores. To maintain absolute fairness and eliminate any subjective bias, ranks are computed in strict chronological order of the following automated criteria:
            </p>
            <div className="space-y-3 mt-4">
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <div>
                  <h3 className="font-semibold text-white text-sm">Negative Marking Ratio (Accuracy Index)</h3>
                  <p className="text-xs text-slate-400 mt-1">The candidate with the fewer number of incorrect attempts will be placed at a higher rank.</p>
                </div>
              </div>
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <div>
                  <h3 className="font-semibold text-white text-sm">Total Test Time Consumed</h3>
                  <p className="text-xs text-slate-400 mt-1">If accuracy is identical, the candidate who completed the test in lesser total time will receive preference.</p>
                </div>
              </div>
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <div>
                  <h3 className="font-semibold text-white text-sm">Core Section Performance</h3>
                  <p className="text-xs text-slate-400 mt-1">Scores in the predefined high-difficulty core subject module (e.g., General Studies or Quantitative Aptitude) will be compared.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-indigo-400" />
              3. Verification & Identity Audit (KYC)
            </h2>
            <p className="mb-3">
              Before disbursing high-tier scholarships (Quarterly, Mega Olympiad, or Fellowship Tiers), our integrity cell conducts standard verification:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li><strong>Valid Identity Proof:</strong> Aadhaar Card, Voter ID, or College/Institutional ID matching the candidate&apos;s registered profile name.</li>
              <li><strong>Direct Bank Account / UPI:</strong> Bank account or UPI VPA registered under the candidate&apos;s or legal guardian&apos;s verified name.</li>
              <li><strong>Anti-Cheat Log Review:</strong> Audit of test-session logs to confirm zero unauthorized tab switches, devtools inspection, or automated solver usage.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              4. Tax Compliance & Statutory Deductions
            </h2>
            <p className="mb-3">
              Abhyaas strictly complies with prevailing Indian financial regulations and Income Tax provisions:
            </p>
            <p className="mb-2 text-slate-400 text-xs">
              Where aggregate annual merit grants exceed the statutory thresholds specified under Indian taxation laws, Tax Deducted at Source (TDS) will be deposited with the government against the candidate&apos;s PAN, and an official Form 16A TDS Certificate will be issued.
            </p>
          </section>

          {/* Section 5 */}
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-3">
              5. Audit Period & Disbursement Schedule
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 mt-3">
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                <h3 className="font-semibold text-white text-sm mb-1">Weekly Speed Sprints</h3>
                <p className="text-xs text-slate-400">Verified and credited directly via UPI within <strong>24 to 48 hours</strong> of test closure.</p>
              </div>
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                <h3 className="font-semibold text-white text-sm mb-1">Monthly / Mega Olympiads</h3>
                <p className="text-xs text-slate-400">Provisional merit list published in 24 hours; audit review completed and funds disbursed within <strong>3 to 5 working days</strong>.</p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              6. Disqualification & Forfeiture
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Any attempt to exploit platform vulnerabilities, use generative AI tools during timed tests, or register multiple dummy profiles from identical IP subnetworks will lead to immediate cancellation of rank, forfeiture of scholarship entitlement, and blacklisting of the aspirant from future Abhyaas assessments.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}