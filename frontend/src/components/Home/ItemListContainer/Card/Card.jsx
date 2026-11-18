import { Link } from "react-router-dom";
import { formatPrice } from "../../../../utils/formatPrice";

import "./Card.css";

function Card({ id, img, inStock, price, stock, title }) {
  const productTitle = title || "Componente de informática";
  const stockLabel = inStock
    ? `En stock${
        stock > 0 ? ` · ${stock} ${stock === 1 ? "disponible" : "disponibles"}` : ""
      }`
    : "Sin stock";

  return (
    <article className="product-card">
      <div className="product-card__media">
        {img ? (
          <img
            alt={productTitle}
            className="product-card__image"
            decoding="async"
            loading="lazy"
            src={img}
          />
        ) : (
          <div aria-hidden="true" className="product-card__placeholder">
            <span>MVC</span>
          </div>
        )}
        <span
          className={`product-card__stock ${
            inStock ? "product-card__stock--available" : "product-card__stock--unavailable"
          }`}
        >
          {stockLabel}
        </span>
      </div>
      <div className="product-card__body">
        <div>
          <p className="product-card__category">Hardware de alto rendimiento</p>
          <h3>{productTitle}</h3>
        </div>
        <p className="product-card__price">{formatPrice(price)}</p>
        <Link
          aria-label={`Ver ${productTitle}`}
          className="product-card__link"
          to={`/detalle/${id}`}
        >
          Ver producto
        </Link>
      </div>
    </article>
  );
}

export default Card;
