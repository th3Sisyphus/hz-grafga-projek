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

---

## 5. Log Pengembangan: Fase 0 — Bug dan Fondasi

Fase 0 telah diselesaikan dengan fondasi logika permainan yang bersih dan terukur:
1. **Game Clock (`context.time`)**: Menghilangkan seluruh `Date.now()` dan `setTimeout` di logika gameplay (`src/`). Timer cooldown senjata, durasi terbakar (*burn*), stun, dan delay antar gelombang dihentikan sepenuhnya saat game di-pause (terbukti durasi stun/burn tidak berkurang selama 10 detik jeda).
2. **Delta Time Normalization (dt @ 60 FPS)**: Gerak operatif, zombie, dan proyektil dinormalisasi ke 60 FPS sehingga jarak tempuh per detik identik pada layar 60 Hz maupun 144 Hz (deviasi < 1e-13).
3. **Mekanika Tile Duri (Spike)**: Duri bukan lagi rintangan dinding padat, melainkan hazard lantai yang melukai operatif maupun zombie yang melangkah di atasnya (10 damage setiap interval 500ms).
4. **Sentralisasi Data & Weapon Balance (`arc`)**:
   - Sumber kebenaran senjata dipindahkan ke `src/core/data/weapons.js` dan di-re-export melalui `Constants.js` sehingga simulator di `index.html` tetap berjalan mulus.
   - Ditambahkan field `arc` (setengah sudut kerucut tebasan dalam radian) untuk sinkronisasi 100% antara hit detection dan visual rendering.
   - **Katana**: Damage 70, Range 80, Crit 3.0x, Arc 1.0 rad (~57.3°), Cooldown 400ms, Speed +0.4, Lifesteal 5%.
   - **Tangan Kosong (Fist)**: Damage 35, Range 45, Crit 1.5x, Arc 0.7 rad (~40.1°), Cooldown 300ms, Speed +0.7, Lifesteal 10%.
   - **Kitab Sihir**: Damage 45, DOT Bakar 12/dtk (3d), Range 300, Cooldown 550ms.
   - **Pistol Ganda**: Damage 28, Area Ledakan 90 px, Range 380, Cooldown 450ms.
5. **Kurva Scaling Persentase Musuh**:
   - Kecepatan zombie asimptotik berbatas: tidak pernah melebihi 90% kecepatan dasar operatif (maks 2.43 px/frame).
   - Darah zombie: formula eksponensial `65 * (1.08)^(wave - 1)`. Pada gelombang 10 zombie biasa memiliki darah 130 HP (tepat tumbang dalam 2 tebasan Katana 70 dmg). Pada gelombang 20 darah mencapai 281 HP.
6. **Pathfinding Flow Field (BFS)**:
   - Dihitung ulang tiap ~0.4 detik pada grid 40x30 dari posisi player. Musuh yang terhalang obstacle pohon/batu mengikuti gradien flow field sehingga tidak pernah menempel atau tersangkut pada obstacle.
7. **Generator Peta Terhubung (Flood Fill)**:
   - Area spawn tengah (radius 3 tile) dijamin bebas obstacle. Seluruh area lantai dihubungkan dengan flood fill sehingga tidak ada pulau terisolasi, serta duri tidak pernah membentuk bottleneck tunggal.
8. **Identifikasi Entitas**: Mengganti seluruh pemeriksaan `constructor.name` dengan field `type` (`player`, `zombie`, `zombie_boss`, `melee`, dll).
9. **Statistik Riil & High Score**: Layar Debriefing Gugur menampilkan metrik nyata dari `context.stats` (`kills`, `shotsFired`, `hits`, `damageDealt`, `damageTaken`), menghapus angka hardcode 84% dan 1.420. Rekor skor dan wave tertinggi disimpan di localStorage dengan key `hz_record_v1`.
10. **Ambang HP Relatif**: Ambang vignette merah HP kritis (<= 25%) dan status bar bahaya (<= 30%) dihitung berdasarkan persentase `maxHealth`, bukan angka tetap.
11. **Optimasi Performa**: Batas partikel/efek maksimal 300 serta Spatial Hash grid cell 60px untuk kalkulasi separasi zombie O(n).
