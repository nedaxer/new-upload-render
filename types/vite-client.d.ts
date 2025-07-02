// Vite client type definitions for production builds
declare module 'vite/client' {
  interface ImportMetaEnv {
    readonly VITE_RECAPTCHA_SITE_KEY?: string
    readonly DEV?: boolean
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

// Asset module declarations
declare module '@assets/*' {
  const content: string
  export default content
}

declare module '@/assets/*' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.mp4' {
  const content: string
  export default content
}

declare module '/team_photos/*' {
  const content: string
  export default content
}

// Zustand types
declare module 'zustand' {
  export function create<T>(fn: any): any
}