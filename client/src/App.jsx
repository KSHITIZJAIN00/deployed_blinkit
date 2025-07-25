import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";
import Admin from "./components/Admin";
import AddProduct from "./components/AddProduct";
import AddCategory from "./components/add-category";
import AddSubCategory from "./components/add-sub";
import Cheak from "./components/cheakout";
import Order from "./components/OrderPlaced";
import TrackOrder from "./components/TrackOrder";

import "./App.css";

function App() {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  return (
    <Router>
      <Routes>
        {/* Redirect root path */}
        <Route
          path="/"
          element={
            isLoggedIn ? <Navigate to="/home" /> : <Navigate to="/login" />
          }
        />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected home route */}
        <Route
          path="/home"
          element={isLoggedIn ? <Home /> : <Navigate to="/login" />}
        />

        {/* Admin Routes */}
        {isAdmin && (
          <>
            <Route path="/admin" element={<Admin />} />
            <Route path="/add" element={<AddProduct />} />
            <Route path="/add-category" element={<AddCategory />} />
            <Route path="/add-subcategory" element={<AddSubCategory />} />
          </>
        )}

        {/* Other routes */}
        <Route path="/track-order/:orderId" element={<TrackOrder />} />
        <Route path="/checkout" element={<Cheak />} />
        <Route path="/order" element={<Order />} />
      </Routes>
    </Router>
  );
}

export default App;
