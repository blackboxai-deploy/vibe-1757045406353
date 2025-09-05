"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

export function NetworkStatus() {
  const [status, setStatus] = useState({
    connected: true,
    speed: 45.2,
    quality: 'excellent' as 'excellent' | 'good' | 'fair' | 'poor'
  });

  useEffect(() => {
    const checkConnection = () => {
      setStatus(prev => ({
        ...prev,
        connected: navigator.onLine,
        speed: 40 + Math.random() * 20
      }));
    };

    const interval = setInterval(checkConnection, 3000);
    checkConnection();

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (!status.connected) return 'bg-red-500/20 text-red-400';
    switch (status.quality) {
      case 'excellent': return 'bg-green-500/20 text-green-400';
      case 'good': return 'bg-blue-500/20 text-blue-400';
      case 'fair': return 'bg-yellow-500/20 text-yellow-400';
      case 'poor': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <Badge variant="outline" className={getStatusColor()}>
      {status.connected ? `${status.speed.toFixed(1)} Mbps` : 'Offline'}
    </Badge>
  );
}