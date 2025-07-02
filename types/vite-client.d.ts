// Vite client type definitions for production builds
declare module 'vite/client' {
  interface ImportMetaEnv {
    readonly VITE_RECAPTCHA_SITE_KEY?: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}