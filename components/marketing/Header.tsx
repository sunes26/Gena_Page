// components/marketing/Header.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SummaryGenie
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:text-blue-600 transition">
              기능
            </a>
            <a href="#how-it-works" className="text-sm font-medium hover:text-blue-600 transition">
              사용방법
            </a>
            <a href="#pricing" className="text-sm font-medium hover:text-blue-600 transition">
              요금제
            </a>
            <a href="#faq" className="text-sm font-medium hover:text-blue-600 transition">
              FAQ
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">로그인</Button>
            </Link>
            <Link href="/signup">
              <Button>무료 시작하기</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800">
            <nav className="flex flex-col gap-4">
              <a
                href="#features"
                className="text-sm font-medium hover:text-blue-600 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                기능
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium hover:text-blue-600 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                사용방법
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium hover:text-blue-600 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                요금제
              </a>
              <a
                href="#faq"
                className="text-sm font-medium hover:text-blue-600 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Link href="/login">
                  <Button variant="ghost" className="w-full">
                    로그인
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="w-full">무료 시작하기</Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}