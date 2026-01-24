import React, { useState } from 'react';
import AdminLogin from './AdminLogin.jsx';
import EventForm from './EventForm.jsx';
import EventList from './EventList.jsx';
import Statistics from './Statistics.jsx';

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState('events');

  const handleAdminLogin = (adminData) => {
    setAdmin(adminData);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdmin(null);
  };

  if (!admin) {
    return <AdminLogin onAdminLogin={handleAdminLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-background-light dark:bg-background-dark p-6 flex flex-col justify-between border-r border-primary/10 dark:border-primary/20">
        <div className="flex flex-col gap-8">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Technovaganza '25</h1>
          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'events' 
                  ? 'bg-primary text-white' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M244.8,150.4a8,8,0,0,1-11.2-1.6A51.6,51.6,0,0,0,192,128a8,8,0,0,1-7.37-4.89,8,8,0,0,1,0-6.22A8,8,0,0,1,192,112a24,24,0,1,0-23.24-30,8,8,0,1,1-15.5-4A40,40,0,1,1,219,117.51a67.94,67.94,0,0,1,27.43,21.68A8,8,0,0,1,244.8,150.4ZM190.92,212a8,8,0,1,1-13.84,8,57,57,0,0,0-98.16,0,8,8,0,1,1-13.84-8,72.06,72.06,0,0,1,33.74-29.92,48,48,0,1,1,58.36,0A72.06,72.06,0,0,1,190.92,212ZM128,176a32,32,0,1,0-32-32A32,32,0,0,0,128,176ZM72,120a8,8,0,0,0-8-8A24,24,0,1,1,87.24,82a8,8,0,1,0,15.5-4A40,40,0,1,0,37,117.51,67.94,67.94,0,0,0,9.6,139.19a8,8,0,1,0,12.8,9.61A51.6,51.6,0,0,1,64,128,8,8,0,0,0,72,120Z"></path>
              </svg>
              <span>Manage Events</span>
            </button>
            <button 
              onClick={() => setActiveTab('create')}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'create' 
                  ? 'bg-primary text-white' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z"></path>
              </svg>
              <span>Create Event</span>
            </button>
            <button 
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'stats' 
                  ? 'bg-primary text-white' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M216,40H136V24a8,8,0,0,0-16,0V40H40A16,16,0,0,0,24,56V176a16,16,0,0,0,16,16H79.36L57.75,219a8,8,0,0,0,12.5,10l29.59-37h56.32l29.59,37a8,8,0,1,0,12.5-10l-21.61-27H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,136H40V56H216V176ZM104,120v24a8,8,0,0,1-16,0V120a8,8,0,0,1,16,0Zm32-16v40a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm32-16v56a8,8,0,0,1-16,0V88a8,8,0,0,1,16,0Z"></path>
              </svg>
              <span>Statistics</span>
            </button>
          </nav>
        </div>
        
        <div className="flex flex-col gap-2">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M218.83,103.77l-80-75.48a1.14,1.14,0,0,1-.11-.11,16,16,0,0,0-21.53,0l-.11.11L37.17,103.77A16,16,0,0,0,32,115.55V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V160h32v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V115.55A16,16,0,0,0,218.83,103.77ZM208,208H160V160a16,16,0,0,0-16-16H112a16,16,0,0,0-16,16v48H48V115.55l.11-.1L128,40l79.9,75.43.11.1Z"></path>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Welcome, <strong className="text-primary">{admin.username}</strong>
            </div>
          </div>

          {/* Content */}
          <div className="fade-in">
            {activeTab === 'events' && <EventList />}
            {activeTab === 'create' && <EventForm />}
            {activeTab === 'stats' && <Statistics />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;