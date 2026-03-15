import Link from 'next/link';
import { FiMail } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 mt-auto">
      <div className="section-container flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-white font-bold text-lg mb-1">Sherwood Technology Consulting LLC</p>
          <p className="text-sm">&copy; {new Date().getFullYear()} STC. All rights reserved.</p>
        </div>

        <div className="flex items-center gap-2">
          <FiMail size={16} className="text-brand" />
          <a
            href="mailto:sherwoodtechconsulting@gmail.com"
            className="text-sm hover:text-white transition-colors"
          >
            sherwoodtechconsulting@gmail.com
          </a>
        </div>

        <nav className="flex gap-4 text-sm">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/services" className="hover:text-white transition-colors">Services</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Get a Quote</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}
