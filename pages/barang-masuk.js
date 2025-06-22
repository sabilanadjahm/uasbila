import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc,
  doc, getDoc, Timestamp, query, where
} from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import ProtectedRoute from './middleware';
import { motion } from 'framer-motion';

export default function BarangMasuk() {
  const [barangMasuk, setBarangMasuk] = useState([]);
  const [produk, setProduk] = useState([]);
  const [supplier, setSupplier] = useState([]);
  const [form, setForm] = useState({ produkId: '', supplierId: '', jumlah: '' });
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState({ from: '', to: '' });

  const fetchProduk = async () => {
    const snap = await getDocs(collection(db, 'stokBarang'));
    setProduk(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const fetchSupplier = async () => {
    const snap = await getDocs(collection(db, 'supplier'));
    setSupplier(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const fetchBarangMasuk = async () => {
    let q = collection(db, 'barang_masuk');
    if (filter.from && filter.to) {
      const fromDate = new Date(filter.from);
      const toDate = new Date(filter.to);
      toDate.setHours(23, 59, 59);
      q = query(q, where('tanggal', '>=', Timestamp.fromDate(fromDate)), where('tanggal', '<=', Timestamp.fromDate(toDate)));
    }

    const snap = await getDocs(q);
    setBarangMasuk(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchProduk();
    fetchSupplier();
    fetchBarangMasuk();
  }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const produkRef = doc(db, 'stokBarang', form.produkId);
    const produkDoc = await getDoc(produkRef);
    if (!produkDoc.exists()) return alert('Produk tidak ditemukan');

    const hargaModal = Number(produkDoc.data().hargaModal || 0);
    const jumlah = Number(form.jumlah);
    const total = jumlah * hargaModal;

    if (editId) {
      await updateDoc(doc(db, 'barang_masuk', editId), {
        produkId: form.produkId,
        supplierId: form.supplierId,
        jumlah,
        hargaTotal: total,
        tanggal: Timestamp.now()
      });
      setEditId(null);
    } else {
      await addDoc(collection(db, 'barang_masuk'), {
        produkId: form.produkId,
        supplierId: form.supplierId,
        jumlah,
        hargaTotal: total,
        tanggal: Timestamp.now()
      });

      const stok = Number(produkDoc.data().stok || 0);
      await updateDoc(produkRef, { stok: stok + jumlah });
    }

    setForm({ produkId: '', supplierId: '', jumlah: '' });
    fetchBarangMasuk();
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({
      produkId: item.produkId,
      supplierId: item.supplierId,
      jumlah: item.jumlah
    });
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus data ini?')) {
      await deleteDoc(doc(db, 'barang_masuk', id));
      fetchBarangMasuk();
    }
  };

  const getNama = (id, list) => {
    const item = list.find((x) => x.id === id);
    return item ? item.nama : '-';
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="p-6 min-h-screen bg-gradient-to-br from-[#FFF8F0] to-[#FAEDCD] text-[#344E41]">
        <h1 className="text-3xl font-bold mb-6">Barang Masuk</h1>

        {/* Filter tanggal */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="date"
            className="p-2 border rounded"
            value={filter.from}
            onChange={(e) => setFilter({ ...filter, from: e.target.value })}
          />
          <input
            type="date"
            className="p-2 border rounded"
            value={filter.to}
            onChange={(e) => setFilter({ ...filter, to: e.target.value })}
          />
          <button
            onClick={() => setFilter({ from: '', to: '' })}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Reset
          </button>
        </div>

        {/* Form Input */}
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white/80 border border-[#DAD7CD] p-6 rounded-2xl shadow grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <select value={form.produkId} onChange={(e) => setForm({ ...form, produkId: e.target.value })} required className="p-2 border rounded">
            <option value="">Pilih Barang</option>
            {produk.map((p) => <option key={p.id} value={p.id}>{p.nama}</option>)}
          </select>

          <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} required className="p-2 border rounded">
            <option value="">Pilih Supplier</option>
            {supplier.map((s) => <option key={s.id} value={s.id}>{s.nama}</option>)}
          </select>

          <input type="number" placeholder="Jumlah Masuk" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} className="p-2 border rounded" required />

          <button type="submit" className="col-span-1 md:col-span-4 bg-[#A3B18A] text-white py-2 rounded hover:bg-[#588157] transition">
            {editId ? 'Update' : 'Tambah Barang Masuk'}
          </button>
        </motion.form>

        {/* Tabel Barang Masuk */}
        <div className="bg-white/80 border border-[#DAD7CD] p-4 rounded-2xl shadow overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[#DAD7CD] text-[#344E41] font-semibold">
                <th className="p-2 border">No</th>
                <th className="p-2 border">Nama Barang</th>
                <th className="p-2 border">Supplier</th>
                <th className="p-2 border">Jumlah</th>
                <th className="p-2 border">Harga Total</th>
                <th className="p-2 border">Tanggal</th>
                <th className="p-2 border">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {barangMasuk.length > 0 ? barangMasuk.map((item, index) => (
                <tr key={item.id} className="hover:bg-[#f5f5f5]">
                  <td className="p-2 border">{index + 1}</td>
                  <td className="p-2 border">{getNama(item.produkId, produk)}</td>
                  <td className="p-2 border">{getNama(item.supplierId, supplier)}</td>
                  <td className="p-2 border">{item.jumlah}</td>
                  <td className="p-2 border">Rp {parseInt(item.hargaTotal).toLocaleString()}</td>
                  <td className="p-2 border">{item.tanggal?.toDate().toLocaleString()}</td>
                  <td className="p-2 border space-x-2">
                    <button onClick={() => handleEdit(item)} className="bg-yellow-400 px-3 py-1 rounded text-white">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="bg-red-500 px-3 py-1 rounded text-white">Hapus</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="text-center p-4">Tidak ada data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
}
