import React from 'react';
import { Link, useLocation } from 'wouter';
import { Users, LayoutList, Target, Settings, Search, Menu, X, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/contacts', label: 'Contacts', icon: Users },
    { href: '/campaigns', label: 'Campaigns', icon: Target },
    { href: '/lists', label: 'Lists', icon: LayoutList },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-[100dvh] flex bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
        <div className="p-4 border-b border-border h-16 flex items-center">
          <h1 className="font-mono text-xl font-bold tracking-tight text-white">FILM<span className="text-primary">CRM</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
                  location === item.href || (item.href !== '/' && location.startsWith(item.href))
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <item.icon size={18} />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-border bg-card z-50 flex items-center justify-between px-4">
        <h1 className="font-mono text-xl font-bold tracking-tight text-white">FILM<span className="text-primary">CRM</span></h1>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-background z-40 p-4">
          <nav className="space-y-2">
            {navItems.map(item => (
              <Link key={item.href} href={item.href}>
                <div
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors cursor-pointer ${
                    location === item.href || (item.href !== '/' && location.startsWith(item.href))
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 md:pt-0 pt-16">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
