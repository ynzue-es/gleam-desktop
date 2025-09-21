export {};

declare global {
  interface Window {
    electronAPI: {
      openExternal: (url: string) => void;
      onAuthCallback: (
        callback: (data: { code: string; state?: string }) => void
      ) => void;
    };
  }
}