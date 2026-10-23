# Hunty Zombie — Arena Bertahan Hidup 2D

Game web retro 2D survival zombie berbasis **HTML5 Canvas**, **Vanilla CSS**, dan **JavaScript ES Modules murni** tanpa framework, bundler, atau dependency eksternal.

---

## 1. Arsitektur & Struktur Proyek

- `index.html`: **Marketing & Informational Field Log Page** — Berkas log lapangan pemburu, live weapon simulator berbasis data nyata dari `src/core/Constants.js`, arsip transmisi radar, galeri tangkapan layar, dan daftar kredit pengembang.
- `menu.html`: **Tactical Game Screen (App Screen)** — Arena game 2D interaktif, HUD tempur berkinerja tinggi, virtual joystick & tombol kontrol mobile, boss HP bar, dan seluruh overlay modal operasional.
- `css/home.css`: Sistem desain berorientasi arsip log lapangan (`page-is-the-object`) dengan tipografi mandiri *Hanken Grotesk*.
- `css/style.css`: Sistem antarmuka game taktis OLED datar (`true-black-flat`) dengan palet bersama *Graphite & Safety Orange*.
- `src/`: Modul logika game (GameManager, Player, Zombie, Boss, SoundManager, dll) yang tetap terlindungi tanpa perubahan logika internal.
- `assets/fonts/`: File font Google Fonts berlisensi OFL (*Hanken Grotesk* 400, 500, 600, 700, 800) yang di-host mandiri tanpa CDN eksternal.

---

## 2. Parameter Debug UI Pengembang (`?ui=<state>`)

Untuk mempermudah inspeksi visual otomatis (`inspect.mjs --app`), review desain, dan pengujian komponen simulasi tanpa harus memainkan sesi pertempuran penuh dari awal, `menu.html` menyediakan parameter query dev-only `?ui=<state>`.

Buka URL berikut di browser atau jalankan via web server:

| Parameter URL | Status Tampilan Layar | Deskripsi & Komponen yang Ditampilkan |
| :--- | :--- | :--- |
| `menu.html?ui=menu` | **Pos Komando (Menu Awal)** | Menu utama dengan aksi mulai operasi, panduan, pengaturan, dan navigasi modal. |
| `menu.html?ui=weapon` | **Seleksi Arsenal Senjata** | Grid 4 senjata taktikal (Katana, Fist, Kitab Sihir, Dual Pistol) beserta statistik. |
| `menu.html?ui=tutorial` | **Instruksi Protokol Lapangan** | Manual panduan kontrol gerak W/A/S/D, mouse, mobile joystick, dan mekanika boss. |
| `menu.html?ui=hud` | **HUD Tempur In-Game** | Status HP pemburu, gelombang, skor, koin, munisi, virtual joystick, dan tombol pause. |
| `menu.html?ui=boss` | **Fase Boss & Darurat** | Bar HP Boss besar di atas layar, meteran stun, serta efek vignette merah saat HP kritis. |
| `menu.html?ui=pause` | **Simulasi Dijeda** | Overlay jeda operasi dengan opsi resume, pengaturan audio/visual, dan kembali ke menu. |
| `menu.html?ui=gameover` | **Debriefing Gugur** | Ringkasan statistik akhir: skor, wave, kill, akurasi, total damage, dan catatan rekor. |
| `menu.html?ui=upgrade` | **Modifikasi Antar Gelombang** | 3 pilihan upgrade taktikal antar-wave dengan angka riil dan glyph piksel geometris. |
| `menu.html?ui=shop` | **Pos Pedagang Karantina** | Toko logistik untuk menukar koin hasil eliminasi dengan P3K, munisi, dan rompi balistik. |
| `menu.html?ui=character`| **Seleksi Karakter Operatif** | Pilihan 3 karakter pemburu (Scout, Vanguard, Arcane Survivor) dengan stat unik. |
| `menu.html?ui=mode` | **Mode & Tingkat Kesulitan** | Pengaturan mode (Endless, Boss Rush, Daily Seed, Hardcore) dan tingkat agresi. |
| `menu.html?ui=settings` | **Pengaturan Operasional** | Slider volume audio/SFX, toggle screen shake, kualitas partikel, dan tabel keybind. |

> **Catatan:** Membuka `menu.html` tanpa parameter query akan menjalankan alur game normal secara default (langsung menuju seleksi senjata sebelum penerjunan).

---

## 3. Menjalankan Game Secara Lokal

Buka file langsung di browser atau jalankan server statis sederhana:

```bash
# Menggunakan npx serve atau Python
npx serve .
# atau
python -m http.server 8000
```

Buka `http://localhost:8000/index.html` untuk halaman beranda atau `http://localhost:8000/menu.html` untuk arena game.

---

## 4. Verifikasi Standar Kualitas Desain (Tasteskill v2)

Proyek ini telah lulus verifikasi desain ketat anti-template menggunakan real-browser inspector:
- **Lint Check (`lint.mjs`)**: 0 FAIL, 0 WARN
- **Page Inspection (`inspect.mjs index.html`)**: 0 FAIL
- **App Inspection (`inspect.mjs menu.html --app`)**: 0 FAIL, 0 WARN
- Bebas dari emoji dekoratif, bayangan glow berlebih, font stock acak, dan layout thrashing pada game loop.
