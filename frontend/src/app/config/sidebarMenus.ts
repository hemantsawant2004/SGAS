import {
  FiHome,
  FiUserPlus,
  FiFolderPlus,
  FiBarChart2,
  FiBox,
  FiUser,
  FiUsers,
  FiClipboard,
  FiTrendingUp,
  FiUpload,
  FiFileText,
} from "react-icons/fi";


export const navItemAdmin = [
  { label: "Dashboard", to: "/admin/dashboard", icon: FiHome },
  { label: "Guides", to: "/admin/guides", icon: FiUser },
  { label: "Students", to: "/admin/students", icon: FiUsers },
  {label:"Allocated Projects", to:"/admin/allocatedprojects", icon: FiClipboard},
  {label:"Reports", to:"/reports", icon: FiBarChart2}
];



export const navIteGuide = [
  { label: "Dashboard", to: "/guide/dashboard", icon: FiHome },
  { label: "Allocated Projects", to: "/guide/allocatedprojects", icon: FiClipboard },
  // { label: "Product_master", to: "/ho/purchase/productmasterdashboard", icon: FiBox },
  { label: "Track Progress", to: "/guide/trackprogress", icon: FiTrendingUp },
];


export const navStudent = [
  { label: "Dashboard", to: "/student/dashboard", icon: FiHome },
  { label: "Submit Project", to: "/student/submitproject", icon: FiFolderPlus },
  { label: "Submit Progress", to: "/student/submitprogress", icon: FiFileText },
  { label: "Track Project Progress", to: "/student/trackprojectprogress", icon: FiTrendingUp },
];
