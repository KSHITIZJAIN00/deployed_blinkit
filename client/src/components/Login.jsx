// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate, Link } from "react-router-dom";
// import "./login.css";
// import logo from "../assets/blinkit-logo.png";
// import cart from "../assets/cart.png";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [message, setMessage] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     document.body.classList.add("login-signup");
//     return () => {
//       document.body.classList.remove("login-signup");
//     };
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Clear any old session data
//     localStorage.removeItem("isLoggedIn");
//     localStorage.removeItem("isAdmin");
//     localStorage.removeItem("email");
//     localStorage.removeItem("username");

//     try {
//       const response = await axios.post(
//         "https://deployed-blinkit-backend.onrender.com/api/auth/login",
//         { email, password }
//       );

//       console.log("Response from server:", response.data);
//       setMessage(response.data.message);

//       if (response.status === 200 && response.data.user) {
//         const { isAdmin, email } = response.data.user;

//         // Save data to localStorage
//         localStorage.setItem("isAdmin", isAdmin);
//         localStorage.setItem("email", email);

//         const username = email
//           .split("@")[0]
//           .replace(/[0-9]/g, "")
//           .split(/[.\-_]/)[0];
//         localStorage.setItem("username", username);

//         // Mark user as logged in
//         localStorage.setItem("isLoggedIn", "true");

//         // Redirect to /home
//         navigate("/home");
//       } else {
//         setMessage("User data not found in the response");
//       }
//     } catch (error) {
//       console.error("Error during login:", error);
//       setMessage(error.response?.data?.message || "An error occurred");
//     }
//   };

//   return (
//     <div className="login-page">
//       <header className="header">
//         <img src={logo} alt="Logo" className="logo" />
//         <div className="search-bar">
//           <input type="text" placeholder="Search 'egg'" />
//         </div>
//         <button className="cart-button">
//           <img src={cart} alt="cart" />
//           My Cart
//         </button>
//       </header>
//       <div className="login-container">
//         <h1>Login</h1>
//         <form onSubmit={handleSubmit}>
//           <div className="input-group">
//             <label htmlFor="email">Email:</label>
//             <input
//               type="email"
//               id="email"
//               placeholder="Enter your email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>
//           <div className="input-group">
//             <label htmlFor="password">Password:</label>
//             <input
//               type="password"
//               id="password"
//               placeholder="Enter your password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>
//           <button className="login-button" type="submit">
//             Login
//           </button>
//         </form>
//         <p>{message}</p>
//         <p>
//           Don't have an account? <Link to="/signup">Sign up</Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";
import logo from "../assets/blinkit-logo.png";
import cart from "../assets/cart.png";

const Login = () => {
  const [step, setStep] = useState(1); // 1 = email input, 2 = OTP input
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("login-signup");
    return () => {
      document.body.classList.remove("login-signup");
    };
  }, []);

  // Step 1: Request OTP
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(
        "https://deployed-blinkit-backend.onrender.com/api/auth/login",
        { email }
      );

      if (res.status === 200) {
        setMessage(res.data.message || "OTP sent to your email.");
        setStep(2);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Error logging in");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(
        "https://deployed-blinkit-backend.onrender.com/api/auth/verify-otp",
        { email, otp }
      );

      if (res.status === 200 && res.data.user) {
        const { isAdmin, email: userEmail } = res.data.user;

        localStorage.setItem("isAdmin", isAdmin);
        localStorage.setItem("email", userEmail);
        localStorage.setItem("isLoggedIn", "true");

        // Create display name from email (remove numbers & split at special chars)
        const username = userEmail
          .split("@")[0]
          .replace(/[0-9]/g, "")
          .split(/[.\-_]/)[0];
        localStorage.setItem("username", username);

        navigate("/home");
      } else {
        setMessage("Invalid OTP. Please try again.");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Header */}
      <header className="header">
        <img src={logo} alt="Logo" className="logo" />
        <div className="search-bar">
          <input type="text" placeholder="Search 'egg'" />
        </div>
        <button className="cart-button">
          <img src={cart} alt="cart" />
          My Cart
        </button>
      </header>

      {/* Login / OTP Container */}
      <div className="login-container">
        {step === 1 ? (
          <>
            <h1>Login</h1>
            <form onSubmit={handleLoginSubmit}>
              <div className="input-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button className="login-button" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
            {message && <p className="status-message">{message}</p>}
            <p>
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </>
        ) : (
          <>
            <h1>Enter OTP</h1>
            <form onSubmit={handleOtpSubmit}>
              <div className="input-group">
                <label htmlFor="otp">OTP:</label>
                <input
                  type="text"
                  id="otp"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <button className="login-button" type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
            {message && <p className="status-message">{message}</p>}
            <p>
              Didn't get OTP?{" "}
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setMessage("");
                }}
              >
                Resend
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
