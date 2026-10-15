import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Target, 
  Sparkles, 
  Download, 
  CheckCircle2, 
  Circle, 
  Clock, 
  MapPin, 
  TrendingDown, 
  ChevronRight,
  ShieldAlert,
  Dumbbell
} from 'lucide-react';
import { EndToEndProgram, ScheduledActivity } from '../types';

interface Props {
  programs: EndToEndProgram[];
  activeProgram: EndToEndProgram;
  onSelectProgram: (program: EndToEndProgram) => void;
  onToggleActivity: (actId: string) => void;
  onBookTrainerClick: () => void;
}

export const ProgramsTab: React.FC<Props> = ({
  programs,
  activeProgram,
  onSelectProgram,
  onToggleActivity,
  onBookTrainerClick,
}) => {
  const [showAiGenerator, setShowAiGenerator] = useState(false);
  const [goalText, setGoalText] = useState('Lose 5kg before my sister wedding');
  const [targetWeeks, setTargetWeeks] = useState(8);
  const [targetWeight, setTargetWeight] = useState(69);
  const [dietStyle, setDietStyle] = useState('Balanced low-carb, high-protein');
  const [condition, setCondition] = useState('General fitness');
  const [isGenerating, setIsGenerating] = useState(false);
  const [calendarExported, setCalendarExported] = useState(false);

  // Generate .ics standard file for native mobile calendar integration
  const handleExportIcsCalendar = () => {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//VibeWeight//Weight Management Roadmap//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    const today = new Date();
    activeProgram.weeklySchedule.forEach((act, idx) => {
      const eventDate = new Date(today);
      eventDate.setDate(today.getDate() + idx + 1);
      const dateStr = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:vibeweight-${act.id}@vibeweight.app`,
        `DTSTAMP:${dateStr}`,
        `DTSTART:${dateStr}`,
        `SUMMARY:VibeWeight: ${act.title}`,
        `DESCRIPTION:${activeProgram.title} - ${act.category.toUpperCase()} Session\\nLocation: ${act.location}`,
        `LOCATION:${act.location}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'VibeWeight-Program-Schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCalendarExported(true);
    setTimeout(() => setCalendarExported(false), 3000);
  };

  const handleGenerateCustomProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await fetch('/api/generate-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: goalText,
          targetWeeks,
          currentWeightKg: activeProgram.currentWeightKg,
          targetWeightKg: targetWeight,
          dietPreference: dietStyle,
          medicalNotes: condition,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate');
      const data = await res.json();

      const newProg: EndToEndProgram = {
        id: `prog-${Date.now()}`,
        title: data.programTitle || `${goalText} Protocol`,
        category: 'weight_loss',
        durationWeeks: targetWeeks,
        currentWeightKg: activeProgram.currentWeightKg,
        targetWeightKg: targetWeight,
        dailyCalorieTarget: data.dailyCalorieTarget || 1750,
        summary: data.summary || 'Custom generated fitness plan',
        dietitianAdvice: data.dietitianAdvice || 'Ensure adequate protein and hydration.',
        milestones: data.milestones || activeProgram.milestones,
        weeklySchedule: [
          { id: `act-${Date.now()}-1`, title: 'ActiveSG Resistance Circuit', time: '18:30 - 19:30', day: 'Tuesday', category: 'gym', location: 'ActiveSG Gym', completed: false, activeSgEligible: true },
          { id: `act-${Date.now()}-2`, title: 'Dietitian Calorie Deficit Review', time: '19:00 - 19:30', day: 'Thursday', category: 'trainer', location: 'Online Video', completed: false },
          { id: `act-${Date.now()}-3`, title: '45m Zone-2 Low-Impact Cardio', time: '08:00 - 08:45', day: 'Saturday', category: 'cardio', location: 'ActiveSG Park Connector', completed: false, activeSgEligible: true },
        ],
      };

      onSelectProgram(newProg);
      setShowAiGenerator(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
            End-to-End Program
          </span>
          <h2 className="text-lg font-bold text-white">Your Transformation Roadmap</h2>
        </div>

        <button
          onClick={() => setShowAiGenerator(!showAiGenerator)}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          {showAiGenerator ? 'Close AI Builder' : 'AI Plan Builder'}
        </button>
      </div>

      {/* AI Plan Generator Drawer */}
      {showAiGenerator && (
        <form
          onSubmit={handleGenerateCustomProgram}
          className="p-4 rounded-2xl bg-slate-800/95 border border-emerald-500/30 space-y-3.5 shadow-xl animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Sparkles className="w-4 h-4" />
            AI Custom Roadmap Architect
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Primary Goal Description
            </label>
            <input
              type="text"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              placeholder="e.g. Lose 5kg sustainably, reduce visceral fat"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Duration (Weeks)
              </label>
              <input
                type="number"
                min="4"
                max="24"
                value={targetWeeks}
                onChange={(e) => setTargetWeeks(parseInt(e.target.value) || 8)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Target Weight (kg)
              </label>
              <input
                type="number"
                step="0.5"
                value={targetWeight}
                onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 69)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Dietary Preference / Restrictions
            </label>
            <input
              type="text"
              value={dietStyle}
              onChange={(e) => setDietStyle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Clinical / Medical Considerations (Optional)
            </label>
            <input
              type="text"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              placeholder="e.g. Pre-diabetes, knee joint sensitivity, none"
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                Designing Custom Roadmap...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Generate Tailored Roadmap
              </>
            )}
          </button>
        </form>
      )}

      {/* Program Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {programs.map((prog) => (
          <button
            key={prog.id}
            onClick={() => onSelectProgram(prog)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-all border ${
              activeProgram.id === prog.id
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            {prog.title.length > 28 ? prog.title.substring(0, 26) + '...' : prog.title}
          </button>
        ))}
      </div>

      {/* Active Program Card */}
      <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-4 shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white">{activeProgram.title}</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {activeProgram.summary}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center shrink-0">
            <span className="text-[10px] text-slate-400 block">Target</span>
            <span className="text-sm font-bold text-emerald-400 tabular-nums font-mono">
              {activeProgram.targetWeightKg} kg
            </span>
          </div>
        </div>

        {/* Targets Strip */}
        <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-700/80 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">Duration</span>
            <span className="font-bold text-white font-mono">{activeProgram.durationWeeks} Weeks</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Calorie Deficit</span>
            <span className="font-bold text-amber-400 font-mono">{activeProgram.dailyCalorieTarget} kcal/day</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Current Weight</span>
            <span className="font-bold text-slate-300 font-mono">{activeProgram.currentWeightKg} kg</span>
          </div>
        </div>

        {/* Milestones Timeline */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Milestones & Body Composition Targets
          </p>
          <div className="space-y-2">
            {activeProgram.milestones.map((m) => (
              <div
                key={m.week}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                  m.completed
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-[10px] text-white">
                    W{m.week}
                  </span>
                  <div>
                    <p className="font-medium text-white">{m.focus}</p>
                    <p className="text-[10px] text-slate-400">Target: {m.targetKg} kg</p>
                  </div>
                </div>
                {m.completed && (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Met
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dietitian Clinical Advice */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
          <p className="font-semibold text-emerald-400 text-[11px] mb-1">
            Dietitian & Coach Guidance:
          </p>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {activeProgram.dietitianAdvice}
          </p>
        </div>
      </div>

      {/* Calendar Integration & Export */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/15 to-indigo-500/10 border border-sky-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Calendar Synchronization</h4>
            <p className="text-[11px] text-slate-300">
              Export all workouts & dietitian reviews directly to Apple / Google Calendar.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportIcsCalendar}
          className="px-3 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          {calendarExported ? 'Exported!' : 'Export .ICS'}
        </button>
      </div>

      {/* Weekly Schedule & Booking */}
      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white tracking-wider uppercase">
            Scheduled Program Activities ({activeProgram.weeklySchedule.length})
          </h3>
          <button
            onClick={onBookTrainerClick}
            className="text-[11px] text-emerald-400 font-medium hover:underline flex items-center gap-1"
          >
            <Dumbbell className="w-3 h-3" /> Book Trainer
          </button>
        </div>

        <div className="space-y-2.5">
          {activeProgram.weeklySchedule.map((act) => (
            <div
              key={act.id}
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onToggleActivity(act.id)}
                  className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  {act.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>
                <div>
                  <p className={`text-xs font-semibold ${act.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                    {act.title}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {act.day} · {act.time}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {act.location}
                    </span>
                  </div>
                </div>
              </div>

              {act.category === 'trainer' ? (
                <button
                  onClick={onBookTrainerClick}
                  className="px-2.5 py-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-semibold rounded-lg shrink-0 transition-colors"
                >
                  Confirm Slot
                </button>
              ) : act.activeSgEligible ? (
                <span className="text-[10px] text-emerald-400 font-semibold px-2 py-1 bg-emerald-500/10 rounded-md shrink-0">
                  ActiveSG
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
