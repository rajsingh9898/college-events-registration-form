import React, { useState } from 'react';
import Login from '../components/auth/Login.jsx';
import Register from '../components/auth/Register.jsx';

const Home = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (<>
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden">
     
      {/* Background Video */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="background-video"
      >
        <source 
          src="https://assets.mixkit.co/videos/preview/mixkit-futuristic-scenery-with-a-staircase-leading-to-the-sky-42974-large.mp4" 
          type="video/mp4" 
        />
      </video>
      <div  className='absolute inset-0 flex items-center justify-center text-white text-4xl font-bold'>Hello world</div>
      
      {/* Main Content */}
      <div className="relative z-10 flex w-full max-w-6xl">
        {/* Left Side - Hero Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white animate-fade-in-down [text-shadow:_0_4px_16px_theme(colors.primary/50%)]">
            Technovaganza 2025
          </h1>
          <p className="mt-4 text-lg md:text-xl font-normal text-slate-300 max-w-2xl">
            SRMS CET&R
          </p>
          <p className="mt-2 text-md md:text-lg font-light text-slate-300">
            Annual Technical Festival
          </p>
        </div>

        {/* Right Side - Auth Section */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {isLogin ? (
              <Login switchToRegister={() => setIsLogin(false)} />
            ) : (
              <Register switchToLogin={() => setIsLogin(true)} />
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Home;