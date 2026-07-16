import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [liveNotifications, setLiveNotifications] = useState([]);
  const [dashboardUpdate, setDashboardUpdate] = useState(null);
  const [roadmapUpdate, setRoadmapUpdate] = useState(null);

  useEffect(() => {
    if (!user || !token) return;

    // Connect to backend Socket.io server
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Join user-specific room for targeted broadcasts
      socket.emit('join_user', user._id);
      console.log('🔌 Real-time connected, joined room:', user._id);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('🔌 Real-time disconnected');
    });

    // New notification pushed from MongoDB post-save hook
    socket.on('new_notification', (notification) => {
      console.log('🔔 New real-time notification:', notification.title);
      setLiveNotifications((prev) => [notification, ...prev]);
    });

    // Dashboard data changed (analysis completed)
    socket.on('dashboard_update', (data) => {
      console.log('📊 Real-time dashboard update:', data);
      setDashboardUpdate({ ...data, timestamp: Date.now() });
    });

    // Roadmap generated
    socket.on('roadmap_update', (data) => {
      console.log('🗺️ Real-time roadmap update:', data);
      setRoadmapUpdate({ ...data, timestamp: Date.now() });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?._id, token]);

  const clearLiveNotifications = () => setLiveNotifications([]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        liveNotifications,
        dashboardUpdate,
        roadmapUpdate,
        clearLiveNotifications,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};
