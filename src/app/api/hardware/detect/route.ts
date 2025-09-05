import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simulate hardware detection - in real implementation, this would use system calls
    const hardwareStatus = {
      gpu: {
        detected: true, // Would detect NVIDIA GPU via nvidia-ml-py or system commands
        model: 'NVIDIA GeForce RTX 3080',
        memory: 10 // GB
      },
      ffmpeg: {
        available: true, // Would check if FFmpeg binary exists
        hwaccel: true   // Would test NVENC/NVDEC capabilities
      },
      network: {
        speed: 45.2 + Math.random() * 10,
        latency: 10 + Math.random() * 5,
        quality: 'excellent' as const
      }
    };

    return NextResponse.json(hardwareStatus);
  } catch (error) {
    console.error('Hardware detection failed:', error);
    return NextResponse.json(
      { error: 'Hardware detection failed' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Re-run hardware detection
    return GET();
  } catch (error) {
    console.error('Hardware re-detection failed:', error);
    return NextResponse.json(
      { error: 'Hardware re-detection failed' },
      { status: 500 }
    );
  }
}