import { useEffect, useRef, useState } from "react";
import { Outlet} from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { useAppSelector } from "../hooks";



export default function AppLayout() {
 
  const user = useAppSelector((s) => s.auth.user);
 
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
     mobileMenuOpen={mobileMenuOpen}
  setMobileMenuOpen={setMobileMenuOpen}
   userMenuOpen={userMenuOpen}
  setUserMenuOpen={setUserMenuOpen}
  initial={initials}
  username={user?.username ||""}
    sidebarOpen={sidebarOpen}
  setSidebarOpen={setSidebarOpen}
    />

      {/* MAIN AREA: sidebar + content */}
      <div className="flex flex-1">
        <Sidebar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          userDept={user?.departmentName}
          userSubDept={user?.subDepartmentName}
          userRole={user?.role}
          sidebarOpen={sidebarOpen}
  setSidebarOpen={setSidebarOpen}

        />
        {/* Content area */}
        <main className="flex-1">
          <div className="flex h-full flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
            {/* main card grows with screen width */}
            <div className="flex-1 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="p-4 sm:p-6 lg:p-7">
                <Outlet />
              </div>
            </div>

            {/* Footer */}
           <Footer/>
          </div>
        </main>
      </div>
    </div>
  );
}
