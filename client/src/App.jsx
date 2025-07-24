import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./componets/Login";
import Signup from "./componets/Signup";
import Home from "./componets/Home";
import Admin from "./componets/Admin";
import AddProduct from "./componets/AddProduct";
import AddCategory from "./componets/add-category";
import AddSubCategory from "./componets/add-sub";
import Cheak from "./componets/cheakout";
import Order from "./componets/OrderPlaced";
import TrackOrder from "./componets/TrackOrder";
import Orders from "./componets/Orders";
import CategoryPage from "./componets/CategoryPage"; // ✅ NEW IMPORT

import "./App.css";
import { useState } from "react";

function App() {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const username = localStorage.getItem("username") || "";
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Mock cart total function (replace with your actual logic)
  const calculateTotal = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const addToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((item) => item._id === product._id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
  };

  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Category route */}
        <Route
          path="/category/:categoryId"
          element={
            <CategoryPage
              username={username}
              isAdmin={isAdmin}
              setIsCartOpen={setIsCartOpen}
              calculateTotal={calculateTotal}
              addToCart={addToCart}
            />
          }
        />

        {/* Admin-only routes */}
        {isAdmin && (
          <>
            <Route path="/admin" element={<Admin />} />
            <Route path="/add" element={<AddProduct />} />
            <Route path="/add-category" element={<AddCategory />} />
            <Route path="/add-subcategory" element={<AddSubCategory />} />
            <Route path="/orders" element={<Orders />} />
          </>
        )}

        <Route path="/track/:orderId" element={<TrackOrder />} />
        <Route path="/checkout" element={<Cheak />} />
        <Route path="/order" element={<Order />} />
      </Routes>
    </Router>
  );
}

export default App;
