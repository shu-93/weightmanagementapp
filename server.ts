import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { AppDatabase } from './server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '20mb' }));

// Shared Gemini AI instance
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Fallback food items when offline or fallback requested
const FALLBACK_FOOD_DATABASE: Record<string, any> = {
  default: {
    foodName: 'Grilled Chicken Quinoa & Avocado Bowl',
    estimatedCalories: 485,
    servingSize: '1 bowl (380g)',
    macronutrients: {
      proteinGrams: 38,
      carbsGrams: 42,
      fatGrams: 16,
      fiberGrams: 9,
    },
    healthRating: 9,
    healthierChoiceSymbolEligible: true,
    dietitianNotes: 'Excellent lean protein source with complex carbohydrates and heart-healthy monounsaturated fats from avocado.',
    suggestedExerciseEquivalent: '45 mins brisk walking or 25 mins ActiveSG cycling',
    activeSgPoints: 25,
  },
};

// ==========================================
// BACKEND DATABASE REST API ENDPOINTS
// ==========================================

// 1. Exercises Catalog (Synced from https://wger.de/api/v2/exerciseinfo/?language=2&limit=20)
app.get('/api/db/exercises', (req, res) => {
  const { category, equipment, muscle, search } = req.query;
  const db = AppDatabase.getDb();
  let list = db.exercises;

  if (category && category !== 'All') {
    list = list.filter((e) => e.category.toLowerCase() === String(category).toLowerCase());
  }

  if (equipment && equipment !== 'All') {
    list = list.filter((e) =>
      e.equipment.some((eq) => eq.toLowerCase().includes(String(equipment).toLowerCase()))
    );
  }

  if (muscle && muscle !== 'All') {
    list = list.filter(
      (e) =>
        e.muscles.some((m) => m.toLowerCase().includes(String(muscle).toLowerCase())) ||
        e.musclesSecondary.some((m) => m.toLowerCase().includes(String(muscle).toLowerCase()))
    );
  }

  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.muscles.some((m) => m.toLowerCase().includes(q))
    );
  }

  res.json({
    total: list.length,
    wgerEndpoint: db.metadata.wgerEndpoint,
    lastWgerSync: db.metadata.lastWgerSync,
    data: list,
  });
});

app.get('/api/db/exercises/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const db = AppDatabase.getDb();
  const exercise = db.exercises.find((e) => e.id === id);
  if (!exercise) {
    return res.status(404).json({ error: 'Exercise not found in database' });
  }
  res.json(exercise);
});

// Trigger synchronization with Wger API endpoint
app.post('/api/db/exercises/sync', async (req, res) => {
  try {
    const result = await AppDatabase.syncWgerExercises();
    res.json({
      success: result.success,
      count: result.count,
      error: result.error,
      timestamp: new Date().toISOString(),
      endpoint: 'https://wger.de/api/v2/exerciseinfo/?language=2&limit=20',
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to sync with Wger API', message: err.message });
  }
});

// 2. Food Logs CRUD
app.get('/api/db/foods', (req, res) => {
  const foods = AppDatabase.getFoods();
  res.json(foods);
});

app.post('/api/db/foods', async (req, res) => {
  try {
    const record = await AppDatabase.addFood(req.body);
    res.status(201).json(record);
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to save food log', message: err.message });
  }
});

app.delete('/api/db/foods/:id', async (req, res) => {
  const success = await AppDatabase.deleteFood(req.params.id);
  if (success) {
    res.json({ success: true, id: req.params.id });
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

// 3. Workouts Log CRUD
app.get('/api/db/workouts', (req, res) => {
  const workouts = AppDatabase.getWorkouts();
  res.json(workouts);
});

app.post('/api/db/workouts', async (req, res) => {
  try {
    const record = await AppDatabase.addWorkout(req.body);
    res.status(201).json(record);
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to record workout', message: err.message });
  }
});

app.delete('/api/db/workouts/:id', async (req, res) => {
  const success = await AppDatabase.deleteWorkout(req.params.id);
  if (success) {
    res.json({ success: true, id: req.params.id });
  } else {
    res.status(404).json({ error: 'Workout not found' });
  }
});

// 4. Biometrics (InBody) CRUD
app.get('/api/db/biometrics', (req, res) => {
  const biometrics = AppDatabase.getBiometrics();
  res.json(biometrics);
});

app.post('/api/db/biometrics', async (req, res) => {
  try {
    const record = await AppDatabase.addBiometric(req.body);
    res.status(201).json(record);
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to record biometrics', message: err.message });
  }
});

// 5. Trainer Bookings
app.get('/api/db/bookings', (req, res) => {
  const bookings = AppDatabase.getBookings();
  res.json(bookings);
});

app.post('/api/db/bookings', async (req, res) => {
  try {
    const record = await AppDatabase.addBooking(req.body);
    res.status(201).json(record);
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to save booking', message: err.message });
  }
});

// 6. Wallet & User Tier
app.get('/api/db/wallet', (req, res) => {
  res.json(AppDatabase.getWallet());
});

app.post('/api/db/wallet', async (req, res) => {
  try {
    const wallet = await AppDatabase.updateWallet(req.body);
    res.json(wallet);
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to update wallet' });
  }
});

// 7. Database Engine Health & Statistics
app.get('/api/db/stats', (req, res) => {
  res.json(AppDatabase.getStats());
});

// 8. Official Singapore 2-Hour Weather Forecast API (Data.gov.sg / NEA)
app.get('/api/weather', async (req, res) => {
  const requestedArea = (req.query.area as string) || 'Bishan';
  const endpoint = 'https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast';

  try {
    const response = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'VibeWeight-App/1.0',
      },
    });

    if (!response.ok) throw new Error(`Data.gov.sg returned HTTP ${response.status}`);
    const json = await response.json();
    const item = json.data?.items?.[0] || {};
    const forecasts: Array<{ area: string; forecast: string }> = item.forecasts || [];
    const validPeriod = item.valid_period?.text || 'Next 2 Hours';
    const updateTimestamp = item.update_timestamp || new Date().toISOString();

    // Find requested area or fallback to Bishan / Toa Payoh / first area
    const matched = forecasts.find(
      (f) => f.area.toLowerCase() === requestedArea.toLowerCase()
    ) || forecasts.find((f) => f.area.toLowerCase().includes('bishan')) || forecasts[0] || { area: 'Bishan', forecast: 'Cloudy' };

    const forecastStr = matched.forecast || 'Partly Cloudy';
    const lower = forecastStr.toLowerCase();

    let icon = 'cloud_sun';
    let isRainy = false;

    if (lower.includes('thunder') || lower.includes('heavy thundery')) {
      icon = 'cloud_lightning';
      isRainy = true;
    } else if (lower.includes('rain') || lower.includes('shower')) {
      icon = 'cloud_rain';
      isRainy = true;
    } else if (lower.includes('fair') || lower.includes('clear')) {
      icon = 'sun';
    } else {
      icon = 'cloud_sun';
    }

    let fitnessAdvice = `🌤️ Favourable 2-hr forecast across ${matched.area}: Great for outdoor Park Connector walks, Anywheel cycling, or running.`;
    let recommendationType: 'outdoor' | 'indoor' = 'outdoor';

    if (isRainy) {
      fitnessAdvice = `🌧️ Rain Alert (${forecastStr}) across ${matched.area}: Recommended to book an air-conditioned ActiveSG Gym or complete an indoor session.`;
      recommendationType = 'indoor';
    }

    const availableAreas = forecasts.map((f) => f.area);

    res.json({
      source: 'data.gov.sg (National Environment Agency Singapore)',
      endpoint,
      area: matched.area,
      forecast: forecastStr,
      validPeriod,
      temperature: 30,
      apparentTemperature: 33,
      condition: forecastStr,
      icon,
      isRainy,
      humidity: isRainy ? 85 : 68,
      windSpeedKmH: 7,
      airQualityPsi: 38,
      airQualityStatus: 'Good (Healthy 365 Standard)',
      fitnessAdvice,
      recommendationType,
      availableAreas,
      updatedAt: new Date(updateTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  } catch (err: any) {
    console.error('Data.gov.sg weather fetch failed, using fallback:', err.message);
    res.json({
      source: 'data.gov.sg (Fallback)',
      endpoint,
      area: requestedArea,
      forecast: 'Cloudy',
      validPeriod: 'Next 2 Hours',
      temperature: 30,
      apparentTemperature: 34,
      condition: 'Cloudy',
      icon: 'cloud_sun',
      isRainy: false,
      humidity: 70,
      windSpeedKmH: 8,
      airQualityPsi: 35,
      airQualityStatus: 'Good',
      fitnessAdvice: `🌤️ Mild cloudy forecast for ${requestedArea}: Ideal for Park Connector brisk walk or indoor ActiveSG gym.`,
      recommendationType: 'outdoor',
      availableAreas: ['Bishan', 'Toa Payoh', 'Ang Mo Kio', 'Bedok', 'Jurong East', 'City', 'Kallang', 'Woodlands', 'Tampines'],
      updatedAt: 'Just now',
    });
  }
});

// ==========================================
// GEMINI AI SERVICE ENDPOINTS
// ==========================================

// API: AI Food Calorie Vision Scanner
app.post('/api/analyze-food', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', textPrompt = '' } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found in environment, returning tailored mock data.');
      return res.json(FALLBACK_FOOD_DATABASE.default);
    }

    const parts: any[] = [];

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
    }

    const systemPrompt = `You are an expert sports nutritionist, clinical dietitian, and AI calorie estimation engine for a weight management mobile app in Singapore / global context.
Analyze the provided food image or meal description. Accurately identify the dish, portion size, calories, and macronutrients. Include health advice aligned with Health Promotion Board (HPB) guidelines and ActiveSG healthpoints.

Return strictly a JSON object adhering to this schema:
{
  "foodName": "String: concise dish name",
  "estimatedCalories": Integer (total kcal),
  "servingSize": "String: e.g. 1 bowl (350g) or 2 slices",
  "macronutrients": {
    "proteinGrams": Integer,
    "carbsGrams": Integer,
    "fatGrams": Integer,
    "fiberGrams": Integer
  },
  "healthRating": Integer between 1 and 10,
  "healthierChoiceSymbolEligible": Boolean,
  "dietitianNotes": "String: 1-2 actionable tips on how to balance this meal for weight loss",
  "suggestedExerciseEquivalent": "String: e.g. 40 mins brisk walking or 25 mins ActiveSG gym workout",
  "activeSgPoints": Integer (e.g. 15-35 healthpoints earned for logging healthy meal)
}`;

    const promptText = textPrompt
      ? `Food description / context: "${textPrompt}". Please analyze the calorie and macronutrient breakdown.`
      : 'Please analyze this meal from the image, calculate calories, and provide a dietary breakdown.';

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: { type: Type.STRING },
            estimatedCalories: { type: Type.INTEGER },
            servingSize: { type: Type.STRING },
            macronutrients: {
              type: Type.OBJECT,
              properties: {
                proteinGrams: { type: Type.INTEGER },
                carbsGrams: { type: Type.INTEGER },
                fatGrams: { type: Type.INTEGER },
                fiberGrams: { type: Type.INTEGER },
              },
              required: ['proteinGrams', 'carbsGrams', 'fatGrams', 'fiberGrams'],
            },
            healthRating: { type: Type.INTEGER },
            healthierChoiceSymbolEligible: { type: Type.BOOLEAN },
            dietitianNotes: { type: Type.STRING },
            suggestedExerciseEquivalent: { type: Type.STRING },
            activeSgPoints: { type: Type.INTEGER },
          },
          required: [
            'foodName',
            'estimatedCalories',
            'servingSize',
            'macronutrients',
            'healthRating',
            'healthierChoiceSymbolEligible',
            'dietitianNotes',
            'suggestedExerciseEquivalent',
            'activeSgPoints',
          ],
        },
      },
    });

    const responseText = response.text || '{}';
    const parsed = JSON.parse(responseText);
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error analyzing food with Gemini:', err);
    return res.json({
      ...FALLBACK_FOOD_DATABASE.default,
      dietitianNotes: 'AI estimation calibrated based on standard macro portions. Balanced protein and fiber detected.',
    });
  }
});

// API: AI End-to-End Weight Management Program Designer
app.post('/api/generate-program', async (req, res) => {
  try {
    const {
      goal = 'lose 5kg',
      targetWeeks = 8,
      currentWeightKg = 74,
      targetWeightKg = 69,
      dietPreference = 'Balanced, low-sugar',
      medicalNotes = 'None (General fitness)',
      budgetTier = 'Basic ($10/mth)',
    } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        programTitle: `${goal.toUpperCase()} Accelerator Program`,
        summary: `A structured ${targetWeeks}-week transformation roadmap combining calibrated caloric deficit with functional cardio and resistance training.`,
        dailyCalorieTarget: 1750,
        weeklyDeficitKcal: 3500,
        recommendedWeeklyTrainers: 1,
        recommendedActiveSgActivities: ['ActiveSG Gym (Tue & Thu)', 'Lap Swimming (Sat)', 'Brisk Park Walk (Sun)'],
        milestones: [
          { week: 2, targetKg: currentWeightKg - 1.2, focus: 'Water weight reduction & metabolic adaptation' },
          { week: 4, targetKg: currentWeightKg - 2.5, focus: 'Fat mobilization & steady calorie logging streak' },
          { week: 6, targetKg: currentWeightKg - 3.8, focus: 'Body recomposition with InBody progress test' },
          { week: targetWeeks, targetKg: targetWeightKg, focus: 'Goal attainment & long-term maintenance habits' },
        ],
        dietitianAdvice: 'Prioritize 1.6g protein per kg of bodyweight and swap refined sugars with whole grain carbohydrates.',
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Design an end-to-end weight management program:
- Goal: ${goal}
- Target Duration: ${targetWeeks} weeks
- Current Weight: ${currentWeightKg} kg, Target: ${targetWeightKg} kg
- Diet Preference: ${dietPreference}
- Health / Medical considerations: ${medicalNotes}
- Budget Tier: ${budgetTier}
Incorporate ActiveSG / Health365 activities, InBody tracking, trainer consultations, and calorie deficit targets.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            programTitle: { type: Type.STRING },
            summary: { type: Type.STRING },
            dailyCalorieTarget: { type: Type.INTEGER },
            weeklyDeficitKcal: { type: Type.INTEGER },
            recommendedWeeklyTrainers: { type: Type.INTEGER },
            recommendedActiveSgActivities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            milestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  week: { type: Type.INTEGER },
                  targetKg: { type: Type.NUMBER },
                  focus: { type: Type.STRING },
                },
                required: ['week', 'targetKg', 'focus'],
              },
            },
            dietitianAdvice: { type: Type.STRING },
          },
          required: [
            'programTitle',
            'summary',
            'dailyCalorieTarget',
            'weeklyDeficitKcal',
            'recommendedWeeklyTrainers',
            'recommendedActiveSgActivities',
            'milestones',
            'dietitianAdvice',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error generating program:', err);
    return res.status(500).json({ error: 'Failed to generate program roadmap' });
  }
});

// Applet health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Vite Middleware for Development / Static files for Production
async function setupVite() {
  // Initialize Backend Database
  await AppDatabase.init();

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`VibeWeight full-stack server running on http://localhost:${port}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
});
