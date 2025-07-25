import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import logo from "../assets/blinkit-logo.png";
import cartIcon from "../assets/cart.png";
import confirmationGif from "../assets/Animation - 1738440257841.gif";
import soundFile from "../assets/videoplayback.mp3";
import "./orders.css";

export default function OrderPlaced() {
  const [orderDetails, setOrderDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [showGif, setShowGif] = useState(false);
  const [showOrderText, setShowOrderText] = useState(false);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve orderDetails and formData from localStorage
    const storedOrder = localStorage.getItem("orderDetails");
    const storedUser = localStorage.getItem("formData");
    const storedTotal = localStorage.getItem("total");

    if (storedOrder) setOrderDetails(JSON.parse(storedOrder));
    if (storedUser) setUserDetails(JSON.parse(storedUser));

    if (storedTotal) {
      const { subtotal, total, shipping } = JSON.parse(storedTotal);
      setOrderDetails((prev) => ({
        ...prev,
        total: {
          ...prev?.total,
          subtotal,
          grandTotal: total,
          shipping,
        },
      }));
    }

    // Play confirmation sound
    const sound = new Audio(soundFile);
    setTimeout(() => {
      sound.play().catch((error) => {
        console.error("Audio playback error:", error);
      });
    }, 1000);

    // Show order confirmation text
    setTimeout(() => {
      setShowOrderText(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1000);

    // Show gif
    setTimeout(() => {
      setShowGif(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1200);
  }, []);

  // Send order data to backend
  useEffect(() => {
    if (orderDetails && userDetails) {
      fetch("https://deployed-blinkit-backend.onrender.com/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: `${userDetails.firstName} ${userDetails.lastName}`,
          email: userDetails.email,
          address: userDetails.address,
          items: cart,
          total: orderDetails.total,
          orderId: orderDetails.orderId,
          date: orderDetails.date,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Order sent to admin:", data);
          localStorage.setItem("orderPlaced", "true");
        })
        .catch((err) => console.error("Failed to notify admin:", err));
    }
  }, [orderDetails, userDetails, cart]);

  useEffect(() => {
    if (cart.length) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  const handleTrackOrder = () => {
    if (orderDetails && orderDetails.orderId) {
      // Use correct route
      navigate(`/track-order/${orderDetails.orderId}`);
    } else {
      console.error("Order ID is missing");
    }
  };

  const downloadInvoice = () => {
    const doc = new jsPDF();
    const margin = 20;
    let yPos = margin;

    doc.addImage(logo, "PNG", doc.internal.pageSize.width - 90, yPos, 70, 70);
    doc.setFontSize(30);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", margin, yPos + 30);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice #: ${orderDetails.orderId}`, margin, yPos + 45);
    yPos += 60;
    doc.text(
      `Date: ${orderDetails.date}`,
      doc.internal.pageSize.width - margin - 80,
      yPos
    );
    doc.text(
      `Due Date: ${orderDetails.date}`,
      doc.internal.pageSize.width - margin - 80,
      yPos + 10
    );
    yPos += 30;
    doc.setFont("helvetica", "bold");
    doc.text("Billed To:", margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(
      `${userDetails.firstName} ${userDetails.lastName}`,
      margin,
      yPos + 10
    );
    doc.text(userDetails.email, margin, yPos + 20);
    doc.text(userDetails.address, margin, yPos + 30);
    yPos += 50;

    const tableHeaders = ["Product", "Quantity", "Price", "Total"];
    const columnWidths = [60, 30, 30, 30];
    const startX = margin;

    doc.setFillColor(240, 240, 240);
    doc.rect(
      startX,
      yPos - 5,
      doc.internal.pageSize.width - 2 * margin,
      10,
      "F"
    );
    doc.setFont("helvetica", "bold");
    let xPos = startX;
    tableHeaders.forEach((header, index) => {
      doc.text(header, xPos, yPos);
      xPos += columnWidths[index];
    });
    yPos += 15;
    doc.setFont("helvetica", "normal");
    cart.forEach((item) => {
      xPos = startX;
      doc.text(item.name, xPos, yPos);
      doc.text(item.quantity.toString(), xPos + columnWidths[0], yPos);
      doc.text(
        `₹${item.price.toFixed(2)}`,
        xPos + columnWidths[0] + columnWidths[1],
        yPos
      );
      doc.text(
        `₹${(item.price * item.quantity).toFixed(2)}`,
        xPos + columnWidths[0] + columnWidths[1] + columnWidths[2],
        yPos
      );
      yPos += 9;
    });

    yPos += 15;
    const totalX =
      startX + columnWidths[0] + columnWidths[1] + columnWidths[2];
    doc.setFont("Arial", "bold");
    doc.text("Subtotal", totalX - 40, yPos);
    doc.text(`₹${orderDetails.total.subtotal.toFixed(2)}`, totalX, yPos);

    yPos += 7;
    doc.text("Tax", totalX - 40, yPos);
    doc.text(
      `₹${(
        orderDetails.total.grandTotal - orderDetails.total.subtotal
      ).toFixed(2)}`,
      totalX,
      yPos
    );

    yPos += 7;
    doc.setFontSize(14);
    doc.text("Total", totalX - 40, yPos);
    doc.text(`₹${orderDetails.total.grandTotal.toFixed(2)}`, totalX, yPos);
    yPos += 15;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Thank you for shopping with Blinkit!", margin, yPos);
    doc.text(
      "For any questions or concerns, please contact our customer support.",
      margin,
      yPos + 7
    );

    doc.save("invoice.pdf");
  };

  return (
    <div className="order-placed-container">
      <header className="header">
        <div className="left-section">
          <a href="/">
            <img
              src={logo || "/placeholder.svg"}
              alt="Blinkit Logo"
              className="logo"
            />
          </a>
          <div className="delivery-info">
            <strong>Delivery in 9 minutes</strong>
            <span>Mathura, Uttar Pradesh, India</span>
          </div>
        </div>
        <div className="search-bar">
          <input type="text" placeholder='Search "egg"' />
        </div>
        <div className="header-actions">
          <button className="login-button">Login</button>
          <button className="cart-button">
            <img
              src={cartIcon || "/placeholder.svg"}
              alt="Cart"
              aria-label="Cart"
            />
            My Cart
          </button>
        </div>
      </header>

      <main className="order-summary-container">
        <div className="order-details-container">
          <div className="order-confirmation">
            {showOrderText && <h2>Your Order is Placed</h2>}
            {showGif && (
              <img
                src={confirmationGif || "/placeholder.svg"}
                alt="Order Confirmation"
                className="confim"
              />
            )}
          </div>

          <div className="order-summary-details">
            <div className="order-summary-card">
              <div className="total">
                <span>Total</span>
                <span>
                  ₹{" "}
                  {orderDetails?.total?.grandTotal?.toFixed(2) || "Loading..."}
                </span>
              </div>
              <div className="subtotal">
                <span>Subtotal</span>
                <span>
                  ₹ {orderDetails?.total?.subtotal?.toFixed(2) || "Loading..."}
                </span>
              </div>
              <div className="shipping">
                <span>Shipping</span>
                <span>
                  ₹{" "}
                  {orderDetails?.total?.shipping?.toFixed(2) || "Loading..."}
                </span>
              </div>
            </div>
          </div>

          <div className="order-product-list">
            {cart?.map((item, index) => (
              <div key={index} className="order-product-card">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="order-product-image"
                />
                <div className="order-product-info">
                  <h3>{item.name}</h3>
                  <p>Quantity: {item.quantity}</p>
                  <p className="price">₹ {item.price}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="track-order-container">
            <button className="track-order-button" onClick={handleTrackOrder}>
              Track Your Order
            </button>
            <button
              className="download-invoice-button"
              onClick={downloadInvoice}
            >
              Download Invoice
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
