import ItemList from "./ItemList";
import "./ItemListContainer.css";

function ItemListContainer() {
  return (
    <section aria-labelledby="catalog-title" className="catalog">
      <div className="catalog__heading">
        <div>
          <p className="catalog__eyebrow">Selección para alto rendimiento</p>
          <h2 id="catalog-title">Explorá el catálogo</h2>
        </div>
        <p>Componentes y periféricos listos para tu próximo equipo.</p>
      </div>
      <ItemList />
    </section>
  );
}

export default ItemListContainer;
