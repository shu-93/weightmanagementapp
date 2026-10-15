import React, { useState, useEffect } from 'react';
import { 
  X, 
  Dumbbell, 
  Search, 
  Filter, 
  Activity, 
  Flame, 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  Clock, 
  ChevronRight,
  RefreshCw,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api, ExerciseItem, WorkoutLog } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onWorkoutLogged: (workout: WorkoutLog) => void;
}

export const ExerciseCatalogModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onWorkoutLogged,
}) => {
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEquipment, setSelectedEquipment] = useState('All');
  const [activeExercise, setActiveExercise] = useState<ExerciseItem | null>(null);

  // Workout Logging Form State
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(12);
  const [weightKg, setWeightKg] = useState(16);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loggedNotice, setLoggedNotice] = useState(false);

  const categories = ['All', 'Abs', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms'];
  const equipmentOptions = ['All', 'Kettlebell', 'Barbell', 'Dumbbell', 'Bodyweight', 'Bench'];

  const loadExercises = async () => {
    setLoading(true);
    try {
      const res = await api.getExercises({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        equipment: selectedEquipment !== 'All' ? selectedEquipment : undefined,
        search: search.trim() ? search : undefined,
      });
      setExercises(res.data);
    } catch (err) {
      console.error('Failed to load exercises:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadExercises();
    }
  }, [isOpen, selectedCategory, selectedEquipment, search]);

  if (!isOpen) return null;

  const handleLogWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExercise) return;

    setIsSubmitting(true);
    try {
      const caloriesBurned = Math.round(durationMinutes * activeExercise.caloriesBurnPerMin);
      const activeSgPoints = Math.round(durationMinutes * 1.5) + 15;

      const newWorkout = await api.logWorkout({
        exerciseId: activeExercise.id,
        exerciseName: activeExercise.name,
        category: activeExercise.category,
        durationMinutes,
        sets,
        reps,
        weightKg: weightKg || undefined,
        caloriesBurned,
        activeSgPoints,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      onWorkoutLogged(newWorkout);
      setLoggedNotice(true);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#10b981', '#f59e0b'],
      });

      setTimeout(() => {
        setLoggedNotice(false);
        setActiveExercise(null);
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                Exercise Database & Workout Logger
              </h3>
              <p className="text-[11px] text-slate-400">
                Synced from Wger Open Fitness API ({exercises.length} available)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Segmented Filter Bar */}
        <div className="p-4 border-b border-slate-800 space-y-2.5 bg-slate-900/60">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercise, kettlebell, quads, bench press..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-colors border ${
                  selectedCategory === cat
                    ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-sm'
                    : 'bg-slate-800 text-slate-400 border-slate-700/80 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content list or Active Exercise Logger */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {activeExercise ? (
            /* Log Exercise Sheet */
            <div className="p-4 rounded-2xl bg-slate-800/90 border border-sky-500/30 space-y-4 animate-in fade-in">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                    {activeExercise.category} · {activeExercise.activeSgZone}
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5">
                    {activeExercise.name}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {activeExercise.description}
                  </p>
                </div>
                <button
                  onClick={() => setActiveExercise(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Muscles and equipment tags */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-300">
                <span className="text-[10px] text-slate-400">Muscles:</span>
                {activeExercise.muscles.map((m) => (
                  <span key={m} className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded-lg text-[10px] text-emerald-300 font-medium">
                    {m}
                  </span>
                ))}
                {activeExercise.equipment.map((eq) => (
                  <span key={eq} className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded-lg text-[10px] text-amber-300 font-medium">
                    {eq}
                  </span>
                ))}
              </div>

              {loggedNotice ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center space-y-1">
                  <CheckCircle2 className="w-7 h-7 mx-auto text-emerald-400" />
                  <p className="text-sm font-bold text-white">Workout Saved to Database!</p>
                  <p className="text-xs text-emerald-300">
                    Active calories burned added to your daily calorie deficit.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLogWorkout} className="space-y-3 pt-2 border-t border-slate-700/70">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Duration (Minutes)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="120"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 20)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Weight / Resistance (kg)
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={weightKg}
                        onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Sets
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={sets}
                        onChange={(e) => setSets(parseInt(e.target.value) || 3)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Reps per set
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={reps}
                        onChange={(e) => setReps(parseInt(e.target.value) || 12)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Calculated metrics */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Est. Calorie Burn</span>
                      <span className="text-sm font-bold text-emerald-400 font-mono">
                        {Math.round(durationMinutes * activeExercise.caloriesBurnPerMin)} kcal
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">ActiveSG Points</span>
                      <span className="text-sm font-bold text-amber-400 font-mono">
                        +{Math.round(durationMinutes * 1.5) + 15} pts
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveExercise(null)}
                      className="flex-1 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700 transition-colors"
                    >
                      Back to Catalog
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Save Workout
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Exercise List */
            <>
              {exercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => setActiveExercise(ex)}
                  className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer flex items-center justify-between gap-3 group shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors truncate">
                        {ex.name}
                      </h4>
                      <span className="text-[9px] font-semibold text-slate-400 bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded shrink-0">
                        {ex.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                      <span>Muscles: {ex.muscles.join(', ') || 'Core'}</span>
                      <span>·</span>
                      <span className="text-emerald-400 font-medium">~{ex.caloriesBurnPerMin} kcal/min</span>
                    </div>

                    <p className="text-[11px] text-slate-300/80 mt-1 line-clamp-1">
                      {ex.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      className="px-2.5 py-1 bg-sky-500/20 text-sky-300 group-hover:bg-sky-500 group-hover:text-slate-950 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Log
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))}

              {exercises.length === 0 && !loading && (
                <div className="text-center py-10 bg-slate-800/30 rounded-2xl border border-slate-800 p-6">
                  <p className="text-xs font-semibold text-white">No exercises found</p>
                  <p className="text-[10px] text-slate-400 mt-1">Try relaxing search or filter parameters</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
