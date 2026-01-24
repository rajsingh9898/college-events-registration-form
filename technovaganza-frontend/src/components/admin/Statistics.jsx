import React, { useState, useEffect } from 'react';
import { getStatistics, getAdminEvents, exportEventParticipants, exportAllParticipants, exportByCollege } from '../../services/api';
import { COLLEGES } from '../../utils/constants';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [timeRange, setTimeRange] = useState('all');
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState('all');

  const colleges = COLLEGES;

  useEffect(() => {
    fetchStats();
    fetchEvents();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getStatistics();
      setStats(response.data.statistics);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await getAdminEvents();
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchEventStats = async (eventId) => {
    try {
      // Note: You might need to add this function to your api.js
      // For now, we'll use the existing getAdminEvents and find the event
      const response = await getAdminEvents();
      const event = response.data.events.find(e => e._id === eventId);
      setSelectedEvent({ event });
    } catch (error) {
      console.error('Error fetching event statistics:', error);
    }
  };

  const handleExportEventParticipants = async (eventId = selectedEventId) => {
    if (!eventId) {
      alert('Please select an event first');
      return;
    }

    try {
      setExportLoading(true);
      
      // Use the api.js export function
      const response = await exportEventParticipants(eventId, selectedCollege !== 'all' ? selectedCollege : '');
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'participants.csv';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export participants. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportAllParticipants = async () => {
    try {
      setExportLoading(true);
      
      const response = await exportAllParticipants(selectedCollege !== 'all' ? selectedCollege : '');
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'all_participants.csv';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export all error:', error);
      alert('Failed to export all participants. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportByCollege = async () => {
    if (selectedCollege === 'all') {
      alert('Please select a specific college to export');
      return;
    }

    try {
      setExportLoading(true);
      
      const response = await exportByCollege(selectedCollege);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const filename = `${selectedCollege.replace(/\s+/g, '_')}_participants.csv`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export college error:', error);
      alert('Failed to export college data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const quickExport = (eventId) => {
    setSelectedEventId(eventId);
    setTimeout(() => handleExportEventParticipants(eventId), 100);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Event Statistics Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-300">Loading statistics...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-900 dark:text-white">Loading statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Event Statistics Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-300">Failed to load statistics</p>
        </div>
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-8 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Failed to load statistics. Please try again.</p>
          <button onClick={fetchStats} className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Event Statistics Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-300">Comprehensive analytics and insights</p>
          </div>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Time</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📤 Export Participants Data</h3>
        
        {/* College Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-900 dark:text-white text-sm font-medium mb-2">Filter by College:</label>
            <select 
              value={selectedCollege} 
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Colleges</option>
              {colleges.map(college => (
                <option key={college} value={college}>
                  {college}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-900 dark:text-white text-sm font-medium mb-2">Select Event to Export:</label>
            <select 
              value={selectedEventId} 
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Choose an event...</option>
              {events.map(event => (
                <option key={event._id} value={event._id}>
                  {event.name} ({event.registeredUsers?.length || 0} participants)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Separate Export Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <button 
            onClick={() => handleExportEventParticipants()} 
            disabled={!selectedEventId || exportLoading}
            className="bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {exportLoading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exporting...
              </span>
            ) : '📥 Export Selected Event'}
          </button>
          
          <button 
            onClick={handleExportByCollege}
            disabled={exportLoading || selectedCollege === 'all'}
            className="bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {exportLoading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exporting...
              </span>
            ) : '🏫 Export by College'}
          </button>
          
          <button 
            onClick={handleExportAllParticipants}
            disabled={exportLoading}
            className="bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {exportLoading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exporting...
              </span>
            ) : '📊 Export All Participants'}
          </button>
        </div>

        {/* Quick Export for Popular Events */}
        {events.slice(0, 3).length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🚀 Quick Export - Popular Events:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {events.slice(0, 3).map((event, index) => (
                <button
                  key={event._id}
                  onClick={() => quickExport(event._id)}
                  disabled={exportLoading}
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-700 dark:text-blue-300 border border-blue-500/30 py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 text-sm"
                >
                  Export {event.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-primary/20 backdrop-blur-md rounded-xl p-6 border border-primary/30">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📊</div>
            <div>
              <h3 className="text-2xl font-bold text-white">{stats.totalEvents}</h3>
              <p className="text-primary-200">Total Events</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-500/20 backdrop-blur-md rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center">
            <div className="text-3xl mr-4">👥</div>
            <div>
              <h3 className="text-2xl font-bold text-white">{stats.totalUsers}</h3>
              <p className="text-green-200">Total Users</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-500/20 backdrop-blur-md rounded-xl p-6 border border-yellow-500/30">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🏆</div>
            <div>
              <h3 className="text-2xl font-bold text-white">{stats.totalTeams}</h3>
              <p className="text-yellow-200">Total Teams</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-500/20 backdrop-blur-md rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-center">
            <div className="text-3xl mr-4">⚡</div>
            <div>
              <h3 className="text-2xl font-bold text-white">{stats.activeEvents}</h3>
              <p className="text-blue-200">Active Events</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-500/20 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📝</div>
            <div>
              <h3 className="text-2xl font-bold text-white">{stats.soloEvents}</h3>
              <p className="text-purple-200">Solo Events</p>
            </div>
          </div>
        </div>

        <div className="bg-red-500/20 backdrop-blur-md rounded-xl p-6 border border-red-500/30">
          <div className="flex items-center">
            <div className="text-3xl mr-4">👨‍👩‍👧‍👦</div>
            <div>
              <h3 className="text-2xl font-bold text-white">{stats.teamEvents}</h3>
              <p className="text-red-200">Team Events</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Events List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🎯 Events List</h3>
          <div className="space-y-3">
            {events.map((event, index) => (
              <div 
                key={event._id} 
                className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg p-4 transition-all duration-300 cursor-pointer"
                onClick={() => fetchEventStats(event._id)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="text-gray-900 dark:text-white font-semibold">{event.name}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {event.type} • {event.registeredUsers?.length || 0} participants
                      </p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    event.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {event.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Type Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📋 Event Type Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-900 dark:text-white">Solo Events</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-3 mr-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${stats.totalEvents > 0 ? (stats.soloEvents / stats.totalEvents) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-gray-900 dark:text-white font-bold">{stats.soloEvents}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-900 dark:text-white">Team Events</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-3 mr-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${stats.totalEvents > 0 ? (stats.teamEvents / stats.totalEvents) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-gray-900 dark:text-white font-bold">{stats.teamEvents}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedEvent.event?.name} - Details</h3>
              <button 
                onClick={() => setSelectedEvent(null)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-gray-900 dark:text-white font-semibold mb-2">Event Info</h4>
                  <p className="text-gray-600 dark:text-gray-300">Type: {selectedEvent.event?.type}</p>
                  <p className="text-gray-600 dark:text-gray-300">Participants: {selectedEvent.event?.registeredUsers?.length || 0}</p>
                  <p className="text-gray-600 dark:text-gray-300">Status: {selectedEvent.event?.isActive ? 'Active' : 'Inactive'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-gray-900 dark:text-white font-semibold mb-2">Description</h4>
                  <p className="text-gray-600 dark:text-gray-300">{selectedEvent.event?.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;