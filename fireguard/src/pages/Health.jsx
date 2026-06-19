import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Health() {
  const [health, setHealth]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const check = async () => {
    setLoading(true); setError(null);
    try {
      const h = await api.health();
      setHealth(h);
      setLastChecked(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { check(); }, []);

  const isOk = health?.status === 'ok';

  return (
    <div>
      <div className="page-header">
        <h2>État du système</h2>
        <p>Vérification du modèle et de l'API</p>
      </div>

      {error && <div className="error-box">⚠ Impossible de contacter l'API : {error}</div>}

      <div style={{ maxWidth: 560 }}>
        {/* Global status */}
        <div className={`result-card ${isOk ? 'safe' : 'fire'}`} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', align: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="result-title" style={{ fontSize: 16 }}>
                {loading ? 'Vérification…' : isOk ? '✅ Système opérationnel' : '⚠️ Système dégradé'}
              </div>
              {lastChecked && (
                <div className="text-muted" style={{ marginTop: 4 }}>
                  Vérifié à {lastChecked.toLocaleTimeString('fr-FR')}
                </div>
              )}
            </div>
            <button className="btn btn-ghost" onClick={check} disabled={loading}>
              {loading ? '…' : '↻ Rafraîchir'}
            </button>
          </div>
        </div>

        {/* Details */}
        {health && (
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Détails</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <DetailRow
                label="Modèle chargé"
                value={health.model_loaded ? 'Oui' : 'Non'}
                ok={health.model_loaded}
              />
              <DetailRow label="Modèle" value={health.model} ok />
              <DetailRow label="Framework" value={health.framework} ok />
              <DetailRow
                label="Périphérique de calcul"
                value={health.device?.toUpperCase()}
                ok
                highlight={health.device?.includes('cuda')}
                highlightLabel="GPU actif"
              />
              <DetailRow
                label="Statut API"
                value={health.status?.toUpperCase()}
                ok={health.status === 'ok'}
              />
            </div>
          </div>
        )}

        {/* GPU tip */}
        {health && !health.device?.includes('cuda') && (
          <div style={{
            marginTop: 16, padding: '12px 16px',
            background: 'rgba(245,158,11,.08)',
            border: '1px solid rgba(245,158,11,.25)',
            borderRadius: 'var(--radius)',
            fontSize: 13, color: 'var(--warn)',
          }}>
            💡 Le modèle tourne sur CPU. L'utilisation d'un GPU (CUDA) accélérerait l'inférence.
          </div>
        )}

        {/* Model missing tip */}
        {health && !health.model_loaded && (
          <div style={{
            marginTop: 16, padding: '14px 16px',
            background: 'rgba(255,75,31,.08)',
            border: '1px solid rgba(255,75,31,.25)',
            borderRadius: 'var(--radius)',
            fontSize: 13, color: 'var(--fire2)',
            lineHeight: 1.7,
          }}>
            ⚠️ Le fichier <code style={{ background: 'rgba(255,255,255,.08)', padding: '1px 6px', borderRadius: 4 }}>
              efficientnet_b1_deepfire.pth
            </code> est introuvable.<br />
            Placez-le dans le dossier <code style={{ background: 'rgba(255,255,255,.08)', padding: '1px 6px', borderRadius: 4 }}>
              ml_models/
            </code> et redémarrez le serveur Django.
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value, ok, highlight, highlightLabel }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      borderBottom: '1px solid var(--border)', paddingBottom: 12,
    }}>
      <span style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {highlight && (
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
            background: 'rgba(34,197,94,.15)', color: 'var(--safe)',
          }}>{highlightLabel}</span>
        )}
        <span style={{
          fontSize: 13, fontWeight: 600,
          color: ok ? 'var(--safe)' : 'var(--fire2)',
        }}>{value}</span>
      </div>
    </div>
  );
}
