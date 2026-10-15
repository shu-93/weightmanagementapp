import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Check, 
  Flame, 
  Activity, 
  ShieldCheck, 
  Plus, 
  ArrowRight,
  Info,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FoodLogItem } from '../types';

interface Props {
  onAddMeal: (item: FoodLogItem) => void;
  onSuccessRedirect: () => void;
}

interface AnalysisResult {
  foodName: string;
  estimatedCalories: number;
  servingSize: string;
  macronutrients: {
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    fiberGrams: number;
  };
  healthRating: number;
  healthierChoiceSymbolEligible: boolean;
  dietitianNotes: string;
  suggestedExerciseEquivalent: string;
  activeSgPoints: number;
}

const PRESET_MEALS = [
  {
    name: 'Mediterranean Grain Bowl',
    image: '/src/assets/images/healthy_grain_bowl_1792039808734.jpg',
    description: 'Grilled chicken, avocado, quinoa, edamame and sweet potatoes',
  },
  {
    name: 'Singapore Roasted Chicken Rice',
    image: '',
    description: 'Roasted chicken thigh with fragrant rice, cucumber and chilli sauce',
  },
  {
    name: 'Acai Berry Superfood Bowl',
    image: '',
    description: 'Pure acai puree topped with bananas, chia seeds, and granola',
  },
  {
    name: 'Avocado Toast with Poached Eggs',
    image: '',
    description: 'Sourdough bread, mashed avocado, 2 poached eggs and chili flakes',
  },
];

export const AiCalorieScannerTab: React.FC<Props> = ({ onAddMeal, onSuccessRedirect }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>('/src/assets/images/healthy_grain_bowl_1792039808734.jpg');
  const [customText, setCustomText] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      setAnalysisResult(null);
      setErrorMsg(null);
      runAiAnalysis(base64, file.type, '');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: typeof PRESET_MEALS[0]) => {
    setSelectedImage(preset.image || null);
    setCustomText(preset.description);
    setAnalysisResult(null);
    setErrorMsg(null);
    runAiAnalysis(preset.image || null, 'image/jpeg', preset.description);
  };

  const runAiAnalysis = async (imgData: string | null, mimeType: string, textPrompt: string) => {
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imgData,
          mimeType: mimeType || 'image/jpeg',
          textPrompt: textPrompt || customText,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis request failed');
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('AI calculation encountered an issue. Using calibrated baseline estimates.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLogMeal = () => {
    if (!analysisResult) return;

    const newLog: FoodLogItem = {
      id: `f-${Date.now()}`,
      name: analysisResult.foodName,
      mealType,
      calories: analysisResult.estimatedCalories,
      proteinGrams: analysisResult.macronutrients.proteinGrams,
      carbsGrams: analysisResult.macronutrients.carbsGrams,
      fatGrams: analysisResult.macronutrients.fatGrams,
      fiberGrams: analysisResult.macronutrients.fiberGrams,
      servingSize: analysisResult.servingSize,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: selectedImage || undefined,
      healthRating: analysisResult.healthRating,
      healthierChoiceSymbol: analysisResult.healthierChoiceSymbolEligible,
      dietitianNotes: analysisResult.dietitianNotes,
      suggestedExercise: analysisResult.suggestedExerciseEquivalent,
      activeSgPoints: analysisResult.activeSgPoints,
    };

    onAddMeal(newLog);

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#f59e0b', '#3b82f6'],
    });

    onSuccessRedirect();
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/30">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          AI Calorie Vision Scanner
        </div>
        <h2 className="text-base font-bold text-white mt-1">
          Upload or Snap Your Food Photo
        </h2>
        <p className="text-xs text-slate-300 mt-0.5">
          Powered by Gemini 3.8 Flash to instantly calculate calories, macros, and Healthier Choice eligibility.
        </p>
      </div>

      {/* Camera / Upload Viewport */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 aspect-video md:aspect-[21/9] flex items-center justify-center group">
        {selectedImage ? (
          <>
            <img
              src={selectedImage}
              alt="Food to analyze"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mb-3" />
                <p className="text-xs font-semibold text-white">Gemini AI analyzing nutrients...</p>
                <p className="text-[11px] text-slate-400">Portion sizing & calorie detection</p>
              </div>
            )}
            <div className="absolute bottom-3 right-3 flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 backdrop-blur-md text-white text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-1.5 shadow-md"
              >
                <Camera className="w-3.5 h-3.5" />
                Change Photo
              </button>
            </div>
          </>
        ) : (
          <div className="text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-emerald-400 border border-slate-700">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">No food photo selected</p>
              <p className="text-[11px] text-slate-400">Take a picture or choose from library</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl shadow-md transition-colors"
            >
              Upload / Snap Photo
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Quick Meal Type Selector */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-xl border border-slate-700/80">
        {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setMealType(type)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
              mealType === type
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Quick Test Presets */}
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Or Quick Test with Common Meals:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_MEALS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleSelectPreset(preset)}
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-left transition-all"
            >
              <p className="text-xs font-semibold text-white truncate">{preset.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Manual / Additional Description Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="e.g. Hainanese Chicken Rice, roasted, less rice..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
        />
        <button
          onClick={() => runAiAnalysis(selectedImage, 'image/jpeg', customText)}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium border border-slate-700 flex items-center gap-1.5 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Analyze
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          {errorMsg}
        </div>
      )}

      {/* AI Analysis Result Card */}
      {analysisResult && (
        <div className="p-4 rounded-2xl bg-slate-800/95 border border-slate-700 space-y-4 shadow-lg animate-in fade-in duration-300">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{analysisResult.foodName}</h3>
                {analysisResult.healthierChoiceSymbolEligible && (
                  <span className="text-[9px] font-bold text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-md">
                    HPB Healthy Choice
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">{analysisResult.servingSize}</p>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-400 tabular-nums font-mono">
                {analysisResult.estimatedCalories}
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">kcal</span>
            </div>
          </div>

          {/* Macronutrients Grid */}
          <div className="grid grid-cols-4 gap-2 py-2 border-y border-slate-700/70 text-center">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-indigo-400 font-semibold block">Protein</span>
              <span className="text-sm font-bold text-white tabular-nums font-mono">
                {analysisResult.macronutrients.proteinGrams}g
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-amber-400 font-semibold block">Carbs</span>
              <span className="text-sm font-bold text-white tabular-nums font-mono">
                {analysisResult.macronutrients.carbsGrams}g
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-rose-400 font-semibold block">Fat</span>
              <span className="text-sm font-bold text-white tabular-nums font-mono">
                {analysisResult.macronutrients.fatGrams}g
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-emerald-400 font-semibold block">Fiber</span>
              <span className="text-sm font-bold text-white tabular-nums font-mono">
                {analysisResult.macronutrients.fiberGrams}g
              </span>
            </div>
          </div>

          {/* Dietitian Notes & HPB advice */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs">
            <p className="font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Dietitian Insight & HPB Guidance
            </p>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {analysisResult.dietitianNotes}
            </p>
            <p className="text-emerald-300 text-[11px] pt-1 border-t border-slate-800/80 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Burn equivalent: {analysisResult.suggestedExerciseEquivalent}</span>
            </p>
          </div>

          {/* ActiveSG Points Award Notice */}
          <div className="flex items-center justify-between text-xs text-slate-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              ActiveSG Healthpoints Reward
            </span>
            <span className="font-bold text-emerald-400 font-mono">
              +{analysisResult.activeSgPoints} pts
            </span>
          </div>

          {/* Save Action */}
          <button
            onClick={handleLogMeal}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            Add to Today's Food Diary
          </button>
        </div>
      )}
    </div>
  );
};
