import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Join from './pages/Join';
import Create from './pages/Create';
import PlayQuiz from './pages/PlayQuiz';
import HostQuiz from './pages/HostQuiz';
import Login from './pages/Login';
import Signup from './pages/Signup';
import User from './pages/User';

function App() {
  return (
    <Routes>
      <Route path="/" element={<User />} />
      <Route path="/user" element={<User />} />
      <Route path="/admin" element={<Home />} />
      <Route path="/join" element={<Join />} />
      <Route path="/create" element={<Create />} />
      <Route path="/play/:id" element={<PlayQuiz />} />
      <Route path="/host/:id" element={<HostQuiz />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default App;