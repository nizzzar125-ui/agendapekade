import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, PlusCircle, Settings, CheckCircle2 } from 'lucide-react';
import { INDONESIAN_DAYS, INDONESIAN_MONTHS } from '../utils/agenda';

interface HeaderProps {
  onOpenEntryModal: () => void;
  onOpenSheetConfig: () => void;
  onSync: () => void;
  isSyncing: boolean;
  lastSyncTime?: string;
  hasCustomSheet: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenEntryModal,
  onOpenSheetConfig,
  onSync,
  isSyncing,
  lastSyncTime,
  hasCustomSheet,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dayName = INDONESIAN_DAYS[currentDateTime.getDay()];
  const dateNum = currentDateTime.getDate();
  const monthName = INDONESIAN_MONTHS[currentDateTime.getMonth()];
  const year = currentDateTime.getFullYear();
  const hours = String(currentDateTime.getHours()).padStart(2, '0');
  const minutes = String(currentDateTime.getMinutes()).padStart(2, '0');
  const seconds = String(currentDateTime.getSeconds()).padStart(2, '0');

  const formattedDate = `${dayName}, ${dateNum} ${monthName} ${year}`;
  const formattedTime = `${hours}:${minutes}:${seconds} WIB`;

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-purple-100 via-purple-50 to-indigo-100/90 backdrop-blur-md border-b border-purple-200 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between py-2.5 sm:py-3 gap-3">
          
          {/* Logo & Office Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="relative group shrink-0">
              <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-md shadow-purple-300/60 transition-transform group-hover:scale-105">
                <img
                  src="/assets/aistudio/WhatsApp_Image_2026-10-21_at_12.01.31_732b4a81.jpeg"
                  alt="Logo PKD Tulungagung"
                  className="w-full h-full object-contain rounded-[14px] bg-white p-1"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-white"></span>
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black tracking-wide text-purple-900 uppercase">
                  Bidang Kerjasama
                </span>
                <span className="text-xs font-bold text-purple-700">
                  (Penataan Kerjasama Desa)
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-snug mt-0.5">
                Dinas Pemberdayaan Masyarakat dan Desa
              </h1>
              <p className="text-xs sm:text-sm font-bold text-purple-950 leading-tight">
                Kabupaten Tulungagung
              </p>
              <p className="text-[11px] text-purple-800/80 font-medium">
                Jl. Sultan Agung No.20, Tulungagung
              </p>
            </div>
          </div>

          {/* Header 4 Required Action Tabs */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            
            {/* Tab 1: Waktu Tanggal hari jam */}
            <div 
              className="flex items-center space-x-2 bg-white/95 hover:bg-white text-purple-950 px-3 py-2 rounded-xl border border-purple-200/90 shadow-2xs transition-colors"
              title="Waktu Tanggal Hari Jam (Real-time)"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-purple-700 text-white shadow-xs">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight">
                <div className="text-[11px] font-bold text-purple-950 flex items-center space-x-1">
                  <span>{formattedDate}</span>
                </div>
                <div className="text-[11px] font-mono font-black text-purple-700">
                  {formattedTime}
                </div>
              </div>
            </div>


            {/* Tab 3: Singkro Googlesheet */}
            <div className="inline-flex items-center rounded-xl shadow-2xs border border-purple-300/80 bg-white overflow-hidden">
              <button
                onClick={onSync}
                disabled={isSyncing}
                className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-purple-800 hover:bg-purple-50 transition-colors active:scale-95 disabled:opacity-60 cursor-pointer"
                title="Sinkronisasi Dua Arah dengan Google Sheets"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-purple-700 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Menyinkronkan...' : 'Singkro Googlesheet'}</span>
                {lastSyncTime && !isSyncing && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                )}
              </button>
              <button
                onClick={onOpenSheetConfig}
                className="p-2 border-l border-purple-200 text-purple-600 hover:text-purple-900 hover:bg-purple-50 transition-colors cursor-pointer"
                title="Konfigurasi URL Google Sheets & Apps Script"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tab 4: Entri Agenda */}
            <button
              onClick={onOpenEntryModal}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl shadow-md shadow-purple-300 transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-purple-100" />
              <span>Entri Agenda</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
