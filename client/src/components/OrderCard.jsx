// OrderCard.jsx
import { useNavigate } from "react-router-dom";

const OrderCard = ({ orderId }) => {
  const navigate = useNavigate();

  const handleTrackOrder = () => {
    navigate(`/track-order/${orderId}`);
  };

  return (
    <button className="track-order-btn" onClick={handleTrackOrder}>
      Track Your Order
    </button>
  );
};

export default OrderCard;
