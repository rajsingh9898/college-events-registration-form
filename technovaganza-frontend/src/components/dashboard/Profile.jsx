import React, { useState, useEffect } from 'react';
import { formatDate } from '../../utils/helpers.js';
import { generateParticipationPDF } from '../../utils/pdfGenerator.js';

const Profile = ({ user, events, onRefresh }) => {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    if (user.registeredEvents) {
      setRegisteredEvents(user.registeredEvents);
    }
  }, [user.registeredEvents]);

  const getEventDetails = (eventId) => {
    return events.find(event => event._id === eventId) || { name: 'Event Not Found' };
  };

  const downloadReceipt = async (registration, index) => {
    setDownloading(index);
    
    try {
      getEventDetails(registration.eventId?._id || registration.eventId);
      await generateParticipationPDF(user, [registration], events);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const downloadCompleteCertificate = async () => {
    setDownloading('all');
    
    try {
      await generateParticipationPDF(user, registeredEvents, events);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating certificate. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Participant Profile</h2>
            <p className="text-gray-300">Manage your events and download certificates</p>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={downloadCompleteCertificate} 
              disabled={downloading === 'all' || registeredEvents.length === 0}
              className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {downloading === 'all' ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  Generating...
                </span>
              ) : (
                '📄 Download Complete Certificate'
              )}
            </button>
            <button 
              onClick={onRefresh}
              className="bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-white/10">Personal Information</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-gray-300 font-medium">Participant ID:</span>
              <span className="text-primary font-mono font-bold">{user.pid}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-gray-300 font-medium">Name:</span>
              <span className="text-white font-semibold">{user.name}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-gray-300 font-medium">Email:</span>
              <span className="text-white">{user.email}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-gray-300 font-medium">Roll No:</span>
              <span className="text-white">{user.rollno}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-gray-300 font-medium">College:</span>
              <span className="text-white">{user.college || 'Not specified'}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-gray-300 font-medium">Branch:</span>
              <span className="text-white">{user.branch}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-300 font-medium">Batch:</span>
              <span className="text-white">{user.batch}</span>
            </div>
          </div>
        </div>

        {/* Registered Events */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
            <h3 className="text-2xl font-bold text-white">
              Registered Events ({registeredEvents.length}/3)
            </h3>
            <div className="flex space-x-3 text-sm">
              <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">
                Solo: {registeredEvents.filter(e => e.eventType === 'solo').length}
              </span>
              <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full border border-green-500/30">
                Team: {registeredEvents.filter(e => e.eventType === 'team').length}
              </span>
            </div>
          </div>

          {registeredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-gray-300 text-lg mb-2">No events registered yet.</p>
              <p className="text-gray-400">Go to Solo Events or Team Events tab to register.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {registeredEvents.map((registration, index) => {
                const event = getEventDetails(registration.eventId?._id || registration.eventId);
                
                return (
                  <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-white font-semibold text-lg">{event.name || 'Event'}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        registration.eventType === 'solo' 
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                          : 'bg-green-500/20 text-green-300 border border-green-500/30'
                      }`}>
                        {registration.eventType.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        {registration.teamId && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Team ID:</span>
                            <span className="text-primary font-mono">{registration.teamId}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-400">Registered on:</span>
                          <span className="text-white">{formatDate(registration.registrationDate)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {event.date && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Event Date:</span>
                            <span className="text-white">{new Date(event.date).toLocaleDateString('en-IN')}</span>
                          </div>
                        )}
                        {event.venue && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Venue:</span>
                            <span className="text-white">{event.venue}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => downloadReceipt(registration, index)}
                      disabled={downloading === index}
                      className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 py-2 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {downloading === index ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                          Generating Receipt...
                        </span>
                      ) : (
                        '📄 Download Receipt'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;