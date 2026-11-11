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
        color: 'text-[#92400E] bg-[#FEF3C7] border-[#FDE68A]',
        icon: <Plane className="w-3.5 h-3.5 rotate-45" />,
      };
    }
    if (!networkState.isActuallyOnline) {
      return {
        label: 'Offline · Local IndexedDB Mode',
        color: 'text-[#334155] bg-[#F1F5F9] border-[#CBD5E1]',
        icon: <WifiOff className="w-3.5 h-3.5 text-[#64748B]" />,
      };
    }
    if (!networkState.isServerReachable) {
      return {
        label: 'Internet available · Server unreachable',
        color: 'text-[#92400E] bg-[#FEF3C7] border-[#FDE68A]',
        icon: <Wifi className="w-3.5 h-3.5 opacity-60" />,
      };
    }
    if (isSyncing) {
      return {
        label: 'Syncing…',
        color: 'text-[#1D4ED8] bg-[#EFF6FF] border-[#BFDBFE]',
        icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" />,
      };
    }
    return {
      label: 'Connected · Sync ready',
      color: 'text-[#065F46] bg-[#D1FAE5] border-[#A7F3D0]',
      icon: <Wifi className="w-3.5 h-3.5 text-[#059669]" />,
    };
  };

  const status = getConnectivityStatus();

  return (
    <div className="w-full bg-white/95 border-b border-[#E2E8F0] px-4 py-2 text-xs transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Connectivity indicator & Mode info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[11px] font-semibold ${status.color}`}>
              {status.icon}
              <span>{status.label}</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[#475569]">
            <Database className="w-3.5 h-3.5 text-[#2563EB]" />
            <span
              className={`font-mono text-[11px] font-medium ${
                networkState.pendingCount > 0 ? 'text-[#92400E] font-bold' : 'text-[#475569]'
              }`}
            >
              {networkState.pendingCount > 0 
                ? `Pending sync: ${networkState.pendingCount} record${networkState.pendingCount !== 1 ? 's' : ''}`
                : 'All synced'}
            </span>
          </div>

          {syncFeedback && (
            <span className="hidden md:inline-flex items-center gap-1 text-[#2563EB] font-medium text-[11px] animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />
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
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-[11px] shadow-sm shadow-[#2563EB]/20 transition cursor-pointer disabled:opacity-50"
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
                ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A] shadow-sm'
                : 'bg-[#F1F5F9] text-[#0F172A] border-[#E2E8F0] hover:bg-[#EFF6FF] hover:border-[#2563EB]/40 hover:text-[#2563EB]'
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
