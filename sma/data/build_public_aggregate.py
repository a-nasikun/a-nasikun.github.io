"""
Builds sma/data/public/<year>.json — an aggregated, anonymized dataset safe to
fetch from the live dashboard. No student names or ID numbers (No Peserta/NISN)
are included anywhere in the output, only counts/scores grouped by school,
track (jalur), and origin school (asal_sekolah).

Run whenever sma/data/<year>/students.json is added or changed:
    python3 sma/data/build_public_aggregate.py 2023
"""
import json
import sys
import statistics
from pathlib import Path
from collections import defaultdict, Counter

DATA_DIR = Path(__file__).parent

def build(year: int):
    src = DATA_DIR / str(year) / "students.json"
    rows = json.load(open(src, encoding="utf-8"))

    schools_meta = json.load(open(DATA_DIR / "schools.json", encoding="utf-8"))
    school_order = [s["kode"] for s in sorted(schools_meta, key=lambda s: s["nomor"])]
    school_name = {s["kode"]: s["nama"] for s in schools_meta}

    jalur_list = ["Zonasi Radius", "Zonasi Reguler", "Afirmasi", "Prestasi", "Pindah Tugas"]

    def jalur_unit(jalur):
        return "meter" if jalur == "Zonasi Radius" else "skor"

    def summarize(values, unit):
        if not values:
            return None
        values_sorted = sorted(values)
        cutoff = max(values) if unit == "meter" else min(values)
        return {
            "unit": unit,
            "count": len(values),
            "min": round(min(values), 2),
            "max": round(max(values), 2),
            "avg": round(sum(values) / len(values), 2),
            "median": round(statistics.median(values), 2),
            "cutoff": round(cutoff, 2),
            "values": [round(v, 2) for v in values_sorted],
        }

    # ── Per-school aggregates ────────────────────────────────────────
    by_school = defaultdict(list)
    for r in rows:
        by_school[r["sekolah_kode"]].append(r)

    schools_out = []
    for kode in school_order:
        srows = by_school.get(kode, [])
        gender = Counter(r["kelamin"] for r in srows)
        feeders = Counter(r["asal_sekolah"] for r in srows)
        jalur_out = {}
        for jalur in jalur_list:
            unit = jalur_unit(jalur)
            vals = [
                (r["radius_m"] if unit == "meter" else r["nilai"])
                for r in srows if r["jalur"] == jalur
            ]
            summary = summarize(vals, unit)
            if summary:
                jalur_out[jalur] = summary
        schools_out.append({
            "kode": kode,
            "nama": school_name[kode],
            "total": len(srows),
            "gender": {"L": gender.get("L", 0), "P": gender.get("P", 0)},
            "jalur": jalur_out,
            "top_feeders": [
                {"asal_sekolah": name, "count": c}
                for name, c in feeders.most_common(10)
            ],
        })

    # ── Overall aggregates ───────────────────────────────────────────
    gender_all = Counter(r["kelamin"] for r in rows)
    feeders_all = Counter(r["asal_sekolah"] for r in rows)
    jalur_overall = {}
    for jalur in jalur_list:
        unit = jalur_unit(jalur)
        vals = [
            (r["radius_m"] if unit == "meter" else r["nilai"])
            for r in rows if r["jalur"] == jalur
        ]
        summary = summarize(vals, unit)
        if summary:
            jalur_overall[jalur] = summary

    cutoff_ranking = sorted(
        (
            {"kode": s["kode"], "nama": s["nama"], "cutoff": s["jalur"]["Zonasi Reguler"]["cutoff"]}
            for s in schools_out if "Zonasi Reguler" in s["jalur"]
        ),
        key=lambda x: x["cutoff"], reverse=True,
    )

    # ── Network graph: SMA <-> SMP/MTs bipartite graph ──────────────
    edge_counts = Counter((r["sekolah_kode"], r["asal_sekolah"]) for r in rows)
    smp_totals = Counter()
    for (sma, smp), c in edge_counts.items():
        smp_totals[smp] += c

    network = {
        "sma_nodes": [
            {"kode": s["kode"], "nama": s["nama"], "total": s["total"]}
            for s in schools_out
        ],
        "smp_nodes": [
            {"nama": name, "total": total}
            for name, total in sorted(smp_totals.items(), key=lambda x: -x[1])
        ],
        "edges": [
            {"source": sma, "target": smp, "count": c}
            for (sma, smp), c in sorted(edge_counts.items(), key=lambda x: -x[1])
        ],
    }

    # ── Per-SMP jalur breakdown (for the "SMP point of view" explorer) ──
    # Destinations (which SMA, how many) are derivable client-side from
    # network.edges by filtering on target — no need to duplicate here.
    smp_jalur = defaultdict(Counter)
    for r in rows:
        smp_jalur[r["asal_sekolah"]][r["jalur"]] += 1

    by_smp = {
        smp_name: {
            "total": smp_totals[smp_name],
            "jalur": dict(jalur_counter),
        }
        for smp_name, jalur_counter in smp_jalur.items()
    }

    out = {
        "year": year,
        "meta": {
            "total_students": len(rows),
            "total_sma": len(school_order),
            "total_smp": len(smp_totals),
            "total_edges": len(edge_counts),
            "jalur_list": jalur_list,
        },
        "schools": schools_out,
        "overall": {
            "jalur": jalur_overall,
            "gender": {"L": gender_all.get("L", 0), "P": gender_all.get("P", 0)},
            "top_feeders": [
                {"asal_sekolah": name, "count": c}
                for name, c in feeders_all.most_common(15)
            ],
            "cutoff_ranking": cutoff_ranking,
        },
        "network": network,
        "by_smp": by_smp,
    }

    out_dir = DATA_DIR / "public"
    out_dir.mkdir(exist_ok=True)
    out_path = out_dir / f"{year}.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)

    print(f"Wrote {out_path}")
    print(f"  students={out['meta']['total_students']} sma={out['meta']['total_sma']} "
          f"smp={out['meta']['total_smp']} edges={out['meta']['total_edges']}")


if __name__ == "__main__":
    year = int(sys.argv[1]) if len(sys.argv) > 1 else 2023
    build(year)
