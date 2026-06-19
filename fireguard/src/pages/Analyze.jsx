import { useState, useRef, useCallback } from 'react';
import { api } from '../services/api';
import { WILAYAS } from '../services/wilayas';

export default function Analyze() {
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [drag, setDrag]         = useState(false);
  const [meta, setMeta]         = useState({ wilaya: '', location_note: '', notes: '' });
  const inputRef = useRef();

  const selectFile = useCallback((f) => {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    setResult(null);
    setError(null);
    setPreview(URL.createObjectURL(f));
  }, []);

  const onDrop = (e) => {
    e.preventDefault(); setDrag(false);
    selectFile(e.dataTransfer.files[0]);
  };

  const onSubmit = async () => {
    if (!file) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await api.predict(file, meta);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null); setPreview(null); setResult(null); setError(null);
    setMeta({ wilaya: '', location_note: '', notes: '' });
  };

  const isFire = result?.alert;

  return (
    <div>
      <div className="page-header">
        <h2>Analyser une image</h2>
        <p>Envoyez une photo pour détecter la présence d'un incendie</p>
      </div>

      {error && <div className="error-box">⚠ {error}</div>}

      <div className="grid-2">
        {/* Left column — upload + form */}
        <div>
          {!file ? (
            <div
              className={`upload-area ${drag ? 'drag' : ''}`}
              onClick={() => inputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
            >
              <div className="icon-upload">🖼️</div>
              <p><strong>Cliquez ou glissez</strong> une image ici</p>
              <p style={{ fontSize: 12, marginTop: 6 }}>JPG · PNG · WebP · BMP — 10 Mo max</p>
              <input
                ref={inputRef} type="file" accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => selectFile(e.target.files[0])}
              />
            </div>
          ) : (
            <div>
              <div className="preview-wrap mb-16">
                <img src={preview} alt="Aperçu" />
                {result && (
                  <span className={`preview-badge ${isFire ? 'fire' : 'safe'}`}>
                    {isFire ? '🔥 FEU' : '✅ AUCUN FEU'}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Wilaya</label>
                <select
                  value={meta.wilaya}
                  onChange={(e) => setMeta({ ...meta, wilaya: e.target.value })}
                >
                  <option value="">— Sélectionner —</option>
                  {WILAYAS.map((w) => (
                    <option key={w.code} value={w.code}>{w.code} — {w.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Localisation précise</label>
                <input
                  type="text"
                  placeholder="Ex : forêt de Tikjda, zone nord"
                  value={meta.location_note}
                  onChange={(e) => setMeta({ ...meta, location_note: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  placeholder="Observations supplémentaires…"
                  value={meta.notes}
                  onChange={(e) => setMeta({ ...meta, notes: e.target.value })}
                />
              </div>

              <button
                className="btn btn-primary"
                onClick={onSubmit}
                disabled={loading}
              >
                {loading ? 'Analyse en cours…' : '🔍 Lancer l\'analyse'}
              </button>

              <button
                className="btn btn-ghost mt-16"
                style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
                onClick={reset}
              >
                Changer d'image
              </button>
            </div>
          )}
        </div>

        {/* Right column — result */}
        <div>
          {loading && (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div className="spinner" />
              <p className="text-muted" style={{ marginTop: 12 }}>
                EfficientNet-B1 analyse l'image…
              </p>
            </div>
          )}

          {result && !loading && (
            <div className={`result-card ${isFire ? 'fire' : 'safe'}`}>
              {isFire && (
                <div className="alert-pulse mb-16">
                  🔥 ALERTE INCENDIE
                </div>
              )}

              <div className="result-title">
                {isFire ? '⚠️ Incendie détecté' : '✅ Aucun incendie'}
              </div>
              <p className="text-muted" style={{ marginBottom: 16, marginTop: 4 }}>
                Classe : <strong style={{ color: 'var(--text)' }}>{result.label?.toUpperCase()}</strong>
                {' · '} Analyse #{result.id}
              </p>

              <div className="confidence-bar-wrap">
                <div className="confidence-bar-label">
                  <span>Confiance</span>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="confidence-bar">
                  <div
                    className="confidence-bar-fill"
                    style={{ width: `${(result.confidence * 100).toFixed(1)}%` }}
                  />
                </div>
              </div>

              <div className="prob-grid">
                <div className={`prob-box fire`}>
                  <div className="plabel">Probabilité feu</div>
                  <div className="pval">{(result.prob_fire * 100).toFixed(1)}%</div>
                </div>
                <div className={`prob-box safe`}>
                  <div className="plabel">Probabilité calme</div>
                  <div className="pval">{(result.prob_nofire * 100).toFixed(1)}%</div>
                </div>
              </div>

              <hr className="divider" />
              <div className="text-muted" style={{ fontSize: 12 }}>
                Seuil de décision : {(result.threshold * 100).toFixed(0)}%
                {result.wilaya_name && ` · ${result.wilaya_name}`}
              </div>
            </div>
          )}

          {!result && !loading && (
            <div className="card">
              <div className="empty">
                <div className="icon">🔥</div>
                <p>Le résultat apparaîtra ici après l'analyse</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
