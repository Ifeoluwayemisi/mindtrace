# Connectivity Status and Offline Simulation Report

## 1. Overview
This report documents the correction of the connectivity status indicator and the implementation of a software-level offline simulation mode for MindTrace.

## 2. Root Cause Analysis
- **Issue 1 (Connectivity Status)**: The status bar previously combined browser connectivity and server reachability into a single state, and was incorrectly showing "Offline" due to an aggressive `HEAD` request check that was failing in certain environments.
- **Issue 2 (Airplane Mode)**: The "Test Airplane Mode" button was mislabelled (as it cannot control OS settings) and did not actually intercept API requests, allowing the app to silently talk to the backend even when "offline" was selected.

## 3. Implementation Details

### A. Connectivity Architecture (`src/services/syncService.ts`)
- **Granular Tracking**: Distinguishes between:
    - `isActuallyOnline`: Browser has a network connection (`navigator.onLine`).
    - `isServerReachable`: The MindTrace backend is responding to `/api/health` heartbeat.
    - `isSimulatedOffline`: User has manually enabled software-level disconnection.
- **Robust Heartbeat**: Switched from `HEAD` to `GET` for the health check and increased the timeout to 5s to account for high-latency mobile networks.

### B. Offline Simulation (`src/services/apiClient.ts`)
- **Global Interception**: Updated `apiRequest` to check a persistent `localStorage` flag.
- **Request Blocking**: If simulation is active, all API requests (except health checks) are blocked locally and return a `Simulated Network Error`.
- **Persistence**: Simulation state survives page refreshes, allowing for full offline workflow testing.

### C. UI Overhaul (`src/components/common/NetworkStatusBar.tsx`)
- **Dynamic Labels**:
    - `Connected · Sync ready`: Full throughput available.
    - `Internet available · Server unreachable`: Online but backend down.
    - `Offline · Working locally`: Browser is disconnected.
    - `SIMULATED OFFLINE`: Manual test mode active.
- **Renamed Action**: "Test Airplane Mode" renamed to **"Simulate Offline Mode"** with a clear toggle behavior and persistent feedback.

## 4. Test Results

| Test Case | Expected Behavior | Status |
|-----------|-------------------|--------|
| Normal Online | Shows `Connected · Sync ready` | ✅ PASS |
| Browser Offline | Shows `Offline · Working locally` | ✅ PASS |
| Server Down | Shows `Server unreachable` (tested via invalid endpoint) | ✅ PASS |
| Enable Simulation | Shows `SIMULATED OFFLINE`, blocks API calls | ✅ PASS |
| Solve Question (Simulated) | Diagnostic saved to IndexedDB, not sent to server | ✅ PASS |
| Disable Simulation | Restores connectivity, triggers background sync | ✅ PASS |
| Pending Queue Sync | Correctly shows "Pending sync: X records" | ✅ PASS |

## 5. Remaining Limitations
- **Health Check Frequency**: Heartbeat is currently set to 45s to avoid excessive battery drain; manual status updates happen on browser `online`/`offline` events.
- **Simulation Scope**: Native `fetch` calls (outside of `apiRequest`) are not intercepted, but all critical application logic uses `apiRequest`.

## 6. PWA Note
Regarding the "Add to Home Screen" popup: 
- Fixed icons and Service Worker pre-caching in the previous turn.
- Note: Browsers (especially Chrome on Desktop) rarely show an automatic "Install" popup; instead, they show an "Install" icon in the URL bar or menu. MindTrace provides a manual **"Install PWA"** button in the header for this purpose.
