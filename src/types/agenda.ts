/**
 * Types & Constants for Dashboard Agenda Kegiatan Bidang PKD
 * Dinas Pemberdayaan Masyarakat dan Desa Kabupaten Tulungagung
 */

export type AgendaStatus = 'Rencana' | 'Sedang Berlangsung/ Hari ini' | 'Selesai Terlaksana';

export type AgendaSifat = 'Hadir Fisik/ Rapat' | 'Daring/ Zoom' | 'Lapangan/ Desa';

export interface Agenda {
  id: string;
  acara: string;          // Manual typing, no recommendations
  tanggal: string;        // YYYY-MM-DD
  jam: string;            // Manual typing (e.g., "09.00 WIB" or "08.30 - 12.00 WIB")
  lokasi: string;         // Manual typing, no recommendations
  terkait: string;        // Default "Kerjasama Desa"
  sifat: AgendaSifat;     // 'Hadir Fisik/ Rapat' | 'Daring/ Zoom' | 'Lapangan/ Desa'
  status: AgendaStatus;   // 'Rencana' | 'Sedang Berlangsung/ Hari ini' | 'Selesai Terlaksana'
  hadir: string;          // List of attendees (quick pick + manual entry)
  catatan?: string;       // Optional notes, zoom link, etc.
  createdAt?: string;
  updatedAt?: string;
}

export type ViewTab = 'hari-ini' | 'besuk' | 'mendatang' | 'semua';

export const STAFF_MEMBERS: string[] = [
  'Inggit Yulia PD',
  'Nizar AlKhabsyi',
  'Eni Wahyuningsih',
  'Nanang Indra B',
  'Eka Priyantin',
  'Sri Andiyah',
  'Carolina Triswidya A',
  'Apriani',
  'Heri Susanto',
  'Semua Staf Bid. Kerjasama',
];

export const STATUS_OPTIONS: AgendaStatus[] = [
  'Rencana',
  'Sedang Berlangsung/ Hari ini',
  'Selesai Terlaksana',
];

export const SIFAT_OPTIONS: AgendaSifat[] = [
  'Hadir Fisik/ Rapat',
  'Daring/ Zoom',
  'Lapangan/ Desa',
];

export interface GoogleSheetConfig {
  sheetUrl: string;       // Direct Google Spreadsheet URL
  webAppUrl: string;      // Google Apps Script Web App URL for real-time two-way sync
  autoSync: boolean;      // Automatically sync on create/update/delete
  lastSyncedAt?: string;  // Timestamp of last sync
}
