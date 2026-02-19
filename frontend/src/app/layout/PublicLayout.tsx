// src/layout/PublicLayout.tsx
import { Outlet } from 'react-router-dom';
import ThemeToggle from '../../Components/ThemeToggle';


export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header
        className="h-12 flex items-center justify-end px-4
                   border-b border-gray-200 dark:border-gray-800
                   bg-white/80 dark:bg-gray-900/80 backdrop-blur"
      >
        <ThemeToggle />
      </header>
      <main >
        <Outlet />
      </main>
    </div>
  );
}
