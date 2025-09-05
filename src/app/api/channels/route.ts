import { NextRequest, NextResponse } from 'next/server';

interface Channel {
  id: string;
  name: string;
  category: string;
  logo: string;
  stream_url: string;
  epg_id?: string;
  quality: 'HD' | 'FHD' | '4K' | 'SD';
}

// Demo channels data - in production, fetch from providers
const demoChannels: Channel[] = [
  {
    id: '1',
    name: 'BBC One HD',
    category: 'News',
    logo: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/dfc5981e-d32d-460e-9821-378c35b8dabc.png',
    stream_url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    quality: 'HD',
    epg_id: 'bbc-one-hd'
  },
  {
    id: '2',
    name: 'CNN International',
    category: 'News',
    logo: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/c3b582b3-7db9-4ab0-b6d4-f22e8c309fcb.png',
    stream_url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    quality: 'FHD',
    epg_id: 'cnn-international'
  },
  {
    id: '3',
    name: 'Discovery Channel 4K',
    category: 'Documentary',
    logo: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/4801b87d-7eb8-4f0e-ad62-d916c9e7ed07.png',
    stream_url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    quality: '4K',
    epg_id: 'discovery-4k'
  },
  {
    id: '4',
    name: 'ESPN HD',
    category: 'Sports',
    logo: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/59bf682c-616d-47bf-87bc-395d939a3f01.png',
    stream_url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    quality: 'HD',
    epg_id: 'espn-hd'
  },
  {
    id: '5',
    name: 'HBO Max',
    category: 'Entertainment',
    logo: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/2feee12e-f242-4d84-b9d0-2d4a0eb0176c.png',
    stream_url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    quality: 'FHD',
    epg_id: 'hbo-max'
  },
  {
    id: '6',
    name: 'National Geographic 4K',
    category: 'Documentary',
    logo: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/2da9f43a-f917-4d70-876c-2a35900d1e13.png',
    stream_url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    quality: '4K',
    epg_id: 'natgeo-4k'
  },
  {
    id: '7',
    name: 'Netflix Premium',
    category: 'Entertainment',
    logo: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/e22746a6-c616-479c-ac3f-0c3f560d8b9a.png',
    stream_url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    quality: '4K',
    epg_id: 'netflix-premium'
  },
  {
    id: '8',
    name: 'Fox Sports 1',
    category: 'Sports',
    logo: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/80029226-0e29-4757-ba01-c82905070a2e.png',
    stream_url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    quality: 'FHD',
    epg_id: 'fox-sports-1'
  },
  {
    id: '9',
    name: 'MTV HD',
    category: 'Music',
    logo: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/c65cf37f-2889-4bef-b5eb-6b8a5339a74c.png',
    stream_url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    quality: 'HD',
    epg_id: 'mtv-hd'
  },
  {
    id: '10',
    name: 'Comedy Central',
    category: 'Entertainment',
    logo: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/f3336048-2322-4021-a307-1d46251f5dbe.png',
    stream_url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    quality: 'HD',
    epg_id: 'comedy-central'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const quality = searchParams.get('quality');

    let filteredChannels = [...demoChannels];

    // Filter by category
    if (category && category !== 'all') {
      filteredChannels = filteredChannels.filter(
        channel => channel.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by search term
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredChannels = filteredChannels.filter(
        channel => 
          channel.name.toLowerCase().includes(searchTerm) ||
          channel.category.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by quality
    if (quality && quality !== 'all') {
      filteredChannels = filteredChannels.filter(
        channel => channel.quality.toLowerCase() === quality.toLowerCase()
      );
    }

    return NextResponse.json({
      channels: filteredChannels,
      total: filteredChannels.length,
      categories: [...new Set(demoChannels.map(ch => ch.category))],
      qualities: [...new Set(demoChannels.map(ch => ch.quality))]
    });

  } catch (error) {
    console.error('Failed to fetch channels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch channels' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider_id } = body;

    if (!provider_id) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    // In production, fetch channels from specific provider
    const channels = await fetchChannelsFromProvider(provider_id);

    return NextResponse.json({
      channels,
      provider_id,
      fetched_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Failed to refresh channels:', error);
    return NextResponse.json(
      { error: 'Failed to refresh channels' },
      { status: 500 }
    );
  }
}

async function fetchChannelsFromProvider(providerId: string): Promise<Channel[]> {
  // Simulate API call to provider
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return demo channels for now
  return demoChannels.map(channel => ({
    ...channel,
    id: `${providerId}_${channel.id}`,
    stream_url: channel.stream_url.replace('demo.unified-streaming.com', `provider-${providerId}.com`)
  }));
}