import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageSquare, Send } from 'lucide-react';
import { Agenda } from '../types/agenda';
import { generateWhatsAppMessage, getWhatsAppShareUrl } from '../utils/agenda';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  agendas: Agenda[];
  title?: string;
  targetDateStr?: string;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  agendas,
  title = 'Bagikan Agenda ke WhatsApp',
  targetDateStr,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const waText = generateWhatsAppMessage(agendas, targetDateStr);
  const waUrl = getWhatsAppShareUrl(waText);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(waText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = waText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenWhatsApp = () => {
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4.5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs border border-white/20">
              <MessageSquare className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{title}</h2>
              <p className="text-xs text-emerald-100">
                Format resmi Bidang PKD DPMD Tulungagung ({agendas.length} kegiatan)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Pratinjau Pesan WhatsApp:</span>
            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold">
              {agendas.length} Agenda
            </span>
          </div>

          <pre 
            className="p-4 bg-slate-900 text-emerald-300 text-xs rounded-2xl whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto border border-slate-800 shadow-inner selection:bg-emerald-800 selection:text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace, sans-serif" }}
          >
            {waText}
          </pre>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              onClick={handleCopy}
              className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Teks Berhasil Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Salin Teks Agenda</span>
                </>
              )}
            </button>

            <button
              onClick={handleOpenWhatsApp}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md shadow-emerald-200 transition-all active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4 text-emerald-100" />
              <span>Buka WhatsApp Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
