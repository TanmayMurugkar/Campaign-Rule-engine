import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import Dashboard from '@/pages/Dashboard';
import CampaignList from '@/pages/CampaignList';
import CampaignCreate from '@/pages/CampaignCreate';
import CampaignDetail from '@/pages/CampaignDetail';
import CampaignEdit from '@/pages/CampaignEdit';

function SettingsPage() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="card-base p-8 text-center max-w-md">
        <h2 className="text-lg font-display font-semibold text-foreground mb-2">Settings</h2>
        <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
          Field parameter and hierarchy configuration — coming soon
        </p>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="card-base p-8 text-center max-w-md">
        <h2 className="text-4xl font-display font-bold text-foreground mb-2">404</h2>
        <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-4">
          Page not found
        </p>
        <a href="/" style={{ color: 'var(--accent-primary)' }} className="text-sm hover:underline">
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/campaigns" element={<CampaignList />} />
          <Route path="/campaigns/create" element={<CampaignCreate />} />
          <Route path="/campaigns/:id" element={<CampaignDetail />} />
          <Route path="/campaigns/:id/edit" element={<CampaignEdit />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
