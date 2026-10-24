import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Tag, Users, Check, Plus, AlertCircle, FileText } from 'lucide-react';
import { Agenda, AgendaSifat, AgendaStatus, SIFAT_OPTIONS, STATUS_OPTIONS, STAFF_MEMBERS } from '../types/agenda';
import { toDateString, normalizeDateToISO } from '../utils/agenda';

interface AgendaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agenda: Agenda) => void;
  editingAgenda?: Agenda | null;
}

export const AgendaFormModal: React.FC<AgendaFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAgenda,
}) => {
  const [acara, setAcara] = useState('');
  const [tanggal, setTanggal] = useState(toDateString(new Date()));
  const [jam, setJam] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [terkait, setTerkait] = useState('Kerjasama Desa');
  const [sifat, setSifat] = useState<AgendaSifat>('Hadir Fisik/ Rapat');
  const [status, setStatus] = useState<AgendaStatus>('Rencana');
  const [hadir, setHadir] = useState('');
  const [catatan, setCatatan] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Reset or populate fields when modal opens or editingAgenda changes
  useEffect(() => {
    if (editingAgenda) {
      setAcara(editingAgenda.acara || '');
      setTanggal(normalizeDateToISO(editingAgenda.tanggal));
      setJam(editingAgenda.jam || '');
      setLokasi(editingAgenda.lokasi || '');
      setTerkait(editingAgenda.terkait || 'Kerjasama Desa');
      setSifat(editingAgenda.sifat || 'Hadir Fisik/ Rapat');
      setStatus(editingAgenda.status || 'Rencana');
      setHadir(editingAgenda.hadir || '');
      setCatatan(editingAgenda.catatan || '');
    } else {
      setAcara('');
      setTanggal(toDateString(new Date()));
      setJam('');
      setLokasi('');
      setTerkait('Kerjasama Desa'); // Langsung diisikan default
      setSifat('Hadir Fisik/ Rapat');
      setStatus('Rencana');
      setHadir('');
      setCatatan('');
    }
    setErrorMsg('');
  }, [editingAgenda, isOpen]);

  if (!isOpen) return null;

  const handleStaffToggle = (staffName: string) => {
    if (!hadir.trim()) {
      setHadir(staffName);
      return;
    }

    // Check if staff name is already present
    if (hadir.includes(staffName)) {
      // Remove staff name
      let updated = hadir
        .replace(new RegExp(`(\\s*dan\\s*)?${staffName}`, 'gi'), '')
        .replace(new RegExp(`(,\\s*)?${staffName}`, 'gi'), '')
        .replace(/^,\s*|,\s*$/g, '')
        .replace(/^\s*dan\s*|\s*dan\s*$/g, '')
        .trim();
      setHadir(updated);
    } else {
      // Append staff name nicely with "dan" or comma
      if (staffName === 'Semua Staf Bid. Kerjasama') {
        setHadir('Semua Staf Bid. Kerjasama');
      } else {
        setHadir((prev) => `${prev.trim()} dan ${staffName}`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acara.trim()) {
      setErrorMsg('Nama Acara wajib diisi!');
      return;
    }
    if (!tanggal) {
      setErrorMsg('Tanggal kegiatan wajib dipilih!');
      return;
    }

    const agendaData: Agenda = {
      id: editingAgenda ? editingAgenda.id : `pkd-${Date.now()}`,
      acara: acara.trim(),
      tanggal: normalizeDateToISO(tanggal),
      jam: jam.trim(),
      lokasi: lokasi.trim(),
      terkait: terkait.trim() || 'Kerjasama Desa',
      sifat,
      status,
      hadir: hadir.trim(),
      catatan: catatan.trim(),
      createdAt: editingAgenda?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(agendaData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-800 px-6 py-4.5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs border border-white/20">
              <FileText className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-bold">
                {editingAgenda ? 'Ubah Data Agenda Kegiatan' : 'Entri Agenda Kegiatan Baru'}
              </h2>
              <p className="text-xs text-purple-200">
                Bidang PKD • DPMD Kabupaten Tulungagung
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-purple-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5 max-h-[78vh] overflow-y-auto">
          {errorMsg && (
            <div className="flex items-center space-x-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Acara (Manual typing, no recommendations) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Nama Acara / Kegiatan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={acara}
              onChange={(e) => setAcara(e.target.value)}
              placeholder="Ketik nama acara secara manual..."
              autoComplete="off"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 focus:ring-3 focus:ring-purple-100 transition-all outline-hidden text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Tanggal & Waktu/Jam */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Tanggal Kegiatan <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 focus:ring-3 focus:ring-purple-100 transition-all outline-hidden text-slate-900 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Jam / Waktu <span className="text-slate-400 font-normal">(Ketik Manual)</span>
              </label>
              <input
                type="text"
                value={jam}
                onChange={(e) => setJam(e.target.value)}
                placeholder="Contoh: 09.00 WIB atau 08.30 - Selesai"
                autoComplete="off"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 focus:ring-3 focus:ring-purple-100 transition-all outline-hidden text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Lokasi (Manual typing, no recommendations) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Tempat / Lokasi Kegiatan <span className="text-slate-400 font-normal">(Ketik Manual)</span>
            </label>
            <input
              type="text"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              placeholder="Ketik lokasi kegiatan secara manual (tanpa rekomendasi)..."
              autoComplete="off"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 focus:ring-3 focus:ring-purple-100 transition-all outline-hidden text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Terkait, Sifat & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Terkait
              </label>
              <input
                type="text"
                value={terkait}
                onChange={(e) => setTerkait(e.target.value)}
                placeholder="Kerjasama Desa"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all outline-hidden text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Sifat Kegiatan
              </label>
              <select
                value={sifat}
                onChange={(e) => setSifat(e.target.value as AgendaSifat)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all outline-hidden text-slate-900 cursor-pointer"
              >
                {SIFAT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Status Pelaksanaan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AgendaStatus)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all outline-hidden text-slate-900 cursor-pointer"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Hadir Section with Tambah Cepat Badges */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Petugas / Hadir
              </label>
              {hadir && (
                <button
                  type="button"
                  onClick={() => setHadir('')}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                >
                  Kosongkan
                </button>
              )}
            </div>

            <textarea
              rows={2}
              value={hadir}
              onChange={(e) => setHadir(e.target.value)}
              placeholder="Contoh: Eka Priyantin dan Sri Andiyah (bisa ketik manual atau klik tombol Tambah Cepat di bawah)"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 focus:ring-3 focus:ring-purple-100 transition-all outline-hidden text-slate-900 placeholder:text-slate-400"
            />

            {/* Tambah Cepat Staff Badges */}
            <div className="mt-2.5 p-3 rounded-2xl bg-purple-50/70 border border-purple-100">
              <span className="text-[11px] font-bold text-purple-900 block mb-2">
                ⚡ Tambah Cepat (Klik nama pegawai untuk menambahkan):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {STAFF_MEMBERS.map((staff) => {
                  const isSelected = hadir.toLowerCase().includes(staff.toLowerCase());
                  return (
                    <button
                      key={staff}
                      type="button"
                      onClick={() => handleStaffToggle(staff)}
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-700 text-white shadow-2xs'
                          : 'bg-white text-purple-900 border border-purple-200 hover:bg-purple-100 hover:border-purple-300'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3 h-3 mr-1 text-purple-200" />
                      ) : (
                        <Plus className="w-3 h-3 mr-1 text-purple-500" />
                      )}
                      <span>{staff}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Catatan / Keterangan Tambahan */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Catatan / Keterangan <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan tambahan, link zoom, perlengkapan yang perlu dibawa..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all outline-hidden text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl shadow-md shadow-purple-300 transition-all active:scale-95 cursor-pointer"
            >
              {editingAgenda ? 'Simpan Perubahan' : 'Tambah ke Agenda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
