# Panduan Gaya Seni Visual "Hunty Zombie" (Art Style Guide)

Dokumen ini merupakan sumber kebenaran (*single source of truth*) untuk seluruh aset visual *in-game* "Hunty Zombie". Semua sprite piksel, animasi, tile lingkungan, dan efek visual wajib mematuhi aturan baku di bawah ini.

---

## 1. Filosofi Gaya Visual
**"Muted Twilight World, High-Contrast Tactical FX"**
- **Suasana Dunia**: Gelap, muram, dan tertahan (*desaturated twilight wasteland*). Dunia pasca-kiamat didominasi nuansa tanah basah, rumput layu rawa, batu kelam, dan bayangan dingin.
- **Efek Tempur & Bahaya**: Menjaga kontras setinggi mungkin di atas palet dunia. Warna *Safety Orange* (`#ff4a1f`), ambar, dan *Healing Emerald* (`#2ec486`) hanya dipesan khusus untuk serangan senjata, telegraf bahaya boss/musuh, status kritis, dan pemulihan, sehingga aksi tempur selalu terbaca seketika (*instant readability*) bahkan dalam kawanan 80+ zombie.
- **Prinsip Piksel Murni**: Tidak menggunakan blur, gradient kanvas, maupun shadowBlur. Shading dikerjakan dengan langkah nada warna diskrit (*stepped color ramps*).

---

## 2. Palet Baku 32 Warna (*The 32-Color Quarantine Palette*)

Palet terdiri dari tepat 32 warna heksadesimal yang dikelompokkan ke dalam rumpun material fungsional. Setiap material memiliki aturan **3 nada (*shadow, mid/base, highlight*)**:

| Indeks | Hex | Nama Token | Rumpun | Peran & Penggunaan |
| :---: | :---: | :--- | :--- | :--- |
| **00** | `#08090a` | `void-black` | Netral / Outline | Garis luar siluet, bayangan terdalam, mata mati |
| **01** | `#121417` | `night-abyss` | Netral / Shadow | Bayangan entitas, celah rintangan, kedalaman jurang |
| **02** | `#1b1e23` | `slate-shadow` | Dunia / Batu | Nada bayangan bebatuan, lantai batu, puing logam |
| **03** | `#2a2f38` | `slate-mid` | Dunia / Batu | Nada dasar batu, kerikil keras, dinding pelindung |
| **04** | `#3f4754` | `slate-light` | Dunia / Batu | Tepi atas batu, pantulan dingin sudut bebatuan |
| **05** | `#1a1612` | `dirt-shadow` | Dunia / Tanah | Bayangan galian tanah, lumpur dalam, retakan tanah |
| **06** | `#2e251b` | `dirt-mid` | Dunia / Tanah | Nada dasar jalan tanah, tanah karantina |
| **07** | `#4a3d2e` | `dirt-light` | Dunia / Tanah | Debu kering, jejak kaki tanah, tepian kontur |
| **08** | `#131c14` | `swamp-shadow` | Dunia / Rumput | Nada bayangan rumput rawa, lumut lembab bawah pohon |
| **09** | `#223324` | `swamp-mid` | Dunia / Rumput | Nada dasar tile rumput layu, vegetasi liar |
| **10** | `#374f3a` | `swamp-light` | Dunia / Rumput | Ujung helai rumput tersorot senja, pucuk lumut |
| **11** | `#1c140e` | `bark-shadow` | Dunia / Kayu | Sisi gelap batang pohon, kayu busuk, akar tanah |
| **12** | `#302014` | `bark-mid` | Dunia / Kayu | Nada dasar batang pohon, papan penghalang |
| **13** | `#483422` | `bark-light` | Dunia / Kayu | Kulit kayu tersorot cahaya kiri-atas |
| **14** | `#19241b` | `canopy-shadow`| Dunia / Daun | Bagian bawah rimbunan kanopi pohon |
| **15** | `#2a3d2e` | `canopy-mid` | Dunia / Daun | Rimbunan utama daun cemara / pinus pasca-wabah |
| **16** | `#3f5944` | `canopy-light` | Dunia / Daun | Daun terluar kanopi yang menangkap cahaya |
| **17** | `#1c2420` | `zombie-shadow`| Zombie / Kulit | Lipatan kulit membusuk, bayangan otot spesimen |
| **18** | `#2f3d35` | `zombie-mid` | Zombie / Kulit | Kulit abu-kehijauan khas zombie terinfeksi |
| **19** | `#4d6155` | `zombie-light` | Zombie / Kulit | Tonjolan tulang, dahi pucat, buku jari spesimen |
| **20** | `#241818` | `ichor-dark` | Zombie / Cairan | Noda darah/lendir mengering, daging terbuka gelap |
| **21** | `#402222` | `ichor-mid` | Zombie / Cairan | Percikan cairan saat zombie tertebas/tertembak |
| **22** | `#20232a` | `rag-shadow` | Zombie / Baju | Pakaian koyak bagian dalam/bawah |
| **23** | `#363b47` | `rag-mid` | Zombie / Baju | Baju lusuh perawat/warga yang terinfeksi |
| **24** | `#2b333d` | `steel-shadow` | Senjata / Besi | Bayangan bilah pedang, badan senjata api, paku |
| **25** | `#526070` | `steel-mid` | Senjata / Besi | Logam katana, receiver pistol, pelat zirah |
| **26** | `#94a3b8` | `steel-light` | Senjata / Besi | Mata pisau katana tajam, kilap laras senjata |
| **27** | `#e2e8f0` | `steel-gleam` | Senjata / Besi | Ujung kilau tebasan katana, highlight puncak logam |
| **28** | `#cc3714` | `hazard-deep` | Tempur / FX | Batas luar telegraf boss, ekor tebasan, api dasar |
| **29** | `#ff4a1f` | `safety-orange`| Tempur / FX | *Safety Orange* UI token: inti tebasan, flash telegraf |
| **30** | `#f0b429` | `amber-spark` | Tempur / FX | Percikan kritikal (*crit*), moncong api pistol (*muzzle flash*) |
| **31** | `#2ec486` | `vital-green` | Tempur / Status | *Healing Emerald* UI token: partikel heal, aura hidup |

---

## 3. Ukuran Grid Piksel & Perbandingan Dua Arah Gaya

| Parameter | Arah A: Chunky Pixel Art (1:2) | Arah B: Detailed Natural (1:1) |
| :--- | :--- | :--- |
| **Skala Piksel** | 1 piksel seni = 2 piksel layar canvas | 1 piksel seni = 1 piksel layar canvas |
| **Ukuran Tile** | $20 \times 20$ piksel seni (tampil $40 \times 40$ px) | $40 \times 40$ piksel seni (tampil $40 \times 40$ px) |
| **Ukuran Zombie Biasa** | $16 \times 16$ piksel seni (tampil $32 \times 32$ px) | $32 \times 32$ piksel seni (tampil $32 \times 32$ px) |
| **Ukuran Boss Zombie** | $32 \times 32$ piksel seni (tampil $64 \times 64$ px) | $64 \times 64$ piksel seni (tampil $64 \times 64$ px) |
| **Ukuran Senjata** | $16 \times 16$ piksel seni | $24 \times 24$ piksel seni |
| **Ukuran Arc Tebasan** | Sabit tajam $24 \times 24$ berani | Sabit presisi $40 \times 40$ bertahap |
| **Karakter Outline** | Garis luar hitam penuh 1-px di seluruh siluet | Outline selektif (*dark tone outline* di sisi bayangan) |
| **Kelebihan Utama** | Kontras tinggi, keterbacaan ekstrem saat 80+ zombie, gaya retro arcade klasik | Detail anatomi lebih halus, atmosfer senja realistis, gerakan mikro lebih kaya |

---

## 4. Aturan Pencahayaan & Shading
1. **Arah Cahaya Seragam**: Cahaya matahari senja datang dari arah **Kiri-Atas (Top-Left, sudut 45°)**.
   - Sisi atas dan kiri menerima warna `light` (highlight).
   - Bagian tengah menerima warna `mid` (base).
   - Sisi bawah dan kanan menerima warna `shadow`.
2. **Aturan 3-Tone Shading**: Setiap elemen material hanya boleh menggunakan 3 nada warna berurutan dari tabel palet (contoh rumput: `swamp-shadow`, `swamp-mid`, `swamp-light`). Dilarang memakai gradien halus atau pencampuran alpha transparan untuk shading permukaan.
3. **Pencahayaan Emisif Khusus**:
   - Mata zombie: 2 piksel titik warna `amber-spark` (`#f0b429`) dengan intensitas penuh tanpa shading, menembus kegelapan.
   - Efek tebasan: transisi tajam dari `steel-gleam` (inti putih) ke `safety-orange` (lingkar tajam) ke `hazard-deep` (ekor dissipasi).

---

## 5. Aturan Frame & Durasi Animasi

Semua animasi dikendalikan oleh waktu permainan (*game clock* berbasis milidetik), bukan hitungan frame monitor:

| Kategori Animasi | Jumlah Frame | Durasi Total | Detail Timing per Frame |
| :--- | :---: | :---: | :--- |
| **Zombie Walk** | 4 frame | 600 ms | 150 ms per frame (langkah kiri, tegap, langkah kanan, tegap; bobbing 1px) |
| **Zombie Attack** | 4 frame | 400 ms | F1: Windup (100ms) $\to$ F2: Hantam (80ms) $\to$ F3: Strike Hold (100ms) $\to$ F4: Recover (120ms) |
| **Katana Slash Arc** | 4 frame | 240 ms | F1: Windup Spark (50ms) $\to$ F2: Apex Crescent (60ms) $\to$ F3: Residual Arc (70ms) $\to$ F4: Dissipate (60ms) |
| **Hit Flash** | 1 frame bake | 80 ms | Siluet putih penuh (`#f8fafc`) yang di-bake langsung dari atlas |
| **Pohon Sway** | 2 frame | 1200 ms | Goyang lembut dedaunan (600 ms per frame deterministik) |

---

## 6. Batasan & Larangan Teknis Keras
- **DILARANG** menggunakan `ctx.filter` (misal `filter: brightness` atau `hue-rotate`) pada loop per frame karena membebani GPU/CPU canvas.
- **DILARANG** menggunakan `ctx.shadowBlur` dan `ctx.shadowColor` di seluruh sprite dan efek partikel.
- **DILARANG** menggunakan `createLinearGradient` atau `createRadialGradient` di dalam drawing sprite atau tebasan.
- **DILARANG** memanggil `Math.random()` di dalam fungsi render / draw. Setiap variasi visual lantai/pohon wajib memakai fungsi hash posisi deterministik:
  $$\text{hash}(x, y) = ((x \times 374761393 + y \times 668265263) \land 0x7FFFFFFF) \pmod N$$
- **WAJIB** `ctx.imageSmoothingEnabled = false` untuk menjaga tepi piksel tetap renyah tanpa interpolasi kabur.
- **WAJIB** Koordinat gambar di-round (`Math.floor` / `Math.round`) ke nilai integer sebelum *blit*.
