import React, { useState } from 'react';
import { registerForSoloEvent } from '../../services/api';

const SoloEvents = ({ events, user, onRegistration }) => {
  const soloEvents = events.filter(event => event.type === 'solo');
  const [registering, setRegistering] = useState(null);

  const handleRegister = async (eventId) => {
    if (user.eventsCount >= 3) {
      alert('You have already registered for maximum 3 events');
      return;
    }

    setRegistering(eventId);
    try {
      const response = await registerForSoloEvent({ eventId });
      if (response.data.success) {
        alert('Successfully registered for event!');
        onRegistration();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(null);
    }
  };

  const isRegistered = (eventId) => {
    return user.registeredEvents.some(event => 
      event.eventId._id === eventId || event.eventId === eventId
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10">
        <h2 className="text-3xl font-bold text-white mb-2">Solo Events</h2>
        <p className="text-gray-300">Register for individual competitions and showcase your skills</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {soloEvents.map(event => (
          <div key={event._id} className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                {event.name}
              </h3>
              <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs font-medium">
                Solo
              </span>
            </div>
            
            <p className="text-gray-300 text-sm mb-4 line-clamp-2">{event.description}</p>
            
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Participants:</span>
                <span className="text-white">
                  {event.currentParticipants}/{event.maxParticipants}
                </span>
              </div>
              {event.date && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Date:</span>
                  <span className="text-white">{new Date(event.date).toLocaleDateString('en-IN')}</span>
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
            </div>
            
            {isRegistered(event._id) ? (
              <button 
                className="w-full bg-green-500/20 text-green-300 border border-green-500/30 py-3 rounded-lg cursor-not-allowed"
                disabled
              >
                ✅ Registered
              </button>
            ) : event.currentParticipants >= event.maxParticipants ? (
              <button 
                className="w-full bg-red-500/20 text-red-300 border border-red-500/30 py-3 rounded-lg cursor-not-allowed"
                disabled
              >
                ❌ Event Full
              </button>
            ) : user.eventsCount >= 3 ? (
              <button 
                className="w-full bg-orange-500/20 text-orange-300 border border-orange-500/30 py-3 rounded-lg cursor-not-allowed"
                disabled
              >
                ⚠️ Limit Reached
              </button>
            ) : (
              <button 
                onClick={() => handleRegister(event._id)}
                disabled={registering === event._id}
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {registering === event._id ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registering...
                  </span>
                ) : (
                  'Register Now'
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {soloEvents.length === 0 && (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl text-white mb-2">No Solo Events Available</h3>
          <p className="text-gray-400">Check back later for new solo competitions.</p>
        </div>
      )}
    </div>
  );
};

export default SoloEvents;