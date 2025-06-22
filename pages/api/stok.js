// pages/api/stok.js
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const snapshot = await getDocs(collection(db, 'stokBarang'));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Gagal mengambil data stok' });
    }
  } else {
    res.status(405).json({ error: 'Method tidak diizinkan' });
  }
}
