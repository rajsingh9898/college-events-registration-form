import React, { useState } from 'react';
import { createEvent } from '../../services/api'; // Import from api.js

const EventForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'solo',
    date: '',
    time: '',
    venue: '',
    amount: '',
    maxParticipants: '',
    maxTeamSize: '5',
    minTeamSize: '2'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validation
    if (!formData.name || !formData.description || !formData.date || 
        !formData.time || !formData.venue || !formData.maxParticipants) {
      setMessage('Please fill all required fields');
      setLoading(false);
      return;
    }

    if (formData.type === 'team' && (!formData.maxTeamSize || !formData.minTeamSize)) {
      setMessage('Please specify team sizes for team events');
      setLoading(false);
      return;
    }

    if (formData.minTeamSize > formData.maxTeamSize) {
      setMessage('Minimum team size cannot be greater than maximum team size');
      setLoading(false);
      return;
    }

    try {
      // ✅ Use api.js function instead of direct axios call
      const response = await createEvent({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        date: formData.date,
        time: formData.time,
        venue: formData.venue,
        amount: parseFloat(formData.amount) || 0,
        maxParticipants: parseInt(formData.maxParticipants),
        maxTeamSize: formData.type === 'team' ? parseInt(formData.maxTeamSize) : 1,
        minTeamSize: formData.type === 'team' ? parseInt(formData.minTeamSize) : 1
      });
      
      if (response.data.success) {
        setMessage('Event created successfully!');
        // Reset form
        setFormData({
          name: '',
          description: '',
          type: 'solo',
          date: '',
          time: '',
          venue: '',
          amount: '',
          maxParticipants: '',
          maxTeamSize: '5',
          minTeamSize: '2'
        });
      }
    } catch (error) {
      console.error('Error creating event:', error);
      setMessage(error.response?.data?.message || 'Error creating event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10">
        <h2 className="text-3xl font-bold text-white mb-2">Create New Event</h2>
        <p className="text-gray-300">Add a new event to Technovaganza 2025</p>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="block text-white text-sm font-medium mb-2">Event Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter event name"
              className="w-full px-4 py-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="form-group">
            <label className="block text-white text-sm font-medium mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Enter event description"
              className="w-full px-4 py-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="block text-white text-sm font-medium mb-2">Event Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-background-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="solo">Solo Event</option>
                <option value="team">Team Event</option>
              </select>
            </div>

            <div className="form-group">
              <label className="block text-white text-sm font-medium mb-2">Registration Amount (₹)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0 for free"
                className="w-full px-4 py-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="block text-white text-sm font-medium mb-2">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-background-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="form-group">
              <label className="block text-white text-sm font-medium mb-2">Time *</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-background-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="block text-white text-sm font-medium mb-2">Venue *</label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              required
              placeholder="Enter event venue"
              className="w-full px-4 py-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="block text-white text-sm font-medium mb-2">Max Participants *</label>
              <input
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                required
                min="1"
                placeholder="e.g., 50"
                className="w-full px-4 py-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="form-group">
              <label className="block text-white text-sm font-medium mb-2">Current Participants</label>
              <input
                type="number"
                value="0"
                disabled
                placeholder="Auto calculated"
                className="w-full px-4 py-3 bg-background-dark/50 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          {formData.type === 'team' && (
            <div className="team-size-fields bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
              <h4 className="text-blue-300 font-semibold mb-4">Team Size Requirements</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="block text-white text-sm font-medium mb-2">Minimum Team Size *</label>
                  <input
                    type="number"
                    name="minTeamSize"
                    value={formData.minTeamSize}
                    onChange={handleChange}
                    required
                    min="2"
                    max="10"
                    placeholder="e.g., 2"
                    className="w-full px-4 py-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div className="form-group">
                  <label className="block text-white text-sm font-medium mb-2">Maximum Team Size *</label>
                  <input
                    type="number"
                    name="maxTeamSize"
                    value={formData.maxTeamSize}
                    onChange={handleChange}
                    required
                    min="2"
                    max="10"
                    placeholder="e.g., 5"
                    className="w-full px-4 py-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className={`p-4 rounded-lg border ${
              message.includes('successfully') 
                ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                : 'bg-red-500/20 text-red-300 border-red-500/30'
            }`}>
              {message}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Event...
              </span>
            ) : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventForm;