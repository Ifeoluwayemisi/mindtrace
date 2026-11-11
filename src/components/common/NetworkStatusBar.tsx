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

  // Determine granular status label and color tokens
  const getConnectivityStatus = () => {
    if (networkState.isSimulatedOffline) {
      return {
        label: 'SIMULATED OFFLINE',
        color: 'text-[#B27B08] bg-[#FFF9EB] border-[#FCECC2]',
        icon: <Plane className="w-3.5 h-3.5 rotate-45" />,
      };
    }
    if (!networkState.isActuallyOnline) {
      return {
        label: 'Offline · Working locally',
        color: 'text-[#D64D31] bg-[#FFF1EE] border-[#FDDDD7]',
        icon: <WifiOff className="w-3.5 h-3.5" />,
      };
    }
    if (!networkState.isServerReachable) {
      return {
        label: 'Internet available · Server unreachable',
        color: 'text-[#B27B08] bg-[#FFF9EB] border-[#FCECC2]',
        icon: <Wifi className="w-3.5 h-3.5 opacity-60" />,
      };
    }
    if (isSyncing) {
      return {
        label: 'Syncing…',
        color: 'text-[#5140CA] bg-[#F3F1FF] border-[#E4E0FD]',
        icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" />,
      };
    }
    return {
      label: 'Connected · Sync ready',
      color: 'text-[#1B886B] bg-[#E8F8F4] border-[#CEEFE6]',
      icon: <Wifi className="w-3.5 h-3.5" />,
    };
  };

  const status = getConnectivityStatus();

  return (
    <div className="w-full bg-white/95 border-b border-[#E9EAF3] px-4 py-2 text-xs transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Connectivity indicator & Mode info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[11px] font-semibold ${status.color}`}>
              {status.icon}
              <span>{status.label}</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[#74788E]">
            <Database className="w-3.5 h-3.5 text-[#6755E8]" />
            <span
              className={`font-mono text-[11px] font-medium ${
                networkState.pendingCount > 0 ? 'text-[#B27B08] font-bold' : 'text-[#4A4D68]'
              }`}
            >
              {networkState.pendingCount > 0 
                ? `Pending sync: ${networkState.pendingCount} record${networkState.pendingCount !== 1 ? 's' : ''}`
                : 'All synced'}
            </span>
          </div>

          {syncFeedback && (
            <span className="hidden md:inline-flex items-center gap-1 text-[#5140CA] font-medium text-[11px] animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#6755E8]" />
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
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#6755E8] hover:bg-[#5140CA] text-white font-medium text-[11px] shadow-sm shadow-[#6755E8]/20 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Retry Sync</span>
            </button>
          )}

          {/* Simulated Offline Mode Toggle */}
          <button
            onClick={handleToggleSimulation}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
              networkState.isSimulatedOffline
                ? 'bg-[#FFC85A] text-[#252641] border-[#FCECC2] shadow-sm'
                : 'bg-[#F5F6FC] text-[#252641] border-[#E9EAF3] hover:bg-[#F3F1FF] hover:border-[#6755E8]/40 hover:text-[#5140CA]'
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
