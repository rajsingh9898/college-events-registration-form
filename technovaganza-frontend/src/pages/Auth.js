import React, { useState } from 'react';
import Login from '../components/auth/Login.jsx';
import Register from '../components/auth/Register.jsx';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      <div className="mt-8 flex items-center justify-center min-h-screen bg-background-dark">
        {/* Top Header with Logo + College Name */}
        <header className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-white/20 max-w-[90vw]">
          <img
            src="https://tse1.mm.bing.net/th/id/OIP.M1q0n44vny5M4OUvsYjA0AAAAA?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3"
            alt="SRMS College Logo"
            className="w-14 h-14 rounded-full border-2 border-white shadow-md flex-shrink-0"
          />
          <div className="flex flex-col items-center min-w-0">
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white glow-text whitespace-nowrap overflow-hidden text-ellipsis">
              SRMS College of Engineering, Technology & Research, Bareilly
            </h2>
          </div>
        </header>

        <div className="mt-12 w-full max-w-md p-8 space-y-8 bg-background-dark/50 rounded-xl shadow-2xl shadow-primary/20 border border-white/10">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Technovaganza 2025</h1>
            <p className="mt-2 text-sm text-gray-400">SRMS CET&R - Technical Festival</p>
            <div className="mt-4 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          </div>

          {/* Tab Navigation */}
          <div>
            <div className="flex border-b border-gray-700">
              <button
                className={`w-1/2 py-4 px-1 text-center text-sm font-medium border-b-2 transition-colors ${isLogin
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-primary/50'
                  }`}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button
                className={`w-1/2 py-4 px-1 text-center text-sm font-medium border-b-2 transition-colors ${!isLogin
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-primary/50'
                  }`}
                onClick={() => setIsLogin(false)}
              >
                Register
              </button>
            </div>
          </div>

          {/* Auth Forms */}
          <div>
            {isLogin ? (
              <Login switchToRegister={() => setIsLogin(false)} />
            ) : (
              <Register switchToLogin={() => setIsLogin(true)} />
            )}
          </div>
        </div>

        {/* Footer Credits - Left Side */}
        <footer className="absolute bottom-4 left-4 text-left">
          <div className="bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
            <p className="text-xs text-gray-400">
              Designed & Created By -
            </p>
            <div className="flex flex-col mt-1 space-y-1">
              <span className="text-xs text-gray-300">Raj Singh</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Auth;