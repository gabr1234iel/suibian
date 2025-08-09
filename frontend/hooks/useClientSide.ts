import { useEffect, useState } from 'react';

/**
 * Hook that returns whether the component has mounted on the client side.
 * Useful for preventing hydration mismatches when using browser-only APIs.
 */
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}

/**
 * Hook that safely accesses window object and prevents hydration mismatches.
 * Returns undefined during SSR and initial hydration.
 */
export function useWindow() {
  const [windowObj, setWindowObj] = useState<Window | undefined>(undefined);

  useEffect(() => {
    setWindowObj(window);
  }, []);

  return windowObj;
}
