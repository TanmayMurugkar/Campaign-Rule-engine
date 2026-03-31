import { useLocation, Link } from 'react-router-dom';
import { Bell, ChevronRight } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  '': 'Dashboard',
  campaigns: 'Campaigns',
  create: 'Create Campaign',
  edit: 'Edit Campaign',
  settings: 'Settings',
};

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; path: string }[] = [
    { label: 'Dashboard', path: '/' },
  ];

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label =
      ROUTE_LABELS[segment] ??
      (segment.startsWith('campaign-') ? `Campaign ${segment.slice(9)}` : segment);
    crumbs.push({ label, path: currentPath });
  }

  return crumbs;
}

export default function TopBar() {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <header
      className="flex items-center justify-between px-6 py-0 border-b"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border)',
        height: '60px',
      }}
    >
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.path} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight
                className="h-3.5 w-3.5"
                style={{ color: 'var(--text-secondary)' }}
              />
            )}
            {i === breadcrumbs.length - 1 ? (
              <span className="font-medium text-white">{crumb.label}</span>
            ) : (
              <Link
                to={crumb.path}
                className="hover:underline transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button
          className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        {/* User avatar placeholder */}
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white transition-opacity hover:opacity-80"
          style={{ backgroundColor: 'var(--accent-primary)' }}
          title="User menu"
        >
          T
        </button>
      </div>
    </header>
  );
}
