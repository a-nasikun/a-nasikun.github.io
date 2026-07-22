"""
Extract TIF UGM student data from the raw admissions Excel exports.

Reads tif/data/Daftar mahasiswa <year>.xlsx (2020-2025), drops sensitive
personal fields, normalizes "Jalur Masuk" naming across years, and writes
a combined, anonymized dataset to tif/processed/.

Excluded (never written to output): NIM, Nama Mahasiswa, Email UGM, No HP,
Alamat Domisili, Golongan Darah, Wali, Alamat Wali, No HP Wali, Alamat KTP.
"""
import glob
import json
import csv
import datetime
import openpyxl

DATA_DIR = "tif/data"
OUT_DIR = "tif/processed"

# 0-indexed column positions (row 3 header, data starts row 4)
COL = {
    "no": 0,
    "program_studi": 1,
    "nim": 2,               # SENSITIVE - excluded
    "nama": 3,               # SENSITIVE - excluded
    "angkatan": 4,
    "periode_masuk": 5,
    "tanggal_masuk": 6,
    "jalur_masuk_raw": 7,
    "beasiswa_kerjasama": 8,
    "asal_3t": 9,
    "jatah_sks": 10,
    "ips": 11,
    "sks_kumulatif": 12,
    "ipk": 13,
    "sub_angkatan": 14,
    "kurikulum": 15,
    "jenis_kelamin": 16,
    "agama": 17,
    "sekolah_asal": 18,
    "kabupaten_sekolah": 19,
    "propinsi_sekolah": 20,
    "alamat_ktp": 21,        # SENSITIVE - excluded
    "kabupaten_ktp": 22,
    "propinsi_ktp": 23,
    "alamat_domisili": 24,   # SENSITIVE - excluded
    "email_ugm": 25,         # SENSITIVE - excluded
    "no_hp": 26,             # SENSITIVE - excluded
    "golongan_darah": 27,    # SENSITIVE - excluded
    "wali": 28,               # SENSITIVE - excluded
    "alamat_wali": 29,        # SENSITIVE - excluded
    "no_hp_wali": 30,         # SENSITIVE - excluded
    "pekerjaan_wali": 31,
    "semester_akhir": 32,
    "status_akhir": 33,
}

# Fields kept in the anonymized output, in order.
OUTPUT_FIELDS = [
    "angkatan", "periode_masuk", "tanggal_masuk", "program_studi",
    "jalur_masuk", "jalur_masuk_raw", "beasiswa_kerjasama", "asal_3t",
    "jatah_sks", "ips", "sks_kumulatif", "ipk", "sub_angkatan",
    "kurikulum", "jenis_kelamin", "agama", "sekolah_asal",
    "kabupaten_sekolah", "propinsi_sekolah", "kabupaten_ktp",
    "propinsi_ktp", "pekerjaan_wali", "semester_akhir", "status_akhir",
    "source_year",
]

# Jalur Masuk normalization -> 4 categories (2025 naming convention)
JALUR_MAP = {
    "internasional": "IUP",
    "asing degree": "IUP",
    "snbp": "SNBP",
    "snmptn": "SNBP",
    "snbt": "SNBT",
    "sbmptn": "SNBT",
    "ujian masuk ugm": "UM UGM",
    "prestasi": "UM UGM",
    "pbub": "UM UGM",
    "pbutm": "UM UGM",
    "pbuk": "UM UGM",
}


def normalize_jalur(raw):
    if raw is None:
        return None
    key = str(raw).strip().lower()
    mapped = JALUR_MAP.get(key)
    if mapped is None:
        raise ValueError(f"Unmapped Jalur Masuk value: {raw!r}")
    return mapped


def clean_value(v):
    if isinstance(v, datetime.datetime):
        return v.date().isoformat()
    if isinstance(v, datetime.date):
        return v.isoformat()
    if isinstance(v, str):
        v = v.strip()
        return v if v != "" else None
    return v


def extract_file(path, year):
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb["Daftar Mahasiswa"]
    records = []
    for row in ws.iter_rows(min_row=4, values_only=True):
        if row[COL["no"]] is None and row[COL["program_studi"]] is None:
            continue
        raw_jalur = clean_value(row[COL["jalur_masuk_raw"]])
        rec = {
            "angkatan": clean_value(row[COL["angkatan"]]),
            "periode_masuk": clean_value(row[COL["periode_masuk"]]),
            "tanggal_masuk": clean_value(row[COL["tanggal_masuk"]]),
            "program_studi": clean_value(row[COL["program_studi"]]),
            "jalur_masuk": normalize_jalur(raw_jalur),
            "jalur_masuk_raw": raw_jalur,
            "beasiswa_kerjasama": clean_value(row[COL["beasiswa_kerjasama"]]),
            "asal_3t": clean_value(row[COL["asal_3t"]]),
            "jatah_sks": clean_value(row[COL["jatah_sks"]]),
            "ips": clean_value(row[COL["ips"]]),
            "sks_kumulatif": clean_value(row[COL["sks_kumulatif"]]),
            "ipk": clean_value(row[COL["ipk"]]),
            "sub_angkatan": clean_value(row[COL["sub_angkatan"]]),
            "kurikulum": clean_value(row[COL["kurikulum"]]),
            "jenis_kelamin": clean_value(row[COL["jenis_kelamin"]]),
            "agama": clean_value(row[COL["agama"]]),
            "sekolah_asal": clean_value(row[COL["sekolah_asal"]]),
            "kabupaten_sekolah": clean_value(row[COL["kabupaten_sekolah"]]),
            "propinsi_sekolah": clean_value(row[COL["propinsi_sekolah"]]),
            "kabupaten_ktp": clean_value(row[COL["kabupaten_ktp"]]),
            "propinsi_ktp": clean_value(row[COL["propinsi_ktp"]]),
            "pekerjaan_wali": clean_value(row[COL["pekerjaan_wali"]]),
            "semester_akhir": clean_value(row[COL["semester_akhir"]]),
            "status_akhir": clean_value(row[COL["status_akhir"]]),
            "source_year": year,
        }
        records.append(rec)
    wb.close()
    return records


def main():
    all_records = []
    files = sorted(glob.glob(f"{DATA_DIR}/Daftar mahasiswa *.xlsx"))
    for path in files:
        year = int(path.rsplit(" ", 1)[-1].replace(".xlsx", ""))
        recs = extract_file(path, year)
        print(f"{path}: {len(recs)} records")
        all_records.extend(recs)

    all_records.sort(key=lambda r: (r["source_year"], r["angkatan"]))

    with open(f"{OUT_DIR}/students.json", "w", encoding="utf-8") as f:
        json.dump(all_records, f, ensure_ascii=False, indent=2)

    with open(f"{OUT_DIR}/students.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=OUTPUT_FIELDS)
        writer.writeheader()
        writer.writerows(all_records)

    print(f"\nTotal records: {len(all_records)}")
    print(f"Written to {OUT_DIR}/students.json and {OUT_DIR}/students.csv")


if __name__ == "__main__":
    main()
