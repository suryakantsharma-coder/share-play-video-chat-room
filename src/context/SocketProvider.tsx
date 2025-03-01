'use client';
import React, { createContext, useMemo, useContext, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

export const useSocket = (): Socket | null => {
  return useContext(SocketContext);
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const url: string = 'https://webrtc-server-5106.onrender.com';
  // const url: string = 'http://localhost:8000';
  const socket = useMemo(() => io(url, { transports: ['websocket'], secure: true }), []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
