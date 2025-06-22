import { useEffect, useState } from 'react';
import ProtectedRoute from './middleware';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const MotionDiv = dynamic(() => import('framer-motion').then((mod) => mod.motion.div), { ssr: false });

export default function Dashboard() {
  const [role, setRole] = useState('');
  const [stokMinimum, setStokMinimum] = useState([]);
  const [jumlahBarang, setJumlahBarang] = useState(0);
  const [jumlahMasuk, setJumlahMasuk] = useState(0);
  const [jumlahKeluar, setJumlahKeluar] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (!storedRole) {
      router.push('/');
    } else {
      setRole(storedRole);
    }
  }, [router]);

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, 'stokBarang'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJumlahBarang(data.length);
      setStokMinimum(data.filter(item => parseInt(item.stok) <= 10));
    });

    const unsub2 = onSnapshot(collection(db, 'barang_masuk'), (snapshot) => {
      setJumlahMasuk(snapshot.size);
    });

    const unsub3 = onSnapshot(collection(db, 'barang_keluar'), (snapshot) => {
      setJumlahKeluar(snapshot.size);
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, []);

  return (
    <ProtectedRoute>
      <Navbar role={role} />
      <div className="p-6 min-h-screen bg-gradient-to-br from-[#FFF8F0] to-[#FAEDCD] text-[#344E41] font-[Poppins]">
        <h1 className="text-4xl font-extrabold mb-4 text-[#6B4226] tracking-wide flex items-center gap-2">
          🎀 Dashboard Dapur Kue 🎂
        </h1>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-md font-semibold text-[#A98467]">
            Role: {role === 'admin' ? '👩‍🍳 Penanggung Jawab Dapur' : '🧑‍💼 Supervisor Produksi'}
          </h2>
          <button
            onClick={() => router.push('/scan-produk')}
            className="bg-[#FFB5A7] hover:bg-[#FFA69E] text-white px-5 py-2 rounded-full font-semibold shadow transition-all duration-300"
          >
            🔍 Scan Barcode
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {role === 'admin' && (
            <>
              <MotionDiv
                className="bg-[#FFD6A5] p-4 rounded-2xl shadow-lg text-[#6B4226] hover:shadow-xl cursor-pointer"
                whileHover={{ scale: 1.05 }}
                onClick={() => router.push('/stok-barang')}
              >
                <h2 className="text-lg font-semibold">🧁 Jenis Bahan Kue</h2>
                <p className="text-4xl font-bold mt-2">{jumlahBarang}</p>
              </MotionDiv>

              <MotionDiv
                className="bg-[#FFADAD] p-4 rounded-2xl shadow-lg text-[#6B4226] hover:shadow-xl cursor-pointer"
                whileHover={{ scale: 1.05 }}
                onClick={() => router.push('/barang-masuk')}
              >
                <h2 className="text-lg font-semibold">📦 Bahan Masuk</h2>
                <p className="text-4xl font-bold mt-2">{jumlahMasuk}</p>
              </MotionDiv>

              <MotionDiv
                className="bg-[#CDB4DB] p-4 rounded-2xl shadow-lg text-[#6B4226] hover:shadow-xl cursor-pointer"
                whileHover={{ scale: 1.05 }}
                onClick={() => router.push('/barang-keluar')}
              >
                <h2 className="text-lg font-semibold">🍰 Digunakan Produksi</h2>
                <p className="text-4xl font-bold mt-2">{jumlahKeluar}</p>
              </MotionDiv>
            </>
          )}

          <MotionDiv
            className="bg-[#B5EAD7] p-4 rounded-2xl shadow-lg text-[#6B4226] hover:shadow-xl cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push('/stok-barang')}
          >
            <h2 className="text-lg font-semibold">🚨 Bahan Hampir Habis</h2>
            <p className="text-4xl font-bold mt-2">{stokMinimum.length}</p>
          </MotionDiv>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 text-[#6B4226]">🍞 Peringatan Stok Minimum</h2>
          <div className="bg-white/90 border border-[#EADBC8] p-5 rounded-xl shadow-md overflow-x-auto">
            <table className="w-full text-sm text-left rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-[#FFE5B4] text-[#6B4226] font-semibold text-base">
                  <th className="p-3 border border-[#EADBC8]">No</th>
                  <th className="p-3 border border-[#EADBC8]">Kode</th>
                  <th className="p-3 border border-[#EADBC8]">Nama Bahan</th>
                  <th className="p-3 border border-[#EADBC8]">Stok</th>
                </tr>
              </thead>
              <tbody>
                {stokMinimum.length > 0 ? (
                  stokMinimum.map((item, index) => (
                    <tr key={item.id} className="hover:bg-[#FFF3E2] transition-all">
                      <td className="p-3 border border-[#EADBC8]">{index + 1}</td>
                      <td className="p-3 border border-[#EADBC8]">{item.kode}</td>
                      <td className="p-3 border border-[#EADBC8]">{item.nama}</td>
                      <td className="p-3 border border-[#EADBC8] text-red-600 font-bold">{item.stok}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-green-700 font-medium">
                      Semua bahan aman dan siap produksi! 🧁✨
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
