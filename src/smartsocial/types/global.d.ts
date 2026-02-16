// src/smartsocial/types/global.d.ts

export { }; // This makes it a module

declare global {
  interface Window {
    smartsocialPosts?: Record<string, any>;
    chrome?: {
      runtime?: {
        sendMessage: (extensionId: string, message: any, callback?: (response: any) => void) => void;
        lastError?: { message: string };
        id?: string;
      };
      storage?: {
        local?: {
          get: (keys: string | string[] | null, callback: (items: Record<string, any>) => void) => void;
          set: (items: Record<string, any>, callback?: () => void) => void;
          remove: (keys: string | string[], callback?: () => void) => void;
        };
      };
    };
  }
  
  // Global chrome object (available in Chrome extensions)
  const chrome: Window['chrome'] | undefined;
}