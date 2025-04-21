// d:\Project\shivraj Comapny pr\GlobentPro\Frontend\src\pages\Login.tsx
import React, { useState } from 'react';
import axios, { AxiosError } from 'axios'; // Import AxiosError
import { useNavigate } from 'react-router-dom';

// Define the API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null); // Add error state
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  const signupRoute = () => {
    navigate('/signup');
  };

  const handleLogin = async () => {
    setError(null); // Clear previous errors
    setLoading(true); // Set loading state

    try {
      // *** Make sure backend sends { token, username } on successful login ***
      const response = await axios.post<{ token: string; username: string }>(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      const { token, username } = response.data;

      // *** CRITICAL: Store the authentication token AND email ***
      localStorage.setItem('authToken', token);
      localStorage.setItem('userEmail', email); // <-- Save email used for login
      localStorage.setItem('username', username);

      // Check if the email ends with "@globant.com" for admin redirect
      // NOTE: This is frontend logic only, backend authorization is still needed
      if (email.toLowerCase().endsWith('@globant.com')) {
        // alert(`Welcome Admin ${username}`); // Avoid alerts
        navigate('/admin'); // Redirect to admin panel route
      } else {
        // alert(`Welcome User ${username}`); // Avoid alerts
        navigate('/'); // Redirect to user home page
      }
    } catch (err) {
        const error = err as AxiosError<{ error?: string, details?: string }>;
        console.error('Error during login:', error);
        const message = error.response?.data?.error || error.message || 'Invalid credentials or server error';
        setError(message); // Set error state to display to user
    } finally {
        setLoading(false); // Clear loading state
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#BFD732] to-[#8fa41c] p-4">
      <div className="w-full max-w-md transform rounded-2xl bg-white/90 p-8 shadow-2xl backdrop-blur-lg transition-all hover:scale-[1.01]">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800">Welcome Back!</h1>
          <p className="mt-2 text-gray-600">Please login in to continue</p>
        </div>

        {/* Display Login Error */}
        {error && (
             <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
             </div>
        )}

        <div className="space-y-6">
          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              placeholder=" " // Important for floating label effect
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="peer w-full border-b-2 border-gray-300 bg-transparent px-4 py-3 text-gray-800 outline-none transition-all focus:border-[#BFD732]"
              disabled={loading} // Disable input while loading
            />
            <label className="absolute left-4 top-3 text-gray-500 transition-all pointer-events-none peer-focus:-top-4 peer-focus:text-sm peer-focus:text-[#BFD732] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-sm">
              Email
            </label>
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder=" " // Important for floating label effect
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer w-full border-b-2 border-gray-300 bg-transparent px-4 py-3 text-gray-800 outline-none transition-all focus:border-[#BFD732]"
              disabled={loading} // Disable input while loading
            />
            <label className="absolute left-4 top-3 text-gray-500 transition-all pointer-events-none peer-focus:-top-4 peer-focus:text-sm peer-focus:text-[#BFD732] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-sm">
              Password
            </label>
            {/* Show/Hide Password Button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3 text-gray-500 hover:text-[#BFD732] transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={loading}
            >
              {/* SVG Icons */}
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading || !email || !password} // Disable if loading or fields empty
            className="w-full transform rounded-lg bg-[#BFD732] px-6 py-3 text-lg font-bold text-white transition-all hover:bg-[#a8bd2b] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#BFD732] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loging In...' : 'Login'}
          </button>

          {/* Signup Link */}
          <div className="text-center">
            <button
              onClick={signupRoute}
              disabled={loading}
              className="text-gray-600 hover:text-[#BFD732] transition-colors disabled:opacity-50"
            >
              Don't have an account? Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
