import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Search, Filter, Share2, PlusCircle, RefreshCw, 
  ArrowUpDown, CheckCircle, AlertCircle, Info, ChevronRight, ChevronLeft,
  ListFilter, Sparkles, Building2, Layers, CalendarCheck, CalendarClock, CalendarDays
} from 'lucide-react';
import { Agenda, AgendaSifat, AgendaStatus, GoogleSheetConfig, ViewTab, STAFF_MEMBERS } from './types/agenda';
import { 
  loadAgendas, saveAgendas, loadSheetConfig, saveSheetConfig, 
  syncFromGoogleSheet, pushToGoogleSheet 
} from './services/storage';
import { 
  filterAndSortAgendas, isToday, isTomorrow, isUpcoming, 
  formatIndonesianDate, toDateString, normalizeDateToISO, autoUpdatePastAgendas 
} from './utils/agenda';
import { Header } from './components/Header';
import { AgendaCard } from './components/AgendaCard';
import { AgendaFormModal } from './components/AgendaFormModal';
import { WhatsAppShareModal } from './components/WhatsAppShareModal';
import { GoogleSheetModal } from './components/GoogleSheetModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';

export default function App() {
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig>(loadSheetConfig());
  const [activeTab, setActiveTab] = useState<ViewTab>('hari-ini');
  
  // Filters & Sorting (without staff filter)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AgendaStatus | 'Semua'>('Semua');
  const [sifatFilter, setSifatFilter] = useState<AgendaSifat | 'Semua'>('Semua');
  const [sortOrder, setSortOrder] = useState<'date-asc' | 'date-desc'>('date-asc');

  // Modals state
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<Agenda | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAgenda, setDeletingAgenda] = useState<Agenda | null>(null);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareAgendasList, setShareAgendasList] = useState<Agenda[]>([]);
  const [shareModalTitle, setShareModalTitle] = useState('Bagikan Agenda ke WhatsApp');
  const [shareTargetDate, setShareTargetDate] = useState<string | undefined>(undefined);

  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Load initial data
  useEffect(() => {
    const loaded = loadAgendas();
    setAgendas(loaded);

    // Listen for storage changes from other tabs
    const handleStorageUpdate = (e: any) => {
      if (e.detail) {
        setAgendas(e.detail);
      }
    };
    window.addEventListener('pkd_agendas_updated', handleStorageUpdate);
    return () => window.removeEventListener('pkd_agendas_updated', handleStorageUpdate);
  }, []);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Tab counts
  const counts = useMemo(() => {
    const todayCount = agendas.filter(a => isToday(a.tanggal)).length;
    const tomorrowCount = agendas.filter(a => isTomorrow(a.tanggal)).length;
    const upcomingCount = agendas.filter(a => isUpcoming(a.tanggal)).length;
    return {
      'hari-ini': todayCount,
      'besuk': tomorrowCount,
      'mendatang': upcomingCount,
      'semua': agendas.length,
    };
  }, [agendas]);

  // Pagination configuration (6 items per page if exceeding 6)
  const ITEMS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  // Filtered & sorted agendas
  const displayedAgendas = useMemo(() => {
    return filterAndSortAgendas(agendas, {
      tab: activeTab,
      searchQuery,
      statusFilter,
      sifatFilter,
      sortOrder,
    });
  }, [agendas, activeTab, searchQuery, statusFilter, sifatFilter, sortOrder]);

  // Reset to page 1 whenever activeTab or any filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, statusFilter, sifatFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(displayedAgendas.length / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  // Paginated items (only sliced if items exceed 6)
  const paginatedAgendas = useMemo(() => {
    if (displayedAgendas.length <= ITEMS_PER_PAGE) {
      return displayedAgendas;
    }
    const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    return displayedAgendas.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [displayedAgendas, validCurrentPage, ITEMS_PER_PAGE]);

  // Google Sheets Sync handler
  const handleSync = async () => {
    if (!sheetConfig.webAppUrl && !sheetConfig.sheetUrl) {
      setIsSheetModalOpen(true);
      showToast('Silakan tautkan URL Google Sheet atau Apps Script Web App terlebih dahulu.', 'info');
      return;
    }
    setIsSyncing(true);
    try {
      const result = await syncFromGoogleSheet(sheetConfig, agendas);
      if (result.success) {
        setAgendas(result.agendas);
        const updatedConfig = { ...sheetConfig, lastSyncedAt: new Date().toLocaleTimeString('id-ID') };
        setSheetConfig(updatedConfig);
        saveSheetConfig(updatedConfig);
        showToast(result.message, 'success');
      } else {
        showToast('Sinkronisasi selesai dengan data lokal.', 'info');
      }
    } catch (err: any) {
      showToast('Gagal terhubung ke Google Sheets: ' + (err.message || 'Error'), 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Save agenda (Create or Update)
  const handleSaveAgenda = (agenda: Agenda) => {
    const cleanDate = normalizeDateToISO(agenda.tanggal);
    const todayStr = toDateString(new Date());

    // Automatically set status to 'Selesai Terlaksana' if the date has passed
    let finalStatus = agenda.status;
    if (cleanDate < todayStr) {
      finalStatus = 'Selesai Terlaksana';
    }

    const cleanAgenda: Agenda = {
      ...agenda,
      status: finalStatus,
      tanggal: cleanDate,
    };
    let updated: Agenda[];
    const exists = agendas.some(a => a.id === cleanAgenda.id);

    if (exists) {
      updated = agendas.map(a => a.id === cleanAgenda.id ? cleanAgenda : a);
      showToast(`Agenda "${cleanAgenda.acara}" berhasil diperbarui!`, 'success');
    } else {
      updated = [cleanAgenda, ...agendas];
      showToast(`Agenda "${cleanAgenda.acara}" berhasil ditambahkan!`, 'success');
    }

    setAgendas(updated);
    saveAgendas(updated);

    // Auto-sync to Google Sheet if configured
    if (sheetConfig.autoSync && sheetConfig.webAppUrl) {
      pushToGoogleSheet(sheetConfig, updated);
    }
  };

  // Status quick change
  const handleStatusChange = (agenda: Agenda, newStatus: AgendaStatus) => {
    const updated = agendas.map(a => a.id === agenda.id ? { ...a, status: newStatus, updatedAt: new Date().toISOString() } : a);
    setAgendas(updated);
    saveAgendas(updated);
    showToast(`Status "${agenda.acara}" diubah ke: ${newStatus}`, 'info');

    if (sheetConfig.autoSync && sheetConfig.webAppUrl) {
      pushToGoogleSheet(sheetConfig, updated);
    }
  };

  // Delete agenda
  const handleDeleteConfirm = () => {
    if (!deletingAgenda) return;
    const updated = agendas.filter(a => a.id !== deletingAgenda.id);
    setAgendas(updated);
    saveAgendas(updated);
    showToast(`Agenda "${deletingAgenda.acara}" telah dihapus`, 'info');
    setIsDeleteModalOpen(false);
    setDeletingAgenda(null);

    if (sheetConfig.autoSync && sheetConfig.webAppUrl) {
      pushToGoogleSheet(sheetConfig, updated);
    }
  };

  // Share single agenda
  const handleShareSingle = (agenda: Agenda) => {
    setShareAgendasList([agenda]);
    setShareModalTitle(`Bagikan: ${agenda.acara}`);
    setShareTargetDate(agenda.tanggal);
    setIsShareModalOpen(true);
  };

  // Share batch: Hari Ini
  const handleShareHariIni = () => {
    const todayItems = agendas.filter(a => isToday(a.tanggal));
    setShareAgendasList(todayItems);
    setShareModalTitle('Bagikan Semua Agenda Hari Ini ke WhatsApp');
    setShareTargetDate(toDateString(new Date()));
    setIsShareModalOpen(true);
  };

  // Share batch: Besuk
  const handleShareBesuk = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowItems = agendas.filter(a => isTomorrow(a.tanggal));
    setShareAgendasList(tomorrowItems);
    setShareModalTitle('Bagikan Semua Agenda Besuk ke WhatsApp');
    setShareTargetDate(toDateString(tomorrow));
    setIsShareModalOpen(true);
  };

  // Share batch: current view
  const handleShareCurrentView = () => {
    setShareAgendasList(displayedAgendas);
    setShareModalTitle(`Bagikan ${displayedAgendas.length} Agenda Terpilih ke WhatsApp`);
    setShareTargetDate(undefined);
    setIsShareModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className={`flex items-center space-x-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold text-white ${
            toastMessage.type === 'error' ? 'bg-rose-600' :
            toastMessage.type === 'info' ? 'bg-indigo-600' : 'bg-emerald-600'
          }`}>
            {toastMessage.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header
        onOpenEntryModal={() => {
          setEditingAgenda(null);
          setIsEntryModalOpen(true);
        }}
        onOpenSheetConfig={() => setIsSheetModalOpen(true)}
        onSync={handleSync}
        isSyncing={isSyncing}
        lastSyncTime={sheetConfig.lastSyncedAt}
        hasCustomSheet={Boolean(sheetConfig.webAppUrl || sheetConfig.sheetUrl)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Banner Card / Welcome Intro */}
        <div className="mb-6 relative overflow-hidden bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-purple-900/10">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-purple-200 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Dashboard Resmi Bidang Penataan Kerjasama Desa</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight">
                Agenda Kegiatan PKD DPMD Kab. Tulungagung
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-purple-200/90 leading-relaxed">
                Pencatatan kegiatan koordinasi, rapat fasilitasi, dan kunjungan lapangan desa dengan sinkronisasi Google Sheets & publikasi WhatsApp cepat.
              </p>
            </div>

            {/* Quick Share Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleShareHariIni}
                className="inline-flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                title="Format WhatsApp untuk semua agenda hari ini"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share WA Hari Ini</span>
                <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded-full text-[10px]">
                  {counts['hari-ini']}
                </span>
              </button>

              <button
                onClick={handleShareBesuk}
                className="inline-flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold text-white bg-white/15 hover:bg-white/25 border border-white/25 rounded-xl backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                title="Format WhatsApp untuk semua agenda besuk"
              >
                <Share2 className="w-3.5 h-3.5 text-purple-200" />
                <span>Share WA Besuk</span>
                <span className="bg-purple-950/60 text-purple-200 px-1.5 py-0.5 rounded-full text-[10px]">
                  {counts['besuk']}
                </span>
              </button>
            </div>
          </div>
          
          {/* Subtle background graphic */}
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Navigation Tabs (Hari Ini, Besuk, Mendatang, Semua) */}
        {/* Large Prominent Navigation Tabs with Rekap Jumlah Kegiatan */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-6">
          
          {/* Tab 1: Hari Ini */}
          <button
            onClick={() => setActiveTab('hari-ini')}
            className={`group relative text-left p-4 sm:p-5 rounded-3xl transition-all duration-200 cursor-pointer border flex flex-col justify-between ${
              activeTab === 'hari-ini'
                ? 'bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-800 text-white border-purple-600 shadow-lg shadow-purple-300 ring-2 ring-purple-600 ring-offset-2'
                : 'bg-white text-slate-800 border-purple-100/90 hover:border-purple-300 hover:bg-purple-50/40 shadow-xs'
            }`}
            aria-selected={activeTab === 'hari-ini'}
            role="tab"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                activeTab === 'hari-ini'
                  ? 'bg-white/20 text-white backdrop-blur-xs'
                  : 'bg-purple-100 text-purple-700 group-hover:bg-purple-200'
              }`}>
                <CalendarCheck className="w-6 h-6" />
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                activeTab === 'hari-ini'
                  ? 'bg-rose-400/30 text-rose-100 border border-rose-300/30'
                  : 'bg-rose-50 text-rose-700 border border-rose-100'
              }`}>
                Hari Ini
              </span>
            </div>

            <div>
              <div className="text-sm sm:text-base font-extrabold tracking-tight">
                Kegiatan Hari Ini
              </div>
              <p className={`text-xs mt-0.5 ${
                activeTab === 'hari-ini' ? 'text-purple-200' : 'text-slate-500'
              }`}>
                Jadwal agenda hari ini
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-current/15 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black tracking-tight">
                {counts['hari-ini']}
              </span>
              <span className={`text-xs font-bold ${
                activeTab === 'hari-ini' ? 'text-purple-200' : 'text-purple-700'
              }`}>
                Agenda Terjadwal
              </span>
            </div>
          </button>

          {/* Tab 2: Besuk */}
          <button
            onClick={() => setActiveTab('besuk')}
            className={`group relative text-left p-4 sm:p-5 rounded-3xl transition-all duration-200 cursor-pointer border flex flex-col justify-between ${
              activeTab === 'besuk'
                ? 'bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-800 text-white border-purple-600 shadow-lg shadow-purple-300 ring-2 ring-purple-600 ring-offset-2'
                : 'bg-white text-slate-800 border-purple-100/90 hover:border-purple-300 hover:bg-purple-50/40 shadow-xs'
            }`}
            aria-selected={activeTab === 'besuk'}
            role="tab"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                activeTab === 'besuk'
                  ? 'bg-white/20 text-white backdrop-blur-xs'
                  : 'bg-blue-100 text-blue-700 group-hover:bg-blue-200'
              }`}>
                <CalendarClock className="w-6 h-6" />
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                activeTab === 'besuk'
                  ? 'bg-blue-400/30 text-blue-100 border border-blue-300/30'
                  : 'bg-blue-50 text-blue-700 border border-blue-100'
              }`}>
                Besuk
              </span>
            </div>

            <div>
              <div className="text-sm sm:text-base font-extrabold tracking-tight">
                Kegiatan Besuk
              </div>
              <p className={`text-xs mt-0.5 ${
                activeTab === 'besuk' ? 'text-purple-200' : 'text-slate-500'
              }`}>
                Jadwal agenda esok hari
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-current/15 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black tracking-tight">
                {counts['besuk']}
              </span>
              <span className={`text-xs font-bold ${
                activeTab === 'besuk' ? 'text-purple-200' : 'text-purple-700'
              }`}>
                Agenda Terjadwal
              </span>
            </div>
          </button>

          {/* Tab 3: Mendatang */}
          <button
            onClick={() => setActiveTab('mendatang')}
            className={`group relative text-left p-4 sm:p-5 rounded-3xl transition-all duration-200 cursor-pointer border flex flex-col justify-between ${
              activeTab === 'mendatang'
                ? 'bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-800 text-white border-purple-600 shadow-lg shadow-purple-300 ring-2 ring-purple-600 ring-offset-2'
                : 'bg-white text-slate-800 border-purple-100/90 hover:border-purple-300 hover:bg-purple-50/40 shadow-xs'
            }`}
            aria-selected={activeTab === 'mendatang'}
            role="tab"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                activeTab === 'mendatang'
                  ? 'bg-white/20 text-white backdrop-blur-xs'
                  : 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200'
              }`}>
                <CalendarDays className="w-6 h-6" />
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                activeTab === 'mendatang'
                  ? 'bg-emerald-400/30 text-emerald-100 border border-emerald-300/30'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              }`}>
                Mendatang
              </span>
            </div>

            <div>
              <div className="text-sm sm:text-base font-extrabold tracking-tight">
                Kegiatan Mendatang
              </div>
              <p className={`text-xs mt-0.5 ${
                activeTab === 'mendatang' ? 'text-purple-200' : 'text-slate-500'
              }`}>
                Agenda hari-hari selanjutnya
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-current/15 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black tracking-tight">
                {counts['mendatang']}
              </span>
              <span className={`text-xs font-bold ${
                activeTab === 'mendatang' ? 'text-purple-200' : 'text-purple-700'
              }`}>
                Agenda Terjadwal
              </span>
            </div>
          </button>

          {/* Tab 4: Semua Agenda */}
          <button
            onClick={() => setActiveTab('semua')}
            className={`group relative text-left p-4 sm:p-5 rounded-3xl transition-all duration-200 cursor-pointer border flex flex-col justify-between ${
              activeTab === 'semua'
                ? 'bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-800 text-white border-purple-600 shadow-lg shadow-purple-300 ring-2 ring-purple-600 ring-offset-2'
                : 'bg-white text-slate-800 border-purple-100/90 hover:border-purple-300 hover:bg-purple-50/40 shadow-xs'
            }`}
            aria-selected={activeTab === 'semua'}
            role="tab"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                activeTab === 'semua'
                  ? 'bg-white/20 text-white backdrop-blur-xs'
                  : 'bg-purple-100 text-purple-700 group-hover:bg-purple-200'
              }`}>
                <Layers className="w-6 h-6" />
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                activeTab === 'semua'
                  ? 'bg-white/20 text-white border border-white/20'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                Semua Arsip
              </span>
            </div>

            <div>
              <div className="text-sm sm:text-base font-extrabold tracking-tight">
                Semua Agenda
              </div>
              <p className={`text-xs mt-0.5 ${
                activeTab === 'semua' ? 'text-purple-200' : 'text-slate-500'
              }`}>
                Seluruh rekapan kegiatan PKD
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-current/15 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black tracking-tight">
                {counts['semua']}
              </span>
              <span className={`text-xs font-bold ${
                activeTab === 'semua' ? 'text-purple-200' : 'text-purple-700'
              }`}>
                Total Kegiatan
              </span>
            </div>
          </button>

        </div>

        {/* Filter and Search Bar (Tanpa sortir petugas) */}
        <div className="bg-white rounded-2xl border border-purple-100/90 p-4 mb-6 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari acara, lokasi kegiatan..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all outline-hidden text-slate-900 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Sifat Kegiatan */}
            <div>
              <select
                value={sifatFilter}
                onChange={(e) => setSifatFilter(e.target.value as any)}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all outline-hidden text-slate-900 cursor-pointer"
              >
                <option value="Semua">Semua Sifat Kegiatan</option>
                <option value="Hadir Fisik/ Rapat">Hadir Fisik/ Rapat</option>
                <option value="Daring/ Zoom">Daring/ Zoom</option>
                <option value="Lapangan/ Desa">Lapangan/ Desa</option>
              </select>
            </div>

            {/* Filter Status */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all outline-hidden text-slate-900 cursor-pointer"
              >
                <option value="Semua">Semua Status</option>
                <option value="Rencana">Rencana</option>
                <option value="Sedang Berlangsung/ Hari ini">Sedang Berlangsung</option>
                <option value="Selesai Terlaksana">Selesai Terlaksana</option>
              </select>
            </div>

            {/* Sort by Date & Time */}
            <div>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full px-3 py-2.5 text-xs bg-purple-50/70 border border-purple-200 rounded-xl focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all outline-hidden text-purple-900 font-semibold cursor-pointer"
              >
                <option value="date-asc">Urut Tanggal Terdekat</option>
                <option value="date-desc">Urut Tanggal Terbaru</option>
              </select>
            </div>

          </div>
        </div>

        {/* Agenda Cards Grid */}
        {displayedAgendas.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedAgendas.map((agenda) => (
                <AgendaCard
                  key={agenda.id}
                  agenda={agenda}
                  onEdit={(item) => {
                    setEditingAgenda(item);
                    setIsEntryModalOpen(true);
                  }}
                  onDelete={(item) => {
                    setDeletingAgenda(item);
                    setIsDeleteModalOpen(true);
                  }}
                  onShareWhatsApp={handleShareSingle}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>

            {/* Pagination Controls when items exceed 6 */}
            {displayedAgendas.length > ITEMS_PER_PAGE && (
              <div className="mt-8 bg-white border border-purple-100 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-600 font-medium">
                  Menampilkan <span className="font-bold text-purple-900">{(validCurrentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-bold text-purple-900">{Math.min(validCurrentPage * ITEMS_PER_PAGE, displayedAgendas.length)}</span> dari <span className="font-bold text-purple-900">{displayedAgendas.length}</span> agenda kegiatan
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={validCurrentPage === 1}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-purple-50 hover:text-purple-900 hover:border-purple-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    title="Halaman Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          validCurrentPage === pageNum
                            ? 'bg-purple-700 text-white shadow-sm shadow-purple-300'
                            : 'bg-white text-slate-600 hover:bg-purple-50 hover:text-purple-900 border border-slate-200/80'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={validCurrentPage === totalPages}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-purple-50 hover:text-purple-900 hover:border-purple-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    title="Halaman Berikutnya"
                  >
                    <span className="hidden sm:inline">Berikutnya</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-dashed border-purple-200 p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4 border border-purple-100 shadow-inner">
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
              Tidak Ada Agenda Kegiatan
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              {searchQuery || statusFilter !== 'Semua' || sifatFilter !== 'Semua'
                ? 'Tidak ada agenda yang cocok dengan kriteria pencarian dan filter yang dipilih.'
                : activeTab === 'hari-ini'
                ? 'Belum ada agenda kegiatan yang dijadwalkan untuk hari ini.'
                : activeTab === 'besuk'
                ? 'Belum ada agenda kegiatan yang dijadwalkan untuk besuk.'
                : 'Belum ada agenda yang tersimpan.'}
            </p>
            <button
              onClick={() => {
                setEditingAgenda(null);
                setIsEntryModalOpen(true);
              }}
              className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl shadow-md shadow-purple-200 transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Data Agenda Baru</span>
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-purple-100 py-6 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <img
              src="/assets/aistudio/WhatsApp_Image_2026-10-21_at_12.01.31_732b4a81.jpeg"
              alt="Logo PKD Tulungagung"
              className="w-8 h-8 object-contain rounded-lg border border-purple-100"
            />
            <div>
              <p className="font-bold text-slate-800">
                Bidang PKD (Penataan Kerjasama Desa)
              </p>
              <p className="text-[11px] text-slate-500">
                Dinas Pemberdayaan Masyarakat dan Desa Kabupaten Tulungagung • Jl. Sultan Agung No.20
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-400">
            <span>Sistem Agenda Real-time & Two-Way Sync Google Sheets</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AgendaFormModal
        isOpen={isEntryModalOpen}
        onClose={() => {
          setIsEntryModalOpen(false);
          setEditingAgenda(null);
        }}
        onSave={handleSaveAgenda}
        editingAgenda={editingAgenda}
      />

      <WhatsAppShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        agendas={shareAgendasList}
        title={shareModalTitle}
        targetDateStr={shareTargetDate}
      />

      <GoogleSheetModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        config={sheetConfig}
        onSaveConfig={(newCfg) => {
          setSheetConfig(newCfg);
          saveSheetConfig(newCfg);
          showToast('Pengaturan Google Sheets tersimpan!', 'success');
        }}
        onSyncNow={handleSync}
        isSyncing={isSyncing}
        agendas={agendas}
        onImportAgendas={(imported) => {
          setAgendas(imported);
          saveAgendas(imported);
          showToast(`Berhasil mengimpor ${imported.length} agenda!`, 'success');
        }}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingAgenda(null);
        }}
        onConfirm={handleDeleteConfirm}
        agenda={deletingAgenda}
      />

    </div>
  );
}
