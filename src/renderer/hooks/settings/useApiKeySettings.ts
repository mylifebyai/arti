import { useEffect, useState } from 'react';

type ApiKeyStatus = {
  configured: boolean;
  source: 'env' | 'project' | null;
  lastFour: string | null;
};

export interface ApiKeySettingsState {
  apiKeyStatus: ApiKeyStatus;
  apiKeyInput: string;
  apiKeyPlaceholder: string;
  isSavingApiKey: boolean;
  apiKeySaveState: 'idle' | 'success' | 'error';
}

export interface ApiKeySettingsActions {
  setApiKeyInput: (value: string) => void;
  handleSaveApiKey: () => Promise<void>;
  handleClearStoredApiKey: () => Promise<void>;
}

export function useApiKeySettings(): ApiKeySettingsState & ApiKeySettingsActions {
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>({
    configured: false,
    source: null,
    lastFour: null
  });
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);
  const [apiKeySaveState, setApiKeySaveState] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    window.electron.config
      .getApiKeyStatus()
      .then((response) => {
        setApiKeyStatus(response.status);
      })
      .catch(() => {
        // ignore - will show as not configured
      });
  }, []);

  const apiKeyPlaceholder = apiKeyStatus.lastFour ? `...${apiKeyStatus.lastFour}` : 'Enter API key';

  const handleSaveApiKey = async () => {
    setIsSavingApiKey(true);
    setApiKeySaveState('idle');

    try {
      const response = await window.electron.config.setApiKey(apiKeyInput);
      setApiKeyStatus(response.status);
      setApiKeyInput('');
      setApiKeySaveState('success');
      setTimeout(() => setApiKeySaveState('idle'), 2000);
    } catch {
      setApiKeySaveState('error');
      setTimeout(() => setApiKeySaveState('idle'), 2500);
    } finally {
      setIsSavingApiKey(false);
    }
  };

  const handleClearStoredApiKey = async () => {
    setIsSavingApiKey(true);
    setApiKeySaveState('idle');
    try {
      const response = await window.electron.config.setApiKey(null);
      setApiKeyStatus(response.status);
      setApiKeyInput('');
      setApiKeySaveState('success');
      setTimeout(() => setApiKeySaveState('idle'), 2000);
    } catch {
      setApiKeySaveState('error');
      setTimeout(() => setApiKeySaveState('idle'), 2500);
    } finally {
      setIsSavingApiKey(false);
    }
  };

  return {
    apiKeyStatus,
    apiKeyInput,
    apiKeyPlaceholder,
    isSavingApiKey,
    apiKeySaveState,
    setApiKeyInput,
    handleSaveApiKey,
    handleClearStoredApiKey
  };
}
