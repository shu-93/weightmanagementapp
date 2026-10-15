import React from 'react';
import { 
  Flame, 
  Plus, 
  Camera, 
  Watch, 
  Scale, 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  Sparkles, 
  Award,
  BellRing,
  UtensilsCrossed,
  TrendingDown,
  Dumbbell
} from 'lucide-react';
import { FoodLogItem, DeviceSyncStatus, ScheduledActivity } from '../types';
import { WorkoutLog } from '../services/api';

interface Props {
  foodLogs: FoodLogItem[];
  workouts: WorkoutLog[];
  deviceStatus: DeviceSyncStatus;
  scheduledActivities: ScheduledActivity[];
  streakDays: number;
  onNavigateToAiScan: () => void;
  onOpenWeightModal: () => void;
  onOpenExerciseModal: () => void;
  onToggleActivity: (activityId: string) => void;
  onDeleteFood: (id: string) => void;
  onDeleteWorkout: (id: string) => void;
  onOpenRewards: () => void;
  onOpenPrograms: () => void;
}

export const TodayTab: React.FC<Props> = ({
  foodLogs,
  workouts,
  deviceStatus,
  scheduledActivities,
  streakDays,
  onNavigateToAiScan,
  onOpenWeightModal,
  onOpenExerciseModal,
  onToggleActivity,
  onDeleteFood,
  onDeleteWorkout,
  onOpenRewards,
  onOpenPrograms,
}) => {
  const dailyCalorieBudget = 1850;
  const totalCaloriesConsumed = foodLogs.reduce((sum, item) => sum + item.calories, 0);
  const workoutCaloriesBurned = workouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
  const activeCaloriesBurned = deviceStatus.appleWatch.activeCalories + workoutCaloriesBurned;
  const netCalories = totalCaloriesConsumed - activeCaloriesBurned;
  const caloriesRemaining = Math.max(0, dailyCalorieBudget - netCalories);

  const totalProtein = foodLogs.reduce((sum, item) => sum + item.proteinGrams, 0);
  const totalCarbs = foodLogs.reduce((sum, item) => sum + item.carbsGrams, 0);
  const totalFat = foodLogs.reduce((sum, item) => sum + item.fatGrams, 0);
  const totalFiber = foodLogs.reduce((sum, item) => sum + (item.fiberGrams || 0), 0);

  const proteinTarget = 110;
  const carbsTarget = 180;
  const fatTarget = 55;
  const fiberTarget = 30;

  // Percentage for ring calculation
  const ringPercentage = Math.min(100, Math.round((netCalories / dailyCalorieBudget) * 100));
  const strokeDashoffset = 283 - (283 * Math.min(100, ringPercentage)) / 100;

  return (
    <div className="space-y-4 pb-20">
      {/* Duolingo-style Streak & Notification Bar */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-red-500/15 border border-amber-500/30 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/30 animate-pulse">
            <Flame className="w-6 h-6 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tabular-nums">{streakDays}-Day Streak</span>
              <span className="text-[11px] font-medium text-amber-400">🔥 On Fire!</span>
            </div>
            <p className="text-xs text-slate-300">
              Log dinner before 9 PM to protect your flame & earn +50 Healthpoints.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenRewards}
          className="p-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
          title="Streak Rewards"
        >
          <Award className="w-4 h-4" />
        </button>
      </div>

      {/* Hero Calorie Summary Card */}
      <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Today's Calorie Deficit
            </span>
            <h2 className="text-xl font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span>{caloriesRemaining.toLocaleString()}</span>
              <span className="text-xs font-normal text-slate-400">kcal remaining</span>
            </h2>
          </div>

          <button
            onClick={onNavigateToAiScan}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-semibold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>AI Food Scan</span>
          </button>
        </div>

        {/* Circular Progress & KPI Grid */}
        <div className="flex items-center justify-between gap-4 py-2 border-y border-slate-700/60">
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-700"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                className="text-emerald-400 transition-all duration-700"
                fill="transparent"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-bold text-white tabular-nums">{ringPercentage}%</span>
              <span className="text-[9px] text-slate-400">budget</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 flex-1">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-[10px] text-slate-400">Food Intake</p>
              <p className="text-sm font-bold text-white tabular-nums">{totalCaloriesConsumed} <span className="text-[10px] font-normal text-slate-400">kcal</span></p>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-[10px] text-emerald-400">Active Burned</p>
              <p className="text-sm font-bold text-emerald-300 tabular-nums">-{activeCaloriesBurned} <span className="text-[10px] font-normal text-slate-400">kcal</span></p>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-[10px] text-slate-400">Daily Target</p>
              <p className="text-sm font-bold text-white tabular-nums">{dailyCalorieBudget} <span className="text-[10px] font-normal text-slate-400">kcal</span></p>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-[10px] text-amber-400">Net Calories</p>
              <p className="text-sm font-bold text-amber-300 tabular-nums">{netCalories} <span className="text-[10px] font-normal text-slate-400">kcal</span></p>
            </div>
          </div>
        </div>

        {/* Macronutrient Progression Bars */}
        <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Protein</span>
              <span className="tabular-nums font-mono text-white">{totalProtein}g</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-400 rounded-full"
                style={{ width: `${Math.min(100, (totalProtein / proteinTarget) * 100)}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-500 tabular-nums">/{proteinTarget}g</span>
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Carbs</span>
              <span className="tabular-nums font-mono text-white">{totalCarbs}g</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${Math.min(100, (totalCarbs / carbsTarget) * 100)}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-500 tabular-nums">/{carbsTarget}g</span>
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Fat</span>
              <span className="tabular-nums font-mono text-white">{totalFat}g</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-400 rounded-full"
                style={{ width: `${Math.min(100, (totalFat / fatTarget) * 100)}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-500 tabular-nums">/{fatTarget}g</span>
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Fiber</span>
              <span className="tabular-nums font-mono text-white">{totalFiber}g</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full"
                style={{ width: `${Math.min(100, (totalFiber / fiberTarget) * 100)}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-500 tabular-nums">/{fiberTarget}g</span>
          </div>
        </div>
      </div>

      {/* Connected Devices (InBody Scale & Apple Watch) */}
      <div className="grid grid-cols-2 gap-3">
        {/* InBody Scale Card */}
        <button
          onClick={onOpenWeightModal}
          className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Scale className="w-4 h-4 text-indigo-400" />
              InBody Sync
            </span>
            <span className="text-[10px] text-indigo-400 font-medium">Log</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-white tabular-nums font-mono">
              {deviceStatus.inBodyScale.weightKg}
            </span>
            <span className="text-xs text-slate-400">kg</span>
            <span className="text-[11px] text-emerald-400 ml-auto flex items-center">
              <TrendingDown className="w-3 h-3 mr-0.5" /> -0.7kg
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
            <span>BF: {deviceStatus.inBodyScale.bodyFatPercent}%</span>
            <span>·</span>
            <span>Muscle: {deviceStatus.inBodyScale.skeletalMuscleKg}kg</span>
          </div>
        </button>

        {/* Apple Watch / Health365 Steps Card */}
        <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-left">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Watch className="w-4 h-4 text-emerald-400" />
              Apple Watch
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">Live</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-white tabular-nums font-mono">
              {deviceStatus.appleWatch.todaySteps.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">steps</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
            <span>{deviceStatus.appleWatch.activeCalories} kcal</span>
            <span>·</span>
            <span>{deviceStatus.appleWatch.heartRateBpm} bpm</span>
          </div>
        </div>
      </div>

      {/* Today's Scheduled Routines & ActiveSG Sessions */}
      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-white tracking-wider uppercase">
              Today's Program Schedule
            </h3>
          </div>
          <button
            onClick={onOpenPrograms}
            className="text-[11px] font-medium text-emerald-400 hover:underline flex items-center"
          >
            Full Calendar <ChevronRight className="w-3 h-3 ml-0.5" />
          </button>
        </div>

        <div className="space-y-2">
          {scheduledActivities.map((act) => (
            <div
              key={act.id}
              onClick={() => onToggleActivity(act.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                act.completed
                  ? 'bg-slate-900/50 border-slate-800 opacity-60'
                  : 'bg-slate-900/80 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  {act.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                <div>
                  <p className={`text-xs font-semibold ${act.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                    {act.title}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span>{act.time}</span>
                    <span>·</span>
                    <span>{act.location}</span>
                    {act.activeSgEligible && (
                      <span className="text-emerald-400 font-medium">ActiveSG Pass</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workouts & Exercise Database (Wger DB) */}
      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-semibold text-white tracking-wider uppercase">
              Logged Workouts ({workouts.length})
            </h3>
          </div>
          <button
            onClick={onOpenExerciseModal}
            className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Wger Exercise Catalog
          </button>
        </div>

        {workouts.length > 0 ? (
          <div className="space-y-2">
            {workouts.map((w) => (
              <div
                key={w.id}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 group"
              >
                <div>
                  <p className="text-xs font-semibold text-white">{w.exerciseName}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span>{w.durationMinutes} mins</span>
                    {w.sets ? <span>· {w.sets} sets × {w.reps} reps</span> : null}
                    {w.weightKg ? <span>· {w.weightKg}kg</span> : null}
                    <span>·</span>
                    <span className="text-emerald-400 font-mono font-medium">-{w.caloriesBurned} kcal</span>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteWorkout(w.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-all"
                  title="Remove workout"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div
            onClick={onOpenExerciseModal}
            className="p-3.5 rounded-xl border border-dashed border-slate-700 hover:border-sky-500/50 bg-slate-900/40 text-center cursor-pointer transition-colors"
          >
            <p className="text-xs font-medium text-slate-300">Log an exercise from Wger database</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Kettlebell Swings, Hack Squats, Bench Press & more</p>
          </div>
        )}
      </div>

      {/* Today's Food Diary */}
      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold text-white tracking-wider uppercase">
              Meals Logged ({foodLogs.length})
            </h3>
          </div>
          <button
            onClick={onNavigateToAiScan}
            className="text-[11px] font-medium text-emerald-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add Meal
          </button>
        </div>

        <div className="space-y-2.5">
          {foodLogs.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 text-slate-400">
                    <UtensilsCrossed className="w-5 h-5 text-emerald-400/80" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                    {item.healthierChoiceSymbol && (
                      <span className="text-[9px] text-emerald-400 font-bold shrink-0">HCS</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span className="capitalize">{item.mealType}</span>
                    <span>·</span>
                    <span className="tabular-nums font-mono text-slate-300">{item.calories} kcal</span>
                    <span>·</span>
                    <span>P: {item.proteinGrams}g · C: {item.carbsGrams}g · F: {item.fatGrams}g</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onDeleteFood(item.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-all"
                title="Remove entry"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
