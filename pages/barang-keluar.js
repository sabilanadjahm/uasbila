import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  deleteDoc,
  Timestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import ProtectedRoute from './middleware';
import { motion } from 'framer-motion';

export default function BarangKeluar() {
  const [barangKeluar, setBarangKeluar] = useState([]);
  const [produk, setProduk] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [form, setForm] = useState({ produkId: '', jumlah: '' });

  const fetchBarangKeluar = async () => {
    const q = query(collection(db, 'barang_keluar'), orderBy('tanggal', 'desc'));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => {
      const rawData = doc.data();
      return {
        id: doc.id,
        ...rawData,
        tanggal: rawData.tanggal?.toDate ? rawData.tanggal.toDate() : new Date(rawData.tanggal),
      };
    });
    setBarangKeluar(data);
  };

  const fetchProduk = async () => {
    const querySnapshot = await getDocs(collection(db, 'stokBarang'));
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setProduk(data);
  };

  const fetchAdmin = async () => {
    const uid = localStorage.getItem('uid');
    if (!uid) return;
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      setAdmin({ id: uid, ...userDoc.data() });
    }
  };

  useEffect(() => {
    fetchBarangKeluar();
    fetchProduk();
    fetchAdmin();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const produkRef = doc(db, 'stokBarang', form.produkId);
    const produkDoc = await getDoc(produkRef);
    if (!produkDoc.exists()) return alert('Produk tidak ditemukan');

    const currentStok = produkDoc.data().stok || 0;
    if (currentStok < Number(form.jumlah)) {
      return alert('Stok tidak mencukupi');
    }

    const hargaJual = produkDoc.data().hargaJual || 0;
    const total = hargaJual * Number(form.jumlah);

    await addDoc(collection(db, 'barang_keluar'), {
      produkId: form.produkId,
      jumlah: Number(form.jumlah),
      total,
      tanggal: Timestamp.now(),
      adminId: admin?.id || '',
      adminNama: admin?.nama || 'Tidak diketahui',
    });

    await updateDoc(produkRef, {
      stok: currentStok - Number(form.jumlah),
    });

    setForm({ produkId: '', jumlah: '' });
    fetchBarangKeluar();
    fetchProduk();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'barang_keluar', id));
    fetchBarangKeluar();
  };

  const getNamaProduk = (id) => {
    const found = produk.find((item) => item.id === id);
    return found ? found.nama : '-';
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="p-6 min-h-screen bg-gradient-to-br from-[#FAEDCD] to-[#FDF6EC] text-[#344E41]">
        <h1 className="text-3xl font-bold mb-6">Barang Keluar</h1>

        <motion.form
          onSubmit={handleSubmit}
          className="bg-white/80 border border-[#DAD7CD] p-6 rounded-2xl shadow grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <select
            value={form.produkId}
            onChange={(e) => setForm({ ...form, produkId: e.target.value })}
            className="p-2 border rounded bg-[#f6f6f6] focus:outline-none focus:ring-2 focus:ring-[#A3B18A]"
            required
          >
            <option value="">Pilih Barang</option>
            {produk.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nama}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Jumlah Keluar"
            value={form.jumlah}
            onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
            className="p-2 border rounded bg-[#f6f6f6] focus:outline-none focus:ring-2 focus:ring-[#A3B18A]"
            required
          />

          <button
            type="submit"
            className="col-span-1 md:col-span-3 bg-[#D88C9A] text-white py-2 rounded hover:bg-[#C06C84] transition"
          >
            Tambah Barang Keluar
          </button>
        </motion.form>

        <div className="bg-white/80 border border-[#DAD7CD] p-4 rounded-2xl shadow overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[#DAD7CD] text-[#344E41] font-semibold">
                <th className="p-2 border">No</th>
                <th className="p-2 border">Nama Barang</th>
                <th className="p-2 border">Jumlah</th>
                <th className="p-2 border">Total</th>
                <th className="p-2 border">Tanggal</th>
                <th className="p-2 border">Penanggung Jawab</th>
                <th className="p-2 border">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {barangKeluar.length > 0 ? (
                barangKeluar.map((item, index) => (
                  <tr key={item.id} className="hover:bg-[#f5f5f5]">
                    <td className="p-2 border">{index + 1}</td>
                    <td className="p-2 border">{getNamaProduk(item.produkId)}</td>
                    <td className="p-2 border">{item.jumlah}</td>
                    <td className="p-2 border">Rp {parseInt(item.total || 0).toLocaleString()}</td>
                    <td className="p-2 border">{item.tanggal.toLocaleString()}</td>
                    <td className="p-2 border">{item.adminNama}</td>
                    <td className="p-2 border">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-2">Belum ada data barang keluar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
}
