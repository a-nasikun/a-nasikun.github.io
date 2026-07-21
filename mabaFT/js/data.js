/* ================================================================
   Data penerimaan mahasiswa baru S1 — Fakultas Teknik UGM
   Sumber: data/2023.jpeg (kolom "Registrasi"), data/2024.jpeg (kolom "Aktif"),
           data/2025.jpeg (Jumlah Mahasiswa Baru, reguler), data/2026.jpeg
           (kolom "Total Mahasiswa Baru" — termasuk IUP untuk prodi yang membuka jalur IUP).
   Angka merepresentasikan mahasiswa TERDAFTAR (registered), bukan peminat/pendaftar.
   ================================================================ */

const YEARS = [2023, 2024, 2025, 2026];

/* dept: kode departemen — lihat DEPARTMENTS di bawah untuk nama lengkap & susunan prodi */
const PROGRAMS = [
  { name: 'Arsitektur',                         dept: 'DTAP', values: [83, 88, 84, 83] },
  { name: 'Perencanaan Wilayah dan Kota',        dept: 'DTAP', values: [98, 94, 61, 88] },
  { name: 'Teknik Biomedis',                     dept: 'DTETI', values: [39, 55, 62, 82] },
  { name: 'Teknik Elektro',                      dept: 'DTETI', values: [72, 89, 97, 116] },
  { name: 'Teknologi Informasi',                 dept: 'DTETI', values: [81, 122, 77, 139] },
  { name: 'Teknik Fisika',                       dept: 'DTNTF', values: [127, 149, 146, 133] },
  { name: 'Teknik Nuklir',                       dept: 'DTNTF', values: [55, 54, 51, 52] },
  { name: 'Teknik Geodesi',                      dept: 'DTGD', values: [157, 134, 133, 137] },
  { name: 'Teknik Geologi',                      dept: 'DTGL', values: [133, 147, 132, 161] },
  { name: 'Teknik Kimia',                        dept: 'DTK',  values: [175, 190, 146, 174] },
  { name: 'Teknik Industri',                     dept: 'DTMI', values: [145, 166, 118, 167] },
  { name: 'Teknik Mesin',                        dept: 'DTMI', values: [180, 194, 165, 208] },
  { name: 'Teknik Infrastruktur Lingkungan',     dept: 'DTSL', values: [59, 71, 52, 51] },
  { name: 'Teknik Sipil',                        dept: 'DTSL', values: [170, 180, 108, 155] },
  { name: 'Teknik Sumber Daya Air',              dept: 'DTSL', values: [42, 71, 50, 53] },
];

const DEPARTMENTS = [
  { code: 'DTAP',  name: 'Teknik Arsitektur dan Perencanaan',        composition: 'Arsitektur + Perencanaan Wilayah dan Kota' },
  { code: 'DTETI', name: 'Teknik Elektro dan Teknologi Informasi',   composition: 'Teknik Elektro + Teknologi Informasi + Teknik Biomedis' },
  { code: 'DTGD',  name: 'Teknik Geodesi',                           composition: 'Teknik Geodesi' },
  { code: 'DTGL',  name: 'Teknik Geologi',                           composition: 'Teknik Geologi' },
  { code: 'DTK',   name: 'Teknik Kimia',                             composition: 'Teknik Kimia' },
  { code: 'DTMI',  name: 'Teknik Mesin dan Industri',                composition: 'Teknik Mesin + Teknik Industri' },
  { code: 'DTNTF', name: 'Teknik Nuklir dan Teknik Fisika',          composition: 'Teknik Nuklir + Teknik Fisika' },
  { code: 'DTSL',  name: 'Teknik Sipil dan Lingkungan',              composition: 'Teknik Sipil + Sumber Daya Air + Teknik Infrastruktur Lingkungan' },
];

/* Total per tahun tingkat fakultas — dijumlah dari PROGRAMS, disimpan eksplisit untuk verifikasi silang */
const FACULTY_TOTAL = YEARS.map((_, i) => PROGRAMS.reduce((s, p) => s + p.values[i], 0));

function departmentValues(code) {
  return YEARS.map((_, i) =>
    PROGRAMS.filter(p => p.dept === code).reduce((s, p) => s + p.values[i], 0)
  );
}

const DEPARTMENT_DATA = DEPARTMENTS.map(d => ({ ...d, values: departmentValues(d.code) }));
