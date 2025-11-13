interface Window {
  electron?: {
    windowControls: {
      minimize: () => Promise<void>;
      maximize: () => Promise<void>;
      close: () => Promise<void>;
      isMaximized: () => Promise<boolean>;
      onMaximizeChange: (callback: (isMaximized: boolean) => void) => () => void;
    };
    auth: {
      register: (userData: { email: string; password: string; name: string }) => Promise<{
        success: boolean;
        user?: { id: number; email: string; name: string; created_at: string };
        error?: string;
      }>;
      login: (credentials: { email: string; password: string }) => Promise<{
        success: boolean;
        sessionId?: string;
        user?: { id: number; email: string; name: string; last_login: string | null };
        expiresAt?: string;
        error?: string;
      }>;
      getSession: (sessionId: string) => Promise<{
        success: boolean;
        sessionId?: string;
        user?: { id: number; email: string; name: string; last_login: string | null };
        expiresAt?: string;
        error?: string;
      }>;
      logout: (sessionId: string) => Promise<{ success: boolean; error?: string }>;
    };
    database: {
      isReady: () => Promise<boolean>;
    };
  };
}

