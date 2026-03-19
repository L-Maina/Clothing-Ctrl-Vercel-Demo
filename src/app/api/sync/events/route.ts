import { NextRequest } from 'next/server';
import { syncEmitter, SyncEventData } from '@/lib/sync-events';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial connection message immediately
        const connectMessage = `data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`;
        controller.enqueue(encoder.encode(connectMessage));

        // Subscribe to sync events
        const unsubscribe = syncEmitter.subscribe((event: SyncEventData) => {
          try {
            const message = `data: ${JSON.stringify({
              ...event,
              timestamp: new Date().toISOString(),
            })}\n\n`;
            controller.enqueue(encoder.encode(message));
          } catch (error) {
            console.error('Error sending SSE event:', error);
          }
        });

        // Send keepalive every 15 seconds (more frequent for better connection stability)
        const keepaliveInterval = setInterval(() => {
          try {
            const keepaliveMessage = `data: ${JSON.stringify({ type: 'KEEPALIVE', timestamp: new Date().toISOString() })}\n\n`;
            controller.enqueue(encoder.encode(keepaliveMessage));
          } catch {
            clearInterval(keepaliveInterval);
            unsubscribe();
          }
        }, 15000);

        // Handle client disconnect
        const cleanup = () => {
          unsubscribe();
          clearInterval(keepaliveInterval);
        };

        // Listen for abort signal
        request.signal.addEventListener('abort', cleanup);
        
        // Also cleanup after 5 minutes to prevent memory leaks
        setTimeout(() => {
          cleanup();
          try {
            controller.close();
          } catch {}
        }, 5 * 60 * 1000);
      } catch (error) {
        console.error('SSE stream error:', error);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
