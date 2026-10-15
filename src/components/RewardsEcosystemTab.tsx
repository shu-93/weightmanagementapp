import React, { useState } from 'react';
import { 
  Award, 
  Sparkles, 
  Gift, 
  Watch, 
  Scale, 
  Share2, 
  Copy, 
  CheckCircle2, 
  Tag, 
  CreditCard, 
  Building2, 
  Check, 
  ChevronRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RewardItem, DeviceSyncStatus, SubscriptionTier } from '../types';

interface Props {
  rewards: RewardItem[];
  deviceStatus: DeviceSyncStatus;
  currentTier: SubscriptionTier;
  onSelectTier: (tier: SubscriptionTier) => void;
  onClaimReward: (rewardId: string) => void;
  onSimulateDeviceSync: (device: 'watch' | 'scale' | 'health365') => void;
}

export const RewardsEcosystemTab: React.FC<Props> = ({
  rewards,
  deviceStatus,
  currentTier,
  onSelectTier,
  onClaimReward,
  onSimulateDeviceSync,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [referralCopied, setReferralCopied] = useState(false);
  const [clinicCode, setClinicCode] = useState('');
  const [clinicNotice, setClinicNotice] = useState<string | null>(null);
  const [pointsBalance, setPointsBalance] = useState(deviceStatus.activeSgHealth365.healthpointsBalance);
  const [claimedVoucher, setClaimedVoucher] = useState<RewardItem | null>(null);

  const categories = [
    { id: 'all', label: 'All Rewards' },
    { id: 'f_and_b', label: 'Healthy F&B' },
    { id: 'gym', label: 'Gyms & Hyrox' },
    { id: 'equipment', label: 'Bicycles & Gear' },
    { id: 'government', label: 'ActiveSG' },
  ];

  const filteredRewards = rewards.filter(
    (r) => activeCategory === 'all' || r.category === activeCategory
  );

  const handleRedeem = (item: RewardItem) => {
    if (pointsBalance < item.pointsCost) {
      alert(`You need ${item.pointsCost} Healthpoints to redeem this. Current balance: ${pointsBalance} pts.`);
      return;
    }

    setPointsBalance((prev) => prev - item.pointsCost);
    onClaimReward(item.id);
    setClaimedVoucher(item);

    confetti({
      particleCount: 60,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  const handleCopyReferral = () => {
    navigator.clipboard?.writeText('https://vibeweight.app/ref/SHUQIN10');
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2500);
  };

  const handleApplyClinicCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicCode.trim()) return;

    if (clinicCode.toUpperCase().includes('CLINIC') || clinicCode.toUpperCase().includes('HEALTH') || clinicCode.toUpperCase().includes('CARE')) {
      onSelectTier('basic');
      setClinicNotice('SingHealth / Hospital Diabetes Care Voucher Applied: 3 Months Basic Tier Sponsored!');
    } else {
      setClinicNotice('Referral code verified: +300 bonus Healthpoints added to wallet!');
      setPointsBalance((p) => p + 300);
    }
    setClinicCode('');
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Health365 & ActiveSG Points Balance Hero */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-300" />
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-100">
              Health365 & ActiveSG Wallet
            </span>
          </div>
          <span className="text-[10px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full font-medium">
            National Steps Challenge Linked
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-3xl font-extrabold font-mono tabular-nums tracking-tight">
              {pointsBalance.toLocaleString()}
            </div>
            <p className="text-xs text-emerald-100 mt-0.5">
              Available Healthpoints · Earn +25 pts per healthy meal logged
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-emerald-100 block">ActiveSG Credits</span>
            <span className="text-lg font-bold font-mono">
              ${deviceStatus.activeSgHealth365.activeSgCredits.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[11px] text-emerald-100">
          <span>Streak multiplier: 1.5x active</span>
          <span className="font-semibold text-white">Next voucher at 1,500 pts</span>
        </div>
      </div>

      {/* Cross-Compatible Device Hub */}
      <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white tracking-wider uppercase">
            Cross-Compatible Trackers & Devices
          </h3>
          <span className="text-[10px] text-emerald-400 font-medium">All Connected</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <Watch className="w-4 h-4 text-emerald-400" /> Apple Watch
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-400">
              {deviceStatus.appleWatch.todaySteps.toLocaleString()} steps · {deviceStatus.appleWatch.activeCalories} kcal
            </p>
            <button
              onClick={() => onSimulateDeviceSync('watch')}
              className="w-full py-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors"
            >
              Sync Live Steps
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <Scale className="w-4 h-4 text-indigo-400" /> InBody Scale
              </span>
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
            </div>
            <p className="text-[11px] text-slate-400">
              {deviceStatus.inBodyScale.weightKg} kg · {deviceStatus.inBodyScale.bodyFatPercent}% BF
            </p>
            <button
              onClick={() => onSimulateDeviceSync('scale')}
              className="w-full py-1 text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-colors"
            >
              Sync InBody Scan
            </button>
          </div>
        </div>
      </div>

      {/* Rewards Store */}
      <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-3.5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold text-white tracking-wider uppercase">
              Partner Rewards & Vouchers
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Redeem with points</span>
        </div>

        {/* Categories */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-xl whitespace-nowrap shrink-0 transition-colors border ${
                activeCategory === c.id
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                  : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Rewards List */}
        <div className="space-y-2.5">
          {filteredRewards.map((reward) => (
            <div
              key={reward.id}
              className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white truncate">{reward.name}</h4>
                </div>
                <p className="text-[10px] text-emerald-400 font-medium">{reward.partner}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{reward.valueDescription}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-amber-400 font-mono block">
                  {reward.pointsCost} pts
                </span>
                <button
                  onClick={() => handleRedeem(reward)}
                  className="mt-1 px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] rounded-lg transition-colors shadow-sm"
                >
                  Redeem
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Refer a Friend ($10 Credit) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-pink-500/15 border border-amber-500/30 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Share2 className="w-4 h-4" />
            Refer a Friend Program
          </div>
          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
            $10 for Both
          </span>
        </div>
        <p className="text-xs text-slate-300">
          Share your referral code with friends, gym buddies, or sports groups. When they complete their first AI scan, you both receive $10 voucher credits!
        </p>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono flex items-center justify-between">
            <span>VIBE-SHUQIN-10</span>
            <span className="text-[10px] text-slate-500">Your Link</span>
          </div>
          <button
            onClick={handleCopyReferral}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
          >
            {referralCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {referralCopied ? 'Copied' : 'Share'}
          </button>
        </div>
      </div>

      {/* Clinic & Corporate Insurance Referral Code Onboarding */}
      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2.5">
        <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
          <Building2 className="w-4 h-4" />
          Clinic / Hospital / Corporate Referral
        </div>
        <p className="text-xs text-slate-300">
          Referred by SingHealth, Polyclinic Diabetes Care, or Corporate Insurance (AIA/Prudential)? Enter code to activate subsidized access.
        </p>

        <form onSubmit={handleApplyClinicCode} className="flex gap-2">
          <input
            type="text"
            value={clinicCode}
            onChange={(e) => setClinicCode(e.target.value)}
            placeholder="e.g. CLINIC-CARE-2026 or PRU-WELLNESS"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-colors shrink-0"
          >
            Apply Code
          </button>
        </form>

        {clinicNotice && (
          <p className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl">
            {clinicNotice}
          </p>
        )}
      </div>

      {/* Subscription Tiers & BMC Monetization Matrix */}
      <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-3.5 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <CreditCard className="w-4 h-4" />
            Membership Plans (BMC Model)
          </div>
          <h3 className="text-base font-bold text-white mt-0.5">
            Choose Your Transformation Tier
          </h3>
          <p className="text-[11px] text-slate-400">
            Projected 2M freemium + 1M paying members model.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Freemium */}
          <div
            onClick={() => onSelectTier('freemium')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              currentTier === 'freemium'
                ? 'bg-slate-900 border-emerald-500 ring-1 ring-emerald-500'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-white">Freemium</span>
              {currentTier === 'freemium' && (
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                  Active
                </span>
              )}
            </div>
            <div className="text-lg font-bold text-white font-mono">$0</div>
            <ul className="mt-2 space-y-1 text-[10px] text-slate-400">
              <li>✓ Basic calorie logging</li>
              <li>✓ ActiveSG steps sync</li>
              <li>✓ Community challenges</li>
            </ul>
          </div>

          {/* Basic $10/mth */}
          <div
            onClick={() => onSelectTier('basic')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
              currentTier === 'basic'
                ? 'bg-slate-900 border-emerald-500 ring-1 ring-emerald-500'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="absolute -top-2 right-2 text-[8px] font-bold text-emerald-950 bg-emerald-400 px-1.5 py-0.5 rounded-full uppercase">
              Popular
            </span>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-white">Basic Tier</span>
              {currentTier === 'basic' && (
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                  Active
                </span>
              )}
            </div>
            <div className="text-lg font-bold text-emerald-400 font-mono">
              $10 <span className="text-[10px] text-slate-400 font-normal">/month</span>
            </div>
            <ul className="mt-2 space-y-1 text-[10px] text-slate-300">
              <li>✓ Unlimited Gemini AI Food Vision</li>
              <li>✓ Automated program roadmaps</li>
              <li>✓ 1.5x Health365 multiplier</li>
              <li>✓ InBody body fat analytics</li>
            </ul>
          </div>

          {/* Premium $100/mth */}
          <div
            onClick={() => onSelectTier('premium')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
              currentTier === 'premium'
                ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-indigo-300">Premium Pro</span>
              {currentTier === 'premium' && (
                <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/20 px-1.5 py-0.5 rounded">
                  Active
                </span>
              )}
            </div>
            <div className="text-lg font-bold text-indigo-400 font-mono">
              $100 <span className="text-[10px] text-slate-400 font-normal">/month</span>
            </div>
            <ul className="mt-2 space-y-1 text-[10px] text-slate-300">
              <li>✓ Everything in Basic</li>
              <li>✓ Dedicated 1-on-1 Sports Dietitian</li>
              <li>✓ Weekly Personal Trainer Video Sessions</li>
              <li>✓ Monthly InBody Clinic Scan</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Claimed Voucher Modal Popup */}
      {claimedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-white">Voucher Redeemed!</h4>
            <p className="text-xs text-slate-300">
              {claimedVoucher.name} from <strong>{claimedVoucher.partner}</strong>
            </p>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono font-bold text-emerald-400 text-sm tracking-wider">
              {claimedVoucher.code}
            </div>
            <p className="text-[10px] text-slate-400">
              Flash this QR or promo code at checkout or ActiveSG counter.
            </p>
            <button
              onClick={() => setClaimedVoucher(null)}
              className="w-full py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
