import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/blinkit-logo.png";
import cart from "../assets/cart.png";
import "./or.css"; // Optional: create this for styling

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("https://deployed-blinkit-backend.onrender.com/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error("Failed to fetch orders:", err));
  }, []);

  return (
    <div className="orders-page">
      <header className="header">
        <img src={logo} alt="Logo" className="logo" />
        <div className="search-bar">
          <input type="text" placeholder="Search 'groceries'" />
        </div>
        <div className="header-actions">
          <button className="cart-button">
            <img src={cart} alt="Cart" />
            My Cart
          </button>
          <Link to="/add" className="add-product-icon">
            Add Product
          </Link>
        </div>
      </header>

      <div className="content">
       <aside className="side-panel">
                <div className="welcome-container">
                  <span className="welcome-text">Welcome</span>
                </div>
                <nav>
                  <ul>
                    <li>
                      <Link to="/">Home</Link>
                    </li>
                    <li>
                      <Link to="/add">Add Product</Link>
                    </li>
                    <li>
                      <Link to="/add-category">Add Category</Link>
                    </li>
                    <li>
                      <Link to="/add-subcategory">Add SubCategory</Link>
                    </li>
                    <li>
                        <Link to="/orders">Orders</Link>
                  </li>
                    <li>
                      <Link to="/login">Profile</Link>
                    </li>
                    <li>
                      <Link to="/login">Logout</Link>
                    </li>
                  </ul>
                </nav>
              </aside>

        <main className="main-content">
          <h2>New Orders</h2>
          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-details">
                    <p><strong>User:</strong> {order.user}</p>
                    <p><strong>Total:</strong> ₹{order.total.grandTotal.toFixed(2)}</p>
                    <p><strong>Date:</strong> {order.date}</p>
                  </div>
                  <hr />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Orders;
