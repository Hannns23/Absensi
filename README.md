# ♻️ TAP-KARTU-BANK-SAMPAJ-RFID

**Website monitoring untuk melihat kelas mana saja yang sudah buang sampah kelasnya ke bank sampah** menggunakan integrasi kartu **RFID (ESP32)**, **Google Sheets API (Apps Script)**, dan **Web Dashboard**.

🔗 **Live Demo:** [tap-kartu-bank-sampaj-rfid.vercel.app](https://tap-kartu-bank-sampaj-rfid.vercel.app)[cite: 1]

---

## 📌 Latar Belakang & Tujuan
Sistem ini dirancang untuk mendigitalisasi pencatatan setor sampah tiap kelas di lingkungan sekolah/kampus. Setiap pengurus kelas dibekali **Kartu RFID khusus kelas**. Saat menyetorkan sampah ke Bank Sampah, petugas/pengurus kelas cukup menempelkan (*tap*) kartu ke perangkat pembaca RFID berbasis ESP32, dan status kelas tersebut akan langsung tercatat secara *real-time* di Google Spreadsheet maupun halaman website monitoring ini[cite: 1].

---

## ✨ Fitur Utama
- **Tap Kartu RFID Real-Time:** Pembacaan UID kartu kelas menggunakan modul RFID RC522 dan mikrokontroler ESP32.
- **Indikator Audio & Visual:** Layar LCD I2C 16x2 menampilkan nama kelas & status setoran disertai bunyi Buzzer berbeda (Berhasil Setor, Sudah Setor Hari Ini, atau Kartu Belum Terdaftar).
- **Mode Registrasi Kartu Langsung:** Tombol mode pada perangkat untuk mendaftarkan kartu kelas baru langsung ke database tanpa mengubah kode program.
- **Database Google Sheets & Panel Admin UI:** Penyimpanan otomatis ke Google Spreadsheet lengkap dengan *Sidebar Admin* untuk mengubah nama kartu kelas dan memantau rekap harian.
- **Website Monitoring Kelas:** Dashboard berbasis web (React + TypeScript + Vite) untuk memantau daftar kelas yang **Sudah Buang Sampah** dan **Belum Buang Sampah** pada hari berjalan[cite: 1].

---

## 🛠️ Arsitektur Sistem
```text
[Kartu RFID Kelas] 
       │ (Tap Kartu)
       ▼
[ESP32 + RC522 + LCD I2C + Buzzer] 
       │ (HTTP GET Request via WiFi)
       ▼
[Google Apps Script (Web App API)] ◄──► [Google Spreadsheet (Database & Admin UI)]
       │ (JSON / CSV Data Feed)
       ▼
[Website Monitoring (Vercel - React/Vite)]
