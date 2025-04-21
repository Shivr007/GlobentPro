// d:\Project\shivraj Comapny pr\GlobentPro\Frontend\src\pages\Profile.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Adjust path if needed
import Footer from '../components/Footer'; // Adjust path if needed

const Profile: React.FC = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data from localStorage on component mount
    const storedUsername = localStorage.getItem('username');
    const storedEmail = localStorage.getItem('userEmail');
    const authToken = localStorage.getItem('authToken'); // Check if logged in

    if (authToken && storedUsername && storedEmail) {
      setUsername(storedUsername);
      setEmail(storedEmail);
    } else {
      // If not logged in (no token or missing info), redirect to login
      console.log("Profile page: User not logged in, redirecting to login.");
      navigate('/login');
    }
    setIsLoading(false); // Finished loading data (or determining redirection)
  }, [navigate]); // Add navigate to dependency array

  // Function to get initials for avatar
  const getInitials = (name: string | null): string => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Display loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-gray-600 text-xl">Loading Profile...</div>
      </div>
    );
    // Note: Redirection happens in useEffect, so this loading state might only show briefly
  }

  // If redirection hasn't happened yet but user data is missing (shouldn't normally occur with the redirect)
  if (!username || !email) {
     return (
       <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
         <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-red-600 mb-4">Could not load profile data. Please log in.</p>
            <Link to="/login" className="text-blue-600 hover:underline">Go to Login</Link>
         </div>
       </div>
     );
  }

  // --- Render Profile Page ---
  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-10 md:py-16">
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-8 md:p-10">
          <div className="text-center mb-8">
            {/* Avatar Placeholder */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#BFD732] to-[#8fa41c] mx-auto flex items-center justify-center mb-4 shadow-md">
              <span className="text-4xl font-bold text-white">
                {getInitials(username)}
              </span>
            </div>
            {/* Welcome Message */}
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              Welcome, {username}!
            </h1>
            <p className="text-gray-500">Your Profile Details</p>
          </div>

          {/* Profile Details */}
          <div className="space-y-5">
            <div className="border-b border-gray-200 pb-4">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Username
              </label>
              <p className="text-lg text-gray-800 font-semibold">{username}</p>
            </div>
            <div className="border-b border-gray-200 pb-4">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Email Address
              </label>
              <p className="text-lg text-gray-800 font-semibold">{email}</p>
            </div>
            {/* Add more profile fields here if needed (e.g., quizzes created count) */}
          </div>

          {/* Action Buttons (Optional) */}
          <div className="mt-10 text-center space-y-4">
            {/* Placeholder for future edit functionality */}
            <button
              disabled // Disable for now
              className="w-full md:w-auto bg-blue-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mr-3"
            >
              Edit Profile (Soon)
            </button>
             {/* Placeholder for future password change */}
            <button
              disabled // Disable for now
              className="w-full md:w-auto bg-gray-300 text-gray-700 px-6 py-2 rounded-md font-semibold hover:bg-gray-400 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Change Password (Soon)
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
