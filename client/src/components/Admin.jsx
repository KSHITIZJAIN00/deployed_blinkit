import React, { useState } from "react";
import "./Admin.css";
const Admin = () => {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  const handleAddCategory = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/categories", {  // Corrected the URL here
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image }),
      });
      if (response.ok) {
        alert("Category added successfully!");
        setName("");
        setImage("");
      } else {
        alert("Failed to add category.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="admin-container">
      <h2>Add Category</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddCategory();
        }}
      >
        <input
          type="text"
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />
        <button type="submit">Add Category</button>
      </form>
    </div>
  );
};

export default Admin;





