import React, { useState, useEffect } from 'react';
import { MobileShell } from './components/MobileShell';
import { TodayTab } from './components/TodayTab';
import { AiCalorieScannerTab } from './components/AiCalorieScannerTab';
import { ProgramsTab } from './components/ProgramsTab';
import { TrainersTab } from './components/TrainersTab';
import { RewardsEcosystemTab } from './components/RewardsEcosystemTab';
import { BusinessModelModal } from './components/BusinessModelModal';
import { LogWeightModal } from './components/LogWeightModal';
import { ExerciseCatalogModal } from './components/ExerciseCatalogModal';
import { DatabaseInspectorModal } from './components/DatabaseInspectorModal';
import { 
  INITIAL_FOOD_LOG, 
  INITIAL_TRAINERS, 
  INITIAL_PROGRAMS, 
  INITIAL_REWARDS, 
  INITIAL_DEVICE_STATUS 
} from './data/initialData';
import { FoodLogItem, EndToEndProgram, DeviceSyncStatus, SubscriptionTier, RewardItem } from './types';
import { api, WorkoutLog } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<'today' | 'ai_scan' | 'programs' | 'trainers' | 'rewards'>('today');
  const [foodLogs, setFoodLogs] = useState<FoodLogItem[]>(INITIAL_FOOD_LOG);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [programs, setPrograms] = useState<EndToEndProgram[]>(INITIAL_PROGRAMS);
  const [activeProgram, setActiveProgram] = useState<EndToEndProgram>(INITIAL_PROGRAMS[0]);
  const [trainers, setTrainers] = useState(INITIAL_TRAINERS);
  const [rewards, setRewards] = useState<RewardItem[]>(INITIAL_REWARDS);
  const [deviceStatus, setDeviceStatus] = useState<DeviceSyncStatus>(INITIAL_DEVICE_STATUS);
  const [streakDays, setStreakDays] = useState(12);
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('basic');

  // Modals
  const [isBmcModalOpen, setIsBmcModalOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isDbInspectorOpen, setIsDbInspectorOpen] = useState(false);

  // Load persistent data from backend database on mount
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [dbFoods, dbWorkouts, dbBiometrics, dbWallet] = await Promise.allSettled([
          api.getFoods(),
          api.getWorkouts(),
          api.getBiometrics(),
          api.getWallet(),
        ]);

        if (dbFoods.status === 'fulfilled' && dbFoods.value.length > 0) {
          setFoodLogs(dbFoods.value);
        }
        if (dbWorkouts.status === 'fulfilled') {
          setWorkouts(dbWorkouts.value);
        }
        if (dbBiometrics.status === 'fulfilled' && dbBiometrics.value.length > 0) {
          const latestBio = dbBiometrics.value[0];
          setDeviceStatus((prev) => ({
            ...prev,
            inBodyScale: {
              ...prev.inBodyScale,
              weightKg: latestBio.weightKg,
              bodyFatPercent: latestBio.bodyFatPercent,
              skeletalMuscleKg: latestBio.skeletalMuscleKg,
              visceralFatLevel: latestBio.visceralFatLevel,
              lastSync: 'Synced with Backend DB',
            },
          }));
        }
        if (dbWallet.status === 'fulfilled') {
          const w = dbWallet.value;
          setStreakDays(w.streakDays || 12);
          setCurrentTier(w.currentTier || 'basic');
          setDeviceStatus((prev) => ({
            ...prev,
            activeSgHealth365: {
              ...prev.activeSgHealth365,
              healthpointsBalance: w.healthpointsBalance ?? prev.activeSgHealth365.healthpointsBalance,
              activeSgCredits: w.activeSgCredits ?? prev.activeSgHealth365.activeSgCredits,
            },
          }));
        }
      } catch (err) {
        console.error('Error synchronizing with backend database:', err);
      }
    }

    loadBackendData();
  }, []);

  // Handlers for Food Logs (Persistent)
  const handleAddMeal = async (newMeal: FoodLogItem) => {
    setFoodLogs((prev) => [newMeal, ...prev]);

    // Save to backend database
    try {
      await api.addFood(newMeal);
    } catch (err) {
      console.error('Failed to persist food to backend DB:', err);
    }

    // Bonus points for Health365
    setDeviceStatus((prev) => ({
      ...prev,
      activeSgHealth365: {
        ...prev.activeSgHealth365,
        healthpointsBalance: prev.activeSgHealth365.healthpointsBalance + (newMeal.activeSgPoints || 25),
      },
    }));
  };

  const handleDeleteFood = async (id: string) => {
    setFoodLogs((prev) => prev.filter((f) => f.id !== id));
    try {
      await api.deleteFood(id);
    } catch (err) {
      console.error('Failed to delete food from DB:', err);
    }
  };

  // Handlers for Workouts (Persistent from Wger database)
  const handleWorkoutLogged = (workout: WorkoutLog) => {
    setWorkouts((prev) => [workout, ...prev]);

    // Credit Healthpoints
    setDeviceStatus((prev) => ({
      ...prev,
      activeSgHealth365: {
        ...prev.activeSgHealth365,
        healthpointsBalance: prev.activeSgHealth365.healthpointsBalance + (workout.activeSgPoints || 30),
      },
    }));
  };

  const handleDeleteWorkout = async (id: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
    try {
      await api.deleteWorkout(id);
    } catch (err) {
      console.error('Failed to remove workout from DB:', err);
    }
  };

  const handleToggleActivity = (actId: string) => {
    setActiveProgram((prev) => ({
      ...prev,
      weeklySchedule: prev.weeklySchedule.map((act) =>
        act.id === actId ? { ...act, completed: !act.completed } : act
      ),
    }));
  };

  const handleUpdateWeight = async (newWeight: number, newBf: number, newMuscle: number) => {
    setDeviceStatus((prev) => ({
      ...prev,
      inBodyScale: {
        ...prev.inBodyScale,
        weightKg: newWeight,
        bodyFatPercent: newBf,
        skeletalMuscleKg: newMuscle,
        lastSync: 'Just now',
      },
    }));

    // Persist to backend database
    try {
      await api.addBiometric({
        weightKg: newWeight,
        bodyFatPercent: newBf,
        skeletalMuscleKg: newMuscle,
        visceralFatLevel: 5,
        deviceSource: 'InBody Scale',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (err) {
      console.error('Failed to persist biometrics to DB:', err);
    }
  };

  const handleClaimReward = async (rewardId: string) => {
    setRewards((prev) =>
      prev.map((r) => (r.id === rewardId ? { ...r, claimed: true } : r))
    );
    try {
      await api.updateWallet({
        healthpointsBalance: Math.max(0, deviceStatus.activeSgHealth365.healthpointsBalance - 200),
      });
    } catch {}
  };

  const handleSimulateDeviceSync = (device: 'watch' | 'scale' | 'health365') => {
    if (device === 'watch') {
      setDeviceStatus((prev) => ({
        ...prev,
        appleWatch: {
          ...prev.appleWatch,
          todaySteps: prev.appleWatch.todaySteps + 1250,
          activeCalories: prev.appleWatch.activeCalories + 75,
          lastSync: 'Just now',
        },
      }));
    } else if (device === 'scale') {
      setIsWeightModalOpen(true);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 font-sans">
      <MobileShell
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenBmc={() => setIsBmcModalOpen(true)}
        onOpenDbInspector={() => setIsDbInspectorOpen(true)}
        streakDays={streakDays}
        healthpointsBalance={deviceStatus.activeSgHealth365.healthpointsBalance}
      >
        {activeTab === 'today' && (
          <TodayTab
            foodLogs={foodLogs}
            workouts={workouts}
            deviceStatus={deviceStatus}
            scheduledActivities={activeProgram.weeklySchedule}
            streakDays={streakDays}
            onNavigateToAiScan={() => setActiveTab('ai_scan')}
            onOpenWeightModal={() => setIsWeightModalOpen(true)}
            onOpenExerciseModal={() => setIsExerciseModalOpen(true)}
            onToggleActivity={handleToggleActivity}
            onDeleteFood={handleDeleteFood}
            onDeleteWorkout={handleDeleteWorkout}
            onOpenRewards={() => setActiveTab('rewards')}
            onOpenPrograms={() => setActiveTab('programs')}
          />
        )}

        {activeTab === 'ai_scan' && (
          <AiCalorieScannerTab
            onAddMeal={handleAddMeal}
            onSuccessRedirect={() => setActiveTab('today')}
          />
        )}

        {activeTab === 'programs' && (
          <ProgramsTab
            programs={programs}
            activeProgram={activeProgram}
            onSelectProgram={(p) => {
              setActiveProgram(p);
              if (!programs.some((item) => item.id === p.id)) {
                setPrograms((prev) => [p, ...prev]);
              }
            }}
            onToggleActivity={handleToggleActivity}
            onBookTrainerClick={() => setActiveTab('trainers')}
          />
        )}

        {activeTab === 'trainers' && (
          <TrainersTab trainers={trainers} />
        )}

        {activeTab === 'rewards' && (
          <RewardsEcosystemTab
            rewards={rewards}
            deviceStatus={deviceStatus}
            currentTier={currentTier}
            onSelectTier={setCurrentTier}
            onClaimReward={handleClaimReward}
            onSimulateDeviceSync={handleSimulateDeviceSync}
          />
        )}
      </MobileShell>

      {/* Backend Database Inspector Modal */}
      <DatabaseInspectorModal
        isOpen={isDbInspectorOpen}
        onClose={() => setIsDbInspectorOpen(false)}
      />

      {/* Exercise Database & Workout Logger Modal (Synced from Wger API) */}
      <ExerciseCatalogModal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        onWorkoutLogged={handleWorkoutLogged}
      />

      {/* Business Model Canvas Alignment Modal */}
      <BusinessModelModal
        isOpen={isBmcModalOpen}
        onClose={() => setIsBmcModalOpen(false)}
      />

      {/* InBody & Smart Scale Sync Modal */}
      <LogWeightModal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        deviceStatus={deviceStatus}
        onUpdateWeight={handleUpdateWeight}
      />
    </div>
  );
}
