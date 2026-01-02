import { Pot, PotSettings, UserSession, HistoryPoint } from '../types';

// Helper to generate random history data
const generateHistory = (type: 'MOISTURE' | 'TEMP'): HistoryPoint[] => {
  const points: HistoryPoint[] = [];
  const now = new Date();
  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    
    let value = 0;
    if (type === 'MOISTURE') {
       // Simulate moisture dropping and rising periodically
       const base = 40 + Math.sin(i / 3) * 20; 
       const random = Math.random() * 5;
       value = Math.max(0, Math.min(100, Math.floor(base + random)));
    } else {
       // Simulate temperature (e.g., 18-28 degrees)
       // Cooler at night (more hours ago), warmer in day
       const hour = time.getHours();
       const isDay = hour > 6 && hour < 18;
       const baseTemp = isDay ? 24 : 19;
       const random = (Math.random() - 0.5) * 2;
       value = Math.floor(baseTemp + random);
    }

    points.push({
      timestamp: time.toISOString(),
      value: value,
    });
  }
  return points;
};

// Mock Initial Data
const MOCK_POTS: Pot[] = [
  {
    id: 'pot_001',
    name: 'Living Room Monstera',
    bindDate: '2023-10-15',
    deviceSerialNumber: 'SN-7823-X921',
    anonymousId: 'AID-99283712',
    batteryLevel: 85,
    waterLevel: 40,
    soilMoisture: 32,
    temperature: 23,
    image: 'https://picsum.photos/200/200',
    settings: {
      startWateringThreshold: 30,
      stopWateringThreshold: 80,
      autoStop: true,
      singleWaterVolume: 15,
      indicatorLight: true,
    },
    history: generateHistory('MOISTURE'),
    temperatureHistory: generateHistory('TEMP'),
  },
  {
    id: 'pot_002',
    name: 'Balcony Basil',
    bindDate: '2023-11-02',
    deviceSerialNumber: 'SN-4421-B772',
    anonymousId: 'AID-11029384',
    batteryLevel: 12,
    waterLevel: 90,
    soilMoisture: 65,
    temperature: 19,
    image: 'https://picsum.photos/201/201',
    settings: {
      startWateringThreshold: 40,
      stopWateringThreshold: 75,
      autoStop: true,
      singleWaterVolume: 10,
      indicatorLight: false,
    },
    history: generateHistory('MOISTURE'),
    temperatureHistory: generateHistory('TEMP'),
  },
];

const STORAGE_KEY = 'smartflora_data';
const SESSION_KEY = 'smartflora_session';
const ALL_SESSIONS_KEY = 'smartflora_all_sessions';

// Simulates a backend service
class MockApiService {
  private pots: Pot[];

  constructor() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      this.pots = JSON.parse(stored);
    } else {
      this.pots = MOCK_POTS;
    }
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.pots));
  }

  getStoredSession(): UserSession | null {
    const json = localStorage.getItem(SESSION_KEY);
    return json ? JSON.parse(json) : null;
  }

  getAllSessions(): UserSession[] {
    const json = localStorage.getItem(ALL_SESSIONS_KEY);
    return json ? JSON.parse(json) : [];
  }

  saveSession(session: UserSession) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    
    // Add to all sessions list if not exists or update
    const sessions = this.getAllSessions();
    const index = sessions.findIndex(s => s.anonymousId === session.anonymousId);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }
    localStorage.setItem(ALL_SESSIONS_KEY, JSON.stringify(sessions));
  }

  switchSession(anonymousId: string): UserSession | null {
    const sessions = this.getAllSessions();
    const session = sessions.find(s => s.anonymousId === anonymousId);
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    }
    return null;
  }

  updateSessionName(anonymousId: string, name: string) {
    const sessions = this.getAllSessions();
    const index = sessions.findIndex(s => s.anonymousId === anonymousId);
    if (index >= 0) {
      sessions[index].userName = name;
      localStorage.setItem(ALL_SESSIONS_KEY, JSON.stringify(sessions));
      
      // Update current session if it matches
      const current = this.getStoredSession();
      if (current && current.anonymousId === anonymousId) {
        current.userName = name;
        localStorage.setItem(SESSION_KEY, JSON.stringify(current));
      }
    }
  }

  logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  async loginWithQRCode(qrContent: string): Promise<UserSession> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Check if we already have this user (mock logic: qrContent could act as ID seed in real app)
    // Here we just generate a new one for simulation
    const id = `anon_${Math.random().toString(36).substr(2, 9)}`;
    const session: UserSession = {
      anonymousId: id,
      token: 'mock_jwt_token',
      userName: `User ${id.substr(5)}`,
    };
    
    this.saveSession(session);
    return session;
  }

  async getPots(): Promise<Pot[]> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return [...this.pots];
  }

  async getPotDetail(id: string): Promise<Pot | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.pots.find((p) => p.id === id);
  }

  async updateSettings(potId: string, newSettings: PotSettings): Promise<Pot> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const index = this.pots.findIndex((p) => p.id === potId);
    if (index === -1) throw new Error('Pot not found');

    this.pots[index] = {
      ...this.pots[index],
      settings: newSettings,
    };
    this.save();
    return this.pots[index];
  }

  async updatePotImage(potId: string, imageUrl: string): Promise<Pot> {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // simulate upload
    
    const index = this.pots.findIndex((p) => p.id === potId);
    if (index === -1) throw new Error('Pot not found');

    this.pots[index] = {
      ...this.pots[index],
      image: imageUrl,
    };
    this.save();
    return this.pots[index];
  }

  async updatePotName(potId: string, name: string): Promise<Pot> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const index = this.pots.findIndex((p) => p.id === potId);
    if (index === -1) throw new Error('Pot not found');

    this.pots[index] = {
      ...this.pots[index],
      name: name,
    };
    this.save();
    return this.pots[index];
  }

  async deletePot(potId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.pots = this.pots.filter(p => p.id !== potId);
    this.save();
  }
}

export const api = new MockApiService();