import React, { useEffect, useState } from 'react';
import { UserPlus, Users as UsersIcon, Check, X, Search, PlusCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Social() {
  const { 
    friends, 
    pendingRequests, 
    groups, 
    fetchFriends, 
    fetchGroups, 
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    createGroup
  } = useStore();

  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);

  useEffect(() => {
    fetchFriends();
    fetchGroups();
  }, [fetchFriends, fetchGroups]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchEmail) return;
    const results = await searchUsers(searchEmail);
    setSearchResults(results);
  };

  const handleSendRequest = async (userId) => {
    await sendFriendRequest(userId);
    setSearchResults(searchResults.filter(u => u._id !== userId));
  };

  const handleCreateGroup = async () => {
    if (!newGroupName || selectedFriends.length === 0) return;
    await createGroup({ name: newGroupName, members: selectedFriends });
    setNewGroupName('');
    setSelectedFriends([]);
  };

  const toggleFriendSelection = (id) => {
    setSelectedFriends(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 space-y-8 pb-24">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Social</h1>
        <p className="text-gray-500 text-sm">Connect and manage groups.</p>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Pending Requests</h2>
          {pendingRequests.map(req => (
            <div key={req._id} className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="font-bold">{req.name}</p>
                <p className="text-xs text-gray-500">{req.email}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => acceptFriendRequest(req._id)} className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <Check size={16} />
                </button>
                <button onClick={() => rejectFriendRequest(req._id)} className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Friend */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Add Friend</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input 
              type="email" 
              placeholder="Search by email..." 
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="w-full bg-white pl-10 pr-4 py-3 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>
          <button type="submit" className="bg-primary text-white px-4 py-3 rounded-2xl font-bold shadow-sm">
            Find
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="space-y-2 mt-4">
             {searchResults.map(u => (
               <div key={u._id} className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between transition-opacity">
                 <div>
                   <p className="font-bold text-sm">{u.name}</p>
                   <p className="text-xs text-gray-500">{u.email}</p>
                 </div>
                 <button onClick={() => handleSendRequest(u._id)} className="text-primary bg-primary/10 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                   <UserPlus size={14} /> Add
                 </button>
               </div>
             ))}
          </div>
        )}
      </div>

      {/* Friends List */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">My Friends</h2>
        {friends.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No friends yet. Add some to split expenses easily!</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            {friends.map(f => (
              <div key={f._id} className="flex-shrink-0 w-20 text-center">
                <div className="w-14 h-14 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl mb-2">
                  {f.name.charAt(0).toUpperCase()}
                </div>
                <p className="text-xs font-medium truncate">{f.name.split(' ')[0]}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Groups */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Groups</h2>
        
        {/* Existing Groups */}
        <div className="space-y-2">
          {groups.map(g => (
            <div key={g._id} className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#E5EDFF] text-primary rounded-xl flex justify-center items-center font-bold">
                  <UsersIcon size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{g.name}</h3>
                  <p className="text-xs text-gray-500">{g.members.length} members</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Group */}
        <div className="bg-gray-100 border border-gray-200 border-dashed rounded-3xl p-5 mt-4 space-y-4">
          <h3 className="font-bold text-sm">Create New Group</h3>
          <input 
            type="text" 
            placeholder="Trip to Paris..." 
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="w-full bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm shadow-sm"
          />
          {friends.length > 0 && (
             <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">SELECT MEMBERS</p>
                <div className="flex flex-wrap gap-2">
                  {friends.map(f => (
                    <button 
                      key={f._id} 
                      onClick={() => toggleFriendSelection(f._id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${selectedFriends.includes(f._id) ? 'bg-primary text-white shadow-sm' : 'bg-white text-gray-600 shadow-sm border border-gray-100'}`}
                    >
                      {f.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
             </div>
          )}
          <button 
            onClick={handleCreateGroup}
            disabled={!newGroupName || selectedFriends.length === 0}
            className="w-full bg-gray-900 text-white font-bold text-sm py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            <PlusCircle size={16} /> Create Group
          </button>
        </div>
      </div>
    </div>
  );
}
