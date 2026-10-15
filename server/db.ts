import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory and database file
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'app_database.json');

export interface ExerciseRecord {
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

export interface FoodLogRecord {
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
  createdAt: string;
}

export interface WorkoutLogRecord {
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
  createdAt: string;
}

export interface BiometricRecord {
  id: string;
  weightKg: number;
  bodyFatPercent: number;
  skeletalMuscleKg: number;
  visceralFatLevel: number;
  deviceSource: 'InBody Scale' | 'Manual';
  timestamp: string;
  createdAt: string;
}

export interface TrainerBookingRecord {
  id: string;
  trainerId: string;
  trainerName: string;
  date: string;
  time: string;
  sessionType: 'online' | 'in_person';
  hourlyRate: number;
  status: 'confirmed' | 'completed' | 'cancelled';
  activeSgLocation: string;
  createdAt: string;
}

export interface AppDatabaseSchema {
  metadata: {
    version: string;
    appName: string;
    lastUpdated: string;
    wgerEndpoint: string;
    lastWgerSync: string | null;
    wgerTotalCount: number;
  };
  exercises: ExerciseRecord[];
  food_logs: FoodLogRecord[];
  workouts: WorkoutLogRecord[];
  biometrics: BiometricRecord[];
  bookings: TrainerBookingRecord[];
  wallet: {
    healthpointsBalance: number;
    activeSgCredits: number;
    streakDays: number;
    claimedVoucherIds: string[];
    currentTier: 'freemium' | 'basic' | 'premium';
  };
}

// Strip HTML tags for clean mobile reading
function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Calculate exercise burn rate per minute based on muscle mass & category
function calculateCalorieBurn(categoryName: string, equipmentList: string[]): number {
  const cat = (categoryName || '').toLowerCase();
  const eq = (equipmentList || []).join(' ').toLowerCase();

  if (cat.includes('leg') || eq.includes('kettlebell')) return 10.5;
  if (cat.includes('chest') || cat.includes('back')) return 8.5;
  if (cat.includes('abs')) return 7.0;
  if (cat.includes('shoulder') || cat.includes('arm')) return 6.5;
  return 8.0;
}

function determineActiveSgZone(equipmentList: string[]): string {
  const eq = (equipmentList || []).join(' ').toLowerCase();
  if (eq.includes('kettlebell') || eq.includes('dumbbell')) return 'ActiveSG Free Weights Zone';
  if (eq.includes('barbell') || eq.includes('bench')) return 'ActiveSG Power Rack Arena';
  if (eq.includes('bodyweight') || eq.includes('mat') || eq.length === 0) return 'ActiveSG Functional Conditioning Studio';
  return 'ActiveSG Main Gym Floor';
}

// In-memory cache for speed
let dbCache: AppDatabaseSchema | null = null;
let isWriting = false;

// Initial seed data if file doesn't exist
const DEFAULT_INITIAL_DB: AppDatabaseSchema = {
  metadata: {
    version: '1.0.0',
    appName: 'VibeWeight Mobile Backend',
    lastUpdated: new Date().toISOString(),
    wgerEndpoint: 'https://wger.de/api/v2/exerciseinfo/?language=2&limit=20',
    lastWgerSync: null,
    wgerTotalCount: 0,
  },
  exercises: [],
  food_logs: [
    {
      id: 'f-1',
      name: 'Mediterranean Grilled Chicken & Quinoa Bowl',
      mealType: 'lunch',
      calories: 485,
      proteinGrams: 38,
      carbsGrams: 42,
      fatGrams: 16,
      fiberGrams: 9,
      servingSize: '1 bowl (380g)',
      timestamp: '12:45 PM',
      imageUrl: '/src/assets/images/healthy_grain_bowl_1792039808734.jpg',
      healthRating: 9,
      healthierChoiceSymbol: true,
      dietitianNotes: 'Rich in lean protein and essential healthy fats. Ideal post-workout fuel.',
      suggestedExercise: '45 mins brisk walk or 25 mins ActiveSG cycling',
      activeSgPoints: 25,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'f-2',
      name: 'Greek Yogurt with Fresh Blueberries & Chia',
      mealType: 'breakfast',
      calories: 220,
      proteinGrams: 18,
      carbsGrams: 24,
      fatGrams: 4,
      fiberGrams: 5,
      servingSize: '1 cup (200g)',
      timestamp: '08:15 AM',
      healthRating: 10,
      healthierChoiceSymbol: true,
      dietitianNotes: 'Great probiotic support with low glycemic index antioxidants.',
      suggestedExercise: '20 mins morning stretch & light jog',
      activeSgPoints: 20,
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
  ],
  workouts: [
    {
      id: 'w-1',
      exerciseId: 9,
      exerciseName: '2 Handed Kettlebell Swing',
      category: 'Abs / Conditioning',
      durationMinutes: 20,
      sets: 4,
      reps: 20,
      weightKg: 16,
      caloriesBurned: 210,
      activeSgPoints: 45,
      timestamp: 'Today 07:15 AM',
      createdAt: new Date().toISOString(),
    },
  ],
  biometrics: [
    {
      id: 'bio-1',
      weightKg: 73.8,
      bodyFatPercent: 18.4,
      skeletalMuscleKg: 34.2,
      visceralFatLevel: 5,
      deviceSource: 'InBody Scale',
      timestamp: 'Today 07:30 AM',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'bio-0',
      weightKg: 74.5,
      bodyFatPercent: 18.9,
      skeletalMuscleKg: 33.8,
      visceralFatLevel: 6,
      deviceSource: 'InBody Scale',
      timestamp: '7 days ago',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
  ],
  bookings: [
    {
      id: 'b-1',
      trainerId: 'tr-1',
      trainerName: 'Coach Sarah Tan',
      date: '2026-10-18',
      time: '18:00',
      sessionType: 'online',
      hourlyRate: 65,
      status: 'confirmed',
      activeSgLocation: 'In-App Live Video Consultation',
      createdAt: new Date().toISOString(),
    },
  ],
  wallet: {
    healthpointsBalance: 1240,
    activeSgCredits: 35.0,
    streakDays: 12,
    claimedVoucherIds: ['rew-2'],
    currentTier: 'basic',
  },
};

export class AppDatabase {
  // Initialize and load database from disk
  static async init(): Promise<AppDatabaseSchema> {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        dbCache = JSON.parse(raw);
        console.log(`Database loaded from ${DB_FILE}. Exercises count: ${dbCache?.exercises?.length || 0}`);
      } else {
        dbCache = { ...DEFAULT_INITIAL_DB };
        await this.persist();
        console.log(`Initialized fresh database at ${DB_FILE}`);
      }

      // Sync exercises from Wger API if empty or first boot
      if (!dbCache?.exercises || dbCache.exercises.length === 0) {
        console.log('Seeding exercises from Wger API endpoint...');
        await this.syncWgerExercises();
      }

      return dbCache!;
    } catch (err) {
      console.error('Failed to initialize database, using default fallback:', err);
      dbCache = { ...DEFAULT_INITIAL_DB };
      return dbCache;
    }
  }

  // Atomically persist database to file
  static async persist(): Promise<void> {
    if (!dbCache || isWriting) return;
    isWriting = true;
    try {
      dbCache.metadata.lastUpdated = new Date().toISOString();
      const tmpFile = `${DB_FILE}.tmp`;
      await fs.promises.writeFile(tmpFile, JSON.stringify(dbCache, null, 2), 'utf-8');
      await fs.promises.rename(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Error persisting database:', err);
    } finally {
      isWriting = false;
    }
  }

  static getDb(): AppDatabaseSchema {
    if (!dbCache) {
      dbCache = { ...DEFAULT_INITIAL_DB };
    }
    return dbCache;
  }

  // Sync exercises directly from the user requested endpoint:
  // https://wger.de/api/v2/exerciseinfo/?language=2&limit=20
  static async syncWgerExercises(): Promise<{ success: boolean; count: number; error?: string }> {
    const db = this.getDb();
    const endpoint = 'https://wger.de/api/v2/exerciseinfo/?language=2&limit=20';

    try {
      console.log(`Connecting to Wger API: ${endpoint}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'VibeWeight-App/1.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Wger API returned HTTP ${response.status}`);
      }

      const json = await response.json();
      const rawResults = json.results || [];
      const totalCount = json.count || rawResults.length;

      const mappedExercises: ExerciseRecord[] = rawResults.map((item: any, index: number) => {
        // Find English translation (language = 2) or fallback to first translation
        const translation = item.translations?.find((t: any) => t.language === 2) || item.translations?.[0];
        const exerciseName = translation?.name || `Exercise #${item.id}`;
        const rawDescription = translation?.description || '';
        const cleanDescription = stripHtml(rawDescription) || 'Perform with controlled tempo and engaged core muscles.';

        const muscles = (item.muscles || []).map((m: any) => m.name_en || m.name);
        const musclesSecondary = (item.muscles_secondary || []).map((m: any) => m.name_en || m.name);
        const equipment = (item.equipment || []).map((eq: any) => eq.name);
        const categoryName = item.category?.name || 'Full Body';

        const burnRate = calculateCalorieBurn(categoryName, equipment);
        const activeSgZone = determineActiveSgZone(equipment);

        let difficulty: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner';
        if (burnRate >= 10 || equipment.includes('Barbell')) difficulty = 'Advanced';
        else if (burnRate >= 8 || equipment.includes('Dumbbell')) difficulty = 'Intermediate';

        return {
          id: item.id || index + 1,
          uuid: item.uuid || `wger-${index + 1}`,
          name: exerciseName,
          category: categoryName,
          categoryId: item.category?.id || 1,
          muscles: muscles.length > 0 ? muscles : ['Core'],
          musclesSecondary,
          equipment: equipment.length > 0 ? equipment : ['Bodyweight'],
          description: cleanDescription,
          caloriesBurnPerMin: burnRate,
          activeSgZone,
          difficulty,
          syncedAt: new Date().toISOString(),
        };
      });

      db.exercises = mappedExercises;
      db.metadata.lastWgerSync = new Date().toISOString();
      db.metadata.wgerTotalCount = totalCount;
      await this.persist();

      console.log(`Successfully synced ${mappedExercises.length} exercises from Wger API!`);
      return { success: true, count: mappedExercises.length };
    } catch (err: any) {
      console.error('Failed to sync from Wger API, falling back to local cached library:', err.message);
      
      // If exercises are currently empty, provide built-in seed dataset matching Wger API
      if (db.exercises.length === 0) {
        db.exercises = [
          {
            id: 9,
            uuid: '1b020b3a-3732-4c7e-92fd-a0cec90ed69b',
            name: '2 Handed Kettlebell Swing',
            category: 'Abs',
            categoryId: 10,
            muscles: ['Hamstrings', 'Glutes'],
            musclesSecondary: ['Quads', 'Abs'],
            equipment: ['Kettlebell'],
            description: 'Two Handed Russian Style Kettlebell swing. Explosive hip hinge movement generating maximum glute and core activation.',
            caloriesBurnPerMin: 11.5,
            activeSgZone: 'ActiveSG Free Weights Zone',
            difficulty: 'Intermediate',
            syncedAt: new Date().toISOString(),
          },
          {
            id: 11,
            uuid: 'c788d643-150a-4ac7-97ef-84643c6419c2',
            name: 'Arnold Shoulder Press',
            category: 'Shoulders',
            categoryId: 13,
            muscles: ['Shoulders', 'Triceps'],
            musclesSecondary: ['Trapezius'],
            equipment: ['Dumbbell'],
            description: 'Rotational shoulder press targeting all three heads of the deltoids for sculpted shoulders.',
            caloriesBurnPerMin: 7.5,
            activeSgZone: 'ActiveSG Free Weights Zone',
            difficulty: 'Intermediate',
            syncedAt: new Date().toISOString(),
          },
          {
            id: 14,
            uuid: 'c788d643-150a-4ac7-97ef-84643c6419c3',
            name: 'Barbell Flat Bench Press',
            category: 'Chest',
            categoryId: 11,
            muscles: ['Pectoralis Major', 'Triceps'],
            musclesSecondary: ['Anterior Deltoids'],
            equipment: ['Barbell', 'Bench'],
            description: 'Fundamental upper-body compound movement building chest strength and metabolic density.',
            caloriesBurnPerMin: 9.0,
            activeSgZone: 'ActiveSG Power Rack Arena',
            difficulty: 'Advanced',
            syncedAt: new Date().toISOString(),
          },
          {
            id: 6,
            uuid: 'c788d643-150a-4ac7-97ef-84643c6419c4',
            name: 'Barbell Hack Squats',
            category: 'Legs',
            categoryId: 9,
            muscles: ['Quads', 'Glutes'],
            musclesSecondary: ['Hamstrings'],
            equipment: ['Barbell'],
            description: 'Squat variant emphasizing quad development while sparing lower spine compression.',
            caloriesBurnPerMin: 10.0,
            activeSgZone: 'ActiveSG Power Rack Arena',
            difficulty: 'Advanced',
            syncedAt: new Date().toISOString(),
          },
          {
            id: 12,
            uuid: 'c788d643-150a-4ac7-97ef-84643c6419c5',
            name: 'Bear Walk Conditioning',
            category: 'Chest',
            categoryId: 11,
            muscles: ['Shoulders', 'Calves', 'Chest', 'Abs'],
            musclesSecondary: ['Triceps'],
            equipment: ['Bodyweight'],
            description: 'Dynamic quadrupedal crawl promoting total-body coordination, scapular stability, and intense calorie burn.',
            caloriesBurnPerMin: 11.0,
            activeSgZone: 'ActiveSG Functional Conditioning Studio',
            difficulty: 'Intermediate',
            syncedAt: new Date().toISOString(),
          },
          {
            id: 18,
            uuid: 'c788d643-150a-4ac7-97ef-84643c6419c6',
            name: 'Single Arm Bent Over Dumbbell Row',
            category: 'Back',
            categoryId: 12,
            muscles: ['Latissimus Dorsi', 'Rhomboids'],
            musclesSecondary: ['Biceps'],
            equipment: ['Dumbbell', 'Bench'],
            description: 'Unilateral rowing exercise correcting posture imbalances and strengthening upper back.',
            caloriesBurnPerMin: 8.5,
            activeSgZone: 'ActiveSG Free Weights Zone',
            difficulty: 'Beginner',
            syncedAt: new Date().toISOString(),
          },
        ];
        db.metadata.lastWgerSync = new Date().toISOString();
        db.metadata.wgerTotalCount = 932;
        await this.persist();
      }

      return { success: false, count: db.exercises.length, error: err.message };
    }
  }

  // --- Food Logs Operations ---
  static getFoods(): FoodLogRecord[] {
    return this.getDb().food_logs;
  }

  static async addFood(item: Omit<FoodLogRecord, 'createdAt'>): Promise<FoodLogRecord> {
    const db = this.getDb();
    const record: FoodLogRecord = {
      ...item,
      createdAt: new Date().toISOString(),
    };
    db.food_logs.unshift(record);

    // Update wallet Healthpoints
    if (record.activeSgPoints) {
      db.wallet.healthpointsBalance += record.activeSgPoints;
    }

    await this.persist();
    return record;
  }

  static async deleteFood(id: string): Promise<boolean> {
    const db = this.getDb();
    const initialLen = db.food_logs.length;
    db.food_logs = db.food_logs.filter((f) => f.id !== id);
    if (db.food_logs.length !== initialLen) {
      await this.persist();
      return true;
    }
    return false;
  }

  // --- Workouts Operations ---
  static getWorkouts(): WorkoutLogRecord[] {
    return this.getDb().workouts;
  }

  static async addWorkout(item: Omit<WorkoutLogRecord, 'id' | 'createdAt'>): Promise<WorkoutLogRecord> {
    const db = this.getDb();
    const record: WorkoutLogRecord = {
      ...item,
      id: `w-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    db.workouts.unshift(record);

    // Reward healthpoints for completing workout
    db.wallet.healthpointsBalance += record.activeSgPoints || 30;

    await this.persist();
    return record;
  }

  static async deleteWorkout(id: string): Promise<boolean> {
    const db = this.getDb();
    const initialLen = db.workouts.length;
    db.workouts = db.workouts.filter((w) => w.id !== id);
    if (db.workouts.length !== initialLen) {
      await this.persist();
      return true;
    }
    return false;
  }

  // --- Biometrics Operations ---
  static getBiometrics(): BiometricRecord[] {
    return this.getDb().biometrics;
  }

  static async addBiometric(item: Omit<BiometricRecord, 'id' | 'createdAt'>): Promise<BiometricRecord> {
    const db = this.getDb();
    const record: BiometricRecord = {
      ...item,
      id: `bio-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    db.biometrics.unshift(record);
    await this.persist();
    return record;
  }

  // --- Trainer Bookings Operations ---
  static getBookings(): TrainerBookingRecord[] {
    return this.getDb().bookings;
  }

  static async addBooking(item: Omit<TrainerBookingRecord, 'id' | 'createdAt' | 'status'>): Promise<TrainerBookingRecord> {
    const db = this.getDb();
    const record: TrainerBookingRecord = {
      ...item,
      id: `b-${Date.now()}`,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    db.bookings.unshift(record);
    // Award 50 bonus Healthpoints for booking a coach
    db.wallet.healthpointsBalance += 50;
    await this.persist();
    return record;
  }

  // --- Wallet & Tier Operations ---
  static getWallet() {
    return this.getDb().wallet;
  }

  static async updateWallet(partial: Partial<AppDatabaseSchema['wallet']>): Promise<AppDatabaseSchema['wallet']> {
    const db = this.getDb();
    db.wallet = { ...db.wallet, ...partial };
    await this.persist();
    return db.wallet;
  }

  // --- Database Stats ---
  static getStats() {
    const db = this.getDb();
    let fileSizeKb = 0;
    try {
      if (fs.existsSync(DB_FILE)) {
        fileSizeKb = Math.round(fs.statSync(DB_FILE).size / 1024);
      }
    } catch {}

    return {
      version: db.metadata.version,
      lastUpdated: db.metadata.lastUpdated,
      wgerEndpoint: db.metadata.wgerEndpoint,
      lastWgerSync: db.metadata.lastWgerSync,
      fileSizeKb,
      counts: {
        exercises: db.exercises.length,
        foodLogs: db.food_logs.length,
        workouts: db.workouts.length,
        biometrics: db.biometrics.length,
        bookings: db.bookings.length,
      },
      wallet: db.wallet,
    };
  }
}
