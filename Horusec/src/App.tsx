import { useMemo, useState } from 'react';
import AssetTable from './components/AssetTable';
import BreachPanel from './components/BreachPanel';
import { assets, impactMetrics } from './data/demoData';
import type { SensitiveAsset } from './domain/types';
import { buildScenarioScore, createRecoverySession } from './services/riskSimulator';
import { cacheSelectedRecord } from './services/sensitiveCache';
import { broadcastRecord } from './services/frameBridge';

export default function App() {
  const [selected, setSelected] = useState<SensitiveAsset>(assets[0]);
  const [breached, setBreached] = useState(false);
  const [filter, setFilter] = useState('');
  const [session, setSession] = useState('sin iniciar');
  const [score, setScore] = useState(0);
  const [formula, setFormula] = useState('18 * 7 + 40');

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter((item) => `${item.owner} ${item.category} ${item.sample}`.toLowerCase().includes(q));
  }, [filter]);

  const selectAsset = (asset: SensitiveAsset) => {
    setSelected(asset);
    cacheSelectedRecord(asset);
    broadcastRecord(asset);
  };

  const startScenario = () => {
    setBreached(true);
    setSession(createRecoverySession());
    setScore(buildScenarioScore(formula));
  };

  return (
    <main className={breached ? 'app breach-mode' : 'app'}>
      <header className="topbar">
        <div className="brand-mark">AV</div>
        <div className="brand-copy">
          <strong>AEGIS VAULT</strong>
          <span>Critical Data Console</span>
        </div>
        <div className="top-status"><span className="pulse" /> entorno educativo · datos sintéticos</div>
      </header>

      <section className="hero">
        <div>
          <div className="eyebrow">SENSITIVE INFORMATION / SECURITY LAB</div>
          <h1>Un fallo pequeño puede exponer una vida entera.</h1>
          <p>
            Este sistema ficticio concentra información médica, financiera, personal y de acceso privilegiado.
            La interfaz muestra por qué una brecha no es “solo un bug”: puede transformarse en fraude, extorsión,
            suplantación y pérdida de control sobre sistemas críticos.
          </p>
          <div className="formula-row">
            <label htmlFor="formula">Fórmula de impacto</label>
            <input id="formula" value={formula} onChange={(event) => setFormula(event.target.value)} />
          </div>
          <div className="hero-actions">
            <button className="danger-button" onClick={startScenario}>Simular impacto de una brecha</button>
            <button className="ghost-button" onClick={() => setBreached(false)}>Restablecer escenario</button>
          </div>
          <div className="session-line">Sesión de recuperación: <span className="mono">{session}</span> · score de exposición: <strong>{score}</strong></div>
        </div>
        <div className="shield-card">
          <div className="shield">!</div>
          <strong>El dato sensible no se puede “desfiltrar”.</strong>
          <p>Una vez copiado fuera de la organización, la contención técnica ya no garantiza recuperar el control.</p>
        </div>
      </section>

      <section className="metric-grid">
        {impactMetrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <p>{metric.note}</p>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <div className="records-card">
          <div className="section-title-row">
            <div>
              <div className="eyebrow">DATOS BAJO CUSTODIA</div>
              <h2>Registros sintéticos de alta sensibilidad</h2>
            </div>
            <input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filtrar registros…" />
          </div>
          <AssetTable assets={filtered} onSelect={selectAsset} />
        </div>
        <BreachPanel selected={selected} breached={breached} />
      </section>

      <section className="warning-strip">
        <strong>Laboratorio SAST:</strong> esta aplicación contiene defectos intencionales para análisis estático. No debe publicarse ni reutilizarse como base de producción.
      </section>
    </main>
  );
}
