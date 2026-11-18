'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Search, Download, CheckCircle2, GraduationCap } from 'lucide-react';
import { useSearch } from '@/context/SearchContext';
import { usePWA } from '@/context/PWAContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { openSearch } = useSearch();
  const { isInstalled, promptInstall } = usePWA();

  // Hide on admin routes and while reading a document to maximize reading viewport
  if (pathname.startsWith('/admin') || pathname.startsWith('/read')) {
    return null;
  }

  const isHomeActive = pathname === '/';
  const isCategoryActive = pathname.startsWith('/category');
  const isHubActive = pathname.startsWith('/portal');

  // Common button/link style to guarantee 100% width & center alignment even without any CSS file
  const itemStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    padding: '4px 0',
    textDecoration: 'none',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = (active: boolean): React.CSSProperties => ({
    fontSize: '10.5px',
    fontWeight: '700',
    lineHeight: '1',
    marginTop: '3px',
    textAlign: 'center',
    color: active ? '#4338ca' : '#64748b',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  });

  const activeBar: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    height: '3px',
    width: '30px',
    borderRadius: '999px',
    backgroundColor: '#4f46e5',
  };

  return (
    <nav
      role="navigation"
      aria-label="Mobile Bottom Navigation"
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 9999,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.06)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          width: '100%',
          maxWidth: '520px',
          height: '56px',
          margin: '0 auto',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
      >
        {/* 1. Home */}
        <Link href="/" style={itemStyle} aria-label="Home">
          {isHomeActive && !isCategoryActive && !isHubActive && <span style={activeBar} />}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              padding: '3px 8px',
              backgroundColor: isHomeActive && !isCategoryActive && !isHubActive ? '#eef2ff' : 'transparent',
              color: isHomeActive && !isCategoryActive && !isHubActive ? '#4f46e5' : '#64748b',
            }}
          >
            <Home size={20} strokeWidth={isHomeActive && !isCategoryActive && !isHubActive ? 2.5 : 1.9} />
          </div>
          <span style={labelStyle(isHomeActive && !isCategoryActive && !isHubActive)}>Home</span>
        </Link>

        {/* 2. Subjects */}
        <Link href="/#subjects" style={itemStyle} aria-label="Subjects">
          {isCategoryActive && <span style={activeBar} />}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              padding: '3px 8px',
              backgroundColor: isCategoryActive ? '#eef2ff' : 'transparent',
              color: isCategoryActive ? '#4f46e5' : '#64748b',
            }}
          >
            <BookOpen size={20} strokeWidth={isCategoryActive ? 2.5 : 1.9} />
          </div>
          <span style={labelStyle(isCategoryActive)}>Subjects</span>
        </Link>

        {/* 3. SSLC Hub / Portal */}
        <Link href="/portal" style={itemStyle} aria-label="SSLC Resource Hub">
          {isHubActive && <span style={activeBar} />}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              padding: '3px 8px',
              backgroundColor: isHubActive ? '#eef2ff' : 'transparent',
              color: isHubActive ? '#4f46e5' : '#64748b',
            }}
          >
            <GraduationCap size={21} strokeWidth={isHubActive ? 2.5 : 1.9} />
            <span
              style={{
                position: 'absolute',
                top: '2px',
                right: '4px',
                width: '6px',
                height: '6px',
                borderRadius: '999px',
                backgroundColor: '#4f46e5',
                border: '1.5px solid #ffffff',
              }}
            />
          </div>
          <span style={labelStyle(isHubActive)}>Hub</span>
        </Link>

        {/* 4. Global Search */}
        <button type="button" onClick={openSearch} style={itemStyle} aria-label="Search study materials">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              padding: '3px 8px',
              color: '#64748b',
            }}
          >
            <Search size={20} strokeWidth={1.9} />
          </div>
          <span style={labelStyle(false)}>Search</span>
        </button>

        {/* 5. Install App Button */}
        <button
          type="button"
          onClick={promptInstall}
          style={itemStyle}
          aria-label={isInstalled ? 'App is installed' : 'Install SSLC Reader App'}
        >
          {isInstalled ? (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  padding: '3px 8px',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                }}
              >
                <CheckCircle2 size={20} strokeWidth={2.2} />
              </div>
              <span style={{ ...labelStyle(false), color: '#059669' }}>Installed</span>
            </>
          ) : (
            <>
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  padding: '3px 8px',
                  backgroundColor: '#eef2ff',
                  color: '#4f46e5',
                }}
              >
                <Download size={20} strokeWidth={2.2} />
                <span
                  style={{
                    position: 'absolute',
                    top: '1px',
                    right: '3px',
                    width: '7px',
                    height: '7px',
                    borderRadius: '999px',
                    backgroundColor: '#ef4444',
                    border: '1.5px solid #ffffff',
                  }}
                />
              </div>
              <span style={{ ...labelStyle(true), color: '#4338ca' }}>Install</span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
}
