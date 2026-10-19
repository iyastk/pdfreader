'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, FolderOpen, Upload, FileText, LogOut, BookOpen, X, Menu,
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/admin',            label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/admin/categories', label: 'Categories',    icon: FolderOpen },
  { href: '/admin/upload',     label: 'Upload PDF',    icon: Upload },
  { href: '/admin/documents',  label: 'All Documents', icon: FileText },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <div className="flex h-full flex-col bg-slate-900">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-900/40">
          <BookOpen className="h-4.5 w-4.5 text-white" size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">SSLC Reader</p>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Admin Panel</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-900/30'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
              {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/60" />}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-slate-800 p-3 space-y-1">
        <div className="flex items-center gap-3 rounded-xl bg-slate-800/60 px-3.5 py-2.5">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[11px] font-bold text-white">
            {user?.username?.charAt(0).toUpperCase() ?? 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 font-medium">Logged in as</p>
            <p className="truncate text-xs font-semibold text-white">{user?.username}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-rose-400 transition-all hover:bg-rose-950/40 hover:text-rose-300 active:scale-[0.98]"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-700/60 shadow-lg shadow-slate-900/40 lg:hidden transition-all hover:bg-slate-800 active:scale-95"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-white" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 shadow-2xl shadow-slate-950/50 transition-transform duration-300 ease-out lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent onClose={() => setOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden h-full w-64 flex-shrink-0 shadow-xl shadow-slate-950/20 lg:block">
        <SidebarContent />
      </aside>
    </>
  );
}
