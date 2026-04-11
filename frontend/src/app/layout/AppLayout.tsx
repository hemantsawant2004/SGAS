import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { useAppSelector } from "../hooks";



export default function AppLayout() {

  const user = useAppSelector((s) => s.auth.user);

  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const initials =
    user?.fullName
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase() || "U";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!userMenuOpen) return;
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      {/* HEADER */}
      <Header
        userMenuOpen={userMenuOpen}
        setUserMenuOpen={setUserMenuOpen}
        initial={initials}
        username={user?.username || ""}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* MAIN AREA: sidebar + content */}
      <div className="flex flex-1">
        <Sidebar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          userRole={user?.role}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}

        />
        {/* Content area */}
        <main className="flex-1 overflow-x-hidden">
          <div className="flex h-full flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.99 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 rounded-3xl border border-slate-200/50 bg-white/70 shadow-premium backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/70"
              >
                <div className="h-full p-4 sm:p-6 lg:p-7">
                  <Outlet />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Footer */}
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}
