import React, { useState } from 'react';
import { 
  Home, 
  Camera, 
  Calendar, 
  Users, 
  Gift, 
  Smartphone, 
  Monitor, 
  FileText, 
  Wifi, 
  BatteryMedium, 
  Signal, 
  Sparkles,
  Flame,
  Award,
  Database
} from 'lucide-react';

interface Props {
  activeTab: 'today' | 'ai_scan' | 'programs' | 'trainers' | 'rewards';
  onTabChange: (tab: 'today' | 'ai_scan' | 'programs' | 'trainers' | 'rewards') => void;
  onOpenBmc: () => void;
  onOpenDbInspector: () => void;
  streakDays: number;
  healthpointsBalance: number;
  children: React.ReactNode;
}

export const MobileShell: React.FC<Props> = ({
  activeTab,
  onTabChange,
  onOpenBmc,
  onOpenDbInspector,
  streakDays,
  healthpointsBalance,
  children,
}) => {
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(true);

  const navItems = [
    { id: 'today', label: 'Today', icon: Home },
    { id: 'ai_scan', label: 'AI Lens', icon: Camera, highlight: true },
    { id: 'programs', label: 'Programs', icon: Calendar },
    { id: 'trainers', label: 'Trainers', icon: Users },
    { id: 'rewards', label: 'Rewards', icon: Gift },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center">
      {/* Top Desktop Controls Bar */}
      <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 z-40 sticky top-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm">
              VW
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight leading-none">
                VibeWeight Mobile
              </h1>
              <p className="text-[10px] text-slate-400 mt-0.5">
                SMU Vibe Coding Business Model Canvas Prototype
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenDbInspector}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all shadow-sm"
              title="Inspect backend database and Wger API sync"
            >
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span>DB Console</span>
            </button>

            <button
              onClick={onOpenBmc}
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>BMC Blueprint</span>
            </button>

            <div className="hidden sm:flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setDeviceFrameMode(true)}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                  deviceFrameMode ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Phone Device Frame"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium hidden md:inline">Phone Frame</span>
              </button>
              <button
                onClick={() => setDeviceFrameMode(false)}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                  !deviceFrameMode ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Expanded Responsive View"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium hidden md:inline">Expanded</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full flex-1 flex justify-center py-4 px-2 sm:px-4">
        <div
          className={`w-full transition-all duration-300 ${
            deviceFrameMode
              ? 'max-w-[420px] rounded-[44px] border-[8px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] bg-slate-900 relative overflow-hidden flex flex-col min-h-[840px] max-h-[92vh]'
              : 'max-w-2xl bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl flex flex-col min-h-[840px]'
          }`}
        >
          {/* Phone Status Bar (in device frame mode) */}
          <div className="px-6 pt-3 pb-2 flex items-center justify-between text-xs text-slate-300 font-medium select-none shrink-0 bg-slate-900">
            <span className="font-semibold text-white tracking-tight">09:41</span>

            {/* Dynamic Island Pill */}
            {deviceFrameMode && (
              <div className="w-24 h-4.5 bg-black rounded-full flex items-center justify-center gap-2 px-2 shadow-inner">
                <div className="w-2 h-2 rounded-full bg-slate-800" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
              </div>
            )}

            <div className="flex items-center gap-1.5 text-slate-400">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <BatteryMedium className="w-3.5 h-3.5 text-slate-200" />
            </div>
          </div>

          {/* App Top Bar */}
          <div className="px-5 py-3 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-900/95 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                VibeWeight
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                ActiveSG & Health365
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onTabChange('today')}
                className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                title={`${streakDays} Day Logging Streak`}
              >
                <Flame className="w-4 h-4 fill-amber-400" />
                <span className="tabular-nums font-mono">{streakDays}</span>
              </button>

              <button
                onClick={() => onTabChange('rewards')}
                className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                title="Healthpoints Balance"
              >
                <Award className="w-4 h-4" />
                <span className="tabular-nums font-mono">{healthpointsBalance}</span>
              </button>
            </div>
          </div>

          {/* Scrollable Viewport Body */}
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20 no-scrollbar">
            {children}
          </div>

          {/* Fixed Bottom Tab Bar */}
          <nav className="absolute bottom-0 left-0 right-0 h-16 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 grid grid-cols-5 items-center z-30 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isHighlight = item.id === 'ai_scan';

              if (isHighlight) {
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className="flex flex-col items-center justify-center -mt-5 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-active:scale-95 transition-transform">
                      <Icon className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 mt-1">
                      {item.label}
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
                    isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  <span className={`text-[10px] mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Home indicator bar (iPhone style) */}
          {deviceFrameMode && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-slate-700/80 rounded-full z-40 pointer-events-none" />
          )}
        </div>
      </main>
    </div>
  );
};
