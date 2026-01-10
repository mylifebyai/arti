import type { ConfigSource } from '@/electron';

import { SourceBadge } from './SourceBadge';

interface ApiKeyStatus {
  configured: boolean;
  source: 'env' | 'project' | null;
  lastFour: string | null;
}

interface ApiKeySettingsPanelProps {
  hasAnyChatApp: boolean;
  apiKeyStatus: ApiKeyStatus;
  apiKeyInput: string;
  apiKeyPlaceholder: string;
  isSavingApiKey: boolean;
  apiKeySaveState: 'idle' | 'success' | 'error';
  onApiKeyInputChange: (value: string) => void;
  onSaveApiKey: () => Promise<void>;
  onClearStoredApiKey: () => Promise<void>;
}

export function ApiKeySettingsPanel({
  hasAnyChatApp,
  apiKeyStatus,
  apiKeyInput,
  apiKeyPlaceholder,
  isSavingApiKey,
  apiKeySaveState,
  onApiKeyInputChange,
  onSaveApiKey,
  onClearStoredApiKey
}: ApiKeySettingsPanelProps) {
  if (!hasAnyChatApp) return null;

  const currentSource: ConfigSource | null =
    apiKeyStatus.source === 'env' ? 'env'
    : apiKeyStatus.source === 'project' ? 'project'
    : null;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
            Anthropic API Key
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Add <code>ANTHROPIC_API_KEY</code> to your workspace <code>.env</code> file, or set it
            as an environment variable. You can also save it to the project config below.
          </p>
        </div>
        {currentSource && <SourceBadge source={currentSource} />}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-2">
          <span
            className={`font-semibold ${
              apiKeyStatus.configured ?
                'text-neutral-800 dark:text-neutral-100'
              : 'text-neutral-500 dark:text-neutral-500'
            }`}
          >
            {apiKeyStatus.configured ?
              apiKeyStatus.source === 'env' ?
                'Using environment / .env key'
              : 'Stored in project config'
            : 'No key configured'}
          </span>
          {apiKeyStatus.lastFour && apiKeyStatus.configured && (
            <span className="font-mono text-xs text-neutral-500 dark:text-neutral-500">
              ...{apiKeyStatus.lastFour}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <input
          id="api-key-input"
          type="password"
          value={apiKeyInput}
          onChange={(e) => onApiKeyInputChange(e.target.value)}
          placeholder={apiKeyPlaceholder}
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 font-mono text-sm text-neutral-900 placeholder-neutral-400 transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:border-neutral-300"
        />

        <div className="flex flex-wrap items-center justify-end gap-3 text-right">
          {apiKeyStatus.source === 'project' && (
            <button
              onClick={onClearStoredApiKey}
              disabled={isSavingApiKey}
              className="rounded-full border border-red-200 px-5 py-2 text-sm font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/70 dark:text-red-200 dark:hover:border-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-50"
            >
              Clear stored key
            </button>
          )}
          <button
            onClick={onSaveApiKey}
            disabled={!apiKeyInput.trim() || isSavingApiKey}
            className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {isSavingApiKey ? 'Saving...' : 'Save to Project'}
          </button>
          {apiKeySaveState === 'success' && (
            <span className="text-xs font-medium text-green-600 dark:text-green-400">
              API key saved
            </span>
          )}
          {apiKeySaveState === 'error' && (
            <span className="text-xs font-medium text-red-600 dark:text-red-400">
              Failed to save key
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
