"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

import { ChannelBrowser } from '@/components/ChannelBrowser';
import { MediaPlayer } from '@/components/MediaPlayer';
import { StreamManager } from '@/components/StreamManager';
import { NetworkStatus } from '@/components/NetworkStatus';
import { HardwareMonitor } from '@/components/HardwareMonitor';

interface StreamProvider {
  id: string;
  name: string;
  url: string;
  username: string;
  password: string;
  status: 'connected' | 'disconnected' | 'connecting';
}

interface Channel {
  id: string;
  name: string;
  category: string;
  logo: string;
  stream_url: string;
  epg_id?: string;
  quality: 'HD' | 'FHD' | '4K' | 'SD';
}

export default function Dashboard() {
  const [providers, setProviders] = useState<StreamProvider[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [hardwareStatus, setHardwareStatus] = useState({
    gpu: { detected: false, model: '', memory: 0 },
    ffmpeg: { available: false, hwaccel: false },
    network: { speed: 0, latency: 0, quality: 'excellent' as 'excellent' | 'good' | 'poor' }
  });

  useEffect(() => {
    // Initialize hardware detection
    detectHardware();
    // Load saved providers
    loadProviders();
    // Load channels
    loadChannels();
    // Initialize FFmpeg
    initializeFFmpeg();
  }, []);

  const detectHardware = async () => {
    try {
      const response = await fetch('/api/hardware/detect');
      const hardware = await response.json();
      setHardwareStatus(hardware);
    } catch (error) {
      console.error('Hardware detection failed:', error);
    }
  };

  const loadProviders = async () => {
    try {
      const response = await fetch('/api/providers');
      const data = await response.json();
      setProviders(data);
    } catch (error) {
      console.error('Failed to load providers:', error);
    }
  };

  const loadChannels = async () => {
    try {
      const response = await fetch('/api/channels');
      const data = await response.json();
      setChannels(data.channels || []);
    } catch (error) {
      console.error('Failed to load channels:', error);
    }
  };

  const initializeFFmpeg = async () => {
    try {
      const response = await fetch('/api/ffmpeg/initialize', { method: 'POST' });
      const result = await response.json();
      console.log('FFmpeg initialized:', result);
    } catch (error) {
      console.error('FFmpeg initialization failed:', error);
    }
  };

  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         channel.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || channel.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(channels.map(ch => ch.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-800 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <h1 className="text-2xl font-bold text-white">StreamForge Pro</h1>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                Hardware Accelerated
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <NetworkStatus />
              <HardwareMonitor status={hardwareStatus} />
              <Button variant="outline" size="sm">
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">
          {/* Left Sidebar - Channel Browser */}
          <div className="col-span-3">
            <Card className="h-full bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center justify-between">
                  Channels
                  <Badge variant="outline" className="text-xs">
                    {filteredChannels.length}
                  </Badge>
                </CardTitle>
                <div className="space-y-2">
                  <Input
                    placeholder="Search channels..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white text-sm"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ChannelBrowser
                  channels={filteredChannels}
                  onChannelSelect={setCurrentChannel}
                  selectedChannel={currentChannel}
                />
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Media Player */}
          <div className="col-span-9">
            <div className="space-y-6">
              {/* Media Player */}
              <Card className="bg-black border-slate-700 overflow-hidden">
                <CardContent className="p-0">
                  <MediaPlayer
                    channel={currentChannel}
                    onPlayStateChange={setIsPlaying}
                    hardwareAccel={hardwareStatus.gpu.detected}
                  />
                </CardContent>
              </Card>

              {/* Control Panel */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <Tabs defaultValue="playback" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 bg-slate-700">
                      <TabsTrigger value="playback" className="text-white data-[state=active]:bg-purple-600">
                        Playback
                      </TabsTrigger>
                      <TabsTrigger value="audio" className="text-white data-[state=active]:bg-purple-600">
                        Audio
                      </TabsTrigger>
                      <TabsTrigger value="subtitles" className="text-white data-[state=active]:bg-purple-600">
                        Subtitles
                      </TabsTrigger>
                      <TabsTrigger value="network" className="text-white data-[state=active]:bg-purple-600">
                        Network
                      </TabsTrigger>
                      <TabsTrigger value="advanced" className="text-white data-[state=active]:bg-purple-600">
                        Advanced
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="playback" className="mt-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm text-slate-300">Video Quality</label>
                          <select className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white text-sm">
                            <option>Auto (Adaptive)</option>
                            <option>4K (2160p)</option>
                            <option>FHD (1080p)</option>
                            <option>HD (720p)</option>
                            <option>SD (480p)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-slate-300">Renderer</label>
                          <select className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white text-sm">
                            <option>WebGL (GPU)</option>
                            <option>Canvas2D</option>
                            <option>CSS Transform</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-slate-300">Buffer</label>
                          <Progress value={75} className="w-full" />
                          <div className="text-xs text-slate-400">15.2s buffered</div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="audio" className="mt-4">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm text-slate-300">Volume Boost</label>
                            <Progress value={60} className="w-full" />
                            <div className="text-xs text-slate-400">+12dB gain applied</div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm text-slate-300">Audio Track</label>
                            <select className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white text-sm">
                              <option>English (Stereo)</option>
                              <option>English (5.1)</option>
                              <option>Spanish (Stereo)</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-slate-300">Equalizer</label>
                          <div className="grid grid-cols-5 gap-2">
                            {['60Hz', '170Hz', '310Hz', '600Hz', '1kHz'].map((freq, i) => (
                              <div key={freq} className="text-center">
                                <div className="text-xs text-slate-400 mb-1">{freq}</div>
                                <Progress value={50 + (i * 10)} className="h-16 w-4 mx-auto rotate-180" style={{writingMode: 'vertical-lr'}} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="subtitles" className="mt-4">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm text-slate-300">Subtitle Track</label>
                            <select className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white text-sm">
                              <option>None</option>
                              <option>English (SRT)</option>
                              <option>English (ASS)</option>
                              <option>Spanish (SRT)</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm text-slate-300">Font Size</label>
                            <Progress value={65} className="w-full" />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm text-slate-300">Sync Delay</label>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">-0.5s</Button>
                              <div className="text-white text-sm">+0.2s</div>
                              <Button variant="outline" size="sm">+0.5s</Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm text-slate-300">Position</label>
                            <select className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white text-sm">
                              <option>Bottom Center</option>
                              <option>Bottom Left</option>
                              <option>Bottom Right</option>
                              <option>Top Center</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="network" className="mt-4">
                      <StreamManager />
                    </TabsContent>

                    <TabsContent value="advanced" className="mt-4">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-white font-medium">Hardware Acceleration</h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-300">GPU Decoding</span>
                              <Badge variant={hardwareStatus.gpu.detected ? "default" : "secondary"}>
                                {hardwareStatus.gpu.detected ? "NVDEC" : "Disabled"}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-300">WebGL Rendering</span>
                              <Badge variant="default">Enabled</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-300">FFmpeg HW Accel</span>
                              <Badge variant={hardwareStatus.ffmpeg.hwaccel ? "default" : "secondary"}>
                                {hardwareStatus.ffmpeg.hwaccel ? "Active" : "Software"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-white font-medium">Performance</h3>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-300">GPU Memory</span>
                                <span className="text-white">2.1GB / 8GB</span>
                              </div>
                              <Progress value={26} className="w-full mt-1" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-300">CPU Usage</span>
                                <span className="text-white">15%</span>
                              </div>
                              <Progress value={15} className="w-full mt-1" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-300">Network</span>
                                <span className="text-white">45 Mbps</span>
                              </div>
                              <Progress value={90} className="w-full mt-1" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}