import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import ProtectedRoute from './guards/ProtectedRoute';
import Login from '../../features/auth/pages/Login';
import Signup from '../../features/auth/pages/Signup';
import GuestRoute from './guards/GuestRoutes';
import DashboardResolver from './resolvers/DashboardResolver';
import ProtectedRoutesAdmin from './guards/ProtectedRouteAdmin';
import AdminDashboard from '../../features/admin/AdminDashboard';
import GuideDashboard from '../../features/guide/GuideDashboard';
import StudentDashboard from '../../features/student/StudentDashboard';
import NotFound from '../../features/NotFound';
import ForgotPassword from '../../features/auth/pages/ForgotPassword';
import Guide from '../../features/guide/pages/Guide';
import GuidesPage from '../../features/admin/guides/pages/GuidesPages';
import StudentsPage from '../../features/admin/students/pages/StudentsPage';
import AdminProjectActivityPage from '../../features/admin/pages/AdminProjectActivityPage';
import AdminGuideActivityPage from '../../features/admin/pages/AdminGuideActivityPage';
import AdminStudentActivityPage from '../../features/admin/pages/AdminStudentActivityPage';
import StudentGuidesPage from '../../features/student/pages/StudentGuidesPage';
import StudentProjectSubmissionCelebrationPage from '../../features/student/StudentProjectSubmissionCelebrationPage';
import StudentProjectsPage from '../../features/student/pages/StudentProjectsPage';
import GuideAllocatedProjectsPage from '../../features/guide/pages/GuideAllocatedProjectsPage';



const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [{
      // element: <PublicLayout />,
      children: [
        { path: '/', element: <Login /> },
        { path: '/signup', element: <Signup /> },
        { path: '/forgot-password', element: <ForgotPassword /> },
        { path: "*", element: <NotFound/> }
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
          {path:"/student/dashboard", element:<StudentDashboard/>},
          {path:"/guide/createprofile", element:<Guide/>},
          { path: "/guide/allocatedprojects", element: <GuideAllocatedProjectsPage /> },
          { path: "/student/guides", element: <StudentGuidesPage /> },
          { path: "/student/projects/new", element: <StudentProjectSubmissionCelebrationPage /> },
          { path: "/student/projects", element: <StudentProjectsPage /> },
          { path: "*", element: <NotFound /> },
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
          { path: "/admin/projects", element: <AdminProjectActivityPage /> },
          { path: "/admin/guide-activity", element: <AdminGuideActivityPage /> },
          { path: "/admin/student-activity", element: <AdminStudentActivityPage /> },
          { path: "/admin-guides", element: <GuidesPage /> },
          { path: "/admin/students", element: <StudentsPage /> },
        ],
      }
    ]
  
  }

]

);
export default function AppRouter() {
  return <RouterProvider router={router} />;
}
