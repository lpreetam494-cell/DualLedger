import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Expenses from "./pages/Expenses";
import Split from "./pages/Split";
import Insights from "./pages/Insights";
import Profile from "./pages/Profile";
import { useStore } from "./store/useStore";

export default function App() {
  const { theme } = useStore();

  return (
    <Router>
      <div className={`${theme === 'dark' ? 'dark' : ''}`}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex justify-center items-start">
          <div className="w-full max-w-md bg-gray-50 dark:bg-[#0B101B] min-h-screen relative shadow-2xl overflow-hidden transition-colors duration-300">
            <div className="pb-24 h-full overflow-y-auto no-scrollbar">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/split" element={<Split />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
          <Navigation />
        </div>
      </div>
      </div>
    </Router>
  );
}