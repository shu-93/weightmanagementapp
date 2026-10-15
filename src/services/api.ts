import { FoodLogItem } from '../types';

export interface ExerciseItem {
  id: number;
  uuid: string;
  name: string;
  category: string;
  categoryId: number;
  muscles: string[];
  musclesSecondary: string[];
  equipment: string[];
  description: string;
  caloriesBurnPerMin: number;
  activeSgZone: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  syncedAt: string;
}

export interface WorkoutLog {
  id: string;
  exerciseId: number;
  exerciseName: string;
  category: string;
  durationMinutes: number;
  sets?: number;
  reps?: number;
  weightKg?: number;
  caloriesBurned: number;
  activeSgPoints: number;
  timestamp: string;
  createdAt?: string;
}

export interface BiometricLog {
  id: string;
  weightKg: number;
  bodyFatPercent: number;
  skeletalMuscleKg: number;
  visceralFatLevel: number;
  deviceSource: 'InBody Scale' | 'Manual';
  timestamp: string;
}

export interface DbStats {
  version: string;
  lastUpdated: string;
  wgerEndpoint: string;
  lastWgerSync: string | null;
  fileSizeKb: number;
  counts: {
    exercises: number;
    foodLogs: number;
    workouts: number;
    biometrics: number;
    bookings: number;
  };
  wallet: {
    healthpointsBalance: number;
    activeSgCredits: number;
    streakDays: number;
    claimedVoucherIds: string[];
    currentTier: 'freemium' | 'basic' | 'premium';
  };
}

export const api = {
  // Exercises (Wger)
  async getExercises(filters?: { category?: string; equipment?: string; muscle?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.equipment) params.append('equipment', filters.equipment);
    if (filters?.muscle) params.append('muscle', filters.muscle);
    if (filters?.search) params.append('search', filters.search);

    const res = await fetch(`/api/db/exercises?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch exercises from backend database');
    return (await res.json()) as { total: number; wgerEndpoint: string; lastWgerSync: string | null; data: ExerciseItem[] };
  },

  async syncWgerExercises() {
    const res = await fetch('/api/db/exercises/sync', { method: 'POST' });
    if (!res.ok) throw new Error('Sync with Wger endpoint failed');
    return (await res.json()) as { success: boolean; count: number; error?: string; endpoint: string };
  },

  // Food logs
  async getFoods(): Promise<FoodLogItem[]> {
    const res = await fetch('/api/db/foods');
    if (!res.ok) throw new Error('Failed to fetch food logs');
    return await res.json();
  },

  async addFood(food: Omit<FoodLogItem, 'createdAt'>): Promise<FoodLogItem> {
    const res = await fetch('/api/db/foods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(food),
    });
    if (!res.ok) throw new Error('Failed to save food log');
    return await res.json();
  },

  async deleteFood(id: string): Promise<boolean> {
    const res = await fetch(`/api/db/foods/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // Workouts
  async getWorkouts(): Promise<WorkoutLog[]> {
    const res = await fetch('/api/db/workouts');
    if (!res.ok) throw new Error('Failed to fetch workouts');
    return await res.json();
  },

  async logWorkout(workout: Omit<WorkoutLog, 'id' | 'createdAt'>): Promise<WorkoutLog> {
    const res = await fetch('/api/db/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workout),
    });
    if (!res.ok) throw new Error('Failed to log workout');
    return await res.json();
  },

  async deleteWorkout(id: string): Promise<boolean> {
    const res = await fetch(`/api/db/workouts/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // Biometrics
  async getBiometrics(): Promise<BiometricLog[]> {
    const res = await fetch('/api/db/biometrics');
    if (!res.ok) throw new Error('Failed to fetch biometrics');
    return await res.json();
  },

  async addBiometric(bio: Omit<BiometricLog, 'id' | 'createdAt'>): Promise<BiometricLog> {
    const res = await fetch('/api/db/biometrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bio),
    });
    if (!res.ok) throw new Error('Failed to save biometrics');
    return await res.json();
  },

  // Bookings
  async getBookings() {
    const res = await fetch('/api/db/bookings');
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return await res.json();
  },

  async addBooking(booking: any) {
    const res = await fetch('/api/db/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
    });
    if (!res.ok) throw new Error('Failed to create booking');
    return await res.json();
  },

  // Wallet
  async getWallet() {
    const res = await fetch('/api/db/wallet');
    if (!res.ok) throw new Error('Failed to fetch wallet');
    return await res.json();
  },

  async updateWallet(partial: any) {
    const res = await fetch('/api/db/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partial),
    });
    if (!res.ok) throw new Error('Failed to update wallet');
    return await res.json();
  },

  // Database Engine Stats
  async getDbStats(): Promise<DbStats> {
    const res = await fetch('/api/db/stats');
    if (!res.ok) throw new Error('Failed to fetch db stats');
    return await res.json();
  },

  // Live Weather & Outdoor Fitness Readiness
  async getWeather(lat?: number, lon?: number): Promise<WeatherData> {
    const params = new URLSearchParams();
    if (lat) params.append('lat', lat.toString());
    if (lon) params.append('lon', lon.toString());
    const res = await fetch(`/api/weather?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch weather');
    return await res.json();
  },
};

export interface WeatherData {
  location: string;
  temperature: number;
  apparentTemperature: number;
  condition: string;
  icon: string;
  isRainy: boolean;
  humidity: number;
  windSpeedKmH: number;
  airQualityPsi: number;
  airQualityStatus: string;
  fitnessAdvice: string;
  recommendationType: 'outdoor' | 'indoor';
  updatedAt: string;
}

