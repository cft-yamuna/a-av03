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

          // Log the received chunks for debugging
          console.log('Received chunk:', chunk, 'Current buffer:', buffer);

          // Check for specific keywords
          if (buffer.includes('present')) {
            console.log('Triggering: present');
            setIsPresent(true);
            setSensorConnected(true);
            buffer = ''; 
          } else if (buffer.includes('clear')) {
            console.log('Triggering: clear');
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
        console.error('Serial read error (Device may have disconnected):', err);
        setSensorConnected(false);
        break;
      } finally {
        if (readerRef.current) {
          readerRef.current.releaseLock();
        }
      }
    }
    console.log('Exiting read loop for port.');
  }, []);

  const connectHardware = useCallback(async () => {
    if (!('serial' in navigator)) {
      setError('Web Serial API not supported. Use Chrome or Edge.');
      return;
    }

    try {
      console.log('Requesting COM port...');
      const port = await (navigator as any).serial.requestPort();
      console.log('Port selected. Attempting to open at 115200 baud...');
      await port.open({ baudRate: 115200 }); 
      
      try {
        await port.setSignals({ dataTerminalReady: true, requestToSend: true });
        console.log('Signals DTR/RTS enabled (allows hardware to start sending)');
      } catch (warn) {
        console.warn('Could not set DTR/RTS (not all boards support this):', warn);
      }
      
      portRef.current = port;
      setSensorConnected(true);
      setError(null);
      console.log('Hardware connection successful! Listening for data...');
      
      keepReading.current = true;
      readLoop(port);
      
    } catch (err: any) {
      console.error('Failed to connect to COM port:', err);
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
        console.log(`Found ${ports.length} previously paired ports. Trying auto-connect...`);
        try {
          const port = ports[0];
          await port.open({ baudRate: 115200 });
          
          try {
            await port.setSignals({ dataTerminalReady: true, requestToSend: true });
          } catch (warn) {
            console.warn('Auto-connect: Could not set DTR/RTS:', warn);
          }

          portRef.current = port;
          setSensorConnected(true);
          console.log('Auto-connected to hardware! Listening for data...');
          keepReading.current = true;
          readLoop(port);
        } catch (e) {
          console.log('Auto-connect failed. Needs new user interaction/gesture.', e);
          // Normal if browser requires a new gesture
        }
      }
    };
    checkExisting();
  }, [opts.enabled, readLoop]);

  return { isPresent, sensorConnected, connectHardware, error };
}
