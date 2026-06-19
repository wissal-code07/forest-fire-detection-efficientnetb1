import { useState, useEffect } from 'react';
import './index.css';
import Analyze   from './pages/Analyze';
import History   from './pages/History';
import Dashboard from './pages/Dashboard';
import Health    from './pages/Health';
import { api }   from './services/api';

const PAGES = [
  { id: 'analyze',   label: 'Analyser',    icon: '🔍' },
  { id: 'history',   label: 'Historique',  icon: '🗂️' },
  { id: 'dashboard', label: 'Dashboard',   icon: '📊' },
  { id: 'health',    label: 'Santé API',   icon: '🛡️' },
];

export default function App() {
  const [page, setPage]       = useState('analyze');
  const [apiStatus, setStatus] = useState('unknown');

  // Poll health status every 30s
  useEffect(() => {
    const check = async () => {
      try {
        const h = await api.health();
        setStatus(h.status);
      } catch {
        setStatus('degraded');
      }
    };
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, []);

  const render = () => {
    switch (page) {
      case 'analyze':   return <Analyze />;
      case 'history':   return <History />;
      case 'dashboard': return <Dashboard />;
      case 'health':    return <Health />;
      default:          return <Analyze />;
    }
  };

  return (
    <div className="app">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="flame">🔥</span>
          <div>
            <h1>FireGuard</h1>
            <span>Détection d'incendies</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {PAGES.map((p) => (
            <button
              key={p.id}
              className={`nav-item ${page === p.id ? 'active' : ''}`}
              onClick={() => setPage(p.id)}
            >
              <span className="icon">{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-status">
          <span className={`status-dot ${apiStatus}`} />
          <span style={{ color: 'var(--text2)', fontSize: 12 }}>
            {apiStatus === 'ok' ? 'API connectée' : apiStatus === 'degraded' ? 'API dégradée' : 'API inconnue'}
          </span>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="main">
        {render()}
      </main>
    </div>
  );
}
