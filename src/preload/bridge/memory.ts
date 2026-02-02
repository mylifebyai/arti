/**
 * Memory Bridge
 * Exposes memory consolidation operations to the renderer.
 */
import type { IpcRenderer } from 'electron';
import type { MemoryBridge } from '../../shared/types/electron-api';

export function createMemoryBridge(ipcRenderer: IpcRenderer): MemoryBridge {
  return {
    consolidate: (force?: boolean) => ipcRenderer.invoke('memory:consolidate', force),
    getStatus: () => ipcRenderer.invoke('memory:status'),
    resetProcessedFlags: () => ipcRenderer.invoke('memory:resetProcessedFlags'),
    isWakingUp: () => ipcRenderer.invoke('memory:isWakingUp'),
    onWakingUpChanged: (callback: (data: { isWakingUp: boolean }) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, data: { isWakingUp: boolean }) => {
        callback(data);
      };
      ipcRenderer.on('memory:waking-up-changed', listener);
      return () => ipcRenderer.removeListener('memory:waking-up-changed', listener);
    }
  };
}
