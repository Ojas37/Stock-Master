'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Package, FileText, Warehouse, History, Settings, User, LogOut, ChevronRight, Bot } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface UserData {
  name: string;
  email: string;
  role?: string;
}

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'AI Assistant', href: '/ai-chat', icon: Bot, badge: 'NEW' },
  { name: 'Products', href: '/products', icon: Package },
  {
    name: 'Operations',
    icon: FileText,
    children: [
      { name: 'Receipts', href: '/operations/receipts' },
      { name: 'Delivery Orders', href: '/operations/deliveries' },
      { name: 'Internal Transfers', href: '/operations/transfers' },
      { name: 'Physical Count & Adjustments', href: '/operations/adjustments' },
    ],
  },
  { name: 'Warehouses & Locations', href: '/warehouses', icon: Warehouse },
  { name: 'Stock Ledger', href: '/stock-ledger', icon: History },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Profile', href: '/profile', icon: User },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    // Get user data from localStorage
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
        } catch (error) {
          console.error('Failed to parse user data:', error);
          // If parsing fails, redirect to login
          router.push('/login');
        }
      } else {
        // No user data, redirect to login
        router.push('/login');
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">StockMaster</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.name || 'Guest'}
              </span>
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 fixed h-full overflow-y-auto">
          <div className="py-6 px-4">
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                if (item.children) {
                  return (
                    <div key={item.name}>
                      <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700">
                        {item.icon && <item.icon className="w-5 h-5" />}
                        {item.name}
                      </div>
                      <div className="ml-8 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                              pathname === child.href
                                ? 'bg-gray-100 text-gray-900 font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href!}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname === item.href
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.icon && <item.icon className="w-5 h-5" />}
                    {item.name}
                    {(item as any).badge && (
                      <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-purple-600 text-white rounded-full">
                        {(item as any).badge}
                      </span>
                    )}
                  </Link>
                );
              })}
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors w-full"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
