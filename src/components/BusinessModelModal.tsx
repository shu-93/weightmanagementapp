import React from 'react';
import { X, CheckCircle2, DollarSign, Users, Award, HeartPulse, Sparkles, Building2, Smartphone } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BusinessModelModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Business Model Canvas Implementation Blueprint
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Canvas Mapping */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <p className="font-medium text-emerald-200 mb-1">
              Live Implementation of your SMU Vibe Coding BMC:
            </p>
            <p className="text-xs text-emerald-300/90 leading-relaxed">
              Every single sticky note from your uploaded Weight Management Tracker artifact is mapped directly into functional workflows within this mobile application.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Key Value Propositions */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
                <Sparkles className="w-4 h-4" />
                Value Propositions
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>AI Calorie Tracker:</strong> Upload food photo, Gemini calculates calories & macros</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Trainer Marketplace:</strong> Find & book suitable trainers filtered by price ($30-$150/hr)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>End-to-End Program:</strong> Goal-based multi-week roadmap with automated booking</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Calendar Integration:</strong> Export routines to Google Calendar / iCal</span>
                </li>
              </ul>
            </div>

            {/* Key Partners */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs tracking-wider uppercase">
                <Building2 className="w-4 h-4" />
                Key Partners
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Government:</strong> ActiveSG & Health365 steps and healthpoints sync</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>F&B Businesses:</strong> Healthy meals vouchers (SaladStop!, Grain, FairPrice)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Trackers & Devices:</strong> Apple Watch & InBody smart scale sync</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Events & Gyms:</strong> Hyrox Singapore, ActiveSG Gyms, Anywheel bicycles</span>
                </li>
              </ul>
            </div>

            {/* Customer Relationships */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-pink-400 font-semibold text-xs tracking-wider uppercase">
                <HeartPulse className="w-4 h-4" />
                Customer Relationships
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Duolingo-Style Streak:</strong> Daily fire flame counter with motivation notifications</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Rewards Points System:</strong> Earn points for logging food & steps, redeem in-app</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Referral Engine:</strong> "Refer a Friend" $10 reward sharing link</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Calorie Reminders:</strong> On-demand prompts & post-meal walk triggers</span>
                </li>
              </ul>
            </div>

            {/* Customer Segments */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
                <Users className="w-4 h-4" />
                Customer Segments
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>18–70 Years Old:</strong> User-friendly interface with large readable type</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Health-conscious Individuals:</strong> Calorie budgeting & macro precision</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Medical & Overweight Needs:</strong> Low-GI pre-diabetes clinic track</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Sports Groups:</strong> Hyrox racers, cyclists & gym enthusiasts</span>
                </li>
              </ul>
            </div>

            {/* Revenue Streams */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase">
                <DollarSign className="w-4 h-4" />
                Revenue Streams & Targets
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Freemium Tier:</strong> Base calorie logging & community challenges</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Basic Tier ($10/mth):</strong> Full AI Vision scanner & automated programs</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Premium Tier ($100/mth):</strong> Dedicated dietitian & trainer 1-on-1 calls</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Vendor Commissions:</strong> Referral fee from partnered gyms & healthy eateries</span>
                </li>
                <li className="flex items-start gap-1.5 text-slate-400 pt-1">
                  <span><strong>Projections:</strong> 2M freemium, 1M paying, break-even in 1 yr, profitable in 3 yrs</span>
                </li>
              </ul>
            </div>

            {/* Channels & Cost Structure */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-violet-400 font-semibold text-xs tracking-wider uppercase">
                <Smartphone className="w-4 h-4" />
                Channels & Cost Structure
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Channels:</strong> Health365/ActiveSG, Clinic referrals, Corporate insurance</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Cost:</strong> $150k upfront dev, $45k/yr ops, $50k/yr misc</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Cross-Platform:</strong> Responsive mobile touch PWA + Watch/Scale sync</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Back to App Experience
          </button>
        </div>
      </div>
    </div>
  );
};
