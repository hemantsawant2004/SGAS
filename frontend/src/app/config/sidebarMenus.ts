import {
  FiHome,
  FiUserPlus,
  FiFolderPlus,
  FiBarChart2,
  FiBox,
} from "react-icons/fi";

// export const navItemSuperadmin = [
//   { label: "Dashboard", to: "/ho/admin/dashboard", icon: FiHome },
//   { label: "Master", to: "/ho/admin/master", icon: FiFolderPlus },
//   { label: "Product Master", to: "/ho/purchase/productmasterdashboard", icon: FiBox },
//   {label:"Reports", to:"/reports", icon: FiBarChart2}
// ];
export const navItemAdmin = [
  { label: "Dashboard", to: "/admin/dashboard", icon: FiHome },
  // { label: "Master", to: "/ho/admin/master", icon: FiFolderPlus },
  // { label: "Product Master", to: "/ho/purchase/productmasterdashboard", icon: FiBox },
  {label:"Reports", to:"/reports", icon: FiBarChart2}
];

// export const navItemHoPurchaseMenus = [
//   { label: "Dashboard", to: "/ho/admin/dashboard", icon: FiHome },
//   { label: "Master", to: "/ho/admin/master", icon: FiFolderPlus },
//   { label: "Product_master", to: "/ho/purchase/productmasterdashboard", icon: FiBox },
//   { label: "Reports", to: "/app/reports", icon: FiBarChart2 },
// ];
export const navIteGuide = [
  { label: "Dashboard", to: "/guide/dashboard", icon: FiHome },
  { label: "Master", to: "", icon: FiFolderPlus },
  // { label: "Product_master", to: "/ho/purchase/productmasterdashboard", icon: FiBox },
  { label: "Reports", to: "", icon: FiBarChart2 },
];

export const navStudent = [
  { label: "Dashboard", to: "/student/dashboard", icon: FiHome },
  { label: "Add Project", to: "/guide/dashboard", icon: FiFolderPlus },
  // { label: "Product_master", to: "/ho/purchase/productmasterdashboard", icon: FiBox },
  // { label: "Reports", to: "/app/reports", icon: FiBarChart2 },
];