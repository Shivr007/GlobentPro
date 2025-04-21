// d:\Project\shivraj Comapny pr\GlobentPro\Frontend\src\App.tsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Import Page Components
import User from './pages/User';
import Join from './pages/Join';
import Create from './pages/Create';
import PlayQuiz from './pages/PlayQuiz';
import HostQuiz from './pages/HostQuiz';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyQuizzes from './pages/MyQuizzes';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile'; // *** Import Profile Page ***
// import Home from './pages/Home'; // If not used

// Optional: Import a ProtectedRoute component if you have one
// import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    // Assuming Router is handled here or in main.tsx
    // <Router>
      <Routes>
        {/* --- Public/User Routes --- */}
        <Route path="/" element={<User />} />
        <Route path="/join" element={<Join />} />
        {/* Use :idOrPin to accept both formats */}
        <Route path="/play/:idOrPin" element={<PlayQuiz />} />

        {/* --- Authentication Routes --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* --- Authenticated Routes --- */}
        {/* Wrap these in ProtectedRoute if available */}
        <Route path="/create" element={<Create />} />
        <Route path="/host/:id" element={<HostQuiz />} />
        <Route path="/my-quizzes" element={<MyQuizzes />} />
        {/* *** ADDED PROFILE ROUTE *** */}
        <Route path="/profile" element={<Profile />} />
        {/* ************************* */}

        {/* --- Admin Specific Route --- */}
        {/* Wrap in ProtectedRoute with admin check if available */}
        <Route path="/admin" element={<AdminPanel />} />

        {/* --- Fallback or Not Found Route (Optional) --- */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    // </Router>
  );
}

export default App;
