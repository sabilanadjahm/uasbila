import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import ProtectedRoute from './middleware';
import { useRouter } from 'next/router';

export default function ScanProduk() {
  const [hasilScan, setHasilScan] = useState(null);
  const [produk, setProduk] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      async (decodedText, decodedResult) => {
        setHasilScan(decodedText);
        scanner.clear(); // Stop scanning
        await cariProduk(decodedText);
      },
      (err) => {
        console.warn(`Scan error: ${err}`);
      }
    );

    return () => {
      scanner.clear().catch((e) => console.error('Clear error:', e));
    };
  }, []);

  const cariProduk = async (kode) => {
    try {
      const q = query(collection(db, 'stokBarang'), where('kode', '==', kode));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setProduk({ id: doc.id, ...doc.data() });
      } else {
        setProduk(null);
        setError(`Produk dengan kode "${kode}" tidak ditemukan.`);
      }
    } catch (e) {
      console.error(e);
      setError('Gagal mengambil data dari Firebase.');
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="p-6 min-h-screen bg-gradient-to-br from-[#FFF8F0] to-[#FAEDCD] text-[#344E41]">
        <h1 className="text-3xl font-bold mb-6">Scan Produk</h1>

        {!produk && (
          <div id="reader" className="w-full max-w-md mx-auto mb-6 border border-[#DAD7CD] rounded-lg shadow" />
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4 max-w-md mx-auto">
            {error}
          </div>
        )}

        {produk && (
          <div className="max-w-md mx-auto bg-white/80 border border-[#DAD7CD] p-6 rounded-2xl shadow">
            <p className="text-lg font-semibold mb-2">Kode Barang: {produk.kode}</p>
            <p className="text-lg mb-2">Nama Barang: {produk.nama}</p>
            <p className="text-lg mb-2">Stok: {produk.stok}</p>
            <p className="text-lg mb-2">Harga Modal: Rp {parseInt(produk.hargaModal).toLocaleString()}</p>
            <p className="text-lg mb-4">Harga Jual: Rp {parseInt(produk.hargaJual).toLocaleString()}</p>

            <button
              onClick={() => router.push(`/produk/${produk.id}`)}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition w-full"
            >
              🔎 Lihat Detail
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
