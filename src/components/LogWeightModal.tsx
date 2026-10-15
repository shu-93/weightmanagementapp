import React, { useState } from 'react';
import { X, Scale, Sparkles, CheckCircle2 } from 'lucide-react';
import { DeviceSyncStatus } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  deviceStatus: DeviceSyncStatus;
  onUpdateWeight: (newWeight: number, newBf: number, newMuscle: number) => void;
}

export const LogWeightModal: React.FC<Props> = ({
  isOpen,
  onClose,
  deviceStatus,
  onUpdateWeight,
}) => {
  const [weight, setWeight] = useState(deviceStatus.inBodyScale.weightKg.toString());
  const [bodyFat, setBodyFat] = useState(deviceStatus.inBodyScale.bodyFatPercent.toString());
  const [muscle, setMuscle] = useState(deviceStatus.inBodyScale.skeletalMuscleKg.toString());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedNotice, setSyncedNotice] = useState(false);

  if (!isOpen) return null;

  const handleManualSave = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight) || deviceStatus.inBodyScale.weightKg;
    const bf = parseFloat(bodyFat) || deviceStatus.inBodyScale.bodyFatPercent;
    const m = parseFloat(muscle) || deviceStatus.inBodyScale.skeletalMuscleKg;
    onUpdateWeight(w, bf, m);
    onClose();
  };

  const handleSimulateInBodySync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      // Simulate real Bluetooth / Cloud InBody sync
      const simulatedWeight = 73.5;
      const simulatedBf = 18.1;
      const simulatedMuscle = 34.4;
      setWeight(simulatedWeight.toString());
      setBodyFat(simulatedBf.toString());
      setMuscle(simulatedMuscle.toString());
      onUpdateWeight(simulatedWeight, simulatedBf, simulatedMuscle);
      setIsSyncing(false);
      setSyncedNotice(true);
      setTimeout(() => setSyncedNotice(false), 2500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden text-slate-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-white">InBody & Smart Scale Sync</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* InBody Scale Sync Trigger */}
          <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">InBody Dial / BIA Scale</p>
              <p className="text-[11px] text-slate-400">Bluetooth paired · Last scan: Today 07:30 AM</p>
            </div>
            <button
              onClick={handleSimulateInBodySync}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSyncing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-Sync Scale
                </>
              )}
            </button>
          </div>

          {syncedNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>InBody biometrics synced successfully! (73.5 kg, 18.1% body fat)</span>
            </div>
          )}

          <form onSubmit={handleManualSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Weight (kg)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="e.g. 73.8"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400">kg</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Body Fat % (InBody)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="e.g. 18.4"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Skeletal Muscle (kg)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={muscle}
                    onChange={(e) => setMuscle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="e.g. 34.2"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">kg</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-md"
              >
                Save Biometrics
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
