import React from 'react';
import { 
  Calendar, Clock, MapPin, Tag, Users, Share2, 
  Edit3, Trash2, CheckCircle2, AlertCircle, PlayCircle,
  Video, Building2, Compass, MessageSquare
} from 'lucide-react';
import { Agenda, AgendaSifat, AgendaStatus } from '../types/agenda';
import { formatIndonesianDate, getRelativeDayLabel } from '../utils/agenda';

interface AgendaCardProps {
  agenda: Agenda;
  onEdit: (agenda: Agenda) => void;
  onDelete: (agenda: Agenda) => void;
  onShareWhatsApp: (agenda: Agenda) => void;
  onStatusChange?: (agenda: Agenda, newStatus: AgendaStatus) => void;
}

export const AgendaCard: React.FC<AgendaCardProps> = ({
  agenda,
  onEdit,
  onDelete,
  onShareWhatsApp,
  onStatusChange,
}) => {
  const relLabel = getRelativeDayLabel(agenda.tanggal);

  const getStatusBadge = (status: AgendaStatus) => {
    switch (status) {
      case 'Sedang Berlangsung/ Hari ini':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse mr-1.5" />
            Sedang Berlangsung
          </span>
        );
      case 'Selesai Terlaksana':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Selesai Terlaksana
          </span>
        );
      case 'Rencana':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />
            Rencana
          </span>
        );
    }
  };

  const getSifatBadge = (sifat: AgendaSifat) => {
    switch (sifat) {
      case 'Daring/ Zoom':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <Video className="w-3 h-3 mr-1 text-cyan-600" />
            Daring / Zoom
          </span>
        );
      case 'Lapangan/ Desa':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            <Compass className="w-3 h-3 mr-1 text-teal-600" />
            Lapangan / Desa
          </span>
        );
      case 'Hadir Fisik/ Rapat':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Building2 className="w-3 h-3 mr-1 text-indigo-600" />
            Hadir Fisik / Rapat
          </span>
        );
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-purple-100/80 p-5 shadow-xs hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between">
      <div>
        {/* Top Badges & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {getStatusBadge(agenda.status)}
            {getSifatBadge(agenda.sifat)}
            {relLabel && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                relLabel === 'Hari Ini' 
                  ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                  : relLabel === 'Besuk' 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {relLabel}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1 opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onShareWhatsApp(agenda)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
              title="Share Agenda ke WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(agenda)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-purple-600 hover:bg-purple-50 hover:text-purple-700 transition-colors cursor-pointer"
              title="Edit Agenda"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(agenda)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
              title="Hapus Agenda"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title / Acara */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-purple-900 transition-colors mb-3 leading-snug">
          {agenda.acara}
        </h3>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600 mb-4 bg-purple-50/40 p-3.5 rounded-xl border border-purple-50">
          
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
            <span className="font-semibold text-slate-800">
              {formatIndonesianDate(agenda.tanggal)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-purple-600 shrink-0" />
            <span className="font-medium text-slate-700">
              {agenda.jam || 'Waktu belum diatur'}
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:col-span-2">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="font-medium text-slate-700 truncate">
              {agenda.lokasi || 'Lokasi belum diisi'}
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:col-span-2">
            <Tag className="w-4 h-4 text-purple-600 shrink-0" />
            <span className="font-semibold text-purple-900 bg-purple-100/70 px-2 py-0.5 rounded text-[11px]">
              Terkait: {agenda.terkait || 'Kerjasama Desa'}
            </span>
          </div>

          <div className="flex items-start space-x-2 sm:col-span-2 pt-1 border-t border-purple-100/60">
            <Users className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900">Petugas / Hadir:</span>
              <p className="text-slate-700 font-medium mt-0.5">
                {agenda.hadir || 'Belum ada petugas terdaftar'}
              </p>
            </div>
          </div>

          {agenda.catatan && (
            <div className="flex items-start space-x-2 sm:col-span-2 pt-1 border-t border-purple-100/60 text-slate-500 italic">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <p className="line-clamp-2">{agenda.catatan}</p>
            </div>
          )}

        </div>
      </div>

      {/* Quick Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1 text-[11px] text-slate-400">
          <span>Status:</span>
          {onStatusChange ? (
            <select
              value={agenda.status}
              onChange={(e) => onStatusChange(agenda, e.target.value as AgendaStatus)}
              className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-md px-1.5 py-0.5 cursor-pointer focus:outline-hidden"
            >
              <option value="Rencana">Rencana</option>
              <option value="Sedang Berlangsung/ Hari ini">Sedang Berlangsung</option>
              <option value="Selesai Terlaksana">Selesai Terlaksana</option>
            </select>
          ) : (
            <span className="font-semibold text-purple-700">{agenda.status}</span>
          )}
        </div>

        <button
          onClick={() => onShareWhatsApp(agenda)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Kirim WA</span>
        </button>
      </div>
    </div>
  );
};
