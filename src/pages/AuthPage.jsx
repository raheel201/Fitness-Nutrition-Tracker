import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import Spinner from "../components/Spinner";
import Modal from "../components/Modal";
import Logo from "../components/Logo";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showGoogleProfileModal, setShowGoogleProfileModal] = useState(false);
  const [googleUserData, setGoogleUserData] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    age: "",
    weight: "",
    height: "",
    fitnessGoal: "weight_loss",
  });

  const { login, signup, loginWithGoogle, updateProfile } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  // Convert Firebase error codes to user-friendly messages
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/invalid-login-credentials":
        return "Invalid email or password. Please check your credentials and try again.";
      case "auth/user-not-found":
        return "No account found with this email address.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-disabled":
        return "This account has been disabled. Please contact support.";
      case "auth/email-already-in-use":
        return "An account with this email already exists. Try signing in instead.";
      case "auth/weak-password":
        return "Password should be at least 6 characters long.";
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection and try again.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/popup-closed-by-user":
        return "Sign-in was cancelled. Please try again.";
      case "auth/cancelled-popup-request":
        return "Sign-in was cancelled. Please try again.";
      case "auth/passwords-do-not-match":
        return "Passwords do not match. Please make sure both passwords are identical.";
      case "auth/missing-email":
        return "Please enter your email address.";
      case "auth/missing-password":
        return "Please enter your password.";
      default:
        // If it's a custom error message (like "Passwords do not match"), return it directly
        if (typeof errorCode === "string" && !errorCode.startsWith("auth/")) {
          return errorCode;
        }
        return "An unexpected error occurred. Please try again.";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        showSuccess("Welcome back!");
      } else {
        if (formData.password !== formData.confirmPassword) {
          const error = new Error("Passwords do not match");
          error.code = "auth/passwords-do-not-match";
          throw error;
        }

        if (formData.password.length < 6) {
          const error = new Error(
            "Password should be at least 6 characters long"
          );
          error.code = "auth/weak-password";
          throw error;
        }

        const profileData = {
          displayName: formData.displayName,
          age: parseInt(formData.age),
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height),
          fitnessGoal: formData.fitnessGoal,
        };

        await signup(formData.email, formData.password, profileData);
        showSuccess("Account created successfully!");
      }
      navigate("/dashboard");
    } catch (error) {
      console.error("Authentication error:", error);
      // Extract error code from Firebase error or use the message directly
      const errorCode =
        error.code ||
        (error.message.includes("auth/") ? error.message : "unknown-error");
      setError(getErrorMessage(errorCode));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await loginWithGoogle();
      // Check if this is a new user (no profile data)
      if (result.additionalUserInfo?.isNewUser) {
        setGoogleUserData({
          email: result.user.email,
          displayName: result.user.displayName || "",
          uid: result.user.uid,
        });
        setShowGoogleProfileModal(true);
      } else {
        showSuccess("Welcome back!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Google login error:", error);
      const errorCode =
        error.code ||
        (error.message.includes("auth/") ? error.message : "unknown-error");
      setError(getErrorMessage(errorCode));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleProfileSubmit = async (profileData) => {
    try {
      // Update user profile in Firestore
      await updateProfile(profileData);
      setShowGoogleProfileModal(false);
      showSuccess("Profile created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Profile creation error:", error);
      showError("Failed to create profile. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="h-screen flex bg-slate-900 overflow-hidden">
      {/* Left side - Fitness Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-orange-500/20" />
        <div className="fitness-bg w-full flex items-center justify-center p-12">
          <div className="text-center">
            <div className="flex justify-center">
              <Logo size="xl" />
            </div>
            <h1 className="mt-8 text-4xl font-bold text-gray-100">
              Transform Your Fitness Journey
            </h1>
            <p className="mt-4 text-xl text-gray-300">
              Track workouts, monitor nutrition, and achieve your goals with
              data-driven insights.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-6 text-center">
              <div className="p-4 bg-slate-800/50 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold text-teal-400">500+</div>
                <div className="text-sm text-gray-300">Exercises</div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold text-orange-400">24/7</div>
                <div className="text-sm text-gray-300">Tracking</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
        <div className="max-w-lg w-full space-y-8">
          <div className="lg:hidden text-center mb-8">
            <Logo size="lg" />
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-100">
              {isLogin ? "Welcome Back" : "Join FitTracker"}
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              {isLogin
                ? "Sign in to continue your fitness journey"
                : "Start your transformation today"}
            </p>
          </div>

          <form
            className="mt-8 space-y-6 bg-slate-800 p-8 rounded-lg shadow-xl border border-slate-700"
            onSubmit={handleSubmit}
          >
            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded-lg flex items-start space-x-2">
                <svg
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="displayName"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Display Name
                    </label>
                    <input
                      id="displayName"
                      name="displayName"
                      type="text"
                      required
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="age"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Age
                      </label>
                      <input
                        id="age"
                        name="age"
                        type="number"
                        required
                        value={formData.age}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="weight"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Weight (kg)
                      </label>
                      <input
                        id="weight"
                        name="weight"
                        type="number"
                        step="0.1"
                        required
                        value={formData.weight}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="height"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Height (cm)
                    </label>
                    <input
                      id="height"
                      name="height"
                      type="number"
                      required
                      value={formData.height}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="fitnessGoal"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Fitness Goal
                    </label>
                    <select
                      id="fitnessGoal"
                      name="fitnessGoal"
                      value={formData.fitnessGoal}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="weight_loss">Weight Loss</option>
                      <option value="muscle_gain">Muscle Gain</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="endurance">Endurance</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? (
                  <Spinner size="sm" />
                ) : isLogin ? (
                  "Sign in"
                ) : (
                  "Sign up"
                )}
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-colors"
              >
                Continue with Google
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-teal-400 hover:text-teal-300 text-sm transition-colors"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Google Profile Setup Modal */}
      <Modal
        isOpen={showGoogleProfileModal}
        onClose={() => setShowGoogleProfileModal(false)}
        title="Complete Your Profile"
        size="lg"
      >
        <GoogleProfileForm
          userData={googleUserData}
          onSubmit={handleGoogleProfileSubmit}
          onCancel={() => setShowGoogleProfileModal(false)}
        />
      </Modal>
    </div>
  );
}

// Google Profile Form Component
function GoogleProfileForm({ userData, onSubmit, onCancel }) {
  const [profileData, setProfileData] = useState({
    displayName: userData?.displayName || "",
    age: "",
    weight: "",
    height: "",
    fitnessGoal: "maintenance",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        ...profileData,
        age: parseInt(profileData.age),
        weight: parseFloat(profileData.weight),
        height: parseFloat(profileData.height),
      });
    } catch (error) {
      console.error("Profile setup error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setProfileData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <p className="text-gray-300">
          Welcome! Let's set up your fitness profile to get started.
        </p>
        <p className="text-sm text-gray-400 mt-2">Email: {userData?.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Display Name
          </label>
          <input
            name="displayName"
            type="text"
            required
            value={profileData.displayName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Age
          </label>
          <input
            name="age"
            type="number"
            required
            value={profileData.age}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Weight (kg)
          </label>
          <input
            name="weight"
            type="number"
            step="0.1"
            required
            value={profileData.weight}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Height (cm)
          </label>
          <input
            name="height"
            type="number"
            required
            value={profileData.height}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Fitness Goal
          </label>
          <select
            name="fitnessGoal"
            value={profileData.fitnessGoal}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="weight_loss">Weight Loss</option>
            <option value="muscle_gain">Muscle Gain</option>
            <option value="maintenance">Maintenance</option>
            <option value="endurance">Endurance</option>
          </select>
        </div>
      </div>

      <div className="flex space-x-3 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={
            loading ||
            !profileData.displayName ||
            !profileData.age ||
            !profileData.weight ||
            !profileData.height
          }
          className="flex-1 btn-primary disabled:opacity-50"
        >
          {loading ? <Spinner size="sm" /> : "Complete Setup"}
        </button>
      </div>
    </form>
  );
}
