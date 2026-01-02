
import React, { useState, useEffect } from 'react';
import { 
  ScanLine, 
  Plus, 
  Droplets, 
  Sprout, 
  Settings, 
  ChevronRight, 
  Thermometer,
  ArrowRight,
  User
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

import { api } from './services/api';
import { Pot, UserSession, ViewState, PotSettings } from './types';
import { Button, Card, Header, ProgressRing, Slider, Toggle, Toast } from './components/Components';

// Dashboard specific tabs
type DashboardTab = 'DEVICES' | 'DISCUSSION' | 'SHOP' | 'APP_SETTINGS';

export default function App() {
  const [view, setView] = useState<ViewState>('BOOT');
  const [activeTab, setActiveTab] = useState<DashboardTab>('DEVICES');
  const [session, setSession] = useState<UserSession | null>(null);
  const [pots, setPots] = useState<Pot[]>([]);
  const [selectedPotId, setSelectedPotId] = useState<string | null>(null);
  const [historyMode, setHistoryMode] = useState<'MOISTURE' | 'TEMPERATURE'>('MOISTURE');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });

  // Computed selected pot
  const selectedPot = pots.find(p => p.id === selectedPotId);

  // --- Initialization ---

  useEffect(() => {
    const initApp = async () => {
      const storedSession = api.getStoredSession();

      if (storedSession) {
        try {
          const storedPots = await api.getPots();
          setSession(storedSession);
          if (storedPots.length > 0) {
            setPots(storedPots);
          }
          setView('DASHBOARD');
          return;
        } catch (e) {
          console.error("Failed to restore session data", e);
        }
      }
      setView('LOGIN');
    };
    
    initApp();
  }, []);

  // --- Actions ---

  const handleLogin = async () => {
    setLoading(true);
    try {
      const sessionData = await api.loginWithQRCode('mock_qr_data');
      setSession(sessionData);
      const potsData = await api.getPots();
      setPots(potsData);
      setView('DASHBOARD');
      setActiveTab('DEVICES');
    } catch (error) {
      console.error(error);
      alert("Failed to bind device.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserName = (name: string) => {
    if (session) {
      api.updateSessionName(session.anonymousId, name);
      setSession({ ...session, userName: name });
    }
  };

  const refreshPots = async () => {
    const data = await api.getPots();
    setPots(data);
  };

  const handleSaveConfiguration = async (newSettings: PotSettings, newName?: string) => {
    if (!selectedPotId) return;
    setLoading(true);
    try {
      const promises: Promise<any>[] = [
        api.updateSettings(selectedPotId, newSettings)
      ];
      if (newName && newName !== selectedPot?.name) promises.push(api.updatePotName(selectedPotId, newName));
      await Promise.all(promises);
      await refreshPots();
      setView('DETAIL');
    } catch (e) {
      alert("Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDevice = async () => {
    if (!selectedPotId) return;
    if (window.confirm("Are you sure?")) {
      setLoading(true);
      try {
        await api.deletePot(selectedPotId);
        await refreshPots();
        setSelectedPotId(null);
        setView('DASHBOARD');
        alert("Device removed");
      } catch (e) {
        alert("Failed to delete device");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = () => {
    api.logout();
    setSession(null);
    setPots([]);
    setSelectedPotId(null);
    setView('LOGIN');
  };

  const openHistory = (mode: 'MOISTURE' | 'TEMPERATURE') => {
    setHistoryMode(mode);
    setView('HISTORY');
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  // --- Views ---

  const BootView = () => (
    <div className="flex flex-col items-center justify-center h-full bg-white">
       <div className="relative">
         <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
         <div className="absolute inset-0 flex items-center justify-center">
            <Sprout className="w-6 h-6 text-emerald-600" />
         </div>
       </div>
       <p className="mt-4 text-emerald-800 font-medium animate-pulse">Growing your garden...</p>
    </div>
  );

  const LoginView = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-gradient-to-b from-emerald-50 to-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-64 bg-emerald-500 rounded-b-[3rem] -z-10 opacity-10"></div>
      <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center mb-8 shadow-inner">
        <Sprout className="w-16 h-16 text-emerald-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">SmartFlora</h1>
      <p className="text-gray-500 text-center mb-12 max-w-xs">Connect to your intelligent plant pot.</p>
      <div className="w-full max-w-xs space-y-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center">
          <ScanLine className="w-16 h-16 text-gray-800 mb-4 animate-pulse" />
          <Button onClick={handleLogin} isLoading={loading}>Scan QR to Connect</Button>
        </div>
      </div>
    </div>
  );

  const DevicesTab = () => (
    <div className="p-4 space-y-4 pb-24">
      {pots.map(pot => (
        <Card key={pot.id} onClick={() => { setSelectedPotId(pot.id); setView('DETAIL'); }} className="flex items-center gap-4">
          <img src={pot.image} alt={pot.name} className="w-20 h-20 rounded-2xl object-cover bg-gray-100 shadow-sm"/>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg truncate">{pot.name}</h3>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <div className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full"><Droplets className="w-3 h-3" />{pot.soilMoisture}%</div>
              <div className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full"><Thermometer className="w-3 h-3" />{pot.temperature}°C</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </Card>
      ))}
      <button className="w-full py-4 border-2 border-dashed border-gray-300 rounded-3xl text-gray-400 font-medium flex items-center justify-center gap-2 hover:bg-gray-50">
        <Plus className="w-5 h-5" /> Add New Pot
      </button>
    </div>
  );

  const AppSettingsTab = () => {
    const [editingName, setEditingName] = useState(session?.userName || '');
    useEffect(() => { setEditingName(session?.userName || ''); }, [session]);
    return (
      <div className="p-4 pb-24 space-y-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0"><User className="w-7 h-7 text-emerald-600" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">User Name</label>
                <input type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)} onBlur={() => handleUpdateUserName(editingName)} className="font-bold text-gray-900 bg-transparent outline-none w-full text-lg" />
              </div>
            </div>
          </div>
        </Card>
        <Button variant="danger" onClick={handleLogout}>Logout</Button>
      </div>
    );
  };

  const DashboardView = () => (
    <div className="h-full flex flex-col bg-gray-50 relative">
      <Header title={activeTab === 'DEVICES' ? 'My Garden' : 'Settings'} />
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'DEVICES' && <DevicesTab />}
        {activeTab === 'APP_SETTINGS' && <AppSettingsTab />}
      </div>
      <div className="flex-none bg-white border-t border-gray-200 h-16 flex justify-around items-center">
        <button onClick={() => setActiveTab('DEVICES')} className={`flex flex-col items-center ${activeTab === 'DEVICES' ? 'text-emerald-600' : 'text-gray-400'}`}><Sprout className="w-6 h-6" /><span className="text-[10px]">Garden</span></button>
        <button onClick={() => setActiveTab('APP_SETTINGS')} className={`flex flex-col items-center ${activeTab === 'APP_SETTINGS' ? 'text-emerald-600' : 'text-gray-400'}`}><Settings className="w-6 h-6" /><span className="text-[10px]">Settings</span></button>
      </div>
    </div>
  );

  const PotDetailView = () => {
    if (!selectedPot) return null;
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <Header title={selectedPot.name} onBack={() => setView('DASHBOARD')} rightAction={<button onClick={() => setView('SETTINGS')} className="p-2 bg-gray-100 rounded-full"><Settings className="w-5 h-5" /></button>} />
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="flex flex-col items-center !p-3"><ProgressRing percentage={selectedPot.soilMoisture} size={70} color="text-emerald-600" /><span className="text-xs mt-2">Moisture</span></Card>
            <Card className="flex flex-col items-center !p-3"><ProgressRing percentage={selectedPot.waterLevel} size={70} color="text-blue-500" /><span className="text-xs mt-2">Water</span></Card>
          </div>
          <Card onClick={() => openHistory('MOISTURE')} className="h-32 p-4 cursor-pointer">
             <div className="flex justify-between items-center mb-2"><h3 className="font-bold">Moisture History</h3><ArrowRight className="w-4 h-4" /></div>
             <ResponsiveContainer width="100%" height="100%"><AreaChart data={selectedPot.history}><Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.1}/></AreaChart></ResponsiveContainer>
          </Card>
        </div>
      </div>
    );
  };

  const SettingsView = () => {
    if (!selectedPot) return null;
    const [formData, setFormData] = useState<PotSettings>(selectedPot.settings);
    const [potName, setPotName] = useState(selectedPot.name);
    
    const updateField = (key: keyof PotSettings, value: string | number | boolean) => {
      setFormData(prev => ({ ...prev, [key]: value }));
    };

    return (
      <div className="h-full flex flex-col bg-gray-50">
        <Header title="Config" onBack={() => setView('DETAIL')} />
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <Card>
            <label className="text-xs font-bold text-gray-400">NAME</label>
            <input type="text" value={potName} onChange={(e) => setPotName(e.target.value)} className="w-full border-b py-2 outline-none" />
          </Card>
          <Card>
            <Slider 
              label="Watering Volume" 
              value={formData.singleWaterVolume} 
              min={5} 
              max={20} 
              unit="ml" 
              onChange={(v: number) => updateField('singleWaterVolume', v)} 
            />
            <Toggle 
              label="Indicator Light" 
              checked={formData.indicatorLight} 
              onChange={(v: boolean) => updateField('indicatorLight', v)} 
            />
          </Card>
          <Button variant="danger" onClick={() => setView('DEVICE_INFO')}>Device Info</Button>
        </div>
        <div className="p-4 bg-white border-t"><Button onClick={() => handleSaveConfiguration(formData, potName)} isLoading={loading}>Save</Button></div>
      </div>
    );
  };

  const DeviceInfoView = () => {
    if (!selectedPot) return null;
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <Header title="Device Info" onBack={() => setView('SETTINGS')} />
        <div className="p-4 space-y-4">
          <Card>
            <p className="text-sm text-gray-500">Serial: {selectedPot.deviceSerialNumber}</p>
            <p className="text-sm text-gray-500">ID: {selectedPot.anonymousId}</p>
          </Card>
          <Button variant="danger" onClick={handleDeleteDevice} isLoading={loading}>Unbind Device</Button>
        </div>
      </div>
    );
  };

  const HistoryView = () => {
    if (!selectedPot) return null;
    const isMoisture = historyMode === 'MOISTURE';
    const data = isMoisture ? selectedPot.history : selectedPot.temperatureHistory;
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <Header title={isMoisture ? "Moisture" : "Temp"} onBack={() => setView('DETAIL')} />
        <div className="flex-1 p-4"><Card className="h-64"><ResponsiveContainer><AreaChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="timestamp" hide/><YAxis /><Tooltip /><Area type="monotone" dataKey="value" stroke={isMoisture ? "#10b981" : "#f59e0b"}/></AreaChart></ResponsiveContainer></Card></div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto h-[100dvh] bg-gray-50 shadow-2xl relative overflow-hidden flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <Toast message={toast.message} show={toast.show} onClose={hideToast} />
      {view === 'BOOT' && <BootView />}
      {view === 'LOGIN' && <LoginView />}
      {view === 'DASHBOARD' && <DashboardView />}
      {view === 'DETAIL' && <PotDetailView />}
      {view === 'SETTINGS' && <SettingsView />}
      {view === 'DEVICE_INFO' && <DeviceInfoView />}
      {view === 'HISTORY' && <HistoryView />}
    </div>
  );
}
