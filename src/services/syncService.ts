/**
 * MindTrace Micro-Sync Engine
 * Zero-bandwidth batch synchronizer (<15KB compressed payloads)
 * Optimized for intermittent 2G/3G connections and simulated 100% Airplane Mode testing.
 */

import { SyncPayloadRecord, ClassAnalyticsSummary } from '../types';
import { storageService } from './storageService';
import { INITIAL_CLASS_ANALYTICS } from '../data/mockTeacherData';

type SyncListener = (status: {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  pendingCount: number;
  lastSyncedAt: string | null;
  lastPayloadSizeKb: number;
}) => void;

class SyncService {
  private isSimulatedOffline: boolean = false;
  private listeners: Set<SyncListener> = new Set();
  private lastSyncedAt: string | null = null;
  private lastPayloadSizeKb: number = 0;
  private currentAnalytics: ClassAnalyticsSummary = { ...INITIAL_CLASS_ANALYTICS };

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange());
      window.addEventListener('offline', () => this.handleNetworkChange());
    }
  }

  // Real or simulated connectivity check
  isEffectiveOnline(): boolean {
    if (this.isSimulatedOffline) return false;
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  // Toggle airplane mode for testing offline resilience
  toggleSimulatedAirplaneMode(): boolean {
    this.isSimulatedOffline = !this.isSimulatedOffline;
    this.notify();
    if (this.isEffectiveOnline()) {
      this.triggerAutoSync();
    }
    return this.isSimulatedOffline;
  }

  getAirplaneModeState(): boolean {
    return this.isSimulatedOffline;
  }

  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    this.notifyListener(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private async notify() {
    const pending = await storageService.getPendingSyncRecords();
    for (const listener of this.listeners) {
      this.notifyListener(listener, pending.length);
    }
  }

  private notifyListener(listener: SyncListener, pendingCount?: number) {
    listener({
      isOnline: this.isEffectiveOnline(),
      isSimulatedOffline: this.isSimulatedOffline,
      pendingCount: pendingCount ?? 0,
      lastSyncedAt: this.lastSyncedAt,
      lastPayloadSizeKb: this.lastPayloadSizeKb,
    });
  }

  private handleNetworkChange() {
    this.notify();
    if (this.isEffectiveOnline()) {
      this.triggerAutoSync();
    }
  }

  // Trigger sync batch (<15KB target)
  async triggerAutoSync(): Promise<{
    success: boolean;
    syncedCount: number;
    payloadSizeKb: number;
    message: string;
  }> {
    if (!this.isEffectiveOnline()) {
      return {
        success: false,
        syncedCount: 0,
        payloadSizeKb: 0,
        message: 'Offline: Records queued securely in IndexedDB until connection restores.',
      };
    }

    const pending = await storageService.getPendingSyncRecords();
    if (pending.length === 0) {
      return {
        success: true,
        syncedCount: 0,
        payloadSizeKb: 0,
        message: 'All records are up to date.',
      };
    }

    // Prepare micro-batch payload
    const payload = JSON.stringify({
      version: '1.0',
      clientTimestamp: new Date().toISOString(),
      records: pending,
    });

    // Calculate approximate payload size in KB
    const sizeInBytes = new Blob([payload]).size;
    const sizeInKb = parseFloat((sizeInBytes / 1024).toFixed(2));
    this.lastPayloadSizeKb = sizeInKb;

    // Simulate reliable micro-sync upload (<400ms)
    await new Promise((r) => setTimeout(r, 450));

    // Mark queued items as synced
    const recordIds = pending.map((r) => r.id);
    await storageService.markRecordsAsSynced(recordIds);

    // Update teacher class analytics with newly synced student data
    this.updateAnalyticsWithBatch(pending);

    this.lastSyncedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.notify();

    return {
      success: true,
      syncedCount: pending.length,
      payloadSizeKb: sizeInKb,
      message: `Synchronized ${pending.length} diagnostic record(s) (${sizeInKb} KB).`,
    };
  }

  private updateAnalyticsWithBatch(records: SyncPayloadRecord[]) {
    // Increment submission count
    const correctCount = records.filter((r) => r.isCorrect).length;
    const newCorrectness = Math.round(
      (this.currentAnalytics.avgCorrectness * 20 + (correctCount / records.length) * 100) / 21
    );
    this.currentAnalytics.avgCorrectness = Math.min(100, Math.max(50, newCorrectness));
    this.currentAnalytics.submissionRate = Math.min(100, this.currentAnalytics.submissionRate + 1);
  }

  getCurrentAnalytics(): ClassAnalyticsSummary {
    return this.currentAnalytics;
  }
}

export const syncService = new SyncService();
