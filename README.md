# 📋 Sistem Absensi Pengajar Berbasis RFID & IoT

Website monitoring dan sistem pencatatan kehadiran pengajar (guru/dosen) secara *real-time* menggunakan kartu **RFID (ESP32)**, **Google Sheets API (Apps Script)**, dan **Dashboard Web (React + TypeScript + Vite)** yang di-deploy di **Vercel**.

---

## ✨ Fitur Utama
- **Absensi Kartu RFID Real-Time:** Pembacaan UID kartu identitas pengajar menggunakan modul RFID RC522 dan ESP32.
- **Deteksi Otomatis Masuk, Terlambat, & Pulang:** Menentukan status kehadiran secara otomatis berdasarkan batas jam masuk yang dapat diatur oleh admin serta membedakan tap pertama (Masuk/Terlambat) dan tap kedua (Pulang).
- **Indikator LCD I2C & Buzzer:** Layar LCD 16x2 menampilkan jam digital NTP saat *standby* serta nama pengajar dan status absensi saat kartu ditempelkan, lengkap dengan pola bunyi buzzer yang berbeda.
- **Tombol Mode Registrasi Kartu:** Mendaftarkan kartu RFID pengajar baru langsung dari perangkat ESP32 ke sheet `Master_Pengajar`.
- **Panel Admin Spreadsheet & Dashboard Web:** Pengelola dapat mengubah batas jam masuk dan melengkapi nama pengajar langsung dari Sidebar Google Sheets, sementara status kehadiran tampil langsung di website Vercel.

---

## 🔌 Wiring Hardware (ESP32)

| Komponen | Pin Modul | Pin ESP32 |
| :--- | :--- | :--- |
| **RFID RC522** | SDA (SS) | `GPIO 5` |
| | SCK | `GPIO 18` |
| | MOSI | `GPIO 23` |
| | MISO | `GPIO 19` |
| | RST | `GPIO 4` |
| | 3.3V / GND | `3V3` / `GND` |
| **LCD I2C 16x2** | SDA / SCL | `GPIO 21` / `GPIO 22` |
| | VCC / GND | `VIN (5V)` / `GND` |
| **Buzzer Aktif** | Positif (+) / Negatif (-) | `GPIO 15` / `GND` |
| **Push Button Mode** | Kaki 1 / Kaki 2 | `GPIO 14` / `GND` |

---

## 🚀 Konfigurasi Deployment Vercel
1. Pastikan variabel lingkungan **`VITE_APPS_SCRIPT_URL`** sudah ditambahkan di menu **Settings > Environment Variables** pada proyek Vercel dengan nilai URL Web App (`/exec`) dari Google Apps Script.
2. Setiap perubahan pada branch `main` di GitHub akan otomatis ter-deploy ke Vercel.
