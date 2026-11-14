import type { SensitiveAsset } from '../domain/types';

type Props = {
  assets: SensitiveAsset[];
  onSelect: (asset: SensitiveAsset) => void;
};

export default function AssetTable({ assets, onSelect }: Props) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Registro</th>
            <th>Persona</th>
            <th>Clase de dato</th>
            <th>Ejemplo</th>
            <th>Riesgo</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.id} onClick={() => onSelect(asset)}>
              <td className="mono">{asset.id}</td>
              <td>{asset.owner}</td>
              <td>{asset.category}</td>
              <td>{asset.sample}</td>
              <td><span className={`risk ${asset.risk.toLowerCase()}`}>{asset.risk}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
