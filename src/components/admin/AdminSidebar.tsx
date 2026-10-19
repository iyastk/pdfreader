'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  FolderOpen,
  Upload,
  FileText,
  LogOut,
  BookOpen,
  X,
  Menu,
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { href: '/admin/upload', label: 'Upload PDF', icon: Upload },
  { href: '/admin/documents', label: 'All Documents', icon: FileText },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [open, setOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-slate-700/50 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">SSLC Reader</p>
          <p className="text-xs text-slate-400">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                  : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-slate-700/50 px-4 py-4">
        <div className="mb-3 rounded-xl bg-slate-700/40 px-3 py-2.5">
          <p className="text-xs text-slate-400">Logged in as</p>
          <p className="truncate text-sm font-medium text-white">{user?.username}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-400 transition-all hover:bg-rose-900/30 hover:text-rose-300"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 shadow-lg lg:hidden"
      >
        <Menu className="h-5 w-5 text-white" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 bg-slate-900 transition-transform duration-300 lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden h-full w-64 flex-shrink-0 bg-slate-900 lg:block">
        <SidebarContent />
      </aside>
    </>
  );
}
