import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { useState, createContext, useContext, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import LogVitals from "./pages/LogVitals";
import ChatBot from "./pages/ChatBot";
import History from "./pages/History";
import GamifiedRewards from "./pages/Rewards";
import FamilyHealthHub from "./pages/FamilyHealthHub";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { API_URL } from "./config/api";
export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

function NavBar({ user, onLogout }) {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex space-x-4 overflow-x-auto">
            <Link to="/" className="hover:bg-blue-500 px-3 py-2 rounded-md font-medium transition whitespace-nowrap">
              🏥 Dashboard
            </Link>
            <Link to="/log" className="hover:bg-blue-500 px-3 py-2 rounded-md font-medium transition whitespace-nowrap">
              📝 Log Vitals
            </Link>
            <Link to="/chat" className="hover:bg-blue-500 px-3 py-2 rounded-md font-medium transition whitespace-nowrap">
              💬 Chat Bot
            </Link>
            <Link to="/history" className="hover:bg-blue-500 px-3 py-2 rounded-md font-medium transition whitespace-nowrap">
              📊 History
            </Link>
            <Link to="/rewards" className="hover:bg-blue-500 px-3 py-2 rounded-md font-medium transition whitespace-nowrap">
              🏆 Rewards
            </Link>
            <Link to="/family" className="hover:bg-blue-500 px-3 py-2 rounded-md font-medium transition whitespace-nowrap bg-blue-500 bg-opacity-30">
              👨‍👩‍👧‍👦 Family Hub
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm hidden sm:block">👋 {user?.name || "User"}</span>
            <button
              className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 font-medium transition whitespace-nowrap"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Check authentication status on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");
    const name = localStorage.getItem("userName");
    
    if (token && email) {
      setUser({ token, email, name });
      setLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setLoggedIn(true);
  };

  const handleLogout = () => {
    // ✅ Clear all user-related data
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    
    setUser(null);
    setLoggedIn(false);
  };

  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    return loggedIn ? children : <Navigate to="/login" replace />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, handleLogin, handleLogout }}>
      <BrowserRouter>
        {/* ✅ Only show navbar when logged in */}
        {loggedIn && user && <NavBar user={user} onLogout={handleLogout} />}

        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                loggedIn ? <Navigate to="/" replace /> : <Login />
              } 
            />
            <Route 
              path="/register" 
              element={
                loggedIn ? <Navigate to="/" replace /> : <Register />
              } 
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/log"
              element={
                <ProtectedRoute>
                  <LogVitals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatBot />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rewards"
              element={
                <ProtectedRoute>
                  <GamifiedRewards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/family"
              element={
                <ProtectedRoute>
                  <FamilyHealthHub />
                </ProtectedRoute>
              }
            />
            
            {/* Catch-all */}
            <Route path="*" element={<Navigate to={loggedIn ? "/" : "/login"} replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;