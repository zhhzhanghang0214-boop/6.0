export interface HistoryPoint {
  timestamp: string;
  value: number;
}

export interface PotSettings {
  startWateringThreshold: number; // 0-80%
  stopWateringThreshold: number; // 10-95%
  autoStop: boolean;
  singleWaterVolume: number; // 5-20ml
  indicatorLight: boolean;
}

export interface Pot {
  id: string;
  name: string;
  bindDate: string;
  deviceSerialNumber: string; // New field
  anonymousId: string; // New field
  batteryLevel: number; // 0-100
  waterLevel: number; // 0-100
  soilMoisture: number; // 0-100
  temperature: number; // Celsius
  image: string;
  settings: PotSettings;
  history: HistoryPoint[]; // Moisture history
  temperatureHistory: HistoryPoint[]; // Temperature history
}

export interface UserSession {
  anonymousId: string;
  token: string;
  userName: string;
}

export type ViewState = 'BOOT' | 'LOGIN' | 'DASHBOARD' | 'DETAIL' | 'SETTINGS' | 'HISTORY' | 'DEVICE_INFO';