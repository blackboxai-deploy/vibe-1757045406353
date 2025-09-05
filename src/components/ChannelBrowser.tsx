"use client";

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Channel {
  id: string;
  name: string;
  category: string;
  logo: string;
  stream_url: string;
  epg_id?: string;
  quality: 'HD' | 'FHD' | '4K' | 'SD';
}

interface ChannelBrowserProps {
  channels: Channel[];
  onChannelSelect: (channel: Channel) => void;
  selectedChannel: Channel | null;
}

export function ChannelBrowser({ channels, onChannelSelect, selectedChannel }: ChannelBrowserProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case '4K': return 'bg-purple-500/20 text-purple-400';
      case 'FHD': return 'bg-blue-500/20 text-blue-400';
      case 'HD': return 'bg-green-500/20 text-green-400';
      case 'SD': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  if (channels.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-slate-700 rounded-xl flex items-center justify-center mx-auto">
            <div className="w-8 h-8 bg-slate-600 rounded"></div>
          </div>
          <div>
            <p className="text-slate-400 text-sm">No channels available</p>
            <p className="text-slate-500 text-xs">Add a provider to get started</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* View Toggle */}
      <div className="px-4 pb-3 border-b border-slate-700">
        <div className="flex items-center space-x-1">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="text-xs"
          >
            List
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="text-xs"
          >
            Grid
          </Button>
        </div>
      </div>

      {/* Channel List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {viewMode === 'list' ? (
            <div className="space-y-1">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => onChannelSelect(channel)}
                  className={`
                    flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors
                    ${selectedChannel?.id === channel.id 
                      ? 'bg-purple-500/20 border border-purple-500/30' 
                      : 'hover:bg-slate-700/50'
                    }
                  `}
                >
                  <img
                    src={channel.logo || `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/5efb0964-fe34-4973-bc0d-70e512cd314c.png}`}
                    alt={channel.name}
                    className="w-10 h-10 rounded-lg object-cover bg-slate-700 flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/b5f31167-cdb6-4d3b-923e-b3e38998867b.png}`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white text-sm font-medium truncate">
                      {channel.name}
                    </h4>
                    <p className="text-slate-400 text-xs truncate">
                      {channel.category}
                    </p>
                  </div>
                  <Badge variant="secondary" className={`text-xs ${getQualityColor(channel.quality)}`}>
                    {channel.quality}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => onChannelSelect(channel)}
                  className={`
                    relative p-3 rounded-lg cursor-pointer transition-colors group
                    ${selectedChannel?.id === channel.id 
                      ? 'bg-purple-500/20 border border-purple-500/30' 
                      : 'hover:bg-slate-700/50'
                    }
                  `}
                >
                  <div className="aspect-square mb-2">
                    <img
                      src={channel.logo || `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/77cef18f-531c-4dfb-9250-c776ad2037e3.png}`}
                      alt={channel.name}
                      className="w-full h-full rounded-lg object-cover bg-slate-700"
                      onError={(e) => {
                        e.currentTarget.src = `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/3e5409a2-62c1-4509-94c6-c97f3ea68958.png}`;
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-white text-xs font-medium truncate">
                      {channel.name}
                    </h4>
                    <div className="flex items-center justify-between">
                      <p className="text-slate-400 text-xs truncate flex-1">
                        {channel.category}
                      </p>
                      <Badge variant="secondary" className={`text-xs ml-1 ${getQualityColor(channel.quality)}`}>
                        {channel.quality}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded triangle-right"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}