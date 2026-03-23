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
} from "react-icons/fi";


export const navItemAdmin = [
  { label: "Dashboard", to: "/admin/dashboard", icon: FiHome },
  { label: "Projects", to: "/admin/projects", icon: FiClipboard },
  { label: "Guide Activity", to: "/admin/guide-activity", icon: FiActivity },
  { label: "Student Activity", to: "/admin/student-activity", icon: FiBarChart2 },
  { label: "Guides", to: "/admin-guides", icon: FiUser },
  { label: "Students", to: "/admin/students", icon: FiUsers },
  // { label: "Notifications", to: "/notifications", icon: FiBell },
];


export const navIteGuide = [
  { label: "Dashboard", to: "/guide/dashboard", icon: FiHome },
  { label: "Allocated Projects", to: "/guide/allocatedprojects", icon: FiLayers },
  // { label: "Notifications", to: "/notifications", icon: FiBell },
  // { label: "Profile", to: "/guide/createprofile", icon: FiUser },
];


export const navStudent = [
  { label: "Dashboard", to: "/student/dashboard", icon: FiHome },
  { label: "Guides", to: "/student/guides", icon: FiBookOpen },
  { label: "Submit Project", to: "/student/projects/new", icon: FiFolderPlus },
  { label: "My Projects", to: "/student/projects", icon: FiClipboard },
  // { label: "Notifications", to: "/notifications", icon: FiBell },
];
