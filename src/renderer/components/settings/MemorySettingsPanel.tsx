import { useState, useEffect, useCallback } from 'react';
import { Brain, RefreshCw, RotateCcw } from 'lucide-react';
import type { ConsolidationStatus, ConsolidationResult } from '../../../shared/types/electron-api';

export function MemorySettingsPanel() {
  const [status, setStatus] = useState<ConsolidationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [lastResult, setLastResult] = useState<ConsolidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const response = await window.electron.memory.getStatus();
      if (response.success && response.status) {
        setStatus(response.status);
      } else {
        setError(response.error ?? 'Failed to load status');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  // Poll status while consolidation is in progress
  useEffect(() => {
    if (!status?.isInProgress) return;

    const interval = setInterval(() => {
      void loadStatus();
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [status?.isInProgress, loadStatus]);

  const handleConsolidate = async (force: boolean = false) => {
    setIsConsolidating(true);
    setError(null);
    setLastResult(null);

    try {
      const response = await window.electron.memory.consolidate(force);
      if (response.success && response.result) {
        setLastResult(response.result);
        void loadStatus(); // Refresh status
      } else {
        setError(response.error ?? 'Consolidation failed');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsConsolidating(false);
    }
  };

  const handleResetFlags = async () => {
    setIsResetting(true);
    setError(null);

    try {
      const response = await window.electron.memory.resetProcessedFlags();
      if (response.success) {
        void loadStatus(); // Refresh status
      } else {
        setError(response.error ?? 'Reset failed');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsResetting(false);
    }
  };

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
            Memory Consolidation
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Arti reviews past conversations and updates his memory file.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
          <Brain className="h-3 w-3" />
          Memory
        </span>
      </div>

      {/* Status Display */}
      <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
        {isLoading ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading status...</p>
        ) : status ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  Unprocessed Conversations
                </p>
                <p className="mt-0.5 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {status.unprocessedCount}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  Last Consolidated
                </p>
                <p className="mt-0.5 text-sm text-neutral-700 dark:text-neutral-300">
                  {formatTime(status.lastConsolidatedAt)}
                </p>
              </div>
            </div>

            {status.isInProgress && (
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                Consolidation in progress...
              </p>
            )}

            {status.nextConsolidationAllowedAt && !status.isInProgress && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Next auto-consolidation allowed: {formatTime(status.nextConsolidationAllowedAt)}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-red-600 dark:text-red-400">Failed to load status</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleConsolidate(false)}
          disabled={isConsolidating || !status?.canConsolidate || status?.isInProgress}
          className="flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          <RefreshCw className={`h-4 w-4 ${isConsolidating || status?.isInProgress ? 'animate-spin' : ''}`} />
          {isConsolidating || status?.isInProgress ? 'Consolidating...' : 'Consolidate Memories'}
        </button>

        <button
          type="button"
          onClick={() => handleConsolidate(true)}
          disabled={isConsolidating || !status || status.unprocessedCount === 0 || status.isInProgress}
          className="flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-700"
        >
          Force Consolidate
        </button>

        <button
          type="button"
          onClick={handleResetFlags}
          disabled={isResetting}
          className="flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-700"
        >
          <RotateCcw className={`h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
          Reset Processed Flags
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Result Display */}
      {lastResult && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            lastResult.success
              ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/50 dark:text-green-300'
              : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300'
          }`}
        >
          {lastResult.success ? (
            <div>
              <p className="font-semibold">Consolidation Complete</p>
              <p className="mt-1">
                Processed {lastResult.conversationsProcessed} conversation
                {lastResult.conversationsProcessed !== 1 ? 's' : ''}.
              </p>
              {lastResult.backupPath && (
                <p className="mt-1 text-xs opacity-80">
                  Backup saved: {lastResult.backupPath.split('/').pop()}
                </p>
              )}
              {lastResult.memoriesAdded && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-semibold">
                    View updated memory file
                  </summary>
                  <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded bg-white/50 p-2 font-mono text-xs dark:bg-black/20">
                    {lastResult.memoriesAdded}
                  </pre>
                </details>
              )}
            </div>
          ) : (
            <p>Error: {lastResult.error}</p>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="rounded-xl border border-neutral-200/60 bg-neutral-100/50 p-3 text-xs text-neutral-600 dark:border-neutral-800/60 dark:bg-neutral-900/30 dark:text-neutral-400">
        <p className="font-semibold">How it works:</p>
        <ul className="mt-1 list-inside list-disc space-y-0.5">
          <li>Arti reviews unprocessed conversations and extracts important memories</li>
          <li>New info is integrated into the appropriate sections of memory.md</li>
          <li>A timestamped backup is saved to info/memory-backups/ before each update</li>
          <li>Conversations are marked as processed to avoid reprocessing</li>
          <li>Auto-consolidation runs on app startup (throttled to 4 hours)</li>
        </ul>
      </div>
    </section>
  );
}
