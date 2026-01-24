import React, { useState, useEffect } from 'react';
import { getUserDashboard } from '../../services/api';
import { removeToken } from '../../services/auth';
import SoloEvents from './SoloEvents';
import TeamEvents from './TeamEvents';
import Profile from './Profile';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await getUserDashboard();
      if (response.data.success) {
        setUser(response.data.user);
        setEvents(response.data.events);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
          <p className="text-white text-xl mb-4">Failed to load dashboard</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <div className="bg-background-dark/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Welcome, <span className="text-primary">{user.name}</span>!
                </h1>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium border border-primary/30">
                    PID: {user.pid}
                  </span>
                  <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium border border-purple-500/30">
                    Events: {user.eventsCount || 0}/3
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-6 py-3 rounded-lg border border-red-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-2 border border-white/10 mb-8">
          <div className="flex space-x-2">
            {[
              { id: 'profile', label: '👤 Profile', icon: '👤' },
              { id: 'solo', label: '🎯 Solo Events', icon: '🎯' },
              { id: 'team', label: '👥 Team Events', icon: '👥' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 text-center font-semibold rounded-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-lg mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="fade-in">
          {activeTab === 'profile' && (
            <Profile user={user} events={events} onRefresh={fetchDashboard} />
          )}
          {activeTab === 'solo' && (
            <SoloEvents events={events} user={user} onRegistration={fetchDashboard} />
          )}
          {activeTab === 'team' && (
            <TeamEvents events={events} user={user} onRegistration={fetchDashboard} />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;