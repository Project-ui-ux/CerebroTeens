/**
 * GOOGLE APPS SCRIPT CODE UNTUK PENELITIAN SERIOUS GAME: STROKE PADA REMAJA
 * 
 * CARA MEMASANG:
 * 1. Buka Google Spreadsheet baru (misal: "Database Edukasi Stroke Remaja").
 * 2. Buat 2 sheet (tab di bawah):
 *    - Tab 1 namakan: "Users"
 *      Header (Baris 1): [Timestamp, Nama, Usia, Jenis_Kelamin, Sekolah, ID_Peserta]
 *    - Tab 2 namakan: "Scores"
 *      Header (Baris 1): [Timestamp, ID_Peserta, Nama, Game, Level, Skor, Waktu_Detik, Benar, Total_Soal, Status]
 * 3. Di Google Spreadsheet, klik menu: Ekstensi -> Apps Script.
 * 4. Hapus isi Code.gs dan ganti/paste dengan seluruh kode ini.
 * 5. Klik Simpan (ikon disket).
 * 6. Klik "Deploy" (Terapkan) -> "Deployment Baru" (New Deployment).
 * 7. Pilih tipe: "Web App" (Aplikasi Web).
 * 8. Konfigurasi:
 *    - Deskripsi: API Serious Game Stroke
 *    - Execute as (Jalankan sebagai): Me (email akun Anda)
 *    - Who has access (Siapa yang memiliki akses): Anyone (Siapa saja)
 * 9. Klik "Deploy", beri izin otorisasi Google jika diminta.
 * 10. Salin "Web App URL" (akhiran /exec) dan masukkan ke file game (app.js atau config di website).
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var rawData = e.postData ? e.postData.contents : "";
    var data = {};
    if (rawData) {
      data = JSON.parse(rawData);
    } else if (e.parameter) {
      data = e.parameter;
    }

    var action = data.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. REGISTRASI / LOGIN USER
    if (action === "login" || action === "register") {
      var userSheet = ss.getSheetByName("Users");
      if (!userSheet) {
        userSheet = ss.insertSheet("Users");
        userSheet.appendRow(["Timestamp", "Nama", "Usia", "Jenis_Kelamin", "Sekolah", "ID_Peserta"]);
      }

      var id = data.id || ("STROKE-" + new Date().getTime().toString().slice(-6));
      var timestamp = new Date();
      var nama = data.nama || "Anonim";
      var usia = data.usia || "";
      var jenisKelamin = data.jenisKelamin || "";
      var sekolah = data.sekolah || "";

      // Cek apakah ID sudah ada
      var existingData = userSheet.getDataRange().getValues();
      var foundRow = -1;
      for (var i = 1; i < existingData.length; i++) {
        if (existingData[i][5] == id || (existingData[i][1] == nama && existingData[i][4] == sekolah)) {
          foundRow = i + 1;
          id = existingData[i][5];
          break;
        }
      }

      if (foundRow === -1) {
        userSheet.appendRow([timestamp, nama, usia, jenisKelamin, sekolah, id]);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: action,
        message: "Data partisipan tersimpan",
        user: { id: id, nama: nama, usia: usia, jenisKelamin: jenisKelamin, sekolah: sekolah }
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. SIMPAN PROGRESS & NILAI LEVEL GAME
    if (action === "saveScore") {
      var scoreSheet = ss.getSheetByName("Scores");
      if (!scoreSheet) {
        scoreSheet = ss.insertSheet("Scores");
        scoreSheet.appendRow(["Timestamp", "ID_Peserta", "Nama", "Game", "Level", "Skor", "Waktu_Detik", "Benar", "Total_Soal", "Status"]);
      }

      var timestamp = new Date();
      var id = data.id || "-";
      var nama = data.nama || "Anonim";
      var game = data.game || ""; // "TTS" atau "CARI_KATA"
      var level = data.level || 1;
      var skor = data.skor || 0;
      var waktu = data.waktu || 0;
      var benar = data.benar || 0;
      var total = data.total || 0;
      var status = data.status || "Completed";

      scoreSheet.appendRow([timestamp, id, nama, game, level, skor, waktu, benar, total, status]);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Nilai berhasil disimpan ke spreadsheet"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Action tidak dikenal: " + action
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var action = e.parameter.action;

    // Ambil rekap leaderboard / data jika dibutuhkan
    if (action === "leaderboard") {
      var scoreSheet = ss.getSheetByName("Scores");
      if (!scoreSheet) {
        return ContentService.createTextOutput(JSON.stringify({ status: "success", data: [] })).setMimeType(ContentService.MimeType.JSON);
      }
      var rows = scoreSheet.getDataRange().getValues();
      var headers = rows[0];
      var result = [];
      for (var i = 1; i < rows.length; i++) {
        var rowObj = {};
        for (var j = 0; j < headers.length; j++) {
          rowObj[headers[j]] = rows[i][j];
        }
        result.push(rowObj);
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        data: result
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "API Serious Game Stroke Remaja Aktif"
    })).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
