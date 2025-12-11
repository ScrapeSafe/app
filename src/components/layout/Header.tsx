import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { Wallet, LogOut, Menu, X } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/market', label: 'Marketplace' },
  { href: '/bot', label: 'Scraper Simulator' },
  { href: '/my-licenses', label: 'My Licenses' },
];

export const Header = () => {
  const { isConnected, address, connect, disconnect } = useWallet();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="ScrapeSafe" className="h-8 w-auto" />
            <span className="font-mono font-bold text-lg hidden sm:block">
              ScrapeSafe<span className="text-primary">IP</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.href
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isConnected ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="font-mono text-sm">{truncateAddress(address!)}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={disconnect}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={connect} className="glow-cyan">
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
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
          <nav className="lg:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.href
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
