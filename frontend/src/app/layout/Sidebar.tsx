import React from "react";
import { navItemAdmin } from "../config/sidebarMenus";
import { navIteGuide } from "../config/sidebarMenus";
import { navStudent } from "../config/sidebarMenus";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { toggleMode } from "../../features/theme/themeSlice";
import { useNotifications } from "../../features/notifications/hooks/useNotifications";

interface SidebarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userDept?: string;
  userSubDept?: string;
  userRole?: string;
  sidebarOpen?: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
function Sidebar({
  mobileMenuOpen,
  setMobileMenuOpen,
  userRole,
  sidebarOpen,
}: SidebarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useAppSelector((s) => s.theme.mode);
  const { data: notificationsData } = useNotifications();
  const navItems =
    userRole === "admin"
      ? navItemAdmin
      : userRole === "guide"
        ? navIteGuide
        : userRole === "student"
          ? navStudent
          : [];

  return (
    <>
      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-6 shadow-2xl">
            <div className="flex items-center justify-between px-4 pb-4">
              <div>
                {/* <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Navigation
                </p> */}
                <p className="mt-1 text-sm text-slate-200 capitalize">{userRole || "User"}</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-700/60 hover:text-white"
                aria-label="Close navigation menu"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M6 6l12 12M18 6 6 18" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 space-y-2 px-3">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/app"}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-center gap-4 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-gray-400 text-white shadow-lg shadow-indigo-500/20"
                          : "text-slate-300 hover:bg-slate-700/60 hover:text-white"
                      }`
                    }
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-700/50 transition-all group-hover:bg-indigo-500/20">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="border-t border-slate-700/70 px-3 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    navigate("/notifications");
                    setMobileMenuOpen(false);
                  }}
                  className="relative flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-3 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path d="M10 17a2 2 0 0 0 4 0" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  <span>Alerts</span>
                  {notificationsData?.unreadCount ? (
                    <span className="absolute right-2 top-2 min-w-[18px] rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {notificationsData.unreadCount > 99 ? "99+" : notificationsData.unreadCount}
                    </span>
                  ) : null}
                </button>

                <button
                  type="button"
                  onClick={() => dispatch(toggleMode())}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-3 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
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
                  <span>{theme === "dark" ? "Light" : "Dark"}</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      {/* Desktop sidebar */}
      <aside
        className={`
    hidden md:flex flex-col
    bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
    border-r border-slate-700/50
    py-6
    transition-all duration-300 ease-in-out
    ${sidebarOpen ? "w-64" : "w-20"}
  `}
      >
        <nav className="flex-1 px-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/app"}
                className={({ isActive }) =>
                  `
            group relative flex items-center gap-4
            rounded-xl px-3 py-2.5
            text-sm font-medium
            transition-all duration-200
            ${isActive
                    ? "bg-gray-400 text-white shadow-lg shadow-indigo-500/20"
                    : "text-slate-300 hover:bg-slate-700/60 hover:text-white"
                  }
            `
                }
              >
                {/* Icon */}
                <div
                  className={`
              flex h-9 w-9 items-center justify-center
              rounded-lg transition-all
              ${sidebarOpen
                      ? "bg-slate-700/50"
                      : "bg-transparent"
                    }
              group-hover:bg-indigo-500/20
            `}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Label */}
                <span
                  className={`
              whitespace-nowrap transition-all duration-300
              ${sidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"}
            `}
                >
                  {item.label}
                </span>

                {/* Active Indicator Line */}
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-indigo-500 opacity-0 group-[.active]:opacity-100" />
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* {userDept === "HO" && userSubDept === "Purchase" && (
        <ul className="space-y-1.5">
          {navItemHoPurchaseMenus.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "group flex items-center gap-3 rounded-md px-3 py-2",
                      "text-slate-300 hover:bg-slate-800 hover:text-white",
                      isActive ? "bg-black text-white" : "",
                    ].join(" ")
                  }
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-800 text-slate-400 group-hover:bg-black group-hover:text-white">
                    <Icon className="h-4 w-4" />
                  </span>

                  <span
                    className={`font-medium transition-all duration-300 ${
                      sidebarOpen ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {item.label}
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      )} */}
    </>
  );
}

export default Sidebar;
