import React from "react";
import { navItemAdmin } from "../config/sidebarMenus";
import { navIteGuide } from "../config/sidebarMenus";
import { navStudent } from "../config/sidebarMenus";
import { NavLink } from "react-router-dom";

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
  userDept,
  userRole,
  sidebarOpen,
  userSubDept,
}: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col 
               border-r 
               bg-[#3E6FB1]
               py-4 shadow-sm
               transition-all duration-300 overflow-hidden
              ${sidebarOpen ? "w-64" : "w-16"}`}
      >
        <nav className="px-4">
          {/* <p className="mb-3 px-1 text-[11px] font-semibold tracking-[0.16em] text-slate-500">
              MAIN MENU
            </p> */}

          { userRole == "admin" ? (
            <ul className="space-y-1.5">
              {navItemAdmin.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === "/app"}
                      className={({ isActive }) =>
                        [
                          "group flex items-center gap-3 rounded-md px-3 py-2",
                          "text-slate-300 hover:bg-gray-400 hover:text-white",
                          "border border-transparent transition-colors duration-200",
                          isActive ? "bg-blue-600 text-white" : "",
                        ].join(" ")
                      }
                    >
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-md 
                            bg-slate-800 text-slate-400
                            group-hover:bg-black group-hover:text-white"
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span
                        className={`font-medium whitespace-nowrap transition-all duration-300
  ${sidebarOpen ? "opacity-100 ml-0" : "opacity-0 ml-[-20px]"}`}
                      >
                        {item.label}
                      </span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          ) : (  
            ""
          )}

            { userRole == "guide" ? (
            <ul className="space-y-1.5">
              {navIteGuide.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === "/app"}
                      className={({ isActive }) =>
                        [
                          "group flex items-center gap-3 rounded-md px-3 py-2",
                          "text-slate-300 hover:bg-gray-400 hover:text-white",
                          "border border-transparent transition-colors duration-200",
                          isActive ? "bg-blue-600 text-white" : "",
                        ].join(" ")
                      }
                    >
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-md 
                            bg-slate-800 text-slate-400
                            group-hover:bg-black group-hover:text-white"
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span
                        className={`font-medium whitespace-nowrap transition-all duration-300
  ${sidebarOpen ? "opacity-100 ml-0" : "opacity-0 ml-[-20px]"}`}
                      >
                        {item.label}
                      </span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          ) : (  
            ""
          )}

            { userRole == "student" ? (
            <ul className="space-y-1.5">
              {navStudent.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === "/app"}
                      className={({ isActive }) =>
                        [
                          "group flex items-center gap-3 rounded-md px-3 py-2",
                          "text-slate-300 hover:bg-gray-400 hover:text-white",
                          "border border-transparent transition-colors duration-200",
                          isActive ? "bg-blue-600 text-white" : "",
                        ].join(" ")
                      }
                    >
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-md 
                            bg-slate-800 text-slate-400
                            group-hover:bg-black group-hover:text-white"
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span
                        className={`font-medium whitespace-nowrap transition-all duration-300
  ${sidebarOpen ? "opacity-100 ml-0" : "opacity-0 ml-[-20px]"}`}
                      >
                        {item.label}
                      </span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          ) : (  
            ""
          )}
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
