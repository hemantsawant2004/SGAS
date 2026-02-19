import React, { useRef } from 'react';
import { logoutApi } from '../../features/auth/services/authService';
import { useAppDispatch, useAppSelector } from '../hooks';
import { useNavigate } from 'react-router-dom';
import { toggleMode } from '../../features/theme/themeSlice';
import { logout } from '../../features/auth/authSlice';

interface HeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userMenuOpen:boolean
  setUserMenuOpen:React.Dispatch<React.SetStateAction<boolean>>;
  initial:string
  username:string
   sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function Header({
    mobileMenuOpen,
    setMobileMenuOpen,
    userMenuOpen,
    setUserMenuOpen,
    initial,
    username,
    sidebarOpen,
    setSidebarOpen
}:HeaderProps) {
     const theme = useAppSelector((s) => s.theme.mode);
       const userMenuRef = useRef<HTMLDivElement | null>(null);
     const user = useAppSelector((s) => s.auth.user);

     const handleLogout = async() => {
        try{
          console.log("inside handle logout")
    await logoutApi()
    
        }
        catch(e){
          console.log("error to logout")
        }
        dispatch(logout());
        navigate("/", { replace: true });
      };
       const dispatch = useAppDispatch();
        const navigate = useNavigate();

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 md:px-6">
        {/* Left: brand + hamburger (mobile) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          <button
  type="button"
  onClick={() => setSidebarOpen(o => !o)}
  className="hidden md:inline-flex items-center justify-center rounded-md p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
>
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    {sidebarOpen ? (
      <path d="M15 19l-7-7 7-7" strokeWidth="2" />
    ) : (
      <path d="M9 5l7 7-7 7" strokeWidth="2" />
    )}
  </svg>
</button>

          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-sm font-semibold text-white shadow-sm">
              
            </div>
            <div className="leading-tight">
              <p className="text-base font-semibold tracking-tight">
                SGAS 
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
               {user?.departmentName}  {user?.role}
              </p>
            </div>
          </div>
        </div>

        {/* Right: theme toggle + user dropdown */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={() => dispatch(toggleMode())}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {theme === "dark" ? (
              // Sun
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="4" strokeWidth="1.8" />
                <path
                  d="M12 3v2.5M12 18.5V21M4.22 4.22 5.9 5.9M18.1 18.1 19.78 19.78M3 12h2.5M18.5 12H21M4.22 19.78 5.9 18.1M18.1 5.9 19.78 4.22"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              // Moon
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  d="M21 12.79A9 9 0 0 1 12.21 3 7 7 0 1 0 21 12.79Z"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>

          {/* User dropdown with click-outside */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-left shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-xs font-semibold text-white">
                {initial}
              </div>
              <div className="hidden max-w-[160px] text-[13px] leading-tight sm:block">
                {/* <p className="truncate font-medium">{user?.fullName ?? "Owner"}</p> */}
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {username}
                </p>
              </div>
              <svg
                className="h-4 w-4 text-slate-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M6 9l6 6 6-6" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-md border border-slate-200 bg-white text-sm shadow-lg dark:border-slate-700 dark:bg-slate-800">
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-700"
                >
                  My Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  )
}

export default Header