import React, { useState } from 'react';
import { createTeam, validateTeamMember } from '../../services/api';
import { formatTeamSize } from '../../utils/helpers';

const TeamEvents = ({ events, user, onRegistration }) => {
  const teamEvents = events.filter(event => event.type === 'team');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState(['']);
  const [memberInfo, setMemberInfo] = useState({});
  const [validating, setValidating] = useState([]);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');

  const handleAddMember = () => {
    if (members.length < selectedEvent?.maxTeamSize - 1) {
      setMembers([...members, '']);
    }
  };

  const handleRemoveMember = (index) => {
    const newMembers = members.filter((_, i) => i !== index);
    setMembers(newMembers);
    
    setMemberInfo(prev => {
      const newInfo = { ...prev };
      delete newInfo[index];
      return newInfo;
    });
  };

  const handleMemberChange = (index, value) => {
    const newMembers = [...members];
    newMembers[index] = value;
    setMembers(newMembers);
    
    if (value.trim() === '') {
      setMemberInfo(prev => {
        const newInfo = { ...prev };
        delete newInfo[index];
        return newInfo;
      });
    }
    
    if (value.trim().length >= 10) {
      validateMember(value, index);
    }
  };

  const validateMember = async (pid, index) => {
    if (!pid.trim()) {
      const newMembers = [...members];
      newMembers[index] = '';
      setMembers(newMembers);
      setMemberInfo(prev => {
        const newInfo = { ...prev };
        delete newInfo[index];
        return newInfo;
      });
      return;
    }

    setValidating(prev => [...prev, index]);
    try {
      const response = await validateTeamMember(pid);
      
      if (response.data.valid) {
        setMemberInfo(prev => ({
          ...prev,
          [index]: response.data.member
        }));
        setMessage('');
      } else {
        setMessage(`Invalid PID: ${response.data.message}`);
        setMemberInfo(prev => {
          const newInfo = { ...prev };
          delete newInfo[index];
          return newInfo;
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Validation error:', error);
      setMessage('Validation failed. Please try again.');
      return { valid: false, message: 'Validation failed' };
    } finally {
      setValidating(prev => prev.filter(i => i !== index));
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      setMessage('Please enter team name');
      return;
    }

    const hasSelf = members.some(member => member.trim() === user.pid);
    if (hasSelf) {
      setMessage('❌ You cannot add yourself as a team member. You are automatically the team leader.');
      return;
    }

    const totalMembers = members.filter(m => m.trim()).length + 1;
    if (selectedEvent.minTeamSize && totalMembers < selectedEvent.minTeamSize) {
      setMessage(`Team must have at least ${selectedEvent.minTeamSize} members`);
      return;
    }

    const validatedMembers = [];
    for (let i = 0; i < members.length; i++) {
      if (members[i].trim()) {
        if (!memberInfo[i]) {
          setMessage(`Please validate member at position ${i + 1} first`);
          return;
        }
        
        const result = await validateMember(members[i], i);
        if (!result.valid) {
          setMessage(`Invalid member at position ${i + 1}: ${result.message}`);
          return;
        }
        validatedMembers.push(members[i]);
      }
    }

    if (validatedMembers.length === 0 && selectedEvent.minTeamSize <= 1) {
      setMessage('Please add at least one team member');
      return;
    }

    setCreating(true);
    setMessage('');
    
    try {
      const response = await createTeam({
        eventId: selectedEvent._id,
        teamName: teamName.trim(),
        members: validatedMembers
      });

      if (response.data.success) {
        setMessage('Team created successfully!');
        setTimeout(() => {
          setSelectedEvent(null);
          setTeamName('');
          setMembers(['']);
          setMemberInfo({});
          setMessage('');
          onRegistration();
        }, 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Team creation failed');
    } finally {
      setCreating(false);
    }
  };

  // Team Creation Form
  if (selectedEvent) {
    return (
      <div className="space-y-8">
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10">
          <h2 className="text-3xl font-bold text-white mb-2">
            Create Team for <span className="text-primary">{selectedEvent.name}</span>
          </h2>
          <p className="text-gray-300">Build your team and conquer together!</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Team Name Input */}
            <div>
              <label className="block text-white text-sm font-medium mb-3">Team Name *</label>
              <input
                type="text"
                placeholder="Enter your awesome team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full px-4 py-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Team Requirements */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
              <h4 className="text-blue-300 font-semibold mb-3">🏆 Team Requirements</h4>
              <div className="space-y-2 text-sm">
                <p className="text-blue-200">
                  <strong>{formatTeamSize(selectedEvent.minTeamSize, selectedEvent.maxTeamSize)}</strong>
                </p>
                <p className="text-blue-200">
                  Including you, need <strong>{selectedEvent.minTeamSize - 1}</strong> to <strong>{selectedEvent.maxTeamSize - 1}</strong> more members
                </p>
              </div>
            </div>

            {/* Team Members Section */}
            <div>
              <h4 className="text-white text-lg font-semibold mb-4">👥 Add Team Members</h4>
              
              {members.map((member, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-6 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-white font-medium">Member {index + 1} PID</label>
                    {members.length > 1 && (
                      <button 
                        onClick={() => handleRemoveMember(index)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1 rounded text-sm border border-red-500/30 transition-colors"
                        type="button"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder={`Enter PID of member ${index + 1}`}
                      value={member}
                      onChange={(e) => handleMemberChange(index, e.target.value)}
                      onBlur={() => {
                        if (member.trim()) {
                          validateMember(member, index);
                        }
                      }}
                      className="w-full px-4 py-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    
                    <div className="min-h-6">
                      {validating.includes(index) && (
                        <div className="flex items-center text-yellow-400 text-sm">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400 mr-2"></div>
                          Validating PID...
                        </div>
                      )}
                      {memberInfo[index] && (
                        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                          <div className="flex items-center text-green-300 text-sm">
                            <span className="mr-2">✅</span>
                            <div>
                              <strong>{memberInfo[index].name}</strong>
                              <span className="text-green-200 ml-2">
                                ({memberInfo[index].branch}) • Events: {memberInfo[index].eventsCount}/3
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {members.length < selectedEvent.maxTeamSize - 1 && (
                <button 
                  onClick={handleAddMember} 
                  className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 py-3 rounded-lg transition-all duration-300 hover:scale-105 mb-6"
                  type="button"
                >
                  ➕ Add Another Member
                </button>
              )}

              {/* Message Display */}
              {message && (
                <div className={`p-4 rounded-lg border ${
                  message.includes('successfully') 
                    ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                    : 'bg-red-500/20 text-red-300 border-red-500/30'
                }`}>
                  {message}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-6">
                <button 
                  onClick={() => {
                    setSelectedEvent(null);
                    setTeamName('');
                    setMembers(['']);
                    setMemberInfo({});
                    setMessage('');
                  }} 
                  className="flex-1 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 border border-gray-500/30 py-3 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
                  type="button"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateTeam} 
                  disabled={creating}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  type="button"
                >
                  {creating ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Team...
                    </span>
                  ) : 'Create Team'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Team Events List
  return (
    <div className="space-y-8">
      <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10">
        <h2 className="text-3xl font-bold text-white mb-2">Team Events</h2>
        <p className="text-gray-300">Join forces and compete as a team</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamEvents.map(event => (
          <div key={event._id} className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                {event.name}
              </h3>
              <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs font-medium">
                Team
              </span>
            </div>
            
            <p className="text-gray-300 text-sm mb-4 line-clamp-2">{event.description}</p>
            
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Team Size:</span>
                <span className="text-white">
                  {formatTeamSize(event.minTeamSize, event.maxTeamSize)}
                </span>
              </div>
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
            
            {user.eventsCount >= 3 ? (
              <button className="w-full bg-orange-500/20 text-orange-300 border border-orange-500/30 py-3 rounded-lg cursor-not-allowed" disabled>
                ⚠️ Event Limit Reached
              </button>
            ) : event.currentParticipants >= event.maxParticipants ? (
              <button className="w-full bg-red-500/20 text-red-300 border border-red-500/30 py-3 rounded-lg cursor-not-allowed" disabled>
                ❌ Event Full
              </button>
            ) : (
              <button 
                onClick={() => setSelectedEvent(event)}
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg transition-all duration-300 hover:scale-105"
              >
                🚀 Create Team
              </button>
            )}
          </div>
        ))}
      </div>

      {teamEvents.length === 0 && (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl text-white mb-2">No Team Events Available</h3>
          <p className="text-gray-400">Check back later for new team competitions.</p>
        </div>
      )}
    </div>
  );
};

export default TeamEvents;