import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const MASTER_URL = import.meta.env.VITE_MASTER_URL || 'http://localhost:4000';

export const useSocket = (onNodesUpdate, onAlert) => {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(MASTER_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('nodes:update', onNodesUpdate);
    socket.on('node:alert', onAlert);

    return () => socket.disconnect();
  }, []);

  return socketRef;
};