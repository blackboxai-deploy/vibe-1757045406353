"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NetworkStats {
  bandwidth: number;
  latency: number;
  packetLoss: number;
  jitter: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface ProxyConfig {
  enabled: boolean;
  type: 'http' | 'https' | 'socks5';
  host: string;
  port: number;
  username?: string;
  password?: string;
}

export function StreamManager() {
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    bandwidth: 45.2,
    latency: 12,
    packetLoss: 0.1,
    jitter: 2.3,
    quality: 'excellent'
  });

  const [proxyConfig, setProxyConfig] = useState<ProxyConfig>({
    enabled: false,
    type: 'http',
    host: '',
    port: 8080
  });

  const [dnsConfig, setDnsConfig] = useState({
    primary: '1.1.1.1',
    secondary: '1.0.0.1',
    dohEnabled: true
  });

  const [bufferConfig, setBufferConfig] = useState({
    preloadTime: 15,
    maxBufferSize: 30,
    adaptiveQuality: true
  });

  const [isTestingConnection, setIsTestingConnection] = useState(false);

  useEffect(() => {
    // Simulate network monitoring
    const interval = setInterval(() => {
      setNetworkStats(prev => ({
        ...prev,
        bandwidth: 40 + Math.random() * 20,
        latency: 10 + Math.random() * 10,
        packetLoss: Math.random() * 0.5,
        jitter: 1 + Math.random() * 3
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const response = await fetch('/api/network/test', { method: 'POST' });
      const results = await response.json();
      setNetworkStats(results);
    } catch (error) {
      console.error('Connection test failed:', error);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'fair': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const saveProxyConfig = async () => {
    try {
      await fetch('/api/network/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proxyConfig)
      });
    } catch (error) {
      console.error('Failed to save proxy config:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-700">
          <TabsTrigger value="status" className="text-white data-[state=active]:bg-purple-600">
            Status
          </TabsTrigger>
          <TabsTrigger value="proxy" className="text-white data-[state=active]:bg-purple-600">
            Proxy
          </TabsTrigger>
          <TabsTrigger value="dns" className="text-white data-[state=active]:bg-purple-600">
            DNS
          </TabsTrigger>
          <TabsTrigger value="buffer" className="text-white data-[state=active]:bg-purple-600">
            Buffer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center justify-between">
                  Network Quality
                  <Badge variant="outline" className={getQualityColor(networkStats.quality)}>
                    {networkStats.quality.toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Bandwidth</span>
                    <span className="text-white">{networkStats.bandwidth.toFixed(1)} Mbps</span>
                  </div>
                  <Progress value={(networkStats.bandwidth / 100) * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Latency</span>
                    <span className="text-white">{networkStats.latency.toFixed(0)}ms</span>
                  </div>
                  <Progress value={Math.max(0, 100 - networkStats.latency)} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Packet Loss</span>
                    <span className="text-white">{networkStats.packetLoss.toFixed(2)}%</span>
                  </div>
                  <Progress value={Math.max(0, 100 - (networkStats.packetLoss * 20))} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Connection Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={testConnection}
                  disabled={isTestingConnection}
                  className="w-full"
                >
                  {isTestingConnection ? 'Testing...' : 'Test Connection'}
                </Button>
                
                <div className="text-xs text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Jitter:</span>
                    <span>{networkStats.jitter.toFixed(1)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IPv6:</span>
                    <span className="text-green-400">Supported</span>
                  </div>
                  <div className="flex justify-between">
                    <span>MTU:</span>
                    <span>1500</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="proxy" className="mt-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Proxy Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={proxyConfig.enabled}
                  onChange={(e) => setProxyConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded"
                />
                <label className="text-white text-sm">Enable Proxy</label>
              </div>

              {proxyConfig.enabled && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Type</label>
                      <select
                        value={proxyConfig.type}
                        onChange={(e) => setProxyConfig(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white text-sm"
                      >
                        <option value="http">HTTP</option>
                        <option value="https">HTTPS</option>
                        <option value="socks5">SOCKS5</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Port</label>
                      <Input
                        type="number"
                        value={proxyConfig.port}
                        onChange={(e) => setProxyConfig(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Host</label>
                    <Input
                      value={proxyConfig.host}
                      onChange={(e) => setProxyConfig(prev => ({ ...prev, host: e.target.value }))}
                      placeholder="proxy.example.com"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Username (optional)</label>
                      <Input
                        value={proxyConfig.username || ''}
                        onChange={(e) => setProxyConfig(prev => ({ ...prev, username: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Password (optional)</label>
                      <Input
                        type="password"
                        value={proxyConfig.password || ''}
                        onChange={(e) => setProxyConfig(prev => ({ ...prev, password: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <Button onClick={saveProxyConfig} className="w-full">
                    Save Proxy Settings
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dns" className="mt-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">DNS Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Primary DNS</label>
                  <Input
                    value={dnsConfig.primary}
                    onChange={(e) => setDnsConfig(prev => ({ ...prev, primary: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Secondary DNS</label>
                  <Input
                    value={dnsConfig.secondary}
                    onChange={(e) => setDnsConfig(prev => ({ ...prev, secondary: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={dnsConfig.dohEnabled}
                  onChange={(e) => setDnsConfig(prev => ({ ...prev, dohEnabled: e.target.checked }))}
                  className="rounded"
                />
                <label className="text-white text-sm">Enable DNS-over-HTTPS (DoH)</label>
              </div>

              <div className="bg-slate-700/50 p-3 rounded-lg">
                <h4 className="text-white text-sm font-medium mb-2">Recommended DNS Servers</h4>
                <div className="space-y-1 text-xs text-slate-300">
                  <div>Cloudflare: 1.1.1.1, 1.0.0.1</div>
                  <div>Google: 8.8.8.8, 8.8.4.4</div>
                  <div>Quad9: 9.9.9.9, 149.112.112.112</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buffer" className="mt-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Buffer Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-2">
                  Preload Time: {bufferConfig.preloadTime}s
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={bufferConfig.preloadTime}
                  onChange={(e) => setBufferConfig(prev => ({ ...prev, preloadTime: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-2">
                  Max Buffer Size: {bufferConfig.maxBufferSize}s
                </label>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={bufferConfig.maxBufferSize}
                  onChange={(e) => setBufferConfig(prev => ({ ...prev, maxBufferSize: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={bufferConfig.adaptiveQuality}
                  onChange={(e) => setBufferConfig(prev => ({ ...prev, adaptiveQuality: e.target.checked }))}
                  className="rounded"
                />
                <label className="text-white text-sm">Adaptive Quality (ABR)</label>
              </div>

              <div className="bg-slate-700/50 p-3 rounded-lg">
                <h4 className="text-white text-sm font-medium mb-2">Buffer Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Current Buffer</span>
                    <span className="text-white">12.3s</span>
                  </div>
                  <Progress value={41} className="h-2" />
                  <div className="text-xs text-slate-400">
                    Optimal buffer range: 5-15 seconds
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}