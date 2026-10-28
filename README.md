# 🐼 Panda Belajar Mandarin

Aplikasi web untuk belajar kosakata bahasa Mandarin dengan flashcard, kuis pilihan ganda, dan pengulangan berjarak (Leitner), ditemani maskot panda. Antarmuka berbahasa Indonesia, tanpa backend, dan progress tersimpan di browser.

> **Demo:** _(tambahkan link demo di sini setelah deploy)_

| Mobile | Desktop |
| :---: | :---: |
| _(screenshot mobile: beranda / flashcard / kuis)_ | _(screenshot desktop: beranda / progress)_ |
| `docs/screenshot-mobile.png` | `docs/screenshot-desktop.png` |

---

## Latar belakang

Saya belajar bahasa Mandarin dari buku pelajaran. Setiap bab memuat puluhan kata baru, dan daftar kata di buku sulit dipakai untuk mengulang: tidak bisa diacak, tidak bisa ditutup untuk menguji diri, dan tidak tahu kata mana yang sudah benar-benar hafal.

Saya mengetik kosakata tiap bab (hanzi, pinyin, jenis kata, arti Indonesia dan Inggris) ke dalam file JSON, lalu membangun aplikasi ini agar data itu bisa dipakai untuk:

- mengulang lewat **flashcard** dua arah,
- menguji diri lewat **kuis**, dengan kata yang sering salah muncul lebih sering,
- melihat **progress** per bab sehingga tahu bagian mana yang perlu dilatih.

Proyek ini sekaligus portofolio: dirancang agar menyenangkan dipakai di ponsel maupun desktop, ramah aksesibilitas, dan mudah ditambah bab barunya.

## Fitur

- **Flashcard**: flip 3D, arah Hanzi → Arti atau Arti → Hanzi, tombol Hafal / Belum hafal, navigasi sebelumnya/berikutnya, mode acak. Keyboard: `Spasi` balik, `←` `→` pindah, `H` hafal, `B` belum hafal. Swipe di layar sentuh (kanan = hafal, kiri = belum hafal).
- **Kuis pilihan ganda**: tiga mode (Hanzi → Arti, Arti → Hanzi, Hanzi → Pinyin), 10 / 20 / semua soal, 4 pilihan dengan pengecoh sejenis kata, skor akhir, dan tinjauan jawaban yang salah. Jawaban salah otomatis menurunkan kata ke "belum hafal".
- **Leitner 3 kotak** ("keranjang bambu"): jawaban benar naik kotak, salah kembali ke kotak 1; kata di kotak rendah lebih sering muncul.
- **Suara**: tombol lafal memakai Web Speech API (`zh-CN`). Disembunyikan otomatis jika browser tidak mendukung atau suara Mandarin tidak tersedia.
- **Bahasa terjemahan**: Indonesia / English / Keduanya, berlaku di seluruh aplikasi.
- **Filter & pencarian**: per bab (chip berwarna), kategori, jenis kata, status hafal, dan pencarian hanzi / pinyin / arti (abai tanda nada: `ni hao` menemukan `nǐ hǎo`).
- **Daftar kosakata**: tabel di layar lebar, daftar kartu di ponsel.
- **Beranda**: sapaan panda, target harian (10 kata), streak, dan kartu semua bab dengan progress ring.
- **Progress**: persentase hafal per bab dan kategori, isi keranjang Leitner, dan panda yang "makan bambu": makin banyak kata hafal, makin banyak bambu termakan.
- **Konfeti** (canvas ringan) saat skor kuis ≥ 80% dan saat target harian tercapai.
- **Mode terang / gelap / ikut sistem**, reset progress dengan dialog konfirmasi.

## Keputusan desain

### Maskot
Panda dibuat sebagai komponen SVG inline buatan sendiri (`PandaMascot.jsx`), bukan gambar atau karakter milik pihak lain. Gayanya bulat dan sederhana, dengan enam ekspresi (`mood`): `happy`, `sad`, `thinking`, `sleeping`, `eating`, `cheer`. Panda dipakai sebagai logo, sapaan di beranda, reaksi saat belajar dan kuis, serta ilustrasi pada tampilan kosong, memuat, dan galat. Animasi kecil (berkedip, mengangguk, bergoyang, bernapas) otomatis mati saat `prefers-reduced-motion`.

### Palet warna
Nuansa hangat seperti taman bambu: latar krem (`#FFFBF2`), aksen hijau bambu (`#4CAF7A`) dan hijau daun tua (`#2E7D5B`), ditambah sakura, madu, biru langit, persik, dan lavender. Mode gelap memakai biru-hijau tua (`#16211D`), bukan abu-abu netral.

- Semua token warna adalah CSS variables berbentuk channel RGB (`src/index.css`) yang dipasang ke Tailwind (`tailwind.config.js`), jadi tema bisa diubah di satu tempat.
- **Warna per bab** dihitung dari nomor bab (`lib/chapterColors.js`) dan berputar melalui palet aksen, sehingga bab baru otomatis mendapat warna dan ikon.
- **Status** tidak hanya mengandalkan warna: hafal / belum hafal / salah selalu disertai ikon dan teks.
- **Kontras**: pasangan teks dan latar diaudit dengan skrip yang menghitung rasio WCAG dari token CSS yang sebenarnya (terang dan gelap). Semua pasangan teks lolos AA (≥ 4,5:1); isi bar dan ring diberi garis tepi pekat atau memakai warna "ink" agar tidak bergantung pada warna pastel, dan angkanya selalu ditulis.

### Responsif
Mobile-first dengan breakpoint Tailwind.

| Lebar | Navigasi | Konten |
| --- | --- | --- |
| < 768px | tab bar bawah (area sentuh ≥ 44px, aman untuk notch) | satu kolom, kosakata sebagai kartu |
| 768–1023px | tab bar bawah | kosakata sebagai tabel |
| ≥ 1024px | sidebar kiri (menu, bahasa, tema) | konten di tengah, lebar maksimum nyaman dibaca |
| ≥ 1280px | sidebar kiri | + panel filter di samping (di bawahnya filter muncul sebagai bottom sheet) |

Flashcard memakai ukuran fluid (`clamp`) sehingga hanzi proporsional di layar kecil maupun lebar, dan frasa panjang otomatis mengecil. Tata letak sudah diperiksa otomatis tanpa scroll horizontal pada 10 lebar layar (360–1440px) di semua halaman.

### Aksesibilitas
Fokus keyboard terlihat, semua kontrol punya nama aksesibel, ada tautan "Lewati ke konten", judul tab berubah per halaman dan fokus pindah ke konten saat berganti halaman, dialog menjebak fokus dan menutup dengan `Esc`, serta semua animasi menghormati `prefers-reduced-motion`.

## Tech stack

| Teknologi | Alasan |
| --- | --- |
| **Vite + React (JavaScript)** | Cepat, sederhana, hasil build statis yang mudah dipasang di Vercel atau GitHub Pages. JavaScript biasa agar fokus pada produk. |
| **Tailwind CSS** | Design token terpusat dan komponen yang konsisten tanpa menulis banyak CSS. |
| **lucide-react** | Ikon ringan dan seragam. |
| **localStorage** | Tanpa backend: progress, pengaturan, dan streak tersimpan di perangkat. Semua akses lewat satu modul (`lib/storage.js`) yang aman dari galat. |
| **Web Speech API** | Lafal tanpa layanan eksternal atau berkas audio. |
| **Noto Sans SC, Nunito** | Hanzi tampil konsisten di semua perangkat; Nunito memberi nuansa ramah dan membulat. |
| **Canvas & SVG buatan sendiri** | Konfeti, maskot, dan grafik tanpa library berat. |

## Menjalankan

Prasyarat: Node.js 18+.

```bash
npm install
npm run dev          # server pengembangan
npm run build        # membangun data lalu aplikasi ke folder dist/
npm run preview      # mencoba hasil build
npm run build:data   # hanya membangun ulang src/data/vocab.json
```

`src/data/vocab.json` dihasilkan dari `data-mentah/`. Jalankan `npm run build:data` setiap kali data mentah berubah (`npm run build` sudah melakukannya otomatis).

## Menambah bab baru

1. Buat `data-mentah/bab-7.json` (nomor bebas, urut dari nama berkas) dengan skema yang sama seperti bab lain (lihat di bawah).
2. Jalankan `npm run build:data`. Terminal menampilkan ringkasan jumlah kata dan daftar peringatan validasi.
3. Selesai. Daftar bab, filter, progress, kuis, serta warna dan ikon bab menyesuaikan otomatis. Tidak ada kode yang perlu diubah.

Berkas yang hilang, kosong, atau rusak tidak membuat build gagal; hanya dicatat sebagai peringatan.

## Struktur data

Satu berkas per bab di `data-mentah/bab-N.json`:

```jsonc
{
  "chapter": { "id": 1, "title_id": "Keluarga & Perkenalan Diri", "title_en": "Family & Self-Introduction" },
  "core_words":     [ { "hanzi", "pinyin", "pos_en", "pos_id", "english", "indonesian" } ],
  "extended_words": [ { "hanzi", "pinyin", "pos_en", "pos_id", "english", "indonesian" } ],
  "names":          [ { "hanzi", "pinyin", "english", "indonesian" } ],
  "extra_words":    [ { "hanzi", "pinyin", "english", "indonesian", "note" } ]
}
```

`scripts/build-vocab.js` menormalisasi semuanya menjadi array datar di `src/data/vocab.json`:

| Field | Keterangan |
| --- | --- |
| `id` | unik, mis. `b1-core-001` |
| `bab`, `babJudulId`, `babJudulEn` | nomor dan judul bab |
| `kategori` | `core` / `extended` / `extra` / `names` |
| `hanzi`, `pinyin`, `english`, `indonesian` | wajib terisi |
| `posId`, `posEn` | jenis kata (boleh `null`) |
| `note` | catatan (boleh `null`) |
| `altEnglish`, `altIndonesian` | terjemahan lain bila ada duplikat yang digabung |
| `posHint` | (opsional) petunjuk jenis kata untuk entri tanpa `posId`, hanya dipakai memilih pengecoh kuis; tidak tampil di UI |

Aturan penting:

- Entri dengan hanzi dan pinyin yang sama dalam satu bab dianggap duplikat dan digabung, dengan prioritas kategori `core > extended > extra > names`. Terjemahan lain disimpan di `altEnglish` / `altIndonesian`.
- Validasi mencetak peringatan (bukan galat) untuk field wajib kosong, hanzi tanpa karakter Han, atau pinyin berisi karakter tidak valid / tanpa tanda nada.
- Koreksi data tanpa menyentuh data mentah dilakukan lewat `HANZI_OVERRIDES` di `scripts/build-vocab.js` (contoh: nomor kamar `103` dibaca sebagai `幺零三`).
- `POS_HINTS` di `scripts/build-vocab.js` memberi petunjuk jenis kata bagi entri `extra_words` yang tak punya `pos_id` (mis. 因为 = kata hubung) supaya pengecoh kuisnya sejenis. Entri tanpa petunjuk tetap berfungsi.
- Jenis kata gabungan (mis. `kata benda, kata kerja`) dipecah di sisi aplikasi (`splitPos` di `lib/vocab.js`), jadi filter hanya berisi jenis kata tunggal.

## Algoritma Leitner

Kata dikelompokkan dalam **3 kotak** (tampil sebagai keranjang bambu). Kata yang belum pernah dikuis dianggap berada di kotak 1.

1. **Menjawab benar** → kata naik satu kotak (maksimal kotak 3).
2. **Menjawab salah** → kata kembali ke kotak 1 **dan** status hafalnya turun menjadi "belum hafal".
3. **Memilih soal**: kata di kotak rendah muncul lebih sering. Setiap kotak punya bobot (kotak 1 = 4, kotak 2 = 2, kotak 3 = 1), lalu soal diambil secara acak berbobot tanpa pengembalian dengan metode Efraimidis–Spirakis: tiap kata diberi kunci `u^(1/bobot)` dengan `u` acak di (0, 1), diurutkan menurun, dan N teratas dipilih.

Pada pengujian 2.000 undian dengan jumlah kata yang sama di tiap kotak, kata kotak 1/2/3 terpilih sekitar 56% / 29% / 15%, sesuai rasio bobot 4:2:1. Implementasinya ada di `src/lib/leitner.js`; pembuatan soal dan pemilihan pengecoh di `src/lib/quiz.js`.

**Pengecoh** dipilih dari kata dengan jenis kata yang sama (atau kategori yang sama untuk nama dan frasa tanpa jenis kata) agar tidak terlalu mudah ditebak, lalu dilengkapi dari kata lain bila kurang. Di dalam tiap kelompok, kata yang paling mirip (kategori sama, panjang hanzi mirip, bab sama, plus sedikit acak) didahulukan. Pilihan bertekstur sama dan kata yang sebenarnya juga benar (mis. hanzi sama di bab berbeda) dibuang.

## Struktur proyek

```
data-mentah/          data sumber per bab (bab-N.json)
scripts/build-vocab.js  normalisasi + validasi -> src/data/vocab.json
src/
  components/         PandaMascot, Flashcard, QuizQuestion, ChapterCard, FilterPanel, ...
  hooks/              useProgress, useSettings, useSpeech, useFilters, useHashRoute
  lib/                vocab, quiz, leitner, chapterColors, storage, constants
  pages/              Home, Study (flashcard), Quiz, Vocab, Progress
  index.css           design token (CSS variables) + animasi
tailwind.config.js    token yang dipasang ke Tailwind
```

## Rencana pengembangan

- Riwayat belajar harian (grafik 7 / 30 hari) dan pengingat belajar.
- Mode kuis mengetik pinyin dan kuis mendengarkan (audio ke hanzi).
- Interval Leitner berbasis tanggal (kata muncul kembali setelah jeda tertentu), bukan hanya bobot acak.
- Ekspor / impor progress dan sinkronisasi antar perangkat.
- Kotak ketiga otomatis menandai kata sebagai hafal (opsional).
- Dukungan HSK level dan pengelompokan topik di luar bab buku.
- PWA agar bisa dipakai tanpa internet.

## Deploy

_(Panduan deploy ke Vercel / GitHub Pages akan ditambahkan di tahap berikutnya.)_
