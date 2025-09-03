import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser, verifyOtp, clearError } from "../app/slices/authSlice";

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
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const OnTimeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ReturnPolicyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const FreeDeliveryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 17h-5v-4h5l2 4z" />
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
  });
  const [otp, setOtp] = useState("");

  // Handlers
  const handleInputChange = (e) => {
    dispatch(clearError());
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

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ email: formData.email, password: formData.password }));
    if (loginUser.fulfilled.match(result)) {
      closeModal();
      navigate("/home");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      registerUser({
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
      })
    );
    if (registerUser.fulfilled.match(result)) {
      setStep("otp");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const result = await dispatch(verifyOtp({ email: formData.email, otp }));
    if (verifyOtp.fulfilled.match(result)) {
      closeModal();
      navigate("/home");
    }
  };

  // Render Error
  const renderError = () =>
    error ? <p className="text-red-400 text-sm mt-2">{error.detail || error}</p> : null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden w-full max-w-4xl grid grid-cols-1 md:grid-cols-10 relative transform transition-all duration-300 ease-in-out scale-95">
        {/* Close Button */}
        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 z-10 md:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Left Info Section */}
        <div className="hidden md:block md:col-span-4 bg-gray-50 p-8">
          <h3 className="font-semibold text-lg mb-2">Why choose Bigbasket?</h3>
          <div className="w-12 h-0.5 bg-red-500 mb-8"></div>
          <div className="grid grid-cols-2 gap-8 mb-8">
            <InfoIcon text="Quality"><QualityIcon /></InfoIcon>
            <InfoIcon text="On time"><OnTimeIcon /></InfoIcon>
            <InfoIcon text="Return Policy"><ReturnPolicyIcon /></InfoIcon>
            <InfoIcon text="Free Delivery"><FreeDeliveryIcon /></InfoIcon>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="md:col-span-6 p-8 sm:p-12 text-white flex flex-col justify-center">
          {step === "details" ? (
            mode === "login" ? (
              <>
                <h2 className="text-2xl font-bold">Login</h2>
                <p className="text-gray-400 mb-2">Welcome back!</p>
                <form onSubmit={handleLogin}>
                  <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Enter Email Id" required className="w-full px-4 py-3 mb-4 bg-white text-gray-900 rounded-md border-2 border-gray-600" />
                  <input name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Enter Password" required className="w-full px-4 py-3 mb-4 bg-white text-gray-900 rounded-md border-2 border-gray-600" />
                  {renderError()}
                  <button type="submit" disabled={loading} className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md disabled:bg-gray-500">
                    {loading ? "Logging in..." : "Login"}
                  </button>
                  <p className="text-center mt-4 text-sm text-gray-400">
                    Don&apos;t have an account?{" "}
                    <button type="button" onClick={() => switchMode("signup")} className="font-semibold text-red-400 hover:text-red-300">
                      Sign up
                    </button>
                  </p>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold">Sign up</h2>
                <p className="text-gray-400 mb-2">Create your account</p>
                <form onSubmit={handleRegister}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input name="firstName" type="text" value={formData.firstName} onChange={handleInputChange} placeholder="First Name" required className="px-4 py-3 bg-white text-gray-900 rounded-md border-2 border-gray-600" />
                    <input name="lastName" type="text" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name" required className="px-4 py-3 bg-white text-gray-900 rounded-md border-2 border-gray-600" />
                  </div>
                  <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Enter Email Id" required className="w-full px-4 py-3 mt-4 bg-white text-gray-900 rounded-md border-2 border-gray-600" />
                  <input name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Create Password" required className="w-full px-4 py-3 mt-4 bg-white text-gray-900 rounded-md border-2 border-gray-600" />
                  {renderError()}
                  <button type="submit" disabled={loading} className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md disabled:bg-gray-500">
                    {loading ? "Sending OTP..." : "Continue"}
                  </button>
                  <p className="text-center mt-4 text-sm text-gray-400">
                    Already have an account?{" "}
                    <button type="button" onClick={() => switchMode("login")} className="font-semibold text-red-400 hover:text-red-300">
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
                <input type="text" value={otp} onChange={handleOtpChange} placeholder="Enter OTP" maxLength="6" required className="w-full px-4 py-3 text-center tracking-widest bg-white text-gray-900 rounded-md border-2 border-gray-600" />
                {renderError()}
                <button type="submit" disabled={loading} className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md disabled:bg-gray-500">
                  {loading ? "Verifying..." : "Verify & Proceed"}
                </button>
                <button type="button" onClick={() => setStep("details")} className="w-full mt-4 text-gray-400 text-sm hover:text-white">
                  Go Back
                </button>
              </form>
            </>
          )}
          <p className="text-xs text-gray-500 mt-8 text-center">
            By continuing, I accept TCP - <a href="#" className="underline">bigbasket&apos;s Terms and Conditions</a> & <a href="#" className="underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignupModal;
