"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface StreamProvider {
  id: string;
  name: string;
  url: string;
  username: string;
  password: string;
  status: 'connected' | 'disconnected' | 'connecting';
}

export default function SettingsPage() {
  const [providers, setProviders] = useState<StreamProvider[]>([]);
  const [newProvider, setNewProvider] = useState({
    name: '',
    url: '',
    username: '',
    password: ''
  });
  const [isAddingProvider, setIsAddingProvider] = useState(false);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const response = await fetch('/api/providers');
      const data = await response.json();
      setProviders(data);
    } catch (error) {
      console.error('Failed to load providers:', error);
    }
  };

  const addProvider = async () => {
    if (!newProvider.name || !newProvider.url || !newProvider.username || !newProvider.password) {
      alert('Please fill all fields');
      return;
    }

    setIsAddingProvider(true);
    try {
      const response = await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProvider)
      });

      if (response.ok) {
        setNewProvider({ name: '', url: '', username: '', password: '' });
        loadProviders();
        alert('Provider added successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to add provider: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to add provider:', error);
      alert('Failed to add provider');
    } finally {
      setIsAddingProvider(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-800 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.history.back()}
              >
                ← Back
              </Button>
              <h1 className="text-2xl font-bold text-white">Settings</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="providers" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-700 mb-6">
            <TabsTrigger value="providers" className="text-white data-[state=active]:bg-purple-600">
              Providers
            </TabsTrigger>
            <TabsTrigger value="playback" className="text-white data-[state=active]:bg-purple-600">
              Playback
            </TabsTrigger>
            <TabsTrigger value="network" className="text-white data-[state=active]:bg-purple-600">
              Network
            </TabsTrigger>
            <TabsTrigger value="advanced" className="text-white data-[state=active]:bg-purple-600">
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="providers">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add New Provider */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Add IPTV Provider</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-300 block mb-1">Provider Name</label>
                    <Input
                      value={newProvider.name}
                      onChange={(e) => setNewProvider(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="My IPTV Provider"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-slate-300 block mb-1">Server URL</label>
                    <Input
                      value={newProvider.url}
                      onChange={(e) => setNewProvider(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="http://provider.com:8080"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-slate-300 block mb-1">Username</label>
                      <Input
                        value={newProvider.username}
                        onChange={(e) => setNewProvider(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="username"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-300 block mb-1">Password</label>
                      <Input
                        type="password"
                        value={newProvider.password}
                        onChange={(e) => setNewProvider(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="password"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={addProvider}
                    disabled={isAddingProvider}
                    className="w-full"
                  >
                    {isAddingProvider ? 'Testing Connection...' : 'Add Provider'}
                  </Button>

                  <div className="bg-slate-700/50 p-3 rounded-lg text-xs text-slate-300">
                    <p className="font-medium mb-2">Supported Formats:</p>
                    <p>• Xtream Codes API</p>
                    <p>• M3U/M3U8 Playlists</p>
                    <p>• RTMP/RTSP Streams</p>
                    <p>• HLS Live Streams</p>
                  </div>
                </CardContent>
              </Card>

              {/* Existing Providers */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Your Providers ({providers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {providers.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-slate-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <div className="w-8 h-8 bg-slate-600 rounded"></div>
                      </div>
                      <p className="text-slate-400">No providers configured</p>
                      <p className="text-slate-500 text-sm">Add your first IPTV provider to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {providers.map((provider) => (
                        <div key={provider.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                              <div className="w-4 h-4 bg-white rounded"></div>
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{provider.name}</h4>
                              <p className="text-slate-400 text-sm">{provider.url}</p>
                            </div>
                          </div>
                          <Badge 
                            variant={provider.status === 'connected' ? "default" : "secondary"}
                            className={
                              provider.status === 'connected' 
                                ? "bg-green-500/20 text-green-400" 
                                : "bg-red-500/20 text-red-400"
                            }
                          >
                            {provider.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="playback">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Video Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-300 block mb-2">Default Quality</label>
                    <select className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white text-sm">
                      <option>Auto (Adaptive)</option>
                      <option>4K (2160p)</option>
                      <option>FHD (1080p)</option>
                      <option>HD (720p)</option>
                      <option>SD (480p)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-slate-300 block mb-2">Video Renderer</label>
                    <select className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white text-sm">
                      <option>WebGL (Hardware Accelerated)</option>
                      <option>Canvas2D</option>
                      <option>CSS Transform</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <label className="text-white text-sm">Enable Hardware Decoding</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <label className="text-white text-sm">Use GPU Memory for Buffers</label>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Audio Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-300 block mb-2">Audio Output</label>
                    <select className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white text-sm">
                      <option>Default System Output</option>
                      <option>Speakers (Realtek)</option>
                      <option>Headphones (USB)</option>
                      <option>HDMI Audio Output</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-slate-300 block mb-2">Volume Boost: 120%</label>
                    <input type="range" min="50" max="200" defaultValue="120" className="w-full" />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <label className="text-white text-sm">Enable Volume Normalization</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <label className="text-white text-sm">Dolby/DTS Passthrough</label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="network">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Connection Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-300 block mb-2">Connection Timeout</label>
                    <select className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white text-sm">
                      <option>10 seconds</option>
                      <option>15 seconds</option>
                      <option>30 seconds</option>
                      <option>60 seconds</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-slate-300 block mb-2">Buffer Size: 15 seconds</label>
                    <input type="range" min="5" max="60" defaultValue="15" className="w-full" />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <label className="text-white text-sm">Enable Adaptive Streaming</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <label className="text-white text-sm">Prefer IPv6 Connections</label>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-300 block mb-2">Concurrent Streams</label>
                    <select className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white text-sm">
                      <option>1 stream</option>
                      <option>2 streams</option>
                      <option>4 streams (Quad view)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-slate-300 block mb-2">CPU Usage Limit: 80%</label>
                    <input type="range" min="25" max="100" defaultValue="80" className="w-full" />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <label className="text-white text-sm">Enable Background Processing</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <label className="text-white text-sm">Low Latency Mode</label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="advanced">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">System Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Application Version</span>
                    <span className="text-white">StreamForge Pro v1.0.0</span>
                  </div>
                  <Separator className="bg-slate-600" />
                  <div className="flex justify-between">
                    <span className="text-slate-300">GPU</span>
                    <span className="text-white">NVIDIA RTX 3080 (10GB)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">FFmpeg</span>
                    <span className="text-white">6.1.1 (NVENC/NVDEC)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">WebGL</span>
                    <span className="text-white">2.0 Supported</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">OpenGL</span>
                    <span className="text-white">4.6 Compatible</span>
                  </div>
                  <Separator className="bg-slate-600" />
                  <div className="flex justify-between">
                    <span className="text-slate-300">Platform</span>
                    <span className="text-white">Windows 10 Pro</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Architecture</span>
                    <span className="text-white">x64</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Experimental Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white text-sm">Vulkan Renderer</h4>
                      <p className="text-slate-400 text-xs">Next-gen GPU acceleration</p>
                    </div>
                    <input type="checkbox" className="rounded" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white text-sm">AV1 Hardware Decode</h4>
                      <p className="text-slate-400 text-xs">Latest codec support</p>
                    </div>
                    <input type="checkbox" className="rounded" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white text-sm">AI Upscaling</h4>
                      <p className="text-slate-400 text-xs">ML-powered quality enhancement</p>
                    </div>
                    <input type="checkbox" className="rounded" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white text-sm">Multi-GPU Support</h4>
                      <p className="text-slate-400 text-xs">Use multiple GPUs for rendering</p>
                    </div>
                    <input type="checkbox" className="rounded" />
                  </div>
                  
                  <Button className="w-full mt-4">Save Advanced Settings</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}