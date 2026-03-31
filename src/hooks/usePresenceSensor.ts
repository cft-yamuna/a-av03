import { useEffect, useRef, useState } from 'react';

/**
 * Listens for human presence events from the local hardware agent.
 * The agent broadcasts via ws://127.0.0.1:3402.
 */
export function usePresenceSensor(opts: { enabled: boolean }): {
  isPresent: boolean;
  sensorConnected: boolean;
} {
  const [isPresent, setIsPresent] = useState(false);
  const [sensorConnected, setSensorConnected] = useState(false);
  const hasReceivedEvent = useRef(false);

  useEffect(() => {
    if (!opts.enabled) return;

    let ws: WebSocket | null = null;
    let closed = false;

    function connect() {
      try {
        ws = new WebSocket('ws://127.0.0.1:3402');
        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data) as {
              type?: string;
              payload?: { type?: string; state?: string };
            };
            if (msg.type !== 'hardware:event' || !msg.payload) return;

            const eventType = msg.payload.type;

            if (eventType === 'sensor:present') {
              hasReceivedEvent.current = true;
              setSensorConnected(true);
              setIsPresent(true);
            } else if (eventType === 'sensor:clear') {
              hasReceivedEvent.current = true;
              setSensorConnected(true);
              setIsPresent(false);
            } else if (eventType === 'sensor:ready') {
              hasReceivedEvent.current = true;
              setSensorConnected(true);
            } else if (eventType === 'sensor:disconnected') {
              setSensorConnected(false);
            }
          } catch {
            // Ignore parse errors.
          }
        };
        ws.onclose = () => {
          if (!closed) setTimeout(connect, 2000);
        };
        ws.onerror = () => {
          // Agent may not be running yet; retry continues on close.
        };
      } catch {
        // Ignore initial connection errors.
      }
    }

    connect();
    return () => {
      closed = true;
      ws?.close();
    };
  }, [opts.enabled]);

  return { isPresent, sensorConnected };
}
