import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Star, 
  Video, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Filter,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Trainer } from '../types';

interface Props {
  trainers: Trainer[];
}

export const TrainersTab: React.FC<Props> = ({ trainers }) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [priceTier, setPriceTier] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingTrainer, setBookingTrainer] = useState<Trainer | null>(null);
  const [bookingDate, setBookingDate] = useState('2026-10-18');
  const [bookingTime, setBookingTime] = useState('18:00');
  const [sessionType, setSessionType] = useState<'online' | 'in_person'>('online');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const specialties = ['All', 'Weight Loss', 'Pre-Diabetes Care', 'Hyrox Prep', 'Sports Nutrition', 'Postpartum Weight Loss'];

  const filteredTrainers = trainers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.specialty.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSpecialty =
      selectedSpecialty === 'All' || t.specialty.includes(selectedSpecialty);

    const matchesPrice =
      priceTier === 'all' ||
      (priceTier === 'budget' && t.hourlyRate <= 50) ||
      (priceTier === 'mid' && t.hourlyRate > 50 && t.hourlyRate <= 75) ||
      (priceTier === 'premium' && t.hourlyRate > 75);

    return matchesSearch && matchesSpecialty && matchesPrice;
  });

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingConfirmed(true);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
    setTimeout(() => {
      setBookingConfirmed(false);
      setBookingTrainer(null);
    }, 2500);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-pink-500/15 border border-indigo-500/30">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
          <Users className="w-4 h-4" />
          Certified Trainers & Motivators
        </div>
        <h2 className="text-base font-bold text-white mt-1">
          Find Your Ideal Weight Loss Coach
        </h2>
        <p className="text-xs text-slate-300 mt-0.5">
          Filtered by price, clinical specialties, ActiveSG partnerships, and live video availability.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, Hyrox, pre-diabetes, nutrition..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Price Tier Segmented Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-xl border border-slate-700/80">
          <span className="text-[10px] text-slate-400 px-2 font-medium shrink-0">Price:</span>
          {[
            { id: 'all', label: 'All Rates' },
            { id: 'budget', label: 'Under $50/h' },
            { id: 'mid', label: '$51–$75/h' },
            { id: 'premium', label: '$76+/h' },
          ].map((tier) => (
            <button
              key={tier.id}
              onClick={() => setPriceTier(tier.id)}
              className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg transition-colors whitespace-nowrap ${
                priceTier === tier.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>

        {/* Specialty Scrollable Buttons */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap shrink-0 transition-colors border ${
                selectedSpecialty === spec
                  ? 'bg-indigo-600 text-white border-indigo-500 font-semibold shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/80 hover:text-white'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Trainer Cards List */}
      <div className="space-y-3.5">
        {filteredTrainers.map((trainer) => (
          <div
            key={trainer.id}
            className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/90 hover:border-slate-600 transition-all shadow-md space-y-3"
          >
            <div className="flex items-start gap-3.5">
              <img
                src={trainer.imageUrl}
                alt={trainer.name}
                className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5 truncate">
                      {trainer.name}
                      {trainer.activeSgPartner && (
                        <span className="text-[9px] font-bold text-emerald-400 border border-emerald-500/40 px-1 py-0.5 rounded shrink-0">
                          ActiveSG Partner
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate">{trainer.title}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-base font-bold text-white font-mono tabular-nums">
                      ${trainer.hourlyRate}
                    </span>
                    <span className="text-[10px] text-slate-400 block">/hour</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {trainer.rating}
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">({trainer.reviewsCount} reviews)</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-emerald-400 font-medium">98% Goal Success</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
              {trainer.bio}
            </p>

            {/* Specialties inline text */}
            <div className="flex flex-wrap gap-1.5">
              {trainer.specialty.map((s) => (
                <span
                  key={s}
                  className="text-[10px] font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg"
                >
                  {s}
                </span>
              ))}
            </div>

            {/* Action Bar */}
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                {trainer.onlineAvailable && (
                  <span className="flex items-center gap-1 text-sky-400">
                    <Video className="w-3 h-3" /> Online Video
                  </span>
                )}
                <span>·</span>
                <span className="flex items-center gap-1 truncate max-w-[140px]">
                  <MapPin className="w-3 h-3" /> {trainer.inPersonLocations[0]}
                </span>
              </div>

              <button
                onClick={() => setBookingTrainer(trainer)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-md transition-all shrink-0"
              >
                Book Session
              </button>
            </div>
          </div>
        ))}

        {filteredTrainers.length === 0 && (
          <div className="text-center py-10 bg-slate-800/40 rounded-2xl border border-slate-800 p-6">
            <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-white">No trainers match your filter</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Try resetting price or specialty filters</p>
            <button
              onClick={() => {
                setSelectedSpecialty('All');
                setPriceTier('all');
                setSearchQuery('');
              }}
              className="mt-3 px-3 py-1.5 bg-slate-800 text-xs font-medium text-slate-300 hover:text-white rounded-lg border border-slate-700"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-white">Book Coaching Session</h3>
              </div>
              <button
                onClick={() => setBookingTrainer(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {bookingConfirmed ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-white">Session Confirmed!</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your appointment with <strong>{bookingTrainer.name}</strong> on {bookingDate} at {bookingTime} has been added to your in-app schedule and device calendar.
                </p>
                <p className="text-[10px] text-emerald-400">
                  Referral code credited to ActiveSG Gym partner.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="p-5 space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <img
                    src={bookingTrainer.imageUrl}
                    alt={bookingTrainer.name}
                    className="w-12 h-12 rounded-lg object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">{bookingTrainer.name}</p>
                    <p className="text-[11px] text-slate-400">{bookingTrainer.title}</p>
                    <p className="text-xs font-semibold text-emerald-400 font-mono mt-0.5">
                      ${bookingTrainer.hourlyRate} / hour session
                    </p>
                  </div>
                </div>

                {/* Session Mode */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Session Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSessionType('online')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        sessionType === 'online'
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" /> Online 1-on-1
                    </button>
                    <button
                      type="button"
                      onClick={() => setSessionType('in_person')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        sessionType === 'in_person'
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" /> ActiveSG Gym
                    </button>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Time Slot
                    </label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    >
                      <option value="08:00">08:00 AM</option>
                      <option value="12:30">12:30 PM (Lunch)</option>
                      <option value="18:00">06:00 PM</option>
                      <option value="19:30">07:30 PM</option>
                    </select>
                  </div>
                </div>

                {/* Calendar Sync Check */}
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    Auto-sync with Apple / Google Calendar
                  </span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="accent-indigo-600 rounded"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingTrainer(null)}
                    className="flex-1 py-2.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-md"
                  >
                    Confirm & Reserve
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
