import Link from 'next/link';
import { useRouter } from 'next/router';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [role, setRole] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole) setRole(storedRole);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('role');
    router.push('/');
  };

  const navLinks = (
    <>
      <Link href="/dashboard" className="hover:text-[#344e41] transition">🏠 Dashboard</Link>
      <Link href="/stok-barang" className="hover:text-[#344e41] transition">📦 Stok</Link>
      {role === 'admin' && (
        <>
          <Link href="/supplier" className="hover:text-[#344e41] transition">🚛 Supplier</Link>
          <Link href="/barang-masuk" className="hover:text-[#344e41] transition">📥 Masuk</Link>
          <Link href="/barang-keluar" className="hover:text-[#344e41] transition">📤 Keluar</Link>
          <Link href="/laporan" className="hover:text-[#344e41] transition">📊 Laporan</Link>
        </>
      )}
      {role === 'manager' && (
        <Link href="/laporan" className="hover:text-[#344e41] transition">📊 Laporan</Link>
      )}
    </>
  );

  return (
    <nav className="bg-[#ffcad4] px-6 py-4 rounded-b-2xl shadow-md font-medium text-[#6B4226]">
      <div className="flex justify-between items-center">
        {/* Brand */}
        <div className="text-2xl font-extrabold text-[#6B4226] tracking-wide flex items-center gap-2">
          🍓 <span className="drop-shadow">CakeStock</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks}
          <button
            onClick={handleLogout}
            className="bg-[#ffb4a2] hover:bg-[#f4978e] px-4 py-1.5 rounded-full text-white text-sm transition-all shadow"
          >
            🚪 Logout
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={28} color="#6B4226" /> : <Menu size={28} color="#6B4226" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-3 text-[#6B4226] animate-slide-down">
          {navLinks}
          <button
            onClick={handleLogout}
            className="bg-[#ffb4a2] hover:bg-[#f4978e] px-4 py-2 rounded-full text-white text-sm w-fit shadow"
          >
            🚪 Logout
          </button>
        </div>
      )}
    </nav>
  );
}
