import { NextRequest, NextResponse } from 'next/server';

interface ProxyConfig {
  enabled: boolean;
  type: 'http' | 'https' | 'socks5';
  host: string;
  port: number;
  username?: string;
  password?: string;
}

// Simulated proxy storage (in production, use secure storage)
let currentProxyConfig: ProxyConfig = {
  enabled: false,
  type: 'http',
  host: '',
  port: 8080
};

export async function GET() {
  try {
    return NextResponse.json({
      config: currentProxyConfig,
      status: currentProxyConfig.enabled ? 'enabled' : 'disabled',
      test_result: currentProxyConfig.enabled ? await testProxyConnection(currentProxyConfig) : null
    });
  } catch (error) {
    console.error('Failed to get proxy config:', error);
    return NextResponse.json(
      { error: 'Failed to get proxy configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const newConfig: ProxyConfig = await request.json();
    
    // Validate proxy configuration
    if (newConfig.enabled) {
      if (!newConfig.host || !newConfig.port) {
        return NextResponse.json(
          { error: 'Host and port are required when proxy is enabled' },
          { status: 400 }
        );
      }

      // Test proxy connection
      const testResult = await testProxyConnection(newConfig);
      if (!testResult.success) {
        return NextResponse.json(
          { error: `Proxy test failed: ${testResult.error}` },
          { status: 400 }
        );
      }
    }

    // Save configuration
    currentProxyConfig = newConfig;

    return NextResponse.json({
      success: true,
      config: currentProxyConfig,
      message: 'Proxy configuration saved successfully'
    });

  } catch (error) {
    console.error('Failed to save proxy config:', error);
    return NextResponse.json(
      { error: 'Failed to save proxy configuration' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Disable and clear proxy configuration
    currentProxyConfig = {
      enabled: false,
      type: 'http',
      host: '',
      port: 8080
    };

    return NextResponse.json({
      success: true,
      message: 'Proxy configuration cleared'
    });

  } catch (error) {
    console.error('Failed to clear proxy config:', error);
    return NextResponse.json(
      { error: 'Failed to clear proxy configuration' },
      { status: 500 }
    );
  }
}

async function testProxyConnection(config: ProxyConfig): Promise<{ success: boolean; error?: string; latency?: number }> {
  try {
    // Simulate proxy connection test
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real implementation, this would:
    // 1. Attempt to connect through the proxy
    // 2. Make a test HTTP request through the proxy
    // 3. Measure connection latency
    // 4. Verify proxy authentication if credentials provided

    // Simulate some proxy tests that might fail
    if (config.host === 'invalid.proxy.com') {
      return { success: false, error: 'Connection refused' };
    }

    if (config.port < 1 || config.port > 65535) {
      return { success: false, error: 'Invalid port number' };
    }

    // Simulate successful connection
    const latency = 50 + Math.random() * 100; // 50-150ms
    
    return {
      success: true,
      latency
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown proxy error'
    };
  }
}

// Test endpoint for proxy connectivity
export async function PUT(request: NextRequest) {
  try {
    const { config }: { config: ProxyConfig } = await request.json();
    
    const testResult = await testProxyConnection(config);
    
    return NextResponse.json({
      test_result: testResult,
      tested_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Proxy test failed:', error);
    return NextResponse.json(
      { error: 'Proxy test failed' },
      { status: 500 }
    );
  }
}