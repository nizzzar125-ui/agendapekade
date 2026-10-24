import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatIndonesianDate,
  isToday,
  isTomorrow,
  isUpcoming,
  getRelativeDayLabel,
  filterByTab,
  filterAndSortAgendas,
  generateWhatsAppMessage,
  exportToCSV,
  normalizeDateToISO,
  autoUpdatePastAgendas,
} from './agenda';
import { Agenda } from '../types/agenda';

const baseDate = new Date(2026, 9, 21); // 21 Oktober 2026 (Rabu)

const mockAgendas: Agenda[] = [
  {
    id: '1',
    acara: 'Pembinanaan Inovator Kecamatan Kauman',
    tanggal: '2026-10-21',
    jam: '09.00 WIB',
    lokasi: 'Kecamatan Kauman',
    terkait: 'Kerjasama Desa',
    sifat: 'Lapangan/ Desa',
    status: 'Sedang Berlangsung/ Hari ini',
    hadir: 'Eka Priyantin dan Sri Andiyah',
  },
  {
    id: '2',
    acara: 'Rakor Tim GTRA Kab. Tulungagung Tahun 2026',
    tanggal: '2026-10-22',
    jam: '08.30 WIB',
    lokasi: 'Ruang Rapat Lodoagung - Disperkim',
    terkait: 'Kerjasama Desa',
    sifat: 'Hadir Fisik/ Rapat',
    status: 'Rencana',
    hadir: 'Nizar AlKhabsyi dan Nanang Indra B',
  },
  {
    id: '3',
    acara: 'Sosialisasi Perbup Kerjasama Antar Desa',
    tanggal: '2026-10-25',
    jam: '10.00 WIB',
    lokasi: 'Balai Desa Ngunut',
    terkait: 'Kerjasama Desa',
    sifat: 'Lapangan/ Desa',
    status: 'Rencana',
    hadir: 'Inggit Yulia PD dan Heri Susanto',
  },
  {
    id: '4',
    acara: 'Evaluasi Kerjasama Pihak Ketiga',
    tanggal: '2026-10-20',
    jam: '13.00 WIB',
    lokasi: 'Ruang Rapat DPMD',
    terkait: 'Kerjasama Desa',
    sifat: 'Hadir Fisik/ Rapat',
    status: 'Selesai Terlaksana',
    hadir: 'Eni Wahyuningsih',
  },
];

test('formatIndonesianDate formats correctly', () => {
  assert.equal(formatIndonesianDate('2026-10-21'), 'Rabu, 21 Oktober 2026');
  assert.equal(formatIndonesianDate('2026-10-22'), 'Kamis, 22 Oktober 2026');
});

test('day relative calculations correctly identify today, tomorrow, and upcoming', () => {
  assert.equal(isToday('2026-10-21', baseDate), true);
  assert.equal(isToday('2026-10-22', baseDate), false);

  assert.equal(isTomorrow('2026-10-22', baseDate), true);
  assert.equal(isTomorrow('2026-10-21', baseDate), false);

  assert.equal(isUpcoming('2026-10-25', baseDate), true);
  assert.equal(isUpcoming('2026-10-22', baseDate), false);
  assert.equal(isUpcoming('2026-10-20', baseDate), false);

  assert.equal(getRelativeDayLabel('2026-10-21', baseDate), 'Hari Ini');
  assert.equal(getRelativeDayLabel('2026-10-22', baseDate), 'Besuk');
});

test('filterByTab returns correct subsets', () => {
  const todayList = filterByTab(mockAgendas, 'hari-ini', baseDate);
  assert.equal(todayList.length, 1);
  assert.equal(todayList[0].id, '1');

  const tomorrowList = filterByTab(mockAgendas, 'besuk', baseDate);
  assert.equal(tomorrowList.length, 1);
  assert.equal(tomorrowList[0].id, '2');

  const upcomingList = filterByTab(mockAgendas, 'mendatang', baseDate);
  assert.equal(upcomingList.length, 1);
  assert.equal(upcomingList[0].id, '3');

  const allList = filterByTab(mockAgendas, 'semua', baseDate);
  assert.equal(allList.length, 4);
});

test('filterAndSortAgendas handles search, status, and staff filters', () => {
  const searchResults = filterAndSortAgendas(mockAgendas, {
    tab: 'semua',
    searchQuery: 'Kauman',
    baseDate,
  });
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].acara, 'Pembinanaan Inovator Kecamatan Kauman');

  const staffResults = filterAndSortAgendas(mockAgendas, {
    tab: 'semua',
    staffFilter: 'Nizar AlKhabsyi',
    baseDate,
  });
  assert.equal(staffResults.length, 1);
  assert.equal(staffResults[0].id, '2');

  const statusResults = filterAndSortAgendas(mockAgendas, {
    tab: 'semua',
    statusFilter: 'Selesai Terlaksana',
    baseDate,
  });
  assert.equal(statusResults.length, 1);
  assert.equal(statusResults[0].id, '4');
});

test('generateWhatsAppMessage creates expected message format', () => {
  const waMsg = generateWhatsAppMessage([mockAgendas[0], mockAgendas[1]], '2026-10-21', baseDate);

  assert.match(waMsg, /AGENDA KEGIATAN BIDANG PKD/);
  assert.match(waMsg, /DPMD KABUPATEN TULUNGAGUNG/);
  assert.match(waMsg, /Hari\/Tanggal : Rabu, 21 Oktober 2026 \(Hari Ini\)/);
  assert.match(waMsg, /1\. 📋 Acara: Pembinanaan Inovator Kecamatan Kauman/);
  assert.match(waMsg, /⏰ Jam  : 09.00 WIB/);
  assert.match(waMsg, /📍 Tempat: Kecamatan Kauman/);
  assert.match(waMsg, /🏷️ Terkait: Kerjasama Desa/);
  assert.match(waMsg, /👤 Hadir: Eka Priyantin dan Sri Andiyah/);
  assert.match(waMsg, /2\. 📋 Acara: Rakor Tim GTRA Kab. Tulungagung Tahun 2026/);
  assert.match(waMsg, /Total: 2 Agenda Kegiatan/);
  assert.match(waMsg, /_Created by: Dashboard Bid\. Kerjasama_/);
});

test('autoUpdatePastAgendas automatically marks past agendas as Selesai Terlaksana', () => {
  const testItems: Agenda[] = [
    {
      id: 'past-1',
      acara: 'Rakor Masa Lalu',
      tanggal: '2026-10-19', // Past compared to baseDate 2026-10-21
      jam: '09.00 WIB',
      lokasi: 'DPMD',
      terkait: 'Kerjasama Desa',
      sifat: 'Hadir Fisik/ Rapat',
      status: 'Rencana', // should become Selesai Terlaksana
      hadir: 'Heri Susanto',
    },
    {
      id: 'today-1',
      acara: 'Rakor Hari Ini',
      tanggal: '2026-10-21', // Today
      jam: '10.00 WIB',
      lokasi: 'DPMD',
      terkait: 'Kerjasama Desa',
      sifat: 'Hadir Fisik/ Rapat',
      status: 'Sedang Berlangsung/ Hari ini', // should remain
      hadir: 'Eka Priyantin',
    },
    {
      id: 'future-1',
      acara: 'Rakor Masa Depan',
      tanggal: '2026-10-25', // Future
      jam: '09.00 WIB',
      lokasi: 'Balai Desa',
      terkait: 'Kerjasama Desa',
      sifat: 'Lapangan/ Desa',
      status: 'Rencana', // should remain
      hadir: 'Apriani',
    },
  ];

  const result = autoUpdatePastAgendas(testItems, baseDate);
  assert.equal(result.hasChanges, true);
  assert.equal(result.agendas[0].status, 'Selesai Terlaksana');
  assert.equal(result.agendas[1].status, 'Sedang Berlangsung/ Hari ini');
  assert.equal(result.agendas[2].status, 'Rencana');
});

test('exportToCSV generates valid CSV content', () => {
  const csv = exportToCSV([mockAgendas[0]]);
  assert.match(csv, /"Pembinanaan Inovator Kecamatan Kauman"/);
  assert.match(csv, /"Kecamatan Kauman"/);
  assert.match(csv, /"Kerjasama Desa"/);
});

test('normalizeDateToISO handles all Google Sheets date formats accurately', () => {
  // Standard ISO
  assert.equal(normalizeDateToISO('2026-10-22'), '2026-10-22');

  // Indonesian / European DD/MM/YYYY
  assert.equal(normalizeDateToISO('22/10/2026'), '2026-10-22');
  assert.equal(normalizeDateToISO('5/10/2026'), '2026-10-05');

  // DD-MM-YYYY
  assert.equal(normalizeDateToISO('22-10-2026'), '2026-10-22');

  // YYYY/MM/DD
  assert.equal(normalizeDateToISO('2026/10/22'), '2026-10-22');

  // ISO string with time
  assert.equal(normalizeDateToISO('2026-10-22T08:30:00.000Z'), '2026-10-22');

  // Indonesian text month
  assert.equal(normalizeDateToISO('22 Oktober 2026'), '2026-10-22');

  // Fallback on empty or null
  const defaultFallback = new Date(2026, 9, 22);
  assert.equal(normalizeDateToISO('', defaultFallback), '2026-10-22');
  assert.equal(normalizeDateToISO(null, defaultFallback), '2026-10-22');
});

