'use client';

import { createContext, useContext, useState } from 'react';

interface MobileMenuCtx {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const MobileMenuContext = createContext<MobileMenuCtx>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export function useMobileMenu() {
  return useContext(MobileMenuContext);
}

export function MobileMenuProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <MobileMenuContext.Provider
      value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}
    >
      {children}
    </MobileMenuContext.Provider>
  );
}
