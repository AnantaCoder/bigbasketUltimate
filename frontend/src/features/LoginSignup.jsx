import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  loginUser,
  registerUser,
  verifyOtp,
  requestOTP,
  clearError,
} from "../app/slices/authSlice";

// --- Helper Components ---
const InfoIcon = ({ children, text }) => (
  <div className="flex flex-col items-center text-center">
    <div className="w-16 h-16 mb-2 rounded-full border border-gray-300 flex items-center justify-center">
      {children}
    </div>
    <span className="text-sm text-gray-700">{text}</span>
  </div>
);

const QualityIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-gray-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const OnTimeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-gray-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ReturnPolicyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-gray-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const FreeDeliveryIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-gray-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1}
  >
    <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 17h-5v-4h5l2 4z"
    />
  </svg>
);

const GooglePlayIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 512 512"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M325 234L104 56v400l221-178z" fill="#3BCCFF" />
    <path d="M104 56l221 178-221 178V56z" fill="#00A0FF" />
  </svg>
);

const AppleIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 512 512"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M349 150c-12 14-30 22-48 22-2-18 7-36 19-48 12-13 30-22 48-22 2 18-7 36-19 48z"
      fill="#000"
    />
    <path
      d="M256 400c-44 0-80-36-80-80 0-44 36-80 80-80 44 0 80 36 80 80 0 44-36 80-80 80z"
      fill="#000"
    />
  </svg>
);

const LoginSignupModal = ({ closeModal }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const { loading, error } = useSelector((state) => state.auth);

  // Local state
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [step, setStep] = useState("details"); // 'details' | 'otp'
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [otp, setOtp] = useState("");
  const [signupType, setSignupType] = useState("customer"); // 'customer' | 'seller'
  const [loginMethod, setLoginMethod] = useState("password"); // 'password' | 'otp'
  const [validationErrors, setValidationErrors] = useState({});

  // Validation function
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      errors.phone = "Please enter a valid 10-digit phone number";
    }
    if (!formData.password.trim()) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    return errors;
  };

  // Handlers
  const handleInputChange = (e) => {
    dispatch(clearError());
    setValidationErrors({});
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (e) => {
    dispatch(clearError());
    setOtp(e.target.value.replace(/\D/g, ""));
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setStep("details");
    setFormData({ email: "", password: "", firstName: "", lastName: "" });
    setOtp("");
    dispatch(clearError());
  };

  const toggleLoginMethod = () => {
    setLoginMethod(loginMethod === "password" ? "otp" : "password");
    setStep("details");
    setFormData({ email: "", password: "", firstName: "", lastName: "" });
    setOtp("");
    dispatch(clearError());
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    let result;
    if (loginMethod === "password") {
      result = await dispatch(
        loginUser({ email: formData.email, password: formData.password })
      );
    } else {
      // For OTP login
      if (step === "details") {
        // Request OTP
        const otpResult = await dispatch(requestOTP({ email: formData.email }));
        if (requestOTP.fulfilled.match(otpResult)) {
          setStep("otp");
        }
      } else {
        // Login with OTP
        result = await dispatch(loginUser({ email: formData.email, otp }));
      }
    }
    if (result && loginUser.fulfilled.match(result)) {
      closeModal();
      // Wait for user state update after login
      setTimeout(() => {
        const currentUser = JSON.parse(localStorage.getItem("user"));
        if (currentUser) {
          const role = currentUser.role || "customer";
          if (role === "admin") {
            navigate("/admin");
          } else if (role === "seller") {
            navigate("/seller/manage-items");
          } else if (role === "vendor") {
            navigate("/vendor/dashboard");
          } else {
            navigate("/");
          }
        } else {
          navigate("/");
        }
      }, 100);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    const result = await dispatch(
      registerUser({
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        is_seller: signupType === "seller",
      })
    );
    if (registerUser.fulfilled.match(result)) {
      // After successful registration, request OTP for verification
      const otpResult = await dispatch(requestOTP({ email: formData.email }));
      if (requestOTP.fulfilled.match(otpResult)) {
        setStep("otp");
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const result = await dispatch(verifyOtp({ email: formData.email, otp }));
    if (verifyOtp.fulfilled.match(result)) {
      closeModal();
      setTimeout(() => {
        const currentUser = JSON.parse(localStorage.getItem("user"));
        if (currentUser) {
          const role = currentUser.role || "customer";
          switch (role) {
            case "admin":
              navigate("/admin/dashboard");
              break;
            case "seller":
              navigate("/seller/manage-items");
              break;
            // Removed vendor case as per feedback
            default:
              navigate("/");
          }
        } else {
          navigate("/");
        }
      }, 100);
    }
  };

  // Render Error
  const renderError = () => {
    if (!error && Object.keys(validationErrors).length === 0) return null;

    let errorMessage = "";

    if (Object.keys(validationErrors).length > 0) {
      errorMessage = Object.values(validationErrors)[0];
    } else if (typeof error === "string") {
      errorMessage = error;
    } else if (error.detail) {
      errorMessage = error.detail;
    } else if (typeof error === "object" && error !== null) {
      // Handle field-specific errors like {email: ["error"]}
      const keys = Object.keys(error);
      if (keys.length > 0) {
        const firstKey = keys[0];
        const value = error[firstKey];
        errorMessage = `${firstKey}: ${
          Array.isArray(value) ? value[0] : value
        }`;
      }
    }

    return <p className="text-red-400 text-sm mt-2">{errorMessage}</p>;
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
      <div className="rounded-lg shadow-2xl overflow-hidden w-full max-w-4xl grid grid-cols-1 md:grid-cols-10 relative transform transition-all duration-300 ease-in-out scale-95">
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 z-10 md:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Left Info Section */}
        <div className="hidden md:block md:col-span-4 bg-gray-100 p-8 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-lg mb-2 text-yellow-800">
              Why choose Bigbasket?
            </h3>
            <div className="w-12 h-0.5 bg-yellow-600 mb-8"></div>
            <div className="grid grid-cols-2 gap-8 mb-8">
              <InfoIcon text="Quality">
                <QualityIcon />
              </InfoIcon>
              <InfoIcon text="On time">
                <OnTimeIcon />
              </InfoIcon>
              <InfoIcon text="Return Policy">
                <ReturnPolicyIcon />
              </InfoIcon>
              <InfoIcon text="Free Delivery">
                <FreeDeliveryIcon />
              </InfoIcon>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Find us on</span>
            <button
              aria-label="Google Play"
              className="p-2 border rounded-md hover:bg-gray-200"
            >
              <img src="/playstore.png" className="h-8 scale-170" />
            </button>
            <button
              aria-label="Apple Store"
              className="p-2 border rounded-md hover:bg-gray-200"
            >
              <img src="/apple.png" className="h-8 scale-100" />
            </button>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="md:col-span-6 p-8 sm:p-12 bg-black text-white flex flex-col justify-center">
          {step === "details" ? (
            mode === "login" ? (
              <>
                <h2 className="text-3xl font-bold mb-1">Login/ Sign up</h2>
                <p className="text-bg-white-500 mb-6">
                  {loginMethod === "password"
                    ? "Using Username & Password"
                    : "Using OTP"}
                </p>

                <form onSubmit={handleLogin}>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter Phone number/ Email Id"
                    required
                    className="w-full px-4 py-3 mb-4 rounded-md border-2 border-gray-600 bg-white text-black"
                  />
                  {loginMethod === "password" ? (
                    <input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter Password"
                      required
                      className="w-full px-4 py-3 mb-4 rounded-md border-2 border-gray-600 bg-white text-black"
                    />
                  ) : step === "otp" ? (
                    <>
                      <input
                        name="otp"
                        type="text"
                        value={otp}
                        onChange={handleOtpChange}
                        placeholder="Enter OTP"
                        maxLength="6"
                        required
                        className="w-full px-4 py-3 mb-4 rounded-md border-2 border-gray-600 bg-white text-black"
                      />
                      <button
                        type="button"
                        onClick={() => setStep("details")}
                        className="w-full mt-2 text-gray-400 text-sm hover:text-white"
                      >
                        Go Back
                      </button>
                    </>
                  ) : null}
                  {renderError()}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md disabled:bg-gray-500"
                  >
                    {loading
                      ? loginMethod === "otp" && step === "details"
                        ? "Sending OTP..."
                        : "Logging in..."
                      : loginMethod === "otp" && step === "details"
                      ? "Send OTP"
                      : "Continue"}
                  </button>
                  <p className="text-center mt-4 text-sm text-bg-white-400">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("signup")}
                      className="font-semibold underline"
                    >
                      Sign up
                    </button>
                  </p>
                  <p className="text-center mt-2 text-sm text-bg-white-400">
                    Or{" "}
                    <button
                      type="button"
                      onClick={toggleLoginMethod}
                      className="font-semibold underline"
                    >
                      {loginMethod === "password"
                        ? "Use OTP login"
                        : "Use Password login"}
                    </button>
                  </p>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-1">Sign up</h2>
                <p className="text-yellow-500 mb-6">Create your account</p>

                {/* Signup Type Selection */}
                <div className="mb-6 flex space-x-4">
                  {["customer", "seller"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSignupType(type)}
                      className={`flex-1 py-2 rounded-md font-semibold ${
                        signupType === type
                          ? "bg-white-600 text-white"
                          : "bg-gray-800 text-bg-white-400"
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleRegister}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="First Name"
                      required
                      className="px-4 py-3 bg-white text-gray-900 rounded-md border-2 border-gray-600"
                    />
                    <input
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Last Name"
                      required
                      className="px-4 py-3 bg-white text-gray-900 rounded-md border-2 border-gray-600"
                    />
                  </div>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter Email Id"
                    required
                    className="w-full px-4 py-3 mt-4 bg-white text-gray-900 rounded-md border-2 border-gray-600"
                  />
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter Phone Number"
                    required
                    className="w-full px-4 py-3 mt-4 bg-white text-gray-900 rounded-md border-2 border-gray-600"
                  />
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create Password"
                    required
                    className="w-full px-4 py-3 mt-4 bg-white text-gray-900 rounded-md border-2 border-gray-600"
                  />
                  {renderError()}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md disabled:bg-gray-500"
                  >
                    {loading ? "Sending OTP..." : "Continue"}
                  </button>
                  <p className="text-center mt-4 text-sm text-bg-white-400">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="font-semibold underline"
                    >
                      Login
                    </button>
                  </p>
                </form>
              </>
            )
          ) : (
            <>
              <h2 className="text-2xl font-bold">Verify with OTP</h2>
              <p className="text-gray-400 mb-2">Sent to {formData.email}</p>
              <form onSubmit={handleVerifyOtp}>
                <input
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="Enter OTP"
                  maxLength="6"
                  required
                  className="w-full px-4 py-3 text-center tracking-widest bg-white text-gray-900 rounded-md border-2 border-gray-600"
                />
                {renderError()}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-white-600 hover:bg-white-700 text-WHITE bg-red-600 font-bold py-3 px-4 rounded-md disabled:bg-gray-500"
                >
                  {loading ? "Verifying..." : "Verify & Proceed"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="w-full mt-4 text-gray-400 text-sm hover:text-white"
                >
                  Go Back
                </button>
              </form>
            </>
          )}
          <p className="text-xs text-gray-500 mt-8 text-center">
            By continuing, I accept TCP -{" "}
            <a href="#" className="underline">
              bigbasket&apos;s Terms and Conditions
            </a>{" "}
            &{" "}
            <a href="#" className="underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignupModal;
