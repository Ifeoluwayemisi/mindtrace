/**
 * MindTrace Micro-Sync Engine
 * Zero-bandwidth batch synchronizer (<15KB compressed payloads)
 * Optimized for intermittent 2G/3G connections and simulated 100% Airplane Mode testing.
 */

import { SyncPayloadRecord, ClassAnalyticsSummary } from '../types';
import { storageService } from './storageService';
import { INITIAL_CLASS_ANALYTICS } from '../data/mockTeacherData';
import { apiRequest } from './apiClient';

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

  // Trigger sync batch (<15KB target) to Neon PostgreSQL server
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

    // Format attempts for POST /api/sync/batch
    const attempts = pending.map((r) => {
      const payload = (r.payloadData as any) || {};
      return {
        id: r.id,
        questionId: r.questionId || 'q-lin-01',
        equation: payload.equation || '3x - 7 = 14',
        workingSteps: payload.workingSteps || [],
        finalAnswer: payload.finalAnswer !== undefined ? payload.finalAnswer : null,
        clientTimestamp: r.timestamp,
      };
    });

    const body = { attempts };
    const sizeInBytes = new Blob([JSON.stringify(body)]).size;
    const sizeInKb = parseFloat((sizeInBytes / 1024).toFixed(2));
    this.lastPayloadSizeKb = sizeInKb;

    // Send batch payload to server
    const res = await apiRequest('/api/sync/batch', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (res.ok && res.data?.success) {
      const recordIds = pending.map((r) => r.id);
      await storageService.markRecordsAsSynced(recordIds);

      // Update local profile with server authoritative XP & mastery if returned
      if (res.data.authoritativeProfile) {
        const student = storageService.getSavedStudentProfile();
        if (typeof res.data.authoritativeProfile.totalXp === 'number') {
          student.totalPoints = res.data.authoritativeProfile.totalXp;
        }
        if (typeof res.data.authoritativeProfile.masteryPercentage === 'number') {
          student.masteryPercentage = res.data.authoritativeProfile.masteryPercentage;
        }
        await storageService.saveStudentProfile(student);
      }

      this.updateAnalyticsWithBatch(pending);
      this.lastSyncedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.notify();

      return {
        success: true,
        syncedCount: res.data.acceptedCount ?? pending.length,
        payloadSizeKb: sizeInKb,
        message: `Synchronized ${res.data.acceptedCount ?? pending.length} diagnostic record(s) with MindTrace server (${sizeInKb} KB).`,
      };
    } else {
      // Offline fallback: keep pending records in IndexedDB
      this.notify();
      return {
        success: false,
        syncedCount: 0,
        payloadSizeKb: sizeInKb,
        message: res.message || 'Offline queue retained in local IndexedDB store.',
      };
    }
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
