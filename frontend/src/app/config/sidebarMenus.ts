import {
  FiHome,
  FiFolderPlus,
  FiUser,
  FiUsers,
  FiClipboard,
  FiLayers,
  FiBookOpen,
  FiBarChart2,
  FiActivity,
  FiSearch,
  FiChevronRight,
} from "react-icons/fi";

export interface SidebarNavItem {
  label: string;
  to: string;
  icon: any;
  children?: SidebarNavItem[];
}

export const navItemAdmin: SidebarNavItem[] = [
  { label: "Dashboard", to: "/admin/dashboard", icon: FiHome },
  { label: "Projects", to: "/admin/projects", icon: FiClipboard },
  { label: "Guide Activity", to: "/admin/guide-activity", icon: FiActivity },
  { label: "Student Activity", to: "/admin/student-activity", icon: FiBarChart2 },
  { label: "Guides", to: "/admin-guides", icon: FiUser },
  { label: "Students", to: "/admin/students", icon: FiUsers },
  { label: "Track Project", to: "/projects/track", icon: FiSearch },
    {
    label: "Reports",
    to: "/admin/reports",
    icon: FiLayers,
    children: [
      { label: "Dashboard Summary", to: "/admin/reports/dashboard-summary", icon: FiChevronRight },
      { label: "Student Allocation", to: "/admin/reports/student-allocation", icon: FiChevronRight },
      { label: "Guide Workload", to: "/admin/reports/guide-workload", icon: FiChevronRight },
      { label: "Unassigned Students", to: "/admin/reports/unassigned-students", icon: FiChevronRight },
      { label: "Department-wise", to: "/admin/reports/department-wise", icon: FiChevronRight },
    ],
  },
  // { label: "Notifications", to: "/notifications", icon: FiBell },
];


export const navIteGuide: SidebarNavItem[] = [
  { label: "Dashboard", to: "/guide/dashboard", icon: FiHome },
  { label: "Allocated Projects", to: "/guide/allocatedprojects", icon: FiLayers },
  { label: "Track Project", to: "/projects/track", icon: FiSearch },
  // { label: "Notifications", to: "/notifications", icon: FiBell },
  // { label: "Profile", to: "/guide/createprofile", icon: FiUser },
];


export const navStudent: SidebarNavItem[] = [
  { label: "Dashboard", to: "/student/dashboard", icon: FiHome },
  { label: "Guides", to: "/student/guides", icon: FiBookOpen },
  { label: "Submit Project", to: "/student/projects/new", icon: FiFolderPlus },
  { label: "My Projects", to: "/student/projects", icon: FiClipboard },
  { label: "Track Project", to: "/projects/track", icon: FiSearch },
  // { label: "Notifications", to: "/notifications", icon: FiBell },
];
