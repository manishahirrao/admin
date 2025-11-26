'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Users', href: '/users', icon: '👥' },
  { name: 'Orders', href: '/orders', icon: '📦' },
  {
    name: 'Content',
    icon: '📝',
    children: [
      { name: 'Banners', href: '/content/banners' },
      { name: 'Rituals', href: '/content/rituals' },
      { name: 'Holy Items', href: '/content/holy-items' },
    ],
  },
  {
    name: 'Partners',
    icon: '🏛️',
    children: [
      { name: 'Temples', href: '/partners/temples' },
      { name: 'Priests', href: '/partners/priests' },
    ],
  },
  { name: 'Analytics', href: '/analytics', icon: '📈' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { adminUser } = useAuth();

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-bold">Mandir Mitra</h2>
        <p className="text-sm text-gray-400">Admin Dashboard</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <div key={item.name}>
            {item.href ? (
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ) : (
              <>
                <div className="flex items-center gap-3 px-4 py-2 text-gray-400 text-sm font-semibold">
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </div>
                {item.children && (
                  <div className="ml-4 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                          pathname === child.href
                            ? 'bg-orange-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-semibold">
            {adminUser?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div>
            <p className="text-sm font-medium">{adminUser?.name || 'Admin User'}</p>
            <p className="text-xs text-gray-400 capitalize">
              {adminUser?.role?.replace('_', ' ') || 'Loading...'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
