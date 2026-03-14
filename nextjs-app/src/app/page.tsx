'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowRight, FiGithub, FiLinkedin } from 'react-icons/fi';

export default function HomePage() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-[#008080] to-[#0d7390] flex items-center justify-center text-white">
      <div className="section-container text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.h1
            className="text-5xl sm:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Scott Sherwood
          </motion.h1>

          <motion.h2
            className="text-2xl sm:text-3xl font-light text-teal-100 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Full Stack Software Engineer
          </motion.h2>

          <motion.p
            className="text-lg text-teal-100 max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            I build clean, scalable web applications using React, Next.js, Node.js, and PostgreSQL.
            Passionate about great developer experience and beautiful UIs.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <Link
              href="/projects"
              className="bg-white text-teal-DEFAULT font-semibold px-8 py-3 rounded-lg hover:bg-teal-50 transition-colors flex items-center gap-2"
            >
              View My Work <FiArrowRight />
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white hover:text-teal-DEFAULT transition-colors"
            >
              Get In Touch
            </Link>
          </motion.div>

          <motion.div
            className="flex justify-center gap-6 mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <a
              href="https://github.com/scott95100"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-100 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <FiGithub size={28} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-100 hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              <FiLinkedin size={28} />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
