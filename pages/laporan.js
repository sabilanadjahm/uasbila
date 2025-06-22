import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import ProtectedRoute from './middleware';
import { motion } from 'framer-motion';
import html2pdf from 'html2pdf.js';

export default function Laporan() {
  const [barangMasuk, setBarangMasuk] = useState([]);
  const [barangKeluar, setBarangKeluar] = useState([]);
  const [produk, setProduk] = useState([]);
  const [supplier, setSupplier] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const printRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      const qMasuk = query(collection(db, 'barang_masuk'), orderBy('tanggal', 'desc'));
      const qKeluar = query(collection(db, 'barang_keluar'), orderBy('tanggal', 'desc'));
      const masukSnap = await getDocs(qMasuk);
      const keluarSnap = await getDocs(qKeluar);
      const produkSnap = await getDocs(collection(db, 'stokBarang'));
      const supplierSnap = await getDocs(collection(db, 'supplier'));

      setBarangMasuk(masukSnap.docs.map((doc) => ({ id: doc.id, ...doc.data(), tanggal: doc.data().tanggal?.toDate() })));
      setBarangKeluar(keluarSnap.docs.map((doc) => ({ id: doc.id, ...doc.data(), tanggal: doc.data().tanggal?.toDate() })));
      setProduk(produkSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setSupplier(supplierSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchData();
  }, []);

  const getNamaProduk = (id) => produk.find((p) => p.id === id)?.nama || '-';
  const getNamaSupplier = (id) => supplier.find((s) => s.id === id)?.nama || '-';

  const filterByDate = (data) => {
    if (!filterDate) return data;
    return data.filter((item) =>
      item.tanggal?.toISOString().startsWith(filterDate)
    );
  };

  const handleExportPDF = () => {
    const element = printRef.current;
    const opt = {
      margin:       0.5,
      filename:     `Laporan-Barang-${new Date().toISOString().split('T')[0]}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="p-6 min-h-screen bg-gradient-to-br from-[#FFF8F0] to-[#FAEDCD] text-[#344E41]">
        <h1 className="text-3xl font-bold mb-6">Laporan Barang Masuk & Keluar</h1>

        {/* Filter & Tombol Export PDF */}
        <motion.div
          className="mb-6 flex flex-wrap items-center gap-4 bg-white/80 p-4 rounded-xl border border-[#DAD7CD] shadow no-print"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <label className="font-semibold">Filter Tanggal:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="p-2 border rounded bg-[#f6f6f6] focus:outline-none focus:ring-2 focus:ring-[#A3B18A]"
          />
          <button
            onClick={() => setFilterDate('')}
            className="bg-[#A3B18A] text-white px-4 py-2 rounded hover:bg-[#588157] transition"
          >
            Reset
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-[#D88C9A] text-white px-4 py-2 rounded hover:bg-[#C06C84] transition"
          >
            Export PDF
          </button>
        </motion.div>

        {/* Bagian Export */}
        <div ref={printRef} className="space-y-10">
          {/* Barang Masuk */}
          <div>
            <h2 className="text-xl font-bold mb-4">Barang Masuk</h2>
            <div className="bg-white p-4 rounded-xl shadow border border-[#DAD7CD] overflow-x-auto">
              <table className="w-full text-sm text-left border">
                <thead>
                  <tr className="bg-[#DAD7CD] text-[#344E41] font-semibold">
                    <th className="p-2 border">No</th>
                    <th className="p-2 border">Nama Barang</th>
                    <th className="p-2 border">Jumlah</th>
                    <th className="p-2 border">Supplier</th>
                    <th className="p-2 border">Harga Total</th>
                    <th className="p-2 border">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {filterByDate(barangMasuk).length > 0 ? (
                    filterByDate(barangMasuk).map((item, index) => (
                      <tr key={item.id}>
                        <td className="p-2 border">{index + 1}</td>
                        <td className="p-2 border">{getNamaProduk(item.produkId)}</td>
                        <td className="p-2 border">{item.jumlah}</td>
                        <td className="p-2 border">{getNamaSupplier(item.supplierId)}</td>
                        <td className="p-2 border">Rp {parseInt(item.hargaTotal || 0).toLocaleString()}</td>
                        <td className="p-2 border">{item.tanggal?.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center p-2 italic">Tidak ada data barang masuk.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Barang Keluar */}
          <div>
            <h2 className="text-xl font-bold mb-4">Barang Keluar</h2>
            <div className="bg-white p-4 rounded-xl shadow border border-[#DAD7CD] overflow-x-auto">
              <table className="w-full text-sm text-left border">
                <thead>
                  <tr className="bg-[#DAD7CD] text-[#344E41] font-semibold">
                    <th className="p-2 border">No</th>
                    <th className="p-2 border">Nama Barang</th>
                    <th className="p-2 border">Jumlah</th>
                    <th className="p-2 border">Total</th>
                    <th className="p-2 border">Tanggal</th>
                    <th className="p-2 border">Penanggung Jawab</th>
                  </tr>
                </thead>
                <tbody>
                  {filterByDate(barangKeluar).length > 0 ? (
                    filterByDate(barangKeluar).map((item, index) => (
                      <tr key={item.id}>
                        <td className="p-2 border">{index + 1}</td>
                        <td className="p-2 border">{getNamaProduk(item.produkId)}</td>
                        <td className="p-2 border">{item.jumlah}</td>
                        <td className="p-2 border">Rp {parseInt(item.total || 0).toLocaleString()}</td>
                        <td className="p-2 border">{item.tanggal?.toLocaleString()}</td>
                        <td className="p-2 border">{item.adminNama || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center p-2 italic">Tidak ada data barang keluar.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
