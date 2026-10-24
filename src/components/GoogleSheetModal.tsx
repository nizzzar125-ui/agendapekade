import React, { useState } from 'react';
import { 
  X, Sheet, Check, Copy, ExternalLink, RefreshCw, 
  HelpCircle, Download, Upload, ShieldCheck, Sparkles 
} from 'lucide-react';
import { GoogleSheetConfig, Agenda } from '../types/agenda';
import { GOOGLE_APPS_SCRIPT_TEMPLATE, parseCSVToAgendas } from '../services/storage';
import { exportToCSV } from '../utils/agenda';

interface GoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GoogleSheetConfig;
  onSaveConfig: (newConfig: GoogleSheetConfig) => void;
  onSyncNow: () => void;
  isSyncing: boolean;
  agendas: Agenda[];
  onImportAgendas: (imported: Agenda[]) => void;
}

export const GoogleSheetModal: React.FC<GoogleSheetModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onSyncNow,
  isSyncing,
  agendas,
  onImportAgendas,
}) => {
  const [sheetUrl, setSheetUrl] = useState(config.sheetUrl || '');
  const [webAppUrl, setWebAppUrl] = useState(config.webAppUrl || '');
  const [autoSync, setAutoSync] = useState(config.autoSync !== false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      sheetUrl: sheetUrl.trim(),
      webAppUrl: webAppUrl.trim(),
      autoSync,
    });
    setSaveStatus('Konfigurasi berhasil disimpan!');
    setTimeout(() => {
      setSaveStatus('');
      onClose();
    }, 1200);
  };

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = GOOGLE_APPS_SCRIPT_TEMPLATE;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleExportCSV = () => {
    const csvData = exportToCSV(agendas);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Agenda_PKD_Tulungagung_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const imported = parseCSVToAgendas(text);
        if (imported.length > 0) {
          onImportAgendas(imported);
          alert(`Berhasil mengimpor ${imported.length} agenda dari file CSV!`);
        } else {
          alert('Tidak ada data agenda yang valid ditemukan dalam file CSV.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 px-6 py-4.5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs border border-white/20">
              <Sheet className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Sinkronisasi Google Sheets</h2>
              <p className="text-xs text-emerald-100">
                Penyimpanan Otomatis Real-time & Sinkronisasi Dua Arah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
          
          {saveStatus && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">{saveStatus}</span>
            </div>
          )}

          {/* Quick Notice */}
          <div className="p-3.5 bg-purple-50/80 rounded-2xl border border-purple-100 flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div className="text-xs text-purple-900 leading-relaxed">
              <p className="font-bold">Dua Arah (Two-Way Sync):</p>
              <p className="mt-0.5 text-purple-800">
                Data yang ditambahkan atau diedit di dashboard akan otomatis masuk ke Google Sheet. Sebaliknya, perubahan langsung di Google Sheet dapat ditarik kapan saja dengan mengklik tombol <b>Singkro Googlesheet</b> di header.
              </p>
            </div>
          </div>

          {/* Sheet URL Input */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              1. URL Google Sheet Anda (Link Spreadsheet)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all outline-hidden text-slate-900"
              />
              {sheetUrl && (
                <a
                  href={sheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold flex items-center space-x-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka</span>
                </a>
              )}
            </div>
          </div>

          {/* Apps Script Web App URL */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-800">
                2. URL Web App Apps Script (Untuk Sinkronisasi Otomatis Real-time)
              </label>
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showGuide ? 'Sembunyikan Panduan' : 'Lihat Cara Pasang'}</span>
              </button>
            </div>
            <input
              type="url"
              value={webAppUrl}
              onChange={(e) => setWebAppUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all outline-hidden text-slate-900"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Jika kosong, dashboard tetap bekerja dengan penyimpanan data lokal dan ekspor/impor CSV.
            </p>
          </div>

          {/* Guide Section */}
          {showGuide && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">
                  📋 Kode Google Apps Script (Siap Tempel):
                </span>
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="px-2.5 py-1 text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 rounded-lg flex items-center space-x-1 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Tersalin!' : 'Salin Kode Script'}</span>
                </button>
              </div>

              <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
                <li>Buka Google Spreadsheet Anda.</li>
                <li>Klik menu <b>Ekstensi (Extensions) &gt; Apps Script</b>.</li>
                <li>Hapus kode bawaan dan tempel kode yang disalin di atas.</li>
                <li>Klik tombol <b>Terapkan (Deploy) &gt; Deployment baru</b>.</li>
                <li>Pilih tipe: <b>Aplikasi Web (Web app)</b>.</li>
                <li>Set "Jalankan sebagai": <b>Saya</b>, dan "Siapa yang memiliki akses": <b>Siapa saja (Anyone)</b>.</li>
                <li>Klik <b>Terapkan</b>, izinkan akses, lalu salin URL yang berakhiran <code>/exec</code> ke kolom di atas.</li>
              </ol>
            </div>
          )}

          {/* Auto-sync Switch */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="font-bold text-slate-900 text-xs block">
                Otomatis Simpan Perubahan ke Google Sheets
              </span>
              <span className="text-[11px] text-slate-500">
                Kirim data secara otomatis setiap kali ada entri agenda baru atau pengeditan
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Backup / Export Import Tools */}
          <div className="pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-900 text-xs block mb-2">
              Cadangan & Impor Cepat (CSV/Excel)
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Unduh File CSV / Spreadsheet</span>
              </button>

              <label className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>Impor File CSV</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onSyncNow}
              disabled={isSyncing}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sinkronisasi...' : 'Uji & Sinkron Sekarang'}</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md shadow-emerald-200 transition-all active:scale-95 cursor-pointer"
              >
                Simpan Pengaturan
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
