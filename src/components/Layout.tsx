import React from 'react';
import { 
  Map as MapIcon, 
  Camera, 
  BarChart3, 
  Settings,
  X,
  Menu
} from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: UserProfile | null;
  onLogout: () => void;
}

export function Layout({ children, activeTab, setActiveTab, profile, onLogout }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const navItems = [
    { id: 'map', label: 'Water Quality Map', icon: MapIcon },
    { id: 'scan', label: 'Water Quality Analysis', icon: Camera },
    { id: 'reports', label: 'Verified Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="h-screen flex bg-bg text-text-main font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-dark text-white p-8 flex-col border-r border-border">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold">W</div>
          <span className="font-bold text-lg tracking-tight">AquaScan AI</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                activeTab === item.id 
                  ? "bg-white/10 text-white" 
                  : "text-gray-400 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <button 
          onClick={onLogout}
          className="mt-auto flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5 rotate-45" /> Log Out
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-8 py-8 md:px-10 flex items-center justify-between shrink-0">
          <div className="md:hidden flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">W</div>
            <h1 className="text-xl font-bold">AquaScan</h1>
          </div>
          
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold tracking-tight">
              {navItems.find(t => t.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p className="text-sm text-text-sec mt-1">Real-time ML-based contamination detection</p>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div className="hidden sm:block">
              <p className="font-bold text-sm leading-none">{profile?.displayName}</p>
              <p className="text-[10px] text-text-sec uppercase font-bold tracking-widest mt-1">
                {profile?.role} • ID: {profile?.uid.slice(0, 5).toUpperCase()}
              </p>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative p-4 md:p-10 md:pt-0">
          {children}
        </main>

        {/* Mobile Nav Overlay Wrapper */}
        <nav className="md:hidden shrink-0 bg-white border-t border-border flex items-center justify-around px-2 py-3 pb-8 sm:pb-3 shadow-2xl z-20">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 min-w-[64px] transition-all",
                activeTab === item.id ? "text-primary border-t-2 border-primary -mt-[14px] pt-[12px]" : "text-gray-400"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.id}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-[280px] bg-dark text-white z-50 shadow-2xl p-8 flex flex-col md:hidden animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold">W</div>
                <span className="font-bold">AquaScan</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-2">
               {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-semibold transition-all",
                    activeTab === item.id ? "bg-white/10 text-white" : "text-gray-400"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>

            <button 
              onClick={onLogout}
              className="mt-auto w-full py-4 text-center font-bold text-red-400 bg-red-400/10 rounded-2xl border border-red-400/20"
            >
              Log Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
