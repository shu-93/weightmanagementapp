export interface FoodLogItem {
  id: string;
  name: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
  servingSize: string;
  timestamp: string;
  imageUrl?: string;
  healthRating?: number;
  healthierChoiceSymbol?: boolean;
  dietitianNotes?: string;
  suggestedExercise?: string;
  activeSgPoints?: number;
}

export interface Trainer {
  id: string;
  name: string;
  title: string;
  specialty: string[];
  hourlyRate: number;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  bio: string;
  certifications: string[];
  activeSgPartner: boolean;
  onlineAvailable: boolean;
  inPersonLocations: string[];
}

export interface ProgramMilestone {
  week: number;
  targetKg: number;
  focus: string;
  completed?: boolean;
}

export interface ScheduledActivity {
  id: string;
  title: string;
  time: string;
  day: string;
  category: 'gym' | 'trainer' | 'nutrition' | 'cardio' | 'device_test';
  location: string;
  completed: boolean;
  activeSgEligible?: boolean;
}

export interface EndToEndProgram {
  id: string;
  title: string;
  category: 'weight_loss' | 'diabetes_care' | 'hyrox_athlete' | 'postpartum';
  durationWeeks: number;
  currentWeightKg: number;
  targetWeightKg: number;
  dailyCalorieTarget: number;
  summary: string;
  dietitianAdvice: string;
  milestones: ProgramMilestone[];
  weeklySchedule: ScheduledActivity[];
}

export interface RewardItem {
  id: string;
  name: string;
  partner: string;
  category: 'f_and_b' | 'gym' | 'equipment' | 'government';
  pointsCost: number;
  valueDescription: string;
  code: string;
  claimed: boolean;
}

export interface DeviceSyncStatus {
  appleWatch: {
    connected: boolean;
    lastSync: string;
    todaySteps: number;
    activeCalories: number;
    heartRateBpm: number;
  };
  inBodyScale: {
    connected: boolean;
    lastSync: string;
    weightKg: number;
    bodyFatPercent: number;
    skeletalMuscleKg: number;
    visceralFatLevel: number;
  };
  activeSgHealth365: {
    connected: boolean;
    nationalStepsChallengeActive: boolean;
    healthpointsBalance: number;
    activeSgCredits: number;
  };
}

export type SubscriptionTier = 'freemium' | 'basic' | 'premium';
