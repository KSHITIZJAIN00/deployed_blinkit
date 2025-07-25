import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
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
  // Check if the user is an admin (You may want to fetch this from localStorage or user context)
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin Routes (only accessible if the user is an admin) */}
        {isAdmin && (
          <>
            <Route path="/admin" element={<Admin />} />
            <Route path="/add" element={<AddProduct />} />
            <Route path="/add-category" element={<AddCategory />} />
            <Route path="/add-subcategory" element={<AddSubCategory />} />
          </>
        )}
        <Route path="/track-order/:orderId" element={<TrackOrder />} />
        <Route path="/checkout" element={<Cheak />} /> {/* Fixed typo here */}
        <Route path="/order" element={<Order />} />
      </Routes>
    </Router>
  );
}

export default App;
