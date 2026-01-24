import React, { useState, useEffect } from 'react';
import { getAdminEvents, deleteEvent } from '../../services/api'; // Import from api.js

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    try {
      // ✅ Use api.js function instead of direct axios call
      const response = await getAdminEvents();
      
      if (response.data.success) {
        setEvents(response.data.events);
        setMessage('');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      if (error.response?.status === 401) {
        setMessage('Session expired. Please login again.');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      } else {
        setMessage(error.response?.data?.message || 'Error fetching events.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (eventId, eventName) => {
    if (window.confirm(`Are you sure you want to delete "${eventName}"? This action cannot be undone.`)) {
      try {
        // ✅ Use api.js function instead of direct axios call
        const response = await deleteEvent(eventId);
        
        if (response.data.success) {
          setMessage('Event deleted successfully!');
          // Refresh events list
          setRefreshing(true);
          fetchEvents();
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        setMessage(error.response?.data?.message || 'Error deleting event.');
      }
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const getEventStatus = (event) => {
    if (!event.isActive) return 'inactive';
    if (event.currentParticipants >= event.maxParticipants) return 'full';
    return 'active';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'full': return '#ffc107';
      case 'inactive': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'full': return 'Full';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10">
          <h2 className="text-3xl font-bold text-white mb-2">Manage Events</h2>
          <p className="text-gray-300">Loading events...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-white">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Manage Events</h2>
            <p className="text-gray-300">{events.length} events found</p>
          </div>
          <button 
            onClick={handleRefresh} 
            className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
            disabled={refreshing}
          >
            {refreshing ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                Refreshing...
              </span>
            ) : 'Refresh'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border ${
          message.includes('successfully') 
            ? 'bg-green-500/20 text-green-300 border-green-500/30' 
            : 'bg-red-500/20 text-red-300 border-red-500/30'
        }`}>
          {message}
          {message.includes('Session expired') && (
            <button 
              onClick={() => window.location.reload()} 
              className="ml-4 bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1 rounded text-sm"
            >
              Login Again
            </button>
          )}
        </div>
      )}
      
      {events.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-12 border border-white/10 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl text-white mb-2">No Events Found</h3>
          <p className="text-gray-400">Create your first event using the "Create Event" tab.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => {
            const status = getEventStatus(event);
            const statusColor = getStatusColor(status);
            
            return (
              <div key={event._id} className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                    {event.name}
                  </h3>
                  <div className="flex flex-col items-end gap-2">
                    <span 
                      className="px-2 py-1 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: statusColor }}
                    >
                      {getStatusText(status)}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      event.type === 'solo' 
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                        : 'bg-green-500/20 text-green-300 border border-green-500/30'
                    }`}>
                      {event.type === 'solo' ? '👤 Solo' : '👥 Team'}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {event.type} • {event.totalParticipants || 0} participants
                </p>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Participants:</span>
                    <span className="text-white">
                      {event.currentParticipants || 0}/{event.maxParticipants}
                    </span>
                  </div>

                  {event.date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Date:</span>
                      <span className="text-white">{new Date(event.date).toLocaleDateString('en-IN')}</span>
                    </div>
                  )}

                  {event.time && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Time:</span>
                      <span className="text-white">{event.time}</span>
                    </div>
                  )}

                  {event.venue && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Venue:</span>
                      <span className="text-white">{event.venue}</span>
                    </div>
                  )}

                  {event.amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Amount:</span>
                      <span className="text-green-400">₹{event.amount}</span>
                    </div>
                  )}

                  {event.type === 'team' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Team Size:</span>
                      <span className="text-white">{event.minTeamSize}-{event.maxTeamSize} members</span>
                    </div>
                  )}
                </div>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(((event.currentParticipants || 0) / event.maxParticipants) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((event.currentParticipants || 0) / event.maxParticipants * 100, 100)}%`,
                        backgroundColor: statusColor
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>Created: {new Date(event.createdAt).toLocaleDateString('en-IN')}</span>
                  <span className="font-mono">ID: {event._id.slice(-6)}</span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/10">
                  <button 
                    onClick={() => handleDelete(event._id, event.name)}
                    className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                    title={`Delete ${event.name}`}
                  >
                    🗑️ Delete Event
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventList;