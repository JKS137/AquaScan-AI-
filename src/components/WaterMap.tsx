import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { WaterReport } from '../types';
import { Loader2, Navigation, AlertTriangle, CheckCircle2, FlaskConical } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';

// Fix Leaflet marker icon issue
// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export function WaterMap() {
  const [reports, setReports] = useState<WaterReport[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Watch location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.error(err)
      );
    }

    // Subscribe to reports
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WaterReport));
      setReports(docs);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const getMarkerIcon = (level: string) => {
    const color = level === 'safe' ? '#34A853' : level === 'moderate' ? '#FBBC04' : '#EA4335';
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-bg">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const center: [number, number] = userLocation || [23.8103, 90.4125]; // Default to Dhaka if no location

  return (
    <div className="relative h-full w-full card-geometric p-0 overflow-hidden min-h-[400px]">
      <div className="absolute inset-0 z-0 opacity-50 pointer-events-none map-grid" />
      
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        className="z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLocation && <RecenterMap lat={userLocation[0]} lng={userLocation[1]} />}

        {reports.map((report) => (
          <Marker 
            key={report.id} 
            position={[report.location.lat, report.location.lng]}
            icon={getMarkerIcon(report.contaminationLevel)}
          >
            <Popup className="geometric-popup">
              <div className="w-64 p-1">
                <img 
                  src={report.imageUrl} 
                  alt="Water Sample" 
                  className="w-full h-32 object-cover rounded-lg mb-3 border border-border"
                  referrerPolicy="no-referrer"
                />
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "badge-geometric",
                    report.contaminationLevel === 'safe' ? "bg-safe/20 text-safe" :
                    report.contaminationLevel === 'moderate' ? "bg-moderate/20 text-moderate" :
                    "bg-unsafe/20 text-unsafe"
                  )}>
                    {report.contaminationLevel}
                  </span>
                  <span className="text-[10px] text-text-sec uppercase font-bold tracking-widest">{formatDate(report.createdAt)}</span>
                </div>
                <h3 className="font-bold text-text-main mb-1 truncate">{report.analystName}</h3>
                <p className="text-xs text-text-sec line-clamp-2 italic leading-relaxed">"{report.aiResult.explanation}"</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Modern Legend */}
      <div className="absolute bottom-6 left-6 z-[1000] flex flex-col gap-3">
        <div className="bg-dark/90 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-2xl space-y-4 min-w-[160px]">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Contamination Index</p>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-safe shadow-[0_0_8px_rgba(52,168,83,0.5)]" />
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">Safe Zone</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-moderate shadow-[0_0_8px_rgba(251,188,4,0.5)]" />
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">Moderate</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-unsafe shadow-[0_0_8px_rgba(234,67,53,0.5)]" />
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">Critical</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => {
            if (navigator.geolocation) {
               navigator.geolocation.getCurrentPosition((pos) => {
                 setUserLocation([pos.coords.latitude, pos.coords.longitude]);
               });
            }
          }}
          className="bg-white p-3.5 rounded-lg border border-border shadow-md hover:bg-gray-50 transition-all flex items-center justify-center text-primary group active:scale-95"
          title="Recenter"
        >
          <Navigation className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      <div className="absolute top-6 right-6 z-[1000]">
        <div className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-lg border border-border shadow-sm">
           <p className="text-[10px] font-bold text-text-sec uppercase tracking-[0.15em] text-right">
             Location Relay: <span className="text-primary">{userLocation ? `${userLocation[0].toFixed(4)}°, ${userLocation[1].toFixed(4)}°` : 'Searching...'}</span>
           </p>
        </div>
      </div>

      {!userLocation && (
        <div className="absolute bottom-24 left-6 z-[1000] animate-in fade-in slide-in-from-bottom duration-500">
          <div className="bg-unsafe text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 shadow-lg">
            <AlertTriangle className="w-4 h-4" /> System: Geolocation Disabled
          </div>
        </div>
      )}
    </div>
  );
}
