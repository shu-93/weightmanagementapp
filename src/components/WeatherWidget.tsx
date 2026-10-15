import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  CloudSun, 
  CloudRain, 
  CloudLightning, 
  Wind, 
  Droplets, 
  ShieldCheck, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Dumbbell,
  Clock,
  Sparkles
} from 'lucide-react';
import { api, WeatherData } from '../services/api';

interface Props {
  onOpenWorkouts?: () => void;
}

export const WeatherWidget: React.FC<Props> = ({ onOpenWorkouts }) => {
  const [selectedArea, setSelectedArea] = useState('Bishan');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchWeather = async (areaToFetch?: string) => {
    setIsRefreshing(true);
    try {
      const data = await api.getWeather(areaToFetch || selectedArea);
      setWeather(data);
    } catch (err) {
      console.error('Failed to load Singapore 2-hr forecast:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedArea);
  }, [selectedArea]);

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'sun':
        return <Sun className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'cloud_rain':
        return <CloudRain className="w-5 h-5 text-sky-400 shrink-0" />;
      case 'cloud_lightning':
        return <CloudLightning className="w-5 h-5 text-amber-300 shrink-0" />;
      case 'cloud_sun':
      default:
        return <CloudSun className="w-5 h-5 text-amber-400 shrink-0" />;
    }
  };

  if (loading && !weather) {
    return (
      <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs text-slate-400 animate-pulse">
        <div className="flex items-center gap-2">
          <CloudSun className="w-4 h-4 text-slate-500" />
          <span>Connecting to Data.gov.sg 2-hour forecast...</span>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="rounded-2xl bg-gradient-to-r from-slate-800/90 via-slate-800/95 to-slate-800/90 border border-slate-700 shadow-sm overflow-hidden transition-all">
      {/* Compact Main Bar */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-750/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0">
            {renderIcon(weather.icon)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">
                {weather.area}: {weather.forecast}
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded font-medium">
                NEA 2-Hr
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-300 mt-0.5">
              <span className="text-emerald-400 font-medium">
                {weather.recommendationType === 'outdoor' ? 'Outdoor Cardio Ready' : 'Indoor Gym Advised'}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-[10px] text-slate-400">{weather.validPeriod}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              fetchWeather();
            }}
            disabled={isRefreshing}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
            title="Refresh Singapore 2-Hour Forecast"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <div className="text-slate-400">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Forecast Panel with Singapore Area Selector */}
      {expanded && (
        <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-700/60 space-y-3 bg-slate-900/60 text-xs animate-in fade-in duration-150">
          {/* Area Selector */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Select Singapore Area / ActiveSG Hub
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
            >
              {weather.availableAreas?.map((area) => (
                <option key={area} value={area}>
                  {area} (NEA 2-Hr Forecast)
                </option>
              ))}
            </select>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            {weather.fitnessAdvice}
          </p>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-sky-400 mx-auto mb-1" />
              <span className="text-[10px] text-slate-400 block">Forecast Window</span>
              <span className="text-[11px] font-bold text-white">{weather.validPeriod}</span>
            </div>

            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <Wind className="w-3.5 h-3.5 text-teal-400 mx-auto mb-1" />
              <span className="text-[10px] text-slate-400 block">Condition</span>
              <span className="text-[11px] font-bold text-white truncate">{weather.forecast}</span>
            </div>

            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-1" />
              <span className="text-[10px] text-slate-400 block">Air Quality</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">PSI {weather.airQualityPsi}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" /> Source: data.gov.sg (NEA) · Updated {weather.updatedAt}
            </span>

            {onOpenWorkouts && (
              <button
                onClick={onOpenWorkouts}
                className="px-2.5 py-1 bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-slate-950 font-semibold text-[10px] rounded-lg transition-colors flex items-center gap-1"
              >
                <Dumbbell className="w-3 h-3" />
                {weather.recommendationType === 'indoor' ? 'Indoor Gym Workouts' : 'Outdoor PCN Cardio'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
