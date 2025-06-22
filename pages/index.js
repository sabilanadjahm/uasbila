import { useState } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import dynamic from 'next/dynamic';
import 'aos/dist/aos.css';

const MotionElements = dynamic(() => import('../components/MotionElements'), {
  ssr: false,
  loading: () => <p className="text-white">Loading UI...</p>,
});

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nama, setNama] = useState('');
  const [role, setRole] = useState('admin');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          localStorage.setItem('role', userData.role);
          localStorage.setItem('uid', userCredential.user.uid);
          localStorage.setItem('nama', userData.nama || '');
          router.push('/dashboard');
        } else {
          setError('Data pengguna tidak ditemukan.');
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email,
          role,
          nama,
        });
        setEmail('');
        setPassword('');
        setNama('');
        setIsLogin(true);
        alert('Registrasi berhasil! Silakan login 💖');
      }
    } catch (err) {
      console.error(err);
      setError('Email atau Password salah atau sudah digunakan!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF0F5] to-[#FAEDCD] p-4">
      <MotionElements>
        {({ MotionDiv, MotionForm }) => (
          <MotionDiv
            className="backdrop-blur-xl bg-white/80 border border-[#FAD2E1] shadow-xl p-8 rounded-3xl w-full max-w-md text-[#6B4226]"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-center mb-2">🍰 {isLogin ? 'Selamat Datang!' : 'Buat Akun Baru'}</h1>
            <p className="text-sm text-center text-[#A98467] mb-6">
              {isLogin ? 'Yuk masuk dulu ke dapur kue~ 💕' : 'Ayo gabung ke tim dapur kita! 🧁'}
            </p>

            {error && (
              <p className="text-red-600 bg-red-100 p-2 rounded mb-4 text-center text-sm">
                ⚠️ {error}
              </p>
            )}

            <MotionForm onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <input
                  type="text"
                  placeholder="👩‍🍳 Nama Lengkap"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#fefefe] text-[#6B4226] border border-[#FFD6D6] focus:outline-none focus:ring-2 focus:ring-[#ffb4a2]"
                  required
                />
              )}
              <input
                type="email"
                placeholder="📧 Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-[#fefefe] text-[#6B4226] border border-[#FFD6D6] focus:outline-none focus:ring-2 focus:ring-[#ffb4a2]"
                required
              />
              <input
                type="password"
                placeholder="🔐 Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-[#fefefe] text-[#6B4226] border border-[#FFD6D6] focus:outline-none focus:ring-2 focus:ring-[#ffb4a2]"
                required
              />
              {!isLogin && (
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#fefefe] text-[#6B4226] border border-[#FFD6D6] focus:outline-none focus:ring-2 focus:ring-[#ffb4a2]"
                >
                  <option value="admin">👩‍🍳 Admin Gudang</option>
                  <option value="manager">🧑‍💼 Manajer Operasional</option>
                </select>
              )}
              <button
                type="submit"
                className="w-full py-2 bg-[#ffb4a2] hover:bg-[#f4978e] text-white font-semibold rounded-full transition-all shadow"
              >
                {isLogin ? '💌 Masuk' : '🎉 Daftar'}
              </button>
            </MotionForm>

            <div className="text-center mt-4">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-[#6B4226] underline hover:text-[#f4978e] transition"
              >
                {isLogin ? 'Belum punya akun? Yuk daftar dulu 🍓' : 'Sudah punya akun? Login di sini 💌'}
              </button>
            </div>
          </MotionDiv>
        )}
      </MotionElements>
    </div>
  );
}
