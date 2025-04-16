import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const signupRoute = () => {
    navigate('/signup');
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      const { username } = response.data;
      localStorage.setItem('userEmail', email);
      localStorage.setItem('username', username);

      // Check if the email ends with "@globent.com"
      if (email.endsWith('@globant.com')) {
        alert(`Welcome Admin ${username}`);
        navigate('/admin'); // Redirect to admin panel
      } else {
        alert(`Welcome User ${username}`);
        navigate('/'); // Redirect to user panel
      }
    } catch (error) {
      alert(((error as any).response?.data?.error) || 'Invalid credentials');
      console.error('Error during login:', error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#BFD732] to-[#8fa41c] p-4">
      <div className="w-full max-w-md transform rounded-2xl bg-white/90 p-8 shadow-2xl backdrop-blur-lg transition-all hover:scale-[1.01]">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800">Welcome Back!</h1>
          <p className="mt-2 text-gray-600">Please sign in to continue</p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <input
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="peer w-full border-b-2 border-gray-300 bg-transparent px-4 py-3 text-gray-800 outline-none transition-all focus:border-[#BFD732]"
            />
            <label className="absolute left-4 top-3 text-gray-500 transition-all peer-focus:-top-4 peer-focus:text-sm peer-focus:text-[#BFD732] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-sm">
              Email
            </label>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer w-full border-b-2 border-gray-300 bg-transparent px-4 py-3 text-gray-800 outline-none transition-all focus:border-[#BFD732]"
            />
            <label className="absolute left-4 top-3 text-gray-500 transition-all peer-focus:-top-4 peer-focus:text-sm peer-focus:text-[#BFD732] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-sm">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3 text-gray-500 hover:text-[#BFD732] transition-colors"
            >
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

          <button
            onClick={handleLogin}
            className="w-full transform rounded-lg bg-[#BFD732] px-6 py-3 text-lg font-bold text-white transition-all hover:bg-[#a8bd2b] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#BFD732] focus:ring-offset-2"
          >
            Sign In
          </button>

          <div className="text-center">
            <button
              onClick={signupRoute}
              className="text-gray-600 hover:text-[#BFD732] transition-colors"
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