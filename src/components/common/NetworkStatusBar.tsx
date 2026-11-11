import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, Plane, RefreshCw, CheckCircle2, Database } from 'lucide-react';
import { syncService } from '../../services/syncService';

interface NetworkStatusBarProps {
  onSyncCompleted?: () => void;
}

export const NetworkStatusBar: React.FC<NetworkStatusBarProps> = ({ onSyncCompleted }) => {
  const [networkState, setNetworkState] = useState({
    isOnline: true,
    isActuallyOnline: true,
    isSimulatedOffline: false,
    isServerReachable: true,
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

  const handleToggleSimulation = () => {
    const isSimulating = syncService.toggleSimulation();
    if (isSimulating) {
      setSyncFeedback('Simulation Active: MindTrace is now logically disconnected from cloud.');
    } else {
      setSyncFeedback('Simulation Disabled: Cloud connectivity restored.');
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

  // Determine granular status label and color
  const getConnectivityStatus = () => {
    if (networkState.isSimulatedOffline) {
      return {
        label: 'SIMULATED OFFLINE',
        color: 'text-amber-300 bg-amber-950/60 border-amber-800/50',
        icon: <Plane className="w-3.5 h-3.5 rotate-45" />,
      };
    }
    if (!networkState.isActuallyOnline) {
      return {
        label: 'Offline · Working locally',
        color: 'text-rose-300 bg-rose-950/40 border-rose-800/40',
        icon: <WifiOff className="w-3.5 h-3.5" />,
      };
    }
    if (!networkState.isServerReachable) {
      return {
        label: 'Internet available · Server unreachable',
        color: 'text-amber-300 bg-amber-950/40 border-amber-800/40',
        icon: <Wifi className="w-3.5 h-3.5 opacity-50" />,
      };
    }
    if (isSyncing) {
      return {
        label: 'Syncing…',
        color: 'text-indigo-300 bg-indigo-950/40 border-indigo-800/40',
        icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" />,
      };
    }
    return {
      label: 'Connected · Sync ready',
      color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
      icon: <Wifi className="w-3.5 h-3.5" />,
    };
  };

  const status = getConnectivityStatus();

  return (
    <div className="w-full bg-slate-900/90 border-b border-slate-800/80 px-4 py-1.5 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Connectivity indicator & Mode info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border font-medium ${status.color}`}>
              {status.icon}
              <span>{status.label}</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-400">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span
              className={`font-mono font-medium ${
                networkState.pendingCount > 0 ? 'text-amber-400' : 'text-slate-300'
              }`}
            >
              {networkState.pendingCount > 0 
                ? `Pending sync: ${networkState.pendingCount} record${networkState.pendingCount !== 1 ? 's' : ''}`
                : 'All synced'}
            </span>
          </div>

          {syncFeedback && (
            <span className="hidden md:inline-flex items-center gap-1 text-indigo-300 text-[11px] animate-fade-in">
              <CheckCircle2 className="w-3 h-3 text-indigo-400" />
              <span>{syncFeedback}</span>
            </span>
          )}
        </div>

        {/* Right: Simulation Toggle & Manual Sync */}
        <div className="flex items-center gap-2">
          {networkState.pendingCount > 0 && networkState.isServerReachable && !networkState.isSimulatedOffline && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium text-[11px] transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Retry Sync</span>
            </button>
          )}

          {/* Simulated Offline Mode Toggle */}
          <button
            onClick={handleToggleSimulation}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-medium transition cursor-pointer ${
              networkState.isSimulatedOffline
                ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-900/20'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
            title="Toggle Simulated Offline Mode to test local-only diagnostics"
          >
            <Plane
              className={`w-3.5 h-3.5 ${networkState.isSimulatedOffline ? 'rotate-45' : ''}`}
            />
            <span>
              {networkState.isSimulatedOffline ? 'Exit Offline Simulation' : 'Simulate Offline Mode'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
