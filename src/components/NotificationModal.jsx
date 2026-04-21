import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { X, Bell, UserPlus, Users as GroupIcon, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationModal() {
  const { 
    isNotificationsOpen, 
    toggleNotifications, 
    notifications, 
    fetchNotifications, 
    markNotificationAsRead,
    acceptFriendRequest,
    rejectFriendRequest
  } = useStore();

  useEffect(() => {
    if (isNotificationsOpen) {
      fetchNotifications();
    }
  }, [isNotificationsOpen, fetchNotifications]);

  if (!isNotificationsOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'friend_request': return <UserPlus size={16} className="text-blue-500" />;
      case 'group_invite': return <GroupIcon size={16} className="text-purple-500" />;
      default: return <Bell size={16} className="text-gray-500" />;
    }
  };

  const handleAcceptFriend = async (senderId, notifId) => {
    await acceptFriendRequest(senderId);
    await markNotificationAsRead(notifId);
  };

  const handleRejectFriend = async (senderId, notifId) => {
    await rejectFriendRequest(senderId);
    await markNotificationAsRead(notifId);
  };

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
          {notifications.length === 0 ? (
            <p className="text-center text-gray-500 text-sm">No new notifications.</p>
          ) : (
            notifications.map(n => (
              <div 
                key={n._id} 
                className={`p-4 rounded-xl border flex gap-3 ${n.isRead ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800'}`}
              >
                <div className="mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${n.isRead ? 'text-gray-600' : 'font-semibold text-gray-900 dark:text-blue-100'}`}>
                    {n.message}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>

                  {!n.isRead && n.type === 'friend_request' && (
                    <div className="flex justify-end gap-2 mt-3">
                      <button 
                        onClick={() => handleAcceptFriend(n.relatedId, n._id)}
                        className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-xs font-bold"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleRejectFriend(n.relatedId, n._id)}
                        className="bg-gray-200 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {!n.isRead && n.type !== 'friend_request' && (
                    <div className="flex justify-end mt-2">
                      <button 
                         onClick={() => markNotificationAsRead(n._id)}
                         className="text-xs font-semibold text-primary"
                      >
                         Mark Read
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
