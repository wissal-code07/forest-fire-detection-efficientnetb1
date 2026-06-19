import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('fr-DZ', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

export default function Dashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const lineRef  = useRef();
  const donutRef = useRef();
  const lineChart  = useRef(null);
  const donutChart = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await api.stats();
        setStats(s);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!stats) return;

    const loadChart = () => {
      if (!window.Chart) return;

      // Destroy previous instances
      if (lineChart.current)  lineChart.current.destroy();
      if (donutChart.current) donutChart.current.destroy();

      // ── Line chart — 7 days ───────────────────────────────────
      const days  = stats.last_7_days || [];
      const labels = days.map((d) => {
        const dt = new Date(d.date);
        return dt.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
      });

      lineChart.current = new window.Chart(lineRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Total',
              data: days.map((d) => d.total),
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59,130,246,.12)',
              fill: true,
              tension: 0.35,
              pointRadius: 4,
            },
            {
              label: 'Incendies',
              data: days.map((d) => d.fires),
              borderColor: '#FF4B1F',
              backgroundColor: 'rgba(255,75,31,.1)',
              fill: true,
              tension: 0.35,
              pointRadius: 4,
              borderDash: [5, 3],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            x: { ticks: { color: '#8B949E', font: { size: 11 } }, grid: { color: '#21262D' } },
            y: { ticks: { color: '#8B949E', font: { size: 11 }, stepSize: 1 }, grid: { color: '#21262D' } },
          },
        },
      });

      // ── Donut chart — fire vs no-fire ─────────────────────────
      donutChart.current = new window.Chart(donutRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Incendies', 'Aucun feu'],
          datasets: [{
            data: [stats.total_fires, stats.total_nofires],
            backgroundColor: ['#FF4B1F', '#22C55E'],
            borderColor: '#161B22',
            borderWidth: 3,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '68%',
          plugins: { legend: { display: false } },
        },
      });
    };

    if (window.Chart) {
      loadChart();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
      script.onload = loadChart;
      document.head.appendChild(script);
    }

    return () => {
      if (lineChart.current)  lineChart.current.destroy();
      if (donutChart.current) donutChart.current.destroy();
    };
  }, [stats]);

  if (loading) return <div className="spinner" />;
  if (error)   return <div className="error-box">⚠ {error}</div>;
  if (!stats)  return null;

  return (
    <div>
      <div className="page-header">
        <h2>Tableau de bord</h2>
        <p>Vue d'ensemble des analyses et détections</p>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Total analyses</div>
          <div className="value">{stats.total_analyses}</div>
          <div className="sub">dont {stats.analyses_today} aujourd'hui</div>
        </div>
        <div className="stat-card fire">
          <div className="label">Incendies détectés</div>
          <div className="value">{stats.total_fires}</div>
          <div className="sub">taux de {stats.fire_rate}%</div>
        </div>
        <div className="stat-card safe">
          <div className="label">Zones calmes</div>
          <div className="value">{stats.total_nofires}</div>
          <div className="sub">{(100 - stats.fire_rate).toFixed(1)}% du total</div>
        </div>
        <div className="stat-card">
          <div className="label">Confiance moyenne</div>
          <div className="value">{stats.avg_confidence}%</div>
          <div className="sub">modèle {stats.model_name}</div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Line chart */}
        <div className="card">
          <div style={{ marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Activité — 7 derniers jours</span>
            <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text2)' }}>
                <span style={{ width: 10, height: 3, background: '#3B82F6', display: 'inline-block', borderRadius: 2 }} />
                Total
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text2)' }}>
                <span style={{ width: 10, height: 3, background: '#FF4B1F', display: 'inline-block', borderRadius: 2 }} />
                Incendies
              </span>
            </div>
          </div>
          <div className="chart-wrap" style={{ height: 200 }}>
            <canvas ref={lineRef} role="img" aria-label="Graphique de l'activité des 7 derniers jours" />
          </div>
        </div>

        {/* Donut chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', alignSelf: 'flex-start', marginBottom: 14 }}>
            Répartition des résultats
          </span>
          <div className="chart-wrap" style={{ height: 180, width: '100%', maxWidth: 180, margin: '0 auto' }}>
            <canvas ref={donutRef} role="img" aria-label={`Répartition : ${stats.total_fires} incendies, ${stats.total_nofires} zones calmes`} />
          </div>
          <div style={{ display: 'flex', gap: 18, marginTop: 16 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <span style={{ width: 11, height: 11, background: '#FF4B1F', borderRadius: 3, display: 'inline-block' }} />
              <span style={{ color: 'var(--text2)' }}>Feu</span>
              <strong style={{ color: 'var(--text)' }}>{stats.total_fires}</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <span style={{ width: 11, height: 11, background: '#22C55E', borderRadius: 3, display: 'inline-block' }} />
              <span style={{ color: 'var(--text2)' }}>Calme</span>
              <strong style={{ color: 'var(--text)' }}>{stats.total_nofires}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid-2">
        {/* By wilaya */}
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Top wilayas — alertes</div>
          {(!stats.by_wilaya || stats.by_wilaya.length === 0) ? (
            <div className="empty" style={{ padding: '20px 0' }}>
              <p>Aucune donnée par wilaya</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.by_wilaya.map((w) => (
                <div key={w.wilaya} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, color: 'var(--text2)', width: 24 }}>{w.wilaya}</span>
                  <div style={{ flex: 1, height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      background: w.fires > 0 ? 'var(--fire)' : 'var(--safe)',
                      width: `${w.total > 0 ? Math.round((w.fires / w.total) * 100) : 0}%`,
                    }} />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text2)', minWidth: 40, textAlign: 'right' }}>
                    {w.fires}/{w.total}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Model info */}
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Informations du modèle</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <InfoRow label="Modèle" value={stats.model_name} />
            <InfoRow label="Précision" value={`${stats.model_accuracy}%`} highlight />
            <InfoRow label="Dernière alerte" value={formatDate(stats.last_alert)} />
            <InfoRow label="Analyses aujourd'hui" value={String(stats.analyses_today)} />
            <InfoRow label="Taux d'incendie" value={`${stats.fire_rate}%`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
      <span style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: highlight ? 'var(--safe)' : 'var(--text)' }}>{value}</span>
    </div>
  );
}
