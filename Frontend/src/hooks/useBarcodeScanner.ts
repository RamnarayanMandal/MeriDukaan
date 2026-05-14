import { useEffect, useRef } from 'react';

/**
 * Hook to support USB Barcode Scanners (which act as keyboard input)
 * @param onScan Callback function when a barcode is successfully captured
 */
export const useBarcodeScanner = (onScan: (barcode: string) => void) => {
  const barcodeRef = useRef('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field (optional, but POS usually wants global listener)
      // If you want to restrict, you can check e.target
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // If it's an input, we might still want to capture if it's the specific barcode input
        // But for global POS, we usually listen everywhere unless specifically excluded
      }

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // Scanners typically end with 'Enter'
      if (e.key === 'Enter') {
        if (barcodeRef.current.length >= 3) {
          onScan(barcodeRef.current);
          barcodeRef.current = '';
        }
        return;
      }

      // Only capture single characters (avoid Shift, Ctrl, etc.)
      if (e.key.length === 1) {
        barcodeRef.current += e.key;
      }

      // USB scanners are very fast. If no character received for 100ms, it's likely manual typing or end of scan
      timeoutRef.current = setTimeout(() => {
        barcodeRef.current = '';
      }, 100);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [onScan]);
};
