export interface GlassOptions { preset?: string; theme?: string; lightAngle?: number; reflection?: number; radius?: number; blur?: number; displacement?: number; edgeWidth?: number; dispersion?: number; nativeRefraction?: boolean; }
export interface GlassHandle { destroy(): void; update(options: GlassOptions): void; }
