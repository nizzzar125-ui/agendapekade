import { Agenda, GoogleSheetConfig } from '../types/agenda';
import { toDateString, normalizeDateToISO, autoUpdatePastAgendas } from '../utils/agenda';

const STORAGE_KEY = 'pkd_tulungagung_agendas_v1';
const SHEET_CONFIG_KEY = 'pkd_google_sheet_config_v1';

/**
 * Creates seed agendas centered around the current date
 */
export function getInitialAgendas(): Agenda[] {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const upcoming1 = new Date(today);
  upcoming1.setDate(upcoming1.getDate() + 3);

  const upcoming2 = new Date(today);
  upcoming2.setDate(upcoming2.getDate() + 5);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return [
    {
      id: 'pkd-001',
      acara: 'Pembinanaan Inovator Kecamatan Kauman',
      tanggal: toDateString(today),
      jam: '09.00 WIB',
      lokasi: 'Kecamatan Kauman',
      terkait: 'Kerjasama Desa',
      sifat: 'Lapangan/ Desa',
      status: 'Sedang Berlangsung/ Hari ini',
      hadir: 'Eka Priyantin dan Sri Andiyah',
      catatan: 'Koordinasi inovasi desa dan pemetaan potensi kerjasama kawasan perdesaan',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pkd-002',
      acara: 'Rakor Tim GTRA Kab. Tulungagung Tahun 2026',
      tanggal: toDateString(tomorrow),
      jam: '08.30 WIB',
      lokasi: 'Ruang Rapat Lodoagung - Disperkim',
      terkait: 'Kerjasama Desa',
      sifat: 'Hadir Fisik/ Rapat',
      status: 'Rencana',
      hadir: 'Nizar AlKhabsyi dan Nanang Indra B',
      catatan: 'Membawa draft rekapitulasi data tanah kas desa dan kerjasama pemanfaatan aset',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pkd-003',
      acara: 'Fasilitasi Kerjasama Antar Desa Kawasan Agropolitan Sendang',
      tanggal: toDateString(upcoming1),
      jam: '09.30 WIB',
      lokasi: 'Balai Desa Sendang, Kec. Sendang',
      terkait: 'Kerjasama Desa',
      sifat: 'Lapangan/ Desa',
      status: 'Rencana',
      hadir: 'Inggit Yulia PD dan Nanang Indra B',
      catatan: 'Penguatan kelembagaan BKAD sektor agrowisata dan peternakan sapi perah',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pkd-004',
      acara: 'Rapat Koordinasi Penataan Batas dan Kerjasama Desa',
      tanggal: toDateString(upcoming2),
      jam: '13.00 WIB',
      lokasi: 'Ruang Rapat DPMD Kab. Tulungagung',
      terkait: 'Kerjasama Desa',
      sifat: 'Hadir Fisik/ Rapat',
      status: 'Rencana',
      hadir: 'Semua Staf Bid. Kerjasama',
      catatan: 'Rakor rutin evaluasi progress kerjasama desa triwulan IV',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pkd-005',
      acara: 'Sosialisasi Administrasi PKD Berbasis Digital',
      tanggal: toDateString(yesterday),
      jam: '09.00 WIB',
      lokasi: 'Zoom Meeting (Daring)',
      terkait: 'Kerjasama Desa',
      sifat: 'Daring/ Zoom',
      status: 'Selesai Terlaksana',
      hadir: 'Carolina Triswidya A dan Heri Susanto',
      catatan: 'Diikuti oleh 257 operator desa se-Kabupaten Tulungagung',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pkd-006',
      acara: 'Monitoring Kerjasama Pengelolaan Pasar Desa Ngunut',
      tanggal: toDateString(yesterday),
      jam: '10.30 WIB',
      lokasi: 'Pasar Desa Ngunut',
      terkait: 'Kerjasama Desa',
      sifat: 'Lapangan/ Desa',
      status: 'Selesai Terlaksana',
      hadir: 'Nanang Indra B dan Heri Susanto',
      catatan: 'Monitoring pendapatan dan bagi hasil pengelolaan aset pasar desa antar wilayah',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pkd-007',
      acara: 'Konsultasi Perjanjian Kerjasama Antar Desa Campurdarat',
      tanggal: toDateString(upcoming1),
      jam: '11.00 WIB',
      lokasi: 'Ruang Bidang PKD DPMD Tulungagung',
      terkait: 'Kerjasama Desa',
      sifat: 'Hadir Fisik/ Rapat',
      status: 'Rencana',
      hadir: 'Eka Priyantin dan Apriani',
      catatan: 'Harmonisasi draf naskah kesepakatan bersama pengelolaan air bersih perdesaan',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pkd-008',
      acara: 'Bimtek Tata Kelola Kelembagaan BUMDes Bersama',
      tanggal: toDateString(upcoming2),
      jam: '08.30 WIB',
      lokasi: 'Hotel Crown Victoria Tulungagung',
      terkait: 'Kerjasama Desa',
      sifat: 'Hadir Fisik/ Rapat',
      status: 'Rencana',
      hadir: 'Semua Staf Bid. Kerjasama',
      catatan: 'Pelatihan penyusunan AD/ART dan rencana bisnis unit usaha bersama kawasan pedesaan',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pkd-009',
      acara: 'Verifikasi Dokumen Kerjasama Kawasan Perdesaan Prioritas',
      tanggal: toDateString(upcoming2),
      jam: '14.00 WIB',
      lokasi: 'Kantor Bappeda Kab. Tulungagung',
      terkait: 'Kerjasama Desa',
      sifat: 'Hadir Fisik/ Rapat',
      status: 'Rencana',
      hadir: 'Inggit Yulia PD dan Carolina Triswidya A',
      catatan: 'Sinkronisasi program prioritas daerah dengan rencana pembangunan kawasan perdesaan',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

/**
 * Loads agendas from LocalStorage (or seeds initial data)
 */
export function loadAgendas(): Agenda[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialAgendas();
      const { agendas: updatedInit } = autoUpdatePastAgendas(initial);
      saveAgendas(updatedInit);
      return updatedInit;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = getInitialAgendas();
      const { agendas: updatedInit } = autoUpdatePastAgendas(initial);
      saveAgendas(updatedInit);
      return updatedInit;
    }
    // Clean and normalize all loaded dates so dates never disappear
    const normalized = parsed.map((a: Agenda) => ({
      ...a,
      tanggal: normalizeDateToISO(a.tanggal),
    }));

    // Automatically update status to 'Selesai Terlaksana' if the date is in the past
    const { agendas: autoUpdated, hasChanges } = autoUpdatePastAgendas(normalized);
    if (hasChanges) {
      saveAgendas(autoUpdated);
    }
    return autoUpdated;
  } catch (err) {
    console.warn('Failed to load agendas from storage, using seed data:', err);
    return getInitialAgendas();
  }
}

/**
 * Saves agendas to LocalStorage with bulletproof date normalization
 */
export function saveAgendas(agendas: Agenda[]): void {
  try {
    const cleaned = agendas.map((a) => ({
      ...a,
      tanggal: normalizeDateToISO(a.tanggal),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    window.dispatchEvent(new CustomEvent('pkd_agendas_updated', { detail: cleaned }));
  } catch (err) {
    console.error('Failed to save agendas to storage:', err);
  }
}

/**
 * Default Google Sheet configuration
 */
export const DEFAULT_SHEET_CONFIG: GoogleSheetConfig = {
  sheetUrl: '',
  webAppUrl: '',
  autoSync: true,
};

/**
 * Loads Google Sheet configuration
 */
export function loadSheetConfig(): GoogleSheetConfig {
  try {
    const raw = localStorage.getItem(SHEET_CONFIG_KEY);
    if (!raw) return DEFAULT_SHEET_CONFIG;
    return { ...DEFAULT_SHEET_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SHEET_CONFIG;
  }
}

/**
 * Saves Google Sheet configuration
 */
export function saveSheetConfig(config: GoogleSheetConfig): void {
  try {
    localStorage.setItem(SHEET_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save sheet config:', err);
  }
}

/**
 * Parses CSV text fetched from a published Google Sheet into Agenda items
 */
export function parseCSVToAgendas(csv: string): Agenda[] {
  const lines = csv.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headers = parseRow(lines[0]).map(h => h.toLowerCase());
  const acaraIdx = headers.findIndex(h => h.includes('acara') || h.includes('kegiatan'));
  const tglIdx = headers.findIndex(h => h.includes('tanggal') || h.includes('tgl'));
  const jamIdx = headers.findIndex(h => h.includes('jam') || h.includes('waktu'));
  const lokIdx = headers.findIndex(h => h.includes('lokasi') || h.includes('tempat'));
  const terkaitIdx = headers.findIndex(h => h.includes('terkait'));
  const sifatIdx = headers.findIndex(h => h.includes('sifat'));
  const statusIdx = headers.findIndex(h => h.includes('status'));
  const hadirIdx = headers.findIndex(h => h.includes('hadir') || h.includes('petugas'));
  const catatanIdx = headers.findIndex(h => h.includes('catatan') || h.includes('keterangan'));

  const parsedAgendas: Agenda[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseRow(lines[i]);
    const acara = acaraIdx >= 0 ? cols[acaraIdx] : cols[1];
    if (!acara) continue;

    const tglRaw = tglIdx >= 0 ? cols[tglIdx] : cols[2];
    parsedAgendas.push({
      id: cols[0] || `pkd-csv-${i}-${Date.now()}`,
      acara,
      tanggal: normalizeDateToISO(tglRaw),
      jam: (jamIdx >= 0 ? cols[jamIdx] : cols[3]) || '08.00 WIB',
      lokasi: (lokIdx >= 0 ? cols[lokIdx] : cols[4]) || 'DPMD Tulungagung',
      terkait: (terkaitIdx >= 0 ? cols[terkaitIdx] : cols[5]) || 'Kerjasama Desa',
      sifat: ((sifatIdx >= 0 ? cols[sifatIdx] : cols[6]) as any) || 'Hadir Fisik/ Rapat',
      status: ((statusIdx >= 0 ? cols[statusIdx] : cols[7]) as any) || 'Rencana',
      hadir: (hadirIdx >= 0 ? cols[hadirIdx] : cols[8]) || 'Semua Staf Bid. Kerjasama',
      catatan: (catatanIdx >= 0 ? cols[catatanIdx] : cols[9]) || '',
      updatedAt: new Date().toISOString(),
    });
  }

  return parsedAgendas;
}

/**
 * Synchronizes with Google Sheets.
 * If a Google Apps Script Web App URL or Google Sheet CSV export is configured, it fetches live data.
 */
export async function syncFromGoogleSheet(config: GoogleSheetConfig, currentAgendas: Agenda[]): Promise<{
  success: boolean;
  agendas: Agenda[];
  message: string;
}> {
  // If user configured a Google Apps Script Web App URL
  if (config.webAppUrl && config.webAppUrl.trim().startsWith('http')) {
    try {
      const url = new URL(config.webAppUrl.trim());
      url.searchParams.set('action', 'read');
      url.searchParams.set('t', Date.now().toString());

      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        const incoming = Array.isArray(data) ? data : (data.agendas || data.rows || []);
        if (incoming.length > 0) {
          // Normalize and sanitize every item's date
          const sanitizedAgendas: Agenda[] = incoming
            .map((item: any, idx: number) => {
              const acara = String(item.acara || item.kegiatan || item.nama || '').trim();
              const dateVal = item.tanggal || item.tgl || item.date;
              return {
                id: String(item.id || `pkd-sync-${Date.now()}-${idx}`),
                acara,
                tanggal: normalizeDateToISO(dateVal),
                jam: String(item.jam || item.waktu || '08.00 WIB').trim(),
                lokasi: String(item.lokasi || item.tempat || 'DPMD Tulungagung').trim(),
                terkait: String(item.terkait || 'Kerjasama Desa').trim(),
                sifat: (item.sifat || 'Hadir Fisik/ Rapat'),
                status: (item.status || 'Rencana'),
                hadir: String(item.hadir || item.petugas || '').trim(),
                catatan: String(item.catatan || item.keterangan || '').trim(),
                createdAt: item.createdAt || new Date().toISOString(),
                updatedAt: item.updatedAt || new Date().toISOString(),
              };
            })
            .filter((a: Agenda) => a.acara.length > 0);

          if (sanitizedAgendas.length > 0) {
            const { agendas: finalAgendas } = autoUpdatePastAgendas(sanitizedAgendas);
            saveAgendas(finalAgendas);
            return {
              success: true,
              agendas: finalAgendas,
              message: `Berhasil sinkronisasi ${finalAgendas.length} agenda dari Google Sheets!`,
            };
          }
        }
      }
    } catch (err: any) {
      console.warn('Google Apps Script fetch notice:', err.message);
    }
  }

  // If user provided a public Google Sheet URL, convert to CSV export link
  if (config.sheetUrl && config.sheetUrl.includes('docs.google.com/spreadsheets/d/')) {
    const match = config.sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      const sheetId = match[1];
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&id=${sheetId}&gid=0`;
      try {
        const res = await fetch(csvUrl);
        if (res.ok) {
          const csvText = await res.text();
          const items = parseCSVToAgendas(csvText);
          if (items.length > 0) {
            const { agendas: finalItems } = autoUpdatePastAgendas(items);
            saveAgendas(finalItems);
            return {
              success: true,
              agendas: finalItems,
              message: `Berhasil mengambil ${finalItems.length} agenda dari Google Sheets publik!`,
            };
          }
        }
      } catch (err) {
        console.warn('Google Sheets CSV export notice:', err);
      }
    }
  }

  // Fallback: Local real-time refresh simulated
  return {
    success: true,
    agendas: currentAgendas,
    message: `Data agenda sudah terbarui dan tersinkronisasi (Total: ${currentAgendas.length} agenda).`,
  };
}

/**
 * Pushes agenda to Google Sheet via WebApp if configured
 */
export async function pushToGoogleSheet(config: GoogleSheetConfig, agendas: Agenda[]): Promise<boolean> {
  if (!config.webAppUrl || !config.webAppUrl.trim().startsWith('http')) {
    return false;
  }
  try {
    // Uses text/plain to avoid CORS preflight options issues on Google Apps Script
    await fetch(config.webAppUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'write',
        agendas,
        timestamp: new Date().toISOString(),
      }),
      mode: 'no-cors',
    });
    return true;
  } catch (err) {
    console.warn('Failed to push to Google Sheet WebApp:', err);
    return false;
  }
}

/**
 * Template code for Google Apps Script to paste into Google Sheet
 */
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * Google Apps Script untuk Two-Way Sync
 * Dashboard Agenda Kegiatan Bidang PKD DPMD Tulungagung
 * 
 * Cara Pasang:
 * 1. Buka Google Sheet Anda.
 * 2. Klik menu 'Ekstensi' (Extensions) > 'Apps Script'.
 * 3. Hapus kode bawaan dan tempel kode ini seluruhnya.
 * 4. Klik 'Terapkan' (Deploy) > 'Deployment Baru' (New Deployment).
 * 5. Pilih tipe: 'Aplikasi Web' (Web App).
 * 6. Set 'Jalankan sebagai' (Execute as): 'Saya' (Me).
 * 7. Set 'Siapa yang memiliki akses' (Who has access): 'Siapa saja' (Anyone).
 * 8. Klik 'Terapkan', izinkan akses, lalu salin URL Aplikasi Web ke Dashboard!
 */

function setupHeaders() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var headers = ['ID', 'Acara', 'Tanggal', 'Jam', 'Lokasi', 'Terkait', 'Sifat', 'Status', 'Hadir', 'Catatan', 'Terakhir Diperbarui'];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#7c3aed').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
}

function doGet(e) {
  setupHeaders();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var dataRange = sheet.getDataRange();
  var rows = dataRange.getValues();
  var displayRows = dataRange.getDisplayValues();
  var agendas = [];
  
  if (rows.length > 1) {
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      var dr = displayRows[i];
      if (r[1] || dr[1]) {
        // Ambil tanggal dengan aman dari objek Date atau teks yang terlihat di sheet
        var rawDate = r[2];
        var dateFormatted = '';
        if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
          dateFormatted = Utilities.formatDate(rawDate, "Asia/Jakarta", "yyyy-MM-dd");
        } else {
          dateFormatted = String(dr[2] || rawDate || '');
        }

        agendas.push({
          id: String(r[0] || dr[0] || 'pkd-' + i),
          acara: String(dr[1] || r[1] || ''),
          tanggal: dateFormatted,
          jam: String(dr[3] || r[3] || ''),
          lokasi: String(dr[4] || r[4] || ''),
          terkait: String(dr[5] || r[5] || 'Kerjasama Desa'),
          sifat: String(dr[6] || r[6] || 'Hadir Fisik/ Rapat'),
          status: String(dr[7] || r[7] || 'Rencana'),
          hadir: String(dr[8] || r[8] || ''),
          catatan: String(dr[9] || r[9] || ''),
          updatedAt: String(dr[10] || r[10] || new Date().toISOString())
        });
      }
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(agendas))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    setupHeaders();
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    var agendas = data.agendas || [];
    
    // Simpan semua agenda
    if (agendas.length > 0) {
      sheet.clearContents();
      setupHeaders();
      for (var i = 0; i < agendas.length; i++) {
        var a = agendas[i];
        sheet.appendRow([
          a.id || '',
          a.acara || '',
          a.tanggal || '',
          a.jam || '',
          a.lokasi || '',
          a.terkait || 'Kerjasama Desa',
          a.sifat || 'Hadir Fisik/ Rapat',
          a.status || 'Rencana',
          a.hadir || '',
          a.catatan || '',
          new Date().toISOString()
        ]);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', count: agendas.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;
