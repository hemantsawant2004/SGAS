import { useEffect } from 'react';
import { useAppSelector } from '../hooks';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useAppSelector(s => s.theme.mode); // 'light' | 'dark'
  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', mode);
  }, [mode]);
  return <>{children}</>;
}
