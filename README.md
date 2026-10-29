# Panda Belajar Mandarin

Aplikasi web untuk belajar kosakata bahasa Mandarin lewat flashcard, kuis pilihan ganda, dan sistem pengulangan Leitner. Tampilannya bertema panda, bahasa antarmukanya Indonesia, dan seluruh progress disimpan di browser tanpa backend.

## Latar belakang

Aplikasi ini saya buat untuk menutup kekurangan atau kesusahan belajar. Kosakata dikelompokkan per bab tema, lalu bisa dipelajari dengan flashcard, diuji dengan kuis, dan dipantau lewat halaman progress.

## Fitur

- Flashcard dengan animasi balik 3D. Arahnya bisa Hanzi ke Arti atau Arti ke Hanzi. Kartu ditandai Hafal atau Belum hafal, dan urutannya bisa diacak. Di keyboard: `Spasi` membalik kartu, `←` `→` berpindah kartu, `H` hafal, `B` belum hafal. Di layar sentuh, geser ke kanan berarti hafal dan ke kiri berarti belum hafal.
- Kuis pilihan ganda dengan tiga mode (Hanzi ke Arti, Arti ke Hanzi, Hanzi ke Pinyin), 10, 20, atau semua soal, dan empat pilihan jawaban. Di akhir kuis ada skor dan daftar jawaban yang salah. Kata yang dijawab salah otomatis kembali berstatus belum hafal.
- Leitner 3 kotak yang ditampilkan sebagai keranjang bambu. Kata yang sering salah lebih sering muncul sebagai soal.
- Tombol suara memakai Web Speech API dengan bahasa `zh-CN`. Jika browser tidak mendukung atau tidak punya suara Mandarin, tombol disembunyikan dan muncul pesan singkat.
- Bahasa terjemahan bisa dipilih: Indonesia, English, atau keduanya.
- Filter dan pencarian berdasarkan bab, kategori, jenis kata, dan status hafal. Pencarian mencakup hanzi, pinyin, dan arti, dan tidak membedakan tanda nada (`ni hao` menemukan `nǐ hǎo`).
- Daftar kosakata berbentuk tabel di layar lebar dan daftar kartu di ponsel.
- Beranda berisi sapaan panda, target harian 10 kata berbeda, streak hari belajar, dan kartu tiap bab dengan progress ring.
- Halaman progress menampilkan persentase hafal per bab dan per kategori, isi keranjang Leitner, serta panda yang makan bambu. Makin banyak kata yang hafal, makin banyak batang bambu yang habis.
- Konfeti muncul saat skor kuis minimal 80% dan saat target harian tercapai.
- Mode terang, gelap, atau ikut sistem, dan tombol reset progress dengan dialog konfirmasi.

## Keputusan desain

### Maskot

Panda adalah komponen SVG inline (`PandaMascot.jsx`), tidak memakai gambar atau karakter pihak lain. Ada enam ekspresi lewat prop `mood`: `happy`, `sad`, `thinking`, `sleeping`, `eating`, dan `cheer`. Panda muncul sebagai logo, sapaan di beranda, reaksi saat belajar dan kuis, serta ilustrasi di tampilan kosong, memuat, dan galat. Animasinya (berkedip, mengangguk, bergoyang) mati otomatis bagi pengguna yang mengaktifkan `prefers-reduced-motion`.

### Warna

Nuansanya hangat seperti taman bambu: latar krem `#FFFBF2`, hijau bambu `#4CAF7A`, dan hijau daun `#2E7D5B`, ditambah sakura, madu, biru langit, persik, dan lavender. Mode gelap memakai biru-hijau tua `#16211D`.

- Semua warna didefinisikan sebagai CSS variables di `src/index.css` dan dipasang ke Tailwind lewat `tailwind.config.js`, jadi tema bisa diubah dari satu tempat.
- Setiap bab punya warna sendiri yang dihitung dari nomor bab (`lib/chapterColors.js`) dan berputar melalui enam warna aksen. Bab baru langsung mendapat warna dan ikon tanpa konfigurasi.
- Status hafal, belum hafal, dan salah selalu disertai ikon dan teks, bukan warna saja.
- Kontras teks terhadap latar memenuhi WCAG AA di mode terang dan gelap.

### Tampilan responsif

Tampilan dirancang dari ukuran ponsel lebih dulu.

| Lebar layar | Navigasi | Konten |
| --- | --- | --- |
| di bawah 768px | tab bar bawah | satu kolom, kosakata berbentuk kartu |
| 768 sampai 1023px | tab bar bawah | kosakata berbentuk tabel |
| 1024px ke atas | sidebar kiri | konten di tengah dengan lebar maksimum |
| 1280px ke atas | sidebar kiri | ditambah panel filter di samping |

Di layar yang lebih sempit dari 1280px, filter muncul sebagai bottom sheet. Hanzi di flashcard memakai ukuran fluid (`clamp`) dan mengecil otomatis untuk frasa yang panjang. Tidak ada scroll horizontal pada lebar 360 sampai 1440px.

### Aksesibilitas

Fokus keyboard selalu terlihat dan semua tombol punya nama untuk pembaca layar. Ada tautan "Lewati ke konten", judul tab berubah mengikuti halaman, dan fokus berpindah ke konten saat berganti halaman. Dialog mengunci fokus di dalamnya dan bisa ditutup dengan `Esc`. Area sentuh di ponsel minimal 44px.

## Tech stack

| Teknologi | Alasan |
| --- | --- |
| Vite + React (JavaScript) | Pengembangan cepat dan hasil build berupa situs statis. |
| Tailwind CSS | Warna, radius, dan bayangan terpusat sebagai token, sehingga tampilan konsisten. |
| lucide-react | Ikon yang ringan dan seragam. |
| localStorage | Progress, pengaturan, dan streak tersimpan di perangkat tanpa backend. Semua aksesnya lewat satu modul, `lib/storage.js`, yang menangani galat. |
| Web Speech API | Pelafalan tanpa layanan luar atau berkas audio. |
| Noto Sans SC dan Nunito | Noto Sans SC untuk hanzi, Nunito untuk teks antarmuka. Keduanya dimuat dari Google Fonts. |
| Hash route (`#/kuis`) | Navigasi sederhana tanpa library router dan tanpa pengaturan server. |
| Canvas dan SVG | Konfeti, maskot, keranjang, dan grafik dibuat sendiri tanpa library tambahan. |

## Menjalankan

Butuh Node.js versi 18 atau lebih baru.

```bash
npm install
npm run dev          # server pengembangan
npm run build        # membangun data kosakata lalu aplikasi ke folder dist/
npm run preview      # mencoba hasil build
npm run build:data   # hanya membangun ulang src/data/vocab.json
```

`src/data/vocab.json` dihasilkan dari folder `data-mentah/`. Setiap kali data mentah diubah, jalankan `npm run build:data`. Perintah `npm run build` sudah menjalankannya lebih dulu.

## Kosakata

Isinya 286 kata di 6 bab, masing-masing 46 sampai 50 entri:

| Bab | Tema |
| --- | --- |
| 1 | Keluarga dan perkenalan diri |
| 2 | Belanja dan alat tulis |
| 3 | Hotel dan pemesanan kamar |
| 4 | Bahasa dan les/bimbel |
| 5 | Pekerjaan dan alasan belajar |
| 6 | Ulang tahun dan shio |

Tiap bab dibagi menjadi empat kategori: kata inti (`core`), kata lanjutan (`extended`), ungkapan atau kalimat berguna (`extra`), dan nama (`names`). Kosakata ini disusun khusus untuk proyek ini dengan tingkat pemula sebagai sasaran. Pinyin dan terjemahan belum diperiksa oleh penutur asli.

## Menambah bab baru

1. Buat berkas `data-mentah/bab-7.json` dengan skema yang sama seperti bab lain (lihat bagian berikutnya).
2. Jalankan `npm run build:data`. Terminal menampilkan jumlah kata per bab dan kategori, serta peringatan untuk entri yang bermasalah.
3. Selesai. Daftar bab, filter, progress, kuis, serta warna dan ikon bab menyesuaikan sendiri. Tidak ada kode yang perlu diubah.

Berkas bab yang kosong atau rusak hanya menghasilkan peringatan dan tidak menghentikan build. Jika tidak ada satu pun bab yang terbaca, skrip berhenti dengan pesan galat dan tidak menimpa `vocab.json`.

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

Skrip `scripts/build-vocab.js` mengubahnya menjadi satu array datar di `src/data/vocab.json`. Tiap entri punya field berikut:

| Field | Keterangan |
| --- | --- |
| `id` | unik, contoh `b1-core-001` |
| `bab`, `babJudulId`, `babJudulEn` | nomor dan judul bab |
| `kategori` | `core`, `extended`, `extra`, atau `names` |
| `hanzi`, `pinyin`, `english`, `indonesian` | wajib terisi |
| `posId`, `posEn` | jenis kata, boleh `null` |
| `note` | catatan penggunaan, boleh `null` |
| `altEnglish`, `altIndonesian` | terjemahan lain jika ada entri duplikat yang digabung |
| `posHint` | opsional, petunjuk jenis kata untuk entri yang tidak punya `posId`; hanya dipakai saat memilih pengecoh kuis |

Aturan yang dijalankan skrip:

- Entri dengan hanzi dan pinyin yang sama di satu bab dianggap duplikat dan digabung. Kategori yang dipakai mengikuti urutan `core`, `extended`, `extra`, `names`, dan terjemahan yang berbeda disimpan di `altEnglish` dan `altIndonesian`.
- Validasi mencetak peringatan, bukan galat, untuk field wajib yang kosong, hanzi tanpa karakter Han, serta pinyin yang memuat karakter tidak valid atau tanpa tanda nada. Nada netral seperti `de` juga muncul sebagai peringatan dan itu wajar.
- `HANZI_OVERRIDES` dan `POS_HINTS` di dalam skrip dipakai untuk mengoreksi hanzi dan memberi petunjuk jenis kata tanpa mengubah data mentah. Keduanya saat ini kosong.
- Jenis kata gabungan seperti `kata benda, kata kerja` dipecah di aplikasi (`splitPos` di `lib/vocab.js`), jadi filter hanya berisi jenis kata tunggal.
- Setiap build, skrip menghitung versi dataset dari id, hanzi, dan pinyin, lalu menyimpannya di `src/data/vocab-version.json`. Jika daftar kata berubah, progress hafalan lama di browser dihapus dan pengguna diberi tahu, karena id lama bisa menunjuk ke kata yang berbeda. Streak tetap disimpan. Memperbaiki terjemahan tidak mengubah versi.

## Algoritma Leitner

Kata dibagi ke dalam tiga kotak. Kata yang belum pernah muncul di kuis dianggap berada di kotak 1.

1. Jawaban benar menaikkan kata satu kotak, maksimal sampai kotak 3.
2. Jawaban salah mengembalikan kata ke kotak 1 dan mengubah statusnya menjadi belum hafal.
3. Kata di kotak rendah lebih sering menjadi soal. Bobotnya 4 untuk kotak 1, 2 untuk kotak 2, dan 1 untuk kotak 3.

Soal dipilih dengan pengambilan acak berbobot tanpa pengembalian (metode Efraimidis-Spirakis). Setiap kata diberi kunci `u^(1/bobot)`, dengan `u` bilangan acak antara 0 dan 1. Kata diurutkan dari kunci terbesar dan sejumlah soal teratas diambil. Kata berbobot besar cenderung mendapat kunci mendekati 1, sehingga lebih sering terpilih. Kodenya ada di `src/lib/leitner.js`.

### Pilihan jawaban kuis

Pembuatan soal ada di `src/lib/quiz.js`. Tiga pengecoh dipilih bertingkat supaya tidak terlalu mudah ditebak:

1. kata dengan jenis kata yang sama (untuk nama dan ungkapan yang tidak punya jenis kata, dipakai kategori yang sama),
2. kata dalam kelompok peran tata bahasa yang sama, misalnya kata hubung dengan kata depan, partikel, atau kata kerja bantu,
3. kata lain bila dua tingkat di atas belum cukup.

Di dalam tiap tingkat, kata yang paling mirip didahulukan, dengan penilaian dari kategori yang sama, panjang hanzi yang mirip, dan bab yang sama, ditambah sedikit unsur acak. Pilihan dengan teks yang sama dibuang, begitu juga kata lain yang sebenarnya merupakan jawaban benar, misalnya dua entri dengan arti yang sama.

## Struktur proyek

```
data-mentah/             data sumber per bab (bab-N.json)
scripts/build-vocab.js   normalisasi dan validasi data, menghasilkan src/data/vocab.json
src/
  components/            PandaMascot, Flashcard, QuizQuestion, ChapterCard, FilterPanel, dan lainnya
  hooks/                 useProgress, useSettings, useSpeech, useFilters, useHashRoute
  lib/                   vocab, quiz, leitner, chapterColors, storage, constants
  pages/                 Home, Study, Quiz, Vocab, Progress
  index.css              token warna (CSS variables) dan animasi
tailwind.config.js       token yang dipasang ke Tailwind
```

## Rencana pengembangan

- Riwayat belajar harian dengan grafik 7 dan 30 hari.
- Kuis mengetik pinyin dan kuis mendengarkan.
- Interval Leitner berbasis tanggal, jadi kata muncul lagi setelah jeda tertentu dan tidak hanya lewat bobot acak.
- Ekspor dan impor progress untuk berpindah perangkat.
- Opsi menandai kata sebagai hafal otomatis saat mencapai kotak 3.
- Pengelompokan kata berdasarkan level HSK.
- Versi PWA agar bisa dipakai tanpa internet, dengan font yang disimpan lokal.
