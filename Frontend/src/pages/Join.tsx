import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Join = () => {
  const [gamePin, setGamePin] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gamePin.trim()) {
      navigate(`/play/${gamePin}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#BFD732] to-[#8fa41c] p-4">
      <div className="w-full max-w-md transform rounded-2xl bg-white/90 p-8 shadow-2xl backdrop-blur-lg transition-all hover:scale-[1.01]">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800">Join Quiz</h1>
          <p className="mt-2 text-gray-600">Enter game PIN to start</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              placeholder=" "
              value={gamePin}
              onChange={(e) => setGamePin(e.target.value)}
              className="peer w-full border-b-2 border-gray-300 bg-transparent px-4 py-3 text-center text-3xl text-gray-800 outline-none transition-all focus:border-[#BFD732]"
              inputMode="numeric"
              autoComplete="off"
            />
            <label className="absolute left-4 top-3 text-gray-500 transition-all peer-focus:-top-4 peer-focus:text-sm peer-focus:text-[#BFD732] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-sm">
              Game PIN
            </label>
          </div>

          <button
            type="submit"
            disabled={!gamePin.trim()}
            className="w-full transform rounded-lg bg-gray-50 px-6 py-3 text-lg font-bold text-gray-600 transition-all duration-300 ease-in-out hover:bg-[#BFD732] hover:text-white hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#BFD732] border border-gray-200 active:scale-95"
          >
            Enter
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p className="mb-2">
            Want to create your own quiz?{' '}
            <Link to="/signup" className="text-[#BFD732] hover:text-[#a8bd2b] font-semibold">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Join;
