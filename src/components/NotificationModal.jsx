import React from 'react';
import { useStore } from '../store/useStore';
import { X, Bell } from 'lucide-react';

export default function NotificationModal() {
  const { isNotificationsOpen, toggleNotifications } = useStore();

  if (!isNotificationsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={toggleNotifications}
      ></div>

      {/* Modal */}
      <div className="bg-white dark:bg-[#1A2130] w-full max-w-sm rounded-[2rem] shadow-2xl relative z-10 overflow-hidden transform transition-all">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-primary" />
            <h2 className="text-xl font-bold dark:text-white">Notifications</h2>
          </div>
          <button 
            onClick={toggleNotifications}
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <X size={18} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
          {/* Mock Notifications */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Welcome to DualLedger! 🎉</p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Start tracking your expenses and simplifying debts.</p>
            <p className="text-[10px] text-blue-400 dark:text-blue-500 mt-2">Just now</p>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
            <div>
              <p className="text-sm text-gray-800 dark:text-gray-200"><span className="font-semibold">Security Alert:</span> New login detected from MacOS.</p>
              <p className="text-[10px] text-gray-400 mt-1">Yesterday</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
