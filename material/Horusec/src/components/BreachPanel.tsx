import type { SensitiveAsset } from '../domain/types';

type Props = {
  selected: SensitiveAsset;
  breached: boolean;
};

export default function BreachPanel({ selected, breached }: Props) {
  return (
    <aside className={`breach-panel ${breached ? 'breached' : ''}`}>
      <div className="eyebrow">ANÁLISIS DE IMPACTO</div>
      <h2>{breached ? 'Escenario de filtración' : 'Activo seleccionado'}</h2>
      <div className="record-id">{selected.id} · {selected.category}</div>
      <p>{selected.sample}</p>
      <div className="impact-box">
        <strong>{breached ? 'Si un atacante obtiene este dato:' : 'Consecuencia potencial:'}</strong>
        <p>{selected.consequence}</p>
      </div>
      {breached && (
        <div className="catastrophe">
          <span>⚠</span>
          <div>
            <strong>La copia es irreversible.</strong>
            <p>Revocar una credencial no borra los datos que ya fueron exfiltrados, replicados o vendidos.</p>
          </div>
        </div>
      )}
    </aside>
  );
}
