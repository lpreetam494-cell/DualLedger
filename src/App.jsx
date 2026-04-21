import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Transactions from "./pages/Transactions";
import Split from "./pages/Split";
import Insights from "./pages/Insights";
import Profile from "./pages/Profile";
import Social from "./pages/Social";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import { useStore } from "./store/useStore";
import NotificationModal from "./components/NotificationModal";

export default function App() {
  const { theme, user } = useStore();

  return (
    <Router>
      <div className={`${theme === 'dark' ? 'dark' : ''}`}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex justify-center items-start">
          <div className="w-full max-w-md bg-gray-50 dark:bg-[#0B101B] min-h-screen relative shadow-2xl overflow-hidden transition-colors duration-300">
            <div className="pb-24 h-full overflow-y-auto no-scrollbar">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
              <Route path="/split" element={<ProtectedRoute><Split /></ProtectedRoute>} />
              <Route path="/social" element={<ProtectedRoute><Social /></ProtectedRoute>} />
              <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>
          </div>
          {user && <Navigation />}
          {user && <NotificationModal />}
        </div>
      </div>
      </div>
    </Router>
  );
}