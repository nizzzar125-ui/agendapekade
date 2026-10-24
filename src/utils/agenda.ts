import { Agenda, AgendaSifat, AgendaStatus, ViewTab } from '../types/agenda';

export const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Bulletproof date normalizer to convert any date representation
 * (DD/MM/YYYY, DD-MM-YYYY, YYYY/MM/DD, ISO string, timestamp, Indonesian month text, etc.)
 * into valid standard YYYY-MM-DD.
 * Ensures dates never disappear when syncing from Google Sheets!
 */
export function normalizeDateToISO(dateVal: any, fallbackDate: Date = new Date()): string {
  if (dateVal === null || dateVal === undefined) {
    return toDateString(fallbackDate);
  }

  // If already Date object
  if (dateVal instanceof Date) {
    if (!isNaN(dateVal.getTime())) {
      return toDateString(dateVal);
    }
    return toDateString(fallbackDate);
  }

  const str = String(dateVal).trim();
  if (!str) {
    return toDateString(fallbackDate);
  }

  // 1. Direct standard YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // 2. Starts with YYYY-MM-DD (e.g., ISO timestamp "2026-10-22T00:00:00.000Z" or "2026-10-22 10:00:00")
  const isoPrefixMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoPrefixMatch) {
    // If it's a full ISO string with timezone, parse it carefully
    if (str.includes('T')) {
      const parsed = new Date(str);
      if (!isNaN(parsed.getTime())) {
        return toDateString(parsed);
      }
    }
    const y = isoPrefixMatch[1];
    const m = String(Number(isoPrefixMatch[2])).padStart(2, '0');
    const d = String(Number(isoPrefixMatch[3])).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 3. Indonesian / European common format: DD/MM/YYYY or DD-MM-YYYY or D/M/YYYY
  // e.g. "22/10/2026" or "22-10-2026" or "5/10/2026"
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmyMatch) {
    const d = String(Number(dmyMatch[1])).padStart(2, '0');
    const m = String(Number(dmyMatch[2])).padStart(2, '0');
    const y = dmyMatch[3];
    return `${y}-${m}-${d}`;
  }

  // 4. Format: YYYY/MM/DD
  const ymdSlashMatch = str.match(/^(\d{4})[\/](\d{1,2})[\/](\d{1,2})/);
  if (ymdSlashMatch) {
    const y = ymdSlashMatch[1];
    const m = String(Number(ymdSlashMatch[2])).padStart(2, '0');
    const d = String(Number(ymdSlashMatch[3])).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 5. Excel / Google Sheets serial date number (e.g. 46317)
  if (/^\d{5}$/.test(str)) {
    const num = Number(str);
    if (!isNaN(num) && num > 35000 && num < 60000) {
      // Excel/Sheets serial day epoch (Dec 30, 1899)
      const dateFromSerial = new Date((num - 25569) * 86400 * 1000);
      if (!isNaN(dateFromSerial.getTime())) {
        return toDateString(dateFromSerial);
      }
    }
  }

  // 6. Text date with Indonesian month names: e.g. "22 Oktober 2026" or "Kamis, 22 Oktober 2026"
  for (let i = 0; i < INDONESIAN_MONTHS.length; i++) {
    const monthName = INDONESIAN_MONTHS[i].toLowerCase();
    if (str.toLowerCase().includes(monthName)) {
      const match = str.match(/(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
      if (match) {
        const d = String(Number(match[1])).padStart(2, '0');
        const m = String(i + 1).padStart(2, '0');
        const y = match[3];
        return `${y}-${m}-${d}`;
      }
    }
  }

  // 7. General JavaScript Date fallback
  const fallbackParsed = new Date(str);
  if (!isNaN(fallbackParsed.getTime())) {
    return toDateString(fallbackParsed);
  }

  // Default fallback
  return toDateString(fallbackDate);
}

/**
 * Normalizes a date to YYYY-MM-DD
 */
export function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses any date string into a Date object at midnight local time
 */
export function parseDateString(dateStr: string): Date {
  const normalized = normalizeDateToISO(dateStr);
  const [y, m, d] = normalized.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
}

/**
 * Formats a date into Indonesian date string: "Rabu, 21 Oktober 2026"
 */
export function formatIndonesianDate(dateStr: string): string {
  if (!dateStr) return '-';
  const d = parseDateString(dateStr);
  if (isNaN(d.getTime())) return '-';
  const dayName = INDONESIAN_DAYS[d.getDay()];
  const day = d.getDate();
  const monthName = INDONESIAN_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${dayName}, ${day} ${monthName} ${year}`;
}

/**
 * Checks if a date string is today
 */
export function isToday(dateStr: string, baseDate: Date = new Date()): boolean {
  if (!dateStr) return false;
  return normalizeDateToISO(dateStr) === toDateString(baseDate);
}

/**
 * Checks if a date string is tomorrow ("Besuk")
 */
export function isTomorrow(dateStr: string, baseDate: Date = new Date()): boolean {
  if (!dateStr) return false;
  const tomorrow = new Date(baseDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return normalizeDateToISO(dateStr) === toDateString(tomorrow);
}

/**
 * Checks if a date string is strictly in the future (after tomorrow)
 */
export function isUpcoming(dateStr: string, baseDate: Date = new Date()): boolean {
  if (!dateStr) return false;
  const tomorrow = new Date(baseDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return normalizeDateToISO(dateStr) > toDateString(tomorrow);
}

/**
 * Gets relative tag: "Hari Ini", "Besuk", or empty
 */
export function getRelativeDayLabel(dateStr: string, baseDate: Date = new Date()): string {
  if (isToday(dateStr, baseDate)) return 'Hari Ini';
  if (isTomorrow(dateStr, baseDate)) return 'Besuk';
  const target = parseDateString(dateStr);
  const current = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const diffTime = target.getTime() - current.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays > 1) return `${diffDays} hari lagi`;
  if (diffDays < 0) return `${Math.abs(diffDays)} hari lalu`;
  return '';
}

/**
 * Filters agendas by active tab: 'hari-ini' | 'besuk' | 'mendatang' | 'semua'
 */
export function filterByTab(agendas: Agenda[], tab: ViewTab, baseDate: Date = new Date()): Agenda[] {
  switch (tab) {
    case 'hari-ini':
      return agendas.filter((a) => isToday(a.tanggal, baseDate));
    case 'besuk':
      return agendas.filter((a) => isTomorrow(a.tanggal, baseDate));
    case 'mendatang':
      return agendas.filter((a) => isUpcoming(a.tanggal, baseDate));
    case 'semua':
    default:
      return agendas;
  }
}

/**
 * Filters and sorts agendas by user filters
 */
export function filterAndSortAgendas(
  agendas: Agenda[],
  options: {
    tab: ViewTab;
    searchQuery?: string;
    statusFilter?: AgendaStatus | 'Semua';
    sifatFilter?: AgendaSifat | 'Semua';
    staffFilter?: string;
    sortOrder?: 'date-asc' | 'date-desc';
    baseDate?: Date;
  }
): Agenda[] {
  const {
    tab,
    searchQuery = '',
    statusFilter = 'Semua',
    sifatFilter = 'Semua',
    staffFilter = '',
    sortOrder = 'date-asc',
    baseDate = new Date(),
  } = options;

  let filtered = filterByTab(agendas, tab, baseDate);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter((a) =>
      a.acara.toLowerCase().includes(q) ||
      a.lokasi.toLowerCase().includes(q) ||
      a.hadir.toLowerCase().includes(q) ||
      a.terkait.toLowerCase().includes(q) ||
      (a.catatan && a.catatan.toLowerCase().includes(q))
    );
  }

  if (statusFilter !== 'Semua') {
    filtered = filtered.filter((a) => a.status === statusFilter);
  }

  if (sifatFilter !== 'Semua') {
    filtered = filtered.filter((a) => a.sifat === sifatFilter);
  }

  if (staffFilter && staffFilter !== 'Semua') {
    filtered = filtered.filter((a) =>
      a.hadir.toLowerCase().includes(staffFilter.toLowerCase())
    );
  }

  // Sort by date and jam
  return [...filtered].sort((a, b) => {
    const cmp = a.tanggal.localeCompare(b.tanggal);
    if (cmp !== 0) {
      return sortOrder === 'date-asc' ? cmp : -cmp;
    }
    // compare jam if available
    const jamA = a.jam || '';
    const jamB = b.jam || '';
    return sortOrder === 'date-asc' ? jamA.localeCompare(jamB) : jamB.localeCompare(jamA);
  });
}

/**
 * Automatically updates status to 'Selesai Terlaksana' for agendas whose date is in the past.
 */
export function autoUpdatePastAgendas(agendas: Agenda[], baseDate: Date = new Date()): {
  agendas: Agenda[];
  hasChanges: boolean;
} {
  const todayStr = toDateString(baseDate);
  let hasChanges = false;

  const updated = agendas.map((agenda) => {
    const cleanDate = normalizeDateToISO(agenda.tanggal, baseDate);
    // If the agenda date is before today and status is not already 'Selesai Terlaksana'
    if (cleanDate < todayStr && agenda.status !== 'Selesai Terlaksana') {
      hasChanges = true;
      return {
        ...agenda,
        tanggal: cleanDate,
        status: 'Selesai Terlaksana' as AgendaStatus,
        updatedAt: new Date().toISOString(),
      };
    }
    return {
      ...agenda,
      tanggal: cleanDate,
    };
  });

  return { agendas: updated, hasChanges };
}

/**
 * Formats WhatsApp text matching the exact specification:
 * 
 * AGENDA KEGIATAN BIDANG PKD
 * DPMD KABUPATEN TULUNGAGUNG
 * 
 * Hari/Tanggal : Rabu, 21 Oktober 2026 (Hari Ini)
 * ━━━━━━━━━━━━━━━━━━━━━
 * 
 * 1. 📋 Acara: Pembinanaan Inovator Kecamatan Kauman
 *    ⏰ Jam  : 09.00 WIB
 *    📍 Tempat: Kecamatan Kauman
 *    🏷️ Terkait: Kerjasama Desa
 *    👤 Hadir: Eka Priyantin dan Sri Andiyah
 * 
 * ━━━━━━━━━━━━━━━━━━━━━
 * Total: 1 Agenda Kegiatan
 * ━━━━━━━━━━━━━━━━━━━━━
 * 
 * Demikian disampaikan, terima kasih.
 * 
 * _Created by: Dashboard Bid. Kerjasama_
 */
export function generateWhatsAppMessage(
  agendas: Agenda[],
  targetDateStr?: string,
  baseDate: Date = new Date()
): string {
  if (agendas.length === 0) {
    const dateFormatted = targetDateStr ? formatIndonesianDate(targetDateStr) : formatIndonesianDate(toDateString(baseDate));
    return `AGENDA KEGIATAN BIDANG PKD\nDPMD KABUPATEN TULUNGAGUNG\n\nHari/Tanggal : ${dateFormatted}\n━━━━━━━━━━━━━━━━━━━━━\n\nTidak ada agenda kegiatan terjadwal.\n\n━━━━━━━━━━━━━━━━━━━━━\nTotal: 0 Agenda Kegiatan\n━━━━━━━━━━━━━━━━━━━━━\n\nDemikian disampaikan, terima kasih.\n\n_Created by: Dashboard Bid. Kerjasama_`;
  }

  // Determine main date label for header
  const firstAgendaDate = targetDateStr || agendas[0].tanggal;
  const formattedDate = formatIndonesianDate(firstAgendaDate);
  const relLabel = getRelativeDayLabel(firstAgendaDate, baseDate);
  const dateHeader = relLabel ? `${formattedDate} (${relLabel})` : formattedDate;

  const items = agendas.map((item, index) => {
    const parts = [
      `${index + 1}. 📋 Acara: ${item.acara || '-'}`,
      `   ⏰ Jam  : ${item.jam || '-'}`,
      `   📍 Tempat: ${item.lokasi || '-'}`,
      `   🏷️ Terkait: ${item.terkait || 'Kerjasama Desa'}`,
      `   👤 Hadir: ${item.hadir || '-'}`,
    ];
    if (item.sifat) {
      parts.push(`   🌐 Sifat: ${item.sifat}`);
    }
    return parts.join('\n');
  }).join('\n\n');

  return `AGENDA KEGIATAN BIDANG PKD
DPMD KABUPATEN TULUNGAGUNG

Hari/Tanggal : ${dateHeader}
━━━━━━━━━━━━━━━━━━━━━

${items}

━━━━━━━━━━━━━━━━━━━━━
Total: ${agendas.length} Agenda Kegiatan
━━━━━━━━━━━━━━━━━━━━━

Demikian disampaikan, terima kasih.

_Created by: Dashboard Bid. Kerjasama_`;
}

/**
 * Prepares WhatsApp URL
 */
export function getWhatsAppShareUrl(text: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

/**
 * Exports agendas to standard CSV format compatible with Google Sheets
 */
export function exportToCSV(agendas: Agenda[]): string {
  const headers = ['ID', 'Acara', 'Tanggal', 'Jam', 'Lokasi', 'Terkait', 'Sifat', 'Status', 'Hadir', 'Catatan'];
  const rows = agendas.map((a) => [
    `"${(a.id || '').replace(/"/g, '""')}"`,
    `"${(a.acara || '').replace(/"/g, '""')}"`,
    `"${(a.tanggal || '').replace(/"/g, '""')}"`,
    `"${(a.jam || '').replace(/"/g, '""')}"`,
    `"${(a.lokasi || '').replace(/"/g, '""')}"`,
    `"${(a.terkait || '').replace(/"/g, '""')}"`,
    `"${(a.sifat || '').replace(/"/g, '""')}"`,
    `"${(a.status || '').replace(/"/g, '""')}"`,
    `"${(a.hadir || '').replace(/"/g, '""')}"`,
    `"${(a.catatan || '').replace(/"/g, '""')}"`,
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
