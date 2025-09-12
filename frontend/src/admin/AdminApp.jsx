import React, { useState } from "react";
import Products from "./components/Products";
import Login from "./components/Login";

const AdminApp = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setLoggedIn(true);
  };

  return (
    <div>
      {loggedIn ? (
        <Products />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
};

export default AdminApp;
