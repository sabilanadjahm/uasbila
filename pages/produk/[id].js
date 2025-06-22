import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Barcode from 'react-barcode';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '../middleware';

export default function DetailProduk() {
  const router = useRouter();
  const { id } = router.query;
  const [produk, setProduk] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const docRef = doc(db, 'stokBarang', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProduk({ id: docSnap.id, ...docSnap.data() });
      }
    };
    fetchData();
  }, [id]);

  if (!produk) return <div className="p-6">Loading...</div>;

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="p-6 min-h-screen bg-gradient-to-br from-[#FFF8F0] to-[#FAEDCD] text-[#344E41]">
        <h1 className="text-3xl font-bold mb-6">Detail Produk</h1>
        <div className="bg-white/80 border border-[#DAD7CD] p-6 rounded-2xl shadow-md max-w-lg">
          <p className="text-lg font-semibold mb-2">Kode Barang: {produk.kode}</p>
          <p className="text-lg mb-2">Nama Barang: {produk.nama}</p>
          <p className="text-lg mb-2">Stok: {produk.stok}</p>
          <p className="text-lg mb-2">Harga Modal: Rp {parseInt(produk.hargaModal).toLocaleString()}</p>
          <p className="text-lg mb-4">Harga Jual: Rp {parseInt(produk.hargaJual).toLocaleString()}</p>

          {/* Tambahan: Gambar Produk */}
          {produk.gambar ? (
            <img
              src={produk.gambar}
              alt={produk.nama}
              className="w-64 h-64 object-cover border rounded mb-4"
            />
          ) : (
            <p className="italic text-gray-500 mb-4">Tidak ada gambar</p>
          )}

          {/* Barcode */}
          <div className="bg-white p-4 rounded border inline-block mb-6">
            <Barcode value={produk.kode} format="CODE128" width={2} height={80} displayValue />
          </div>

          <button
            onClick={() => router.back()}
            className="bg-[#A3B18A] hover:bg-[#588157] text-white py-2 px-4 rounded transition"
          >
            ← Kembali
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
