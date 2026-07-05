# SMA Kota Yogyakarta — Admission Data

Parsed PPDB (Penerimaan Peserta Didik Baru) admission results for the 11 SMA Negeri
in Kota Yogyakarta, for use in the `sma` selectivity dashboard.

## Source

- **2023**: `SMA di Kota Jogja.pdf` (53 pages), official PPDB admission announcement
  listing every accepted student per school per track (jalur). Extracted with
  `pdftotext -layout` (the PDF is text-based, not scanned) and parsed with a
  small Python script — no OCR involved, so values are exact.

Future years (2024, 2025, ...) should follow the same folder convention:
`data/<year>/students.json` and `data/<year>/students.csv`, generated the same way.

## Folder structure

```
sma/data/
  schools.json        # the 11 SMA Negeri, stable across years
  2023/
    students.json      # flat array of every accepted student, 2023
    students.csv        # same data, CSV
  2024/                 # (future)
  2025/                 # (future)
```

## `schools.json`

```json
{ "kode": "SMAN1", "nama": "SMA NEGERI 1 YOGYAKARTA", "nomor": 1 }
```

11 entries, `SMAN1`..`SMAN11`.

## `students.json` / `students.csv` schema

One row per accepted student. Fields:

| Field          | Type            | Notes |
|----------------|-----------------|-------|
| `year`         | number          | Admission year, e.g. `2023`. |
| `sekolah`      | string          | Full SMA name, e.g. `"SMA NEGERI 1 YOGYAKARTA"`. |
| `sekolah_kode` | string          | Short code, e.g. `"SMAN1"`. Joins to `schools.json`. |
| `jalur`        | string          | Admission track. One of: `"Zonasi Radius"`, `"Zonasi Reguler"`, `"Afirmasi"`, `"Prestasi"`, `"Pindah Tugas"`. Source PDF labels the last one "Perpindah Tugas Orang Tua" — renamed here to the shorter "Pindah Tugas" per site convention. |
| `rank`         | number          | Rank ("No" column) within that school+jalur. The last rank in `"Zonasi Reguler"`/`"Prestasi"` etc. is effectively the passing cutoff (lowest accepted score) for that track. |
| `no_peserta`   | string          | 10-digit participant ID, kept as a string to preserve leading zeros. |
| `id_label`     | string          | What the source column was actually labeled: `"No Peserta"` for most tracks, `"NISN"` for `"Pindah Tugas"`. Both are 10-digit IDs; kept distinct in case NISN (permanent) vs No Peserta (exam-specific) matters later. |
| `nama`         | string          | Student full name. |
| `kelamin`      | string          | `"L"` (laki-laki) or `"P"` (perempuan). |
| `asal_sekolah` | string          | Origin middle school (SMP/MTs/PKBM), verbatim from source — casing and naming as published (e.g. some entries use "SMP Negeri 1 Sleman" vs "SMP NEGERI 1 SLEMAN" elsewhere; verified there are **no** case-only duplicates within 2023, so no normalization was applied, but check again when merging future years). |
| `nilai`        | number \| null  | Admission score. Populated for every track except `"Zonasi Radius"`. |
| `radius_m`     | number \| null  | Distance in meters from home to school. Only populated for `"Zonasi Radius"`. Exactly one of `nilai`/`radius_m` is non-null per row. |

## Known data notes

- **SMAN 10** has no `"Prestasi"` or `"Pindah Tugas"` records in the 2023 source —
  confirmed present in the original PDF as-is (only 3 of the 5 tracks have entries
  for that school that year), not a parsing gap.
- 250 distinct origin schools (SMP/MTs/PKBM/SMPN abbreviated forms) feed into these
  11 SMA in 2023 — some naming is inconsistent in the source itself (e.g. multiple
  "SMP Islam Al Azhar" branches with different suffixes). These are kept verbatim;
  resolve/normalize only if it becomes a real problem for grouping in the dashboard.
- Total records: 3,084 (2023).

## Privacy note

This dataset includes real students' full names and ID numbers (No Peserta / NISN).
This is standard practice for Indonesian PPDB — the source PDF is itself a public
announcement — but **before publishing the dashboard live** on the public GitHub
Pages site, revisit whether to expose per-student rows (name/ID) or only aggregated
statistics. That decision was deliberately deferred to the website-building phase.
