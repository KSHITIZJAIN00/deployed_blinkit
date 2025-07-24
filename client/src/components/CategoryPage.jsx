
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import cartIcon from "../assets/cart.png";
import logo from "../assets/blinkit-logo.png";

import "./CategoryPage.css";

const CategoryPage = ({ username, isAdmin, setIsCartOpen, calculateTotal, addToCart }) => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/category/${categoryId}/details`);
        const text = await res.text();

        if (text.startsWith("<!DOCTYPE html")) {
          console.error("❌ Received HTML instead of JSON. Probably hitting frontend server.");
          return;
        }

        const data = JSON.parse(text);

        setCategory(data.category);
        setSubcategories(data.subcategories);
        setProducts(data.products);
      } catch (err) {
        console.error("Failed to fetch category data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [categoryId]);

  if (loading) return <div>Loading category data...</div>;
  if (!category) return <div>Category not found.</div>;

  return (
    <>
      <header className="header">
        <div className="left-section">
          <Link to="/">
            <img src={logo} alt="Blinkit Logo" className="logo" />
          </Link>
          <div className="delivery-info">
            <strong>Delivery in 9 minutes</strong>
            <span>Mathura, Uttar Pradesh, India</span>
          </div>
        </div>
        <div className="search-bar">
          <input type="text" placeholder='Search "egg"' />
        </div>
        <div className="header-actions">
          {isAdmin ? (
            <div className="user-info">
              <span className="username-display">Welcome, Admin</span>
            </div>
          ) : username ? (
            <div className="user-info">
              <span className="username-display">Welcome, {username}</span>
            </div>
          ) : (
            <button className="login-button" onClick={() => navigate("/login")}>
              Login
            </button>
          )}

          {!isAdmin && (
            <button className="cart-button" onClick={() => setIsCartOpen(prev => !prev)}>
              <img src={cartIcon} alt="Cart" className="cart-icon" />
              <span>My Cart • ₹{calculateTotal().toFixed(2)}</span>
            </button>
          )}

          {isAdmin && (
            <div className="admin-actions">
              <button type="button" className="control-button" onClick={() => navigate("/add-category")}>
                Control
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="category-page">
        <aside className="subcategory-sidebar">
          {subcategories.map((sub) => (
            <div key={sub._id} className="subcategory-item">
              {sub.name}
            </div>
          ))}
        </aside>

        <section className="product-list">
          <h2 className="category-title">{category.name}</h2>
          <div className="product-cards">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                <img
  src={
    product.image?.data
      ? `data:${product.image.contentType};base64,${product.image.data}`
      : "/placeholder.svg"
  }
  alt={product.name}
  className="product-image"
/>


                <p className="product-name">{product.name}</p>
                <p className="product-description">{product.description}</p>
                <div className="product-actions">
                  <p className="product-price">₹{product.price}</p>
                  <button className="add-button" onClick={() => addToCart(product)}>
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default CategoryPage;
