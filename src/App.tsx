import React, { useState } from 'react';
import { useAuth, AuthScreen } from './components/Auth';
import { Layout } from './components/Layout';
import { WaterMap } from './components/WaterMap';
import { CameraView } from './components/CameraView';
import { ReportsList } from './components/ReportsList';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { user, profile, loading, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('map');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-[10px] font-bold text-text-sec uppercase tracking-[0.2em]">Initializing AquaScan AI...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLogin={login} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      profile={profile}
      onLogout={logout}
    >
      <div className="h-full flex flex-col space-y-6">
        {(activeTab === 'map' || activeTab === 'reports') && (
          <div className="quote-box animate-in slide-in-from-top duration-700">
            <p className="quote-text italic">
              "And We sent down water from the sky with a specific measure, then We caused it to remain in the earth..."
              <span className="ml-2 font-sans font-bold text-[10px] uppercase tracking-widest not-italic opacity-60">— Surah 23:18</span>
            </p>
          </div>
        )}

        <div className="flex-1 min-h-0">
          {activeTab === 'map' && <WaterMap />}
          {activeTab === 'scan' && <CameraView profile={profile} />}
          {activeTab === 'reports' && <ReportsList profile={profile} />}
          
          {activeTab === 'settings' && (
            <div className="flex-1 space-y-8 animate-in fade-in duration-500 max-w-2xl">
              <div className="space-y-4">
                <div className="card-geometric flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-text-main">Offline Scan Module</h3>
                    <p className="text-xs text-text-sec mt-1">Enable local ML processing (Gemini-Nano based)</p>
                  </div>
                  <div className="w-12 h-6 bg-border rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>

                <div className="card-geometric flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-text-main">Contamination Alerts</h3>
                    <p className="text-xs text-text-sec mt-1">Get notified of high-risk reports in your zone</p>
                  </div>
                  <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>

                <div className="mt-12 bg-dark p-8 rounded-xl text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <h3 className="font-bold text-sm tracking-tight">Active Neural Engine</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                    You are currently utilizing <span className="text-white font-bold underline decoration-primary underline-offset-4">Gemini 3 Flash</span> for multi-modal water analysis.
                  </p>
                  <div className="flex gap-2">
                    <span className="badge-geometric bg-white/10 text-white">Vision-Enabled</span>
                    <span className="badge-geometric bg-primary/20 text-primary">High-Confidence</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
