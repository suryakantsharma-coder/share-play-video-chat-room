'use client'; // Ensures it runs only on the client

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRoom } from './RoomProvider';

const WebSocketContext = createContext<Socket | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const url = 'http://localhost:8000';

  const {
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncoming,
    handleNegoNeedFinal,
  } = useRoom();

  // socket event handlers
  const onMessageReceive = (event: MessageEvent) => {
    console.log('Received:', event);
  };

  const onError = (error: Event) => {
    console.error('WebSocket Error:', error);
  };

  const onConnectConnected = () => {
    console.log('Connected');
  };

  const onConnectionDisconnected = () => {
    console.log('Disconnected');
  };

  const socket = useMemo(() => io(url, { transports: ['websocket'], secure: true }), []);

  useEffect(() => {
    // const ws = new WebSocket(url);
    // console.log({ url });
    // ws.onopen = () => onConnectConnected();
    // ws.onmessage = (event) => onMessageReceive(event);
    // ws.onerror = (error) => onError(error);
    // ws.onclose = () => onConnectionDisconnected;

    socket.on('connect', onConnectConnected);
    socket.on('error', onError);
    socket.on('disconnect', onConnectionDisconnected);

    if (socket !== null) {
      socket.on('user:joined', handleUserJoined);
      socket.on('incomming:call', handleIncomingCall);
      socket.on('call:accepted', handleCallAccepted);
      socket.on('peer:nego:needed', handleNegoNeedIncoming);
      socket.on('peer:nego:final', handleNegoNeedFinal);
    }
    return () => {
      if (socket !== null) {
        socket.off('user:joined', handleUserJoined);
        socket.off('incomming:call', handleIncomingCall);
        socket.off('call:accepted', handleCallAccepted);
        socket.off('peer:nego:needed', handleNegoNeedIncoming);
        socket.off('peer:nego:final', handleNegoNeedFinal);
      }
    };
  }, [url]);

  return <WebSocketContext.Provider value={socket}>{children}</WebSocketContext.Provider>;
};

// Custom hook for using WebSocket
export const useWebSocket = () => {
  return useContext(WebSocketContext);
};
