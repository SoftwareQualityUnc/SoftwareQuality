import "./ItemDetail.css";
import { formatPrice } from "../../utils/formatPrice";

function ItemDetail(props) {
  return (
    <div className="cardDetail">
      <div>
        <img
          className="cardImgDetail"
          src={props.img}
          alt={`Imagen de ${props.title || "producto"}`}
        />
      </div>
      <div className="cardDataDetail">
        <h2>{props.title}</h2>
        <p>{props.detail}</p>
        <h4>{formatPrice(props.price)}</h4>
      </div>
    </div>
  );
}

export default ItemDetail;
