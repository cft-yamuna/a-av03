import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Communicates directly with hardware via Web Serial API.
 * 
 * Configured for:
 * - Baud Rate: 115200
 * - Signals: "present", "clear"
 */
export function usePresenceSensor(opts: { enabled: boolean }): {
  isPresent: boolean;
  sensorConnected: boolean;
  connectHardware: () => Promise<void>;
  error: string | null;
} {
  const [isPresent, setIsPresent] = useState(false);
  const [sensorConnected, setSensorConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const portRef = useRef<any>(null);
  const readerRef = useRef<any>(null);
  const keepReading = useRef(true);

  const readLoop = useCallback(async (port: any) => {
    const decoder = new TextDecoder();
    let buffer = '';

    while (port.readable && keepReading.current) {
      readerRef.current = port.readable.getReader();
      try {
        while (true) {
          const { value, done } = await readerRef.current.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk.toLowerCase();

          // Check for specific keywords
          if (buffer.includes('present')) {
            setIsPresent(true);
            setSensorConnected(true);
            buffer = ''; 
          } else if (buffer.includes('clear')) {
            setIsPresent(false);
            setSensorConnected(true);
            buffer = '';
          }

          // Keep buffer small
          if (buffer.length > 100) {
            buffer = buffer.slice(-50);
          }
        }
      } catch (err) {
        console.error('Serial read error:', err);
        setSensorConnected(false);
        break;
      } finally {
        readerRef.current.releaseLock();
      }
    }
  }, []);

  const connectHardware = useCallback(async () => {
    if (!('serial' in navigator)) {
      setError('Web Serial API not supported. Use Chrome or Edge.');
      return;
    }

    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 }); 
      
      portRef.current = port;
      setSensorConnected(true);
      setError(null);
      
      keepReading.current = true;
      readLoop(port);
      
    } catch (err: any) {
      console.error('Failed to connect:', err);
      setError(err.message || 'Failed to connect to hardware.');
      setSensorConnected(false);
    }
  }, [readLoop]);

  useEffect(() => {
    return () => {
      keepReading.current = false;
      readerRef.current?.cancel();
      portRef.current?.close();
    };
  }, []);

  // Auto-reconnect to already paired devices
  useEffect(() => {
    if (!opts.enabled || !('serial' in navigator)) return;

    const checkExisting = async () => {
      const ports = await (navigator as any).serial.getPorts();
      if (ports.length > 0) {
        try {
          const port = ports[0];
          await port.open({ baudRate: 115200 });
          portRef.current = port;
          setSensorConnected(true);
          readLoop(port);
        } catch (e) {
          // Normal if browser requires a new gesture
        }
      }
    };
    checkExisting();
  }, [opts.enabled, readLoop]);

  return { isPresent, sensorConnected, connectHardware, error };
}
