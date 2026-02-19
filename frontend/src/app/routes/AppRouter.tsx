import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import ProtectedRoute from './guards/ProtectedRoute';
import Login from '../../features/auth/pages/Login';
import Signup from '../../features/auth/pages/Signup';
import GuestRoute from './guards/GuestRoutes';
import PublicLayout from '../layout/PublicLayout';
import DashboardResolver from './resolvers/DashboardResolver';
import ProtectedRoutesAdmin from './guards/ProtectedRouteAdmin';
import AdminDashboard from '../../features/admin/AdminDashboard';
import GuideDashboard from '../../features/guide/GuideDashboard';
import StudentDashboard from '../../features/student/StudentDashboard';



const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [{
      // element: <PublicLayout />,
      children: [
        { path: '/', element: <Login /> },
        { path: '/signup', element: <Signup /> },
      ]
    }]

  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <DashboardResolver /> },
          {path:"/admin/dashboard", element:<AdminDashboard/>},
          {path:"/guide/dashboard", element:<GuideDashboard/>},
          {path:"/student/dashboard", element:<StudentDashboard/>}
        
        ],
      }
    ]
  
  },


  //admin
    {
    element: <ProtectedRoutesAdmin />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <DashboardResolver /> },
         //{ path: "/ho/admin/dashboard", element: <AdminDashboard /> },
        ],
      }
    ]
  
  }

]

);
export default function AppRouter() {
  return <RouterProvider router={router} />;
}
