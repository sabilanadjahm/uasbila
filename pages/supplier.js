import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import ProtectedRoute from './middleware';
import { motion } from 'framer-motion';

export default function Supplier() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ nama: '', kontak: '', alamat: '' });
  const [editId, setEditId] = useState(null);

  const fetchSuppliers = async () => {
    const querySnapshot = await getDocs(collection(db, 'supplier'));
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setSuppliers(data);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      const supplierRef = doc(db, 'supplier', editId);
      await updateDoc(supplierRef, { ...form });
      setEditId(null);
    } else {
      await addDoc(collection(db, 'supplier'), { ...form });
    }
    setForm({ nama: '', kontak: '', alamat: '' });
    fetchSuppliers();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'supplier', id));
    fetchSuppliers();
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditId(item.id);
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="p-6 min-h-screen bg-gradient-to-br from-[#FFF8F0] to-[#FAEDCD] text-[#344E41]">
        <h1 className="text-3xl font-bold mb-6">Data Supplier</h1>

        {/* Form Supplier */}
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white/80 border border-[#DAD7CD] backdrop-blur-md p-6 rounded-2xl shadow grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <input
            type="text"
            placeholder="Nama Supplier"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            className="p-2 border rounded bg-[#f6f6f6] focus:outline-none focus:ring-2 focus:ring-[#A3B18A]"
            required
          />
          <input
            type="text"
            placeholder="Kontak Supplier"
            value={form.kontak}
            onChange={(e) => setForm({ ...form, kontak: e.target.value })}
            className="p-2 border rounded bg-[#f6f6f6] focus:outline-none focus:ring-2 focus:ring-[#A3B18A]"
            required
          />
          <input
            type="text"
            placeholder="Alamat Supplier"
            value={form.alamat}
            onChange={(e) => setForm({ ...form, alamat: e.target.value })}
            className="p-2 border rounded bg-[#f6f6f6] focus:outline-none focus:ring-2 focus:ring-[#A3B18A]"
            required
          />
          <button
            type="submit"
            className="col-span-1 md:col-span-3 bg-[#A3B18A] text-white py-2 rounded hover:bg-[#588157] transition"
          >
            {editId ? 'Update Supplier' : 'Tambah Supplier'}
          </button>
        </motion.form>

        {/* Tabel Supplier */}
        <div className="bg-white/80 border border-[#DAD7CD] p-4 rounded-2xl shadow overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[#DAD7CD] text-[#344E41] font-semibold">
                <th className="p-2 border">No</th>
                <th className="p-2 border">Nama Supplier</th>
                <th className="p-2 border">Kontak</th>
                <th className="p-2 border">Alamat</th>
                <th className="p-2 border">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((item, index) => (
                <tr key={item.id} className="hover:bg-[#f5f5f5]">
                  <td className="p-2 border">{index + 1}</td>
                  <td className="p-2 border">{item.nama}</td>
                  <td className="p-2 border">{item.kontak}</td>
                  <td className="p-2 border">{item.alamat}</td>
                  <td className="p-2 border space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
                    >
                      Hapus
                    </button>
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
