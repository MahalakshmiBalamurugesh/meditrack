import React, { createContext, useState, useEffect } from 'react';

interface ClockContextValue {
  now: Date;
}

export const ClockContext = createContext<ClockContextValue | undefined>(undefined);

interface ClockProviderProps {
  children: React.ReactNode;
}

export function ClockProvider({ children }: ClockProviderProps) {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <ClockContext.Provider value={{ now }}>
      {children}
    </ClockContext.Provider>
  );
}