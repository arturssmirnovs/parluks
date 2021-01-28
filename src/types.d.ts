export interface WindowBounds {
  width: number;
  height: number;
}

export interface StoreData {
  [key: string]: string | number | WindowBounds;
  start?: string;
  windowBounds: WindowBounds;
  key: string;
  settings_display_mode: string;
  settings_scroll: number;
  settings_zoom_level: number;
  settings_picture_background: number;
  settings_meta_override: number;
  version: string;
}

export interface StoreOptions {
  configName: string;
  defaults: StoreData;
}

export interface DeviceType {
  name: string;
  featured?: boolean;
  width: number;
  userAgent: string;
  touch: boolean;
  os: string;
  pixelRatio: number;
  height: number;
  type: "phone" | "tablet" | "laptop" | "television";
}
