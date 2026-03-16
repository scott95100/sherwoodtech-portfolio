'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/pricing', label: 'Get a Quote' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0F1923]/95 backdrop-blur-sm border-b border-[#243044] shadow-lg shadow-black/20">
      <nav className="section-container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <Image src="/logo.svg" alt="STC Logo" width={120} height={36} priority />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-medium transition-colors duration-200 hover:text-brand ${
                pathname === link.href ? 'text-brand' : 'text-slate-400'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {session ? (
            <div className="flex items-center gap-3">
              {session.user?.role === 'ADMIN' && (
                <Link href="/admin" className="font-medium text-slate-400 hover:text-brand">
                  Admin
                </Link>
              )}
              {session.user?.role === 'CLIENT' && (
                <Link href="/client-portal" className="font-medium text-slate-400 hover:text-brand">
                  My Projects
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="btn-secondary text-sm px-4 py-2"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn-primary text-sm px-4 py-2">
              Client Login
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-slate-400 hover:text-brand"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[#243044] bg-[#0F1923]"
          >
            <div className="section-container py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`font-medium py-2 transition-colors hover:text-brand ${
                    pathname === link.href ? 'text-brand' : 'text-slate-400'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {session ? (
                <>
                  {session.user?.role === 'ADMIN' && (
                    <Link href="/admin" onClick={() => setMenuOpen(false)} className="font-medium py-2 text-slate-400">
                      Admin
                    </Link>
                  )}
                  {session.user?.role === 'CLIENT' && (
                    <Link href="/client-portal" onClick={() => setMenuOpen(false)} className="font-medium py-2 text-slate-400">
                      My Projects
                    </Link>
                  )}
                  <button
                    onClick={() => { signOut({ callbackUrl: '/' }); setMenuOpen(false); }}
                    className="btn-secondary text-sm text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-primary text-sm text-center">
                  Client Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
