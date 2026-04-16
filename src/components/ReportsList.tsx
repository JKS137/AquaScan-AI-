import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { WaterReport, UserProfile } from '../types';
import { 
  BarChart3, 
  MapPin, 
  Clock, 
  MoreVertical, 
  Trash2, 
  CheckCircle, 
  XCircle,
  AlertCircle
} from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function ReportsList({ profile }: { profile: UserProfile | null }) {
  const [reports, setReports] = useState<WaterReport[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WaterReport));
      setReports(docs);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleStatusUpdate = async (id: string, status: 'verified' | 'rejected') => {
    if (!isAdmin) return;
    await updateDoc(doc(db, 'reports', id), { status });
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (confirm('Are you sure you want to delete this report?')) {
      await deleteDoc(doc(db, 'reports', id));
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center p-12">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Active Reports</h2>
          <p className="text-sm text-gray-500 font-medium">Monitoring {reports.length} water sources globally</p>
        </div>
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
          <BarChart3 className="w-6 h-6" />
        </div>
      </div>

      <div className="space-y-6">
        <AnimatePresence>
          {reports.map((report) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={report.id}
              className="card-geometric overflow-hidden p-0"
            >
              <div className="aspect-video relative overflow-hidden group">
                <img 
                  src={report.imageUrl} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={cn(
                    "badge-geometric",
                    report.contaminationLevel === 'safe' ? "bg-safe/20 text-safe" :
                    report.contaminationLevel === 'moderate' ? "bg-moderate/20 text-moderate" :
                    "bg-unsafe/20 text-unsafe"
                  )}>
                    {report.contaminationLevel}
                  </span>
                  {report.status !== 'pending' && (
                    <span className={cn(
                      "badge-geometric",
                      report.status === 'verified' ? "bg-primary/20 text-primary" : "bg-dark/20 text-dark"
                    )}>
                      {report.status}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-text-main text-lg tracking-tight">{report.analystName}</h3>
                    <div className="flex items-center gap-4 text-[10px] text-text-sec font-bold uppercase tracking-widest mt-2">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> {formatDate(report.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleStatusUpdate(report.id, 'verified')}
                        className="p-2.5 bg-safe/10 text-safe rounded-lg hover:bg-safe/20 transition-colors"
                        title="Verify"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(report.id, 'rejected')}
                        className="p-2.5 bg-unsafe/10 text-unsafe rounded-lg hover:bg-unsafe/20 transition-colors"
                        title="Reject"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(report.id)}
                        className="p-2.5 bg-gray-100 text-gray-400 rounded-lg hover:text-red-600 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-l-2 border-border pl-4">
                  <p className="text-sm text-text-sec leading-relaxed italic">
                    "{report.aiResult.explanation}"
                  </p>
                </div>
                
                <div className="bg-bg border border-border rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-sec">Safety Advice</span>
                  </div>
                  <p className="text-sm font-semibold text-text-main leading-snug">
                    {report.purificationAdvice}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {reports.length === 0 && (
          <div className="text-center py-20 px-10">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Reports Yet</h3>
            <p className="text-gray-500 text-sm">Start scanning water samples to generate the first environmental reports.</p>
          </div>
        )}
      </div>
    </div>
  );
}
