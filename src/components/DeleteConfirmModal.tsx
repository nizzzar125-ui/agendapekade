import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Agenda } from '../types/agenda';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  agenda: Agenda | null;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  agenda,
}) => {
  if (!isOpen || !agenda) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-1">
            Hapus Agenda Kegiatan?
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Apakah Anda yakin ingin menghapus kegiatan:
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-6 text-left">
            <p className="font-bold text-xs text-slate-900 line-clamp-2">
              {agenda.acara}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {agenda.tanggal} • {agenda.jam || 'Waktu tidak ditentukan'}
            </p>
          </div>

          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-200 transition-all active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Ya, Hapus Kegiatan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
