// Global type definitions for Nedaxer client

// Vite environment variables
interface ImportMetaEnv {
  readonly VITE_RECAPTCHA_SITE_KEY?: string
  readonly DEV?: boolean
  readonly PROD?: boolean
  readonly NODE_ENV?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Asset imports
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

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.mp4' {
  const content: string
  export default content
}

declare module '*.webm' {
  const content: string
  export default content
}

declare module '*.mov' {
  const content: string
  export default content
}

declare module '/team_photos/*' {
  const content: string
  export default content
}

// Zustand store
declare module 'zustand' {
  export function create<T>(fn: any): any
  export * from 'zustand/middleware'
}

// Global utility types
type StringRouteParams<T = undefined> = {
  [key: string]: string
} & T

// Lightweight Charts types
declare module 'lightweight-charts' {
  export interface IChartApi {
    addSeries: (type: any, options?: any) => any
    addCandlestickSeries: (options?: any) => any
    addLineSeries: (options?: any) => any
    addHistogramSeries: (options?: any) => any
    timeScale: () => any
    priceScale: (priceScaleId?: string) => any
    resize: (width: number, height: number) => void
    remove: () => void
    subscribeCrosshairMove: (callback: any) => void
    unsubscribeCrosshairMove: (callback: any) => void
  }
  
  export function createChart(container: HTMLElement, options?: any): IChartApi
}

// Extended Response type for API calls
interface Response {
  data?: any
  json(): Promise<any>
  text(): Promise<string>
  ok: boolean
  status: number
  statusText: string
}

// Wouter route props
interface RouteComponentProps<T = any> {
  params: T
}

// Global functions
declare global {
  function getSourceIcon(source: string): string
  
  interface Window {
    gtag?: (...args: any[]) => void
    TradingView?: any
    chartWidget?: any
  }
}

export {}