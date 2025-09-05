"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

interface HardwareStatus {
  gpu: { detected: boolean; model: string; memory: number };
  ffmpeg: { available: boolean; hwaccel: boolean };
  network: { speed: number; latency: number; quality: 'excellent' | 'good' | 'poor' };
}

interface HardwareMonitorProps {
  status: HardwareStatus;
}

export function HardwareMonitor({ status }: HardwareMonitorProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getOverallStatus = () => {
    if (status.gpu.detected && status.ffmpeg.hwaccel) {
      return { label: 'Optimized', color: 'bg-green-500/20 text-green-400' };
    }
    if (status.gpu.detected || status.ffmpeg.available) {
      return { label: 'Accelerated', color: 'bg-blue-500/20 text-blue-400' };
    }
    return { label: 'Software', color: 'bg-yellow-500/20 text-yellow-400' };
  };

  const overall = getOverallStatus();

  if (showDetails) {
    return (
      <Card className="absolute top-16 right-4 w-80 bg-slate-800 border-slate-700 z-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center justify-between">
            Hardware Status
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowDetails(false)}
              className="text-white hover:bg-slate-700"
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="space-y-2">
            <h4 className="text-white font-medium">Graphics</h4>
            <div className="flex justify-between">
              <span className="text-slate-300">GPU</span>
              <Badge variant={status.gpu.detected ? "default" : "secondary"}>
                {status.gpu.detected ? status.gpu.model || 'Detected' : 'Not Available'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">VRAM</span>
              <span className="text-white">{status.gpu.memory || 0}GB</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-medium">Media Processing</h4>
            <div className="flex justify-between">
              <span className="text-slate-300">FFmpeg</span>
              <Badge variant={status.ffmpeg.available ? "default" : "secondary"}>
                {status.ffmpeg.available ? 'Available' : 'Not Found'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">HW Decode</span>
              <Badge variant={status.ffmpeg.hwaccel ? "default" : "secondary"}>
                {status.ffmpeg.hwaccel ? 'NVDEC' : 'Software'}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-medium">Network</h4>
            <div className="flex justify-between">
              <span className="text-slate-300">Speed</span>
              <span className="text-white">{status.network.speed.toFixed(1)} Mbps</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Latency</span>
              <span className="text-white">{status.network.latency}ms</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={`cursor-pointer ${overall.color}`}
      onClick={() => setShowDetails(true)}
    >
      {overall.label}
    </Badge>
  );
}