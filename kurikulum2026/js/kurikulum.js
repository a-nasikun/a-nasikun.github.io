/* ================================================================
   Panduan Transisi Kurikulum 2021 → 2026 — Prodi Teknologi Informasi
   DTETI FT UGM
   Data diringkas dari:
   - Slide Presentasi Transisi Kurikulum (Sosialisasi Kurikulum 2026, 9 Juli 2026)
   - Dokumen "Aturan Peralihan Kurikulum 2021 ke 2026" (Bab 2 & 3, PSPSTIF)
   - Rekap kuliah_2026.xlsx (tim kurikulum DTETI)
   ================================================================ */

'use strict';

// ── Struktur lengkap Kurikulum 2026, per semester ─────────────────
const CURRICULUM_2026 = [
{"semester":1,"kode":"FTKXXXXXX","nama_id":"Aljabar","nama_en":"Algebra","kategori":"Basic Science","sks":3},
{"semester":1,"kode":"FTKXXXXXX","nama_id":"Fisika Dasar","nama_en":"Basic Physics","kategori":"Basic Science","sks":3},
{"semester":1,"kode":"FTKXXXXXX","nama_id":"Kalkulus","nama_en":"Calculus","kategori":"Basic Science","sks":3},
{"semester":1,"kode":"TIF261101","nama_id":"Manajemen Informasi","nama_en":"Information Management","kategori":"Engineering Topic","sks":2},
{"semester":1,"kode":"TKU261101","nama_id":"Matematika Diskrit","nama_en":"Discrete Mathematics","kategori":"Basic Science","sks":3},
{"semester":1,"kode":"TKU261102","nama_id":"Pemrograman Dasar","nama_en":"Fundamentals of Programming","kategori":"Engineering Topic","sks":3},
{"semester":1,"kode":"TKU261103","nama_id":"Probabilitas dan Variabel Acak","nama_en":"Probability and Random Variables","kategori":"Basic Science","sks":2},
{"semester":2,"kode":"FIUxxxxxx","nama_id":"Agama","nama_en":"Religion","kategori":"General Education","sks":2},
{"semester":2,"kode":"TKU261201","nama_id":"Algoritme dan Struktur Data","nama_en":"Algorithms and Data Structure","kategori":"Engineering Topic","sks":3},
{"semester":2,"kode":"TIF261201","nama_id":"Arsitektur Komputer","nama_en":"Computer Architectures","kategori":"Engineering Topic","sks":3},
{"semester":2,"kode":"TKU261202","nama_id":"Kalkulus Variabel Jamak","nama_en":"Multi-Variable Calculus","kategori":"Basic Science","sks":3},
{"semester":2,"kode":"TKU261102P","nama_id":"Praktikum Pemrograman Dasar","nama_en":"Fundamentals of Programming Lab. Work","kategori":"Engineering Topic","sks":1},
{"semester":2,"kode":"TKU261203","nama_id":"Statistika","nama_en":"Statistics","kategori":"Basic Science","sks":2},
{"semester":2,"kode":"FIUxxxxxx","nama_id":"Konsep Keteknikan untuk Peradaban","nama_en":"Sustainable Future Skills","kategori":"General Education","sks":3},
{"semester":2,"kode":"TIF261202","nama_id":"Teknologi Basis Data","nama_en":"Database Technology","kategori":"Engineering Topic","sks":3},
{"semester":3,"kode":"TKU262101","nama_id":"Isyarat dan Sistem","nama_en":"Signals and Systems","kategori":"Engineering Topic","sks":3},
{"semester":3,"kode":"TIF262101","nama_id":"Jaringan Komputer","nama_en":"Computer Network","kategori":"Engineering Topic","sks":3},
{"semester":3,"kode":"TIF262102","nama_id":"Kecerdasan Artifisial","nama_en":"Artificial Intelligence","kategori":"Engineering Topic","sks":3},
{"semester":3,"kode":"TKU262102","nama_id":"Metode Numeris","nama_en":"Numerical Methods","kategori":"Engineering Topic","sks":3},
{"semester":3,"kode":"TIF262103","nama_id":"Pemrograman Berorientasi Obyek","nama_en":"Object Oriented Programming","kategori":"Engineering Topic","sks":3},
{"semester":3,"kode":"TKU262103","nama_id":"Persamaan Diferensial","nama_en":"Differential Equations","kategori":"Basic Science","sks":3},
{"semester":3,"kode":"TKU262104P","nama_id":"Praktikum Sains Dasar","nama_en":"Basic Science Lab. Work","kategori":"Basic Science","sks":1},
{"semester":3,"kode":"TIF262104","nama_id":"Sistem Operasi","nama_en":"Operating System","kategori":"Engineering Topic","sks":2},
{"semester":4,"kode":"TIF262201","nama_id":"Komputasi Awan","nama_en":"Cloud Computing","kategori":"Engineering Topic","sks":2},
{"semester":4,"kode":"FIUxxxxxx","nama_id":"Literasi Kesehatan","nama_en":"Health Literacy","kategori":"General Education","sks":2},
{"semester":4,"kode":"TIF262202","nama_id":"Pengembangan Aplikasi Web","nama_en":"Web Application Development","kategori":"Engineering Topic","sks":3},
{"semester":4,"kode":"TIF262203","nama_id":"Proyek Junior Teknologi Informasi","nama_en":"Information Engineering Junior Project","kategori":"Engineering Topic","sks":2},
{"semester":4,"kode":"TIF262204","nama_id":"Rekayasa Data","nama_en":"Data Engineering","kategori":"Engineering Topic","sks":3},
{"semester":4,"kode":"TIF262205","nama_id":"Rekayasa Perangkat Lunak","nama_en":"Software Engineering","kategori":"Engineering Topic","sks":3},
{"semester":4,"kode":"TIF262206","nama_id":"Sistem Terdistribusi","nama_en":"Distributing Systems","kategori":"Engineering Topic","sks":3},
{"semester":4,"kode":"TIF262207","nama_id":"Teknik Pemodelan dan Simulasi","nama_en":"Modelling and Simulation","kategori":"Engineering Topic","sks":2},
{"semester":5,"kode":"FIUxxxxxx","nama_id":"Bahasa Indonesia","nama_en":"Bahasa Indonesia","kategori":"General Education","sks":2},
{"semester":5,"kode":"TIF263101","nama_id":"Desain Sistem","nama_en":"System Design","kategori":"Engineering Topic","sks":3},
{"semester":5,"kode":"TIF263102","nama_id":"Keamanan Siber","nama_en":"Cybersecurity","kategori":"Engineering Topic","sks":3},
{"semester":5,"kode":"TKU263101","nama_id":"Kerja Praktik","nama_en":"Internship","kategori":"Engineering Topic","sks":2},
{"semester":5,"kode":"FIUxxxxxx","nama_id":"Kewarganegaraan","nama_en":"Civics","kategori":"General Education","sks":2},
{"semester":5,"kode":"FIUxxxxxx","nama_id":"Pancasila","nama_en":"Pancasila","kategori":"General Education","sks":2},
{"semester":5,"kode":"TIF263103","nama_id":"Proyek Senior Teknologi Informasi","nama_en":"Information Engineering Senior Project","kategori":"Engineering Topic","sks":3},
{"semester":5,"kode":"TIF263104","nama_id":"Teknik Visualisasi Grafis","nama_en":"Graphical Visualization Engineering","kategori":"Engineering Topic","sks":3},
{"semester":6,"kode":null,"nama_id":"Mata Kuliah Pilihan","nama_en":"Pendalaman Prodi (Spesialisasi)","kategori":"Engineering Topic","sks":20},
{"semester":7,"kode":"FIUxxxxxx","nama_id":"Humaniora Digital","nama_en":"Digital Humanities","kategori":"General Education","sks":2},
{"semester":7,"kode":"TIF264101","nama_id":"Interaksi Manusia dan Komputer","nama_en":"Human Computer Interaction","kategori":"Engineering Topic","sks":3},
{"semester":7,"kode":"UNUxxxx","nama_id":"Kewirausahaan Teknologi","nama_en":"Technology Entrepreneurship","kategori":"Engineering Topic","sks":2},
{"semester":7,"kode":"FIUxxxxxx","nama_id":"Komunikasi Masyarakat","nama_en":"Public Communication","kategori":"General Education","sks":2},
{"semester":7,"kode":"FIUxxxxxx","nama_id":"Kuliah Kerja Nyata","nama_en":"Field Study and Community Service","kategori":"General Education","sks":4},
{"semester":7,"kode":"FIUxxxxxx","nama_id":"Penerapan Teknologi Tepat Guna","nama_en":"Appropriate Technology Application","kategori":"General Education","sks":2},
{"semester":7,"kode":"TKUXXXX","nama_id":"Proyek Individual","nama_en":"Individual Project","kategori":"Engineering Topic","sks":3},
{"semester":7,"kode":"TIF264102","nama_id":"Proyek Perancangan Teknologi Informasi 1","nama_en":"Capstone Design Project 1","kategori":"Engineering Topic","sks":2},
{"semester":8,"kode":"TIF264201","nama_id":"Proyek Perancangan Teknologi Informasi 2","nama_en":"Capstone Design Project 2","kategori":"Engineering Topic","sks":2},
{"semester":8,"kode":"UNUxxxxx","nama_id":"Studium Generale","nama_en":"Studium Generale","kategori":"Engineering Topic","sks":2}
];

// ── Mata kuliah pilihan per jalur konsentrasi (semester 6, 20 SKS) ─
const SPECIALIZATION = [
{"jalur":"Software Engineer","nama_id":"Integrasi Aplikasi dan Informasi","nama_en":"Application and Information Integration","sks":3},
{"jalur":"Software Engineer","nama_id":"Kualitas Perangkat Lunak","nama_en":"Software Quality","sks":3},
{"jalur":"Software Engineer","nama_id":"Pengembangan Aplikasi Permainan","nama_en":"Game Development","sks":3},
{"jalur":"Software Engineer","nama_id":"Pengembangan Aplikasi Piranti Bergerak","nama_en":"Mobile App Development","sks":3},
{"jalur":"Software Engineer","nama_id":"Pengujian Perangkat Lunak","nama_en":"Software Testing","sks":3},
{"jalur":"Software Engineer","nama_id":"TIK dan Masyarakat","nama_en":"Information and Communication Technology in Society","sks":3},
{"jalur":"Software Engineer","nama_id":"Transformasi Digital","nama_en":"Digital Transformation","sks":2},
{"jalur":"Network and Security Engineer","nama_id":"Forensik Digital","nama_en":"Digital Forensics","sks":3},
{"jalur":"Network and Security Engineer","nama_id":"Keamanan dan Integritas Data","nama_en":"Data Security and Integrity","sks":3},
{"jalur":"Network and Security Engineer","nama_id":"Peretasan Beretika","nama_en":"Security Analysis","sks":3},
{"jalur":"Network and Security Engineer","nama_id":"Sistem Berbasis Internet of Things","nama_en":"Internet of Things (IoT) Systems","sks":3},
{"jalur":"Network and Security Engineer","nama_id":"Teknologi Blockchain","nama_en":"Blockchain Technology","sks":3},
{"jalur":"Network and Security Engineer","nama_id":"TIK dan Masyarakat","nama_en":"Information and Communication Technology in Society","sks":3},
{"jalur":"Network and Security Engineer","nama_id":"Transformasi Digital","nama_en":"Digital Transformation","sks":2},
{"jalur":"Data Engineer","nama_id":"Big Data dan Analitik","nama_en":"Big Data and Analytics","sks":3},
{"jalur":"Data Engineer","nama_id":"Pembelajaran Dalam","nama_en":"Deep Learning","sks":3},
{"jalur":"Data Engineer","nama_id":"Pemrosesan Bahasa Alami","nama_en":"Natural Language Processing","sks":3},
{"jalur":"Data Engineer","nama_id":"Pengolahan Citra dan Visi Komputer","nama_en":"Image Processing and Computer Vision","sks":3},
{"jalur":"Data Engineer","nama_id":"Sistem Pendukung Keputusan","nama_en":"Decision Support Systems","sks":3},
{"jalur":"Data Engineer","nama_id":"TIK dan Masyarakat","nama_en":"Information and Communication Technology in Society","sks":3},
{"jalur":"Data Engineer","nama_id":"Transformasi Digital","nama_en":"Digital Transformation","sks":2},
{"jalur":"Industrial Experience","nama_id":"Industrial Critical Thinking: Observation","nama_en":"","sks":3},
{"jalur":"Industrial Experience","nama_id":"Industrial Critical Thinking: Analysis","nama_en":"","sks":3},
{"jalur":"Industrial Experience","nama_id":"Industrial Critical Thinking: Inference","nama_en":"","sks":3},
{"jalur":"Industrial Experience","nama_id":"Industrial Critical Thinking: Communication","nama_en":"","sks":3},
{"jalur":"Industrial Experience","nama_id":"Industrial Critical Thinking: Problem Solving","nama_en":"","sks":3},
{"jalur":"Industrial Experience","nama_id":"Industrial Creative Thinking","nama_en":"","sks":3},
{"jalur":"Industrial Experience","nama_id":"Transformasi Digital","nama_en":"Digital Transformation","sks":2}
];

const JALUR_INFO = {
  "Software Engineer": { icon: "💻", desc: "Merancang, membangun, dan menguji perangkat lunak — dari aplikasi web, mobile, hingga game." },
  "Network and Security Engineer": { icon: "🛡️", desc: "Mendalami keamanan siber, forensik digital, dan sistem jaringan/IoT." },
  "Data Engineer": { icon: "📊", desc: "Mengolah data skala besar, pembelajaran mesin, dan kecerdasan artifisial terapan." },
  "Industrial Experience": { icon: "🏭", desc: "Magang industri hingga 1 semester (setara 20 SKS) sebagai pengganti mata kuliah spesialisasi di kampus." }
};

// Hasil survei preferensi konsentrasi mahasiswa (slide sosialisasi)
const SURVEY = [
  { jalur: "Software Engineer", persen: 18 },
  { jalur: "Data Engineer", persen: 20 },
  { jalur: "Network and Security Engineer", persen: 18 },
  { jalur: "Industrial Experience", persen: 45 }
];

// ── Data pengecekan status mata kuliah per angkatan ───────────────
// status: green = sudah diambil/setara terpenuhi, pink = belum diambil,
//         blue = mata kuliah baru, akan/baru ditawarkan, check = perlu konfirmasi ke prodi
const CHECKER_DATA = [{"semester": 1, "kode": "FTKXXXXXX", "nama_2026": "Aljabar (Algebra)", "kategori": "Basic Science", "sks": 3, "angkatan": {"2025": {"nama_lama": "Aljabar Linear", "sks": 3, "semester_lama": 2, "status": "green"}, "2024": {"nama_lama": "Aljabar Linear", "sks": 3, "semester_lama": 2, "status": "green"}, "2023": {"nama_lama": "Aljabar Linear", "sks": 3, "semester_lama": 2, "status": "green"}, "2022": {"nama_lama": "Aljabar Linear", "sks": 3, "semester_lama": 2, "status": "green"}}}, {"semester": 1, "kode": "FTKXXXXXX", "nama_2026": "Fisika Dasar (Basic Physics)", "kategori": "Basic Science", "sks": 3, "angkatan": {"2025": {"nama_lama": "Fisika Mekanika Klasik", "sks": 2, "semester_lama": 1, "status": "green", "nama_lama_extra": "Fisika Fluika, Kalor dan Gelombang"}, "2024": {"nama_lama": "Fisika Mekanika Klasik", "sks": 2, "semester_lama": 1, "status": "green", "nama_lama_extra": "Fisika Fluida, Kalor dan Gelombang"}, "2023": {"nama_lama": "Fisika Mekanika Klasik", "sks": 2, "semester_lama": 1, "status": "green", "nama_lama_extra": "Fisika Fluida, Kalor dan Gelombang"}, "2022": {"nama_lama": "Fisika Mekanika Klasik", "sks": 2, "semester_lama": 1, "status": "green", "nama_lama_extra": "Fisika Fluida, Kalor dan Gelombang"}}}, {"semester": 1, "kode": "FTKXXXXXX", "nama_2026": "Kalkulus (Calculus)", "kategori": "Basic Science", "sks": 3, "angkatan": {"2025": {"nama_lama": "Kalkulus Variabel Tunggal", "sks": 3, "semester_lama": 1, "status": "green"}, "2024": {"nama_lama": "Kalkulus Variabel Tunggal", "sks": 3, "semester_lama": 1, "status": "green"}, "2023": {"nama_lama": "Kalkulus Variabel Tunggal", "sks": 3, "semester_lama": 1, "status": "green"}, "2022": {"nama_lama": "Kalkulus Variabel Tunggal", "sks": 3, "semester_lama": 1, "status": "green"}}}, {"semester": 1, "kode": "TIF261101", "nama_2026": "Manajemen Informasi (Information Management)", "kategori": "Engineering Topic", "sks": 2, "angkatan": {"2025": {"nama_lama": "Manajemen Informasi", "sks": 2, "semester_lama": 1, "status": "blue"}, "2024": {"nama_lama": "Manajemen Informasi", "sks": 2, "semester_lama": null, "status": "blue"}, "2023": {"nama_lama": "Manajemen Informasi", "sks": 2, "semester_lama": 1, "status": "blue"}, "2022": {"nama_lama": "Sistem Berbasis Mikroprosesor", "sks": 2, "semester_lama": 4, "status": "green"}}}, {"semester": 1, "kode": "TKU261101", "nama_2026": "Matematika Diskrit (Discrete Mathematics)", "kategori": "Basic Science", "sks": 3, "angkatan": {"2025": {"nama_lama": "Matematika Diskrit", "sks": 3, "semester_lama": 1, "status": "green"}, "2024": {"nama_lama": "Matematika Diskrit", "sks": 3, "semester_lama": 1, "status": "green"}, "2023": {"nama_lama": "Matematika Diskrit", "sks": 3, "semester_lama": 1, "status": "green"}, "2022": {"nama_lama": "Matematika Diskrit", "sks": 3, "semester_lama": 1, "status": "green"}}}, {"semester": 1, "kode": "TKU261102", "nama_2026": "Pemrograman Dasar (Fundamentals of Programming)", "kategori": "Engineering Topic", "sks": 3, "angkatan": {"2025": {"nama_lama": "Pemrograman Dasar", "sks": 3, "semester_lama": 1, "status": "green"}, "2024": {"nama_lama": "Pemrograman Dasar", "sks": 3, "semester_lama": 1, "status": "green"}, "2023": {"nama_lama": "Pemrograman Dasar", "sks": 3, "semester_lama": 1, "status": "green"}, "2022": {"nama_lama": "Pemrograman Dasar", "sks": 3, "semester_lama": 1, "status": "green"}}}, {"semester": 1, "kode": "TKU261103", "nama_2026": "Probabilitas dan Variabel Acak (Probability and Random Variables)", "kategori": "Basic Science", "sks": 2, "angkatan": {"2025": {"nama_lama": "Probabilitas dan Variabel Acak", "sks": 2, "semester_lama": 2, "status": "green"}, "2024": {"nama_lama": "Probabilitas dan Variabel Acak", "sks": 2, "semester_lama": 2, "status": "green"}, "2023": {"nama_lama": "Probabilitas dan Variabel Acak", "sks": 2, "semester_lama": 2, "status": "green"}, "2022": {"nama_lama": "Probabilitas dan Variabel Acak", "sks": 2, "semester_lama": 2, "status": "green"}}}, {"semester": 2, "kode": "FIUxxxxxx", "nama_2026": "Agama (Religion)", "kategori": "General Education", "sks": 2, "angkatan": {"2025": {"nama_lama": "Agama", "sks": 2, "semester_lama": null, "status": "pink"}, "2024": {"nama_lama": "Agama", "sks": 2, "semester_lama": null, "status": "pink"}, "2023": {"nama_lama": "Agama", "sks": 2, "semester_lama": 2, "status": "green"}, "2022": {"nama_lama": "Agama", "sks": 2, "semester_lama": 2, "status": "green"}}}, {"semester": 2, "kode": "TKU261201", "nama_2026": "Algoritme dan Struktur Data (Algorithms and Data Structure)", "kategori": "Engineering Topic", "sks": 3, "angkatan": {"2025": {"nama_lama": "Algoritme dan Struktur Data", "sks": 3, "semester_lama": 2, "status": "green"}, "2024": {"nama_lama": "Algoritme dan Struktur Data", "sks": 3, "semester_lama": 2, "status": "green"}, "2023": {"nama_lama": "Algoritme dan Struktur Data", "sks": 3, "semester_lama": 2, "status": "green"}, "2022": {"nama_lama": "Algoritme dan Struktur Data", "sks": 3, "semester_lama": 2, "status": "green"}}}, {"semester": 2, "kode": "TIF261201", "nama_2026": "Arsitektur Komputer (Computer Architectures)", "kategori": "Engineering Topic", "sks": 3, "angkatan": {"2025": {"nama_lama": "Arsitektur Komputer", "sks": 3, "semester_lama": 2, "status": "blue"}, "2024": {"nama_lama": "Arsitektur Komputer", "sks": 3, "semester_lama": 3, "status": "green"}, "2023": {"nama_lama": "Arsitektur Komputer", "sks": 3, "semester_lama": 3, "status": "green"}, "2022": {"nama_lama": "Arsitektur Komputer", "sks": 3, "semester_lama": 3, "status": "green"}}}, {"semester": 2, "kode": "TKU261202", "nama_2026": "Kalkulus Variabel Jamak (Multi-Variable Calculus)", "kategori": "Basic Science", "sks": 3, "angkatan": {"2025": {"nama_lama": "Kalkulus Variabel Jamak", "sks": 3, "semester_lama": 2, "status": "green"}, "2024": {"nama_lama": "Kalkulus Variabel Jamak", "sks": 2, "semester_lama": 2, "status": "green"}, "2023": {"nama_lama": "Kalkulus Variabel Jamak", "sks": 2, "semester_lama": 2, "status": "green"}, "2022": {"nama_lama": "Kalkulus Variabel Jamak", "sks": 2, "semester_lama": 2, "status": "green"}}}, {"semester": 2, "kode": "TKU261102P", "nama_2026": "Praktikum Pemrograman Dasar (Fundamentals of Programming Lab. Work)", "kategori": "Engineering Topic", "sks": 1, "angkatan": {"2025": {"nama_lama": "Praktikum Pemrograman Dasar", "sks": 1, "semester_lama": 2, "status": "green"}, "2024": {"nama_lama": "Praktikum Pemrograman Dasar", "sks": 1, "semester_lama": 2, "status": "green"}, "2023": {"nama_lama": "Praktikum Pemrograman Dasar", "sks": 1, "semester_lama": 2, "status": "green"}, "2022": {"nama_lama": "Praktikum Pemrograman Dasar", "sks": 1, "semester_lama": 2, "status": "green"}}}, {"semester": 2, "kode": "TKU261203", "nama_2026": "Statistika (Statistics)", "kategori": "Basic Science", "sks": 2, "angkatan": {"2025": {"nama_lama": "Statistika", "sks": 2, "semester_lama": 2, "status": "blue"}, "2024": {"nama_lama": "Statistika", "sks": 2, "semester_lama": 3, "status": "green"}, "2023": {"nama_lama": "Statistika", "sks": 2, "semester_lama": 3, "status": "green"}, "2022": {"nama_lama": "Statistika", "sks": 2, "semester_lama": 3, "status": "green"}}}, {"semester": 2, "kode": "FIUxxxxxx", "nama_2026": "Konsep Keteknikan untuk Peradaban (Sustainable Future Skills)", "kategori": "General Education", "sks": 3, "angkatan": {"2025": {"nama_lama": "Konsep Keteknikan untuk Peradaban", "sks": 2, "semester_lama": 2, "status": "green"}, "2024": {"nama_lama": "Konsep Keteknikan untuk Peradaban", "sks": 2, "semester_lama": 2, "status": "green"}, "2023": {"nama_lama": "Konsep Keteknikan untuk Peradaban", "sks": 2, "semester_lama": 2, "status": "green"}, "2022": {"nama_lama": "Konsep Keteknikan untuk Peradaban", "sks": 2, "semester_lama": 2, "status": "green"}}}, {"semester": 2, "kode": "TIF261202", "nama_2026": "Teknologi Basis Data (Database Technology)", "kategori": "Engineering Topic", "sks": 3, "angkatan": {"2025": {"nama_lama": "Teknologi Basis Data", "sks": 3, "semester_lama": 2, "status": "blue"}, "2024": {"nama_lama": "Teknologi Basis Data", "sks": 3, "semester_lama": 4, "status": "green"}, "2023": {"nama_lama": "Teknologi Basis Data", "sks": 3, "semester_lama": 4, "status": "green"}, "2022": {"nama_lama": "Teknologi Basis Data", "sks": 3, "semester_lama": 4, "status": "green"}}}, {"semester": 3, "kode": "TKU262101", "nama_2026": "Isyarat dan Sistem (Signals and Systems)", "kategori": "Engineering Topic", "sks": 3, "angkatan": {"2025": {"nama_lama": "Isyarat dan Sistem", "sks": 3, "semester_lama": 3, "status": "blue"}, "2024": {"nama_lama": "Isyarat dan Sistem", "sks": 3, "semester_lama": 3, "status": "green"}, "2023": {"nama_lama": "Isyarat dan Sistem", "sks": 3, "semester_lama": 3, "status": "green"}, "2022": {"nama_lama": "Isyarat dan Sistem", "sks": 3, "semester_lama": 3, "status": "green"}}}, {"semester": 3, "kode": "TIF262101", "nama_2026": "Jaringan Komputer (Computer Network)", "kategori": "Engineering Topic", "sks": 3, "angkatan": {"2025": {"nama_lama": "Jaringan Komputer", "sks": 3, "semester_lama": 3, "status": "blue"}, "2024": {"nama_lama": "Jaringan Komputer", "sks": 3, "semester_lama": 4, "status": "green"}, "2023": {"nama_lama": "Jaringan Komputer", "sks": 3, "semester_lama": 4, "status": "green"}, "2022": {"nama_lama": "Jaringan Komputer", "sks": 3, "semester_lama": 4, "status": "green"}}}, {"semester": 3, "kode": "TIF262102", "nama_2026": "Kecerdasan Artifisial (Artificial Intelligence)", "kategori": "Engineering Topic", "sks": 3, "angkatan": {"2025": {"nama_lama": "Kecerdasan Artifisial", "sks": 3, "semester_lama": 3, "status": "pink"}, "2024": {"nama_lama": "Kecerdasan Buatan", "sks": 3, "semester_lama": 4, "status": "green"}, "2023": {"nama_lama": "Kecerdasan Buatan", "sks": 3, "semester_lama": 4, "status": "green"}, "2022": {"nama_lama": "Kecerdasan Buatan", "sks": 3, "semester_lama": 4, "status": "green"}}}, {"semester": 3, "kode": "TKU262102", "nama_2026": "Metode Numeris (Numerical Methods)", "kategori": "Engineering Topic", "sks": 3, "angkatan": {"2025": {"nama_lama": "Metode Numeris", "sks": 3, "semester_lama": 3, "status": "blue"}, "2024": {"nama_lama": "Metode Numeris", "sks": 3, "semester_lama": 3, "status": "green"}, "2023": {"nama_lama": "Metode Numeris", "sks": 3, "semester_lama": 3, "status": "green"}, "2022": {"nama_lama": "Metode Numeris", "sks": 3, "semester_lama": 3, "status": "green"}}}, {"semester": 3, "kode": "TIF262103", "nama_2026": "Pemrograman Berorientasi Obyek (Object Oriented Programming)", "kategori": "Engineering Topic", "sks": 3, "angkatan": {"2025": {"nama_lama": "Pemrograman Berorientasi Obyek", "sks": 3, "semester_lama": 3, "status": "blue"}, "2024": {"nama_lama": "Pemrograman Berorientasi Obyek", "sks": 3, "semester_lama": 3, "status": "green"}, "2023": {"nama_lama": "Pemrograman Berorientasi Obyek", "sks": 3, "semester_lama": 3, "status": "green"}, "2022": {"nama_lama": "Pemrograman Berorientasi Obyek", "sks": 3, "semester_lama": 3, "status": "green"}}}, {"semester": 3, "kode": "TKU262103", "nama_2026": "Persamaan Diferensial (Differential Equations)", "kategori": "Basic Science", "sks": 3, "angkatan": {"2025": {"nama_lama": "Persamaan Diferensial", "sks": 3, "semester_lama": 3, "status": "pink"}, "2024": {"nama_lama": "Persamaan Diferensial", "sks": 3, "semester_lama": 3, "status": "green"}, "2023": {"nama_lama": "Persamaan Diferensial", "sks": 3, "semester_lama": 3, "status": "green"}, "2022": {"nama_lama": "Persamaan Diferensial", "sks": 3, "semester_lama": 3, "status": "green"}}}, {"semester": 3, "kode": "TKU262104P", "nama_2026": "Praktikum Sains Dasar (Basic Science Lab. Work)", "kategori": "Basic Science", "sks": 1, "angkatan": {"2025": {"nama_lama": "Praktikum Sains Dasar", "sks": 1, "semester_lama": 3, "status": "blue"}, "2024": {"nama_lama": "Praktikum Sains Dasar", "sks": 1, "semester_lama": 3, "status": "green"}, "2023": {"nama_lama": "Praktikum Sains Dasar", "sks": 1, "semester_lama": 3, "status": "green"}, "2022": {"nama_lama": "Praktikum Sains Dasar", "sks": 1, "semester_lama": 3, "status": "green"}}}, {"semester": 3, "kode": "TIF262104", "nama_2026": "Sistem Operasi (Operating System)", "kategori": "Engineering Topic", "sks": 2, "angkatan": {"2025": {"nama_lama": "Sistem Operasi", "sks": 2, "semester_lama": 3, "status": "pink"}, "2024": {"nama_lama": "Sistem Operasi", "sks": 2, "semester_lama": 5, "status": "blue"}, "2023": {"nama_lama": "Sistem Operasi", "sks": 3, "semester_lama": 5, "status": "green"}, "2022": {"nama_lama": "Sistem Operasi", "sks": 3, "semester_lama": 5, "status": "green"}}}, {"semester": 4, "kode": "TIF262201", "nama_2026": "Komputasi Awan (Cloud Computing)", "kategori": "Engineering Topic", "sks": 2, "angkatan": {"2025": {"nama_lama": "Komputasi Awan", "sks": 2, "semester_lama": 4, "status": "pink"}, "2024": {"nama_lama": "Komputasi Awan", "sks": 2, "semester_lama": 5, "status": "blue"}, "2023": {"nama_lama": "Komputasi Awan", "sks": 2, "semester_lama": 5, "status": "green"}, "2022": {"nama_lama": "Komputasi Awan", "sks": 2, "semester_lama": 5, "status": "green"}}}, {"semester": 4, "kode": "FIUxxxxxx", "nama_2026": "Literasi Kesehatan (Health Literacy)", "kategori": "General Education", "sks": 2, "angkatan": {"2025": {"nama_lama": "Literasi Kesehatan", "sks": 2, "semester_lama": 4, "status": "pink"}, "2024": {"nama_lama": "Literasi Kesehatan", "sks": 2, "semester_lama": 4, "status": "pink"}, "2023": {"nama_lama": "Literasi Kesehatan", "sks": 2, "semester_lama": 4, "status": "pink"}, "2022": {"nama_lama": "Literasi Kesehatan", "sks": 2, "semester_lama": 4, "status": "pink"}}}, {"semester": 4, "kode": "TIF262202", "nama_2026": "Pengembangan Aplikasi Web (Web Application Development)", "kategori": "Engineering Topic", "sks": 3, "angkatan": {"2025": {"nama_lama": "Pengembangan Aplikasi Web", "sks": 3, "semester_lama": 4, "status": "pink"}, "2024": {"nama_lama": "Pengembangan Aplikasi Web", "sks": 3, "semester_lama": 5, "status": "blue"}, "2023": {"nama_lama": "Pengembangan Aplikasi Web", "sks": 3, "semester_lama": 5, "status": "green"}, "2022": {"nama_lama": "Pengembangan Aplikasi Web", "sks": 3, "semester_lama": 5, "status": "green"}}}, {"semester": 4, "kode": "TIF262203", "nama_2026": "Proyek Junior Teknologi Informasi (Information Engineering Junior Project)", "kategori": "Engineering Topic", "sks": 2, "angkatan": {"2025": {"nama_lama": "Proyek Junior Teknologi Informasi", "sks": 2, "semester_lama": 4, "status": "pink"}, "2024": {"nama_lama": "Proyek Junior Teknologi Informasi", "sks": 2, "semester_lama": 5, "status": "blue"}, "2023": {"nama_lama": "Proyek Junior Teknologi Informasi", "sks": 2, "semester_lama": 5, "status": "green"}, "2022": {"nama_lama": "Proyek Junior Teknologi Informasi", "sks": 2, "semester_lama": 5, "status": "green"}}}, {"semester": 4, "kode": "TIF262204", "nama_2026": "Rekayasa Data (Data Engineering)", "kategori": "Engineering Topic", "sks": 3, "angkatan": {"2025": {"nama_lama": "Rekayasa Data", "sks": 3, "semester_lama": 4, "status": "pink"}, "2024": {"nama_lama": "Rekayasa Data", "sks": 3, "semester_lama": 5, "status": "blue"}, "2023": {"nama_lama": "Rekayasa Data", "sks": 3, "semester_lama": 5, "status": "green"}, "2022": {"nama_lama": "Rekayasa Data", "sks": 3, "semester_lama": 5, "status": "green"}}}, {"semester": 4, "kode": "TIF262205", "nama_2026": "Rekayasa Perangkat Lunak (Software Engineering)", "kategori": "Engineering Topic", "sks": 3, "angkatan": {"2025": {"nama_lama": "Rekayasa Perangkat Lunak", "sks": 3, "semester_lama": 4, "status": "pink"}, "2024": {"nama_lama": "Rekayasa Perangkat Lunak", "sks": 3, "semester_lama": 5, "status": "blue"}, "2023": {"nama_lama": "Rekayasa Perangkat Lunak", "sks": 3, "semester_lama": 5, "status": "green"}, "2022": {"nama_lama": "Rekayasa Perangkat Lunak", "sks": 3, "semester_lama": 5, "status": "green"}}}, {"semester": 4, "kode": "TIF262206", "nama_2026": "Sistem Terdistribusi (Distributing Systems)", "kategori": "Engineering Topic", "sks": 3, "angkatan": {"2025": {"nama_lama": "Sistem Terdistribusi", "sks": 3, "semester_lama": 4, "status": "pink"}, "2024": {"nama_lama": "Komunikasi Data dan Komputer", "sks": 3, "semester_lama": 3, "status": "green"}, "2023": {"nama_lama": "Komunikasi Data dan Komputer", "sks": 3, "semester_lama": 3, "status": "green"}, "2022": {"nama_lama": "Komunikasi Data dan Komputer", "sks": 3, "semester_lama": 3, "status": "green"}}}, {"semester": 4, "kode": "TIF262207", "nama_2026": "Teknik Pemodelan dan Simulasi (Modelling and Simulation)", "kategori": "Engineering Topic", "sks": 2, "angkatan": {"2025": {"nama_lama": "Teknik Pemodelan dan Simulasi", "sks": 2, "semester_lama": 4, "status": "pink"}, "2024": {"nama_lama": "Teknik Pemodelan dan Simulasi", "sks": 3, "semester_lama": 4, "status": "green"}, "2023": {"nama_lama": "Teknik Pemodelan dan Simulasi", "sks": 3, "semester_lama": 4, "status": "green"}, "2022": {"nama_lama": "Teknik Pemodelan dan Simulasi", "sks": 3, "semester_lama": 4, "status": "green"}}}, {"semester": 5, "kode": "FIUxxxxxx", "nama_2026": "Bahasa Indonesia (Bahasa Indonesia)", "kategori": "General Education", "sks": 2, "angkatan": {"2025": {"nama_lama": "Bahasa Indonesia", "sks": 2, "semester_lama": 5, "status": "pink"}, "2024": {"nama_lama": "Bahasa Indonesia", "sks": 2, "semester_lama": null, "status": "check"}, "2023": {"nama_lama": "Bahasa Indonesia dan Penulisan Ilmiah", "sks": 2, "semester_lama": 6, "status": "green"}, "2022": {"nama_lama": "Bahasa Indonesia dan Penulisan Ilmiah", "sks": 2, "semester_lama": 6, "status": "green"}}}, {"semester": 5, "kode": "TIF263101", "nama_2026": "Desain Sistem (System Design)", "kategori": "Engineering Topic", "sks": 3, "angkatan": {"2025": {"nama_lama": "Desain Sistem", "sks": 3, "semester_lama": 5, "status": "pink"}, "2024": {"nama_lama": "Desain Sistem", "sks": 3, "semester_lama": 4, "status": "pink"}, "2023": {"nama_lama": "Medan Elektromagnetik", "sks": 3, "semester_lama": 4, "status": "green"}, "2022": {"nama_lama": "Medan Elektromagnetik", "sks": 3, "semester_lama": 4, "status": "green"}}}, {"semester": 5, "kode": "TIF263102", "nama_2026": "Keamanan Siber (Cybersecurity)", "kategori": "Engineering Topic", "sks": 3, "angkatan": {"2025": {"nama_lama": "Keamanan Siber", "sks": 3, "semester_lama": 5, "status": "pink"}, "2024": {"nama_lama": "Keamanan Siber", "sks": 3, "semester_lama": 5, "status": "pink"}, "2023": {"nama_lama": "Keamanan Siber", "sks": 3, "semester_lama": 6, "status": "green"}, "2022": {"nama_lama": "Keamanan Siber", "sks": 3, "semester_lama": 6, "status": "green"}}}, {"semester": 5, "kode": "TKU263101", "nama_2026": "Kerja Praktik / Magang Industri (Internship)", "kategori": "Engineering Topic", "sks": 2, "angkatan": {"2025": {"nama_lama": "Kerja Praktik / Magang Industri", "sks": 2, "semester_lama": 5, "status": "pink"}, "2024": {"nama_lama": "Kerja Praktik / Magang Industri", "sks": 2, "semester_lama": 5, "status": "blue"}, "2023": {"nama_lama": "Kerja Praktik", "sks": 2, "semester_lama": 5, "status": "green"}, "2022": {"nama_lama": "Kerja Praktik", "sks": 2, "semester_lama": 5, "status": "green"}}}, {"semester": 5, "kode": "FIUxxxxxx", "nama_2026": "Kewarganegaraan (Civics)", "kategori": "General Education", "sks": 2, "angkatan": {"2025": {"nama_lama": "Kewarganegaraan", "sks": 2, "semester_lama": 5, "status": "pink"}, "2024": {"nama_lama": "Kewarganegaraan", "sks": 2, "semester_lama": 5, "status": "pink"}, "2023": {"nama_lama": "Kewarganegaraan", "sks": 2, "semester_lama": 6, "status": "green"}, "2022": {"nama_lama": "Kewarganegaraan", "sks": 2, "semester_lama": 6, "status": "green"}}}, {"semester": 5, "kode": "FIUxxxxxx", "nama_2026": "Pancasila (Pancasila)", "kategori": "General Education", "sks": 2, "angkatan": {"2025": {"nama_lama": "Pancasila", "sks": 2, "semester_lama": 5, "status": "pink"}, "2024": {"nama_lama": "Pancasila", "sks": 2, "semester_lama": 5, "status": "check"}, "2023": {"nama_lama": "Pancasila", "sks": 2, "semester_lama": 6, "status": "green"}, "2022": {"nama_lama": "Pancasila", "sks": 2, "semester_lama": 6, "status": "green"}}}, {"semester": 5, "kode": "TIF263103", "nama_2026": "Proyek Senior Teknologi Informasi (Information Engineering Senior Project)", "kategori": "Engineering Topic", "sks": 3, "angkatan": {"2025": {"nama_lama": "Proyek Senior Teknologi Informasi", "sks": 3, "semester_lama": 5, "status": "pink"}, "2024": {"nama_lama": "Proyek Senior Teknologi Informasi", "sks": 3, "semester_lama": 5, "status": "blue"}, "2023": {"nama_lama": "Proyek Senior Teknologi Informasi", "sks": 3, "semester_lama": 6, "status": "green"}, "2022": {"nama_lama": "Proyek Senior Teknologi Informasi", "sks": 3, "semester_lama": 6, "status": "green"}}}, {"semester": 5, "kode": "TIF263104", "nama_2026": "Teknik Visualisasi Grafis (Graphical Visualization Engineering)", "kategori": "Engineering Topic", "sks": 3, "angkatan": {"2025": {"nama_lama": "Teknik Visualisasi Grafis", "sks": 3, "semester_lama": 5, "status": "pink"}, "2024": {"nama_lama": "Teknik Visualisasi Grafis", "sks": 3, "semester_lama": 4, "status": "green"}, "2023": {"nama_lama": "Teknik Visualisasi Grafis", "sks": 3, "semester_lama": 4, "status": "green"}, "2022": {"nama_lama": "Teknik Visualisasi Grafis", "sks": 3, "semester_lama": 4, "status": "green"}}}, {"semester": 6, "kode": null, "nama_2026": "Mata Kuliah Pilihan (Pendalaman Prodi)", "kategori": "Engineering Topic", "sks": 20, "angkatan": {"2025": {"nama_lama": "Mata Kuliah Pilihan", "sks": 10, "semester_lama": 6, "status": "pink"}, "2024": {"nama_lama": "Mata Kuliah Pilihan", "sks": 10, "semester_lama": 6, "status": "pink"}, "2023": {"nama_lama": "Mata Kuliah Pilihan", "sks": 8, "semester_lama": 6, "status": "pink"}, "2022": {"nama_lama": "Mata Kuliah Pilihan (A dan B)", "sks": 15, "semester_lama": 7, "status": "green"}}}, {"semester": 7, "kode": "FIUxxxxxx", "nama_2026": "Humaniora Digital (Digital Humanities)", "kategori": "General Education", "sks": 2, "angkatan": {"2025": {"nama_lama": "Humaniora Digital", "sks": 2, "semester_lama": 7, "status": "pink"}, "2024": {"nama_lama": "Humaniora Digital", "sks": 2, "semester_lama": 7, "status": "pink"}, "2023": {"nama_lama": "Humaniora Digital", "sks": 2, "semester_lama": 1, "status": "blue"}, "2022": {"nama_lama": "Manajemen Industri", "sks": 2, "semester_lama": 1, "status": "green"}}}, {"semester": 7, "kode": "TIF264101", "nama_2026": "Interaksi Manusia dan Komputer (Human Computer Interaction)", "kategori": "Engineering Topic", "sks": 3, "angkatan": {"2025": {"nama_lama": "Interaksi Manusia dan Komputer", "sks": 3, "semester_lama": 7, "status": "pink"}, "2024": {"nama_lama": "Interaksi Manusia dan Komputer", "sks": 3, "semester_lama": 7, "status": "pink"}, "2023": {"nama_lama": "Interaksi Manusia dan Komputer", "sks": 3, "semester_lama": 5, "status": "green"}, "2022": {"nama_lama": "Interaksi Manusia dan Komputer", "sks": 3, "semester_lama": 5, "status": "green"}}}, {"semester": 7, "kode": "UNUxxxx", "nama_2026": "Kewirausahaan Teknologi (Technology Entrepreneurship)", "kategori": "Engineering Topic", "sks": 2, "angkatan": {"2025": {"nama_lama": "Kewirausahaan Teknologi", "sks": 2, "semester_lama": 7, "status": "pink"}, "2024": {"nama_lama": "Kewirausahaan Teknologi", "sks": 2, "semester_lama": 7, "status": "pink"}, "2023": {"nama_lama": "Kewirausahaan Teknologi", "sks": 2, "semester_lama": 7, "status": "blue"}, "2022": {"nama_lama": "Kewirausahaan Teknologi", "sks": 2, "semester_lama": 7, "status": "green"}}}, {"semester": 7, "kode": "FIUxxxxxx", "nama_2026": "Komunikasi Masyarakat (Public Communication)", "kategori": "General Education", "sks": 2, "angkatan": {"2025": {"nama_lama": "Komunikasi Masyarakat", "sks": 2, "semester_lama": 7, "status": "pink"}, "2024": {"nama_lama": "Komunikasi Masyarakat", "sks": 2, "semester_lama": 7, "status": "pink"}, "2023": {"nama_lama": "Komunikasi Masyarakat", "sks": 2, "semester_lama": 7, "status": "blue"}, "2022": {"nama_lama": "Komunikasi Masyarakat", "sks": 2, "semester_lama": 7, "status": "green"}}}, {"semester": 7, "kode": "FIUxxxxxx", "nama_2026": "Kuliah Kerja Nyata (Field Study and Community Service)", "kategori": "General Education", "sks": 4, "angkatan": {"2025": {"nama_lama": "Kuliah Kerja Nyata", "sks": 4, "semester_lama": 7, "status": "pink"}, "2024": {"nama_lama": "Kuliah Kerja Nyata", "sks": 4, "semester_lama": 7, "status": "pink"}, "2023": {"nama_lama": "Kuliah Kerja Nyata", "sks": 4, "semester_lama": 7, "status": "blue"}, "2022": {"nama_lama": "Kuliah Kerja Nyata", "sks": 4, "semester_lama": 7, "status": "green"}}}, {"semester": 7, "kode": "FIUxxxxxx", "nama_2026": "Penerapan Teknologi Tepat Guna (Appropriate Technology Application)", "kategori": "General Education", "sks": 2, "angkatan": {"2025": {"nama_lama": "Penerapan Teknologi Tepat Guna", "sks": 2, "semester_lama": 7, "status": "pink"}, "2024": {"nama_lama": "Penerapan Teknologi Tepat Guna", "sks": 2, "semester_lama": 7, "status": "pink"}, "2023": {"nama_lama": "Penerapan Teknologi Tepat Guna", "sks": 2, "semester_lama": 7, "status": "blue"}, "2022": {"nama_lama": "Penerapan Teknologi Tepat Guna", "sks": 2, "semester_lama": 7, "status": "green"}}}, {"semester": 7, "kode": "TKUXXXX", "nama_2026": "Proyek Individual (Individual Project)", "kategori": "Engineering Topic", "sks": 3, "angkatan": {"2025": {"nama_lama": "Proyek Individual", "sks": 3, "semester_lama": 7, "status": "pink"}, "2024": {"nama_lama": "Proyek Individual", "sks": 3, "semester_lama": 7, "status": "pink"}, "2023": {"nama_lama": "Proyek Individual", "sks": 3, "semester_lama": 7, "status": "blue"}, "2022": {"nama_lama": "Skripsi & Pendadaran", "sks": 4, "semester_lama": 7, "status": "green"}}}, {"semester": 7, "kode": "TIF264102", "nama_2026": "Proyek Perancangan Teknologi Informasi 1 (Capstone Design Project 1)", "kategori": "Engineering Topic", "sks": 2, "angkatan": {"2025": {"nama_lama": "Proyek Perancangan Teknologi Informasi 1", "sks": 2, "semester_lama": 7, "status": "pink"}, "2024": {"nama_lama": "Proyek Perancangan Teknologi Informasi 1", "sks": 2, "semester_lama": 7, "status": "pink"}, "2023": {"nama_lama": "Proyek Perancangan Teknologi Informasi 1", "sks": 2, "semester_lama": 6, "status": "green"}, "2022": {"nama_lama": "Proyek Perancangan Teknologi Informasi 1", "sks": 2, "semester_lama": 6, "status": "green"}}}, {"semester": 8, "kode": "TIF264201", "nama_2026": "Proyek Perancangan Teknologi Informasi 2 (Capstone Design Project 2)", "kategori": "Engineering Topic", "sks": 2, "angkatan": {"2025": {"nama_lama": "Proyek Perancangan Teknologi Informasi 2", "sks": 2, "semester_lama": 8, "status": "pink"}, "2024": {"nama_lama": "Proyek Perancangan Teknologi Informasi 2", "sks": 2, "semester_lama": 8, "status": "pink"}, "2023": {"nama_lama": "Proyek Perancangan Teknologi Informasi 2", "sks": 2, "semester_lama": 7, "status": "blue"}, "2022": {"nama_lama": "Proyek Perancangan Teknologi Informasi 2", "sks": 2, "semester_lama": 7, "status": "green"}}}, {"semester": 8, "kode": "UNUxxxxx", "nama_2026": "Studium Generale (Studium Generale)", "kategori": "Engineering Topic", "sks": 2, "angkatan": {"2025": {"nama_lama": "Studium Generale", "sks": 2, "semester_lama": 8, "status": "pink"}, "2024": {"nama_lama": "Studium Generale", "sks": 2, "semester_lama": 8, "status": "pink"}, "2023": {"nama_lama": "Studium Generale", "sks": 2, "semester_lama": 7, "status": "blue"}, "2022": {"nama_lama": "Studium Generale", "sks": 2, "semester_lama": 8, "status": "green"}}}];

const EXTRA_CREDITS = {
  "2025": [
    { nama: "Teori Vektor dan Matriks", sks: 2, semester: 1 },
    { nama: "Analisis Variabel Kompleks", sks: 3, semester: 2 },
    { nama: "Fisika Listrik dan Magnet", sks: 3, semester: 2 },
    { nama: "Manajemen Industri", sks: 2, semester: 1 }
  ],
  "2024": [
    { nama: "Teori Vektor dan Matriks", sks: 2, semester: 1 },
    { nama: "Analisis Variabel Kompleks", sks: 3, semester: 2 },
    { nama: "Fisika Fluida, Kalor dan Gelombang", sks: 3, semester: 1 },
    { nama: "Manajemen Industri", sks: 2, semester: 1 }
  ],
  "2023": [
    { nama: "Teori Vektor dan Matriks", sks: 2, semester: 1 },
    { nama: "Analisis Variabel Kompleks", sks: 3, semester: 2 },
    { nama: "Fisika Fluida, Kalor dan Gelombang", sks: 3, semester: 1 },
    { nama: "Manajemen Industri", sks: 2, semester: 1 },
    { nama: "Integrasi Aplikasi dan Informasi", sks: 2, semester: 6 }
  ],
  "2022": [
    { nama: "Teori Vektor dan Matriks", sks: 2, semester: 1 },
    { nama: "Analisis Variabel Kompleks", sks: 3, semester: 2 },
    { nama: "Fisika Fluida, Kalor dan Gelombang", sks: 3, semester: 1 },
    { nama: "Integrasi Aplikasi dan Informasi", sks: 2, semester: 6 }
  ]
};

const SUMMARY_TOTALS = {
  "2025": { utama: 27,  tambahan: 10, total: 37,  proyeksi: 144 },
  "2024": { utama: 62,  tambahan: 10, total: 72,  proyeksi: 144 },
  "2023": { utama: 102, tambahan: 12, total: 114, proyeksi: 145 },
  "2022": { utama: 139, tambahan: 10, total: 149, proyeksi: 151 }
};

const KATEGORI_CLASS = {
  "Basic Science": "kat-basic",
  "Engineering Topic": "kat-eng",
  "General Education": "kat-gen"
};

function cleanName(name) {
  return (name || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
}

// ── Render: Struktur Kurikulum per semester (accordion) ───────────
function renderStruktur() {
  const container = document.getElementById('struktur-accordion');
  if (!container) return;
  const bySem = {};
  CURRICULUM_2026.forEach(c => {
    (bySem[c.semester] = bySem[c.semester] || []).push(c);
  });

  let html = '';
  Object.keys(bySem).sort((a, b) => a - b).forEach(sem => {
    const items = bySem[sem];
    const totalSks = items.reduce((s, c) => s + c.sks, 0);
    const open = sem == 1 ? ' open' : '';
    html += `
    <details class="kur-accordion-item"${open}>
      <summary>
        <span class="kur-sem-badge">Semester ${sem}</span>
        <span class="kur-sem-title">${semesterLabel(sem)}</span>
        <span class="kur-sem-sks">${totalSks} SKS</span>
      </summary>
      <div class="kur-accordion-body">
        <table class="kur-table">
          <thead><tr><th>Kode</th><th>Mata Kuliah</th><th>Kategori</th><th>SKS</th></tr></thead>
          <tbody>
            ${items.map(c => `
            <tr>
              <td class="kur-mono">${c.kode || '—'}</td>
              <td>${c.nama_id}${c.nama_en ? `<span class="kur-en"> (${c.nama_en})</span>` : ''}</td>
              <td><span class="kur-kat ${KATEGORI_CLASS[c.kategori] || ''}">${c.kategori}</span></td>
              <td class="kur-sks">${c.sks}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </details>`;
  });
  container.innerHTML = html;
}

function semesterLabel(sem) {
  const labels = {
    1: 'Fondasi sains & pemrograman dasar',
    2: 'Struktur data & basis data',
    3: 'Sistem, jaringan & AI dasar',
    4: 'Rekayasa perangkat lunak & data',
    5: 'Desain sistem, keamanan & proyek senior',
    6: 'Spesialisasi / pendalaman prodi',
    7: 'Proyek individu & capstone design 1',
    8: 'Capstone design 2 & kelulusan'
  };
  return labels[sem] || '';
}

// ── Render: Konsentrasi / Jalur Karir ─────────────────────────────
function renderSpecialization() {
  const container = document.getElementById('jalur-grid');
  if (!container) return;
  const byJalur = {};
  SPECIALIZATION.forEach(c => {
    (byJalur[c.jalur] = byJalur[c.jalur] || []).push(c);
  });

  let html = '';
  Object.keys(byJalur).forEach(jalur => {
    const items = byJalur[jalur];
    const info = JALUR_INFO[jalur] || { icon: '📘', desc: '' };
    const totalSks = items.reduce((s, c) => s + c.sks, 0);
    html += `
    <div class="kur-jalur-card">
      <div class="kur-jalur-head">
        <div class="kur-jalur-icon">${info.icon}</div>
        <div>
          <h3>${jalur}</h3>
          <span class="kur-jalur-sks">${totalSks} SKS</span>
        </div>
      </div>
      <p class="kur-jalur-desc">${info.desc}</p>
      <ul class="kur-jalur-list">
        ${items.map(c => `<li>${c.nama_id}${c.sks ? ` <span class="kur-jalur-item-sks">(${c.sks} SKS)</span>` : ''}</li>`).join('')}
      </ul>
    </div>`;
  });
  container.innerHTML = html;

  renderSurvey();
}

function renderSurvey() {
  const container = document.getElementById('survey-chart');
  if (!container) return;
  const max = Math.max(...SURVEY.map(s => s.persen));
  container.innerHTML = SURVEY.map(s => `
    <div class="kur-survey-row">
      <span class="kur-survey-label">${s.jalur}</span>
      <div class="kur-survey-track">
        <div class="kur-survey-fill" style="width:${(s.persen / max * 100).toFixed(0)}%"></div>
      </div>
      <span class="kur-survey-val">${s.persen}%</span>
    </div>`).join('');
}

// ── Render: Cek Status Mata Kuliah per Angkatan ───────────────────
const STATUS_LABEL = {
  green: 'Sudah diambil',
  pink: 'Belum diambil',
  blue: 'Mata kuliah baru — segera ditawarkan',
  check: 'Perlu konfirmasi ke prodi'
};

let currentAngkatan = '2025';

function renderChecker(angkatan) {
  currentAngkatan = angkatan;
  document.querySelectorAll('.kur-angkatan-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.angkatan === angkatan);
  });

  const bySem = {};
  CHECKER_DATA.forEach(c => {
    (bySem[c.semester] = bySem[c.semester] || []).push(c);
  });

  const container = document.getElementById('checker-table-container');
  let html = '';
  Object.keys(bySem).sort((a, b) => a - b).forEach(sem => {
    html += `<div class="kur-checker-sem-label">Semester ${sem} <span>(Kurikulum 2026)</span></div>`;
    html += '<div class="kur-checker-grid">';
    bySem[sem].forEach(c => {
      const a = c.angkatan[angkatan];
      const statusClass = 'st-' + a.status;
      const extra = a.nama_lama_extra ? ` &amp; ${a.nama_lama_extra}` : '';
      html += `
      <div class="kur-checker-card ${statusClass}">
        <div class="kur-checker-name">${cleanName(c.nama_2026)}</div>
        <div class="kur-checker-old">≈ ${a.nama_lama || '—'}${extra}</div>
        <div class="kur-checker-meta">
          <span class="kur-checker-status">${STATUS_LABEL[a.status]}</span>
          ${a.semester_lama ? `<span class="kur-checker-oldsem">Sem. lama: ${a.semester_lama}</span>` : ''}
        </div>
      </div>`;
    });
    html += '</div>';
  });
  container.innerHTML = html;

  // Summary stats
  const tot = SUMMARY_TOTALS[angkatan];
  document.getElementById('stat-utama').textContent = tot.utama;
  document.getElementById('stat-tambahan').textContent = tot.tambahan;
  document.getElementById('stat-total').textContent = tot.total;
  document.getElementById('stat-proyeksi').textContent = tot.proyeksi;

  // Extra / tambahan credits list
  const extraList = document.getElementById('extra-credit-list');
  const extras = EXTRA_CREDITS[angkatan] || [];
  extraList.innerHTML = extras.length
    ? extras.map(e => `<li>${e.nama} <span class="kur-jalur-item-sks">(${e.sks} SKS, diambil semester ${e.semester} di Kurikulum 2021)</span></li>`).join('')
    : '<li>Tidak ada mata kuliah tambahan di luar Kurikulum 2026.</li>';
}

// ── Init ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderStruktur();
  renderSpecialization();
  renderChecker('2025');

  document.querySelectorAll('.kur-angkatan-chip').forEach(chip => {
    chip.addEventListener('click', () => renderChecker(chip.dataset.angkatan));
  });

  // FAQ accordion (re-use details/summary, no JS needed — native <details>)
});
