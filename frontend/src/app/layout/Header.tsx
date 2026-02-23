import React, { useRef } from 'react';
import { logoutApi } from '../../features/auth/services/authService';
import { useAppDispatch, useAppSelector } from '../hooks';
import { useNavigate } from 'react-router-dom';
import { toggleMode } from '../../features/theme/themeSlice';
import { logout } from '../../features/auth/authSlice';

interface HeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userMenuOpen: boolean
  setUserMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  initial: string
  username: string
  sidebarOpen: boolean;
  userRole: string;
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
  userRole,
  setSidebarOpen
}: HeaderProps) {
  const theme = useAppSelector((s) => s.theme.mode);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const user = useAppSelector((s) => s.auth.user);

  const handleLogout = async () => {
    try {
      console.log("inside handle logout")
      await logoutApi()

    }
    catch (e) {
      console.log("error to logout")
    }
    dispatch(logout());
    navigate("/", { replace: true });
  };
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return (
    <>
<header className="sticky top-0 z-40 flex h-16 items-center justify-between 
border-b border-slate-200/60 
bg-white/70 backdrop-blur-xl 
px-6 shadow-sm 
dark:border-slate-800/60 
dark:bg-slate-900/70">

  {/* LEFT SECTION */}
  <div className="flex items-center gap-4">

    {/* Sidebar Toggle */}
    <button
      type="button"
      onClick={() => setSidebarOpen(o => !o)}
      className="hidden md:flex items-center justify-center rounded-lg p-2 
      hover:bg-slate-100 dark:hover:bg-slate-800 transition"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        {sidebarOpen ? (
          <path d="M15 19l-7-7 7-7" strokeWidth="2" />
        ) : (
          <path d="M9 5l7 7-7 7" strokeWidth="2" />
        )}
      </svg>
    </button>

    {/* Logo + Title */}
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center 
      rounded-2xl  
      shadow-lg shadow-indigo-500/20 overflow-hidden">

        <img
          src="/logo.jpg"
          alt="Logo"
          className="h-29 w-29 object-contain hover:scale-110"
        />
      </div>

      <div className="leading-tight">
        <p className="text-lg font-semibold tracking-tight text-slate-800 dark:text-white">
          Guide Allocation Portal
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Logged in as <span className="font-medium capitalize">{user?.role}</span>
        </p>
      </div>
    </div>
  </div>

  {/* RIGHT SECTION */}
  <div className="flex items-center gap-4">

    {/* Theme Toggle */}
    <button
      type="button"
      onClick={() => dispatch(toggleMode())}
      className="flex h-9 w-9 items-center justify-center 
      rounded-xl border border-slate-200 
      bg-white shadow-sm transition 
      hover:scale-105 hover:shadow-md
      dark:border-slate-700 dark:bg-slate-800"
    >
      {theme === "dark" ? (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="4" strokeWidth="1.8" />
        </svg>
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            d="M21 12.79A9 9 0 0 1 12.21 3 7 7 0 1 0 21 12.79Z"
            strokeWidth="1.8"
          />
        </svg>
      )}
    </button>

    {/* User Dropdown */}
    <div className="relative" ref={userMenuRef}>
      <button
        onClick={() => setUserMenuOpen(o => !o)}
        className="flex items-center gap-3 rounded-xl 
        border border-slate-200 bg-white px-3 py-1.5 
        shadow-sm transition hover:shadow-md 
        dark:border-slate-700 dark:bg-slate-800"
      >

        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center 
        rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 
        text-sm font-semibold text-white shadow-md">
          {initial}
        </div>

        {/* Name */}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {username}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
            {user?.role}
          </p>
        </div>

        <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M6 9l6 6 6-6" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {userMenuOpen && (
        <div className="absolute right-0 mt-3 w-52 
        rounded-xl border border-slate-200 
        bg-white p-2 shadow-xl 
        dark:border-slate-700 dark:bg-slate-800 animate-fadeIn">

          {user?.role === "guide" && (
            <button
              onClick={() => navigate('/guide/createprofile')}
              className="w-full rounded-lg px-3 py-2 text-left text-sm 
              hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              Profile
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full rounded-lg px-3 py-2 text-left text-sm 
            text-red-600 hover:bg-red-50 
            dark:text-red-400 dark:hover:bg-red-900/40 transition"
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