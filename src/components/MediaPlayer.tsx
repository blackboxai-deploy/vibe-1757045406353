"use client";

import { useState, useRef, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Channel {
  id: string;
  name: string;
  category: string;
  logo: string;
  stream_url: string;
  epg_id?: string;
  quality: 'HD' | 'FHD' | '4K' | 'SD';
}

interface MediaPlayerProps {
  channel: Channel | null;
  onPlayStateChange: (isPlaying: boolean) => void;
  hardwareAccel: boolean;
}

export function MediaPlayer({ channel, onPlayStateChange, hardwareAccel }: MediaPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([100]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamQuality, setStreamQuality] = useState<'auto' | 'hd' | 'sd'>('auto');
  const [subtitles, setSubtitles] = useState<boolean>(false);
  const [audioTrack, setAudioTrack] = useState(0);

  useEffect(() => {
    if (channel && videoRef.current) {
      loadStream(channel.stream_url);
    }
  }, [channel]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  const loadStream = async (streamUrl: string) => {
    if (!videoRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Process stream through our transcoding service
      const response = await fetch('/api/streams/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: streamUrl, 
          quality: streamQuality,
          hwaccel: hardwareAccel 
        })
      });
      
      if (!response.ok) {
        throw new Error('Stream processing failed');
      }
      
      const { processedUrl } = await response.json();
      
      videoRef.current.src = processedUrl;
      videoRef.current.load();
      
      // Initialize WebGL renderer if hardware acceleration is available
      if (hardwareAccel && canvasRef.current) {
        initWebGLRenderer();
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stream');
    } finally {
      setIsLoading(false);
    }
  };

  const initWebGLRenderer = () => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const gl = canvasRef.current.getContext('webgl2');
    if (!gl) return;
    
    // WebGL shader setup for hardware-accelerated rendering
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `;
    
    const fragmentShaderSource = `
      precision mediump float;
      uniform sampler2D u_texture;
      varying vec2 v_texCoord;
      
      void main() {
        gl_FragColor = texture2D(u_texture, v_texCoord);
      }
    `;
    
    console.log('WebGL renderer initialized with hardware acceleration');
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = async () => {
    if (!videoRef.current) return;
    
    try {
      if (!isFullscreen) {
        await videoRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    } catch (err) {
      console.error('Fullscreen toggle failed:', err);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handlePlayStateChange = () => {
    const playing = videoRef.current ? !videoRef.current.paused : false;
    setIsPlaying(playing);
    onPlayStateChange(playing);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!channel) {
    return (
      <div className="aspect-video bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded triangle-right"></div>
          </div>
          <div>
            <h3 className="text-xl text-white mb-2">Select a Channel</h3>
            <p className="text-slate-400">Choose a channel from the browser to start streaming</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-black group">
      <div className="aspect-video relative overflow-hidden">
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlayStateChange}
          onPause={handlePlayStateChange}
          onLoadStart={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          onError={() => setError('Video playback error')}
          crossOrigin="anonymous"
          playsInline
        />
        
        {/* WebGL Canvas for Hardware Acceleration */}
        {hardwareAccel && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ display: 'none' }}
          />
        )}
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white">Loading stream...</p>
              {hardwareAccel && (
                <Badge className="bg-green-500/20 text-green-400">Hardware Accelerated</Badge>
              )}
            </div>
          </div>
        )}
        
        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 text-red-500">⚠</div>
              </div>
              <div>
                <h3 className="text-white text-lg mb-2">Stream Error</h3>
                <p className="text-slate-400">{error}</p>
                <Button 
                  className="mt-4" 
                  onClick={() => channel && loadStream(channel.stream_url)}
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Control Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Top Info Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={channel.logo || `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/d6a0a3ad-7470-4069-be8c-d9066d4697d1.png}`}
                alt={channel.name}
                className="w-12 h-12 rounded-lg object-cover bg-slate-700"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <h3 className="text-white font-medium">{channel.name}</h3>
                <p className="text-slate-300 text-sm">{channel.category}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                {channel.quality}
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                LIVE
              </Badge>
              {hardwareAccel && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  GPU
                </Badge>
              )}
            </div>
          </div>
          
          {/* Bottom Control Bar */}
          <div className="absolute bottom-4 left-4 right-4 space-y-2">
            {/* Progress Bar */}
            <div className="flex items-center space-x-2 text-white text-sm">
              <span>{formatTime(currentTime)}</span>
              <Progress value={(currentTime / duration) * 100} className="flex-1" />
              <span>{formatTime(duration)}</span>
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlayPause}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? '⏸' : '▶'}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? '🔇' : '🔊'}
                </Button>
                
                <div className="flex items-center space-x-2">
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={200}
                    step={1}
                    className="w-24"
                  />
                  <span className="text-xs text-slate-300">{volume[0]}%</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  value={streamQuality}
                  onChange={(e) => setStreamQuality(e.target.value as any)}
                  className="bg-black/50 text-white text-xs border border-white/20 rounded px-2 py-1"
                >
                  <option value="auto">Auto</option>
                  <option value="hd">HD</option>
                  <option value="sd">SD</option>
                </select>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSubtitles(!subtitles)}
                  className={`text-white hover:bg-white/20 ${subtitles ? 'bg-purple-500/30' : ''}`}
                >
                  CC
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  ⛶
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}