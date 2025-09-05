import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StreamForge Pro - Advanced Local Streaming Client',
  description: 'Professional IPTV streaming client with hardware acceleration, featuring NVIDIA GPU support, FFmpeg integration, advanced audio enhancement, subtitle rendering, and comprehensive network management.',
  keywords: ['IPTV', 'streaming', 'hardware acceleration', 'NVIDIA', 'FFmpeg', 'WebGL', 'local client'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <style>{`
          .triangle-right {
            width: 0;
            height: 0;
            border-left: 8px solid currentColor;
            border-top: 4px solid transparent;
            border-bottom: 4px solid transparent;
            margin-left: 2px;
          }
        `}</style>
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}