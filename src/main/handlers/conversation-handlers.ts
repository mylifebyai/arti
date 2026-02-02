import { ipcMain, BrowserWindow } from 'electron';

import {
  closeDatabase,
  createConversation,
  deleteConversation,
  generateTitleFromMessages,
  getConversation,
  getDatabaseStats,
  getDatabaseStatus,
  initializeDatabase,
  listConversations,
  resetAllProcessedFlags,
  updateConversation
} from '../lib/conversation-db';
import {
  consolidateMemories,
  getConsolidationStatus,
  getIsStartupWakingUp,
  runStartupConsolidation
} from '../lib/memory-consolidation';

export function registerConversationHandlers(getMainWindow?: () => BrowserWindow | null): void {
  // Initialize database on app start
  initializeDatabase();

  ipcMain.handle('conversation:list', async () => {
    try {
      const conversations = listConversations();
      return { success: true, conversations };
    } catch (error) {
      console.error('Error listing conversations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  });

  ipcMain.handle(
    'conversation:create',
    async (_event, messages: unknown[], sessionId?: string | null) => {
      try {
        const title = generateTitleFromMessages(messages);
        const conversation = createConversation(title, messages, sessionId);
        return { success: true, conversation };
      } catch (error) {
        console.error('Error creating conversation:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
      }
    }
  );

  ipcMain.handle('conversation:get', async (_event, id: string) => {
    try {
      const conversation = getConversation(id);
      if (!conversation) {
        return { success: false, error: 'Conversation not found' };
      }
      return { success: true, conversation };
    } catch (error) {
      console.error('Error getting conversation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  });

  ipcMain.handle(
    'conversation:update',
    async (_event, id: string, title?: string, messages?: unknown[], sessionId?: string | null) => {
      try {
        updateConversation(id, title, messages, sessionId);
        return { success: true };
      } catch (error) {
        console.error('Error updating conversation:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
      }
    }
  );

  ipcMain.handle('conversation:delete', async (_event, id: string) => {
    try {
      deleteConversation(id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  });

  ipcMain.handle('conversation:dbStatus', async () => {
    try {
      return { success: true, status: getDatabaseStatus() };
    } catch (error) {
      console.error('Error getting database status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  });

  ipcMain.handle('conversation:dbStats', async () => {
    try {
      return { success: true, stats: getDatabaseStats() };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  });

  // ============================================
  // Memory Consolidation Handlers
  // ============================================

  ipcMain.handle('memory:consolidate', async (_event, force: boolean = false) => {
    try {
      console.log('[memory-handlers] Consolidation requested, force:', force);
      const result = await consolidateMemories(force);
      return { success: true, result };
    } catch (error) {
      console.error('Error during memory consolidation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  });

  ipcMain.handle('memory:status', async () => {
    try {
      const status = getConsolidationStatus();
      return { success: true, status };
    } catch (error) {
      console.error('Error getting memory consolidation status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  });

  ipcMain.handle('memory:resetProcessedFlags', async () => {
    try {
      console.log('[memory-handlers] Resetting all processed flags (for testing)');
      resetAllProcessedFlags();
      return { success: true };
    } catch (error) {
      console.error('Error resetting processed flags:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  });

  ipcMain.handle('memory:isWakingUp', () => {
    return { isWakingUp: getIsStartupWakingUp() };
  });

  // Run startup consolidation after a short delay (let app fully initialize)
  setTimeout(() => {
    runStartupConsolidation((isWakingUp) => {
      // Emit waking up state change to renderer
      const mainWindow = getMainWindow?.();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('memory:waking-up-changed', { isWakingUp });
      }
    }).catch((error) => {
      console.error('[memory-handlers] Startup consolidation error:', error);
    });
  }, 5000); // Wait 5 seconds after app start
}

// Cleanup on app quit
process.on('exit', () => {
  closeDatabase();
});
