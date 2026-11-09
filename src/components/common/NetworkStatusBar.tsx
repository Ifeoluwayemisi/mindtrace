import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, Plane, RefreshCw, CheckCircle2, Database } from 'lucide-react';
import { syncService } from '../../services/syncService';

interface NetworkStatusBarProps {
  onSyncCompleted?: () => void;
}

export const NetworkStatusBar: React.FC<NetworkStatusBarProps> = ({ onSyncCompleted }) => {
  const [networkState, setNetworkState] = useState({
    isOnline: true,
    isSimulatedOffline: false,
    pendingCount: 0,
    lastSyncedAt: null as string | null,
    lastPayloadSizeKb: 0,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = syncService.subscribe((state) => {
      setNetworkState(state);
    });
    return unsubscribe;
  }, []);

  const handleToggleAirplaneMode = () => {
    const isOffline = syncService.toggleSimulatedAirplaneMode();
    if (isOffline) {
      setSyncFeedback('Airplane Mode enabled: 100% offline edge rule engine active.');
    } else {
      setSyncFeedback('Online restored: Triggering micro-sync...');
      setTimeout(() => setSyncFeedback(null), 3000);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncFeedback('Connecting to cloud endpoint...');
    const result = await syncService.triggerAutoSync();
    setIsSyncing(false);
    setSyncFeedback(result.message);
    if (result.success && onSyncCompleted) {
      onSyncCompleted();
    }
    setTimeout(() => {
      setSyncFeedback(null);
    }, 4000);
  };

  const isActuallyOffline = !networkState.isOnline;

  return (
    <div className="w-full bg-slate-900/90 border-b border-slate-800/80 px-4 py-1.5 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Connectivity indicator & Mode info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isActuallyOffline ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-amber-300 bg-amber-950/60 border border-amber-800/50 font-medium">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Zero-Bandwidth Mode (100% Offline)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 font-medium">
                <Wifi className="w-3.5 h-3.5" />
                <span>Connected (Ready for Micro-Sync)</span>
              </span>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-400">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>IndexedDB Queue:</span>
            <span
              className={`font-mono font-medium ${
                networkState.pendingCount > 0 ? 'text-amber-400' : 'text-slate-300'
              }`}
            >
              {networkState.pendingCount} record{networkState.pendingCount !== 1 ? 's' : ''}
            </span>
          </div>

          {syncFeedback && (
            <span className="hidden md:inline-flex items-center gap-1 text-indigo-300 text-[11px] animate-fade-in">
              <CheckCircle2 className="w-3 h-3 text-indigo-400" />
              <span>{syncFeedback}</span>
            </span>
          )}
        </div>

        {/* Right: Airplane Mode Judge Simulator & Manual Sync */}
        <div className="flex items-center gap-2">
          {networkState.pendingCount > 0 && !isActuallyOffline && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium text-[11px] transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync Batch (&lt;15KB)</span>
            </button>
          )}

          {/* Airplane Mode Toggle Button for Hackathon Judging */}
          <button
            onClick={handleToggleAirplaneMode}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-medium transition cursor-pointer ${
              networkState.isSimulatedOffline
                ? 'bg-amber-500/20 text-amber-200 border-amber-500/50 hover:bg-amber-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
            title="Toggle Airplane Mode to test 100% offline edge rule diagnostics"
          >
            <Plane
              className={`w-3.5 h-3.5 ${networkState.isSimulatedOffline ? 'rotate-45 text-amber-400' : ''}`}
            />
            <span>
              {networkState.isSimulatedOffline ? 'Disable Airplane Mode' : 'Test Airplane Mode'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
