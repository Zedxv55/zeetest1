import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const GlassBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-500 bg-fixed"
         style={{ backgroundColor: theme === 'dark' ? '#0a0a0a' : '#f0f2f5' }}>
      
      {/* Vibrant Blobs */}
      <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden`}>
        {/* Top Left - Blue/Cyan */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-30 animate-pulse"
             style={{ backgroundColor: theme === 'dark' ? '#00d4ff' : '#0096c7' }} />
             
        {/* Bottom Right - Purple */}
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-30 animate-pulse"
             style={{ backgroundColor: theme === 'dark' ? '#bb86fc' : '#7209b7', animationDelay: '2s' }} />
             
        {/* Middle Center - Pink (lighter) */}
        <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20"
             style={{ backgroundColor: theme === 'dark' ? '#ff006e' : '#ffb7b2' }} />
             
        {theme === 'light' && (
           <div className="absolute top-[10%] right-[20%] w-[20%] h-[20%] rounded-full blur-[80px] bg-yellow-300 opacity-40" />
        )}
      </div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
};