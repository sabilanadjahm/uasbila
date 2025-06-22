// pages/stok-barang.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import ProtectedRoute from './middleware';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function StokBarang() {
  const [barang, setBarang] = useState([]);
  const [form, setForm] = useState({ kode: '', nama: '', stok: '', hargaModal: '', hargaJual: '', gambar: null });
  const [editId, setEditId] = useState(null);
  const router = useRouter();

  // Ambil data via API Route
  const fetchBarang = async () => {
    const res = await fetch('/api/stok');
    const data = await res.json();
    setBarang(data);
  };

  useEffect(() => {
    fetchBarang();
  }, []);

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = '';
    if (form.gambar instanceof File) {
      imageUrl = await uploadToCloudinary(form.gambar);
    } else if (typeof form.gambar === 'string') {
      imageUrl = form.gambar;
    }

    const newData = {
      kode: form.kode,
      nama: form.nama,
      stok: form.stok,
      hargaModal: form.hargaModal,
      hargaJual: form.hargaJual,
      gambar: imageUrl,
    };

    if (editId) {
      const barangRef = doc(db, 'stokBarang', editId);
      await updateDoc(barangRef, newData);
      setEditId(null);
    } else {
      await addDoc(collection(db, 'stokBarang'), newData);
    }

    setForm({ kode: '', nama: '', stok: '', hargaModal: '', hargaJual: '', gambar: null });
    fetchBarang();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'stokBarang', id));
    fetchBarang();
  };

  const handleEdit = (item) => {
    setForm({
      kode: item.kode,
      nama: item.nama,
      stok: item.stok,
      hargaModal: item.hargaModal,
      hargaJual: item.hargaJual,
      gambar: item.gambar || null,
    });
    setEditId(item.id);
  };

  const exportPDF = () => {
    const docPDF = new jsPDF();
    docPDF.setFontSize(18);
    docPDF.text('Laporan Stok Barang', 14, 20);

    const tableColumn = ["No", "Kode", "Nama", "Stok", "Harga Modal", "Harga Jual"];
    const tableRows = [];

    barang.forEach((item, index) => {
      const rowData = [
        index + 1,
        item.kode,
        item.nama,
        item.stok,
        `Rp ${parseInt(item.hargaModal).toLocaleString()}`,
        `Rp ${parseInt(item.hargaJual).toLocaleString()}`
      ];
      tableRows.push(rowData);
    });

    autoTable(docPDF, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    docPDF.save(`Laporan_StokBarang_${new Date().toLocaleDateString()}.pdf`);
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="p-6 min-h-screen bg-gradient-to-br from-[#FFF8F0] to-[#FAEDCD] text-[#344E41]">
        <h1 className="text-3xl font-bold mb-6">Stok Barang</h1>

        <motion.form
          onSubmit={handleSubmit}
          className="bg-white/80 border border-[#DAD7CD] backdrop-blur-md p-6 rounded-2xl shadow grid grid-cols-1 md:grid-cols-5 gap-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <input type="text" placeholder="Kode Barang" value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} className="p-2 border rounded bg-[#f6f6f6] focus:outline-none focus:ring-2 focus:ring-[#A3B18A]" required />
          <input type="text" placeholder="Nama Barang" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="p-2 border rounded bg-[#f6f6f6] focus:outline-none focus:ring-2 focus:ring-[#A3B18A]" required />
          <input type="number" placeholder="Stok" value={form.stok} onChange={(e) => setForm({ ...form, stok: e.target.value })} className="p-2 border rounded bg-[#f6f6f6] focus:outline-none focus:ring-2 focus:ring-[#A3B18A]" required />
          <input type="number" placeholder="Harga Modal" value={form.hargaModal} onChange={(e) => setForm({ ...form, hargaModal: e.target.value })} className="p-2 border rounded bg-[#f6f6f6] focus:outline-none focus:ring-2 focus:ring-[#A3B18A]" required />
          <input type="number" placeholder="Harga Jual" value={form.hargaJual} onChange={(e) => setForm({ ...form, hargaJual: e.target.value })} className="p-2 border rounded bg-[#f6f6f6] focus:outline-none focus:ring-2 focus:ring-[#A3B18A]" required />
          <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, gambar: e.target.files[0] })} className="col-span-1 md:col-span-5" />

          <button type="submit" className="col-span-1 md:col-span-5 bg-[#A3B18A] text-white py-2 rounded hover:bg-[#588157] transition">
            {editId ? 'Update Barang' : 'Tambah Barang'}
          </button>
        </motion.form>

        <div className="flex justify-end mb-2">
          <button onClick={exportPDF} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
            Export PDF
          </button>
        </div>

        <div className="bg-white/80 border border-[#DAD7CD] p-4 rounded-2xl shadow overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[#DAD7CD] text-[#344E41] font-semibold">
                <th className="p-2 border">No</th>
                <th className="p-2 border">Kode Barang</th>
                <th className="p-2 border">Nama Barang</th>
                <th className="p-2 border">Stok</th>
                <th className="p-2 border">Harga Modal</th>
                <th className="p-2 border">Harga Jual</th>
                <th className="p-2 border">Gambar</th>
                <th className="p-2 border">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {barang.map((item, index) => (
                <tr key={item.id} className="hover:bg-[#f5f5f5]">
                  <td className="p-2 border">{index + 1}</td>
                  <td className="p-2 border">{item.kode}</td>
                  <td className="p-2 border">{item.nama}</td>
                  <td className="p-2 border">{item.stok}</td>
                  <td className="p-2 border">Rp {parseInt(item.hargaModal).toLocaleString()}</td>
                  <td className="p-2 border">Rp {parseInt(item.hargaJual).toLocaleString()}</td>
                  <td className="p-2 border">
                    {item.gambar ? (
                      <img src={item.gambar} alt={item.nama} className="w-16 h-16 object-cover rounded" />
                    ) : (
                      <span className="text-gray-400 italic">No image</span>
                    )}
                  </td>
                  <td className="p-2 border space-x-2">
                    <button onClick={() => handleEdit(item)} className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded transition">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition">Hapus</button>
                    <button onClick={() => router.push(`/produk/${item.id}`)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition">Detail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
}
