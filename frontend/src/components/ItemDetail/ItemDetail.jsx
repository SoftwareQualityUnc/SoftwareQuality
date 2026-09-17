import "./ItemDetail.css";

function ItemDetail(props) {
  return (
    <div className="cardDetail">
      <div>
        <img className="cardImgDetail" src={props.img} alt="" />
      </div>
      <div className="cardDataDetail">
        <h2>{props.title}</h2>
        <p>{props.detail}</p>
        <h4>${props.price}</h4>
      </div>
    </div>
  );
}

export default ItemDetail;
