import React, { useEffect, useState } from 'react';

interface DataPengajarHariIni {
  uid: string;
  nama: string;
  hadir: boolean;
  status: string;
  jamMasuk: string;
  jamPulang: string;
}

interface MasterPengajar {
  row: number;
  uid: string;
  nama: string;
}

interface LogAbsensi {
  row: number;
  tanggal: string;
  waktu: string;
  uid: string;
  nama: string;
  status: string;
}

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || "";
const ADMIN_PIN = "1234"; // Ubah PIN login admin sesuai keinginan

export default function App() {
  // Navigasi Halaman: 'publik' atau 'admin'
  const [halaman, setHalaman] = useState<'publik' | 'admin'>('publik');
  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");

  // State Halaman Publik
  const [daftarHariIni, setDaftarHariIni] = useState<DataPengajarHariIni[]>([]);
  const [tanggal, setTanggal] = useState<string>("-");
  const [loading, setLoading] = useState<boolean>(true);
  const [filterPublik, setFilterPublik] = useState<'semua' | 'hadir' | 'belum'>('semua');

  // State Halaman Admin (Seluruh Data Spreadsheet)
  const [subTabAdmin, setSubTabAdmin] = useState<'log' | 'master'>('log');
  const [masterPengajar, setMasterPengajar] = useState<MasterPengajar[]>([]);
  const [riwayatAbsensi, setRiwayatAbsensi] = useState<LogAbsensi[]>([]);
  const [batasJamMasuk, setBatasJamMasuk] = useState<string>("07:30:00");
  const [cariTeks, setCariTeks] = useState<string>("");
  const [editRow, setEditRow] = useState<number | null>(null);
  const [editNamaVal, setEditNamaVal] = useState<string>("");
  const [pesanAdmin, setPesanAdmin] = useState<string>("");

  // Ambil Data Halaman Publik
  const ambilDataPublik = async () => {
    if (!APPS_SCRIPT_URL) return setLoading(false);
    setLoading(true);
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=getStatusPengajar`);
      const json = await res.json();
      setTanggal(json.tanggal);
      setDaftarHariIni(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Ambil Seluruh Data Spreadsheet untuk Admin
  const ambilSemuaDataAdmin = async () => {
    if (!APPS_SCRIPT_URL) return;
    setLoading(true);
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=getAllAdminData`);
      const json = await res.json();
      setBatasJamMasuk(json.batasJamMasuk || "07:30:00");
      setMasterPengajar(json.masterPengajar || []);
      setRiwayatAbsensi(json.riwayatAbsensi || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (halaman === 'publik') {
      ambilDataPublik();
    } else if (halaman === 'admin' && isAdminAuth) {
      ambilSemuaDataAdmin();
    }
  }, [halaman, isAdminAuth]);

  const handleLoginAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setIsAdminAuth(true);
      setPinInput("");
    } else {
      alert("PIN Admin salah!");
    }
  };

  const simpanNamaBaru = async (row: number) => {
    if (!editNamaVal.trim()) return;
    setPesanAdmin("Menyimpan nama...");
    await fetch(`${APPS_SCRIPT_URL}?action=updatePengajar&row=${row}&nama=${encodeURIComponent(editNamaVal)}`);
    setEditRow(null);
    setPesanAdmin("Nama pengajar berhasil diperbarui!");
    ambilSemuaDataAdmin();
    setTimeout(() => setPesanAdmin(""), 3000);
  };

  const simpanJamBaru = async () => {
    const formatJam = batasJamMasuk.length === 5 ? `${batasJamMasuk}:00` : batasJamMasuk;
    setPesanAdmin("Menyimpan batas jam masuk...");
    await fetch(`${APPS_SCRIPT_URL}?action=setBatasJam&jam=${encodeURIComponent(formatJam)}`);
    setPesanAdmin(`Batas jam masuk diubah ke ${formatJam}`);
    setTimeout(() => setPesanAdmin(""), 3000);
  };

  // Filter data pencarian untuk Admin
  const filterLogAbsensi = riwayatAbsensi.filter(
    (item) =>
      item.nama.toLowerCase().includes(cariTeks.toLowerCase()) ||
      item.tanggal.includes(cariTeks) ||
      item.status.toLowerCase().includes(cariTeks.toLowerCase()) ||
      item.uid.toLowerCase().includes(cariTeks.toLowerCase())
  );

  const filterMasterPengajar = masterPengajar.filter(
    (item) =>
      item.nama.toLowerCase().includes(cariTeks.toLowerCase()) ||
      item.uid.toLowerCase().includes(cariTeks.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 20, fontFamily: 'sans-serif', color: '#1f2937' }}>
      {/* NAVBAR PEMISAH HALAMAN PUBLIK & ADMIN */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', color: '#fff', padding: '12px 18px', borderRadius: 10, marginBottom: 20 }}>
        <div style={{ fontWeight: 'bold', fontSize: 16 }}>🎓 Sistem Absensi Pengajar</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setHalaman('publik')}
            style={{
              padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600,
              background: halaman === 'publik' ? '#3b82f6' : '#334155', color: '#fff'
            }}
          >
            📋 Monitoring Publik
          </button>
          <button
            onClick={() => setHalaman('admin')}
            style={{
              padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600,
              background: halaman === 'admin' ? '#10b981' : '#334155', color: '#fff'
            }}
          >
            🔐 Panel Admin
          </button>
        </div>
      </nav>

      {/* ================================================================= */}
      {/* BAGIAN 1: HALAMAN MONITORING PUBLIK (HARI INI)                    */}
      {/* ================================================================= */}
      {halaman === 'publik' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 20 }}>Kehadiran Pengajar Hari Ini ({tanggal})</h2>
            <button onClick={ambilDataPublik} style={btnSecondary}>🔄 Refresh</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            <div style={cardStat('#f3f4f6', '#111827')}>
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>{daftarHariIni.length}</div>
              <div style={{ fontSize: 12 }}>Total Pengajar</div>
            </div>
            <div style={cardStat('#dcfce7', '#166534')}>
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>{daftarHariIni.filter(p => p.hadir).length}</div>
              <div style={{ fontSize: 12 }}>Sudah Absen</div>
            </div>
            <div style={cardStat('#fee2e2', '#991b1b')}>
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>{daftarHariIni.filter(p => !p.hadir).length}</div>
              <div style={{ fontSize: 12 }}>Belum Absen</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            <button onClick={() => setFilterPublik('semua')} style={btnFilter(filterPublik === 'semua')}>Semua</button>
            <button onClick={() => setFilterPublik('hadir')} style={btnFilter(filterPublik === 'hadir')}>Sudah Hadir</button>
            <button onClick={() => setFilterPublik('belum')} style={btnFilter(filterPublik === 'belum')}>Belum Hadir</button>
          </div>

          {loading ? <p>Memuat data...</p> : (
            <table style={tableStyle}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={thStyle}>No</th>
                  <th style={thStyle}>Nama Pengajar</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Jam Masuk</th>
                  <th style={thStyle}>Jam Pulang</th>
                </tr>
              </thead>
              <tbody>
                {daftarHariIni
                  .filter(p => filterPublik === 'hadir' ? p.hadir : filterPublik === 'belum' ? !p.hadir : true)
                  .map((item, i) => (
                    <tr key={item.uid} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={tdStyle}>{i + 1}</td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{item.nama}</td>
                      <td style={tdStyle}>
                        <span style={badgeStatus(item.status)}>{item.status}</span>
                      </td>
                      <td style={tdStyle}>{item.jamMasuk}</td>
                      <td style={tdStyle}>{item.jamPulang}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* BAGIAN 2: HALAMAN UI ADMIN (SELURUH DATA SPREADSHEET)             */}
      {/* ================================================================= */}
      {halaman === 'admin' && !isAdminAuth && (
        <form onSubmit={handleLoginAdmin} style={{ maxWidth: 340, margin: '40px auto', padding: 24, border: '1px solid #e2e8f0', borderRadius: 10, textAlign: 'center' }}>
          <h3 style={{ marginTop: 0 }}>🔐 Login Panel Admin</h3>
          <p style={{ fontSize: 13, color: '#64748b' }}>Masukkan PIN untuk melihat seluruh database Spreadsheet</p>
          <input
            type="password"
            placeholder="Masukkan PIN Admin..."
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: 10, marginBottom: 12, borderRadius: 6, border: '1px solid #cbd5e1', textAlign: 'center', fontSize: 16 }}
          />
          <button type="submit" style={{ width: '100%', padding: 10, background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' }}>
            Masuk ke Database Admin
          </button>
        </form>
      )}

      {halaman === 'admin' && isAdminAuth && (
        <div>
          {pesanAdmin && (
            <div style={{ background: '#dcfce7', color: '#166534', padding: 10, borderRadius: 6, marginBottom: 14, fontWeight: 600 }}>
              ✅ {pesanAdmin}
            </div>
          )}

          {/* Pengaturan Batas Jam Masuk & Kontrol */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontWeight: 600, fontSize: 13 }}>⏰ Batas Jam Masuk:</label>
              <input
                type="time"
                step="1"
                value={batasJamMasuk}
                onChange={(e) => setBatasJamMasuk(e.target.value)}
                style={{ padding: 6, borderRadius: 4, border: '1px solid #cbd5e1' }}
              />
              <button onClick={simpanJamBaru} style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
                Simpan
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={ambilSemuaDataAdmin} style={btnSecondary}>🔄 Muat Ulang Semua Data</button>
              <button onClick={() => setIsAdminAuth(false)} style={{ ...btnSecondary, background: '#fee2e2', color: '#991b1b', borderColor: '#fecaca' }}>
                Keluar Admin
              </button>
            </div>
          </div>

          {/* Sub-Tab Pemilih Sheet Spreadsheet & Kotak Pencarian */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setSubTabAdmin('log')} style={btnFilter(subTabAdmin === 'log')}>
                📑 Sheet Data_Absensi ({riwayatAbsensi.length} Baris)
              </button>
              <button onClick={() => setSubTabAdmin('master')} style={btnFilter(subTabAdmin === 'master')}>
                🪪 Sheet Master_Pengajar ({masterPengajar.length} Kartu)
              </button>
            </div>

            <input
              type="text"
              placeholder="Cari nama, UID, tanggal, atau status..."
              value={cariTeks}
              onChange={(e) => setCariTeks(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid #cbd5e1', minWidth: 250 }}
            />
          </div>

          {/* TABEL 1: SELURUH DATA SHEET DATA_ABSENSI */}
          {subTabAdmin === 'log' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={thStyle}>Baris</th>
                    <th style={thStyle}>Tanggal</th>
                    <th style={thStyle}>Waktu</th>
                    <th style={thStyle}>UID Kartu</th>
                    <th style={thStyle}>Nama Pengajar</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filterLogAbsensi.map((log) => (
                    <tr key={log.row} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ ...tdStyle, color: '#64748b' }}>#{log.row}</td>
                      <td style={tdStyle}>{log.tanggal}</td>
                      <td style={tdStyle}>{log.waktu}</td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{log.uid}</td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{log.nama}</td>
                      <td style={tdStyle}><span style={badgeStatus(log.status)}>{log.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TABEL 2: SELURUH DATA SHEET MASTER_PENGAJAR (BISA EDIT NAMA) */}
          {subTabAdmin === 'master' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={thStyle}>Baris</th>
                    <th style={thStyle}>UID Kartu</th>
                    <th style={thStyle}>Nama Pengajar</th>
                    <th style={thStyle}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filterMasterPengajar.map((m) => (
                    <tr key={m.row} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ ...tdStyle, color: '#64748b' }}>#{m.row}</td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 'bold' }}>{m.uid}</td>
                      <td style={tdStyle}>
                        {editRow === m.row ? (
                          <input
                            type="text"
                            value={editNamaVal}
                            onChange={(e) => setEditNamaVal(e.target.value)}
                            style={{ padding: 6, borderRadius: 4, border: '1px solid #3b82f6', width: '90%' }}
                          />
                        ) : (
                          <span style={{ fontWeight: 600, color: m.nama.startsWith('Pengajar_') ? '#b45309' : '#111827' }}>
                            {m.nama}
                          </span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        {editRow === m.row ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => simpanNamaBaru(m.row)} style={{ padding: '5px 10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Simpan</button>
                            <button onClick={() => setEditRow(null)} style={{ padding: '5px 10px', background: '#94a3b8', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Batal</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditRow(m.row); setEditNamaVal(m.nama); }}
                            style={{ padding: '5px 10px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}
                          >
                            ✏️ Edit Nama
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper Styles
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' };
const thStyle: React.CSSProperties = { padding: 10, fontWeight: 700, color: '#334155' };
const tdStyle: React.CSSProperties = { padding: 10 };
const btnSecondary: React.CSSProperties = { padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 12 };

function cardStat(bg: string, color: string): React.CSSProperties {
  return { padding: 14, borderRadius: 8, background: bg, color, textAlign: 'center' };
}

function btnFilter(aktif: boolean): React.CSSProperties {
  return {
    padding: '7px 12px', borderRadius: 6, border: '1px solid #cbd5e1',
    background: aktif ? '#2563eb' : '#fff', color: aktif ? '#fff' : '#334155',
    cursor: 'pointer', fontWeight: 600, fontSize: 12
  };
}

function badgeStatus(status: string): React.CSSProperties {
  const base: React.CSSProperties = { padding: '3px 9px', borderRadius: 12, fontSize: 11, fontWeight: 700 };
  if (status === 'Masuk') return { ...base, background: '#dcfce7', color: '#166534' };
  if (status === 'Terlambat') return { ...base, background: '#fef3c7', color: '#92400e' };
  if (status === 'Pulang') return { ...base, background: '#dbeafe', color: '#1e40af' };
  return { ...base, background: '#fee2e2', color: '#991b1b' };
}
