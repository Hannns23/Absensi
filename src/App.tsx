import React, { useEffect, useState } from 'react';

interface DataPengajar {
  uid: string;
  nama: string;
  hadir: boolean;
  status: string;
  jamMasuk: string;
  jamPulang: string;
}

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || "";

export default function App() {
  const [daftarPengajar, setDaftarPengajar] = useState<DataPengajar[]>([]);
  const [tanggal, setTanggal] = useState<string>("-");
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'semua' | 'hadir' | 'belum'>('semua');

  const ambilDataAbsensi = async () => {
    if (!APPS_SCRIPT_URL) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${APPS_SCRIPT_URL}?action=getStatusPengajar`);
      const json = await response.json();
      setTanggal(json.tanggal);
      setDaftarPengajar(json.data || []);
    } catch (error) {
      console.error("Gagal memuat data absensi pengajar:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ambilDataAbsensi();
    const interval = setInterval(ambilDataAbsensi, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalHadir = daftarPengajar.filter((p) => p.hadir).length;
  const totalBelum = daftarPengajar.length - totalHadir;

  const dataTampil = daftarPengajar.filter((item) => {
    if (filter === 'hadir') return item.hadir;
    if (filter === 'belum') return !item.hadir;
    return true;
  });

  const getBadgeStyle = (status: string): React.CSSProperties => {
    if (status === 'Masuk') return { background: '#dcfce7', color: '#166534' };
    if (status === 'Terlambat') return { background: '#fef3c7', color: '#92400e' };
    if (status === 'Pulang') return { background: '#dbeafe', color: '#1e40af' };
    return { background: '#fee2e2', color: '#991b1b' };
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 20, fontFamily: 'sans-serif' }}>
      <header style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: 16, marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, color: '#111827' }}>
          📋 Monitoring Kehadiran Pengajar (RFID)
        </h1>
        <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>
          Tanggal: <strong>{tanggal}</strong>
        </p>
      </header>

      {/* Kartu Ringkasan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <div style={{ padding: 14, borderRadius: 8, background: '#f3f4f6', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>{daftarPengajar.length}</div>
          <div style={{ fontSize: 12, color: '#4b5563' }}>Total Pengajar</div>
        </div>
        <div style={{ padding: 14, borderRadius: 8, background: '#dcfce7', textAlign: 'center', color: '#166534' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>{totalHadir}</div>
          <div style={{ fontSize: 12 }}>Sudah Absen Hari Ini</div>
        </div>
        <div style={{ padding: 14, borderRadius: 8, background: '#fee2e2', textAlign: 'center', color: '#991b1b' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>{totalBelum}</div>
          <div style={{ fontSize: 12 }}>Belum Absen</div>
        </div>
      </div>

      {/* Tombol Filter & Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, gap: 8 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setFilter('semua')} style={btnStyle(filter === 'semua')}>Semua</button>
          <button onClick={() => setFilter('hadir')} style={btnStyle(filter === 'hadir')}>Sudah Hadir ({totalHadir})</button>
          <button onClick={() => setFilter('belum')} style={btnStyle(filter === 'belum')}>Belum Hadir ({totalBelum})</button>
        </div>
        <button onClick={ambilDataAbsensi} style={{ padding: '6px 12px', cursor: 'pointer', borderRadius: 6, border: '1px solid #d1d5db' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Tabel Daftar Pengajar */}
      {loading ? (
        <p>Memuat data kehadiran pengajar...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9fafb', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: 10 }}>No</th>
                <th style={{ padding: 10 }}>Nama Pengajar</th>
                <th style={{ padding: 10 }}>Status</th>
                <th style={{ padding: 10 }}>Jam Masuk</th>
                <th style={{ padding: 10 }}>Jam Pulang</th>
              </tr>
            </thead>
            <tbody>
              {dataTampil.map((item, idx) => (
                <tr key={item.uid} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: 10 }}>{idx + 1}</td>
                  <td style={{ padding: 10, fontWeight: 600 }}>{item.nama}</td>
                  <td style={{ padding: 10 }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      ...getBadgeStyle(item.status)
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: 10, color: '#374151' }}>{item.jamMasuk}</td>
                  <td style={{ padding: 10, color: '#374151' }}>{item.jamPulang}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function btnStyle(aktif: boolean): React.CSSProperties {
  return {
    padding: '6px 12px',
    borderRadius: 6,
    border: '1px solid #d1d5db',
    background: aktif ? '#2563eb' : '#ffffff',
    color: aktif ? '#ffffff' : '#374151',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 12
  };
}
