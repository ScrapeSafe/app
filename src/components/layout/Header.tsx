"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { Wallet, LogOut, Menu, X } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/market', label: 'Marketplace' },
  { href: '/bot', label: 'Simulator' },
  { href: '/my-licenses', label: 'My Licenses' },
];

export const Header = () => {
  const { isConnected, address, connect, disconnect } = useWallet();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 blur-md bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
              <img src={logo.src} alt="ScrapeSafe" className="h-9 w-auto relative" />
            </div>
            <span className="font-display font-bold text-lg hidden sm:block">
              ScrapeSafe<span className="text-primary">IP</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${pathname === link.href
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isConnected ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border">
                  <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse shadow-[0_0_10px_hsl(150_100%_45%)]" />
                  <span className="font-mono text-sm text-foreground">{truncateAddress(address!)}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={disconnect}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={connect} className="glow-cyan font-semibold">
                <Wallet className="h-4 w-4 mr-2" />
                Connect
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${pathname === link.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
