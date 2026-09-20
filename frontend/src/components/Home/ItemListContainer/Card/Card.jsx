import { Link } from "react-router-dom";


import "./Card.css";

function Card(props) {
  
  return (
    <div className="card">
    <div>
      <img className="cardImg" src={props?.img} alt="Error al cargar imagen" />
    </div>
    <div className="card-content">
      <div className="cardTitles">
      <h3 className="card-title">{props?.title}</h3>
      <h4 className="card-price">Precio: ${props?.price}</h4>
      </div>
      <Link to={`/detalle/${props?.id}`} className="card-button">
        Ver más
      </Link>
    </div>
  </div>
  );
}

export default Card;
