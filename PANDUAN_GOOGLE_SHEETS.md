# PANDUAN PENGGUNAAN & INTEGRASI DATABASE GOOGLE SHEETS
## Serious Game Edukasi Stroke pada Remaja (CerebroTeens)

Aplikasi game ini dirancang khusus untuk keperluan **penelitian intervensi kesehatan / media edukasi serious game** dengan tema **Pencegahan dan Pengenalan Stroke pada Remaja**.

---

### 📂 Struktur File Proyek:
1. [index.html](file:///c:/Users/BlizzX/Downloads/TTS%20&%20Find%20word/index.html) : Antarmuka utama aplikasi (Halaman Login Peserta, Menu Game, TTS Board, Cari Kata Board).
2. [style.css](file:///c:/Users/BlizzX/Downloads/TTS%20&%20Find%20word/style.css) : Gaya visual modern dengan tema estetika *glassmorphic-medical*, responsif untuk desktop, tablet, maupun smartphone.
3. [data-stroke.js](file:///c:/Users/BlizzX/Downloads/TTS%20&%20Find%20word/data-stroke.js) : Materi edukasi terstruktur dalam 4 level progresif:
   - **Level 1**: Mengenal Otak, Sirkulasi, dan Pengertian Dasar Stroke.
   - **Level 2**: Faktor Risiko Gaya Hidup Remaja (Begadang, Vaping, Garam/Fast Food, Obesitas, Stres).
   - **Level 3**: Sinyal Bahaya Klinis & Metode Deteksi Dini FAST (*Face, Arms, Speech, Time* / Kebas / Pelo).
   - **Level 4**: Penanganan Darurat Emas (*Golden Period* 3-4,5 jam, Ambulans 112) dan Pencegahan CERDIK.
4. [app.js](file:///c:/Users/BlizzX/Downloads/TTS%20&%20Find%20word/app.js) : Mesin logika interaktif: generator TTS, validasi kata, pencarian kata otomatis, penghitung skor, waktu, dan pengirim data ke Google Sheets.
5. [google-apps-script.js](file:///c:/Users/BlizzX/Downloads/TTS%20&%20Find%20word/google-apps-script.js) : Skrip backend Google Apps Script untuk menerima data partisipan & skor secara otomatis.

---

### 🚀 Cara Menghubungkan ke Google Spreadsheet:

1. **Buat Google Spreadsheet Baru**:
   - Buka [Google Sheets](https://sheets.new) di browser Anda.
   - Beri nama spreadsheet, misalnya: `Database Penelitian Stroke Remaja`.

2. **Buat 2 Tab / Sheet di Spreadsheet tersebut**:
   - Tab 1: Beri nama **`Users`**
     - Isi Baris 1 (Header): `Timestamp`, `Nama`, `Usia`, `Jenis_Kelamin`, `Sekolah`, `ID_Peserta`
   - Tab 2: Beri nama **`Scores`**
     - Isi Baris 1 (Header): `Timestamp`, `ID_Peserta`, `Nama`, `Game`, `Level`, `Skor`, `Waktu_Detik`, `Benar`, `Total_Soal`, `Status`

3. **Buka Google Apps Script**:
   - Di Google Spreadsheet Anda, klik menu **Ekstensi** -> **Apps Script**.
   - Hapus semua tulisan di editor `Code.gs`.
   - Buka file [google-apps-script.js](file:///c:/Users/BlizzX/Downloads/TTS%20&%20Find%20word/google-apps-script.js) di folder ini, salin seluruh kodenya, lalu tempel (paste) ke editor Apps Script.
   - Klik tombol **Simpan** (ikon disket) atau `Ctrl + S`.

4. **Terapkan (Deploy) Sebagai Web App**:
   - Klik tombol biru **Deploy** (Terapkan) di kanan atas -> Pilih **Deployment Baru** (New Deployment).
   - Klik ikon gerigi di samping *Select type* -> pilih **Web app** (Aplikasi Web).
   - Isi konfigurasi berikut:
     - **Description**: `API Serious Game Stroke`
     - **Execute as** (Jalankan sebagai): `Me` (Akun Google Anda)
     - **Who has access** (Siapa yang memiliki akses): **`Anyone`** *(PENTING: Pilih Siapa Saja agar aplikasi game bisa mengirim data tanpa login akun Google)*.
   - Klik **Deploy**. Jika diminta izin (*Authorization*), klik *Review permissions*, pilih akun Google Anda, klik *Advanced*, lalu klik *Go to (nama project)* dan pilih *Allow*.
   - Salin **URL Aplikasi Web** (URL yang berakhiran `/exec`).

5. **Hubungkan ke Aplikasi Game**:
   - Buka [index.html](file:///c:/Users/BlizzX/Downloads/TTS%20&%20Find%20word/index.html) di browser Anda.
   - Klik ikon gerigi **⚙️** di pojok kanan atas navbar.
   - Masukkan link Web App yang telah disalin.
   - Selesai! Indikator di samping nama pengguna akan menyala hijau dan setiap ada responden login atau menyelesaikan level, datanya langsung tercatat di Google Sheet Anda secara real-time.

---

### 📱 Cara Menjalankan Game:
- Cukup klik dua kali (double click) file [index.html](file:///c:/Users/BlizzX/Downloads/TTS%20&%20Find%20word/index.html) pada file explorer komputer Anda untuk membukanya di browser Chrome, Edge, atau Firefox.
- Tidak memerlukan instalasi server rumit. Game ini siap dipakai langsung untuk instrumen pengumpulan data penelitian di lapangan!
